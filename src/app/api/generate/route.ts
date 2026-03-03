import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

type ProfileRow = { credits: number; plan: string };

// ─── Key resolver: DB first, then env fallback ────────────────────────────────
let _keyCache: Record<string, { value: string; ts: number }> = {};
const KEY_TTL = 5 * 60 * 1000; // 5 minute cache

async function getApiKey(settingKey: string, envFallback: string): Promise<string> {
    const cached = _keyCache[settingKey];
    if (cached && Date.now() - cached.ts < KEY_TTL) return cached.value;

    try {
        const admin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        const { data } = await admin
            .from('platform_settings')
            .select('value')
            .eq('key', settingKey)
            .single();
        if (data?.value) {
            _keyCache[settingKey] = { value: data.value, ts: Date.now() };
            return data.value;
        }
    } catch { /* fallback to env */ }

    const envVal = process.env[envFallback] || '';
    _keyCache[settingKey] = { value: envVal, ts: Date.now() };
    return envVal;
}

// ─── Type declarations ────────────────────────────────────────────────────────
interface GenerateRequest {
    prompt: string;
    negativePrompt?: string;
    provider: 'gemini' | 'openrouter' | 'groq';
    model: string;
    resolution: string;
}

// ─── Provider Handlers ────────────────────────────────────────────────────────

async function generateWithOpenRouter(prompt: string, model: string, resolution: string): Promise<string> {
    const apiKey = await getApiKey('api_key_openrouter', 'OPENROUTER_API_KEY');
    if (!apiKey) throw new Error('OpenRouter API key not configured. Set it in Admin → API Keys.');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
            'X-Title': 'Spirit AI',
        },
        body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            modalities: ['image'],
        }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `OpenRouter error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[OpenRouter response]', JSON.stringify(data).slice(0, 500));

    // Image is returned in choices[0].message.images[0].image_url.url
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (imageUrl) return imageUrl;

    // Fallback: some models may return it inside content parts
    const parts = data.choices?.[0]?.message?.content;
    if (Array.isArray(parts)) {
        for (const part of parts) {
            if (part.type === 'image_url') return part.image_url?.url;
        }
    }

    throw new Error('No image returned from OpenRouter. Check your API key and model availability.');
}


async function generateWithGemini(prompt: string, model: string, _resolution: string): Promise<string> {
    const apiKey = await getApiKey('api_key_gemini', 'GEMINI_API_KEY');
    if (!apiKey) throw new Error('Gemini API key not configured. Set it in Admin → API Keys.');

    const geminiModel = model || 'gemini-2.0-flash-preview-image-generation';

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    responseModalities: ['IMAGE', 'TEXT'],
                    temperature: 1,
                    topP: 0.95,
                    topK: 40,
                },
            }),
        }
    );

    if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody?.error?.message || `Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Gemini response]', JSON.stringify(data).slice(0, 500));

    const parts = data.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
        if (part.inlineData?.mimeType?.startsWith('image/')) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }

    throw new Error('No image returned from Gemini. Ensure your API key has image generation access.');
}

async function generateWithGroq(prompt: string, model: string, resolution: string): Promise<string> {
    const groqKey = await getApiKey('api_key_groq', 'GROQ_API_KEY');
    // Groq enhances the prompt via Llama, then generates image via OpenRouter Gemini
    const groqModel = 'llama-3.1-8b-instant'; // reliable fast model always available on Groq

    let enhancedPrompt = prompt;
    if (groqKey) {
        try {
            const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${groqKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: groqModel,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert at writing concise, vivid image generation prompts. Given a basic prompt, return an enhanced version in 1-2 sentences. Only respond with the enhanced prompt, nothing else.',
                        },
                        {
                            role: 'user',
                            content: `Enhance this image prompt for best visual results: ${prompt}`,
                        },
                    ],
                    max_tokens: 200,
                    temperature: 0.7,
                }),
            });
            if (groqRes.ok) {
                const groqData = await groqRes.json();
                const content = groqData.choices?.[0]?.message?.content?.trim();
                if (content) enhancedPrompt = content;
                console.log('[Groq enhanced prompt]:', enhancedPrompt);
            }
        } catch (e) {
            console.warn('[Groq] Prompt enhancement failed, using original:', e);
        }
    }

    // Generate via OpenRouter using Gemini image model
    return generateWithOpenRouter(enhancedPrompt, 'google/gemini-2.5-flash-image', resolution);
}

// ─── Storage Helper ───────────────────────────────────────────────────────────

async function uploadToSupabase(
    imageData: string,
    userId: string,
    adminClient: any // supabase admin client
): Promise<{ publicUrl: string; storagePath: string }> {
    let buffer: Buffer;
    let contentType = 'image/png';

    if (imageData.startsWith('data:')) {
        // Base64 encoded image
        const matches = imageData.match(/^data:(.+);base64,(.+)$/);
        if (!matches) throw new Error('Invalid base64 image data');
        contentType = matches[1];
        buffer = Buffer.from(matches[2], 'base64');
    } else {
        // Remote URL — fetch and convert
        const imgResponse = await fetch(imageData);
        if (!imgResponse.ok) throw new Error('Failed to fetch generated image');
        const arrayBuffer = await imgResponse.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
        contentType = imgResponse.headers.get('content-type') || 'image/png';
    }

    const ext = contentType.split('/')[1] || 'png';
    const storagePath = `${userId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await adminClient.storage
        .from('generated-images')
        .upload(storagePath, buffer, { contentType, upsert: false });

    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

    const { data: { publicUrl } } = adminClient.storage
        .from('generated-images')
        .getPublicUrl(storagePath);

    return { publicUrl, storagePath };
}

// ─── Main Route Handler ───────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
    try {
        // Authenticate user
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch profile & check credits
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('credits, plan')
            .eq('id', user.id)
            .single();

        if (profileError || !profileData) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        const profile = profileData as unknown as ProfileRow;

        if (profile.credits <= 0) {
            return NextResponse.json(
                { error: 'Insufficient credits. Please upgrade your plan.' },
                { status: 402 }
            );
        }

        // Deduct 1 credit immediately before generation
        const adminClient = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const newCredits = profile.credits - 1;
        const { error: creditError } = await adminClient
            .from('profiles')
            .update({ credits: newCredits, updated_at: new Date().toISOString() })
            .eq('id', user.id);

        if (creditError) {
            console.error('Credit deduction error:', creditError);
            return NextResponse.json({ error: 'Failed to process credits' }, { status: 500 });
        }

        // Parse request body
        const body: GenerateRequest = await request.json();
        const { prompt, negativePrompt = '', provider, model, resolution = '1024x1024' } = body;

        if (!prompt?.trim()) {
            // Refund
            await adminClient.from('profiles').update({ credits: profile.credits }).eq('id', user.id);
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        // Generate image based on provider
        let imageData: string;

        try {
            switch (provider) {
                case 'openrouter':
                    imageData = await generateWithOpenRouter(
                        negativePrompt ? `${prompt}. Avoid: ${negativePrompt}` : prompt,
                        model,
                        resolution
                    );
                    break;
                case 'gemini':
                    imageData = await generateWithGemini(
                        negativePrompt ? `${prompt}. Avoid: ${negativePrompt}` : prompt,
                        model,
                        resolution
                    );
                    break;
                case 'groq':
                    imageData = await generateWithGroq(
                        negativePrompt ? `${prompt}. Avoid: ${negativePrompt}` : prompt,
                        model,
                        resolution
                    );
                    break;
                default:
                    throw new Error('Invalid provider');
            }

            // Upload to Supabase Storage
            const { publicUrl, storagePath } = await uploadToSupabase(imageData, user.id, adminClient);

            // Store metadata
            const { error: insertError } = await adminClient.from('generated_images').insert({
                user_id: user.id,
                prompt,
                negative_prompt: negativePrompt || null,
                model,
                provider,
                resolution,
                image_url: publicUrl,
                storage_path: storagePath,
                credits_used: 1,
                is_public: false,
            });

            if (insertError) {
                console.error('Metadata insert error:', insertError);
            }

            return NextResponse.json({
                imageUrl: publicUrl,
                creditsRemaining: newCredits,
            });
        } catch (innerError: unknown) {
            // Refund
            await adminClient.from('profiles').update({ credits: profile.credits }).eq('id', user.id);
            throw innerError;
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        console.error('[Generate API Error]:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
