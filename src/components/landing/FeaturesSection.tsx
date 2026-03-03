'use client';

import { Sparkles, Zap, Shield, Palette, Globe, Clock } from 'lucide-react';

const features = [
    {
        icon: Sparkles,
        title: 'Multi-Model AI',
        description: 'Access Groq, Gemini, and OpenRouter models. Pick the perfect model for every creative vision.',
        gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)',
        glow: 'rgba(124,58,237,0.4)',
        border: 'rgba(124,58,237,0.3)',
    },
    {
        icon: Zap,
        title: 'Lightning Fast',
        description: "Groq's ultra-fast inference engine delivers stunning artwork in seconds, not minutes.",
        gradient: 'linear-gradient(135deg, #d97706, #f59e0b)',
        glow: 'rgba(217,119,6,0.4)',
        border: 'rgba(217,119,6,0.3)',
    },
    {
        icon: Shield,
        title: 'Secure & Private',
        description: 'Supabase-backed storage with row-level security. Your creations belong to you, always.',
        gradient: 'linear-gradient(135deg, #059669, #10b981)',
        glow: 'rgba(5,150,105,0.4)',
        border: 'rgba(5,150,105,0.3)',
    },
    {
        icon: Palette,
        title: 'Full Creative Control',
        description: 'Custom prompts, negative prompts, resolution control, and model selection — unlimited freedom.',
        gradient: 'linear-gradient(135deg, #db2777, #ec4899)',
        glow: 'rgba(219,39,119,0.4)',
        border: 'rgba(219,39,119,0.3)',
    },
    {
        icon: Globe,
        title: 'Community Gallery',
        description: 'Publish your best work to the global gallery. Discover and get inspired by thousands of masterpieces.',
        gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)',
        glow: 'rgba(8,145,178,0.4)',
        border: 'rgba(8,145,178,0.3)',
    },
    {
        icon: Clock,
        title: 'Full History',
        description: 'Every creation is stored permanently. Access, download, and share your artworks anytime.',
        gradient: 'linear-gradient(135deg, #6366f1, #818cf8)',
        glow: 'rgba(99,102,241,0.4)',
        border: 'rgba(99,102,241,0.3)',
    },
];

export default function FeaturesSection() {
    return (
        <section id="features" className="relative py-32 overflow-hidden"
            style={{ background: 'linear-gradient(180deg, #07070f 0%, #0d0d1f 50%, #07070f 100%)' }}>

            {/* Subtle grid lines */}
            <div className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                    backgroundImage: 'linear-gradient(rgba(139,92,246,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.1) 1px, transparent 1px)',
                    backgroundSize: '64px 64px',
                }} />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
                        style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#c084fc' }}>
                        <Sparkles size={11} /> Features
                    </div>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-black text-white mb-5 leading-tight">
                        Everything You Need<br />
                        <span style={{ background: 'linear-gradient(135deg, #a78bfa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                            to Create
                        </span>
                    </h2>
                    <p className="text-white/40 text-lg max-w-xl mx-auto leading-relaxed">
                        A complete AI art studio with professional-grade tools, built for creators who demand the absolute best.
                    </p>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {features.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <div key={feature.title}
                                className="group relative p-6 rounded-2xl cursor-default transition-all duration-500 hover:-translate-y-1"
                                style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${feature.border}`,
                                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                                }}>

                                {/* Icon */}
                                <div className="relative mb-5">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                                        style={{ background: feature.gradient, boxShadow: `0 0 20px ${feature.glow}` }}>
                                        <Icon size={22} className="text-white" />
                                    </div>
                                    {/* Glow halo */}
                                    <div className="absolute inset-0 w-12 h-12 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                                        style={{ background: feature.gradient }} />
                                </div>

                                <h3 className="text-white font-bold text-lg mb-2 group-hover:text-purple-200 transition-colors duration-300">
                                    {feature.title}
                                </h3>
                                <p className="text-white/40 text-sm leading-relaxed group-hover:text-white/50 transition-colors duration-300">
                                    {feature.description}
                                </p>

                                {/* Hover glow overlay */}
                                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                    style={{ background: `radial-gradient(circle at 30% 30%, ${feature.glow.replace('0.4', '0.05')} 0%, transparent 60%)` }} />
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
