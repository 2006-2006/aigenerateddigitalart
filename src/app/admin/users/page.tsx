'use client';

import { useEffect, useState } from 'react';
import { Search, Zap, RefreshCw, ChevronUp, ChevronDown, Shield, Settings } from 'lucide-react';
import { updateUserAction, updateCreditsAction, deleteUserAction } from '@/app/actions/adminActions';

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

const PLAN_OPTIONS = ['free', 'pro', 'enterprise'];
const ROLE_OPTIONS = ['user', 'moderator', 'admin', 'super_admin'];
const STATUS_OPTIONS = ['active', 'banned'];

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [filtered, setFiltered] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [planFilter, setPlanFilter] = useState('all');
    const [saving, setSaving] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<(User & { status?: string }) | null>(null);
    const [editCredits, setEditCredits] = useState('');
    const [editPlan, setEditPlan] = useState('');
    const [editRole, setEditRole] = useState('');
    const [editStatus, setEditStatus] = useState('active');
    const [toast, setToast] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    // Sort logic
    const [sortBy, setSortBy] = useState<'created_at' | 'credits' | 'images_count'>('created_at');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    const fetchUsers = () => {
        setLoading(true);
        fetch('/api/admin/users')
            .then(r => r.json())
            .then(data => { setUsers(data.users || []); })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchUsers(); }, []);

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

    const openEdit = (u: any) => {
        setEditingUser(u);
        setEditCredits(String(u.credits));
        setEditPlan(u.plan);
        setEditRole(u.role);
        setEditStatus(u.status || 'active');
    };

    const saveUser = async () => {
        if (!editingUser) return;
        setSaving(editingUser.id);

        if (Number(editCredits) !== editingUser.credits) {
            const creFormData = new FormData();
            creFormData.append('userId', editingUser.id);
            creFormData.append('amountChange', String(Number(editCredits) - editingUser.credits));
            creFormData.append('reason', 'Admin modification from Users panel');
            await updateCreditsAction(creFormData);
        }

        // 2. Update Role/Plan/Status
        const formData = new FormData();
        formData.append('userId', editingUser.id);
        formData.append('role', editRole);
        formData.append('plan', editPlan);
        formData.append('status', editStatus);

        const res = await updateUserAction(formData);
        if (res.success) {
            setToast('User updated successfully!');
            setTimeout(() => setToast(''), 3000);
            setUsers(prev => prev.map(u => u.id === editingUser.id
                ? { ...u, credits: Number(editCredits), plan: editPlan, role: editRole, status: editStatus }
                : u));
            setEditingUser(null);
        } else {
            alert(res.error || 'Update failed');
        }
        setSaving(null);
    };

    const handleDelete = async (id: string) => {
        setSaving(id);
        const res = await deleteUserAction(id);
        if (res.success) {
            setUsers(prev => prev.filter(u => u.id !== id));
            setConfirmDelete(null);
        } else {
            alert(res.error || 'Delete failed');
        }
        setSaving(null);
    };

    const toggleSort = (col: typeof sortBy) => {
        if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortBy(col); setSortDir('desc'); }
    };

    const SortIcon = ({ col }: { col: typeof sortBy }) =>
        sortBy === col
            ? (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)
            : <ChevronDown size={12} className="opacity-30" />;

    return (
        <div className="space-y-6">
            {/* Hero Header */}
            <div className="relative rounded-3xl overflow-hidden p-8 mb-8"
                style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(15,15,30,1) 100%)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="absolute inset-0 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(rgba(139,92,246,0.15) 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.5 }} />
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center shadow-lg">
                        <Shield size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-display font-bold text-white mb-1">User Management</h1>
                        <p className="text-white/50 text-sm">Control platform users, credits, and access tiers.</p>
                    </div>
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-medium text-white shadow-xl animate-fade-in"
                    style={{ background: 'rgba(124,58,237,0.9)', boxShadow: '0 0 24px rgba(124,58,237,0.3)' }}>
                    ✓ {toast}
                </div>
            )}

            {/* Filters bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search entities..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white outline-none"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }} />
                </div>
                <div className="flex items-center gap-2">
                    {['all', ...PLAN_OPTIONS].map(p => (
                        <button key={p} onClick={() => setPlanFilter(p)}
                            className="px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all duration-200"
                            style={{
                                background: planFilter === p ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)',
                                border: planFilter === p ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(255,255,255,0.06)',
                                color: planFilter === p ? '#c084fc' : 'rgba(255,255,255,0.35)',
                            }}>
                            {p}
                        </button>
                    ))}
                </div>
                <button onClick={fetchUsers} className="p-2.5 rounded-xl text-white/40 hover:text-white transition-colors"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <RefreshCw size={14} />
                </button>
            </div>

            {/* Table */}
            <div className="rounded-2xl overflow-hidden glass-card" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                {['User', 'Status', 'Plan', 'Credits', 'Generations', 'Role', 'Joined', 'Actions'].map((label) => (
                                    <th key={label} className="text-left px-4 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">
                                        {label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} className="px-4 py-20 text-center text-white/20">Syncing with registry...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={8} className="px-4 py-20 text-center text-white/20">No matching entities found</td></tr>
                            ) : filtered.map((user: any, i) => (
                                <tr key={user.id}
                                    style={{
                                        background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.005)',
                                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                                    }}
                                    className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                                                style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                                {(user.full_name || user.email).charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-white font-bold text-sm truncate max-w-[180px]">
                                                    {user.full_name || 'Anonymous Entity'}
                                                </p>
                                                <p className="text-white/30 text-[10px] uppercase font-bold tracking-tighter truncate max-w-[180px]">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'banned' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${user.status === 'banned' ? 'text-red-400' : 'text-emerald-400'}`}>
                                                {user.status || 'Active'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="text-[10px] px-2 py-0.5 rounded-md font-black uppercase tracking-widest"
                                            style={{
                                                background: user.plan === 'pro' ? 'rgba(124,58,237,0.15)' : user.plan === 'enterprise' ? 'rgba(219,39,119,0.15)' : 'rgba(255,255,255,0.05)',
                                                color: user.plan === 'pro' ? '#c084fc' : user.plan === 'enterprise' ? '#f472b6' : 'rgba(255,255,255,0.3)',
                                                border: `1px solid ${user.plan === 'pro' ? 'rgba(124,58,237,0.2)' : user.plan === 'enterprise' ? 'rgba(219,39,119,0.2)' : 'rgba(255,255,255,0.1)'}`
                                            }}>{user.plan}</span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="flex items-center gap-1 text-white/80 font-mono font-bold text-xs">
                                            {user.credits.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-white/40 font-mono text-xs">{user.images_count}</td>
                                    <td className="px-4 py-4">
                                        <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${['admin', 'super_admin'].includes(user.role) ? 'text-purple-400' : 'text-white/20'}`}>
                                            {['admin', 'super_admin'].includes(user.role) && <Shield size={10} />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-white/25 font-mono text-[10px]">
                                        {new Date(user.created_at).toISOString().split('T')[0]}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEdit(user)}
                                                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
                                                title="Control Center">
                                                <Settings size={14} />
                                            </button>
                                            <button onClick={() => setConfirmDelete(user.id)}
                                                className="p-1.5 rounded-lg text-red-500/30 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/10"
                                                title="Purge Identity">
                                                <Zap size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Control Center Modal */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
                    onClick={() => setEditingUser(null)}>
                    <div className="w-full max-w-lg rounded-[2rem] p-8 glass-card border border-white/10 shadow-massive"
                        onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-xl font-black text-white">
                                {(editingUser.full_name || editingUser.email).charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-white font-display font-black text-2xl">Access Control</h2>
                                <p className="text-white/30 text-xs font-mono uppercase tracking-widest">{editingUser.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-3">Balance Regulation</label>
                                <div className="flex gap-2">
                                    <input type="number" value={editCredits} onChange={e => setEditCredits(e.target.value)}
                                        className="flex-1 px-4 py-3 bg-white/5 rounded-xl text-white font-mono font-bold border border-white/5 outline-none focus:border-purple-500/50 transition-colors" />
                                    <div className="flex gap-1">
                                        {[-50, +50].map(val => (
                                            <button key={val} onClick={() => setEditCredits(String(Math.max(0, Number(editCredits) + val)))}
                                                className="px-3 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-white/40 hover:text-white hover:bg-white/10 transition-all">
                                                {val > 0 ? '+' : ''}{val}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-3">Plan</label>
                                <select value={editPlan} onChange={e => setEditPlan(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 rounded-xl text-white text-xs font-bold border border-white/5 outline-none appearance-none cursor-pointer hover:bg-white/10 transition-colors">
                                    {PLAN_OPTIONS.map(p => <option key={p} value={p} className="bg-dark-300">{p.toUpperCase()}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-3">Privilege Level</label>
                                <select value={editRole} onChange={e => setEditRole(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 rounded-xl text-white text-xs font-bold border border-white/5 outline-none appearance-none cursor-pointer hover:bg-white/10 transition-colors">
                                    {ROLE_OPTIONS.map(r => <option key={r} value={r} className="bg-dark-300">{r.toUpperCase()}</option>)}
                                </select>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-3">Participation Status</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {STATUS_OPTIONS.map(s => (
                                        <button key={s} onClick={() => setEditStatus(s)}
                                            className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${editStatus === s
                                                ? (s === 'active' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-red-500/20 border-red-500/50 text-red-400')
                                                : 'bg-white/5 border-white/5 text-white/20 hover:bg-white/10'
                                                }`}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-10">
                            <button onClick={() => setEditingUser(null)}
                                className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-all border border-white/5 hover:bg-white/5">
                                Abort
                            </button>
                            <button onClick={saveUser} disabled={saving === editingUser.id}
                                className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-purple-500/20"
                                style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
                                {saving === editingUser.id ? 'Synchronizing...' : 'Authorize Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Purge */}
            {confirmDelete && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                    <div className="w-full max-w-sm rounded-3xl p-8 border border-red-500/30 bg-red-950/10 shadow-2xl shadow-red-500/10 text-center">
                        <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center mx-auto mb-6 text-red-500">
                            <Zap size={32} />
                        </div>
                        <h3 className="text-white font-display font-black text-xl mb-2">Purge Identity?</h3>
                        <p className="text-red-400/60 text-sm mb-8">This will permanently revoke all access tokens and destroy this entity's data records across the network. This action is irreversible.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDelete(null)}
                                className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/50 border border-white/10 hover:bg-white/5">
                                Cancel
                            </button>
                            <button onClick={() => handleDelete(confirmDelete)} disabled={!!saving}
                                className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white bg-red-600 hover:bg-red-500 transition-colors shadow-lg shadow-red-900/50">
                                Confirm Purge
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const PLAN_OPTIONS_CONSTANT = ['free', 'pro', 'enterprise']; // workaround for shadowing
const ROLE_OPTIONS_CONSTANT = ['user', 'moderator', 'admin', 'super_admin'];
const STATUS_OPTIONS_CONSTANT = ['active', 'banned'];

