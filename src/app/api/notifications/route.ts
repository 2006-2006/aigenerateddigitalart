import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Fetch user profile for credits
        const { data: profile } = await supabase
            .from('profiles')
            .select('credits, plan, full_name')
            .eq('id', user.id)
            .single();

        // Fetch recent generated images (last 20) as activity
        const { data: recentImages } = await supabase
            .from('generated_images')
            .select('id, prompt, model, resolution, created_at, image_url')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);

        const notifications: {
            id: string;
            type: 'image_generated' | 'low_credits' | 'welcome';
            title: string;
            message: string;
            time: string;
            imageUrl?: string;
            read: boolean;
        }[] = [];

        // Add image-generated notifications
        (recentImages || []).forEach((imgAny) => {
            const img = imgAny as { id: string, prompt: string, model: string, resolution: string, created_at: string, image_url: string };
            const model = img.model.split('/').pop()?.split(':')[0] ?? img.model;
            const shortPrompt = img.prompt.length > 50
                ? img.prompt.slice(0, 47) + '...'
                : img.prompt;
            notifications.push({
                id: `img-${img.id}`,
                type: 'image_generated',
                title: 'Image Generated',
                message: `"${shortPrompt}" — ${model} (${img.resolution})`,
                time: img.created_at,
                imageUrl: img.image_url,
                read: false,
            });
        });

        // Add low credits warning if applicable
        const credits = (profile as { credits?: number } | null)?.credits ?? 0;
        if (credits <= 3 && credits > 0) {
            notifications.unshift({
                id: 'low-credits',
                type: 'low_credits',
                title: '⚡ Low Credits',
                message: `You only have ${credits} credit${credits === 1 ? '' : 's'} remaining. Top up to continue generating.`,
                time: new Date().toISOString(),
                read: false,
            });
        }
        if (credits === 0) {
            notifications.unshift({
                id: 'zero-credits',
                type: 'low_credits',
                title: '⚡ No Credits Left',
                message: 'You have 0 credits. Please contact an admin to top up your balance.',
                time: new Date().toISOString(),
                read: false,
            });
        }

        return NextResponse.json({
            notifications,
            unreadCount: notifications.length,
            credits,
            plan: (profile as { plan?: string } | null)?.plan ?? 'free',
        });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Server error';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
