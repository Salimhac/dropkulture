export type CategoryType = 
  | 'MUSIC'
  | 'COMEDY'
  | 'SPORTS'
  | 'GAMING'
  | 'CONTENT CREATORS'
  | 'FASHION'
  | 'ART & CULTURE';

export interface CategoryDatabaseCount {
  id: CategoryType;
  name: string;
  description: string;
  image: string;
  dropsCount: number;
  productsCount: number;
  creatorsCount: number;
  count: number;
}

export interface DropsAvailabilitySummary {
  totalDrops: number;
  liveDrops: number;
  upcomingDrops: number;
  sellingFastDrops: number;
  soldOutDrops: number;
}

export type CurrencyType = 'KES' | 'USD' | 'NGN' | 'ZAR';

export type UserRole = 'customer' | 'creator' | 'admin';

export type CreatorStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  country?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface Creator {
  id: string;
  user_id?: string;
  slug: string;
  name: string;
  creator_name?: string;
  category: CategoryType;
  country: string;
  countryCode?: string;
  flag?: string;
  avatarUrl: string;
  profile_image?: string;
  bannerUrl: string;
  cover_image?: string;
  tagline: string;
  bio: string;
  verified: boolean;
  followerCount: string;
  productCount: number;
  featuredDropId?: string;
  status?: CreatorStatus;
  socialLinks: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    spotify?: string;
    twitter?: string;
    x?: string;
  };
  featuredCollectionName?: string;
  created_at?: string;
}

export interface Product {
  id: string;
  creator_id?: string;
  creatorId: string;
  slug: string;
  name: string;
  creatorName: string;
  creatorSlug: string;
  creatorAvatar: string;
  creatorCategory: CategoryType;
  priceKES: number;
  price?: number;
  originalPriceKES?: number;
  category: 'HOODIES' | 'TEES' | 'CAPS' | 'JERSEYS' | 'ACCESSORIES' | 'POSTERS';
  dropId?: string;
  dropName?: string;
  images: string[];
  description: string;
  materials: string;
  fit: string;
  shippingInfo: string;
  sizes: string[];
  inStock: boolean;
  stockCount: number;
  stock?: number;
  stockStatus?: 'IN_STOCK' | 'LOW_STOCK' | 'SOLD_OUT';
  remainingUnits?: number;
  isLimitedEdition: boolean;
  is_limited_edition?: boolean;
  status?: 'active' | 'draft' | 'archived';
  rating: number;
  reviewsCount: number;
  isNewArrival?: boolean;
  isTrending?: boolean;
  created_at?: string;
}

export interface Collection {
  id: string;
  creator_id: string;
  name: string;
  slug: string;
  description: string;
  cover_image: string;
  release_date: string;
  status: 'live' | 'upcoming' | 'archived';
  product_ids: string[];
}

export interface Drop {
  id: string;
  slug: string;
  title: string;
  collectionName: string;
  creatorId: string;
  creatorName: string;
  creatorSlug: string;
  creatorCategory: CategoryType;
  country: string;
  description: string;
  coverImage: string;
  additionalImages?: string[];
  releaseDate: string;
  countdownTargetDate: string; // ISO date string
  status: 'LIVE' | 'COMING_SOON' | 'SELLING_FAST' | 'SOLD_OUT';
  productCount: number;
  highlightProductIds: string[];
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  currency: CurrencyType;
  paymentMethod: 'mpesa' | 'card' | 'airtel' | 'paystack';
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  county: string;
  town: string;
  deliveryAddress: string;
  deliveryNotes?: string;
  mpesaReceipt?: string;
  paystackReference?: string;
  paystackChannel?: string;
  status: 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
}

export interface CreatorApplication {
  id: string;
  creatorName: string;
  fullName?: string;
  brandName?: string;
  category: CategoryType;
  country: string;
  socialLinks?: any;
  audienceSize: string;
  existingMerch?: string;
  email: string;
  phone: string;
  bioOrVision?: string;
  reason?: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'pending';
  submittedAt: string;
}
