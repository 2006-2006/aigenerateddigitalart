'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Settings as SettingsIcon } from 'lucide-react';
import SpiritLogo from '@/components/ui/SpiritLogo';
import { createClient } from '@/lib/supabase/client';

interface UserProfile {
    id: string;
    email?: string;
    role?: string;
    full_name?: string;
}

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [user, setUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        const supabase = createClient();

        // 1. Try to load from cache immediately for speed
        const cached = localStorage.getItem('sb_user_profile');
        if (cached) try { setUser(JSON.parse(cached)); } catch (e) { }

        // 2. Listen for auth changes (more reactive than getUser on mount)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                // If we already have the same user in cache, don't refetch immediately unless it's a login
                if (event === 'SIGNED_IN' || !cached) {
                    const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', session.user.id).single() as any;
                    const userData = {
                        id: session.user.id,
                        email: session.user.email,
                        role: profile?.role,
                        full_name: profile?.full_name
                    };
                    setUser(userData);
                    localStorage.setItem('sb_user_profile', JSON.stringify(userData));
                }
            } else {
                setUser(null);
                localStorage.removeItem('sb_user_profile');
            }
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            subscription.unsubscribe();
        };
    }, []);

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        setUser(null);
        window.location.href = '/';
    };

    const navLinks = [
        { label: 'Features', href: '#features' },
        { label: 'Gallery', href: '#gallery' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'FAQ', href: '#faq' },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
                ? 'backdrop-blur-xl bg-dark-200/80 border-b border-white/10 shadow-glass'
                : 'bg-transparent'
                }`}
        >
            <div className="section-wrapper flex items-center justify-between h-16">
                {/* Logo */}
                <Link href="/">
                    <SpiritLogo size={34} />
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            className="text-sm text-white/60 hover:text-white transition-colors duration-200 font-medium"
                        >
                            {link.label}
                        </a>
                    ))}
                </div>

                {/* CTA */}
                <div className="hidden md:flex items-center gap-3">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard/settings" title="Settings" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all duration-200">
                                <SettingsIcon size={18} />
                            </Link>
                            {(user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL || user.role === 'admin') ? (
                                <Link href="/admin" className="btn-primary text-sm px-5 py-2.5">
                                    Admin Panel
                                </Link>
                            ) : (
                                <Link href="/dashboard" className="btn-primary text-sm px-5 py-2.5">
                                    Dashboard
                                </Link>
                            )}
                            <button
                                onClick={handleSignOut}
                                className="text-white/40 text-xs hover:text-white transition-colors uppercase tracking-widest font-bold"
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link href="/auth/login?redirect=/admin" className="text-white/70 text-sm hover:text-white mr-4 font-medium transition-colors">
                                Admin Login
                            </Link>
                            <Link href="/auth/login" className="btn-secondary text-sm mr-2">
                                Sign In
                            </Link>
                            <Link href="/auth/signup" className="btn-primary text-sm px-5 py-2.5">
                                Get Started Free
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile menu toggle */}
                <button
                    className="md:hidden btn-ghost p-2"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle mobile menu"
                >
                    {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden backdrop-blur-xl bg-dark-200/95 border-b border-white/10 px-4 pb-6 space-y-4 animate-slide-up">
                    {navLinks.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            className="block py-2 text-white/70 hover:text-white transition-colors"
                            onClick={() => setMobileOpen(false)}
                        >
                            {link.label}
                        </a>
                    ))}
                    <div className="pt-2 flex flex-col gap-3">
                        {user ? (
                            <>
                                {(user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL || user.role === 'admin') ? (
                                    <Link href="/admin" className="btn-primary text-center py-3 rounded-xl">
                                        Admin Panel
                                    </Link>
                                ) : (
                                    <Link href="/dashboard" className="btn-primary text-center py-3 rounded-xl">
                                        Dashboard
                                    </Link>
                                )}
                                <button
                                    onClick={handleSignOut}
                                    className="btn-ghost text-center py-2"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/login?redirect=/admin" className="btn-secondary text-center py-3 rounded-xl border border-white/10">
                                    Admin Login
                                </Link>
                                <Link href="/auth/login" className="btn-ghost text-center py-2">
                                    Sign In
                                </Link>
                                <Link href="/auth/signup" className="btn-primary text-center py-3 rounded-xl">
                                    Get Started Free
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
