-- =============================================================================
-- FIX: "Database error saving new user" IN SUPABASE AUTH
-- =============================================================================
-- Paste and run this script in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Run
--
-- Why this happens: A previous trigger called a function (e.g. digest() from pgcrypto)
-- or failed on a table constraint, causing Postgres to abort the user signup.
-- This script replaces it with a 100% safe, fault-tolerant trigger.
-- =============================================================================

-- 1. Ensure public.profiles table exists and has unique constraint on email
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  country TEXT DEFAULT 'Kenya',
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'creator', 'admin')),
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure unique constraint on email for upserts
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_email_unique'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);
  END IF;
EXCEPTION
  WHEN duplicate_table OR duplicate_object THEN NULL;
END $$;

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow inserts during signup without RLS restriction
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile or admins can update all" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update own profile or admins can update all" 
  ON public.profiles FOR UPDATE 
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 2. Drop any previous failing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Create bulletproof trigger function with EXCEPTION handling
-- (Uses standard md5() - zero external extensions required)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    user_id, 
    full_name, 
    email, 
    phone, 
    country, 
    role, 
    avatar_url
  )
  VALUES (
    gen_random_uuid(),
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    COALESCE(new.raw_user_meta_data->>'country', 'Kenya'),
    COALESCE(new.raw_user_meta_data->>'role', 'customer'),
    COALESCE(
      new.raw_user_meta_data->>'avatar_url',
      'https://api.dicebear.com/7.x/micah/svg?seed=' || md5(new.email)
    )
  )
  ON CONFLICT (email) DO UPDATE
  SET 
    user_id = EXCLUDED.user_id,
    full_name = CASE 
      WHEN public.profiles.full_name IS NULL OR public.profiles.full_name = '' 
      THEN EXCLUDED.full_name 
      ELSE public.profiles.full_name 
    END,
    phone = CASE 
      WHEN public.profiles.phone IS NULL OR public.profiles.phone = '' 
      THEN EXCLUDED.phone 
      ELSE public.profiles.phone 
    END,
    country = CASE 
      WHEN public.profiles.country IS NULL OR public.profiles.country = '' 
      THEN EXCLUDED.country 
      ELSE public.profiles.country 
    END,
    role = CASE 
      WHEN public.profiles.role = 'admin' THEN 'admin' 
      ELSE COALESCE(public.profiles.role, EXCLUDED.role) 
    END;
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- CRITICAL: Never abort auth.users transaction on profile failure!
    RAISE WARNING 'handle_new_user warning: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-attach trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Backfill any existing users from auth.users who are missing from profiles
INSERT INTO public.profiles (id, user_id, full_name, email, phone, country, role, avatar_url)
SELECT 
  gen_random_uuid(),
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  u.email,
  COALESCE(u.raw_user_meta_data->>'phone', ''),
  COALESCE(u.raw_user_meta_data->>'country', 'Kenya'),
  COALESCE(u.raw_user_meta_data->>'role', 'customer'),
  COALESCE(
    u.raw_user_meta_data->>'avatar_url',
    'https://api.dicebear.com/7.x/micah/svg?seed=' || md5(u.email)
  )
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.user_id = u.id OR p.email = u.email
)
ON CONFLICT (email) DO UPDATE 
SET user_id = EXCLUDED.user_id;
