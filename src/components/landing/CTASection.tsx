'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CTASection() {
    return (
        <section className="relative py-20 overflow-hidden" style={{ background: '#07070f' }}>
            {/* Stars */}
            <div className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(rgba(168,85,247,0.6) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    opacity: 0.15,
                }} />

            {/* Radial glows */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full blur-3xl"
                    style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, rgba(219,39,119,0.08) 60%, transparent 100%)' }} />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-8"
                    style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#c084fc' }}>
                    <Sparkles size={11} />
                    Limited Free Credits
                </div>

                {/* Headline */}
                <h2 className="text-5xl sm:text-6xl md:text-7xl font-display font-black text-white leading-tight mb-6">
                    Your next masterpiece<br />
                    <span style={{ background: 'linear-gradient(135deg, #c084fc 0%, #f472b6 50%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                        starts now.
                    </span>
                </h2>

                <p className="text-white/40 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
                    Join thousands of creators generating stunning AI artwork. No credit card required — 10 free credits on signup.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/auth/signup"
                        className="group flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-white text-base transition-all duration-300 hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)', boxShadow: '0 0 40px rgba(124,58,237,0.4), 0 0 80px rgba(219,39,119,0.2)' }}>
                        <Sparkles size={18} />
                        Get Started Free
                        <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link href="#pricing"
                        className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white/70 text-base hover:text-white transition-all duration-300 hover:scale-105"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        View Pricing
                    </Link>
                </div>

                <p className="text-white/20 text-xs mt-8 tracking-wide">
                    No credit card · Cancel anytime · 10 free credits instant
                </p>
            </div>
        </section>
    );
}
