'use client';

import { Bell, Zap, Image as ImageIcon, AlertTriangle, X, CheckCheck, ExternalLink, Shield } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types/database';
import { useState, useEffect, useRef, useCallback } from 'react';

interface Props {
    user: User;
    profile: Profile | null;
}

interface Notification {
    id: string;
    type: 'image_generated' | 'low_credits' | 'welcome';
    title: string;
    message: string;
    time: string;
    imageUrl?: string;
    read: boolean;
}

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${d}d ago`;
}

export default function AdminHeader({ user, profile }: Props) {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unread, setUnread] = useState(0);
    const [loading, setLoading] = useState(false);
    const [readIds, setReadIds] = useState<Set<string>>(new Set());
    const panelRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                // Count those not yet marked read locally
                setUnread((data.notifications || []).filter(
                    (n: Notification) => !readIds.has(n.id)
                ).length);
            }
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchNotifications();
        // Poll every 60 seconds for new notifications
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Close panel on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const markAllRead = () => {
        const ids = new Set(notifications.map(n => n.id));
        setReadIds(ids);
        setUnread(0);
    };

    const handleOpen = () => {
        setOpen(v => !v);
        // Mark all as read when opening
        if (!open) {
            markAllRead();
        }
    };

    const notifIcon = (type: Notification['type']) => {
        if (type === 'low_credits') return <AlertTriangle size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" />;
        return <ImageIcon size={14} className="text-purple-400 flex-shrink-0 mt-0.5" />;
    };

    return (
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-dark-300/40 backdrop-blur-sm flex-shrink-0">
            <div>
                <h2 className="text-sm font-medium text-white/50">
                    Spirit AI{' '}
                    <span className="text-white font-semibold">
                        Admin Console
                    </span>
                </h2>
            </div>

            <div className="flex items-center gap-3">
                {/* Admin Access indicator */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-card border border-purple-500/20">
                    <Shield size={14} className="text-purple-400" />
                    <span className="text-sm font-semibold text-purple-300">Admin Access</span>
                </div>

                {/* Notification bell */}
                <div className="relative" ref={panelRef}>
                    <button
                        onClick={handleOpen}
                        className="relative w-9 h-9 rounded-lg glass-card flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all duration-200"
                        aria-label="Notifications"
                    >
                        <Bell size={16} />
                        {unread > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)', boxShadow: '0 0 8px rgba(219,39,119,0.5)' }}>
                                {unread > 9 ? '9+' : unread}
                            </span>
                        )}
                    </button>

                    {/* Notification panel */}
                    {open && (
                        <div className="absolute right-0 top-12 w-80 rounded-2xl z-50 overflow-hidden"
                            style={{
                                background: '#0d0d1f',
                                border: '1px solid rgba(255,255,255,0.1)',
                                boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                            }}>
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3.5"
                                style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                                <div className="flex items-center gap-2">
                                    <Bell size={14} className="text-purple-400" />
                                    <span className="text-white font-semibold text-sm">Notifications</span>
                                    {notifications.length > 0 && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                                            style={{ background: 'rgba(124,58,237,0.2)', color: '#c084fc' }}>
                                            {notifications.length}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {notifications.length > 0 && (
                                        <button onClick={markAllRead}
                                            className="text-[11px] text-white/30 hover:text-white/70 flex items-center gap-1 transition-colors">
                                            <CheckCheck size={11} /> Mark all read
                                        </button>
                                    )}
                                    <button onClick={() => setOpen(false)}
                                        className="text-white/30 hover:text-white/70 transition-colors">
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Notification list */}
                            <div className="max-h-96 overflow-y-auto">
                                {loading && notifications.length === 0 ? (
                                    <div className="flex items-center justify-center py-10 gap-2 text-white/30 text-sm">
                                        <div className="w-4 h-4 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
                                        Loading...
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                            style={{ background: 'rgba(255,255,255,0.04)' }}>
                                            <Bell size={20} className="text-white/20" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-white/50 text-sm font-medium">All caught up!</p>
                                            <p className="text-white/25 text-xs mt-0.5">No notifications yet.</p>
                                        </div>
                                    </div>
                                ) : (
                                    notifications.map((n) => (
                                        <div key={n.id}
                                            className="flex gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03]"
                                            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            {/* Thumbnail or icon */}
                                            {n.imageUrl ? (
                                                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={n.imageUrl} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                                    style={{ background: 'rgba(255,255,255,0.05)' }}>
                                                    {notifIcon(n.type)}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-xs font-semibold">{n.title}</p>
                                                <p className="text-white/45 text-[11px] mt-0.5 leading-relaxed">{n.message}</p>
                                                <p className="text-white/20 text-[10px] mt-1">{timeAgo(n.time)}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
