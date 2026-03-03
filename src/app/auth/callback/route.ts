import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Handle Auth Callbacks (Signup confirmation, Password Reset, etc.)
 * This route exchanges the 'code' for a session and then redirects the user.
 */
export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    // Default redirect to dashboard if no 'next' param is provided
    const next = searchParams.get('next') ?? '/dashboard';

    if (code) {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return request.cookies.getAll(); },
                    setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
                        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    },
                },
            }
        );

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Success: session is now set in cookies.
            // Redirect to the intended page (e.g. /auth/reset-password)
            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // If there's an error or no code, redirect to login with error
    return NextResponse.redirect(`${origin}/auth/login?error=Authentication failed or link expired`);
}
