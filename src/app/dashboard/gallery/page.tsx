'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Download, Share2, ImageIcon, Lock, Globe,
    X, ZoomIn, ChevronLeft, ChevronRight, Link2, Check,
    ExternalLink, Zap, Calendar, Layers
} from 'lucide-react';
import Link from 'next/link';

interface GeneratedImage {
    id: string;
    prompt: string;
    negative_prompt?: string;
    model: string;
    provider: string;
    resolution: string;
    image_url: string;
    is_public: boolean;
    credits_used: number;
    created_at: string;
}

// ─── Download helper ──────────────────────────────────────────────────────────
async function downloadImage(imageUrl: string, prompt: string, id: string) {
    try {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeName = prompt.slice(0, 40).replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '_');
        a.download = `spirit-ai-${safeName || id}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return true;
    } catch {
        window.open(imageUrl, '_blank');
        return true;
    }
}

// ─── Share helper ─────────────────────────────────────────────────────────────
async function shareImage(imageUrl: string, prompt: string): Promise<'shared' | 'copied'> {
    const shareData = { title: 'AI Artwork — Spirit AI', text: `"${prompt}"`, url: imageUrl };
    try {
        if (typeof navigator.share === 'function' && navigator.canShare?.(shareData)) {
            await navigator.share(shareData);
            return 'shared';
        }
    } catch { /* fall through */ }
    await navigator.clipboard.writeText(imageUrl);
    return 'copied';
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({
    images, index, onClose, onNext, onPrev,
}: {
    images: GeneratedImage[]; index: number;
    onClose: () => void; onNext: () => void; onPrev: () => void;
}) {
    const img = images[index];
    const [dlDone, setDlDone] = useState(false);
    const [shareState, setShareState] = useState<'' | 'shared' | 'copied'>('');

    useEffect(() => {
        const h = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') onNext();
            if (e.key === 'ArrowLeft') onPrev();
        };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [onClose, onNext, onPrev]);

    // Reset state when image changes
    useEffect(() => { setDlDone(false); setShareState(''); }, [index]);

    const handleDownload = async () => {
        await downloadImage(img.image_url, img.prompt, img.id);
        setDlDone(true);
        setTimeout(() => setDlDone(false), 2500);
    };

    const handleShare = async () => {
        try {
            const result = await shareImage(img.image_url, img.prompt);
            setShareState(result);
        } catch { setShareState('copied'); }
        setTimeout(() => setShareState(''), 2500);
    };

    const modelLabel = img.model.split('/').pop()?.split(':')[0] ?? img.model;
    const date = new Date(img.created_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
    });

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(14px)' }}
            onClick={onClose}
        >
            <div
                className="relative flex flex-col lg:flex-row w-full max-w-5xl rounded-3xl overflow-hidden"
                style={{
                    background: '#0d0d1f',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 50px 120px rgba(0,0,0,0.8)',
                    maxHeight: '92vh',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white transition-all"
                    style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
                >
                    <X size={18} />
                </button>

                {/* ── Image area ── */}
                <div className="relative flex-1 flex items-center justify-center min-h-[280px] lg:min-h-0 overflow-hidden"
                    style={{ background: 'rgba(0,0,0,0.4)' }}>
                    {/* Prev */}
                    {images.length > 1 && (
                        <button onClick={onPrev}
                            className="absolute left-3 z-10 w-10 h-10 rounded-xl flex items-center justify-center text-white/70 hover:text-white transition-all"
                            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}>
                            <ChevronLeft size={22} />
                        </button>
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={img.image_url}
                        alt={img.prompt}
                        className="max-w-full object-contain"
                        style={{ maxHeight: '85vh' }}
                    />
                    {/* Next */}
                    {images.length > 1 && (
                        <button onClick={onNext}
                            className="absolute right-3 z-10 w-10 h-10 rounded-xl flex items-center justify-center text-white/70 hover:text-white transition-all"
                            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}>
                            <ChevronRight size={22} />
                        </button>
                    )}
                    {/* Counter */}
                    {images.length > 1 && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-medium text-white/70"
                            style={{ background: 'rgba(0,0,0,0.55)' }}>
                            {index + 1} / {images.length}
                        </div>
                    )}
                    {/* Open in new tab */}
                    <a href={img.image_url} target="_blank" rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="absolute top-3 left-3 w-8 h-8 rounded-xl flex items-center justify-center text-white/50 hover:text-white transition-all"
                        style={{ background: 'rgba(0,0,0,0.5)' }}>
                        <ExternalLink size={13} />
                    </a>
                </div>

                {/* ── Info sidebar ── */}
                <div className="w-full lg:w-72 flex-shrink-0 flex flex-col p-6 overflow-y-auto"
                    style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', maxHeight: '92vh' }}>
                    {/* Prompt */}
                    <h3 className="text-white font-semibold text-sm leading-relaxed mb-4">{img.prompt}</h3>

                    {img.negative_prompt && (
                        <div className="mb-4 px-3 py-2.5 rounded-xl text-xs"
                            style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)' }}>
                            <p className="text-red-400/70 font-semibold mb-1 text-[10px] uppercase tracking-wider">Avoid</p>
                            <p className="text-white/40">{img.negative_prompt}</p>
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="space-y-2.5 mb-6">
                        {([
                            { icon: <Layers size={13} />, label: 'Model', value: modelLabel },
                            { icon: <Zap size={13} />, label: 'Provider', value: img.provider },
                            { icon: <ImageIcon size={13} />, label: 'Resolution', value: img.resolution },
                            { icon: <Calendar size={13} />, label: 'Created', value: date },
                            {
                                icon: img.is_public ? <Globe size={13} /> : <Lock size={13} />,
                                label: 'Visibility',
                                value: img.is_public ? 'Public' : 'Private',
                            },
                        ] as { icon: React.ReactNode; label: string; value: string }[]).map(({ icon, label, value }) => (
                            <div key={label} className="flex items-center justify-between gap-2">
                                <span className="flex items-center gap-1.5 text-white/35 text-xs flex-shrink-0">{icon} {label}</span>
                                <span className="text-white/70 text-xs font-medium text-right truncate max-w-[140px]">{value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Dot navigation */}
                    {images.length > 1 && (
                        <div className="flex items-center justify-center gap-1.5 mb-5">
                            {images.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => { /* handled by parent */ }}
                                    className="rounded-full transition-all"
                                    style={{
                                        width: i === index ? 20 : 6,
                                        height: 6,
                                        background: i === index ? 'linear-gradient(90deg,#7c3aed,#db2777)' : 'rgba(255,255,255,0.15)',
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="mt-auto space-y-2.5">
                        <button
                            onClick={handleDownload}
                            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 active:scale-95"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)', boxShadow: '0 0 20px rgba(124,58,237,0.35)' }}
                        >
                            {dlDone ? <Check size={15} /> : <Download size={15} />}
                            {dlDone ? 'Downloaded!' : 'Download Image'}
                        </button>
                        <button
                            onClick={handleShare}
                            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-semibold text-white/70 hover:text-white transition-all active:scale-95"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                            {shareState === 'shared' ? <Check size={15} className="text-emerald-400" /> :
                                shareState === 'copied' ? <Link2 size={15} className="text-blue-400" /> :
                                    <Share2 size={15} />}
                            {shareState === 'shared' ? 'Shared!' :
                                shareState === 'copied' ? 'Link Copied!' :
                                    'Share Image'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Gallery Card ─────────────────────────────────────────────────────────────
function GalleryCard({ image, onClick }: { image: GeneratedImage; onClick: () => void }) {
    const [dlDone, setDlDone] = useState(false);
    const [shareState, setShareState] = useState<'' | 'shared' | 'copied'>('');

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await downloadImage(image.image_url, image.prompt, image.id);
        setDlDone(true);
        setTimeout(() => setDlDone(false), 2000);
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const result = await shareImage(image.image_url, image.prompt);
            setShareState(result);
        } catch { setShareState('copied'); }
        setTimeout(() => setShareState(''), 2000);
    };

    const date = new Date(image.created_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
    });

    return (
        <div
            className="break-inside-avoid glass-card overflow-hidden group cursor-pointer"
            onClick={onClick}
            style={{ transition: 'transform 0.2s', }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
        >
            <div className="relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={image.image_url}
                    alt={image.prompt}
                    className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3"
                    style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.6) 100%)' }}>
                    {/* Top row: visibility + action buttons */}
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-white/80 text-[10px] font-medium px-2 py-1 rounded-full"
                            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
                            {image.is_public ? <Globe size={10} /> : <Lock size={10} />}
                            {image.is_public ? 'Public' : 'Private'}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <button onClick={handleDownload} aria-label="Download"
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:text-white transition-all hover:scale-110"
                                style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}>
                                {dlDone ? <Check size={14} className="text-emerald-400" /> : <Download size={14} />}
                            </button>
                            <button onClick={handleShare} aria-label="Share"
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:text-white transition-all hover:scale-110"
                                style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}>
                                {shareState === 'copied' ? <Link2 size={14} className="text-blue-400" /> :
                                    shareState === 'shared' ? <Check size={14} className="text-emerald-400" /> :
                                        <Share2 size={14} />}
                            </button>
                        </div>
                    </div>
                    {/* Center: click to view hint */}
                    <div className="flex items-center justify-center">
                        <span className="flex items-center gap-1.5 text-white text-xs font-semibold px-3 py-1.5 rounded-full"
                            style={{ background: 'rgba(124,58,237,0.75)', backdropFilter: 'blur(6px)' }}>
                            <ZoomIn size={12} /> Click to view
                        </span>
                    </div>
                </div>
            </div>

            {/* Metadata */}
            <div className="p-3">
                <p className="text-white/80 text-xs font-medium leading-snug line-clamp-2">{image.prompt}</p>
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                        <span className="badge text-[10px] px-2 py-0.5">
                            {image.model.split('/').pop()?.split(':')[0] ?? image.model}
                        </span>
                        <span className="text-white/25 text-[10px]">{image.resolution}</span>
                    </div>
                    <span className="text-white/25 text-[10px]">{date}</span>
                </div>
            </div>
        </div>
    );
}

// ─── Main Gallery Page ────────────────────────────────────────────────────────
export default function GalleryPage() {
    const [images, setImages] = useState<GeneratedImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const fetchImages = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/gallery');
            if (res.ok) {
                const data = await res.json();
                setImages(data.images || []);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchImages(); }, [fetchImages]);

    const openLightbox = (index: number) => setLightboxIndex(index);
    const closeLightbox = () => setLightboxIndex(null);
    const next = () => setLightboxIndex(i => i !== null ? (i + 1) % images.length : 0);
    const prev = () => setLightboxIndex(i => i !== null ? (i - 1 + images.length) % images.length : 0);

    if (loading) {
        return (
            <div className="animate-fade-in">
                <div className="mb-8">
                    <h1 className="text-2xl font-display font-bold text-white">My Gallery</h1>
                    <p className="text-white/40 text-sm mt-1">Loading your artworks...</p>
                </div>
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="break-inside-avoid glass-card overflow-hidden animate-pulse">
                            <div style={{ background: 'rgba(255,255,255,0.03)', aspectRatio: '1' }} />
                            <div className="p-3 space-y-2">
                                <div style={{ height: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 6, width: '75%' }} />
                                <div style={{ height: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 6, width: '50%' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (images.length === 0) {
        return (
            <div className="animate-fade-in">
                <div className="mb-8">
                    <h1 className="text-2xl font-display font-bold text-white">My Gallery</h1>
                    <p className="text-white/40 text-sm mt-1">All your AI-generated artworks</p>
                </div>
                <div className="glass-card p-16 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
                        <ImageIcon size={32} className="text-brand-400/50" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No images yet</h3>
                    <p className="text-white/40 text-sm mb-6">Your generated artworks will appear here. Start creating!</p>
                    <Link href="/dashboard/generate" className="btn-primary">Generate Your First Image</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Lightbox portal */}
            {lightboxIndex !== null && (
                <Lightbox
                    images={images}
                    index={lightboxIndex}
                    onClose={closeLightbox}
                    onNext={next}
                    onPrev={prev}
                />
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-display font-bold text-white">My Gallery</h1>
                    <p className="text-white/40 text-sm mt-1">
                        {images.length} artwork{images.length !== 1 ? 's' : ''} created
                    </p>
                </div>
                <Link href="/dashboard/generate" className="btn-primary text-sm px-5 py-2.5">
                    + Generate New
                </Link>
            </div>

            {/* Masonry Grid */}
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                {images.map((img, i) => (
                    <GalleryCard
                        key={img.id}
                        image={img}
                        onClick={() => openLightbox(i)}
                    />
                ))}
            </div>
        </div>
    );
}
