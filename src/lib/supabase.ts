import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith('http') && 
    !supabaseUrl.includes('your-project')
  );
};

// Clean up any legacy tokens from localStorage to prevent permanent persistence
if (typeof window !== 'undefined') {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('sb-') || key.includes('auth_user')) {
        localStorage.removeItem(key);
      }
    });
  } catch (e) {
    // ignore
  }
}

// Initialize Supabase Client. If credentials are empty during development,
// we provide a safe fallback client instance so imports never fail.
// Sessions strictly use sessionStorage so they are cleared when the browser tab/window closes.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,
    },
  }
);
