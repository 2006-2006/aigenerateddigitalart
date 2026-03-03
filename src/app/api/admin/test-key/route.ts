import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

async function verifyAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: p } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const profile = p as { role: string } | null;
    if (!profile || !['admin', 'super_admin'].includes(profile.role)) return null;
    return user;
}

// POST /api/admin/test-key
export async function POST(req: NextRequest) {
    const user = await verifyAdmin();
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { provider, key } = await req.json();
    if (!provider || !key) {
        return NextResponse.json({ error: 'provider and key required' }, { status: 400 });
    }

    try {
        if (provider === 'openrouter') {
            const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
                headers: { Authorization: `Bearer ${key}` },
            });
            if (!res.ok) {
                const e = await res.json().catch(() => ({}));
                return NextResponse.json({ ok: false, error: e?.error?.message || `HTTP ${res.status}` });
            }
            const data = await res.json();
            const label = data?.data?.label || 'Valid key';
            const limit = data?.data?.limit_remaining !== undefined
                ? ` · ${data.data.limit_remaining.toFixed(4)} credits remaining`
                : '';
            return NextResponse.json({ ok: true, message: `✓ ${label}${limit}` });
        }

        if (provider === 'gemini') {
            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,
            );
            if (!res.ok) {
                const e = await res.json().catch(() => ({}));
                return NextResponse.json({ ok: false, error: e?.error?.message || `HTTP ${res.status}` });
            }
            const data = await res.json();
            const count = data?.models?.length ?? 0;
            return NextResponse.json({ ok: true, message: `✓ Valid — ${count} models available` });
        }

        if (provider === 'groq') {
            const res = await fetch('https://api.groq.com/openai/v1/models', {
                headers: { Authorization: `Bearer ${key}` },
            });
            if (!res.ok) {
                const e = await res.json().catch(() => ({}));
                return NextResponse.json({ ok: false, error: e?.error?.message || `HTTP ${res.status}` });
            }
            const data = await res.json();
            const count = data?.data?.length ?? 0;
            return NextResponse.json({ ok: true, message: `✓ Valid — ${count} models available` });
        }

        return NextResponse.json({ error: 'Unknown provider' }, { status: 400 });
    } catch (e: unknown) {
        return NextResponse.json({
            ok: false,
            error: e instanceof Error ? e.message : 'Network error',
        });
    }
}
