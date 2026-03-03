'use client';

import { useEffect, useState } from 'react';
import { Save, RefreshCw, Info } from 'lucide-react';

interface Setting { key: string; value: string; description: string; updated_at: string; }

const META: Record<string, { label: string; type: 'number' | 'toggle' | 'select'; options?: string[] }> = {
    trial_credits: { label: 'Trial Credits for New Users', type: 'number' },
    max_free_resolution: { label: 'Max Resolution (Free Plan)', type: 'select', options: ['512x512', '768x768', '1024x1024', '1024x1792'] },
    generation_enabled: { label: 'Image Generation Enabled', type: 'toggle' },
    maintenance_mode: { label: 'Maintenance Mode', type: 'toggle' },
};

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<Setting[]>([]);
    const [vals, setVals] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [toast, setToast] = useState('');

    const load = () => {
        setLoading(true);
        fetch('/api/admin/settings').then(r => r.json()).then(d => {
            if (d.settings) {
                setSettings(d.settings);
                const v: Record<string, string> = {};
                d.settings.forEach((s: Setting) => { v[s.key] = s.value; });
                setVals(v);
            }
        }).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const save = async (key: string) => {
        setSaving(key);
        const r = await fetch('/api/admin/settings', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, value: vals[key] }),
        });
        if (r.ok) { setToast('Saved!'); setTimeout(() => setToast(''), 2500); }
        setSaving(null);
    };

    return (
        <div className="space-y-5 max-w-2xl">
            {/* Hero Header */}
            <div className="relative rounded-3xl overflow-hidden p-8 mb-4 flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.15) 0%, rgba(219,39,119,0.05) 100%)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="absolute inset-0 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(rgba(219,39,119,0.2) 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.5 }} />
                <div className="absolute top-4 right-10 w-32 h-32 rounded-full pointer-events-none opacity-20 bg-pink-500 blur-3xl" />
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-600 to-rose-500 flex items-center justify-center shadow-lg">
                        <Save size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-display font-bold text-white mb-1">Platform Settings</h1>
                        <p className="text-white/50 text-sm">Configure global platform behavior and default limits.</p>
                    </div>
                </div>
            </div>

            {toast && (
                <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-medium text-white shadow-xl animate-fade-in"
                    style={{ background: 'rgba(16,185,129,0.9)', boxShadow: '0 0 24px rgba(16,185,129,0.3)' }}>
                    ✓ {toast}
                </div>
            )}

            <div className="flex items-start gap-3 px-5 py-4 rounded-2xl"
                style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)' }}>
                <Info size={15} className="text-sky-400 flex-shrink-0 mt-0.5" />
                <p className="text-white/40 text-xs leading-relaxed">
                    <span className="text-sky-300 font-semibold">Platform Settings — </span>
                    Changes apply immediately. <strong className="text-white/60">trial_credits</strong> affects new signups only.
                    Make yourself admin: <code className="text-purple-400">UPDATE public.profiles SET role=&apos;admin&apos; WHERE email=&apos;you@mail.com&apos;;</code>
                </p>
            </div>

            {loading ? (
                <div className="h-48 flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
                </div>
            ) : settings.map(s => {
                const m = META[s.key];
                const val = vals[s.key] ?? s.value;
                return (
                    <div key={s.key} className="rounded-2xl p-6"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <p className="text-white font-semibold text-sm mb-1">{m?.label ?? s.key}</p>
                                <p className="text-white/30 text-xs mb-4">{s.description}</p>
                                {m?.type === 'toggle' ? (
                                    <button onClick={() => setVals(p => ({ ...p, [s.key]: val === 'true' ? 'false' : 'true' }))}
                                        className="relative w-14 h-7 rounded-full transition-all duration-300"
                                        style={{ background: val === 'true' ? '#7c3aed' : 'rgba(255,255,255,0.1)' }}>
                                        <div className="absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all duration-300"
                                            style={{ left: val === 'true' ? '30px' : '4px' }} />
                                    </button>
                                ) : m?.type === 'select' ? (
                                    <div className="flex gap-2 flex-wrap">
                                        {(m.options ?? []).map(o => (
                                            <button key={o} onClick={() => setVals(p => ({ ...p, [s.key]: o }))}
                                                className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
                                                style={{
                                                    background: val === o ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.05)',
                                                    border: val === o ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(255,255,255,0.08)',
                                                    color: val === o ? '#c084fc' : 'rgba(255,255,255,0.45)',
                                                }}>{o}</button>
                                        ))}
                                    </div>
                                ) : (
                                    <input type="number" value={val} min="0"
                                        onChange={e => setVals(p => ({ ...p, [s.key]: e.target.value }))}
                                        className="w-36 px-4 py-3 rounded-xl text-white text-sm outline-none"
                                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                                )}
                            </div>
                            <div className="flex flex-col items-end gap-2 pt-6">
                                <button onClick={() => save(s.key)} disabled={saving === s.key}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white hover:brightness-110 disabled:opacity-50"
                                    style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
                                    {saving === s.key ? <div className="w-3 h-3 rounded-full border border-white/30 border-t-white animate-spin" /> : <Save size={12} />}
                                    Save
                                </button>
                                <span className="text-white/20 text-[10px]">{new Date(s.updated_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                );
            })}

            <button onClick={load} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium text-white/35 hover:text-white/60 transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <RefreshCw size={12} /> Refresh
            </button>
        </div>
    );
}
