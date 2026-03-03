import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

async function verifyAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: p } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const profile = p as { role?: string } | null;
    if (!profile || !['admin', 'super_admin'].includes(profile.role || '')) return null;
    return user;
}

function adminDb() {
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

// GET /api/admin/settings
export async function GET() {
    try {
        const user = await verifyAdmin();
        if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { data, error } = await adminDb()
            .from('platform_settings')
            .select('*')
            .order('key');
        if (error) throw error;

        return NextResponse.json({ settings: data });
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Server error' }, { status: 500 });
    }
}

// PATCH /api/admin/settings  — update or insert (upsert)
export async function PATCH(request: Request) {
    try {
        const user = await verifyAdmin();
        if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { key, value, description } = await request.json();
        if (!key || value === undefined) {
            return NextResponse.json({ error: 'key and value required' }, { status: 400 });
        }

        const db = adminDb();

        // Try update first
        const { data: existing } = await db
            .from('platform_settings')
            .select('key')
            .eq('key', key)
            .single();

        if (existing) {
            const { error } = await db
                .from('platform_settings')
                .update({ value: String(value), updated_at: new Date().toISOString(), updated_by: user.id })
                .eq('key', key);
            if (error) throw error;
        } else {
            // Insert new row
            const { error } = await db
                .from('platform_settings')
                .insert({
                    key,
                    value: String(value),
                    description: description || key,
                    updated_by: user.id,
                });
            if (error) throw error;
        }

        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Server error' }, { status: 500 });
    }
}
