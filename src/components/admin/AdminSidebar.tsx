'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
    LayoutDashboard, Users, Settings, BarChart3,
    Zap, ChevronLeft, ChevronRight, LogOut, Shield, KeyRound
} from 'lucide-react';
import SpiritLogo from '@/components/ui/SpiritLogo';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types/database';

const navItems = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/credits', label: 'Credits', icon: Zap },
    { href: '/admin/api-keys', label: 'API Keys', icon: KeyRound },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
    { href: '/admin/stats', label: 'Analytics', icon: BarChart3 },
];

interface Props {
    user: User;
    profile: Profile | null;
}

export default function AdminSidebar({ user, profile }: Props) {
    const pathname = usePathname();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    return (
        <aside
            className={`relative flex flex-col bg-dark-300/80 backdrop-blur-xl border-r border-white/10 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'
                }`}
        >
            {/* Logo */}
            <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
                <SpiritLogo size={32} showText={!collapsed} />
            </div>

            {/* Admin badge */}
            {!collapsed && (
                <div className="mx-4 mt-4 px-3 py-2 rounded-xl flex items-center gap-2"
                    style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)' }}>
                    <Shield size={13} className="text-purple-400 flex-shrink-0" />
                    <span className="text-xs text-purple-300 font-medium truncate">{user.email || 'Admin'}</span>
                </div>
            )}

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map(({ label, href, icon: Icon }) => {
                    const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${isActive
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'text-white/50 hover:text-white hover:bg-white/5'
                                } ${collapsed ? 'justify-center' : ''}`}
                            title={collapsed ? label : undefined}
                        >
                            <Icon size={18} className="flex-shrink-0" />
                            {!collapsed && <span>{label}</span>}
                            {/* {!collapsed && isActive && <ChevronRight size={13} className="ml-auto" />} */}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom links & Sign out */}
            <div className={`border-t border-white/10 p-3 space-y-2 ${collapsed ? 'flex flex-col items-center' : ''}`}>
                <button
                    onClick={handleSignOut}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-500/10 w-full transition-all duration-200 text-sm ${collapsed ? 'justify-center' : ''}`}
                    title="Sign out"
                >
                    <LogOut size={16} />
                    {!collapsed && 'Sign Out'}
                </button>
            </div>

            {/* Collapse toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-20 w-6 h-6 rounded-full glass-card border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-purple-500/50 transition-all duration-200 shadow-glass"
                aria-label="Toggle sidebar"
            >
                {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            </button>
        </aside>
    );
}
