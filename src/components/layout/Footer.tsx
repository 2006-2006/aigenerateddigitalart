'use client';

import Link from 'next/link';
import SpiritLogo from '@/components/ui/SpiritLogo';

export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-dark-300/50 backdrop-blur-sm">
            <div className="section-wrapper py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <SpiritLogo size={32} />
                        </Link>
                        <p className="text-white/50 text-sm leading-relaxed max-w-xs">
                            The most powerful AI art generation platform. Create breathtaking digital artwork with cutting-edge models.
                        </p>

                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Product</h4>
                        <ul className="space-y-3">
                            {['Features', 'Pricing', 'Gallery', 'Changelog'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-white/50 hover:text-white text-sm transition-colors duration-200">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Legal</h4>
                        <ul className="space-y-3">
                            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-white/50 hover:text-white text-sm transition-colors duration-200">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-white/30 text-sm">
                        © 2026 Spirit AI. All rights reserved.
                    </p>
                    <p className="text-white/30 text-sm">
                        Built by Yogesh and team ❤️
                    </p>
                </div>
            </div>
        </footer>
    );
}
