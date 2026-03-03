'use client';

import { Check, Zap, Crown, Building2, Sparkles } from 'lucide-react';
import Link from 'next/link';

const plans = [
    {
        name: 'Free',
        price: '$0',
        period: 'forever',
        description: 'Perfect for getting started',
        icon: Zap,
        gradient: 'linear-gradient(135deg, #6366f1, #818cf8)',
        glow: 'rgba(99,102,241,0.3)',
        border: 'rgba(99,102,241,0.25)',
        credits: '10',
        features: ['10 one-time credits', '3 AI providers', 'Standard resolution (512–1024px)', 'Personal gallery', 'Community support'],
        cta: 'Start Free',
        href: '/auth/signup',
        popular: false,
    },
    {
        name: 'Pro',
        price: '$19',
        period: 'per month',
        description: 'For serious creators',
        icon: Crown,
        gradient: 'linear-gradient(135deg, #7c3aed, #db2777)',
        glow: 'rgba(124,58,237,0.5)',
        border: 'rgba(124,58,237,0.4)',
        credits: '500',
        features: ['500 credits / month', 'All AI models', 'HD & 4K resolution', 'Private gallery', 'Priority generation', 'Commercial license', 'Priority support'],
        cta: 'Go Pro',
        href: '/auth/signup?plan=pro',
        popular: true,
    },
    {
        name: 'Enterprise',
        price: '$79',
        period: 'per month',
        description: 'For teams & studios',
        icon: Building2,
        gradient: 'linear-gradient(135deg, #0891b2, #7c3aed)',
        glow: 'rgba(8,145,178,0.3)',
        border: 'rgba(8,145,178,0.25)',
        credits: '∞',
        features: ['Unlimited credits', 'All AI models', 'Ultra HD resolution', 'Team collaboration', 'REST API access', 'Custom fine-tuned models', 'Dedicated support + SLA'],
        cta: 'Contact Sales',
        href: 'mailto:suryad089@rmkcet.ac.in?subject=Spirit%20AI%20Enterprise%20Plan&body=Hi%2C%20I%27m%20interested%20in%20the%20Spirit%20AI%20Enterprise%20plan.',
        isExternal: true,
        popular: false,
    },
];

export default function PricingSection() {
    return (
        <section id="pricing" className="relative py-16 overflow-hidden"
            style={{ background: '#07070f' }}>

            <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(124,58,237,0.12) 0%, transparent 70%)' }} />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
                        style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#c084fc' }}>
                        <Crown size={11} /> Pricing
                    </div>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-black text-white mb-5 leading-tight">
                        Simple,{' '}
                        <span style={{ background: 'linear-gradient(135deg, #a78bfa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                            Transparent
                        </span>{' '}
                        Pricing
                    </h2>
                    <p className="text-white/40 text-lg max-w-xl mx-auto">
                        Start free and scale as you create. No hidden fees, no surprises.
                    </p>
                </div>

                {/* Plans */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
                    {plans.map((plan) => {
                        const Icon = plan.icon;
                        return (
                            <div key={plan.name}
                                className={`relative rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 ${plan.popular ? 'md:-translate-y-4' : ''}`}
                                style={{
                                    background: plan.popular
                                        ? 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(219,39,119,0.15))'
                                        : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${plan.border}`,
                                    boxShadow: plan.popular ? `0 0 60px ${plan.glow}, 0 0 120px rgba(124,58,237,0.1)` : `0 0 20px rgba(0,0,0,0.3)`,
                                }}>

                                {/* Popular ribbon */}
                                {plan.popular && (
                                    <div className="absolute top-0 left-0 right-0 py-2 text-center text-xs font-bold uppercase tracking-widest text-white"
                                        style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
                                        <Sparkles size={10} className="inline mr-1" />
                                        Most Popular
                                    </div>
                                )}

                                <div className={`p-8 ${plan.popular ? 'pt-12' : ''}`}>
                                    {/* Icon + name */}
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                            style={{ background: plan.gradient, boxShadow: `0 0 16px ${plan.glow}` }}>
                                            <Icon size={18} className="text-white" />
                                        </div>
                                        <div>
                                            <div className="text-white font-bold text-lg leading-none">{plan.name}</div>
                                            <div className="text-white/40 text-xs mt-0.5">{plan.description}</div>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="mb-2">
                                        <span className="text-5xl font-display font-black text-white">{plan.price}</span>
                                        <span className="text-white/30 text-sm ml-2">/{plan.period}</span>
                                    </div>

                                    {/* Credits badge */}
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-7"
                                        style={{ background: `${plan.glow.replace('0.3', '0.15').replace('0.5', '0.15')}`, border: `1px solid ${plan.border}`, color: '#e2e8f0' }}>
                                        <Zap size={10} />
                                        {plan.credits} credits{plan.credits !== '∞' ? '/mo' : ''}
                                    </div>

                                    {/* Features */}
                                    <ul className="space-y-3 mb-8">
                                        {plan.features.map((f) => (
                                            <li key={f} className="flex items-start gap-3 text-sm">
                                                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                                    style={{ background: plan.gradient }}>
                                                    <Check size={9} className="text-white" />
                                                </div>
                                                <span className="text-white/60">{f}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA */}
                                    <Link href={plan.href}
                                        className="block w-full py-3.5 rounded-2xl font-semibold text-center text-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                                        style={plan.popular
                                            ? { background: plan.gradient, color: 'white', boxShadow: `0 0 20px ${plan.glow}` }
                                            : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: `1px solid ${plan.border}` }}>
                                        {plan.cta}
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
