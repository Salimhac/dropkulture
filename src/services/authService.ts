import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, Creator, UserRole, CategoryType } from '../types';
import { dbService } from './supabaseService';

const AUTH_USER_KEY = 'dropkulture_auth_user';
const PROFILES_KEY = 'dropkulture_db_profiles';

const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export interface CustomerRegisterData {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  country: string;
}

export interface CreatorRegisterData {
  fullName: string;
  creatorName: string;
  email: string;
  password: string;
  phone: string;
  country: string;
  category: CategoryType;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  x?: string;
  profileImage: string;
  bio: string;
}

// Zero mock accounts: Accounts are registered through the app or Supabase Auth
const DEFAULT_PROFILES: UserProfile[] = [];

function getStoredProfiles(): UserProfile[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (!raw) {
      localStorage.setItem(PROFILES_KEY, JSON.stringify(DEFAULT_PROFILES));
      return DEFAULT_PROFILES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PROFILES;
  }
}

function saveProfiles(profiles: UserProfile[]) {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.error('Error saving profiles:', e);
  }
}

// Helper to provide actionable error explanations for Supabase Auth failures
function formatSupabaseAuthError(error: any): Error {
  if (!error) return new Error('Authentication failed');
  const msg = error.message || String(error);
  const lower = msg.toLowerCase();

  if (lower.includes('user already registered') || lower.includes('already registered') || lower.includes('user already exists') || lower.includes('email already')) {
    return new Error('An account with this email address already exists. Please sign in instead.');
  }

  if (lower.includes('phone') && (lower.includes('already') || lower.includes('exists') || lower.includes('registered'))) {
    return new Error('An account with this phone number is already registered.');
  }

  if (lower.includes('security purposes') || lower.includes('once every') || lower.includes('rate limit')) {
    return new Error('For security reasons, password recovery emails can only be sent once every 60 seconds. Please check your inbox or wait a moment before trying again.');
  }

  if (lower.includes('database error saving new user')) {
    return new Error(
      'Database error saving new user: An internal trigger on auth.users encountered an error in your Supabase database. Please execute the script in supabase/fix_trigger.sql in your Supabase SQL Editor.'
    );
  }
  return new Error(msg);
}

// Session Storage Helper: Ensures sensitive user sessions are stored strictly in sessionStorage
// (automatically destroyed when browser tab/window is closed, never written to disk in localStorage).
function getSessionUser(): UserProfile | null {
  try {
    if (typeof window === 'undefined') return null;
    // Scrub legacy localStorage session so it never persists there
    localStorage.removeItem(AUTH_USER_KEY);
    const raw = sessionStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setSessionUser(profile: UserProfile | null) {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTH_USER_KEY);
    if (profile) {
      sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(profile));
    } else {
      sessionStorage.removeItem(AUTH_USER_KEY);
    }
  } catch (e) {
    console.error('Error writing session:', e);
  }
}

export const authService = {
  // Get current active session user (retrieved strictly from sessionStorage)
  getCurrentUser(): UserProfile | null {
    return getSessionUser();
  },

  // 1. REGISTER CUSTOMER (FAN)
  async registerCustomer(data: CustomerRegisterData): Promise<UserProfile> {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPhone = (data.phone || '').trim();

    // Check existing stored profiles first (local fallback store)
    const existingProfiles = getStoredProfiles();
    if (existingProfiles.some(p => p.email?.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email address already exists. Please sign in instead.');
    }
    if (cleanPhone && existingProfiles.some(p => p.phone && p.phone.trim() === cleanPhone)) {
      throw new Error('An account with this phone number is already registered.');
    }

    let authUid = generateUUID();
    const profileId = generateUUID();

    if (isSupabaseConfigured()) {
      // Check if profile with email or phone already exists in Supabase profiles table
      try {
        const { data: existingByEmail } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (existingByEmail) {
          throw new Error('An account with this email address already exists. Please sign in instead.');
        }

        if (cleanPhone) {
          const { data: existingByPhone } = await supabase
            .from('profiles')
            .select('id, phone')
            .eq('phone', cleanPhone)
            .maybeSingle();

          if (existingByPhone) {
            throw new Error('An account with this phone number is already registered.');
          }
        }
      } catch (err: any) {
        if (err.message && err.message.includes('already')) throw err;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName.trim(),
            phone: cleanPhone,
            country: data.country || 'Kenya',
            role: 'customer',
            avatar_url: `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(data.fullName.trim())}`,
          },
        },
      });

      if (authError) throw formatSupabaseAuthError(authError);

      // In Supabase, if email confirmation is turned off or user was already registered without returning an error
      if (authData?.user && Array.isArray(authData.user.identities) && authData.user.identities.length === 0) {
        throw new Error('An account with this email address already exists. Please sign in instead.');
      }

      // Assign the real Supabase Auth user ID
      if (authData.user) {
        authUid = authData.user.id;
      }

      // If session is not automatically active, try sign-in so client has active auth token for RLS
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session && data.password) {
        try {
          await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: data.password,
          });
        } catch {
          // Email confirmation may be pending
        }
      }
    }

    const newProfile: UserProfile = {
      id: profileId,
      user_id: authUid,
      full_name: data.fullName.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      country: data.country || 'Kenya',
      role: 'customer',
      avatar_url: `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(data.fullName.trim())}`,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      // 1. Insert or upsert into Supabase profiles table
      const { data: upsertData, error: insertError } = await supabase
        .from('profiles')
        .upsert(newProfile, { onConflict: 'email' })
        .select()
        .maybeSingle();

      if (insertError) {
        console.warn('Initial profiles insert notice:', insertError.message);
        // Fallback: try inserting with user_id as id (common schema variant)
        const fallback = { ...newProfile, id: authUid };
        const { data: fbData, error: fbError } = await supabase
          .from('profiles')
          .upsert(fallback, { onConflict: 'user_id' })
          .select()
          .maybeSingle();

        if (fbData) {
          Object.assign(newProfile, fbData);
        } else if (fbError) {
          console.error('Profiles fallback insert error:', fbError.message);
        }
      } else if (upsertData) {
        Object.assign(newProfile, upsertData);
      }
    }

    const profiles = getStoredProfiles();
    profiles.push(newProfile);
    saveProfiles(profiles);

    // Save session strictly in sessionStorage
    setSessionUser(newProfile);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dropkulture_users_changed', { detail: newProfile }));
    }

    return newProfile;
  },

  // 2. REGISTER CREATOR
  async registerCreator(data: CreatorRegisterData): Promise<{ user: UserProfile; creator: Creator }> {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPhone = (data.phone || '').trim();

    // Check existing stored profiles first (local fallback store)
    const existingProfiles = getStoredProfiles();
    if (existingProfiles.some(p => p.email?.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email address already exists. Please sign in instead.');
    }
    if (cleanPhone && existingProfiles.some(p => p.phone && p.phone.trim() === cleanPhone)) {
      throw new Error('An account with this phone number is already registered.');
    }

    let authUid = generateUUID();
    const profileId = generateUUID();
    const creatorId = generateUUID();

    if (isSupabaseConfigured()) {
      // Check if profile with email or phone already exists in Supabase profiles table
      try {
        const { data: existingByEmail } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (existingByEmail) {
          throw new Error('An account with this email address already exists. Please sign in instead.');
        }

        if (cleanPhone) {
          const { data: existingByPhone } = await supabase
            .from('profiles')
            .select('id, phone')
            .eq('phone', cleanPhone)
            .maybeSingle();

          if (existingByPhone) {
            throw new Error('An account with this phone number is already registered.');
          }
        }
      } catch (err: any) {
        if (err.message && err.message.includes('already')) throw err;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName.trim(),
            creator_name: data.creatorName.trim(),
            phone: cleanPhone,
            country: data.country || 'Kenya',
            role: 'creator',
            avatar_url: data.profileImage || `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(data.creatorName.trim())}`,
          },
        },
      });

      if (authError) throw formatSupabaseAuthError(authError);

      // In Supabase, if email confirmation is turned off or user was already registered without returning an error
      if (authData?.user && Array.isArray(authData.user.identities) && authData.user.identities.length === 0) {
        throw new Error('An account with this email address already exists. Please sign in instead.');
      }

      // Assign the real Supabase Auth user ID
      if (authData.user) {
        authUid = authData.user.id;
      }

      // Try establishing session if not already set
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session && data.password) {
        try {
          await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: data.password,
          });
        } catch {
          // Email confirmation may be pending
        }
      }
    }

    const newProfile: UserProfile = {
      id: profileId,
      user_id: authUid,
      full_name: data.fullName.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      country: data.country || 'Kenya',
      role: 'creator',
      avatar_url: data.profileImage || `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(data.creatorName.trim())}`,
      created_at: new Date().toISOString(),
    };

    // Calculate slug and ensure uniqueness
    const rawCreators = localStorage.getItem('dropkulture_db_creators');
    const existingCreators: Creator[] = rawCreators ? JSON.parse(rawCreators) : [];

    let baseSlug = data.creatorName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'creator';
    let slug = baseSlug;
    if (existingCreators.some(c => c.slug === slug)) {
      slug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const countryCode = data.country === 'Kenya' ? 'KE' : data.country === 'Nigeria' ? 'NG' : data.country === 'South Africa' ? 'ZA' : 'AF';
    const flag = data.country === 'Kenya' ? '🇰🇪' : data.country === 'Nigeria' ? '🇳🇬' : data.country === 'South Africa' ? '🇿🇦' : '🌍';

    const newCreator: Creator = {
      id: creatorId,
      user_id: authUid,
      slug,
      name: data.creatorName.trim(),
      creator_name: data.creatorName.trim(),
      category: data.category,
      country: data.country,
      countryCode,
      flag,
      avatarUrl: data.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      profile_image: data.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80',
      cover_image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80',
      tagline: data.bio ? (data.bio.slice(0, 60) + (data.bio.length > 60 ? '...' : '')) : 'Official DROPKULTURE Creator Brand',
      bio: data.bio || '',
      verified: false,
      status: 'pending', // Published to table as pending review for admin verification/suspension decision
      followerCount: '0',
      productCount: 0,
      socialLinks: {
        instagram: data.instagram,
        tiktok: data.tiktok,
        youtube: data.youtube,
        twitter: data.x,
        x: data.x,
      },
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
  // 1. Insert or upsert into profiles
  const { data: upsertData, error: profileErr } = await supabase
    .from('profiles')
    .upsert(newProfile, { onConflict: 'email' })
    .select()
    .maybeSingle();

  if (profileErr) {
    console.warn('Profiles upsert failed:', profileErr.message);
    const { data: fbData, error: fbErr } = await supabase
      .from('profiles')
      .upsert(newProfile, { onConflict: 'user_id' })
      .select()
      .maybeSingle();

    if (fbErr) {
      console.error('Profiles fallback failed:', fbErr.message);
      throw new Error(`Could not create profile: ${fbErr.message}`);
    }
    if (fbData) Object.assign(newProfile, fbData);
  } else if (upsertData) {
    Object.assign(newProfile, upsertData);
  }
    // 2. Insert or upsert into creators table (providing both name and creator_name for schema compatibility)
      const creatorPayload = {
  id: creatorId,
  user_id: authUid,
  creator_name: newCreator.name,
  slug: newCreator.slug,
  bio: newCreator.bio || '',
  category: newCreator.category,
  country: newCreator.country,
  profile_image: newCreator.avatarUrl,
  cover_image: newCreator.bannerUrl,
  instagram: newCreator.socialLinks.instagram || null,
  tiktok: newCreator.socialLinks.tiktok || null,
  youtube: newCreator.socialLinks.youtube || null,
  x: newCreator.socialLinks.x || null,
  status: 'pending',
  verified: false,
};

const { data: creatorData, error: creatorErr } = await supabase
  .from('creators')
  .upsert(creatorPayload, { onConflict: 'slug' })
  .select()
  .maybeSingle();

if (creatorErr) {
  console.error('❌ creators upsert failed:', creatorErr);
  throw new Error(`Could not create creator storefront: ${creatorErr.message}`);
}

if (creatorData) {
  Object.assign(newCreator, creatorData);
}
    }

    // Save in local storage store
    const profiles = getStoredProfiles();
    profiles.push(newProfile);
    saveProfiles(profiles);

    // Save creator in creators store
    existingCreators.unshift(newCreator);
    localStorage.setItem('dropkulture_db_creators', JSON.stringify(existingCreators));

    // Save session strictly in sessionStorage
    setSessionUser(newProfile);

    // Dispatch global events so admin console & storefront update immediately
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dropkulture_creators_changed', { detail: newCreator }));
      window.dispatchEvent(new CustomEvent('dropkulture_users_changed', { detail: newProfile }));
    }

    return { user: newProfile, creator: newCreator };
  },

  // 3. LOGIN (Unified)
  async login(email: string, password?: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured() && password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (error) throw error;

      if (data.user) {
        // Query profile from database
        let prof: UserProfile | null = null;

        // 1. Try lookup by user_id
        const { data: profById } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (profById) {
          prof = profById as UserProfile;
        } else {
          // 2. Try lookup by email
          const { data: profByEmail } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', cleanEmail)
            .maybeSingle();

          if (profByEmail) {
            prof = profByEmail as UserProfile;
            // Link Supabase auth user_id if not linked
            if (profByEmail.user_id !== data.user.id) {
              await supabase
                .from('profiles')
                .update({ user_id: data.user.id })
                .eq('id', profByEmail.id);
              prof.user_id = data.user.id;
            }
          }
        }

        // 3. AUTO-RECOVERY: If profile record is missing from profiles table, create it now!
        if (!prof) {
          const userMeta = data.user.user_metadata || {};
          const recoveredProfile: UserProfile = {
            id: generateUUID(),
            user_id: data.user.id,
            full_name: userMeta.full_name || userMeta.creator_name || cleanEmail.split('@')[0],
            email: cleanEmail,
            phone: userMeta.phone || '',
            country: userMeta.country || 'Kenya',
            role: (userMeta.role as UserRole) || 'customer',
            avatar_url: userMeta.avatar_url || `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(cleanEmail)}`,
            created_at: new Date().toISOString(),
          };

          const { data: savedProf } = await supabase
            .from('profiles')
            .upsert(recoveredProfile, { onConflict: 'email' })
            .select()
            .maybeSingle();

          prof = (savedProf as UserProfile) || recoveredProfile;
        }

        setSessionUser(prof);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('dropkulture_users_changed', { detail: prof }));
        }
        return prof;
      }
    }

    // Database / Stored profiles lookup
    const profiles = getStoredProfiles();
    const existing = profiles.find((p) => p.email.toLowerCase() === cleanEmail);

    if (existing) {
      setSessionUser(existing);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('dropkulture_users_changed', { detail: existing }));
      }
      return existing;
    }

    throw new Error('Account not found with this email. Please check your credentials or register a new account.');
  },

  // 3b. DEDICATED ADMIN LOGIN WITH SUPABASE AUTH INTEGRATION
  // Strictly verifies administrator role via Supabase Auth or database record; non-admins are rejected
  async adminLogin(email: string, password: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('Please enter administrator email address.');
    }
    if (!password) {
      throw new Error('Please enter administrator security password.');
    }

    // 1. If Supabase is configured, authenticate via Supabase Auth
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        throw new Error(error.message || 'Supabase authentication failed. Please verify credentials.');
      }

      if (data.user) {
        // Fetch user profile from database to verify administrator privileges
        let adminProf: UserProfile | null = null;

        // Try lookup by user_id
        const { data: profById } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (profById) {
          adminProf = profById as UserProfile;
        } else {
          // Fallback lookup by email
          const { data: profByEmail } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', cleanEmail)
            .maybeSingle();

          if (profByEmail) {
            adminProf = profByEmail as UserProfile;
            // Link Supabase auth user_id if not linked
            if (!profByEmail.user_id) {
              await supabase
                .from('profiles')
                .update({ user_id: data.user.id })
                .eq('id', profByEmail.id);
              adminProf.user_id = data.user.id;
            }
          }
        }

        // Check if admin role is designated in user_metadata or app_metadata
        const userMetaRole = data.user.user_metadata?.role || data.user.app_metadata?.role;

        if (!adminProf && userMetaRole === 'admin') {
          // User was created with admin metadata in Supabase Auth
          const newProfile: UserProfile = {
            id: generateUUID(),
            user_id: data.user.id,
            full_name: data.user.user_metadata?.full_name || 'Platform Administrator',
            email: cleanEmail,
            phone: data.user.user_metadata?.phone || '',
            country: data.user.user_metadata?.country || 'Kenya',
            role: 'admin',
            avatar_url: data.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(cleanEmail)}`,
            created_at: new Date().toISOString(),
          };
          try {
            await supabase.from('profiles').insert(newProfile);
          } catch (e) {
            console.error('Error inserting admin profile:', e);
          }
          adminProf = newProfile;
        }

        if (!adminProf) {
          await supabase.auth.signOut();
          throw new Error('Access Denied: No profile record found for this Supabase user. Please ensure the user has been assigned the "admin" role in the profiles table.');
        }

        if (adminProf.role !== 'admin') {
          // Immediately revoke session since this account is not an admin
          await supabase.auth.signOut();
          throw new Error(`Access Denied: This account is registered with role "${adminProf.role.toUpperCase()}" and does not possess administrator clearance.`);
        }

        setSessionUser(adminProf);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('dropkulture_users_changed', { detail: adminProf }));
        }
        return adminProf;
      }
    }

    // 2. Fallback mode when Supabase is not configured (offline / local testing)
    const profiles = getStoredProfiles();
    const existing = profiles.find((p) => p.email.toLowerCase() === cleanEmail);

    if (existing) {
      if (existing.role !== 'admin') {
        throw new Error(`Access Denied: This account is registered as a ${existing.role.toUpperCase()} and does not have administrator clearance.`);
      }
      setSessionUser(existing);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('dropkulture_users_changed', { detail: existing }));
      }
      return existing;
    }

    throw new Error('Access Denied: No administrator account matching these credentials was found. Please create an admin in your Supabase project or initialize one.');
  },

  // 3c. REGISTER AN ADMINISTRATOR (From Supabase or Local DB)
  async registerAdminAccount(data: { email: string; password?: string; fullName: string; phone?: string; country?: string }): Promise<UserProfile> {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPhone = (data.phone || '').trim();

    if (!cleanEmail) {
      throw new Error('Please enter administrator email address.');
    }
    if (!data.fullName.trim()) {
      throw new Error('Please enter administrator full name.');
    }

    const existingProfiles = getStoredProfiles();
    if (existingProfiles.some(p => p.email?.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email address already exists. Please sign in instead.');
    }
    if (cleanPhone && existingProfiles.some(p => p.phone && p.phone.trim() === cleanPhone)) {
      throw new Error('An account with this phone number is already registered.');
    }

    if (isSupabaseConfigured() && data.password) {
      try {
        const { data: existingByEmail } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (existingByEmail) {
          throw new Error('An account with this email address already exists. Please sign in instead.');
        }

        if (cleanPhone) {
          const { data: existingByPhone } = await supabase
            .from('profiles')
            .select('id, phone')
            .eq('phone', cleanPhone)
            .maybeSingle();

          if (existingByPhone) {
            throw new Error('An account with this phone number is already registered.');
          }
        }
      } catch (err: any) {
        if (err.message && err.message.includes('already')) throw err;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName.trim(),
            role: 'admin',
          },
        },
      });

      if (authError) throw formatSupabaseAuthError(authError);

      if (authData?.user && Array.isArray(authData.user.identities) && authData.user.identities.length === 0) {
        throw new Error('An account with this email address already exists. Please sign in instead.');
      }

      const authUid = authData.user?.id || generateUUID();
      const profileId = generateUUID();

      const newAdmin: UserProfile = {
        id: profileId,
        user_id: authUid,
        full_name: data.fullName.trim(),
        email: cleanEmail,
        phone: cleanPhone || '+254 700 000000',
        country: data.country || 'Kenya',
        role: 'admin',
        avatar_url: `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(data.fullName)}`,
        created_at: new Date().toISOString(),
      };

      const { data: upsertData, error: adminErr } = await supabase
        .from('profiles')
        .upsert(newAdmin, { onConflict: 'email' })
        .select()
        .maybeSingle();

      if (adminErr) {
        console.warn('Admin profile upsert notice:', adminErr.message);
        const fallback = { ...newAdmin, id: authUid };
        const { data: fbData } = await supabase
          .from('profiles')
          .upsert(fallback, { onConflict: 'user_id' })
          .select()
          .maybeSingle();
        if (fbData) Object.assign(newAdmin, fbData);
      } else if (upsertData) {
        Object.assign(newAdmin, upsertData);
      }

      const profiles = getStoredProfiles();
      profiles.unshift(newAdmin);
      saveProfiles(profiles);

      return newAdmin;
    }

    // Local / Offline mode
    const profiles = getStoredProfiles();
    const existing = profiles.find((p) => p.email.toLowerCase() === cleanEmail);
    if (existing) {
      existing.role = 'admin';
      existing.full_name = data.fullName.trim();
      saveProfiles(profiles);
      return existing;
    }

    const newAdmin: UserProfile = {
      id: 'prof-admin-' + Date.now(),
      user_id: 'user-admin-' + Date.now(),
      full_name: data.fullName.trim(),
      email: cleanEmail,
      phone: data.phone || '+254 700 000000',
      country: data.country || 'Kenya',
      role: 'admin',
      avatar_url: `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(data.fullName)}`,
      created_at: new Date().toISOString(),
    };

    profiles.unshift(newAdmin);
    saveProfiles(profiles);
    return newAdmin;
  },

  // 4. LOGOUT
  async logout(): Promise<void> {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setSessionUser(null);
  },

  // 5. PASSWORD RESET
  async resetPassword(email: string): Promise<boolean> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('Please enter a valid email address.');
    }

    if (isSupabaseConfigured()) {
      // Determine app redirect URL
      const redirectOrigin = typeof window !== 'undefined' ? window.location.origin : '';
      const redirectTo = redirectOrigin ? `${redirectOrigin}/#auth?mode=reset` : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo,
      });
      if (error) {
        throw formatSupabaseAuthError(error);
      }
      return true;
    }

    // Local / Offline store check
    const profiles = getStoredProfiles();
    const exists = profiles.some(p => p.email?.toLowerCase() === cleanEmail);
    if (!exists) {
      throw new Error('No registered account was found with this email address.');
    }
    return true;
  },

  // 5b. UPDATE PASSWORD (When authenticated or from password reset link)
  async updatePassword(newPassword: string): Promise<boolean> {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }
    if (isSupabaseConfigured()) {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        throw formatSupabaseAuthError(error);
      }
    }
    return true;
  },

  // 6. UPDATE PROFILE
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();
      if (!error && data) {
        setSessionUser(data);
        return data;
      }
    }

    const profiles = getStoredProfiles();
    const idx = profiles.findIndex((p) => p.user_id === userId || p.id === userId);
    if (idx === -1) throw new Error('User profile not found');

    const updated = { ...profiles[idx], ...updates };
    profiles[idx] = updated;
    saveProfiles(profiles);
    setSessionUser(updated);
    return updated;
  },

  // 7. USER PROFILE MANAGEMENT
  async getAllProfiles(): Promise<UserProfile[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data as UserProfile[];
      }
    }
    return getStoredProfiles();
  },

  async updateUserRole(userId: string, newRole: UserRole): Promise<UserProfile> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)
        .select()
        .single();
      if (!error && data) {
        return data as UserProfile;
      }
    }

    const profiles = getStoredProfiles();
    const idx = profiles.findIndex((p) => p.id === userId || p.user_id === userId);
    if (idx === -1) throw new Error('User not found');

    profiles[idx].role = newRole;
    saveProfiles(profiles);

    // If current session is this user, update active session
    const current = this.getCurrentUser();
    if (current && (current.id === userId || current.user_id === userId)) {
      current.role = newRole;
      setSessionUser(current);
    }

    return profiles[idx];
  },

  async deleteUserProfile(userId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      await supabase.from('profiles').delete().eq('id', userId);
    }
    const profiles = getStoredProfiles();
    const filtered = profiles.filter((p) => p.id !== userId && p.user_id !== userId);
    saveProfiles(filtered);
    return true;
  },
};
