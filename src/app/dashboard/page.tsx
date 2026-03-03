import { createClient } from '@/lib/supabase/server';
import { Sparkles, Image as ImageIcon, Zap, TrendingUp, ArrowRight, Clock, Crown } from 'lucide-react';
import Link from 'next/link';
import DynamicGreeting from '@/components/dashboard/DynamicGreeting';
import type { Profile, GeneratedImage } from '@/types/database';

export default async function DashboardOverviewPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const [{ data: profileData }, { data: recentImagesData, count }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user!.id).single(),
        supabase.from('generated_images').select('*', { count: 'exact' }).eq('user_id', user!.id).order('created_at', { ascending: false }).limit(6),
    ]);

    const profile = profileData as unknown as Profile | null;
    const recentImages = recentImagesData as unknown as GeneratedImage[] | null;
    const totalImages = count ?? 0;
    const credits = profile?.credits ?? 0;
    const plan = profile?.plan ?? 'free';
    const firstName = profile?.full_name?.split(' ')[0] || 'Creator';

    return (
        <div className="space-y-8">
            {/* Hero Welcome Banner */}
            <div className="relative rounded-3xl overflow-hidden p-8"
                style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.25) 0%, rgba(219,39,119,0.15) 50%, rgba(14,165,233,0.1) 100%)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="absolute inset-0 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(rgba(139,92,246,0.3) 1px, transparent 1px)', backgroundSize: '28px 28px', opacity: 0.3 }} />
                <div className="absolute top-4 right-4 w-48 h-48 rounded-full pointer-events-none opacity-20"
                    style={{ background: 'radial-gradient(circle, #c084fc, transparent 70%)' }} />
                <div className="relative z-10">
                    <DynamicGreeting />
                    <h1 className="text-4xl font-display font-black text-white mb-2">
                        Welcome back, <span style={{ background: 'linear-gradient(135deg,#c084fc,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{firstName}</span> ✦
                    </h1>
                    <p className="text-white/40 text-base mb-6">
                        {totalImages === 0 ? "You haven't created anything yet — let's change that." : `You've created ${totalImages} artwork${totalImages !== 1 ? 's' : ''} so far. Keep going!`}
                    </p>
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/generate"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white text-sm transition-all hover:scale-105"
                            style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)', boxShadow: '0 0 24px rgba(124,58,237,0.4)' }}>
                            <Sparkles size={15} /> Create New Art <ArrowRight size={14} />
                        </Link>
                        <Link href="/dashboard/gallery"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-white/70 text-sm transition-all hover:text-white hover:scale-105"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <ImageIcon size={15} /> View Gallery
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    {
                        label: 'Credits Remaining', value: credits,
                        sub: credits === 0 ? 'Upgrade for more' : `of ${plan === 'free' ? '10' : plan === 'pro' ? '500' : '∞'} total`,
                        icon: Zap, gradient: 'from-violet-600 to-purple-500', glow: '#7c3aed33', link: credits === 0 ? '/upgrade' : null,
                    },
                    {
                        label: 'Images Generated', value: totalImages,
                        sub: totalImages === 0 ? 'Start creating!' : 'Total artworks',
                        icon: ImageIcon, gradient: 'from-pink-600 to-rose-500', glow: '#db277733', link: totalImages > 0 ? '/dashboard/gallery' : '/dashboard/generate',
                    },
                    {
                        label: 'Active Plan', value: plan,
                        sub: plan === 'free' ? 'Upgrade to unlock more' : 'Active subscription',
                        icon: TrendingUp, gradient: 'from-cyan-600 to-sky-500', glow: '#0ea5e933', link: plan === 'free' ? '/upgrade' : null,
                    },
                ].map(({ label, value, sub, icon: Icon, gradient, link }) => (
                    <div key={label} className="relative rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] hover:brightness-110"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`}>
                            <Icon size={20} className="text-white" />
                        </div>
                        <p className="text-white/40 text-xs mb-1 uppercase tracking-widest font-semibold">{label}</p>
                        <p className="text-3xl font-display font-black text-white capitalize mb-1">{value}</p>
                        <p className="text-white/30 text-xs">{sub}</p>
                        {link && (
                            <Link href={link} className="absolute inset-0 rounded-2xl" aria-label={label} />
                        )}
                    </div>
                ))}
            </div>


            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl p-6 relative overflow-hidden group"
                    style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(219,39,119,0.08))', border: '1px solid rgba(124,58,237,0.2)' }}>
                    <div className="absolute right-4 top-4 w-24 h-24 rounded-full pointer-events-none"
                        style={{ background: 'radial-gradient(circle,rgba(192,132,252,0.2),transparent 70%)' }} />
                    <Sparkles size={24} className="text-purple-400 mb-3" />
                    <h3 className="text-lg font-display font-bold text-white mb-1">Generate Image</h3>
                    <p className="text-white/35 text-sm mb-4">Transform your words into stunning artwork</p>
                    <Link href="/dashboard/generate" className="inline-flex items-center gap-2 text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors">
                        Start creating <ArrowRight size={14} />
                    </Link>
                </div>

                <div className="rounded-2xl p-6 relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.1), rgba(6,182,212,0.05))', border: '1px solid rgba(14,165,233,0.15)' }}>
                    <div className="absolute right-4 top-4 w-24 h-24 rounded-full pointer-events-none"
                        style={{ background: 'radial-gradient(circle,rgba(56,189,248,0.2),transparent 70%)' }} />
                    {plan === 'free' ? <Crown size={24} className="text-cyan-400 mb-3" /> : <ImageIcon size={24} className="text-cyan-400 mb-3" />}
                    <h3 className="text-lg font-display font-bold text-white mb-1">{plan === 'free' ? 'Upgrade to Pro' : 'My Gallery'}</h3>
                    <p className="text-white/35 text-sm mb-4">{plan === 'free' ? '500 credits/mo · HD images · Private gallery' : `${totalImages} artwork${totalImages !== 1 ? 's' : ''} saved`}</p>
                    <Link href={plan === 'free' ? '/upgrade' : '/dashboard/gallery'} className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                        {plan === 'free' ? 'View plans' : 'Browse gallery'} <ArrowRight size={14} />
                    </Link>
                </div>
            </div>

            {/* Recent Creations */}
            {recentImages && recentImages.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Clock size={16} className="text-white/40" />
                            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-widest">Recent Creations</h3>
                        </div>
                        <Link href="/dashboard/gallery" className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
                            View all <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                        {recentImages.map((img) => (
                            <div key={img.id} className="aspect-square rounded-xl overflow-hidden relative group cursor-pointer"
                                style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={img.image_url} alt={img.prompt}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
