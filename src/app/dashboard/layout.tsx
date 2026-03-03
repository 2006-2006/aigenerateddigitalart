import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import type { Profile } from '@/types/database';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    const profile = profileData as unknown as Profile | null;

    if (profile?.role === 'admin' || profile?.role === 'super_admin') {
        redirect('/admin');
    }

    return (
        <div className="flex h-screen bg-dark-200 overflow-hidden">
            <DashboardSidebar user={user} profile={profile} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <DashboardHeader user={user} profile={profile} />
                <main className="flex-1 overflow-y-auto p-6 bg-dark-200">
                    {children}
                </main>
            </div>
        </div>
    );
}
