'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { ArrowRight, Sparkles, Zap, ChevronDown, Star } from 'lucide-react';

export default function HeroSection() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();

        const stars: { x: number; y: number; r: number; speed: number; opacity: number; pulse: number; color: string }[] = [];
        const colors = ['168,85,247', '236,72,153', '56,189,248', '192,132,252'];

        for (let i = 0; i < 200; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 1.6 + 0.2,
                speed: Math.random() * 0.25 + 0.05,
                opacity: Math.random() * 0.7 + 0.2,
                pulse: Math.random() * Math.PI * 2,
                color: colors[Math.floor(Math.random() * colors.length)],
            });
        }

        let animId: number;
        function draw() {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            stars.forEach(star => {
                star.pulse += 0.018;
                const opacity = star.opacity * (0.6 + 0.4 * Math.sin(star.pulse));
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${star.color}, ${opacity})`;
                ctx.fill();
                star.y -= star.speed;
                if (star.y < -5) { star.y = canvas.height + 5; star.x = Math.random() * canvas.width; }
            });
            animId = requestAnimationFrame(draw);
        }
        draw();

        window.addEventListener('resize', resize);
        return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
    }, []);

    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
            <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

            {/* Background */}
            <div className="absolute inset-0 z-0" style={{
                background: 'radial-gradient(ellipse 90% 70% at 50% -5%, rgba(99,60,180,0.4) 0%, transparent 65%), radial-gradient(ellipse 60% 40% at 85% 80%, rgba(236,72,153,0.12) 0%, transparent 60%), #07070f',
            }} />

            {/* Glowing orbs */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)' }} />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)' }} />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-24">

                {/* Review stars badge */}
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full mb-10"
                    style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(12px)',
                    }}>
                    <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={11} className="fill-yellow-400 text-yellow-400" />)}
                    </div>
                    <span className="text-sm text-white/60 font-medium">Trusted by 50,000+ creators</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                </div>

                {/* Headline */}
                <h1 className="font-display font-black leading-[0.88] mb-8 tracking-tight">
                    <span className="block text-white text-6xl sm:text-7xl md:text-8xl xl:text-[6rem] drop-shadow-2xl">
                        Generate
                    </span>
                    <span className="block text-6xl sm:text-7xl md:text-8xl xl:text-[6rem]"
                        style={{
                            background: 'linear-gradient(135deg, #c084fc 0%, #f472b6 45%, #38bdf8 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            filter: 'drop-shadow(0 0 50px rgba(192,132,252,0.45))',
                        }}>
                        Breathtaking
                    </span>
                    <span className="block text-white text-6xl sm:text-7xl md:text-8xl xl:text-[6rem]">
                        AI Artwork
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="text-white/45 text-lg sm:text-xl max-w-xl mx-auto mb-12 leading-relaxed font-light">
                    Transform your imagination into stunning digital masterpieces.
                    <span className="text-white/65"> Fast, beautiful, and endlessly creative.</span>
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-slide-up">
                    <Link href="/auth/signup"
                        className="group relative flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white text-base overflow-hidden transition-all duration-300 hover:scale-105 hover:brightness-110"
                        style={{
                            background: 'linear-gradient(135deg, #7c3aed, #db2777)',
                            boxShadow: '0 0 40px rgba(124,58,237,0.45), 0 0 70px rgba(219,39,119,0.15)',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 60px rgba(124,58,237,0.7), 0 0 100px rgba(219,39,119,0.3)')}
                        onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 40px rgba(124,58,237,0.45), 0 0 70px rgba(219,39,119,0.15)')}>
                        <Zap size={18} className="flex-shrink-0" />
                        Start Creating Free
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                    </Link>

                    <a href="#gallery"
                        className="group flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-white/70 text-base transition-all duration-300 hover:scale-105 hover:text-white"
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(12px)',
                        }}>
                        <Sparkles size={16} />
                        Explore Gallery
                    </a>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-center gap-0 mt-4">
                    {[
                        { value: '50K+', label: 'Artworks Created', color: '#c084fc', glow: 'rgba(192,132,252,0.5)' },
                        { value: '✦ 10', label: 'Free Credits', color: '#f472b6', glow: 'rgba(244,114,182,0.5)' },
                        { value: '4K', label: 'Max Resolution', color: '#38bdf8', glow: 'rgba(56,189,248,0.5)' },
                    ].map(({ value, label, color, glow }, i) => (
                        <div key={label} className="text-center px-8 sm:px-14 py-3"
                            style={{ borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.15)' : 'none' }}>
                            <div style={{
                                fontSize: '3.5rem',
                                fontWeight: 900,
                                lineHeight: 1,
                                marginBottom: '0.5rem',
                                color: color,
                                textShadow: `0 0 40px ${glow}, 0 0 80px ${glow}`,
                                fontFamily: '"Space Grotesk", sans-serif',
                                letterSpacing: '-0.02em',
                            }}>{value}</div>
                            <div style={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                letterSpacing: '0.15em',
                                textTransform: 'uppercase',
                                color: 'rgba(255,255,255,0.65)',
                            }}>{label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Scroll hint */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/20 z-10">
                <span className="text-[10px] uppercase tracking-widest">Scroll</span>
                <ChevronDown size={16} className="animate-bounce" />
            </div>

            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-40 z-10 pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, transparent, #07070f)' }} />
        </section>
    );
}
