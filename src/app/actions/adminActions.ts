'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const creditUpdateSchema = z.object({
    userId: z.string().uuid(),
    amountChange: z.number().int(),
    reason: z.string().min(1)
});

const userUpdateSchema = z.object({
    userId: z.string().uuid(),
    role: z.enum(['user', 'moderator', 'admin', 'super_admin']).optional(),
    status: z.enum(['active', 'banned']).optional(),
    plan: z.string().optional(),
});

/**
 * Atomic credit update via RPC
 */
export async function updateCreditsAction(formData: FormData) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        const typedProfile = profile as { role: string } | null;
        if (!typedProfile || !['admin', 'super_admin'].includes(typedProfile.role)) {
            throw new Error('Forbidden');
        }

        const rawData = {
            userId: formData.get('userId'),
            amountChange: parseInt(formData.get('amountChange') as string, 10),
            reason: formData.get('reason'),
        };

        const validated = creditUpdateSchema.parse(rawData);

        // Cast to any to avoid "target_user_id not in undefined" errors if RPC not in types
        const { data, error } = await (supabase as any).rpc('admin_update_credits', {
            target_user_id: validated.userId,
            admin_id: user.id,
            amount_change: validated.amountChange,
            reason_text: validated.reason
        });

        if (error) throw new Error(error.message);

        revalidatePath('/admin/users');
        revalidatePath('/admin/credits');
        return { success: true, data };
    } catch (e: unknown) {
        return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
    }
}

/**
 * Update user metadata (Role, Plan, Status)
 */
export async function updateUserAction(formData: FormData) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        const typedProfile = profile as { role: string } | null;
        if (!typedProfile || !['admin', 'super_admin', 'moderator'].includes(typedProfile.role)) {
            throw new Error('Forbidden');
        }

        const validated = userUpdateSchema.parse({
            userId: formData.get('userId'),
            role: formData.get('role') || undefined,
            status: formData.get('status') || undefined,
            plan: formData.get('plan') || undefined,
        });

        // Prevention: moderator cannot change role to admin or ban admins
        if (typedProfile.role === 'moderator' && (validated.role || validated.status)) {
            throw new Error('Moderators cannot change roles or ban users');
        }

        const { error } = await (supabase as any)
            .from('profiles')
            .update({
                role: validated.role,
                status: validated.status,
                plan: validated.plan,
                updated_at: new Date().toISOString(),
            })
            .eq('id', validated.userId);

        if (error) throw new Error(error.message);

        // Audit log
        await (supabase as any).from('audit_logs').insert({
            admin_id: user.id,
            action_type: 'USER_UPDATE',
            entity_type: 'USER',
            entity_id: validated.userId,
            new_data: validated
        });

        revalidatePath('/admin/users');
        return { success: true };
    } catch (e: unknown) {
        return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
    }
}

/**
 * Destructive: Delete user from Auth & DB
 */
export async function deleteUserAction(userId: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        const typedProfile = profile as { role: string } | null;
        if (!typedProfile || typedProfile.role !== 'super_admin') {
            throw new Error('Only super_admins can delete users');
        }

        const { createClient: createAdminClient } = await import('@supabase/supabase-js');
        const adminClient = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { error } = await adminClient.auth.admin.deleteUser(userId);
        if (error) throw new Error(error.message);

        await (supabase as any).from('audit_logs').insert({
            admin_id: user.id,
            action_type: 'USER_DELETE',
            entity_type: 'USER',
            entity_id: userId,
        });

        revalidatePath('/admin/users');
        return { success: true };
    } catch (e: unknown) {
        return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
    }
}
