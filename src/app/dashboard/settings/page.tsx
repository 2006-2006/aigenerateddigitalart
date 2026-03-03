'use client';

import { useState, useEffect } from 'react';
import { Lock, ArrowRight, Sparkles, CheckCircle, ShieldCheck, User as UserIcon, Settings as SettingsIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SettingsPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [pwVisible, setPwVisible] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const supabase = createClient();
        async function fetchUser() {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();

                // Construct a safe object to avoid spread-type errors with potentially null values
                const combinedUser = Object.assign({}, authUser, profile || {});
                setUser(combinedUser);
            }
        }
        fetchUser();
    }, []);

    async function handleUpdatePassword(e: React.FormEvent) {
        e.preventDefault();

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        setError('');

        const supabase = createClient();
        const { error: err } = await supabase.auth.updateUser({ password });

        if (err) {
            setError(err.message);
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
            setPassword('');
            setConfirmPassword('');
            setTimeout(() => setSuccess(false), 5000);
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-12">
            <header className="mb-12">
                <div className="flex items-center gap-3 text-white/40 text-xs font-bold uppercase tracking-[0.2em] mb-4 group cursor-default">
                    <SettingsIcon size={14} className="group-hover:rotate-90 transition-transform duration-500" />
                    <span>User Preferences</span>
                </div>
                <h1 className="text-4xl font-display font-black text-white relative inline-block">
                    Account Settings
                    <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                </h1>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Profile Section */}
                <section className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                        <UserIcon size={120} className="text-white" />
                    </div>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-purple-500/20 transition-transform group-hover:scale-110 duration-500">
                            {user?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white mb-1">{user?.full_name || 'Spirit Explorer'}</h2>
                            <p className="text-white/40 text-sm font-medium">{user?.email}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-white/[0.03] border border-white/[0.05] rounded-2xl hover:bg-white/[0.05] transition-colors">
                            <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Account Status</span>
                            <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase rounded-full">Active</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-white/[0.03] border border-white/[0.05] rounded-2xl hover:bg-white/[0.05] transition-colors">
                            <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Pricing Plan</span>
                            <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase rounded-full">{user?.plan || 'Free'}</span>
                        </div>
                    </div>
                </section>

                {/* Change Password Section */}
                <section className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden h-fit">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                            <ShieldCheck size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Security Credentials</h2>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="space-y-6">
                        <div className="space-y-2 group">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1 transition-colors group-focus-within:text-purple-400">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none transition-colors group-focus-within:text-purple-400/50" />
                                <input type={pwVisible ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="Min 6 characters" required
                                    className="w-full pl-12 pr-16 py-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-white text-sm outline-none transition-all focus:bg-white/[0.06] focus:border-purple-500/50 placeholder:text-white/10" />
                                <button type="button" onClick={() => setPwVisible(v => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-white/30 hover:text-white transition-colors">
                                    {pwVisible ? 'HIDE' : 'SHOW'}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 group">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1 transition-colors group-focus-within:text-purple-400">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none transition-colors group-focus-within:text-purple-400/50" />
                                <input type={pwVisible ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                    placeholder="Repeat password" required
                                    className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-white text-sm outline-none transition-all focus:bg-white/[0.06] focus:border-purple-500/50 placeholder:text-white/10" />
                            </div>
                        </div>

                        {error && (
                            <div className="px-4 py-3.5 rounded-2xl text-red-300 text-xs flex items-center gap-2.5 animate-fade-in"
                                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        {success && (
                            <div className="px-4 py-3.5 rounded-2xl text-green-300 text-xs flex items-center gap-2.5 animate-fade-in"
                                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                                <CheckCircle size={14} /> Password updated successfully!
                            </div>
                        )}

                        <button type="submit" disabled={loading}
                            className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 overflow-hidden relative group"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)', boxShadow: '0 0 30px rgba(124,58,237,0.3)' }}>
                            <span className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            {loading
                                ? <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                                : <><Sparkles size={16} /> Save Changes <ArrowRight size={15} /></>}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}
