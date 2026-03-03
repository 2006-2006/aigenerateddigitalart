'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    LayoutDashboard, Sparkles, Image, Settings,
    ChevronLeft, ChevronRight, LogOut, Crown
} from 'lucide-react';
import SpiritLogo from '@/components/ui/SpiritLogo';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types/database';

const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Generate', href: '/dashboard/generate', icon: Sparkles },
    { label: 'Gallery', href: '/dashboard/gallery', icon: Image },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

interface Props {
    user: User;
    profile: Profile | null;
}

export default function DashboardSidebar({ user, profile }: Props) {
    const pathname = usePathname();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);
    const [liveCredits, setLiveCredits] = useState(profile?.credits ?? 0);

    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        const supabase = createClient();

        const channel = supabase.channel('realtime-profile')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
                (payload) => {
                    const newCredits = payload.new.credits;
                    if (newCredits !== liveCredits) {
                        setLiveCredits(newCredits);
                        setShowToast(true);
                        setTimeout(() => setShowToast(false), 3000);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user.id, liveCredits]);

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    const credits = liveCredits;
    const creditPercent = Math.min((credits / 10) * 100, 100);

    return (
        <aside
            className={`relative flex flex-col bg-dark-300/80 backdrop-blur-xl border-r border-white/10 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'
                }`}
        >
            {/* Logo */}
            <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
                <SpiritLogo size={32} showText={!collapsed} />
            </div>

            {/* Nav */}
            <nav className="flex-1 px-2 py-4 space-y-1">
                {navItems.map(({ label, href, icon: Icon }) => {
                    const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${isActive
                                ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30 shadow-neon-purple'
                                : 'text-white/50 hover:text-white hover:bg-white/5'
                                } ${collapsed ? 'justify-center' : ''}`}
                            title={collapsed ? label : undefined}
                        >
                            <Icon size={18} className="flex-shrink-0" />
                            {!collapsed && <span>{label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Credits */}
            {!collapsed && (
                <div className="mx-2 mb-3 p-3 rounded-xl glass-card">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-white/50">Credits</span>
                        <span className="text-xs font-bold text-brand-300">{credits} left</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full transition-all duration-500"
                            style={{ width: `${creditPercent}%` }}
                        />
                    </div>
                    {credits === 0 && (
                        <Link href="#pricing" className="mt-2 flex items-center gap-1 text-xs text-accent-400 hover:text-accent-300">
                            <Crown size={11} />
                            Upgrade for more
                        </Link>
                    )}
                </div>
            )}

            {/* User + Sign out */}
            <div className={`border-t border-white/10 p-3 ${collapsed ? 'flex justify-center' : ''}`}>
                {!collapsed && (
                    <div className="flex items-center gap-3 px-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {(profile?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-medium text-white truncate">{profile?.full_name || 'User'}</p>
                            <p className="text-xs text-white/30 truncate">{user.email}</p>
                        </div>
                    </div>
                )}
                <button
                    onClick={handleSignOut}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 w-full transition-all duration-200 text-sm ${collapsed ? 'justify-center' : ''}`}
                    title="Sign out"
                >
                    <LogOut size={16} />
                    {!collapsed && 'Sign Out'}
                </button>
            </div>

            {/* Collapse toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-20 w-6 h-6 rounded-full glass-card border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-brand-500/50 transition-all duration-200 shadow-glass"
                aria-label="Toggle sidebar"
            >
                {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            </button>

            {/* Credit Toast */}
            {showToast && (
                <div className="fixed bottom-4 left-4 right-4 md:right-auto md:left-64 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-brand-500/20 text-brand-300 border border-brand-500/30 shadow-neon-purple animate-fade-in backdrop-blur-md">
                    <Sparkles size={16} />
                    <span className="text-sm font-medium">Your credit balance has been updated</span>
                </div>
            )}
        </aside>
    );
}
