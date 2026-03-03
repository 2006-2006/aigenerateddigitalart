import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

// GET /api/admin/users — list all users with profile info
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Verify admin role
        const { data: p1 } = await supabase
            .from('profiles').select('role').eq('id', user.id).single();
        const adminProfile1 = p1 as { role?: string } | null;
        if (!adminProfile1 || !['admin', 'super_admin', 'moderator'].includes(adminProfile1.role || '')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const admin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Get all profiles
        const { data: profiles, error } = await admin
            .from('profiles')
            .select('id, email, full_name, credits, plan, role, status, created_at, updated_at')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Get image counts per user
        const { data: imageCounts } = await admin
            .from('generated_images')
            .select('user_id');

        const countMap: Record<string, number> = {};
        (imageCounts || []).forEach((r: { user_id: string }) => {
            countMap[r.user_id] = (countMap[r.user_id] || 0) + 1;
        });

        const enriched = (profiles || []).map((p: Record<string, unknown>) => ({
            ...p,
            images_count: countMap[p.id as string] || 0,
        }));

        return NextResponse.json({ users: enriched, total: enriched.length });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Server error';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

// PATCH /api/admin/users — update a user's metadata
export async function PATCH(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: p2 } = await supabase
            .from('profiles').select('role').eq('id', user.id).single();
        const adminProfile2 = p2 as { role?: string } | null;
        if (!adminProfile2 || !['admin', 'super_admin', 'moderator'].includes(adminProfile2.role || '')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { userId, credits, plan, role, status } = body;
        if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

        const admin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (credits !== undefined) updates.credits = Number(credits);
        if (plan !== undefined) updates.plan = plan;
        if (role !== undefined) updates.role = role;
        if (status !== undefined) updates.status = status;

        const { error } = await admin.from('profiles').update(updates).eq('id', userId);
        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Server error';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
