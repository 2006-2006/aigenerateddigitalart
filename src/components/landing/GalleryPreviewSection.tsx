'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, X, ZoomIn, Download } from 'lucide-react';

const artworks = [
  {
    id: 1, title: 'Nebula Dreams', model: 'FLUX Schnell', span: 'col-span-1 row-span-2',
    bg: 'linear-gradient(135deg, #0d0221 0%, #2d1060 30%, #7c3aed 65%, #c084fc 100%)',
    shapes: [
      { type: 'circle', w: 180, h: 180, x: 20, y: 25, color: 'rgba(192,132,252,0.45)', blur: 50 },
      { type: 'circle', w: 120, h: 120, x: 65, y: 55, color: 'rgba(124,58,237,0.6)', blur: 35 },
      { type: 'circle', w: 80, h: 80, x: 10, y: 70, color: 'rgba(244,114,182,0.35)', blur: 25 },
      { type: 'star', w: 4, h: 4, x: 80, y: 15, color: 'rgba(255,255,255,0.9)', blur: 2 },
      { type: 'star', w: 3, h: 3, x: 30, y: 45, color: 'rgba(255,255,255,0.7)', blur: 1 },
      { type: 'star', w: 5, h: 5, x: 55, y: 80, color: 'rgba(255,255,255,0.8)', blur: 2 },
    ],
  },
  {
    id: 2, title: 'Cyber Dawn', model: 'Gemini Flash', span: 'col-span-1 row-span-1',
    bg: 'linear-gradient(200deg, #020c1b 0%, #0c1f3d 50%, #0e3460 80%, #1a6070 100%)',
    shapes: [
      { type: 'circle', w: 140, h: 140, x: 45, y: -15, color: 'rgba(56,189,248,0.55)', blur: 45 },
      { type: 'circle', w: 90, h: 90, x: 75, y: 65, color: 'rgba(99,102,241,0.5)', blur: 28 },
      { type: 'line', w: 100, h: 1, x: 0, y: 60, color: 'rgba(56,189,248,0.3)', blur: 2 },
      { type: 'star', w: 3, h: 3, x: 20, y: 30, color: 'rgba(255,255,255,0.8)', blur: 1 },
    ],
  },
  {
    id: 3, title: 'Inferno', model: 'OpenRouter', span: 'col-span-1 row-span-1',
    bg: 'linear-gradient(135deg, #1c0500 0%, #7f1d1d 40%, #dc2626 75%, #fca5a5 100%)',
    shapes: [
      { type: 'circle', w: 130, h: 130, x: 50, y: 60, color: 'rgba(251,191,36,0.55)', blur: 40 },
      { type: 'circle', w: 100, h: 100, x: 10, y: 20, color: 'rgba(239,68,68,0.6)', blur: 30 },
      { type: 'circle', w: 60, h: 60, x: 80, y: 10, color: 'rgba(252,211,77,0.4)', blur: 18 },
    ],
  },
  {
    id: 4, title: 'Emerald Depths', model: 'Gemini Ultra', span: 'col-span-1 row-span-2',
    bg: 'linear-gradient(180deg, #020f07 0%, #064e3b 40%, #059669 80%, #6ee7b7 100%)',
    shapes: [
      { type: 'circle', w: 150, h: 150, x: 40, y: 70, color: 'rgba(52,211,153,0.5)', blur: 45 },
      { type: 'circle', w: 100, h: 100, x: 10, y: 20, color: 'rgba(16,185,129,0.55)', blur: 30 },
      { type: 'circle', w: 70, h: 70, x: 75, y: 5, color: 'rgba(167,243,208,0.35)', blur: 20 },
      { type: 'star', w: 4, h: 4, x: 60, y: 40, color: 'rgba(255,255,255,0.6)', blur: 2 },
      { type: 'star', w: 3, h: 3, x: 25, y: 55, color: 'rgba(255,255,255,0.5)', blur: 1 },
    ],
  },
  {
    id: 5, title: 'Cosmic Storm', model: 'Groq + FLUX', span: 'col-span-1 row-span-1',
    bg: 'linear-gradient(135deg, #05050f 0%, #0f0c29 50%, #1e1b4b 100%)',
    shapes: [
      { type: 'circle', w: 160, h: 160, x: 50, y: 45, color: 'rgba(99,102,241,0.45)', blur: 55 },
      { type: 'circle', w: 90, h: 90, x: 15, y: 70, color: 'rgba(139,92,246,0.5)', blur: 30 },
      { type: 'circle', w: 60, h: 60, x: 80, y: 15, color: 'rgba(192,132,252,0.4)', blur: 18 },
      { type: 'star', w: 5, h: 5, x: 40, y: 20, color: 'rgba(255,255,255,0.9)', blur: 3 },
    ],
  },
  {
    id: 6, title: 'Sakura Night', model: 'OpenRouter', span: 'col-span-1 row-span-1',
    bg: 'linear-gradient(135deg, #1a0020 0%, #5b0f4e 40%, #be185d 70%, #f472b6 100%)',
    shapes: [
      { type: 'circle', w: 140, h: 140, x: 55, y: 25, color: 'rgba(244,114,182,0.55)', blur: 45 },
      { type: 'circle', w: 90, h: 90, x: 15, y: 65, color: 'rgba(192,38,211,0.4)', blur: 28 },
      { type: 'circle', w: 50, h: 50, x: 85, y: 70, color: 'rgba(251,207,232,0.35)', blur: 15 },
    ],
  },
  {
    id: 7, title: 'Golden Hour', model: 'Gemini Flash', span: 'col-span-1 row-span-1',
    bg: 'linear-gradient(135deg, #1c1100 0%, #78350f 35%, #d97706 70%, #fde68a 100%)',
    shapes: [
      { type: 'circle', w: 160, h: 120, x: 50, y: 10, color: 'rgba(251,191,36,0.6)', blur: 50 },
      { type: 'circle', w: 80, h: 80, x: 80, y: 70, color: 'rgba(245,158,11,0.45)', blur: 25 },
      { type: 'circle', w: 50, h: 50, x: 10, y: 50, color: 'rgba(252,211,77,0.4)', blur: 15 },
    ],
  },
  {
    id: 8, title: 'Arctic Flow', model: 'FLUX Schnell', span: 'col-span-1 row-span-1',
    bg: 'linear-gradient(135deg, #020617 0%, #0c1445 40%, #1e3a5f 70%, #0284c7 100%)',
    shapes: [
      { type: 'circle', w: 130, h: 130, x: 20, y: 55, color: 'rgba(14,165,233,0.55)', blur: 40 },
      { type: 'circle', w: 90, h: 90, x: 70, y: 15, color: 'rgba(129,140,248,0.5)', blur: 28 },
      { type: 'star', w: 4, h: 4, x: 50, y: 75, color: 'rgba(255,255,255,0.8)', blur: 2 },
    ],
  },
];

type Art = typeof artworks[0];

export default function GalleryPreviewSection() {
  const [lightbox, setLightbox] = useState<Art | null>(null);

  return (
    <section id="gallery" className="relative py-28 overflow-hidden" style={{ background: '#080812' }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(99,60,180,0.08) 0%, transparent 100%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
              style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#c084fc' }}>
              <Sparkles size={11} /> Gallery
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-white leading-[1.05]">
              Stunning AI<br />
              <span style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Masterpieces
              </span>
            </h2>
            <p className="text-white/35 mt-3 text-base max-w-md">
              Every piece generated by our community — click any artwork to view it full size.
            </p>
          </div>
          <Link href="/auth/signup"
            className="group shrink-0 flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-semibold text-white/80 hover:text-white transition-all duration-300 hover:scale-105"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            Create yours <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform duration-200" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-[160px] sm:auto-rows-[180px] lg:auto-rows-[210px]">
          {artworks.map(art => (
            <GalleryCard key={art.id} art={art} onClick={() => setLightbox(art)} />
          ))}
        </div>

        {/* Bottom strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-10"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-white/35 text-sm text-center sm:text-left">
            Join <span className="text-white/70 font-semibold">50,000+</span> creators and generate your first masterpiece
          </p>
          <Link href="/auth/signup"
            className="flex items-center gap-2 px-7 py-3 rounded-2xl font-bold text-white text-sm transition-all duration-300 hover:scale-105 hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)', boxShadow: '0 0 28px rgba(124,58,237,0.35)' }}>
            <Sparkles size={14} /> Start Free <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(16px)' }}
          onClick={() => setLightbox(null)}>
          <div className="relative w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
            style={{ aspectRatio: '4/3' }}
            onClick={e => e.stopPropagation()}>
            <ArtCanvas art={lightbox} />
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-5"
              style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)' }}>
              <div>
                <p className="text-white font-bold text-lg leading-tight">{lightbox.title}</p>
                <p className="text-white/50 text-sm">{lightbox.model}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-9 h-9 rounded-xl flex items-center justify-center text-white/70 hover:text-white transition-colors"
                  style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <Download size={16} />
                </button>
                <button onClick={() => setLightbox(null)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white/70 hover:text-white transition-colors"
                  style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <X size={16} />
                </button>
              </div>
            </div>
            {/* Bottom CTA */}
            <div className="absolute bottom-0 left-0 right-0 p-5 flex items-center justify-between"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)' }}>
              <p className="text-white/50 text-sm">Generate artwork like this</p>
              <Link href="/auth/signup" onClick={() => setLightbox(null)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
                Try Free <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function ArtCanvas({ art }: { art: Art }) {
  return (
    <div className="absolute inset-0" style={{ background: art.bg }}>
      {art.shapes.map((s, i) => (
        <div key={i} className="absolute rounded-full pointer-events-none"
          style={{
            width: s.w, height: s.h,
            left: `${s.x}%`, top: `${s.y}%`,
            transform: 'translate(-50%, -50%)',
            background: s.color,
            filter: `blur(${s.blur}px)`,
            mixBlendMode: s.type === 'star' ? 'screen' : 'screen',
          }} />
      ))}
      {/* Noise texture for realism */}
      <div className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px',
        }} />
      {/* Vignette */}
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)' }} />
    </div>
  );
}

function GalleryCard({ art, onClick }: { art: Art; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`relative overflow-hidden cursor-pointer transition-all duration-400 ${art.span}`}
      style={{
        borderRadius: '16px',
        transform: hovered ? 'scale(1.03) translateY(-2px)' : 'scale(1)',
        boxShadow: hovered
          ? '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1)'
          : '0 4px 20px rgba(0,0,0,0.4)',
        zIndex: hovered ? 10 : 1,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <ArtCanvas art={art} />

      {/* Hover overlay */}
      <div className="absolute inset-0 flex items-center justify-center transition-all duration-300"
        style={{ background: hovered ? 'rgba(0,0,0,0.3)' : 'transparent' }}>
        {hovered && (
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)' }}>
            <ZoomIn size={20} className="text-white" />
          </div>
        )}
      </div>

      {/* Info bar */}
      <div className={`absolute inset-x-0 bottom-0 px-3.5 py-3 transition-all duration-300 ${hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)' }}>
        <p className="text-white font-bold text-sm leading-tight truncate">{art.title}</p>
        <p className="text-white/45 text-xs">{art.model}</p>
      </div>
    </div>
  );
}
