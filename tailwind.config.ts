import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#f0f4ff',
                    100: '#e0eaff',
                    200: '#c7d7fe',
                    300: '#a5b8fc',
                    400: '#818cf8',
                    500: '#6366f1',
                    600: '#4f46e5',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                    950: '#1e1b4b',
                },
                accent: {
                    400: '#e879f9',
                    500: '#d946ef',
                    600: '#c026d3',
                },
                neon: {
                    purple: '#a855f7',
                    pink: '#ec4899',
                    blue: '#3b82f6',
                    cyan: '#06b6d4',
                },
                dark: {
                    50: '#f8fafc',
                    100: '#0f0f1a',
                    200: '#0a0a14',
                    300: '#07070f',
                    400: '#050509',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
                display: ['Space Grotesk', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'hero-gradient': 'linear-gradient(135deg, #0f0f1a 0%, #1a0a2e 50%, #0f0f1a 100%)',
                'card-gradient': 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(217,70,239,0.1) 100%)',
                'glow-purple': 'radial-gradient(circle at center, rgba(168,85,247,0.3) 0%, transparent 70%)',
                'glow-pink': 'radial-gradient(circle at center, rgba(236,72,153,0.2) 0%, transparent 70%)',
            },
            boxShadow: {
                'neon-purple': '0 0 20px rgba(168,85,247,0.5), 0 0 40px rgba(168,85,247,0.2)',
                'neon-pink': '0 0 20px rgba(236,72,153,0.5), 0 0 40px rgba(236,72,153,0.2)',
                'neon-blue': '0 0 20px rgba(59,130,246,0.5), 0 0 40px rgba(59,130,246,0.2)',
                'glass': '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                'card': '0 4px 24px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.2)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'shimmer': 'shimmer 2s linear infinite',
                'spin-slow': 'spin 8s linear infinite',
                'gradient-x': 'gradient-x 15s ease infinite',
                'fade-in': 'fade-in 0.5s ease-out',
                'slide-up': 'slide-up 0.5s ease-out',
                'slide-in-right': 'slide-in-right 0.3s ease-out',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                glow: {
                    from: { textShadow: '0 0 10px rgba(168,85,247,0.5), 0 0 20px rgba(168,85,247,0.3)' },
                    to: { textShadow: '0 0 20px rgba(168,85,247,0.8), 0 0 40px rgba(168,85,247,0.5)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% center' },
                    '100%': { backgroundPosition: '200% center' },
                },
                'gradient-x': {
                    '0%, 100%': { backgroundSize: '200% 200%', backgroundPosition: 'left center' },
                    '50%': { backgroundSize: '200% 200%', backgroundPosition: 'right center' },
                },
                'fade-in': {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
                'slide-up': {
                    from: { opacity: '0', transform: 'translateY(20px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                'slide-in-right': {
                    from: { opacity: '0', transform: 'translateX(20px)' },
                    to: { opacity: '1', transform: 'translateX(0)' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
};

export default config;
