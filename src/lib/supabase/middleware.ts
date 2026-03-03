import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // If Supabase env vars are not configured, allow all requests through
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
            const url = request.nextUrl.clone();
            url.pathname = '/auth/login';
            return NextResponse.redirect(url);
        }
        return NextResponse.next({ request });
    }

    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() { return request.cookies.getAll(); },
                setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2])
                    );
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // Protect dashboard routes — redirect unauthenticated users to login
    if (!user && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin'))) {
        const url = request.nextUrl.clone();
        url.pathname = '/auth/login';
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
    }

    // For admin routes — check role in DB
    if (user && pathname.startsWith('/admin')) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, status')
            .eq('id', user.id)
            .single();

        const role = profile?.role || 'user';
        const isBanned = profile?.status === 'banned';

        if (isBanned) {
            const url = request.nextUrl.clone();
            url.pathname = '/auth/login';
            url.searchParams.set('error', 'Your account has been restricted');
            return NextResponse.redirect(url);
        }

        const allowedRoles = ['moderator', 'admin', 'super_admin'];
        if (!allowedRoles.includes(role)) {
            const url = request.nextUrl.clone();
            url.pathname = '/dashboard';
            return NextResponse.redirect(url);
        }
    }

    // Redirect authenticated users away from auth pages
    if (user && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup'))) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}
