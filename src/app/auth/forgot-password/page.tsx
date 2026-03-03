'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, Sparkles, CheckCircle, ChevronLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import SpiritLogo from '@/components/ui/SpiritLogo';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    async function handleResetRequest(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const supabase = createClient();
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
        });

        if (err) {
            setError(err.message);
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
        }
    }

    if (success) return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#06060f' }}>
            <div className="text-center max-w-md animate-fade-in">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)', boxShadow: '0 0 40px rgba(124,58,237,0.4)' }}>
                    <CheckCircle size={36} className="text-white" />
                </div>
                <h2 className="text-3xl font-display font-black text-white mb-3">Check your inbox</h2>
                <p className="text-white/50 mb-8 leading-relaxed">
                    We've sent a password reset link to <span className="text-purple-400 font-semibold">{email}</span>. Please click the link to reset your password.
                </p>
                <Link href="/auth/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-white text-sm transition-all hover:scale-105"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <ChevronLeft size={16} /> Back to Sign In
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#06060f' }}>
            <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,58,237,0.1) 0%, transparent 70%)' }} />

            <div className="relative z-10 w-full max-w-sm"
                style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
                }}>

                <div className="flex justify-center mb-10">
                    <SpiritLogo size={42} />
                </div>

                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-display font-black text-white mb-3 tracking-tight">Reset password</h1>
                    <p className="text-white/35 text-sm px-4">Enter your email address and we'll send you a link to reset your password.</p>
                </div>

                <form onSubmit={handleResetRequest} className="space-y-6">
                    <div className="space-y-2 group">
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1 transition-colors group-focus-within:text-purple-400">
                            Email address
                        </label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none transition-colors group-focus-within:text-purple-400/50" />
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="you@example.com" required
                                className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-white text-sm outline-none transition-all focus:bg-white/[0.06] focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 placeholder:text-white/10" />
                        </div>
                    </div>

                    {error && (
                        <div className="px-4 py-3.5 rounded-2xl text-red-300 text-xs flex items-center gap-2.5 animate-fade-in"
                            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <button type="submit" disabled={loading}
                        className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 overflow-hidden relative group"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)', boxShadow: '0 0 30px rgba(124,58,237,0.3)' }}>
                        <span className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        {loading
                            ? <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                            : <><Sparkles size={16} /> Send Reset Link <ArrowRight size={15} /></>}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <Link href="/auth/login" className="text-white/30 text-xs font-semibold hover:text-white transition-colors flex items-center justify-center gap-2">
                        <ChevronLeft size={14} /> Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}
