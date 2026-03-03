'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ChevronDown, Zap, Download, Share2, AlertCircle } from 'lucide-react';
import Image from 'next/image';

const PROVIDERS = [
    {
        id: 'openrouter',
        label: 'OpenRouter (Recommended)',
        note: 'Free via OpenRouter',
        models: [
            { id: 'google/gemini-2.5-flash-image', label: 'Gemini 2.5 Flash Image — Free & Fast' },
            { id: 'google/gemini-3.1-flash-image-preview', label: 'Gemini 3.1 Flash Image — Latest' },
            { id: 'google/gemini-3-pro-image-preview', label: 'Gemini 3 Pro Image — High Quality' },
            { id: 'openai/gpt-5-image-mini', label: 'GPT-5 Image Mini — OpenAI (Paid)' },
        ],
    },
    {
        id: 'gemini',
        label: 'Google Gemini (Direct)',
        note: 'Uses your Gemini API key',
        models: [
            { id: 'gemini-2.0-flash-preview-image-generation', label: 'Gemini 2.0 Flash (Image)' },
        ],
    },
];

const RESOLUTIONS = [
    { id: '512x512', label: '512 × 512', tag: 'Fast' },
    { id: '768x768', label: '768 × 768', tag: 'Balanced' },
    { id: '1024x1024', label: '1024 × 1024', tag: 'HD' },
    { id: '1024x1792', label: '1024 × 1792', tag: 'Portrait' },
    { id: '1792x1024', label: '1792 × 1024', tag: 'Landscape' },
];

export default function GeneratePage() {
    const router = useRouter();
    const [prompt, setPrompt] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('');
    const [providerId, setProviderId] = useState('openrouter');
    const [modelId, setModelId] = useState('google/gemini-2.5-flash-image');
    const [resolution, setResolution] = useState('1024x1024');
    const [loading, setLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [creditsUsed, setCreditsUsed] = useState(0);

    const currentProvider = PROVIDERS.find((p) => p.id === providerId)!;

    const handleProviderChange = (pid: string) => {
        setProviderId(pid);
        setModelId(PROVIDERS.find((p) => p.id === pid)!.models[0].id);
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt.');
            return;
        }
        setLoading(true);
        setError('');
        setGeneratedImage(null);

        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, negativePrompt, provider: providerId, model: modelId, resolution }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Generation failed. Please try again.');
            } else {
                setGeneratedImage(data.imageUrl);
                setCreditsUsed(data.creditsRemaining);

                // Force Next.js server components (Header, Sidebar, Overview) to re-fetch new credit/image counts
                router.refresh();
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!generatedImage) return;
        const a = document.createElement('a');
        a.href = generatedImage;
        a.download = `Spirit-${Date.now()}.png`;
        a.click();
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page title */}
            <div>
                <h1 className="text-2xl font-display font-bold text-white">Generate AI Art</h1>
                <p className="text-white/40 text-sm mt-1">Describe your vision and let AI create it</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* ── Left Panel: Controls ── */}
                <div className="space-y-5">
                    {/* Prompt */}
                    <div className="glass-card p-5">
                        <label className="block text-sm font-medium text-white/80 mb-3" htmlFor="gen-prompt">
                            <Sparkles size={14} className="inline mr-2 text-brand-400" />
                            Prompt
                        </label>
                        <textarea
                            id="gen-prompt"
                            rows={4}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="A cyberpunk city at night, neon lights reflecting on wet streets, cinematic, 8K UHD..."
                            className="input-field resize-none text-sm leading-relaxed"
                        />
                    </div>

                    {/* Negative Prompt */}
                    <div className="glass-card p-5">
                        <label className="block text-sm font-medium text-white/80 mb-3" htmlFor="gen-neg-prompt">
                            Negative Prompt
                            <span className="ml-2 text-white/30 font-normal">(optional)</span>
                        </label>
                        <textarea
                            id="gen-neg-prompt"
                            rows={2}
                            value={negativePrompt}
                            onChange={(e) => setNegativePrompt(e.target.value)}
                            placeholder="blurry, low quality, distorted, ugly, bad anatomy..."
                            className="input-field resize-none text-sm"
                        />
                    </div>

                    {/* Provider + Model */}
                    <div className="glass-card p-5">
                        <p className="text-sm font-medium text-white/80 mb-4">AI Provider & Model</p>

                        {/* Provider tabs */}
                        <div className="flex gap-2 mb-4 flex-wrap">
                            {PROVIDERS.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => handleProviderChange(p.id)}
                                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 text-left ${providerId === p.id
                                        ? 'bg-brand-500/30 text-brand-300 border border-brand-500/40'
                                        : 'glass-card text-white/40 hover:text-white/70'
                                        }`}
                                >
                                    <span className="block">{p.label}</span>
                                    {p.note && <span className="text-[10px] font-normal opacity-60">{p.note}</span>}
                                </button>
                            ))}
                        </div>

                        {/* Model select */}
                        <div className="relative">
                            <select
                                value={modelId}
                                onChange={(e) => setModelId(e.target.value)}
                                className="input-field appearance-none pr-10 text-sm cursor-pointer"
                                aria-label="Select model"
                            >
                                {currentProvider.models.map((m) => (
                                    <option key={m.id} value={m.id} className="bg-dark-200">
                                        {m.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                        </div>
                    </div>

                    {/* Resolution */}
                    <div className="glass-card p-5">
                        <p className="text-sm font-medium text-white/80 mb-3">Resolution</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {RESOLUTIONS.map((r) => (
                                <button
                                    key={r.id}
                                    onClick={() => setResolution(r.id)}
                                    className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 text-left ${resolution === r.id
                                        ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40 shadow-neon-purple'
                                        : 'glass-card text-white/40 hover:text-white/60'
                                        }`}
                                >
                                    <span className="block font-semibold">{r.label}</span>
                                    <span className="text-[10px] opacity-60">{r.tag}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Generate button */}
                    <button
                        onClick={handleGenerate}
                        disabled={loading || !prompt.trim()}
                        className="btn-primary w-full py-4 text-base"
                        id="generate-btn"
                    >
                        {loading ? (
                            <>
                                <span className="spinner" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles size={18} />
                                Generate Image
                                <span className="ml-auto text-xs opacity-60">1 credit</span>
                            </>
                        )}
                    </button>

                    {/* Error */}
                    {error && (
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                            <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}
                </div>

                {/* ── Right Panel: Preview ── */}
                <div className="glass-card p-5 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-medium text-white/80">Preview</p>
                        {generatedImage && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleDownload}
                                    className="btn-ghost text-xs px-3 py-1.5 gap-1.5"
                                >
                                    <Download size={13} />
                                    Save
                                </button>
                                <button className="btn-ghost text-xs px-3 py-1.5 gap-1.5">
                                    <Share2 size={13} />
                                    Share
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Canvas */}
                    <div className="flex-1 min-h-[400px] rounded-xl overflow-hidden relative">
                        {loading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-dark-300/80 backdrop-blur-sm z-10">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full border-2 border-brand-500/30 border-t-brand-500 animate-spin" />
                                    <Sparkles size={20} className="absolute inset-0 m-auto text-brand-400" />
                                </div>
                                <div className="text-center">
                                    <p className="text-white font-medium text-sm">Creating your artwork...</p>
                                    <p className="text-white/40 text-xs mt-1">This may take a few seconds</p>
                                </div>
                            </div>
                        )}

                        {generatedImage ? (
                            <img
                                src={generatedImage}
                                alt={prompt}
                                className="w-full h-full object-contain rounded-xl"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-white/3 rounded-xl border-2 border-dashed border-white/10">
                                <div className="w-20 h-20 rounded-2xl bg-brand-500/10 flex items-center justify-center">
                                    <Sparkles size={32} className="text-brand-400/50" />
                                </div>
                                <div className="text-center">
                                    <p className="text-white/30 text-sm font-medium">Your artwork will appear here</p>
                                    <p className="text-white/20 text-xs mt-1">Enter a prompt and click Generate</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Credits remaining indicator */}
                    {generatedImage && (
                        <div className="mt-4 flex items-center justify-between text-xs text-white/30">
                            <span>✓ Image saved to gallery</span>
                            <span className="flex items-center gap-1">
                                <Zap size={11} />
                                {creditsUsed} credits remaining
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
