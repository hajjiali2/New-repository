export type PlanKey = 'free' | 'silver' | 'gold' | 'diamond' | 'enterprise';
export type BusinessStatus = 'pending' | 'active' | 'rejected';
export type LeadStatus = 'new' | 'contacted' | 'converted' | 'lost';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Category {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  icon: string;
  description_ar: string;
  parent_id: string | null;
  sort_order: number;
}

export interface City {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  region: string;
  latitude: number | null;
  longitude: number | null;
  image_url: string;
  sort_order: number;
}

export interface Business {
  id: string;
  owner_id: string | null;
  slug: string;
  name: string;
  description: string;
  category_id: string | null;
  city_id: string | null;
  logo_url: string;
  cover_url: string;
  video_url: string;
  website: string;
  whatsapp: string;
  phone: string;
  email: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  google_maps_url: string;
  facebook: string;
  instagram: string;
  twitter: string;
  tiktok: string;
  snapchat: string;
  linkedin: string;
  tags: string[];
  plan: PlanKey;
  status: BusinessStatus;
  is_featured: boolean;
  is_sponsored: boolean;
  is_verified: boolean;
  is_claimed: boolean;
  rating_avg: number;
  rating_count: number;
  views_count: number;
  leads_count: number;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  city?: City | null;
}

export interface BusinessImage {
  id: string;
  business_id: string;
  url: string;
  caption: string;
  sort_order: number;
}

export interface Review {
  id: string;
  business_id: string;
  user_id: string | null;
  reviewer_name: string;
  rating: number;
  title: string;
  body: string;
  photos: string[];
  business_response: string;
  status: ReviewStatus;
  created_at: string;
  business?: Pick<Business, 'name' | 'slug'> | null;
}

export interface Offer {
  id: string;
  business_id: string;
  title: string;
  description: string;
  image_url: string;
  discount_percent: number;
  original_price: number | null;
  sale_price: number | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  created_at: string;
  business?: Pick<Business, 'name' | 'slug' | 'logo_url' | 'city_id'> | null;
}

export interface Coupon {
  id: string;
  business_id: string;
  code: string;
  title: string;
  description: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  usage_limit: number;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  business?: Pick<Business, 'name' | 'slug' | 'logo_url'> | null;
}

export interface Lead {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  source: string;
  status: LeadStatus;
  notes: string;
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  key: PlanKey;
  name_ar: string;
  name_en: string;
  price_monthly: number;
  currency: string;
  features: string[];
  max_images: number;
  max_offers: number;
  max_coupons: number;
  featured_slots: number;
  sort_order: number;
  is_popular: boolean;
}

export interface AdProduct {
  id: string;
  key: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  price: number;
  currency: string;
  unit: string;
  placement: string;
  icon: string;
  sort_order: number;
}

export interface AdCampaign {
  id: string;
  business_id: string;
  ad_product_id: string | null;
  placement: string;
  status: string;
  budget: number;
  impressions: number;
  clicks: number;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  ad_product?: AdProduct | null;
  business?: Pick<Business, 'name' | 'slug'> | null;
}

export interface Invoice {
  id: string;
  business_id: string | null;
  amount: number;
  currency: string;
  status: string;
  description: string;
  kind: string;
  created_at: string;
}

export interface Affiliate {
  id: string;
  user_id: string;
  code: string;
  status: string;
  payout_method: string;
  total_earned: number;
  total_paid: number;
  created_at: string;
}

export interface Referral {
  id: string;
  affiliate_id: string;
  business_id: string | null;
  referred_email: string;
  referred_name: string;
  status: string;
  created_at: string;
}

export interface Commission {
  id: string;
  affiliate_id: string;
  referral_id: string | null;
  amount: number;
  currency: string;
  status: string;
  description: string;
  created_at: string;
}

export interface Author {
  id: string;
  name: string;
  bio: string;
  avatar_url: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_url: string;
  author_id: string | null;
  category_id: string | null;
  tags: string[];
  status: string;
  seo_title: string;
  seo_description: string;
  views: number;
  published_at: string;
  created_at: string;
  author?: Author | null;
}
