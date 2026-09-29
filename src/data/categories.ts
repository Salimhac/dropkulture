import { Creator, Product, Drop, CategoryType } from '../types';

export const CATEGORIES_LIST: { id: CategoryType; name: string; description: string; image: string; count: number }[] = [
  {
    id: 'MUSIC',
    name: 'MUSIC',
    description: 'Tour merch, album drops, and signature apparel from African music pioneers.',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800',
    count: 0,
  },
  {
    id: 'COMEDY',
    name: 'COMEDY',
    description: 'Viral punchlines, statement tees, and character apparel from top satirists.',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800',
    count: 0,
  },
  {
    id: 'SPORTS',
    name: 'SPORTS',
    description: 'Athletic wear, vintage jerseys, and champion lifestyle capsules.',
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=800',
    count: 0,
  },
  {
    id: 'CONTENT CREATORS',
    name: 'CONTENT CREATORS',
    description: 'Daily streetwear, vlog accessories, and creator identity lines.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
    count: 0,
  },
  {
    id: 'GAMING',
    name: 'GAMING',
    description: 'Esports jerseys, RGB-toned streetwear, and stream apparel.',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800',
    count: 0,
  },
  {
    id: 'FASHION',
    name: 'FASHION',
    description: 'High-end streetwear collaborations, custom silhouettes, and bespoke drops.',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800',
    count: 0,
  },
  {
    id: 'ART & CULTURE',
    name: 'ART & CULTURE',
    description: 'Screen-printed posters, cultural artifacts, and limited gallery goods.',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=800',
    count: 0,
  },
];

// Production arrays: Zero mock data. Items are strictly populated from the live Supabase database.
export const CREATORS: Creator[] = [];
export const PRODUCTS: Product[] = [];
export const DROPS: Drop[] = [];

export const CURRENCY_RATES: Record<string, { symbol: string; rateToKES: number; label: string }> = {
  KES: { symbol: 'KES', rateToKES: 1, label: 'KES — Kenya (Default)' },
  USD: { symbol: '$', rateToKES: 0.0077, label: 'USD — Global (Phase 2)' },
  NGN: { symbol: '₦', rateToKES: 12.5, label: 'NGN — Nigeria (Phase 2)' },
  ZAR: { symbol: 'R', rateToKES: 0.14, label: 'ZAR — S. Africa (Phase 2)' },
};
