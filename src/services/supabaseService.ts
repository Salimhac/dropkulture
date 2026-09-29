import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  UserProfile, 
  Creator, 
  Product, 
  Collection, 
  Order, 
  UserRole, 
  CreatorStatus, 
  CategoryType, 
  CreatorApplication,
  CategoryDatabaseCount,
  DropsAvailabilitySummary,
  Drop
} from '../types';
import { CREATORS, PRODUCTS, DROPS, CATEGORIES_LIST } from '../data/categories';

export type { CategoryDatabaseCount, DropsAvailabilitySummary };

// Storage keys for local fallback
const STORAGE_PREFIX = 'dropkulture_db_';

// Purge legacy mock data from browser storage so the app starts completely clean
if (typeof window !== 'undefined') {
  try {
    const purgeFlag = 'dropkulture_purged_mockups_v2';
    if (!localStorage.getItem(purgeFlag)) {
      localStorage.removeItem(STORAGE_PREFIX + 'creators');
      localStorage.removeItem(STORAGE_PREFIX + 'products');
      localStorage.removeItem(STORAGE_PREFIX + 'collections');
      localStorage.removeItem(STORAGE_PREFIX + 'orders');
      localStorage.removeItem(STORAGE_PREFIX + 'applications');
      localStorage.removeItem('dropkulture_db_profiles');
      localStorage.removeItem('dropkulture_cart');
      localStorage.removeItem('dropkulture_wishlist');
      localStorage.removeItem('dropkulture_followed_creators');
      localStorage.setItem(purgeFlag, 'true');
    }
  } catch (e) {
    // ignore
  }
}

// Initial state: Zero mock data. Everything starts empty and is sourced from Supabase.
const getInitialCreators = (): Creator[] => [];
const getInitialProducts = (): Product[] => [];
const getInitialCollections = (): Collection[] => [];
const getInitialOrders = (): Order[] => [];
const getInitialApplications = (): CreatorApplication[] => [];

function readStorage<T>(key: string, fallback: () => T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    if (!item) {
      const initial = fallback();
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(item);
  } catch {
    const initial = fallback();
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(initial));
    } catch {
      // ignore
    }
    return initial;
  }
}

function writeStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage write error:', e);
  }
}

// Generate valid UUID for Postgres compliance
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

// =============================================================================
// DATABASE SERVICE IMPLEMENTATION (LIVE SUPABASE POSTGRESQL)
// =============================================================================

export const dbService = {
  // ---------------------------------------------------------------------------
  // 1. CREATORS
  // ---------------------------------------------------------------------------
  async getApprovedCreators(): Promise<Creator[]> {
  const { data, error } = await supabase
    .from('creators')
    .select(`
      *,
      products:products(count)
    `)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getApprovedCreators error:', error.message);
    return [];
  }

  return (data || []).map((row: any) => {
    // PostgREST shape: products: [{ count: N }]
    const productCount = row.products?.[0]?.count ?? 0;
    return mapSupabaseCreator({ ...row, product_count: productCount });
  });
},

  async getAllCreatorsForAdmin(): Promise<Creator[]> {
    let result: Creator[] = [];
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        result = data.map(mapSupabaseCreator);
      } else if (error) {
        console.error('Error fetching all creators from Supabase:', error.message);
      }

      // Check if there are profiles with role = 'creator' not yet in creators table
      try {
        const { data: creatorProfiles } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'creator');
        if (creatorProfiles && creatorProfiles.length > 0) {
          for (const p of creatorProfiles) {
            const exists = result.some(c => c.user_id === p.user_id || c.user_id === p.id || c.id === p.id);
            if (!exists) {
              const baseSlug = (p.full_name || 'creator').toLowerCase().replace(/[^a-z0-9]+/g, '-');
              const synthesized: Creator = {
                id: p.id || generateUUID(),
                user_id: p.user_id || p.id,
                name: p.full_name || 'New Creator',
                creator_name: p.full_name || 'New Creator',
                slug: `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`,
                bio: 'Creator brand account pending verification.',
                category: 'FASHION',
                country: p.country || 'Kenya',
                countryCode: 'KE',
                flag: '🇰🇪',
                avatarUrl: p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                profile_image: p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80',
                cover_image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80',
                tagline: 'Pending Admin Verification',
                verified: false,
                status: 'pending',
                followerCount: '0',
                productCount: 0,
                socialLinks: {},
                created_at: p.created_at || new Date().toISOString(),
              };
              result.push(synthesized);
            }
          }
        }
      } catch (err) {
        console.warn('Profiles cross-reference notice:', err);
      }
    } else {
      result = readStorage<Creator[]>('creators', getInitialCreators);
    }

    // Merge any locally stored creators not yet in result
    const local = readStorage<Creator[]>('creators', getInitialCreators);
    for (const loc of local) {
      if (!result.some(r => r.id === loc.id || r.slug === loc.slug || (r.user_id && r.user_id === loc.user_id))) {
        result.push(loc);
      }
    }

    return result;
  },

  async getCreatorBySlug(slug: string): Promise<Creator | null> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (!error && data) {
        return mapSupabaseCreator(data);
      }
      return null;
    }
    const all = readStorage<Creator[]>('creators', getInitialCreators);
    return all.find((c) => c.slug === slug) || null;
  },

  async getCreatorByUserId(userId: string, email?: string): Promise<Creator | null> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .or(`user_id.eq.${userId},id.eq.${userId}`)
        .maybeSingle();
      if (!error && data) {
        return mapSupabaseCreator(data);
      }
    }
    const all = await this.getAllCreatorsForAdmin();
    return all.find((c) => c.user_id === userId || c.id === userId || (email && c.name.toLowerCase() === email.split('@')[0].toLowerCase())) || null;
  },

  async getCreatorById(id: string): Promise<Creator | null> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .or(`id.eq.${id},slug.eq.${id}`)
        .maybeSingle();
      if (!error && data) {
        return mapSupabaseCreator(data);
      }
      return null;
    }
    const all = readStorage<Creator[]>('creators', getInitialCreators);
    return all.find((c) => c.id === id || c.slug === id) || null;
  },

  async searchCreators(query: string, category?: string, country?: string): Promise<Creator[]> {
    const q = query.trim().toLowerCase();
    const approved = await this.getApprovedCreators();

    return approved.filter((c) => {
      const matchQuery = !q || 
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        (c.tagline && c.tagline.toLowerCase().includes(q));

      const matchCategory = !category || category === 'ALL' || c.category === category;
      const matchCountry = !country || country === 'ALL' || c.country.toLowerCase() === country.toLowerCase();

      return matchQuery && matchCategory && matchCountry;
    });
  },

  async updateCreator(creatorId: string, updates: Partial<Creator>): Promise<Creator> {
  const payload: Record<string, any> = {};

  if (updates.name !== undefined)                   payload.creator_name = updates.name;
  if (updates.creator_name !== undefined)           payload.creator_name = updates.creator_name;
  if (updates.bio !== undefined)                    payload.bio = updates.bio;
  if (updates.avatarUrl !== undefined)              payload.profile_image = updates.avatarUrl;
  if (updates.profile_image !== undefined)          payload.profile_image = updates.profile_image;
  if (updates.bannerUrl !== undefined)              payload.cover_image = updates.bannerUrl;
  if (updates.cover_image !== undefined)            payload.cover_image = updates.cover_image;
  if (updates.category !== undefined)               payload.category = updates.category;
  if (updates.country !== undefined)                payload.country = updates.country;
  if (updates.socialLinks?.instagram !== undefined) payload.instagram = updates.socialLinks.instagram;
  if (updates.socialLinks?.tiktok !== undefined)    payload.tiktok = updates.socialLinks.tiktok;
  if (updates.socialLinks?.youtube !== undefined)   payload.youtube = updates.socialLinks.youtube;
  if (updates.socialLinks?.x !== undefined)         payload.x = updates.socialLinks.x;

  if (Object.keys(payload).length === 0) {
    throw new Error('No fields to update.');
  }

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('creators')
      .update(payload)
      .eq('id', creatorId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('updateCreator error:', error.message);
      throw new Error(error.message);
    }
    if (!data) {
      throw new Error('Creator not found or update returned no data.');
    }

    const mapped = mapSupabaseCreator(data);

    // Keep local store & listeners in sync
    const all = readStorage<Creator[]>('creators', getInitialCreators);
    const idx = all.findIndex((c) => c.id === creatorId);
    if (idx !== -1) all[idx] = { ...all[idx], ...mapped };
    else all.push(mapped);
    writeStorage('creators', all);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dropkulture_creators_changed', { detail: mapped }));
    }

    return mapped;
  }

  // Local fallback
  const all = readStorage<Creator[]>('creators', getInitialCreators);
  const index = all.findIndex((c) => c.id === creatorId);
  if (index === -1) throw new Error('Creator not found');

  const updated = { ...all[index], ...updates };
  all[index] = updated;
  writeStorage('creators', all);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dropkulture_creators_changed', { detail: updated }));
  }
  return updated;
},
  async setCreatorStatus(creatorId: string, status: CreatorStatus): Promise<Creator> {
    return this.updateCreator(creatorId, { status });
  },

  async setCreatorVerified(creatorId: string, verified: boolean): Promise<Creator> {
    return this.updateCreator(creatorId, { verified });
  },

  // ---------------------------------------------------------------------------
  // 2. PRODUCTS
  // ---------------------------------------------------------------------------
  async getProductsByCreatorId(creatorId: string): Promise<Product[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('products')
        .select('*, creators(creator_name, slug, profile_image, category)')
        .eq('creator_id', creatorId)
        .eq('status', 'active');
      if (!error && data) {
        return data.map(mapSupabaseProduct);
      }
      return [];
    }
    const all = readStorage<Product[]>('products', getInitialProducts);
    return all.filter((p) => p.creatorId === creatorId || p.creator_id === creatorId);
  },

  async getAllActiveProducts(): Promise<Product[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('products')
        .select('*, creators(creator_name, slug, profile_image, category)')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data.map(mapSupabaseProduct);
      }
      if (error) {
        console.error('Error fetching active products from Supabase:', error.message);
      }
      return [];
    }
    return readStorage<Product[]>('products', getInitialProducts);
  },

  async getAllProductsForAdmin(): Promise<Product[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('products')
        .select('*, creators(creator_name, slug, profile_image, category)')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data.map(mapSupabaseProduct);
      }
      if (error) {
        console.error('Error fetching admin products from Supabase:', error.message);
      }
      return [];
    }
    return readStorage<Product[]>('products', getInitialProducts);
  },

  async getProductById(id: string): Promise<Product | null> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('products')
        .select('*, creators(creator_name, slug, profile_image, category)')
        .or(`id.eq.${id},slug.eq.${id}`)
        .maybeSingle();
      if (!error && data) {
        return mapSupabaseProduct(data);
      }
      return null;
    }
    const all = readStorage<Product[]>('products', getInitialProducts);
    return all.find((p) => p.id === id || p.slug === id) || null;
  },

  async addProduct(newProductData: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
  // Enforce administrative verification rule
  if (newProductData.creatorId) {
    const creator = await this.getCreatorById(newProductData.creatorId);
    if (creator && creator.status !== 'approved' && !creator.verified) {
      throw new Error('Merchandise upload restricted: Your creator account is currently pending administrative verification. Once verified, product publishing will be enabled.');
    }
  }

  const id = generateUUID();
  const product: Product = {
    ...newProductData,
    id,
    created_at: new Date().toISOString(),
    stockCount: newProductData.stockCount ?? newProductData.stock ?? 50,
    stock: newProductData.stock ?? newProductData.stockCount ?? 50,
    inStock: (newProductData.stockCount ?? newProductData.stock ?? 50) > 0,
    status: newProductData.status || 'active',
    isLimitedEdition: newProductData.isLimitedEdition ?? newProductData.is_limited_edition ?? false,
  };

  if (isSupabaseConfigured()) {
    const imagesArr = Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.images || (product as any).image || ''].filter(Boolean);

    const productPayload = {
      id,
      creator_id: product.creatorId,
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: Number(product.priceKES) || 0,
      images: imagesArr,
      category: product.category,
      sizes: Array.isArray(product.sizes) && product.sizes.length > 0
        ? product.sizes
        : ['S', 'M', 'L', 'XL'],
      stock: Number(product.stockCount ?? product.stock ?? 0),
      is_limited_edition: !!product.isLimitedEdition,
      status: product.status || 'active',
    };

    const { data, error } = await supabase
      .from('products')
      .insert(productPayload)
      .select('*, creators(creator_name, slug, profile_image, category)')
      .single();

    if (!error && data) {
      return mapSupabaseProduct(data);
    }

    if (error) {
      console.error('Supabase addProduct error:', error.message);

      // Fallback: minimal core columns only
      const minimalPayload = {
        id,
        creator_id: product.creatorId,
        name: product.name,
        slug: product.slug,
        description: product.description || '',
        price: Number(product.priceKES) || 0,
        images: imagesArr,
        category: product.category,
        sizes: ['S', 'M', 'L', 'XL'],
        stock: Number(product.stockCount ?? product.stock ?? 0),
        is_limited_edition: false,
        status: 'active',
      };

      const { data: retryData, error: retryErr } = await supabase
        .from('products')
        .insert(minimalPayload)
        .select('*, creators(creator_name, slug, profile_image, category)')
        .maybeSingle();

      if (retryErr) {
        console.error('Supabase addProduct retry error:', retryErr.message);
      }
      if (retryData) {
        return mapSupabaseProduct(retryData);
      }
    }
  }

  // Local fallback store
  const all = readStorage<Product[]>('products', getInitialProducts);
  all.unshift(product);
  writeStorage('products', all);
  return product;
},
  async updateProduct(productId: string, updates: Partial<Product>): Promise<Product> {
    if (isSupabaseConfigured()) {
      const payload: any = { ...updates };
      if (updates.priceKES !== undefined || updates.price !== undefined) {
        payload.price = updates.priceKES ?? updates.price;
      }
      if (updates.stockCount !== undefined || updates.stock !== undefined) {
        payload.stock = updates.stockCount ?? updates.stock;
      }

      const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', productId)
        .select('*, creators(creator_name, slug, profile_image, category)')
        .single();
      if (!error && data) {
        return mapSupabaseProduct(data);
      }
    }

    const all = readStorage<Product[]>('products', getInitialProducts);
    const index = all.findIndex((p) => p.id === productId);
    if (index === -1) throw new Error('Product not found');

    const updated = { ...all[index], ...updates };
    all[index] = updated;
    writeStorage('products', all);
    return updated;
  },

  async deleteProduct(productId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      await supabase.from('products').delete().eq('id', productId);
    }
    const all = readStorage<Product[]>('products', getInitialProducts);
    const filtered = all.filter((p) => p.id !== productId);
    writeStorage('products', filtered);
    return true;
  },

  // ---------------------------------------------------------------------------
  // 3. COLLECTIONS (DROPS)
  // ---------------------------------------------------------------------------
  async getAllCollections(): Promise<Collection[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .order('release_date', { ascending: false });
      if (!error && data) {
        return data;
      }
      return [];
    }
    return readStorage<Collection[]>('collections', getInitialCollections);
  },

  async getCollectionById(id: string): Promise<Collection | null> {
    const all = await this.getAllCollections();
    return all.find((c) => c.id === id || c.slug === id) || null;
  },

  async getCollectionsByCreatorId(creatorId: string): Promise<Collection[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('creator_id', creatorId);
      if (!error && data) {
        return data;
      }
      return [];
    }
    const all = readStorage<Collection[]>('collections', getInitialCollections);
    return all.filter((c) => c.creator_id === creatorId);
  },

  async addCollection(collectionData: Omit<Collection, 'id'>): Promise<Collection> {
    const id = generateUUID();
    const newCol: Collection = {
      ...collectionData,
      id,
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('collections')
        .insert({
          id,
          creator_id: newCol.creator_id,
          name: newCol.name,
          slug: newCol.slug,
          description: newCol.description,
          cover_image: newCol.cover_image,
          release_date: newCol.release_date,
          status: newCol.status,
        })
        .select()
        .single();
      if (!error && data) return data;
    }

    const all = readStorage<Collection[]>('collections', getInitialCollections);
    all.unshift(newCol);
    writeStorage('collections', all);
    return newCol;
  },

  // ---------------------------------------------------------------------------
  // 3b. DROPS & CATEGORIES DATABASE METRICS (LIVE FETCHED FROM DB)
  // ---------------------------------------------------------------------------
  async getDropsAvailabilitySummary(): Promise<DropsAvailabilitySummary> {
    const collections = await this.getAllCollections();
    let live = 0;
    let upcoming = 0;
    let sellingFast = 0;
    let soldOut = 0;

    collections.forEach((c) => {
      const st = (c.status || '').toLowerCase();
      if (st === 'live') {
        live++;
      } else if (st === 'selling_fast') {
        sellingFast++;
        live++;
      } else if (st === 'sold_out' || st === 'archived') {
        soldOut++;
      } else {
        upcoming++;
      }
    });

    return {
      totalDrops: collections.length,
      liveDrops: live,
      upcomingDrops: upcoming,
      sellingFastDrops: sellingFast,
      soldOutDrops: soldOut,
    };
  },

  async getCategoryCounts(): Promise<Record<CategoryType, { dropsCount: number; productsCount: number; creatorsCount: number }>> {
    const [creators, products, collections] = await Promise.all([
      this.getApprovedCreators(),
      this.getAllActiveProducts(),
      this.getAllCollections(),
    ]);

    const creatorCatMap = new Map<string, CategoryType>();
    creators.forEach((c) => {
      if (c.id) creatorCatMap.set(c.id, c.category);
      if (c.slug) creatorCatMap.set(c.slug, c.category);
    });

    const stats: Record<CategoryType, { dropsCount: number; productsCount: number; creatorsCount: number }> = {
      'MUSIC': { dropsCount: 0, productsCount: 0, creatorsCount: 0 },
      'COMEDY': { dropsCount: 0, productsCount: 0, creatorsCount: 0 },
      'SPORTS': { dropsCount: 0, productsCount: 0, creatorsCount: 0 },
      'GAMING': { dropsCount: 0, productsCount: 0, creatorsCount: 0 },
      'CONTENT CREATORS': { dropsCount: 0, productsCount: 0, creatorsCount: 0 },
      'FASHION': { dropsCount: 0, productsCount: 0, creatorsCount: 0 },
      'ART & CULTURE': { dropsCount: 0, productsCount: 0, creatorsCount: 0 },
    };

    // 1. Tally approved creators
    creators.forEach((c) => {
      if (stats[c.category]) {
        stats[c.category].creatorsCount += 1;
      }
    });

    // 2. Tally active products
    products.forEach((p) => {
      const cat = p.creatorCategory || creatorCatMap.get(p.creatorId) || creatorCatMap.get(p.creatorSlug) || 'MUSIC';
      if (stats[cat]) {
        stats[cat].productsCount += 1;
      }
    });

    // 3. Tally drops/collections
    collections.forEach((col) => {
      let cat = creatorCatMap.get(col.creator_id);
      if (!cat) {
        const matchedCreator = creators.find(c => c.id === col.creator_id || c.slug === col.creator_id);
        if (matchedCreator) cat = matchedCreator.category;
      }
      if (!cat) {
        const matchedProd = products.find(p => p.dropId === col.id || col.product_ids?.includes(p.id));
        if (matchedProd) cat = matchedProd.creatorCategory;
      }
      if (cat && stats[cat]) {
        stats[cat].dropsCount += 1;
      }
    });

    return stats;
  },

  async getCategoriesWithCounts(): Promise<CategoryDatabaseCount[]> {
    const counts = await this.getCategoryCounts();
    return CATEGORIES_LIST.map((cat) => {
      const data = counts[cat.id] || { dropsCount: 0, productsCount: 0, creatorsCount: 0 };
      return {
        ...cat,
        dropsCount: data.dropsCount,
        productsCount: data.productsCount,
        creatorsCount: data.creatorsCount,
        count: data.dropsCount,
      };
    });
  },

  async getCollectionsByCategory(category: CategoryType | 'ALL'): Promise<Collection[]> {
    const [collections, creators] = await Promise.all([
      this.getAllCollections(),
      this.getApprovedCreators(),
    ]);

    if (category === 'ALL') return collections;

    const creatorIdsInCat = new Set(
      creators.filter(c => c.category === category).flatMap(c => [c.id, c.slug])
    );

    return collections.filter(c => creatorIdsInCat.has(c.creator_id));
  },

  async getAllDropsWithDetails(): Promise<Drop[]> {
  const [collections, creators, products] = await Promise.all([
    this.getAllCollections(),
    this.getApprovedCreators(),
    this.getAllActiveProducts(),
  ]);

  return collections.map((col) => {
    const creator = creators.find(c => c.id === col.creator_id || c.slug === col.creator_id);

    const statusLower = (col.status || '').toLowerCase();
    const mappedStatus: Drop['status'] =
      statusLower === 'live' ? 'LIVE' :
      statusLower === 'selling_fast' ? 'SELLING_FAST' :
      statusLower === 'sold_out' ? 'SOLD_OUT' :
      'COMING_SOON';

    // Products belonging to this drop's creator
    const dropProducts = products.filter(p =>
      p.creatorId === (creator?.id || col.creator_id)
    );

    return {
      id: col.id,
      slug: col.slug || col.id,
      title: col.name,
      collectionName: col.name,
      creatorId: creator?.id || col.creator_id,
      creatorName: creator?.name || 'Unknown Creator',
      creatorSlug: creator?.slug || '',
      creatorAvatar: creator?.avatarUrl || '',
      creatorCategory: creator?.category || 'MUSIC',
      releaseDate: col.release_date || new Date().toISOString(),
      countdownTargetDate: col.release_date || new Date(Date.now() + 86400000 * 3).toISOString(),
      status: mappedStatus,
      country: creator?.country || 'Kenya',
      coverImage: col.cover_image || '',
      description: col.description || '',
      productCount: dropProducts.length,
      highlightProductIds: dropProducts.map(p => p.id),
    };
  });
},

  // ---------------------------------------------------------------------------
  // 4. ORDERS & SALES ANALYTICS
  // ---------------------------------------------------------------------------
  async getOrdersForCustomer(email: string): Promise<Order[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .ilike('customer_email', email)
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data.map(mapSupabaseOrder);
      }
      return [];
    }
    const allOrders = readStorage<Order[]>('orders', getInitialOrders);
    return allOrders.filter((o) => o.customerEmail.toLowerCase() === email.toLowerCase());
  },

  async getAllOrdersForAdmin(): Promise<Order[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data.map(mapSupabaseOrder);
      }
      return [];
    }
    return readStorage<Order[]>('orders', getInitialOrders);
  },

  async getAllCreatorApplications(): Promise<CreatorApplication[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data.map((c: any) => ({
          id: c.id,
          creatorName: c.creator_name || c.name,
          category: c.category,
          country: c.country,
          socialLinks: {
            instagram: c.instagram,
            tiktok: c.tiktok,
            youtube: c.youtube,
            twitter: c.x || c.twitter,
          },
          audienceSize: '100K+',
          email: 'creator@dropkulture.africa',
          phone: '',
          bioOrVision: c.bio || '',
          status: 'pending' as const,
          submittedAt: c.created_at,
        }));
      }
      return [];
    }
    return readStorage<CreatorApplication[]>('applications', getInitialApplications);
  },

  async submitCreatorApplication(data: Omit<CreatorApplication, 'id' | 'status' | 'submittedAt'>): Promise<CreatorApplication> {
    const id = generateUUID();
    const newApp: CreatorApplication = {
      ...data,
      id,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    const baseSlug = data.creatorName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'creator';
    const slug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;

    const newCreator: Creator = {
      id,
      user_id: generateUUID(),
      slug,
      name: data.creatorName,
      creator_name: data.creatorName,
      category: data.category,
      country: data.country,
      countryCode: data.country === 'Kenya' ? 'KE' : data.country === 'Nigeria' ? 'NG' : data.country === 'South Africa' ? 'ZA' : 'AF',
      flag: data.country === 'Kenya' ? '🇰🇪' : data.country === 'Nigeria' ? '🇳🇬' : data.country === 'South Africa' ? '🇿🇦' : '🌍',
      avatarUrl: (data as any).portraitUrl || (data as any).profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      profile_image: (data as any).portraitUrl || (data as any).profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80',
      cover_image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80',
      tagline: data.bioOrVision ? data.bioOrVision.slice(0, 60) : 'Official DROPKULTURE Creator Brand',
      bio: data.bioOrVision || '',
      verified: false,
      status: 'pending',
      followerCount: data.audienceSize || '10K+',
      productCount: 0,
      socialLinks: {
        instagram: data.socialLinks?.instagram,
        tiktok: data.socialLinks?.tiktok,
        youtube: data.socialLinks?.youtube,
        twitter: data.socialLinks?.twitter || data.socialLinks?.x,
        x: data.socialLinks?.twitter || data.socialLinks?.x,
      },
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('creators').insert({
          id,
          user_id: newCreator.user_id,
          creator_name: data.creatorName,
          slug,
          category: data.category,
          country: data.country,
          profile_image: newCreator.avatarUrl,
          bio: data.bioOrVision,
          instagram: data.socialLinks?.instagram,
          tiktok: data.socialLinks?.tiktok,
          youtube: data.socialLinks?.youtube,
          x: data.socialLinks?.twitter,
          status: 'pending',
          verified: false,
        });
      } catch (err) {
        console.error('Supabase creator insert error:', err);
      }
    }

    // Save in creators storage so it appears in the admin creators table
    const allCreators = readStorage<Creator[]>('creators', getInitialCreators);
    allCreators.unshift(newCreator);
    writeStorage('creators', allCreators);

    const allApps = readStorage<CreatorApplication[]>('applications', getInitialApplications);
    allApps.unshift(newApp);
    writeStorage('applications', allApps);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dropkulture_creators_changed', { detail: newCreator }));
    }

    return newApp;
  },

  async getOrdersForCreator(creatorId: string): Promise<{
    orders: Order[];
    totalSalesKES: number;
    unitsSold: number;
  }> {
    const allOrders = await this.getAllOrdersForAdmin();
    const matchingOrders = allOrders.filter((o) =>
      o.items.some((item) => item.product?.creatorId === creatorId || item.product?.creator_id === creatorId)
    );

    let totalSalesKES = 0;
    let unitsSold = 0;

    matchingOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.product?.creatorId === creatorId || item.product?.creator_id === creatorId) {
          totalSalesKES += (item.product.priceKES || item.product.price || 0) * item.quantity;
          unitsSold += item.quantity;
        }
      });
    });

    return {
      orders: matchingOrders,
      totalSalesKES,
      unitsSold,
    };
  },

  async saveOrder(order: Order): Promise<Order> {
    const allOrders = readStorage<Order[]>('orders', getInitialOrders);
    allOrders.unshift(order);
    writeStorage('orders', allOrders);
    return order;
  },

  async createOrder(orderData: Omit<Order, 'id' | 'status' | 'createdAt'>): Promise<Order> {
    const id = generateUUID();
    const isMpesa = orderData.paymentMethod === 'mpesa';
    const isPaystack = orderData.paymentMethod === 'paystack';

    const mpesaReceipt = orderData.mpesaReceipt || (isMpesa
      ? 'DK' + Math.floor(10000000 + Math.random() * 90000000).toString(36).toUpperCase()
      : undefined);

    const paystackReference = orderData.paystackReference || (isPaystack
      ? 'DK-PSTK-' + Date.now().toString(36).toUpperCase()
      : undefined);

    const newOrder: Order = {
      ...orderData,
      id,
      mpesaReceipt,
      paystackReference,
      status: 'PAID',
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('orders').insert({
          id: newOrder.id,
          customer_email: newOrder.customerEmail,
          customer_phone: newOrder.customerPhone,
          total: newOrder.total,
          currency: newOrder.currency,
          status: 'processing',
          payment_status: 'paid',
          payment_method: newOrder.paymentMethod,
          shipping_address: {
            customerName: newOrder.customerName,
            county: newOrder.county,
            town: newOrder.town,
            deliveryAddress: newOrder.deliveryAddress,
            deliveryNotes: newOrder.deliveryNotes,
            items: newOrder.items,
            paystackReference: newOrder.paystackReference,
            paystackChannel: newOrder.paystackChannel,
          },
        });
      } catch (err) {
        console.error('Supabase order insert error:', err);
      }
    }

    const allOrders = readStorage<Order[]>('orders', getInitialOrders);
    allOrders.unshift(newOrder);
    writeStorage('orders', allOrders);
    return newOrder;
  },

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    if (isSupabaseConfigured()) {
      const dbStatus = status === 'DELIVERED' ? 'delivered' : status === 'SHIPPED' ? 'shipped' : 'processing';
      await supabase.from('orders').update({ status: dbStatus }).eq('id', orderId);
    }
    const allOrders = readStorage<Order[]>('orders', getInitialOrders);
    const index = allOrders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error('Order not found');

    const updated = { ...allOrders[index], status };
    allOrders[index] = updated;
    writeStorage('orders', allOrders);
    return updated;
  },

  async deleteOrder(orderId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      await supabase.from('orders').delete().eq('id', orderId);
    }
    const allOrders = readStorage<Order[]>('orders', getInitialOrders);
    const filtered = allOrders.filter((o) => o.id !== orderId);
    writeStorage('orders', filtered);
    return true;
  },

  // ---------------------------------------------------------------------------
  // 5. EXTENDED ADMIN OPERATIONS
  // ---------------------------------------------------------------------------
  async deleteCreator(creatorId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      await supabase.from('creators').delete().eq('id', creatorId);
    }
    const all = readStorage<Creator[]>('creators', getInitialCreators);
    const filtered = all.filter((c) => c.id !== creatorId);
    writeStorage('creators', filtered);
    return true;
  },

  async createCreatorByAdmin(data: Partial<Creator>): Promise<Creator> {
    const creatorId = generateUUID();
    const userId = generateUUID();
    const slug = (data.name || 'creator').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCreator: Creator = {
      id: creatorId,
      user_id: userId,
      slug: data.slug || slug,
      name: data.name || 'New Creator',
      creator_name: data.name || 'New Creator',
      category: data.category || 'MUSIC',
      country: data.country || 'Kenya',
      countryCode: data.country === 'Nigeria' ? 'NG' : data.country === 'South Africa' ? 'ZA' : 'KE',
      flag: data.country === 'Nigeria' ? '🇳🇬' : data.country === 'South Africa' ? '🇿🇦' : '🇰🇪',
      avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      profile_image: data.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bannerUrl: data.bannerUrl || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80',
      cover_image: data.bannerUrl || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80',
      tagline: data.tagline || 'Official Creator Drop Storefront',
      bio: data.bio || '',
      verified: Boolean(data.verified),
      followerCount: data.followerCount || '100K+',
      productCount: 0,
      status: (data.status as CreatorStatus) || 'approved',
      socialLinks: data.socialLinks || {},
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      await supabase.from('creators').insert({
        id: newCreator.id,
        user_id: newCreator.user_id,
        slug: newCreator.slug,
        creator_name: newCreator.name,
        category: newCreator.category,
        country: newCreator.country,
        profile_image: newCreator.avatarUrl,
        cover_image: newCreator.bannerUrl,
        bio: newCreator.bio,
        status: newCreator.status,
        verified: newCreator.verified,
      });
    }

    const all = readStorage<Creator[]>('creators', getInitialCreators);
    all.unshift(newCreator);
    writeStorage('creators', all);
    return newCreator;
  },

  async createProductByAdmin(data: Partial<Product> & { name: string; creatorId: string; priceKES: number }): Promise<Product> {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const fullData: Omit<Product, 'id' | 'created_at'> = {
      name: data.name,
      slug,
      creatorId: data.creatorId,
      creatorName: data.creatorName || 'Creator',
      creatorSlug: data.creatorSlug || 'creator',
      creatorAvatar: data.creatorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      creatorCategory: data.creatorCategory || 'MUSIC',
      priceKES: data.priceKES,
      category: data.category || 'HOODIES',
      stockCount: data.stockCount ?? 50,
      stock: data.stock ?? data.stockCount ?? 50,
      inStock: true,
      isLimitedEdition: data.isLimitedEdition ?? true,
      description: data.description || '',
      materials: data.materials || '100% Heavyweight Cotton (450 GSM)',
      fit: data.fit || 'Oversized Boxy Fit',
      shippingInfo: data.shippingInfo || 'Dispatched in 2-3 business days across East Africa',
      images: data.images || ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'],
      sizes: data.sizes || ['S', 'M', 'L', 'XL'],
      status: data.status || 'active',
      rating: data.rating ?? 5.0,
      reviewsCount: data.reviewsCount ?? 0,
    };
    return this.addProduct(fullData);
  },

  async getAdminPlatformStats() {
    const creators = await this.getAllCreatorsForAdmin();
    const products = await this.getAllProductsForAdmin();
    const orders = await this.getAllOrdersForAdmin();

    const totalGMVKES = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const platformCommissionKES = Math.round(totalGMVKES * 0.70); // 70% platform take-rate (manufacturing, warehousing & logistics)
    const pendingCreatorsCount = creators.filter((c) => c.status === 'pending').length;
    const approvedCreatorsCount = creators.filter((c) => c.status === 'approved').length;
    const activeProductsCount = products.filter((p) => p.status === 'active' || !p.status).length;
    const totalInventoryUnits = products.reduce((sum, p) => sum + (p.stockCount || p.stock || 0), 0);

    return {
      totalGMVKES,
      platformCommissionKES,
      totalOrdersCount: orders.length,
      creatorsCount: creators.length,
      pendingCreatorsCount,
      approvedCreatorsCount,
      productsCount: products.length,
      activeProductsCount,
      totalInventoryUnits,
    };
  },

  async resetDatabaseToDefaults(): Promise<void> {
    localStorage.removeItem(STORAGE_PREFIX + 'creators');
    localStorage.removeItem(STORAGE_PREFIX + 'products');
    localStorage.removeItem(STORAGE_PREFIX + 'collections');
    localStorage.removeItem(STORAGE_PREFIX + 'orders');
    localStorage.removeItem('dropkulture_db_profiles');
  },

  async exportDatabaseBackup() {
    const creators = await this.getAllCreatorsForAdmin();
    const products = await this.getAllProductsForAdmin();
    const collections = await this.getAllCollections();
    const orders = await this.getAllOrdersForAdmin();
    const profiles = JSON.parse(localStorage.getItem('dropkulture_db_profiles') || '[]');

    return {
      exportedAt: new Date().toISOString(),
      platform: 'DROPKULTURE Africa Commerce OS',
      schema_version: '2.0',
      database: {
        creators,
        products,
        collections,
        orders,
        profiles,
      },
    };
  },
};

// Helper mapper for Supabase raw responses
function mapSupabaseCreator(row: any): Creator {
  const avatar =
    row.profile_image ||
    row.avatar_url ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

  const banner =
    row.cover_image ||
    row.cover_url ||
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80';

  // Derive country code + flag generically (handles more than KE/NG/ZA)
  const COUNTRY_META: Record<string, { code: string; flag: string }> = {
    Kenya: { code: 'KE', flag: '🇰🇪' },
    Nigeria: { code: 'NG', flag: '🇳🇬' },
    'South Africa': { code: 'ZA', flag: '🇿🇦' },
    Ghana: { code: 'GH', flag: '🇬🇭' },
    Tanzania: { code: 'TZ', flag: '🇹🇿' },
    Uganda: { code: 'UG', flag: '🇺🇬' },
    Rwanda: { code: 'RW', flag: '🇷🇼' },
  };
  const meta = COUNTRY_META[row.country] ?? { code: 'AF', flag: '🌍' };

  return {
    id: row.id,
    user_id: row.user_id,
    slug: row.slug,
    name: row.creator_name || row.name || 'Creator',
    creator_name: row.creator_name || row.name || 'Creator',
    category: (row.category || 'MUSIC') as CategoryType,
    country: row.country || 'Kenya',
    countryCode: meta.code,
    flag: meta.flag,
    avatarUrl: avatar,
    profile_image: avatar,
    bannerUrl: banner,
    cover_image: banner,
    tagline: row.tagline || row.bio?.split('.')[0] || 'Official Creator Storefront',
    bio: row.bio || '',
    verified: Boolean(row.verified),
    followerCount: String(row.follower_count ?? 0),     // real value or '0'
    productCount: Number(row.product_count ?? 0),       // real value or 0
    status: (row.status || 'approved') as CreatorStatus,
    socialLinks: {
      instagram: row.instagram ?? '',
      tiktok: row.tiktok ?? '',
      youtube: row.youtube ?? '',
      twitter: row.x ?? row.twitter ?? '',
      x: row.x ?? row.twitter ?? '',
    },
    created_at: row.created_at || new Date().toISOString(),
  };
}

function mapSupabaseProduct(row: any): Product {
  const creator = row.creators;
  const avatar = creator?.avatar_url || creator?.profile_image || row.creatorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
  const stock = Number(row.stock_count ?? row.stock ?? 50);
  const images = Array.isArray(row.images) && row.images.length > 0 
    ? row.images 
    : (row.image_url ? [row.image_url] : row.image ? [row.image] : []);

  return {
    id: row.id,
    creator_id: row.creator_id,
    creatorId: row.creator_id,
    slug: row.slug || row.id,
    name: row.name || row.title || 'Merchandise Item',
    creatorName: creator?.creator_name || row.creatorName || row.creator_name || 'Creator',
    creatorSlug: creator?.slug || row.creatorSlug || 'creator',
    creatorAvatar: avatar,
    creatorCategory: (creator?.category || row.category || 'MUSIC') as CategoryType,
    priceKES: Number(row.price || 0),
    price: Number(row.price || 0),
    category: row.category || 'HOODIES',
    images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'],
    description: row.description || '',
    materials: '100% Combed Heavyweight Cotton (450 GSM)',
    fit: 'Relaxed Streetwear Fit',
    shippingInfo: 'Dispatched within 24h from Nairobi Hub',
    sizes: Array.isArray(row.sizes) && row.sizes.length > 0 ? row.sizes : ['S', 'M', 'L', 'XL'],
    inStock: stock > 0,
    stockCount: stock,
    stock: stock,
    isLimitedEdition: Boolean(row.is_limited_edition),
    is_limited_edition: Boolean(row.is_limited_edition),
    status: row.status || 'active',
    rating: 4.9,
    reviewsCount: 18,
    created_at: row.created_at || new Date().toISOString(),
  };
}

function mapSupabaseOrder(row: any): Order {
  const address = row.shipping_address || {};
  return {
    id: row.id,
    customerName: address.customerName || row.customer_email?.split('@')[0] || 'Collector',
    customerEmail: row.customer_email || '',
    customerPhone: row.customer_phone || '',
    county: address.county || 'Nairobi',
    town: address.town || 'Nairobi Central',
    deliveryAddress: address.deliveryAddress || 'Standard Delivery',
    deliveryNotes: address.deliveryNotes || '',
    items: address.items || [],
    subtotal: Number(row.total || 0),
    shippingFee: 0,
    total: Number(row.total || 0),
    currency: row.currency || 'KES',
    paymentMethod: row.payment_method || 'mpesa',
    mpesaReceipt: address.mpesaReceipt || (row.payment_method === 'mpesa' ? row.id.slice(0, 10).toUpperCase() : undefined),
    paystackReference: address.paystackReference || row.paystack_reference || undefined,
    paystackChannel: address.paystackChannel || undefined,
    status: row.status === 'delivered' ? 'DELIVERED' : row.status === 'shipped' ? 'SHIPPED' : 'PAID',
    createdAt: row.created_at || new Date().toISOString(),
  };
}
