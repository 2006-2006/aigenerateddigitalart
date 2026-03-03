import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: imagesData, error } = await supabase
            .from('generated_images')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ images: imagesData || [] });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Server error';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
