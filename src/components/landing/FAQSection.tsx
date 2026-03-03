'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
    { q: 'How does the credit system work?', a: 'Each image generation costs 1 credit. Free accounts start with 10 credits. Pro accounts get 500 credits per month. Credits reset monthly for paid plans. Unused credits do not roll over.' },
    { q: 'Which AI models can I use?', a: 'We support Groq (fastest inference, great for rapid prototyping), Gemini (Google\'s multimodal model, excellent for detailed imagery), and OpenRouter (access to FLUX, Stable Diffusion, and 50+ image models).' },
    { q: 'Can I use generated images commercially?', a: 'Pro and Enterprise plan users receive a full commercial license. Free plan images are for personal use only. Check our Terms of Service for full licensing details.' },
    { q: 'What image resolutions are supported?', a: 'We support 512×512, 768×768, 1024×1024, and 1024×1792 (portrait) and 1792×1024 (landscape). Pro and Enterprise plans unlock 4K ultra-HD resolution output.' },
    { q: 'Is my data private and secure?', a: 'Absolutely. All images are stored in your private Supabase Storage bucket with row-level security. Only you can access your images unless you choose to make them public in the gallery.' },
    { q: 'How do I get started?', a: 'Sign up for a free account — no credit card required. You\'ll get 10 free credits instantly. Head to the dashboard, enter a prompt, pick a model, and generate your first masterpiece in seconds.' },
];

export default function FAQSection() {
    const [open, setOpen] = useState<number | null>(0);

    return (
        <section id="faq" className="relative py-32 overflow-hidden" style={{ background: '#07070f' }}>
            <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(99,102,241,0.07) 0%, transparent 70%)' }} />

            <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
                        style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#c084fc' }}>
                        FAQ
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-display font-black text-white mb-4">
                        Got{' '}
                        <span style={{ background: 'linear-gradient(135deg, #a78bfa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                            Questions?
                        </span>
                    </h2>
                    <p className="text-white/40">Everything you need to know about Spirit AI.</p>
                </div>

                {/* Accordion */}
                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <div key={i}
                            className="rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer group"
                            style={{
                                background: open === i ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.03)',
                                border: open === i ? '1px solid rgba(139,92,246,0.35)' : '1px solid rgba(255,255,255,0.06)',
                                boxShadow: open === i ? '0 0 30px rgba(139,92,246,0.1)' : 'none',
                            }}
                            onClick={() => setOpen(open === i ? null : i)}>

                            <div className="flex items-center justify-between px-6 py-5">
                                <span className={`font-semibold text-sm sm:text-base transition-colors duration-200 ${open === i ? 'text-purple-200' : 'text-white/80 group-hover:text-white'}`}>
                                    {faq.q}
                                </span>
                                <ChevronDown size={18}
                                    className={`flex-shrink-0 ml-4 transition-all duration-300 ${open === i ? 'rotate-180 text-purple-400' : 'text-white/30 group-hover:text-white/50'}`} />
                            </div>

                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${open === i ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <p className="px-6 pb-5 text-sm leading-relaxed text-white/50">{faq.a}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
