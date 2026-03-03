'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Lock, User, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import SpiritLogo from '@/components/ui/SpiritLogo';

export default function SignupPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [pwVisible, setPwVisible] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : password.length < 14 ? 3 : 4;
    const strengthColors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];
    const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

    async function handleSignup(e: React.FormEvent) {
        e.preventDefault();
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
        setLoading(true); setError('');
        const supabase = createClient();
        const { error: err } = await supabase.auth.signUp({
            email, password,
            options: { data: { full_name: fullName }, emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (err) { setError(err.message); setLoading(false); }
        else setSuccess(true);
    }

    const inputStyle = {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.09)',
    };

    const focusStyle = {
        borderColor: 'rgba(167,139,250,0.6)',
        background: 'rgba(255,255,255,0.07)',
        boxShadow: '0 0 0 3px rgba(124,58,237,0.12)',
    };

    if (success) return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#06060f' }}>
            <div className="text-center max-w-md"
                style={{ opacity: 1, animation: 'none' }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ background: 'linear-gradient(135deg,#7c3aed,#10b981)', boxShadow: '0 0 40px rgba(16,185,129,0.4)' }}>
                    <CheckCircle size={36} className="text-white" />
                </div>
                <h2 className="text-3xl font-display font-black text-white mb-3">Check your email!</h2>
                <p className="text-white/50 mb-2">We sent a confirmation link to</p>
                <p className="text-purple-400 font-semibold mb-8">{email}</p>
                <p className="text-white/30 text-sm">Click the link in your email to activate your account and get your 10 free credits.</p>
                <Link href="/auth/login" className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-2xl font-semibold text-white text-sm transition-all hover:scale-105"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    ← Back to Sign In
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex overflow-hidden" style={{ background: '#06060f' }}>

            {/* LEFT PANEL */}
            <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0d0520 0%, #160a30 50%, #0a1525 100%)' }}>

                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[
                        { w: 500, h: 500, x: '15%', y: '5%', c: 'rgba(124,58,237,0.18)', d: '0s', dur: '8s' },
                        { w: 380, h: 380, x: '65%', y: '45%', c: 'rgba(219,39,119,0.14)', d: '2s', dur: '11s' },
                        { w: 320, h: 320, x: '8%', y: '60%', c: 'rgba(14,165,233,0.12)', d: '1s', dur: '13s' },
                        { w: 200, h: 200, x: '75%', y: '8%', c: 'rgba(192,132,252,0.1)', d: '3.5s', dur: '9s' },
                    ].map((o, i) => (
                        <div key={i} className="absolute rounded-full"
                            style={{ width: o.w, height: o.h, left: o.x, top: o.y, background: `radial-gradient(circle, ${o.c} 0%, transparent 70%)`, animation: `orb-pulse ${o.dur} ${o.d} ease-in-out infinite`, transform: 'translate(-50%,-50%)' }} />
                    ))}
                    <div className="absolute inset-0 opacity-15"
                        style={{ backgroundImage: 'radial-gradient(rgba(139,92,246,0.5) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                </div>

                <div className="relative z-10 flex flex-col h-full p-14">
                    <SpiritLogo size={40} />

                    <div className="flex-1 flex flex-col justify-center max-w-md"
                        style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s' }}>
                        <h2 className="text-5xl font-display font-black text-white leading-[1.05] mb-6">
                            Start creating<br />
                            <span style={{ background: 'linear-gradient(135deg,#c084fc,#f472b6,#38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                for free today.
                            </span>
                        </h2>
                        <p className="text-white/40 text-lg leading-relaxed mb-12">
                            Get 10 free credits instantly. No credit card required. Generate stunning AI art in seconds.
                        </p>

                        <div className="flex flex-col gap-4">
                            {[
                                { num: '01', title: 'Create your account', desc: 'Sign up in under 30 seconds' },
                                { num: '02', title: 'Get 10 free credits', desc: 'Instantly credited on signup' },
                                { num: '03', title: 'Generate AI art', desc: 'HD & 4K quality images' },
                            ].map(({ num, title, desc }) => (
                                <div key={num} className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0"
                                        style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', color: '#c084fc' }}>{num}</div>
                                    <div>
                                        <p className="text-white font-semibold text-sm">{title}</p>
                                        <p className="text-white/35 text-xs">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto pt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                        <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                                style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>Y</div>
                            <div>
                                <p className="text-white text-sm font-semibold">Yogesh and team</p>
                                <p className="text-white/35 text-xs">Built with ❤️ — Spirit AI</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="flex-1 lg:max-w-[520px] flex items-center justify-center p-8 relative"
                style={{ background: '#07070f' }}>
                <div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 70%)' }} />

                <div className="relative z-10 w-full max-w-sm"
                    style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateX(0)' : 'translateX(40px)', transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.15s' }}>

                    <div className="lg:hidden flex justify-center mb-8"><SpiritLogo size={40} /></div>

                    <div className="mb-8">
                        <h1 className="text-4xl font-display font-black text-white mb-2 tracking-tight">Create account</h1>
                        <p className="text-white/35 text-base">Start with 10 free credits — no card needed</p>
                    </div>

                    {/* Features row */}
                    <div className="flex gap-2 mb-8 flex-wrap">
                        {['✦ 10 Free Credits', '⚡ Instant Access', '🔒 Private Gallery'].map(f => (
                            <span key={f} className="text-xs px-3 py-1.5 rounded-full font-medium text-purple-300"
                                style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)' }}>{f}</span>
                        ))}
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold uppercase tracking-widest text-white/35">Full Name</label>
                            <div className="relative">
                                <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                                    placeholder="Your name" required
                                    className="w-full pl-11 pr-4 py-4 rounded-2xl text-white text-sm outline-none transition-all duration-300 placeholder-white/20"
                                    style={inputStyle}
                                    onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                                    onBlur={e => Object.assign(e.currentTarget.style, inputStyle)} />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold uppercase tracking-widest text-white/35">Email</label>
                            <div className="relative">
                                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="you@example.com" required autoComplete="email"
                                    className="w-full pl-11 pr-4 py-4 rounded-2xl text-white text-sm outline-none transition-all duration-300 placeholder-white/20"
                                    style={inputStyle}
                                    onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                                    onBlur={e => Object.assign(e.currentTarget.style, inputStyle)} />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold uppercase tracking-widest text-white/35">Password</label>
                            <div className="relative">
                                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                                <input type={pwVisible ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="Min 6 characters" required autoComplete="new-password"
                                    className="w-full pl-11 pr-16 py-4 rounded-2xl text-white text-sm outline-none transition-all duration-300 placeholder-white/20"
                                    style={inputStyle}
                                    onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                                    onBlur={e => Object.assign(e.currentTarget.style, inputStyle)} />
                                <button type="button" onClick={() => setPwVisible(v => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold select-none transition-colors duration-200"
                                    style={{ color: pwVisible ? '#a78bfa' : 'rgba(255,255,255,0.3)' }}>
                                    {pwVisible ? 'HIDE' : 'SHOW'}
                                </button>
                            </div>
                            {/* Strength meter */}
                            {password.length > 0 && (
                                <div className="flex items-center gap-2 mt-1.5">
                                    <div className="flex gap-1 flex-1">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                                                style={{ background: i <= strength ? strengthColors[strength] : 'rgba(255,255,255,0.1)' }} />
                                        ))}
                                    </div>
                                    <span className="text-xs font-medium" style={{ color: strengthColors[strength] }}>
                                        {strengthLabels[strength]}
                                    </span>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="px-4 py-3.5 rounded-2xl text-red-300 text-sm flex items-start gap-2.5"
                                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                                <span className="flex-shrink-0 mt-px">⚠️</span> {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading}
                            className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden relative"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)', boxShadow: '0 0 30px rgba(124,58,237,0.35), 0 4px 20px rgba(0,0,0,0.3)' }}>
                            <span className="absolute inset-0 pointer-events-none"
                                style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)', animation: 'btn-shimmer 2.5s ease-in-out infinite' }} />
                            {loading
                                ? <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                                : <><Sparkles size={16} /> Create Account <ArrowRight size={15} className="ml-1" /></>}
                        </button>

                        <p className="text-white/20 text-xs text-center pt-1">
                            By signing up you agree to our Terms of Service and Privacy Policy
                        </p>
                    </form>

                    <div className="mt-7 pt-6 border-t text-center" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                        <p className="text-white/30 text-sm">
                            Already have an account?{' '}
                            <Link href="/auth/login" className="font-bold text-purple-400 hover:text-purple-300 transition-colors duration-200 underline-offset-2 hover:underline">
                                Sign in →
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
