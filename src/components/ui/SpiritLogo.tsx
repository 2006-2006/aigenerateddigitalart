'use client';

interface SpiritLogoProps {
    size?: number;
    showText?: boolean;
    className?: string;
}

export default function SpiritLogo({ size = 36, showText = true, className = '' }: SpiritLogoProps) {
    const id = `sg${size}`;
    return (
        <div className={`flex items-center gap-2.5 ${className}`} style={{ userSelect: 'none', display: 'inline-flex', alignItems: 'center' }}>
            <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                <defs>
                    <linearGradient id={`${id}bg`} x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="55%" stopColor="#db2777" />
                        <stop offset="100%" stopColor="#0ea5e9" />
                    </linearGradient>
                    <linearGradient id={`${id}s`} x1="10" y1="8" x2="34" y2="36" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="#f0abfc" stopOpacity="0.9" />
                    </linearGradient>
                    <filter id={`${id}glow`} x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="2.5" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    <filter id={`${id}shadow`}>
                        <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#7c3aed" floodOpacity="0.5" />
                    </filter>
                </defs>
                <rect x="0" y="0" width="44" height="44" rx="13" fill={`url(#${id}bg)`} filter={`url(#${id}shadow)`} />
                <rect x="0" y="0" width="44" height="44" rx="13" fill="white" opacity="0.07" />
                <rect x="0.75" y="0.75" width="42.5" height="42.5" rx="12.3" fill="none" stroke="white" strokeWidth="0.8" opacity="0.25" />
                <g filter={`url(#${id}glow)`}>
                    <path
                        d="M 28 11 C 20 9, 13 13, 14 19 C 15 24, 29 21, 30 27 C 31 33, 23 36, 16 34"
                        stroke={`url(#${id}s)`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        fill="none"
                    />
                    <circle cx="29" cy="11" r="2.5" fill="white" opacity="0.9" />
                    <circle cx="15" cy="34" r="2.5" fill="#bfdbfe" opacity="0.85" />
                </g>
            </svg>

            {showText && (
                <span style={{
                    fontFamily: '"Space Grotesk", system-ui, sans-serif',
                    fontWeight: 800,
                    fontSize: `${size * 0.52}px`,
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                    background: 'linear-gradient(135deg, #c084fc 0%, #f472b6 55%, #38bdf8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    display: 'inline-block',
                }}>
                    Spirit
                </span>
            )}
        </div>
    );
}
