import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: p } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        const profile = p as { role?: string } | null;
        if (!profile || profile.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const admin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Total users
        const { count: totalUsers } = await admin.from('profiles').select('*', { count: 'exact', head: true });

        // Users by plan
        const { data: planData } = await admin.from('profiles').select('plan');
        const planCounts = { free: 0, pro: 0, enterprise: 0 };
        (planData || []).forEach((r: { plan: string }) => {
            if (r.plan in planCounts) planCounts[r.plan as keyof typeof planCounts]++;
        });

        // Total images generated
        const { count: totalImages } = await admin.from('generated_images').select('*', { count: 'exact', head: true });

        // New users last 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { count: newUsers7d } = await admin
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', sevenDaysAgo);

        // Images last 7 days & Active Users 7d
        const { data: recentImagesData } = await admin
            .from('generated_images')
            .select('user_id, credits_used')
            .gte('created_at', sevenDaysAgo);

        const newImages7d = recentImagesData?.length || 0;
        const activeUsersSet = new Set((recentImagesData || []).map((img: any) => img.user_id));
        const activeUsers7d = activeUsersSet.size;

        const creditBurnRate7d = (recentImagesData || []).reduce((acc: number, img: any) => acc + (img.credits_used || 1), 0);

        // Total Credits Distributed
        const { data: creditsData } = await admin.from('profiles').select('credits');
        const totalCreditsDistributed = (creditsData || []).reduce((acc: number, user: any) => acc + (user.credits || 0), 0);

        // Revenue Estimate (MRR)
        // Assume Pro = $15/mo, Enterprise = $99/mo
        const revenueEstimate = (planCounts.pro * 15) + (planCounts.enterprise * 99);

        // Mock Storage Used (assuming 1.5MB per image roughly)
        const storageUsedInMB = totalImages ? (totalImages * 1.5).toFixed(2) : '0';

        // Recent signups
        const { data: recentUsers } = await admin
            .from('profiles')
            .select('id, email, full_name, plan, credits, created_at')
            .order('created_at', { ascending: false })
            .limit(5);

        return NextResponse.json({
            stats: {
                totalUsers: totalUsers || 0,
                totalImages: totalImages || 0,
                newUsers7d: newUsers7d || 0,
                newImages7d: newImages7d || 0,
                activeUsers7d,
                totalCreditsDistributed,
                creditBurnRate7d,
                revenueEstimate,
                storageUsedInMB,
                planCounts,
            },
            recentUsers: recentUsers || [],
        });
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Server error' }, { status: 500 });
    }
}
