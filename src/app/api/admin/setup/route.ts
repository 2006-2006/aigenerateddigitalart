import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * SECRET SETUP ROUTE
 * Use this to grant yourself admin status without running SQL manually.
 * Usage: /api/admin/setup?email=your@email.com
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
        return NextResponse.json({ error: 'Email parameter is required. Example: /api/admin/setup?email=me@example.com' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
        return NextResponse.json({ error: 'Supabase Service Key not found in environment variables.' }, { status: 500 });
    }

    try {
        const supabase = createClient(supabaseUrl, serviceKey);

        // 1. Try to find the user in Auth first
        const { data: { users }, error: listError } = await (supabase.auth.admin as any).listUsers();
        let targetUser = users?.find((u: any) => u.email === email);

        // 2. If user doesn't exist, CREATE THEM (bypasses rate limits and email confirmation)
        if (!targetUser) {
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email,
                password: 'password123', // Default dev password
                email_confirm: true,
                user_metadata: { full_name: 'Admin User' }
            });

            if (createError) throw createError;
            targetUser = newUser.user;
        }

        if (!targetUser) throw new Error('Failed to find or create user');

        // 3. Ensure a profile exists in the DB
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', targetUser.id)
            .single();

        if (!existingProfile) {
            const { error: profileError } = await supabase.from('profiles').insert({
                id: targetUser.id,
                email: targetUser.email,
                full_name: targetUser.user_metadata?.full_name || 'Admin',
                role: 'admin',
                plan: 'enterprise',
                credits: 999
            });
            if (profileError) throw profileError;
        } else {
            // 4. Update existing profile to admin
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    role: 'admin',
                    plan: 'enterprise',
                    credits: 999
                })
                .eq('id', targetUser.id);
            if (updateError) throw updateError;
        }

        return NextResponse.json({
            success: true,
            message: `User ${email} is now READY.`,
            details: {
                status: 'ADMIN PROMOTED',
                credentials: 'If you just created this account, use password: password123',
                action: 'Go to /auth/login and sign in directly. No email verification needed!'
            }
        });

    } catch (e: any) {
        return NextResponse.json({ error: 'Process failed.', details: e.message }, { status: 500 });
    }
}
