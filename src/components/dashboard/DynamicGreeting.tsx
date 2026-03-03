'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

export default function DynamicGreeting() {
    const [greeting, setGreeting] = useState('day');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('morning');
        else if (hour < 17) setGreeting('afternoon');
        else if (hour < 21) setGreeting('evening');
        else setGreeting('night');
    }, []);

    if (!mounted) {
        return (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4 opacity-0">
                <Sparkles size={11} /> Loading...
            </div>
        );
    }

    return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4 animate-fade-in"
            style={{ background: 'rgba(192,132,252,0.12)', border: '1px solid rgba(192,132,252,0.25)', color: '#c084fc' }}>
            <Sparkles size={11} /> Good {greeting}
        </div>
    );
}
