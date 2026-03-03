-- ============================================================
-- Enterprise Admin Refactor Migration
-- Apply this in the Supabase SQL Editor
-- ============================================================

-- 1. Modify public.profiles (acting as users table)
-- Update roles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'moderator', 'admin', 'super_admin'));

-- Add new columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'banned'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';

-- Update existing plan to subscription_tier if needed, but we rely on plan for now. Let's sync them.
UPDATE public.profiles SET subscription_tier = plan WHERE subscription_tier IS NULL OR subscription_tier = 'free';

-- 2. Create credit_history table
CREATE TABLE IF NOT EXISTS public.credit_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    change_amount INTEGER NOT NULL,
    previous_balance INTEGER NOT NULL,
    new_balance INTEGER NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    previous_data JSONB,
    new_data JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security for new tables
-- ============================================================

ALTER TABLE public.credit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view credit history
CREATE POLICY "credit_history_select_admin" ON public.credit_history
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin'))
    );

-- Users can view their own credit history
CREATE POLICY "credit_history_select_own" ON public.credit_history
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can insert credit history (via server actions mostly, but good to have)
CREATE POLICY "credit_history_insert_admin" ON public.credit_history
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin'))
    );

-- Admins can view audit logs
CREATE POLICY "audit_logs_select_admin" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin'))
    );

-- Admins can insert audit logs
CREATE POLICY "audit_logs_insert_admin" ON public.audit_logs
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin'))
    );

-- Prevent unauthorized updates to credits (RLS on profiles already protects this to admins)
-- The existing policy "profiles_update_admin" already limits updates to profiles to admin users.
