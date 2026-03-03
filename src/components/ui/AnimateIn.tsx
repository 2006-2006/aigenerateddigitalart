'use client';

import { useEffect, useRef } from 'react';

interface AnimateInProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'up' | 'left' | 'right' | 'scale' | 'fade';
    delay?: number;
    threshold?: number;
    stagger?: boolean;
}

export default function AnimateIn({
    children,
    className = '',
    variant = 'up',
    delay = 0,
    threshold = 0.12,
    stagger = false,
}: AnimateInProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.style.transitionDelay = `${delay}ms`;
                    el.classList.add('is-visible');
                    observer.unobserve(el);
                }
            },
            { threshold }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [delay, threshold]);

    const variantClass = {
        up: '',
        left: 'reveal-left',
        right: 'reveal-right',
        scale: 'reveal-scale',
        fade: 'reveal-fade',
    }[variant];

    return (
        <div
            ref={ref}
            className={`reveal ${variantClass} ${stagger ? 'reveal-stagger' : ''} ${className}`}
        >
            {children}
        </div>
    );
}
