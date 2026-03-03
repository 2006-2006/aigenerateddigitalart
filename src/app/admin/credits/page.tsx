'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    Search, Zap, RefreshCw, ChevronUp, ChevronDown,
    Plus, Minus, Shield, CheckCircle2, X, TrendingUp,
    AlertTriangle, Users, CreditCard, PlusCircle, Settings2
} from 'lucide-react';
import { updateCreditsAction } from '@/app/actions/adminActions';

interface User {
    id: string;
    email: string;
    full_name: string;
    credits: number;
    plan: string;
    role: string;
    images_count: number;
    created_at: string;
}

interface CreditLog {
    userId: string;
    email: string;
    name: string;
    oldCredits: number;
    newCredits: number;
    delta: number;
    ts: string;
}

const PRESET_ADDS = [10, 25, 50, 100, 500];
const PLAN_CREDIT_DEFAULTS: Record<string, number> = {
    free: 10,
    pro: 500,
    enterprise: 99999,
};

function getPlanStyle(plan: string) {
    if (plan === 'pro') return { bg: 'rgba(124,58,237,0.18)', color: '#c084fc', border: 'rgba(124,58,237,0.35)' };
    if (plan === 'enterprise') return { bg: 'rgba(219,39,119,0.18)', color: '#f472b6', border: 'rgba(219,39,119,0.35)' };
    return { bg: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)', border: 'rgba(255,255,255,0.12)' };
}

function CreditBar({ credits, plan }: { credits: number; plan: string }) {
    const max = PLAN_CREDIT_DEFAULTS[plan] ?? 10;
    const pct = Math.min(100, Math.round((credits / max) * 100));
    const color = pct > 50 ? '#10b981' : pct > 20 ? '#f59e0b' : '#ef4444';
    return (
        <div className="flex items-center gap-2 min-w-[100px]">
            <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
            </div>
            <span className="text-xs font-bold tabular-nums" style={{ color }}>{credits}</span>
        </div>
    );
}

export default function AdminCreditsPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [filtered, setFiltered] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [planFilter, setPlanFilter] = useState('all');
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [sortBy, setSortBy] = useState<'credits' | 'created_at' | 'images_count'>('credits');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editCredits, setEditCredits] = useState('');
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
    const [log, setLog] = useState<CreditLog[]>([]);
    const [bulkAmount, setBulkAmount] = useState('10');
    const [bulkMode, setBulkMode] = useState<'set' | 'add' | 'subtract'>('add');
    const [showBulkPanel, setShowBulkPanel] = useState(false);
    const [stats, setStats] = useState({ total: 0, avgCredits: 0, lowCredit: 0, zeroCredit: 0 });

    // ─── Fetch users ────────────────────────────────────────────────────────────
    const fetchUsers = useCallback(() => {
        setLoading(true);
        fetch('/api/admin/users')
            .then(r => r.json())
            .then(data => {
                const list: User[] = data.users || [];
                setUsers(list);
                const total = list.length;
                const avgCredits = total ? Math.round(list.reduce((s, u) => s + u.credits, 0) / total) : 0;
                const lowCredit = list.filter(u => u.credits > 0 && u.credits <= 3).length;
                const zeroCredit = list.filter(u => u.credits === 0).length;
                setStats({ total, avgCredits, lowCredit, zeroCredit });
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    // ─── Filter + sort ──────────────────────────────────────────────────────────
    useEffect(() => {
        let list = [...users];
        if (search) list = list.filter(u =>
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            (u.full_name || '').toLowerCase().includes(search.toLowerCase())
        );
        if (planFilter !== 'all') list = list.filter(u => u.plan === planFilter);
        list.sort((a, b) => {
            const va = sortDir === 'asc' ? a[sortBy] : b[sortBy];
            const vb = sortDir === 'asc' ? b[sortBy] : a[sortBy];
            return typeof va === 'number' ? (va as number) - (vb as number) : String(va).localeCompare(String(vb));
        });
        setFiltered(list);
    }, [users, search, planFilter, sortBy, sortDir]);

    const [reason, setReason] = useState('Manual adjustment');

    // ─── Toast helper ───────────────────────────────────────────────────────────
    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    // ─── Save credits for one user ──────────────────────────────────────────────
    const saveCredits = async (userId: string, amountChange: number, oldCredits: number, email: string, name: string, reasonText: string) => {
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('amountChange', String(amountChange));
        formData.append('reason', reasonText);

        const res = await updateCreditsAction(formData);

        if (!res.success) throw new Error(res.error || 'Update failed');

        const newCredits = oldCredits + amountChange;
        setLog(prev => [{
            userId, email, name,
            oldCredits, newCredits,
            delta: amountChange,
            ts: new Date().toISOString(),
        }, ...prev.slice(0, 19)]);
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, credits: newCredits } : u));
    };

    // ─── Quick-add from row ─────────────────────────────────────────────────────
    const quickAdd = async (user: User, delta: number) => {
        const amountChange = user.credits + delta < 0 ? -user.credits : delta;
        try {
            await saveCredits(user.id, amountChange, user.credits, user.email, user.full_name, 'Quick Add');
            showToast(`${amountChange > 0 ? '+' : ''}${amountChange} credits → ${user.full_name || user.email}`);
        } catch {
            showToast('Failed to update credits', 'error');
        }
    };

    // ─── Save from modal ────────────────────────────────────────────────────────
    const saveModal = async () => {
        if (!editingUser) return;
        const newCredits = Math.max(0, Number(editCredits));
        const amountChange = newCredits - editingUser.credits;
        setSaving(true);
        try {
            await saveCredits(editingUser.id, amountChange, editingUser.credits, editingUser.email, editingUser.full_name, reason);
            showToast('Credits updated successfully!');
            setEditingUser(null);
            setReason('Manual adjustment');
        } catch {
            showToast('Failed to update', 'error');
        } finally {
            setSaving(false);
        }
    };

    // ─── Bulk update ────────────────────────────────────────────────────────────
    const applyBulk = async () => {
        if (selected.size === 0) return;
        setSaving(true);
        const amount = Number(bulkAmount);
        const targets = users.filter(u => selected.has(u.id));
        let ok = 0;
        for (const u of targets) {
            let amountChange = 0;
            if (bulkMode === 'set') amountChange = amount - u.credits;
            else if (bulkMode === 'add') amountChange = amount;
            else amountChange = -Math.min(amount, u.credits);

            try {
                await saveCredits(u.id, amountChange, u.credits, u.email, u.full_name, 'Bulk action');
                ok++;
            } catch { /* skip */ }
        }
        setSaving(false);
        setSelected(new Set());
        setShowBulkPanel(false);
        showToast(`Updated ${ok}/${targets.length} users`);
    };

    const toggleSelect = (id: string) => setSelected(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });

    const toggleAll = () => {
        if (selected.size === filtered.length) setSelected(new Set());
        else setSelected(new Set(filtered.map(u => u.id)));
    };

    const toggleSort = (col: typeof sortBy) => {
        if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortBy(col); setSortDir('asc'); }
    };

    const SortIcon = ({ col }: { col: typeof sortBy }) =>
        sortBy === col
            ? (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)
            : <ChevronDown size={12} className="opacity-30" />;

    return (
        <div className="space-y-6">
            {/* Hero Header */}
            <div className="relative rounded-3xl overflow-hidden p-8 mb-4 flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg, rgba(8,145,178,0.15) 0%, rgba(14,165,233,0.05) 100%)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="absolute inset-0 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(rgba(14,165,233,0.2) 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.5 }} />
                <div className="absolute top-4 right-10 w-32 h-32 rounded-full pointer-events-none opacity-20 bg-cyan-500 blur-3xl" />
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-600 to-sky-500 flex items-center justify-center shadow-lg">
                        <Zap size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-display font-bold text-white mb-1">Credit Management</h1>
                        <p className="text-white/50 text-sm">Monitor system credits, analyze burn rates, and bulk issue credits.</p>
                    </div>
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl text-sm font-semibold text-white shadow-2xl animate-fade-in"
                    style={{
                        background: toast.type === 'success' ? 'rgba(16,185,129,0.95)' : 'rgba(239,68,68,0.95)',
                        boxShadow: toast.type === 'success' ? '0 0 30px rgba(16,185,129,0.4)' : '0 0 30px rgba(239,68,68,0.4)',
                    }}>
                    {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                    {toast.msg}
                </div>
            )}

            {/* ── Stats Row ── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                    { label: 'Total Users', value: stats.total, icon: Users, color: '#7c3aed', sub: 'All time' },
                    { label: 'Avg Credits', value: stats.avgCredits, icon: TrendingUp, color: '#0891b2', sub: 'Per user' },
                    { label: 'Low Credits', value: stats.lowCredit, icon: AlertTriangle, color: '#f59e0b', sub: '≤ 3 credits left' },
                    { label: 'Zero Credits', value: stats.zeroCredit, icon: Zap, color: '#ef4444', sub: 'Need top-up' },
                ].map(({ label, value, icon: Icon, color, sub }) => (
                    <div key={label} className="rounded-2xl p-5 relative overflow-hidden"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="absolute top-4 right-4 w-12 h-12 rounded-xl flex items-center justify-center opacity-15"
                            style={{ background: color }}>
                            <Icon size={22} style={{ color }} />
                        </div>
                        <Icon size={18} style={{ color }} className="mb-3" />
                        <p className="text-3xl font-display font-black text-white">{value.toLocaleString()}</p>
                        <p className="text-white/50 text-xs mt-1 font-medium">{label}</p>
                        <p className="text-white/25 text-[11px] mt-0.5">{sub}</p>
                    </div>
                ))}
            </div>

            {/* ── Toolbar ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white outline-none placeholder-white/25"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }} />
                </div>

                {/* Plan filter */}
                <div className="flex items-center gap-1.5">
                    {['all', 'free', 'pro', 'enterprise'].map(p => (
                        <button key={p} onClick={() => setPlanFilter(p)}
                            className="px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all duration-200"
                            style={{
                                background: planFilter === p ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.05)',
                                border: planFilter === p ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(255,255,255,0.08)',
                                color: planFilter === p ? '#c084fc' : 'rgba(255,255,255,0.45)',
                            }}>{p}</button>
                    ))}
                </div>

                <div className="flex items-center gap-2 ml-auto">
                    {/* Bulk panel toggle */}
                    {selected.size > 0 && (
                        <button onClick={() => setShowBulkPanel(v => !v)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:brightness-110"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)', boxShadow: '0 0 20px rgba(124,58,237,0.35)' }}>
                            <Settings2 size={13} /> Bulk Edit ({selected.size})
                        </button>
                    )}
                    <button onClick={fetchUsers} className="p-2.5 rounded-xl text-white/40 hover:text-white transition-colors"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <span className="text-white/25 text-xs">{filtered.length} users</span>
                </div>
            </div>

            {/* ── Bulk Panel ── */}
            {showBulkPanel && selected.size > 0 && (
                <div className="rounded-2xl p-5 animate-fade-in"
                    style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.25)' }}>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <CreditCard size={16} className="text-purple-400" />
                            <span className="text-white/70 text-sm font-semibold">Bulk: {selected.size} users selected</span>
                        </div>

                        {/* Mode */}
                        <div className="flex items-center gap-1 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                            {(['set', 'add', 'subtract'] as const).map(m => (
                                <button key={m} onClick={() => setBulkMode(m)}
                                    className="px-3 py-1.5 text-xs font-semibold capitalize transition-all"
                                    style={{
                                        background: bulkMode === m ? 'rgba(124,58,237,0.35)' : 'transparent',
                                        color: bulkMode === m ? '#c084fc' : 'rgba(255,255,255,0.4)',
                                    }}>{m}</button>
                            ))}
                        </div>

                        {/* Amount */}
                        <div className="flex items-center gap-1.5">
                            {PRESET_ADDS.map(n => (
                                <button key={n} onClick={() => setBulkAmount(String(n))}
                                    className="w-10 h-8 rounded-lg text-xs font-bold transition-all"
                                    style={{
                                        background: bulkAmount === String(n) ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.06)',
                                        border: bulkAmount === String(n) ? '1px solid rgba(124,58,237,0.5)' : '1px solid rgba(255,255,255,0.08)',
                                        color: bulkAmount === String(n) ? '#c084fc' : 'rgba(255,255,255,0.5)',
                                    }}>{n}</button>
                            ))}
                            <input type="number" value={bulkAmount} onChange={e => setBulkAmount(e.target.value)} min="0"
                                className="w-20 px-3 py-1.5 rounded-lg text-xs text-white text-center outline-none"
                                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
                        </div>

                        {/* Apply */}
                        <button onClick={applyBulk} disabled={saving}
                            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white transition-all hover:brightness-110 disabled:opacity-60"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
                            <Zap size={12} /> Apply to {selected.size} users
                        </button>
                        <button onClick={() => { setSelected(new Set()); setShowBulkPanel(false); }}
                            className="p-2 rounded-lg text-white/30 hover:text-white/60 transition-colors">
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Main Table + Log ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Table */}
                <div className="xl:col-span-2 rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                                    <th className="px-4 py-3.5 text-left">
                                        <input type="checkbox"
                                            checked={filtered.length > 0 && selected.size === filtered.length}
                                            onChange={toggleAll}
                                            className="w-4 h-4 rounded accent-purple-500 cursor-pointer" />
                                    </th>
                                    <th className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white/35">User</th>
                                    <th className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white/35">Plan</th>
                                    <th className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white/35 cursor-pointer hover:text-white/60"
                                        onClick={() => toggleSort('credits')}>
                                        <span className="flex items-center gap-1">Credits <SortIcon col="credits" /></span>
                                    </th>
                                    <th className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white/35">Quick Add</th>
                                    <th className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white/35">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6} className="px-4 py-16 text-center text-white/25">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
                                            Loading users...
                                        </div>
                                    </td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={6} className="px-4 py-16 text-center text-white/25">No users found</td></tr>
                                ) : filtered.map((user, i) => {
                                    const isSelected = selected.has(user.id);
                                    const ps = getPlanStyle(user.plan);
                                    return (
                                        <tr key={user.id} style={{
                                            background: isSelected
                                                ? 'rgba(124,58,237,0.08)'
                                                : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                                            transition: 'background 0.15s',
                                        }}>
                                            {/* Checkbox */}
                                            <td className="px-4 py-3">
                                                <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(user.id)}
                                                    className="w-4 h-4 rounded accent-purple-500 cursor-pointer" />
                                            </td>

                                            {/* User */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                                        style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
                                                        {(user.full_name || user.email).charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-white font-semibold text-sm truncate max-w-[130px]">
                                                            {user.full_name || 'Unnamed'}
                                                            {user.role === 'admin' && <Shield size={11} className="inline ml-1 text-purple-400" />}
                                                        </p>
                                                        <p className="text-white/35 text-xs truncate max-w-[130px]">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Plan badge */}
                                            <td className="px-4 py-3">
                                                <span className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize"
                                                    style={{ background: ps.bg, color: ps.color, border: `1px solid ${ps.border}` }}>
                                                    {user.plan}
                                                </span>
                                            </td>

                                            {/* Credits bar */}
                                            <td className="px-4 py-3">
                                                <CreditBar credits={user.credits} plan={user.plan} />
                                            </td>

                                            {/* Quick add/subtract */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => quickAdd(user, -1)} title="Remove 1 credit"
                                                        className="w-6 h-6 rounded-lg flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/15 transition-all"
                                                        style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                                                        <Minus size={11} />
                                                    </button>
                                                    {[10, 50].map(n => (
                                                        <button key={n} onClick={() => quickAdd(user, n)} title={`Add ${n} credits`}
                                                            className="px-2 h-6 rounded-lg text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/15 transition-all"
                                                            style={{ border: '1px solid rgba(16,185,129,0.2)' }}>
                                                            +{n}
                                                        </button>
                                                    ))}
                                                    <button onClick={() => quickAdd(user, 1)} title="Add 1 credit"
                                                        className="w-6 h-6 rounded-lg flex items-center justify-center text-white/40 hover:text-emerald-400 hover:bg-emerald-500/15 transition-all"
                                                        style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                                                        <Plus size={11} />
                                                    </button>
                                                </div>
                                            </td>

                                            {/* Edit button */}
                                            <td className="px-4 py-3">
                                                <button onClick={() => { setEditingUser(user); setEditCredits(String(user.credits)); }}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-300 hover:text-purple-200 transition-all hover:brightness-125"
                                                    style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)' }}>
                                                    <PlusCircle size={12} /> Set
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Credit Log Sidebar ── */}
                <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-bold text-sm flex items-center gap-2">
                            <Zap size={14} className="text-yellow-400" /> Credit Log
                        </h3>
                        {log.length > 0 && (
                            <button onClick={() => setLog([])} className="text-[10px] text-white/25 hover:text-white/50 transition-colors">
                                Clear
                            </button>
                        )}
                    </div>
                    {log.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                <Zap size={20} className="text-white/20" />
                            </div>
                            <p className="text-white/25 text-xs text-center">Credit changes will appear here as you edit them.</p>
                        </div>
                    ) : (
                        <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                            {log.map((entry, i) => (
                                <div key={i} className="rounded-xl p-3"
                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-white text-xs font-semibold truncate max-w-[130px]">
                                            {entry.name || entry.email}
                                        </span>
                                        <span className="text-[10px] font-bold rounded-full px-2 py-0.5 flex-shrink-0"
                                            style={{
                                                background: entry.delta > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                                                color: entry.delta > 0 ? '#10b981' : '#ef4444',
                                            }}>
                                            {entry.delta > 0 ? '+' : ''}{entry.delta}
                                        </span>
                                    </div>
                                    <p className="text-white/30 text-[10px] truncate">{entry.email}</p>
                                    <div className="flex items-center justify-between mt-1.5">
                                        <span className="text-white/20 text-[10px]">
                                            {entry.oldCredits} → <span className="text-white/50 font-bold">{entry.newCredits}</span>
                                        </span>
                                        <span className="text-white/20 text-[10px]">
                                            {new Date(entry.ts).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Quick presets box */}
                    <div className="mt-5 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-white/30 text-[11px] uppercase tracking-widest font-semibold mb-3">Plan Defaults</p>
                        <div className="space-y-2">
                            {Object.entries(PLAN_CREDIT_DEFAULTS).map(([plan, credits]) => {
                                const ps = getPlanStyle(plan);
                                return (
                                    <div key={plan} className="flex items-center justify-between rounded-xl px-3 py-2"
                                        style={{ background: ps.bg, border: `1px solid ${ps.border}` }}>
                                        <span className="text-xs font-semibold capitalize" style={{ color: ps.color }}>{plan}</span>
                                        <span className="text-xs font-bold flex items-center gap-1" style={{ color: ps.color }}>
                                            <Zap size={10} /> {credits >= 99999 ? '∞' : credits}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Set Credits Modal ── */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)' }}
                    onClick={() => setEditingUser(null)}>
                    <div className="w-full max-w-sm rounded-3xl p-7"
                        style={{ background: '#0d0d1f', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 40px 100px rgba(0,0,0,0.6)' }}
                        onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-white font-display font-bold text-xl">Set Credits</h2>
                                <p className="text-white/40 text-sm mt-0.5 truncate max-w-[220px]">{editingUser.email}</p>
                            </div>
                            <button onClick={() => setEditingUser(null)} className="p-2 rounded-xl text-white/30 hover:text-white/70 hover:bg-white/05 transition-all">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Current credits display */}
                        <div className="mb-5 p-4 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <p className="text-white/35 text-xs uppercase tracking-widest mb-1">Current Balance</p>
                            <p className="text-4xl font-display font-black text-white flex items-center justify-center gap-2">
                                <Zap size={24} className="text-yellow-400" />
                                {editingUser.credits}
                            </p>
                        </div>

                        {/* Preset amounts */}
                        <p className="text-white/35 text-xs uppercase tracking-widest mb-2 font-semibold">Quick Set</p>
                        <div className="grid grid-cols-5 gap-2 mb-4">
                            {[10, 25, 50, 100, 500].map(n => (
                                <button key={n} onClick={() => setEditCredits(String(n))}
                                    className="py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                                    style={{
                                        background: editCredits === String(n) ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.05)',
                                        border: editCredits === String(n) ? '1px solid rgba(124,58,237,0.55)' : '1px solid rgba(255,255,255,0.08)',
                                        color: editCredits === String(n) ? '#c084fc' : 'rgba(255,255,255,0.5)',
                                    }}>{n}</button>
                            ))}
                        </div>

                        {/* Custom input */}
                        <p className="text-white/35 text-xs uppercase tracking-widest mb-2 font-semibold">Custom Amount</p>
                        <input type="number" value={editCredits}
                            onChange={e => setEditCredits(e.target.value)} min="0"
                            className="w-full px-4 py-3.5 rounded-xl text-white text-lg font-bold text-center outline-none mb-6"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }} />

                        {/* Preview delta */}
                        {editCredits && Number(editCredits) !== editingUser.credits && (
                            <div className="mb-4 px-4 py-2.5 rounded-xl text-xs text-center font-semibold"
                                style={{
                                    background: Number(editCredits) > editingUser.credits ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                    border: `1px solid ${Number(editCredits) > editingUser.credits ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                                    color: Number(editCredits) > editingUser.credits ? '#10b981' : '#ef4444',
                                }}>
                                {Number(editCredits) > editingUser.credits ? '▲' : '▼'} {Math.abs(Number(editCredits) - editingUser.credits)} credits {Number(editCredits) > editingUser.credits ? 'added' : 'removed'}
                            </div>
                        )}

                        {/* Reason Dropdown */}
                        <p className="text-white/35 text-xs uppercase tracking-widest mb-2 font-semibold">Reason</p>
                        <select value={reason} onChange={e => setReason(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl text-white text-sm font-semibold outline-none mb-6 appearance-none cursor-pointer"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                            <option value="Manual adjustment" className="bg-dark-300">Manual adjustment</option>
                            <option value="Promotional credits" className="bg-dark-300">Promotional credits</option>
                            <option value="Refund" className="bg-dark-300">Refund</option>
                            <option value="Plan upgrade addition" className="bg-dark-300">Plan upgrade addition</option>
                            <option value="System correction" className="bg-dark-300">System correction</option>
                        </select>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button onClick={() => setEditingUser(null)}
                                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white/40 hover:text-white/70 transition-colors"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                Cancel
                            </button>
                            <button onClick={saveModal} disabled={saving || !editCredits}
                                className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-60 flex items-center justify-center gap-2"
                                style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)', boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}>
                                {saving ? (
                                    <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Saving...</>
                                ) : (
                                    <><Zap size={14} /> Save Credits</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
