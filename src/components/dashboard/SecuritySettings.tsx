'use client';

import { useState } from 'react';
import { Shield, CheckCircle, Loader2, Key, Smartphone } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Props {
    email: string;
}

export default function SecuritySettings({ email }: Props) {
    const [pwState, setPwState] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
    const [pwMsg, setPwMsg] = useState('');
    const [mfaState, setMfaState] = useState<'idle' | 'loading' | 'enrolling' | 'error'>('idle');
    const [qrCode, setQrCode] = useState('');
    const [totpUri, setTotpUri] = useState('');
    const [verifyCode, setVerifyCode] = useState('');
    const [factorId, setFactorId] = useState('');
    const [mfaMsg, setMfaMsg] = useState('');
    const [mfaDone, setMfaDone] = useState(false);

    async function handlePasswordReset() {
        setPwState('loading');
        setPwMsg('');
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
            });
            if (error) { setPwState('error'); setPwMsg(error.message); }
            else { setPwState('sent'); setPwMsg(`Password reset link sent to ${email}`); }
        } catch {
            setPwState('error');
            setPwMsg('Something went wrong. Please try again.');
        }
    }

    async function handleEnable2FA() {
        setMfaState('loading');
        setMfaMsg('');
        try {
            const supabase = createClient();
            const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Spirit AI' });
            if (error) { setMfaState('error'); setMfaMsg(error.message); return; }
            setQrCode(data.totp.qr_code);
            setTotpUri(data.totp.uri);
            setFactorId(data.id);
            setMfaState('enrolling');
        } catch {
            setMfaState('error');
            setMfaMsg('Failed to start 2FA setup.');
        }
    }

    async function handleVerify2FA() {
        if (verifyCode.length !== 6) { setMfaMsg('Enter the 6-digit code from your app.'); return; }
        setMfaMsg('');
        try {
            const supabase = createClient();
            const { data: challenge } = await supabase.auth.mfa.challenge({ factorId });
            const { error } = await supabase.auth.mfa.verify({
                factorId,
                challengeId: challenge!.id,
                code: verifyCode,
            });
            if (error) { setMfaMsg(error.message); }
            else { setMfaDone(true); setMfaState('idle'); }
        } catch {
            setMfaMsg('Verification failed. Please try again.');
        }
    }

    return (
        <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <Shield size={18} className="text-white" />
                </div>
                <h2 className="text-base font-semibold text-white">Security</h2>
            </div>

            <div className="space-y-0 divide-y divide-white/10">
                {/* Password Reset */}
                <div className="flex items-center justify-between py-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Key size={14} className="text-white/40" />
                            <p className="text-white/80 text-sm font-medium">Password</p>
                        </div>
                        {pwState === 'sent' ? (
                            <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                                <CheckCircle size={11} /> {pwMsg}
                            </p>
                        ) : pwState === 'error' ? (
                            <p className="text-red-400 text-xs mt-1">⚠ {pwMsg}</p>
                        ) : (
                            <p className="text-white/30 text-xs mt-1">
                                Send a reset link to {email}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={handlePasswordReset}
                        disabled={pwState === 'loading' || pwState === 'sent'}
                        className="btn-secondary text-xs px-4 py-2 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {pwState === 'loading' ? (
                            <><Loader2 size={12} className="animate-spin" /> Sending…</>
                        ) : pwState === 'sent' ? (
                            <><CheckCircle size={12} className="text-green-400" /> Sent!</>
                        ) : (
                            'Change'
                        )}
                    </button>
                </div>

                {/* 2FA */}
                <div className="py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <Smartphone size={14} className="text-white/40" />
                                <p className="text-white/80 text-sm font-medium">Two-Factor Authentication</p>
                            </div>
                            {mfaDone ? (
                                <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                                    <CheckCircle size={11} /> 2FA is now enabled on your account
                                </p>
                            ) : (
                                <p className="text-white/30 text-xs mt-1">
                                    {mfaState === 'enrolling' ? 'Scan the QR code with your authenticator app' : 'Add an extra layer of protection'}
                                </p>
                            )}
                        </div>
                        {!mfaDone && mfaState !== 'enrolling' && (
                            <button
                                onClick={handleEnable2FA}
                                disabled={mfaState === 'loading'}
                                className="btn-secondary text-xs px-4 py-2 flex items-center gap-2 disabled:opacity-50"
                            >
                                {mfaState === 'loading' ? (
                                    <><Loader2 size={12} className="animate-spin" /> Setting up…</>
                                ) : (
                                    'Enable'
                                )}
                            </button>
                        )}
                    </div>

                    {/* QR code flow */}
                    {mfaState === 'enrolling' && !mfaDone && (
                        <div className="mt-5 p-5 rounded-2xl border border-white/10 bg-white/3 space-y-4">
                            <div className="flex justify-center">
                                {qrCode && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={qrCode} alt="2FA QR Code" className="w-40 h-40 rounded-xl border border-white/10 bg-white p-1" />
                                )}
                            </div>
                            <p className="text-white/50 text-xs text-center">
                                Scan with <strong className="text-white/70">Google Authenticator</strong> or <strong className="text-white/70">Authy</strong>, then enter the 6-digit code below.
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={verifyCode}
                                    onChange={e => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                                    placeholder="000000"
                                    className="input-field flex-1 text-center tracking-[0.4em] font-mono text-lg"
                                />
                                <button
                                    onClick={handleVerify2FA}
                                    className="btn-primary px-5 py-2.5 text-sm"
                                >
                                    Verify
                                </button>
                            </div>
                            {mfaMsg && (
                                <p className="text-red-400 text-xs text-center">⚠ {mfaMsg}</p>
                            )}
                            <details className="text-xs text-white/30">
                                <summary className="cursor-pointer hover:text-white/50 transition-colors">Can&apos;t scan? Enter manually</summary>
                                <p className="mt-2 font-mono text-[10px] break-all bg-white/5 p-2 rounded-lg">{totpUri}</p>
                            </details>
                        </div>
                    )}

                    {mfaState === 'error' && (
                        <p className="text-red-400 text-xs mt-2">⚠ {mfaMsg}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
