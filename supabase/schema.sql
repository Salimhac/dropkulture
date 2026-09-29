-- =============================================================================
-- DROPKULTURE PLATFORM - SUPABASE PRODUCTION DATABASE SCHEMA
-- =============================================================================
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- It establishes all production tables, Row Level Security (RLS) policies,
-- automated user profile sync triggers, backfill routines, and admin management.
-- =============================================================================

-- Enable required extensions (gen_random_uuid is standard in Postgres 13+)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. PROFILES TABLE (Admins, Creators, Collectors)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT DEFAULT '',
  country TEXT DEFAULT 'Kenya',
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'creator', 'admin')),
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile or admins can update all" ON public.profiles;
DROP POLICY IF EXISTS "Only admins can delete profiles" ON public.profiles;

-- Anyone can view profiles (for creator listings, reviews, storefronts)
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

-- Allow profile creation during registration (works for both authenticated and new signups)
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id 
    OR auth.uid() IS NULL 
    OR auth.role() = 'anon' 
    OR auth.role() = 'authenticated'
  );

-- Users can update their own profile, or admins can update any profile
CREATE POLICY "Users can update own profile or admins can update all" 
  ON public.profiles FOR UPDATE 
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete profiles
CREATE POLICY "Only admins can delete profiles" 
  ON public.profiles FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- -----------------------------------------------------------------------------
-- 2. CREATORS TABLE (Storefront Profiles & Verification)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  creator_name TEXT,
  slug TEXT UNIQUE NOT NULL,
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  profile_image TEXT DEFAULT '',
  cover_url TEXT DEFAULT '',
  cover_image TEXT DEFAULT '',
  category TEXT NOT NULL CHECK (category IN ('MUSIC', 'COMEDY', 'SPORTS', 'GAMING', 'FASHION', 'LIFESTYLE')),
  country TEXT NOT NULL DEFAULT 'Kenya',
  country_code TEXT NOT NULL DEFAULT 'KE',
  flag TEXT NOT NULL DEFAULT '🇰🇪',
  social_stats JSONB DEFAULT '{"followers": "10K", "engagement": "5.0%"}'::jsonb,
  social_links JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('verified', 'pending', 'suspended')),
  verified BOOLEAN DEFAULT false,
  total_sales NUMERIC DEFAULT 0,
  gross_revenue NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public creators are viewable by everyone" ON public.creators;
DROP POLICY IF EXISTS "Creators can insert their own profile" ON public.creators;
DROP POLICY IF EXISTS "Creators can update own storefront or admins can update" ON public.creators;
DROP POLICY IF EXISTS "Admins can delete creators" ON public.creators;

CREATE POLICY "Public creators are viewable by everyone" 
  ON public.creators FOR SELECT 
  USING (true);

CREATE POLICY "Creators can insert their own profile" 
  ON public.creators FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id 
    OR auth.uid() IS NULL 
    OR auth.role() = 'anon' 
    OR auth.role() = 'authenticated'
  );

CREATE POLICY "Creators can update own storefront or admins can update" 
  ON public.creators FOR UPDATE 
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete creators" 
  ON public.creators FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- -----------------------------------------------------------------------------
-- 3. PRODUCTS TABLE (Merchandise Catalog)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE,
  creator_name TEXT NOT NULL,
  collection_id UUID,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  currency TEXT NOT NULL DEFAULT 'KES',
  category TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  in_stock BOOLEAN DEFAULT true,
  stock_count INTEGER DEFAULT 100,
  featured BOOLEAN DEFAULT false,
  is_drop BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public products viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Creators or admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Creators or admins can update products" ON public.products;
DROP POLICY IF EXISTS "Creators or admins can delete products" ON public.products;

CREATE POLICY "Public products viewable by everyone" 
  ON public.products FOR SELECT 
  USING (true);

CREATE POLICY "Creators or admins can insert products" 
  ON public.products FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.creators 
      WHERE id = creator_id AND user_id = auth.uid()
    ) 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
    OR auth.uid() IS NULL
  );

CREATE POLICY "Creators or admins can update products" 
  ON public.products FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.creators 
      WHERE id = creator_id AND user_id = auth.uid()
    ) 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Creators or admins can delete products" 
  ON public.products FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.creators 
      WHERE id = creator_id AND user_id = auth.uid()
    ) 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- -----------------------------------------------------------------------------
-- 4. COLLECTIONS & DROPS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE,
  creator_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  banner_image TEXT DEFAULT '',
  badge TEXT DEFAULT 'OFFICIAL DROP',
  start_date TIMESTAMPTZ DEFAULT now(),
  end_date TIMESTAMPTZ DEFAULT (now() + interval '14 days'),
  is_active BOOLEAN DEFAULT true,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'upcoming', 'ended')),
  items_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public collections viewable by everyone" ON public.collections;
DROP POLICY IF EXISTS "Creators or admins can manage collections" ON public.collections;

CREATE POLICY "Public collections viewable by everyone" 
  ON public.collections FOR SELECT 
  USING (true);

CREATE POLICY "Creators or admins can manage collections" 
  ON public.collections FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.creators 
      WHERE id = creator_id AND user_id = auth.uid()
    ) 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
    OR auth.uid() IS NULL
  );

-- -----------------------------------------------------------------------------
-- 5. ORDERS TABLE (Customer Purchases & Shipping)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT DEFAULT '',
  shipping_address JSONB NOT NULL,
  items JSONB NOT NULL,
  total_amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  payment_method TEXT NOT NULL CHECK (payment_method IN ('mpesa', 'card', 'crypto', 'paystack')),
  payment_status TEXT NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  fulfillment_status TEXT NOT NULL DEFAULT 'processing' CHECK (fulfillment_status IN ('processing', 'shipped', 'delivered', 'cancelled')),
  mpesa_receipt_number TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders (public checkout)" ON public.orders;
DROP POLICY IF EXISTS "Only admins can update or delete orders" ON public.orders;

CREATE POLICY "Users can view their own orders" 
  ON public.orders FOR SELECT 
  USING (
    customer_email = auth.jwt() ->> 'email'
    OR user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can create orders (public checkout)" 
  ON public.orders FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Only admins can update or delete orders" 
  ON public.orders FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- -----------------------------------------------------------------------------
-- 6. AUTOMATIC TRIGGER: SYNC SUPABASE AUTH USERS TO PROFILES
-- -----------------------------------------------------------------------------
-- This trigger automatically fires every time a user signs up or is created in
-- Supabase Authentication. It runs with SECURITY DEFINER to bypass RLS safely.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, full_name, email, phone, country, role, avatar_url)
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
    -- Never abort auth.users transaction if profile insert encounters any conflict
    RAISE WARNING 'handle_new_user error: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 7. BACKFILL EXISTING SUPABASE AUTH USERS INTO PROFILES TABLE
-- -----------------------------------------------------------------------------
-- If users were created in Supabase Authentication before the trigger was created,
-- this query backfills all existing auth users into the profiles table:
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

-- =============================================================================
-- 8. HOW TO ASSIGN AN ADMINISTRATOR
-- =============================================================================
-- Run this command in SQL Editor (replace with your admin email):
--
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE email = 'YOUR_ADMIN_EMAIL@example.com';
-- =============================================================================

-- =============================================================================
-- 9. SUPABASE STORAGE BUCKETS (Avatars, Product Images, Covers)
-- =============================================================================
-- Provision storage buckets for creator avatars, product apparel pictures, and banners
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/heic']),
  ('products', 'products', true, 15728640, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/heic']),
  ('covers', 'covers', true, 15728640, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/heic'])
ON CONFLICT (id) DO UPDATE 
SET public = true,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS Policies: Public read access for images (CDN)
DROP POLICY IF EXISTS "Public storage read access for avatars" ON storage.objects;
CREATE POLICY "Public storage read access for avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('avatars', 'products', 'covers'));

-- Storage RLS Policies: Authenticated and anonymous uploads allowed for creator onboarding and products
DROP POLICY IF EXISTS "Allow uploads to avatars, products, and covers" ON storage.objects;
CREATE POLICY "Allow uploads to avatars, products, and covers"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id IN ('avatars', 'products', 'covers'));

DROP POLICY IF EXISTS "Allow updates to avatars, products, and covers" ON storage.objects;
CREATE POLICY "Allow updates to avatars, products, and covers"
  ON storage.objects FOR UPDATE
  USING (bucket_id IN ('avatars', 'products', 'covers'));

DROP POLICY IF EXISTS "Allow deletes on avatars, products, and covers" ON storage.objects;
CREATE POLICY "Allow deletes on avatars, products, and covers"
  ON storage.objects FOR DELETE
  USING (bucket_id IN ('avatars', 'products', 'covers'));

