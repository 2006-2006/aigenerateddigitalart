-- Atomic credit update with audit logging
CREATE OR REPLACE FUNCTION public.admin_update_credits(
    target_user_id UUID,
    admin_id UUID,
    amount_change INTEGER,
    reason_text TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    old_bal INTEGER;
    new_bal INTEGER;
    res JSONB;
BEGIN
    -- 1. Get current balance
    SELECT credits INTO old_bal FROM public.profiles WHERE id = target_user_id;
    
    -- 2. Calculate new balance (prevent negative credits)
    new_bal := GREATEST(0, old_bal + amount_change);
    
    -- 3. Update profile
    UPDATE public.profiles 
    SET credits = new_bal, updated_at = NOW() 
    WHERE id = target_user_id;
    
    -- 4. Log to credit_history if the table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credit_history') THEN
        INSERT INTO public.credit_history (user_id, admin_id, change_amount, previous_balance, new_balance, reason)
        VALUES (target_user_id, admin_id, amount_change, old_bal, new_bal, reason_text);
    END IF;
    
    -- 5. Log to audit_logs if the table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        INSERT INTO public.audit_logs (admin_id, action_type, entity_type, entity_id, previous_data, new_data)
        VALUES (admin_id, 'CREDIT_UPDATE', 'USER', target_user_id::TEXT, jsonb_build_object('credits', old_bal), jsonb_build_object('credits', new_bal, 'reason', reason_text));
    END IF;

    SELECT jsonb_build_object('success', true, 'new_credits', new_bal) INTO res;
    RETURN res;
END;
$$;
-- ============================================================
-- Spirit AI — Complete Supabase Schema v2
-- Run this in Supabase SQL Editor: supabase.com/dashboard
-- ============================================================

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  full_name    TEXT,
  avatar_url   TEXT,
  credits      INTEGER NOT NULL DEFAULT 10,
  plan         TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  role         TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin', 'super_admin')),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Generated images table
CREATE TABLE IF NOT EXISTS public.generated_images (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  prompt          TEXT NOT NULL,
  negative_prompt TEXT,
  model           TEXT NOT NULL,
  provider        TEXT NOT NULL CHECK (provider IN ('groq', 'gemini', 'openrouter')),
  resolution      TEXT NOT NULL DEFAULT '1024x1024',
  image_url       TEXT NOT NULL,
  storage_path    TEXT NOT NULL,
  is_public       BOOLEAN NOT NULL DEFAULT FALSE,
  credits_used    INTEGER NOT NULL DEFAULT 1,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Platform settings table (admin configurable)
CREATE TABLE IF NOT EXISTS public.platform_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  description TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_by  UUID REFERENCES public.profiles(id)
);

-- Default settings
INSERT INTO public.platform_settings (key, value, description)
VALUES
  ('trial_credits', '10', 'Number of free credits given to new users on signup'),
  ('max_free_resolution', '1024x1024', 'Maximum resolution for free plan users'),
  ('generation_enabled', 'true', 'Global toggle to enable/disable image generation'),
  ('maintenance_mode', 'false', 'Put platform in maintenance mode')
ON CONFLICT (key) DO NOTHING;

-- 4. Credit history table
CREATE TABLE IF NOT EXISTS public.credit_history (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  admin_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  change_amount    INTEGER NOT NULL,
  previous_balance INTEGER NOT NULL,
  new_balance      INTEGER NOT NULL,
  reason           TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_type   TEXT NOT NULL,
  entity_type   TEXT NOT NULL,
  entity_id     TEXT,
  previous_data JSONB,
  new_data      JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_images  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_history    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs        ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "profiles_select_own"      ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"      ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin"    ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin"    ON public.profiles;
DROP POLICY IF EXISTS "images_select_own"        ON public.generated_images;
DROP POLICY IF EXISTS "images_insert_own"        ON public.generated_images;
DROP POLICY IF EXISTS "images_update_own"        ON public.generated_images;
DROP POLICY IF EXISTS "images_delete_own"        ON public.generated_images;
DROP POLICY IF EXISTS "images_select_public"     ON public.generated_images;
DROP POLICY IF EXISTS "settings_select_all"      ON public.platform_settings;
DROP POLICY IF EXISTS "settings_update_admin"    ON public.platform_settings;
DROP POLICY IF EXISTS "credit_history_select_own" ON public.credit_history;
DROP POLICY IF EXISTS "credit_history_select_admin" ON public.credit_history;
DROP POLICY IF EXISTS "audit_logs_select_admin"  ON public.audit_logs;

-- Profiles: own row
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Profiles: admin can see and update all
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin', 'moderator'))
  );

CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin'))
  );

-- Images: own CRUD
CREATE POLICY "images_select_own" ON public.generated_images
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "images_insert_own" ON public.generated_images
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "images_update_own" ON public.generated_images
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "images_delete_own" ON public.generated_images
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "images_select_public" ON public.generated_images
  FOR SELECT USING (is_public = TRUE);

-- Platform settings: all authenticated users can read
CREATE POLICY "settings_select_all" ON public.platform_settings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can update settings
CREATE POLICY "settings_update_admin" ON public.platform_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin'))
  );

-- Credit history policies
CREATE POLICY "credit_history_select_own" ON public.credit_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "credit_history_select_admin" ON public.credit_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin', 'moderator'))
  );

-- Audit logs policies
CREATE POLICY "audit_logs_select_admin" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin'))
  );

-- ============================================================
-- Auto-create profile on signup (reads trial_credits from settings)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Optimized: Using a constant instead of a lookup to speed up auth
  INSERT INTO public.profiles (id, email, full_name, credits, plan, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    10, -- Default trial credits
    'free',
    'user'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Auto-updated_at trigger
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- Storage Bucket
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-images', 'generated-images', TRUE)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "storage_upload_own"    ON storage.objects;
DROP POLICY IF EXISTS "storage_select_public" ON storage.objects;
DROP POLICY IF EXISTS "storage_delete_own"    ON storage.objects;

CREATE POLICY "storage_upload_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'generated-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "storage_select_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'generated-images');

CREATE POLICY "storage_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'generated-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_generated_images_user_id    ON public.generated_images(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_created_at ON public.generated_images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_images_is_public  ON public.generated_images(is_public);
CREATE INDEX IF NOT EXISTS idx_profiles_role               ON public.profiles(role);

-- ============================================================
-- TO MAKE YOURSELF AN ADMIN:
-- After signing up, run this in SQL Editor with your email:
-- UPDATE public.profiles SET role = 'super_admin' WHERE email = 'your@email.com';
-- ============================================================
