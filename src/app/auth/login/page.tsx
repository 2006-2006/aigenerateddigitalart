'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import SpiritLogo from '@/components/ui/SpiritLogo';

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#06060f]"><div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" /></div>}>
            <LoginContent />
        </Suspense>
    );
}

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [pwVisible, setPwVisible] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true); setError('');
        const supabase = createClient();
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) { setError(err.message); setLoading(false); }
        else { router.push('/dashboard'); router.refresh(); }
    }

    return (
        <div className="min-h-screen flex overflow-hidden" style={{ background: '#06060f' }}>

            {/* ── LEFT PANEL: Animated showcase ── */}
            <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0d0520 0%, #160a30 50%, #0a1525 100%)' }}>

                {/* Animated orbs */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[
                        { w: 500, h: 500, x: '20%', y: '10%', c: 'rgba(124,58,237,0.18)', d: '0s', dur: '8s' },
                        { w: 400, h: 400, x: '55%', y: '40%', c: 'rgba(219,39,119,0.14)', d: '3s', dur: '10s' },
                        { w: 350, h: 350, x: '10%', y: '55%', c: 'rgba(14,165,233,0.12)', d: '1.5s', dur: '12s' },
                        { w: 250, h: 250, x: '70%', y: '5%', c: 'rgba(192,132,252,0.1)', d: '4s', dur: '9s' },
                    ].map((o, i) => (
                        <div key={i} className="absolute rounded-full"
                            style={{
                                width: o.w, height: o.h, left: o.x, top: o.y,
                                background: `radial-gradient(circle, ${o.c} 0%, transparent 70%)`,
                                animation: `orb-pulse ${o.dur} ${o.d} ease-in-out infinite`,
                                transform: 'translate(-50%,-50%)',
                            }} />
                    ))}
                    {/* Grid dots */}
                    <div className="absolute inset-0 opacity-20"
                        style={{ backgroundImage: 'radial-gradient(rgba(139,92,246,0.5) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                    {/* Diagonal light beam */}
                    <div className="absolute inset-0"
                        style={{ background: 'linear-gradient(135deg, transparent 40%, rgba(124,58,237,0.05) 60%, transparent 80%)' }} />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full p-14">
                    <SpiritLogo size={40} />

                    <div className="flex-1 flex flex-col justify-center max-w-md">
                        <div
                            style={{
                                opacity: mounted ? 1 : 0,
                                transform: mounted ? 'translateY(0)' : 'translateY(30px)',
                                transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s',
                            }}>
                            <h2 className="text-5xl font-display font-black text-white leading-[1.05] mb-6">
                                Create art that<br />
                                <span style={{ background: 'linear-gradient(135deg,#c084fc,#f472b6,#38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                    speaks volumes.
                                </span>
                            </h2>
                            <p className="text-white/40 text-lg leading-relaxed">
                                Join 50,000+ creators generating breathtaking AI artwork. Your imagination, amplified.
                            </p>
                        </div>

                        {/* Feature pills */}
                        <div className="flex flex-col gap-3 mt-12"
                            style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1) 0.3s' }}>
                            {[
                                { emoji: '✦', text: '10 free credits on signup' },
                                { emoji: '⚡', text: 'Advanced AI image generation' },
                                { emoji: '🔒', text: 'Private gallery & storage' },
                                { emoji: '🎨', text: 'HD & 4K resolution support' },
                            ].map(({ emoji, text }) => (
                                <div key={text} className="flex items-center gap-3">
                                    <span className="text-lg">{emoji}</span>
                                    <span className="text-white/55 text-sm">{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Floating art preview cards */}
                    <div className="flex gap-3 mt-auto"
                        style={{ opacity: mounted ? 1 : 0, transition: 'all 1s 0.5s ease' }}>
                        {[
                            { bg: 'linear-gradient(135deg,#1e0050,#7c3aed,#c084fc)', label: 'Nebula' },
                            { bg: 'linear-gradient(135deg,#052040,#0ea5e9,#38bdf8)', label: 'Ocean' },
                            { bg: 'linear-gradient(135deg,#200010,#db2777,#f472b6)', label: 'Bloom' },
                        ].map((card, i) => (
                            <div key={i} className="flex-1 h-24 rounded-2xl relative overflow-hidden"
                                style={{ background: card.bg, animation: `float ${6 + i * 2}s ${i * 0.8}s ease-in-out infinite` }}>
                                <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.15) 0%, transparent 60%)' }} />
                                <div className="absolute bottom-2 left-3 text-white/70 text-[10px] font-semibold uppercase tracking-widest">{card.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── RIGHT PANEL: Login form ── */}
            <div className="flex-1 lg:max-w-[520px] flex items-center justify-center p-8 relative"
                style={{ background: '#07070f' }}>

                {/* Background subtle glow */}
                <div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 70%)' }} />

                <div className="relative z-10 w-full max-w-sm"
                    style={{
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'translateX(0)' : 'translateX(40px)',
                        transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.15s',
                    }}>

                    {/* Mobile logo */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <SpiritLogo size={40} />
                    </div>

                    <div className="mb-10">
                        <h1 className="text-4xl font-display font-black text-white mb-2 tracking-tight">Welcome back</h1>
                        <p className="text-white/35 text-base">Sign in to continue your creative journey</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5" autoComplete="off">
                        {/* Email */}
                        <div className="space-y-2 group">
                            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-widest text-white/35 transition-colors duration-200 group-focus-within:text-purple-400">
                                Email address
                            </label>
                            <div className="relative">
                                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none z-10" />
                                <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="you@example.com" required autoComplete="off"
                                    className="auth-input w-full pl-11 pr-4 py-4 text-sm" />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2 group">
                            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-widest text-white/35 transition-colors duration-200 group-focus-within:text-purple-400">
                                Password
                            </label>
                            <div className="relative">
                                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none z-10" />
                                <input id="password"
                                    type={pwVisible ? 'text' : 'password'}
                                    value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="Your password" required autoComplete="new-password"
                                    className="auth-input w-full pl-11 pr-16 py-4 text-sm" />
                                <button type="button" onClick={() => setPwVisible(v => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold select-none transition-colors duration-200 px-1 z-10"
                                    style={{ color: pwVisible ? '#a78bfa' : 'rgba(255,255,255,0.3)' }}>
                                    {pwVisible ? 'HIDE' : 'SHOW'}
                                </button>
                            </div>
                            <div className="flex justify-end pr-1">
                                <Link href="/auth/forgot-password"
                                    className="text-[10px] font-bold text-white/20 hover:text-purple-400 transition-colors tracking-widest uppercase">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        {error && (
                            <div className="px-4 py-3.5 rounded-2xl text-red-300 text-sm flex items-start gap-2.5 animate-fade-in"
                                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                                <span className="flex-shrink-0 mt-px">⚠️</span> {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading}
                            className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2 overflow-hidden relative"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)', boxShadow: '0 0 30px rgba(124,58,237,0.35), 0 4px 20px rgba(0,0,0,0.3)' }}>
                            {/* Shimmer sweep */}
                            <span className="absolute inset-0 pointer-events-none"
                                style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)', animation: 'btn-shimmer 2.5s ease-in-out infinite' }} />
                            {loading
                                ? <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                                : <><Sparkles size={16} /> Sign In <ArrowRight size={15} className="ml-1" /></>}
                        </button>
                    </form>

                    {!searchParams.get('redirect')?.includes('/admin') && (
                        <div className="mt-8 pt-7 border-t text-center" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                            <p className="text-white/30 text-sm">
                                New to Spirit?{' '}
                                <Link href="/auth/signup" className="font-bold text-purple-400 hover:text-purple-300 transition-colors duration-200 underline-offset-2 hover:underline">
                                    Create free account →
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
