import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
    subsets: ['latin'],
    variable: '--font-space-grotesk',
    display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-jetbrains-mono',
    display: 'swap',
});

export const metadata: Metadata = {
    title: {
        default: 'Spirit AI — Generate Stunning AI Artwork',
        template: '%s | Spirit AI',
    },
    description:
        'Create breathtaking AI-generated artwork with Spirit. Powered by Groq, Gemini, and OpenRouter. Dark, futuristic, and limitless creativity.',
    keywords: ['AI art', 'AI image generation', 'digital art', 'Groq', 'Gemini', 'SaaS'],
    authors: [{ name: 'Spirit AI' }],
    openGraph: {
        type: 'website',
        title: 'Spirit AI',
        description: 'Generate stunning AI artwork with next-gen models.',
        siteName: 'Spirit AI',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body
                className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased bg-dark-200 text-white`}
            >
                {children}
            </body>
        </html>
    );
}
