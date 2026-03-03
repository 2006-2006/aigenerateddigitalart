'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    KeyRound, Eye, EyeOff, CheckCircle2, XCircle, Loader2,
    Save, RefreshCw, Shield, AlertTriangle, Zap, Brain, Cpu
} from 'lucide-react';

interface ApiKeyConfig {
    id: string;
    settingKey: string; // key in platform_settings
    label: string;
    provider: string;
    icon: React.ReactNode;
    color: string;
    description: string;
    testEndpoint: string;
    testModel: string;
    placeholder: string;
    envFallback: string; // what env var it maps to
}

const KEY_CONFIGS: ApiKeyConfig[] = [
    {
        id: 'openrouter',
        settingKey: 'api_key_openrouter',
        label: 'OpenRouter',
        provider: 'openrouter',
        icon: <Brain size={16} />,
        color: '#7c3aed',
        description: 'Powers Gemini, GPT-4, and all OpenRouter image models. Recommended primary provider.',
        testEndpoint: 'https://openrouter.ai/api/v1/models',
        testModel: '',
        placeholder: 'sk-or-v1-...',
        envFallback: 'OPENROUTER_API_KEY',
    },
    {
        id: 'gemini',
        settingKey: 'api_key_gemini',
        label: 'Google Gemini',
        provider: 'gemini',
        icon: <Zap size={16} />,
        color: '#0ea5e9',
        description: 'Direct Gemini API for image generation (gemini-2.0-flash-preview-image-generation).',
        testEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
        testModel: '',
        placeholder: 'AIzaSy...',
        envFallback: 'GEMINI_API_KEY',
    },
    {
        id: 'groq',
        settingKey: 'api_key_groq',
        label: 'Groq',
        provider: 'groq',
        icon: <Cpu size={16} />,
        color: '#f59e0b',
        description: 'Used to enhance prompts via Llama before generating images through OpenRouter.',
        testEndpoint: 'https://api.groq.com/openai/v1/models',
        testModel: '',
        placeholder: 'gsk_...',
        envFallback: 'GROQ_API_KEY',
    },
];

type TestStatus = 'idle' | 'testing' | 'ok' | 'fail';

function MaskedInput({
    value, onChange, placeholder, disabled
}: { value: string; onChange: (v: string) => void; placeholder: string; disabled?: boolean }) {
    const [visible, setVisible] = useState(false);
    return (
        <div className="relative">
            <input
                type={visible ? 'text' : 'password'}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full pr-10 px-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
                style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    fontFamily: value ? 'monospace' : 'inherit',
                }}
                spellCheck={false}
                autoComplete="off"
            />
            <button
                type="button"
                onClick={() => setVisible(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
            >
                {visible ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
        </div>
    );
}

export default function AdminApiKeysPage() {
    const [keys, setKeys] = useState<Record<string, string>>({});
    const [saved, setSaved] = useState<Record<string, string>>({}); // values currently in DB
    const [statuses, setStatuses] = useState<Record<string, TestStatus>>({});
    const [testMessages, setTestMessages] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
    const [loading, setLoading] = useState(true);

    const showToast = (msg: string, ok = true) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 3000);
    };

    const loadKeys = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/settings');
            if (!res.ok) return;
            const data = await res.json();
            const vals: Record<string, string> = {};
            (data.settings || []).forEach((s: { key: string; value: string }) => {
                vals[s.key] = s.value;
            });
            setSaved(vals);
            // Pre-fill inputs with DB values
            const inputVals: Record<string, string> = {};
            KEY_CONFIGS.forEach(cfg => {
                inputVals[cfg.id] = vals[cfg.settingKey] || '';
            });
            setKeys(inputVals);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadKeys(); }, [loadKeys]);

    const saveKey = async (cfg: ApiKeyConfig) => {
        const val = keys[cfg.id]?.trim();
        if (!val) { showToast('Please enter an API key first', false); return; }
        setSaving(cfg.id);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: cfg.settingKey,
                    value: val,
                    description: `${cfg.label} API Key`,
                }),
            });
            if (res.ok) {
                setSaved(p => ({ ...p, [cfg.settingKey]: val }));
                showToast(`${cfg.label} key saved!`);
            } else {
                showToast('Save failed', false);
            }
        } finally {
            setSaving(null);
        }
    };

    const testKey = async (cfg: ApiKeyConfig) => {
        const val = keys[cfg.id]?.trim() || saved[cfg.settingKey] || '';
        if (!val) { showToast('Enter a key to test', false); return; }

        setStatuses(p => ({ ...p, [cfg.id]: 'testing' }));
        setTestMessages(p => ({ ...p, [cfg.id]: '' }));

        try {
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };

            if (cfg.id === 'openrouter') {
                headers['Authorization'] = `Bearer ${val}`;
                const r = await fetch('/api/admin/test-key', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ provider: 'openrouter', key: val }),
                });
                const d = await r.json();
                if (r.ok && d.ok) {
                    setStatuses(p => ({ ...p, [cfg.id]: 'ok' }));
                    setTestMessages(p => ({ ...p, [cfg.id]: d.message || 'Connected successfully' }));
                } else {
                    setStatuses(p => ({ ...p, [cfg.id]: 'fail' }));
                    setTestMessages(p => ({ ...p, [cfg.id]: d.error || 'Test failed' }));
                }
            } else {
                // Test via admin route
                const r = await fetch('/api/admin/test-key', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ provider: cfg.id, key: val }),
                });
                const d = await r.json();
                if (r.ok && d.ok) {
                    setStatuses(p => ({ ...p, [cfg.id]: 'ok' }));
                    setTestMessages(p => ({ ...p, [cfg.id]: d.message || 'Connected successfully' }));
                } else {
                    setStatuses(p => ({ ...p, [cfg.id]: 'fail' }));
                    setTestMessages(p => ({ ...p, [cfg.id]: d.error || 'Test failed' }));
                }
            }
        } catch (e) {
            setStatuses(p => ({ ...p, [cfg.id]: 'fail' }));
            setTestMessages(p => ({ ...p, [cfg.id]: 'Network error' }));
        }
    };

    const statusIcon = (id: string) => {
        const s = statuses[id] || 'idle';
        if (s === 'testing') return <Loader2 size={15} className="animate-spin text-yellow-400" />;
        if (s === 'ok') return <CheckCircle2 size={15} className="text-emerald-400" />;
        if (s === 'fail') return <XCircle size={15} className="text-red-400" />;
        return null;
    };

    const isSavedInDB = (cfg: ApiKeyConfig) => !!saved[cfg.settingKey];
    const isDirty = (cfg: ApiKeyConfig) => keys[cfg.id] !== saved[cfg.settingKey];

    return (
        <div className="max-w-3xl space-y-6">
            {/* Hero Header */}
            <div className="relative rounded-3xl overflow-hidden p-8 mb-4 flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.15) 0%, rgba(245,158,11,0.05) 100%)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="absolute inset-0 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(rgba(245,158,11,0.2) 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.5 }} />
                <div className="absolute top-4 right-10 w-32 h-32 rounded-full pointer-events-none opacity-20 bg-amber-500 blur-3xl" />
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center shadow-lg">
                        <KeyRound size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-display font-bold text-white mb-1">API Key Management</h1>
                        <p className="text-white/50 text-sm">Securely configure and test integrations for AI generation providers.</p>
                    </div>
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold text-white shadow-2xl animate-fade-in"
                    style={{ background: toast.ok ? 'rgba(16,185,129,0.95)' : 'rgba(239,68,68,0.95)' }}>
                    {toast.ok ? '✓' : '✗'} {toast.msg}
                </div>
            )}

            {/* Header info */}
            <div className="flex items-start gap-3 px-5 py-4 rounded-2xl"
                style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
                <Shield size={15} className="text-purple-400 flex-shrink-0 mt-0.5" />
                <p className="text-white/50 text-xs leading-relaxed">
                    <span className="text-purple-300 font-semibold">API Keys are stored securely — </span>
                    Keys saved here are stored in the database and take priority over .env.local values.
                    Always test after saving to confirm the key is valid.
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 size={24} className="animate-spin text-purple-400" />
                </div>
            ) : (
                KEY_CONFIGS.map(cfg => (
                    <div key={cfg.id} className="rounded-2xl p-6 space-y-4"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {/* Card header */}
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                                    style={{ background: `${cfg.color}22`, border: `1px solid ${cfg.color}44` }}>
                                    <span style={{ color: cfg.color }}>{cfg.icon}</span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-white font-semibold text-sm">{cfg.label}</h3>
                                        {isSavedInDB(cfg) && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold text-emerald-400"
                                                style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
                                                Saved in DB
                                            </span>
                                        )}
                                        {!isSavedInDB(cfg) && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold text-yellow-400/70"
                                                style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                                                Using .env
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-white/35 text-xs mt-0.5">{cfg.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                                {statusIcon(cfg.id)}
                            </div>
                        </div>

                        {/* Input */}
                        <MaskedInput
                            value={keys[cfg.id] || ''}
                            onChange={v => setKeys(p => ({ ...p, [cfg.id]: v }))}
                            placeholder={isSavedInDB(cfg) ? '••••••••••••••••••••••••• (saved)' : cfg.placeholder}
                        />

                        {/* Test result message */}
                        {testMessages[cfg.id] && (
                            <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl"
                                style={{
                                    background: statuses[cfg.id] === 'ok' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                                    border: `1px solid ${statuses[cfg.id] === 'ok' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                                    color: statuses[cfg.id] === 'ok' ? '#34d399' : '#f87171',
                                }}>
                                {statuses[cfg.id] === 'ok' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                                {testMessages[cfg.id]}
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => testKey(cfg)}
                                disabled={statuses[cfg.id] === 'testing'}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white/70 hover:text-white transition-all"
                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                {statuses[cfg.id] === 'testing'
                                    ? <Loader2 size={12} className="animate-spin" />
                                    : <KeyRound size={12} />}
                                Test Key
                            </button>
                            <button
                                onClick={() => saveKey(cfg)}
                                disabled={saving === cfg.id || !keys[cfg.id]?.trim() || !isDirty(cfg)}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white hover:brightness-110 disabled:opacity-40 transition-all"
                                style={{ background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}bb)` }}>
                                {saving === cfg.id ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                                {saving === cfg.id ? 'Saving...' : isDirty(cfg) && keys[cfg.id] ? 'Save Key' : 'Saved'}
                            </button>
                            {isSavedInDB(cfg) && isDirty(cfg) && keys[cfg.id] !== '' && (
                                <span className="text-yellow-400/60 text-[11px] flex items-center gap-1">
                                    <AlertTriangle size={10} /> Unsaved changes
                                </span>
                            )}
                        </div>
                    </div>
                ))
            )}

            {/* Refresh */}
            <button onClick={loadKeys}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium text-white/30 hover:text-white/60 transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <RefreshCw size={12} /> Refresh from DB
            </button>
        </div>
    );
}
