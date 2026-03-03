import Link from 'next/link';
import { Zap, Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-dark-200 bg-mesh grid-dots flex items-center justify-center p-4">
            <div className="text-center max-w-lg">
                {/* 404 Display */}
                <div className="relative mb-8">
                    <span className="text-[160px] font-display font-black leading-none select-none"
                        style={{
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(217,70,239,0.15))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        404
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-neon-purple">
                            <Zap size={36} className="text-white" />
                        </div>
                    </div>
                </div>

                <h1 className="text-3xl font-display font-bold text-white mb-3">
                    Page Not Found
                </h1>
                <p className="text-white/50 mb-8">
                    This dimension doesn&apos;t exist in our universe. Let&apos;s get you back to reality.
                </p>

                <div className="flex items-center justify-center gap-4">
                    <Link href="/" className="btn-primary px-8 py-3">
                        <Home size={16} />
                        Go Home
                    </Link>
                    <Link href="/dashboard" className="btn-secondary px-8 py-3">
                        Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
