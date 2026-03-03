'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Image, TrendingUp, UserPlus, Zap, ArrowUpRight, ExternalLink, BatteryCharging, HardDrive, DollarSign, Activity } from 'lucide-react';

interface Stats {
    totalUsers: number;
    totalImages: number;
    newUsers7d: number;
    newImages7d: number;
    activeUsers7d: number;
    totalCreditsDistributed: number;
    creditBurnRate7d: number;
    revenueEstimate: number;
    storageUsedInMB: string;
    planCounts: { free: number; pro: number; enterprise: number };
}

interface RecentUser {
    id: string;
    email: string;
    full_name: string;
    plan: string;
    credits: number;
    created_at: string;
}

export default function AdminOverviewPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(r => r.json())
            .then(data => {
                if (data.error) { setError(data.error); }
                else { setStats(data.stats); setRecentUsers(data.recentUsers); }
            })
            .catch(() => setError('Failed to load stats'))
            .finally(() => setLoading(false));
    }, []);

    const planPct = (count: number) => stats?.totalUsers ? Math.round((count / stats.totalUsers) * 100) : 0;

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen -mt-20">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <div className="w-6 h-6 rounded-lg border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Syncing Console...</p>
        </div>
    );

    if (error) return (
        <div className="rounded-3xl p-8 text-center glass-card border border-red-500/20 max-w-md mx-auto mt-20">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-6 text-red-500">
                <Activity size={32} />
            </div>
            <h3 className="text-white font-black text-xl mb-2">Registry Offline</h3>
            <p className="text-red-400/60 text-sm mb-8">{error}. Verify admin privileges and database status.</p>
            <button onClick={() => window.location.reload()} className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all">
                Retry Connection
            </button>
        </div>
    );

    return (
        <div className="space-y-10 pb-20">
            {/* Control Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-emerald-400 mb-4">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Operational Status: Optimal</span>
                    </div>
                    <h1 className="text-5xl font-display font-black text-white tracking-tighter">
                        Command <span className="opacity-40">Center</span>
                    </h1>
                    <p className="text-white/30 text-xs font-mono mt-2 uppercase tracking-widest">Global Platform Analytics v2.04</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">
                        Audit Logs
                    </button>
                    <button className="px-5 py-3 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-xl shadow-purple-500/20 text-[10px] font-black uppercase tracking-widest text-white">
                        Global Settings
                    </button>
                </div>
            </div>

            {/* Matrix View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Platform Population', value: stats?.totalUsers ?? 0, icon: Users, gradient: 'from-violet-600 to-indigo-600', delta: `+${stats?.newUsers7d ?? 0} (7d)` },
                    { label: 'Active Sessions', value: stats?.activeUsers7d ?? 0, icon: Activity, gradient: 'from-emerald-600 to-teal-500', delta: 'Last 7 days' },
                    { label: 'Object Generations', value: stats?.totalImages ?? 0, icon: Image, gradient: 'from-pink-600 to-rose-600', delta: `+${stats?.newImages7d ?? 0} (7d)` },
                    { label: 'Credit Liquidity', value: stats?.totalCreditsDistributed ?? 0, icon: Zap, gradient: 'from-orange-600 to-amber-500', delta: 'Total Volume' },
                    { label: 'Resource Burn', value: stats?.creditBurnRate7d ?? 0, icon: BatteryCharging, gradient: 'from-blue-600 to-cyan-500', delta: 'Credits/Week' },
                    { label: 'Registry Load', value: `${stats?.storageUsedInMB ?? 0}MB`, icon: HardDrive, gradient: 'from-slate-600 to-slate-800', delta: 'Cloud Object Storage' },
                    { label: 'Projected MRR', value: `$${stats?.revenueEstimate ?? 0}`, icon: DollarSign, gradient: 'from-green-600 to-emerald-400', delta: 'Equity Estimate' },
                    { label: 'System Growth', value: `${(stats?.totalUsers && stats.totalUsers > 0) ? Math.round((stats.newUsers7d / stats.totalUsers) * 100) : 0}%`, icon: TrendingUp, gradient: 'from-fuchsia-600 to-purple-600', delta: 'Growth Vector' },
                ].map(({ label, value, icon: Icon, gradient, delta }) => (
                    <div key={label} className="group relative rounded-3xl p-6 glass-card border border-white/5 hover:border-white/10 transition-all duration-300">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform`}>
                            <Icon size={22} className="text-white" />
                        </div>
                        <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{label}</p>
                        <p className="text-3xl font-display font-black text-white tracking-tighter mb-2">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </p>
                        <div className="flex items-center gap-1.5 py-1 px-2 rounded-lg bg-white/[0.03] w-max">
                            <div className="w-1 h-1 rounded-full bg-white/20" />
                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-tighter">{delta}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Distribution Matrix */}
                <div className="rounded-[2.5rem] p-10 glass-card border border-white/5 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-white font-black text-2xl tracking-tight">Distribution Matrix</h3>
                            <p className="text-white/20 text-xs font-mono uppercase tracking-widest mt-1">Tier Breakdown Analysis</p>
                        </div>
                        <Link href="/admin/users" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/5">
                            <ArrowUpRight size={18} />
                        </Link>
                    </div>

                    <div className="space-y-8">
                        {[
                            { plan: 'Free', count: stats?.planCounts.free ?? 0, color: '#6366f1', description: 'Entry level participation' },
                            { plan: 'Pro', count: stats?.planCounts.pro ?? 0, color: '#a855f7', description: 'Advanced user threshold' },
                            { plan: 'Enterprise', count: stats?.planCounts.enterprise ?? 0, color: '#ec4899', description: 'Corporate entity access' },
                        ].map(({ plan, count, color, description }) => (
                            <div key={plan} className="relative group">
                                <div className="flex items-end justify-between mb-3">
                                    <div>
                                        <span className="text-white font-black text-sm uppercase tracking-widest">{plan}</span>
                                        <p className="text-[10px] font-bold text-white/20 uppercase mt-0.5">{description}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-white font-black text-lg font-mono">{count}</span>
                                        <span className="text-white/20 text-[10px] font-black ml-1">({planPct(count)}%)</span>
                                    </div>
                                </div>
                                <div className="h-3 rounded-full bg-white/[0.03] border border-white/5 overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                                        style={{ width: `${planPct(count)}%`, background: color }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-12 bg-white/[0.02] p-6 rounded-3xl border border-white/5">
                        {['Free', 'Pro', 'Enterprise'].map((p, idx) => (
                            <div key={p} className="text-center">
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">{p}</p>
                                <p className="text-xl font-black text-white font-mono">{[stats?.planCounts.free, stats?.planCounts.pro, stats?.planCounts.enterprise][idx]}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Registry Logs */}
                <div className="rounded-[2.5rem] p-10 glass-card border border-white/5 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-white font-black text-2xl tracking-tight">Registry Stream</h3>
                            <p className="text-white/20 text-xs font-mono uppercase tracking-widest mt-1">Live Identity Registration</p>
                        </div>
                        <Link href="/admin/users" className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all">
                            Expand Registry
                        </Link>
                    </div>

                    <div className="space-y-1">
                        {recentUsers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-white/10">
                                <Activity size={40} className="mb-4 opacity-20" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No Stream Data</p>
                            </div>
                        ) : recentUsers.map(user => (
                            <div key={user.id} className="group flex items-center gap-4 p-4 rounded-2xl transition-all hover:bg-white/[0.03] border border-transparent hover:border-white/5">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0 relative overflow-hidden"
                                    style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    {(user.full_name || user.email).charAt(0).toUpperCase()}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-black truncate">{user.full_name || 'Anonymous Entity'}</p>
                                    <p className="text-white/20 text-[10px] font-mono mt-0.5 truncate uppercase">{user.email}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${user.plan === 'enterprise' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' :
                                            user.plan === 'pro' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                                'bg-white/5 text-white/30 border border-white/10'
                                        }`}>
                                        {user.plan}
                                    </span>
                                    <span className="text-[10px] font-bold text-white/20 font-mono tracking-tighter">
                                        ID: {user.id.slice(0, 8)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

