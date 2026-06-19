import { supabase } from '../lib/supabase';
import {
  Business, Category, City, Review, Offer, Coupon, Lead, SubscriptionPlan,
  AdProduct, AdCampaign, Invoice, Affiliate, Referral, Commission, BlogPost,
  Product, Order, SupportTicket, AppNotification,
} from './types';

const BUSINESS_SELECT = '*, category:categories(*), city:cities(*)';

// ---------------------------------------------------------------------------
// Taxonomy
// ---------------------------------------------------------------------------
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('sort_order');
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data } = await supabase.from('categories').select('*').eq('slug', slug).maybeSingle();
  return (data as Category | null) ?? null;
}

export async function getCities(): Promise<City[]> {
  const { data, error } = await supabase.from('cities').select('*').order('sort_order');
  if (error) throw error;
  return (data ?? []) as City[];
}

export async function getCityBySlug(slug: string): Promise<City | null> {
  const { data } = await supabase.from('cities').select('*').eq('slug', slug).maybeSingle();
  return (data as City | null) ?? null;
}

// ---------------------------------------------------------------------------
// Businesses (public discovery)
// ---------------------------------------------------------------------------
export interface BusinessFilter {
  categorySlug?: string;
  citySlug?: string;
  q?: string;
  featured?: boolean;
  sponsored?: boolean;
  sort?: 'rating' | 'views' | 'newest';
  limit?: number;
}

export async function listBusinesses(filter: BusinessFilter = {}): Promise<Business[]> {
  let query = supabase.from('businesses').select(BUSINESS_SELECT).eq('status', 'active');

  if (filter.featured) query = query.eq('is_featured', true);
  if (filter.sponsored) query = query.eq('is_sponsored', true);
  if (filter.q) query = query.or(`name.ilike.%${filter.q}%,description.ilike.%${filter.q}%`);

  if (filter.categorySlug) {
    const cat = await getCategoryBySlug(filter.categorySlug);
    if (cat) query = query.eq('category_id', cat.id);
  }
  if (filter.citySlug) {
    const city = await getCityBySlug(filter.citySlug);
    if (city) query = query.eq('city_id', city.id);
  }

  if (filter.sort === 'views') query = query.order('views_count', { ascending: false });
  else if (filter.sort === 'newest') query = query.order('created_at', { ascending: false });
  else query = query.order('rating_avg', { ascending: false });

  if (filter.limit) query = query.limit(filter.limit);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Business[];
}

export async function getBusinessBySlug(slug: string): Promise<Business | null> {
  const { data } = await supabase.from('businesses').select(BUSINESS_SELECT).eq('slug', slug).maybeSingle();
  return (data as Business | null) ?? null;
}

export async function getSimilarBusinesses(business: Business, limit = 4): Promise<Business[]> {
  if (!business.category_id) return [];
  const { data } = await supabase
    .from('businesses').select(BUSINESS_SELECT)
    .eq('status', 'active').eq('category_id', business.category_id)
    .neq('id', business.id).order('rating_avg', { ascending: false }).limit(limit);
  return (data ?? []) as Business[];
}

export async function incrementBusinessViews(id: string, current: number): Promise<void> {
  await supabase.from('businesses').update({ views_count: current + 1 }).eq('id', id);
  await supabase.from('analytics_events').insert({ type: 'view', business_id: id });
}

export async function getBusinessImages(businessId: string) {
  const { data } = await supabase.from('business_images').select('*').eq('business_id', businessId).order('sort_order');
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------
export async function getBusinessReviews(businessId: string): Promise<Review[]> {
  const { data } = await supabase
    .from('reviews').select('*').eq('business_id', businessId).eq('status', 'approved')
    .order('created_at', { ascending: false });
  return (data ?? []) as Review[];
}

export async function submitReview(input: {
  business_id: string; reviewer_name: string; rating: number; title: string; body: string;
}): Promise<void> {
  const { error } = await supabase.from('reviews').insert({ ...input, status: 'approved' });
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Offers / Coupons
// ---------------------------------------------------------------------------
export async function listOffers(limit?: number): Promise<Offer[]> {
  let q = supabase.from('offers')
    .select('*, business:businesses(name, slug, logo_url, city_id)')
    .eq('is_active', true).order('created_at', { ascending: false });
  if (limit) q = q.limit(limit);
  const { data } = await q;
  return (data ?? []) as Offer[];
}

export async function listCoupons(limit?: number): Promise<Coupon[]> {
  let q = supabase.from('coupons')
    .select('*, business:businesses(name, slug, logo_url)')
    .eq('is_active', true).order('created_at', { ascending: false });
  if (limit) q = q.limit(limit);
  const { data } = await q;
  return (data ?? []) as Coupon[];
}

export async function getBusinessOffers(businessId: string): Promise<Offer[]> {
  const { data } = await supabase.from('offers').select('*').eq('business_id', businessId).eq('is_active', true).order('created_at', { ascending: false });
  return (data ?? []) as Offer[];
}

export async function getBusinessCoupons(businessId: string): Promise<Coupon[]> {
  const { data } = await supabase.from('coupons').select('*').eq('business_id', businessId).eq('is_active', true).order('created_at', { ascending: false });
  return (data ?? []) as Coupon[];
}

export async function redeemCoupon(couponId: string, usedCount: number): Promise<void> {
  await supabase.from('coupon_redemptions').insert({ coupon_id: couponId });
  await supabase.from('coupons').update({ used_count: usedCount + 1 }).eq('id', couponId);
}

// ---------------------------------------------------------------------------
// Leads
// ---------------------------------------------------------------------------
export async function submitLead(input: {
  business_id: string; name: string; phone: string; email: string; message: string; source?: string;
}): Promise<void> {
  const { error } = await supabase.from('leads').insert({ source: 'profile', ...input });
  if (error) throw error;
  await supabase.from('analytics_events').insert({ type: 'lead', business_id: input.business_id });
}

// ---------------------------------------------------------------------------
// Plans & Ad products
// ---------------------------------------------------------------------------
export async function getPlans(): Promise<SubscriptionPlan[]> {
  const { data } = await supabase.from('subscription_plans').select('*').order('sort_order');
  return (data ?? []) as SubscriptionPlan[];
}

export async function getAdProducts(): Promise<AdProduct[]> {
  const { data } = await supabase.from('ad_products').select('*').order('sort_order');
  return (data ?? []) as AdProduct[];
}

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------
export async function listPosts(limit?: number): Promise<BlogPost[]> {
  let q = supabase.from('blog_posts').select('*, author:authors(*)')
    .eq('status', 'published').order('published_at', { ascending: false });
  if (limit) q = q.limit(limit);
  const { data } = await q;
  return (data ?? []) as BlogPost[];
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data } = await supabase.from('blog_posts').select('*, author:authors(*)').eq('slug', slug).maybeSingle();
  return (data as BlogPost | null) ?? null;
}

// ---------------------------------------------------------------------------
// Owner dashboard
// ---------------------------------------------------------------------------
export async function myBusinesses(): Promise<Business[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase.from('businesses').select(BUSINESS_SELECT)
    .eq('owner_id', user.id).order('created_at', { ascending: false });
  return (data ?? []) as Business[];
}

export async function createBusiness(input: Partial<Business>): Promise<Business> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('not authenticated');
  const slug = (input.slug || input.name || 'business')
    .toLowerCase().trim().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).slice(2, 6);
  const { data, error } = await supabase.from('businesses')
    .insert({ ...input, slug, owner_id: user.id, status: 'pending', is_claimed: true })
    .select(BUSINESS_SELECT).single();
  if (error) throw error;
  return data as Business;
}

export async function updateBusiness(id: string, patch: Partial<Business>): Promise<void> {
  const { error } = await supabase.from('businesses').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

export async function ownerOffers(businessId: string): Promise<Offer[]> {
  const { data } = await supabase.from('offers').select('*').eq('business_id', businessId).order('created_at', { ascending: false });
  return (data ?? []) as Offer[];
}
export async function createOffer(input: Partial<Offer>): Promise<void> {
  const { error } = await supabase.from('offers').insert(input);
  if (error) throw error;
}
export async function deleteOffer(id: string): Promise<void> {
  const { error } = await supabase.from('offers').delete().eq('id', id);
  if (error) throw error;
}

export async function ownerCoupons(businessId: string): Promise<Coupon[]> {
  const { data } = await supabase.from('coupons').select('*').eq('business_id', businessId).order('created_at', { ascending: false });
  return (data ?? []) as Coupon[];
}
export async function createCoupon(input: Partial<Coupon>): Promise<void> {
  const { error } = await supabase.from('coupons').insert(input);
  if (error) throw error;
}
export async function deleteCoupon(id: string): Promise<void> {
  const { error } = await supabase.from('coupons').delete().eq('id', id);
  if (error) throw error;
}

export async function ownerLeads(businessId: string): Promise<Lead[]> {
  const { data } = await supabase.from('leads').select('*').eq('business_id', businessId).order('created_at', { ascending: false });
  return (data ?? []) as Lead[];
}
export async function updateLeadStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase.from('leads').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function ownerReviews(businessId: string): Promise<Review[]> {
  const { data } = await supabase.from('reviews').select('*').eq('business_id', businessId).order('created_at', { ascending: false });
  return (data ?? []) as Review[];
}
export async function respondToReview(id: string, business_response: string): Promise<void> {
  const { error } = await supabase.from('reviews').update({ business_response }).eq('id', id);
  if (error) throw error;
}

export async function ownerCampaigns(businessId: string): Promise<AdCampaign[]> {
  const { data } = await supabase.from('ad_campaigns').select('*, ad_product:ad_products(*)').eq('business_id', businessId).order('created_at', { ascending: false });
  return (data ?? []) as AdCampaign[];
}
export async function buyAd(businessId: string, product: AdProduct): Promise<void> {
  const { error } = await supabase.from('ad_campaigns').insert({
    business_id: businessId, ad_product_id: product.id, placement: product.placement,
    status: 'active', budget: product.price, ends_at: new Date(Date.now() + 30 * 864e5).toISOString(),
  });
  if (error) throw error;
  await supabase.from('invoices').insert({
    business_id: businessId, amount: product.price, status: 'paid', kind: 'ad',
    description: 'حملة إعلانية: ' + product.name_ar,
  });
}

export async function subscribeBusiness(businessId: string, plan: SubscriptionPlan): Promise<void> {
  await supabase.from('businesses').update({ plan: plan.key }).eq('id', businessId);
  await supabase.from('business_subscriptions').insert({
    business_id: businessId, plan_key: plan.key, status: 'active',
    current_period_end: new Date(Date.now() + 30 * 864e5).toISOString(),
  });
  if (plan.price_monthly > 0) {
    await supabase.from('invoices').insert({
      business_id: businessId, amount: plan.price_monthly, status: 'paid', kind: 'subscription',
      description: 'اشتراك خطة ' + plan.name_ar,
    });
  }
}

export async function businessAnalytics(businessId: string) {
  const { count: views } = await supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('business_id', businessId).eq('type', 'view');
  const { count: clicks } = await supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('business_id', businessId).eq('type', 'click');
  const { count: leads } = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('business_id', businessId);
  return { views: views ?? 0, clicks: clicks ?? 0, leads: leads ?? 0 };
}

// ---------------------------------------------------------------------------
// Affiliate
// ---------------------------------------------------------------------------
export async function myAffiliate(): Promise<Affiliate | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('affiliates').select('*').eq('user_id', user.id).maybeSingle();
  return (data as Affiliate | null) ?? null;
}
export async function becomeAffiliate(): Promise<Affiliate> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('not authenticated');
  const code = 'AFF' + Math.random().toString(36).slice(2, 8).toUpperCase();
  const { data, error } = await supabase.from('affiliates').insert({ user_id: user.id, code }).select('*').single();
  if (error) throw error;
  return data as Affiliate;
}
export async function affiliateReferrals(affiliateId: string): Promise<Referral[]> {
  const { data } = await supabase.from('referrals').select('*').eq('affiliate_id', affiliateId).order('created_at', { ascending: false });
  return (data ?? []) as Referral[];
}
export async function affiliateCommissions(affiliateId: string): Promise<Commission[]> {
  const { data } = await supabase.from('commissions').select('*').eq('affiliate_id', affiliateId).order('created_at', { ascending: false });
  return (data ?? []) as Commission[];
}
export async function inviteReferral(affiliateId: string, referred_email: string, referred_name: string): Promise<void> {
  const { error } = await supabase.from('referrals').insert({ affiliate_id: affiliateId, referred_email, referred_name, status: 'pending' });
  if (error) throw error;
}
export async function requestPayout(affiliateId: string, amount: number, method: string): Promise<void> {
  const { error } = await supabase.from('payouts').insert({ affiliate_id: affiliateId, amount, method, status: 'requested' });
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Public homepage statistics
// ---------------------------------------------------------------------------
export interface PublicStats { merchants: number; products: number; cities: number; reviews: number; }
export async function publicStats(): Promise<PublicStats> {
  const head = { count: 'exact' as const, head: true };
  const [m, p, c, r] = await Promise.all([
    supabase.from('businesses').select('*', head).eq('status', 'active'),
    supabase.from('products').select('*', head).eq('status', 'active'),
    supabase.from('cities').select('*', head),
    supabase.from('reviews').select('*', head).eq('status', 'approved'),
  ]);
  return { merchants: m.count ?? 0, products: p.count ?? 0, cities: c.count ?? 0, reviews: r.count ?? 0 };
}

// ---------------------------------------------------------------------------
// Products & Orders (marketplace)
// ---------------------------------------------------------------------------
export interface ProductFilter { q?: string; sort?: 'newest' | 'price_asc' | 'price_desc'; categoryId?: string; limit?: number; }
export async function listProducts(opts: ProductFilter = {}): Promise<Product[]> {
  const select = opts.categoryId
    ? '*, business:businesses!inner(name, slug, logo_url, category_id)'
    : '*, business:businesses(name, slug, logo_url)';
  let q = supabase.from('products').select(select).eq('status', 'active');
  if (opts.categoryId) q = q.eq('business.category_id', opts.categoryId);
  if (opts.q) q = q.ilike('name', `%${opts.q}%`);
  if (opts.sort === 'price_asc') q = q.order('price', { ascending: true });
  else if (opts.sort === 'price_desc') q = q.order('price', { ascending: false });
  else q = q.order('created_at', { ascending: false });
  if (opts.limit) q = q.limit(opts.limit);
  const { data } = await q;
  return (data ?? []) as Product[];
}

export async function listFeaturedProducts(limit = 8): Promise<Product[]> {
  const { data } = await supabase.from('products')
    .select('*, business:businesses(name, slug, logo_url)')
    .eq('status', 'active').eq('is_featured', true)
    .order('created_at', { ascending: false }).limit(limit);
  return (data ?? []) as Product[];
}
export async function getBusinessProducts(businessId: string): Promise<Product[]> {
  const { data } = await supabase.from('products').select('*').eq('business_id', businessId).order('created_at', { ascending: false });
  return (data ?? []) as Product[];
}
export async function createProduct(input: Partial<Product>): Promise<void> {
  const { error } = await supabase.from('products').insert(input);
  if (error) throw error;
}
export async function updateProduct(id: string, patch: Partial<Product>): Promise<void> {
  const { error } = await supabase.from('products').update(patch).eq('id', id);
  if (error) throw error;
}
export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}
export async function placeOrder(input: Partial<Order>): Promise<void> {
  const { error } = await supabase.from('orders').insert(input);
  if (error) throw error;
}
export async function businessOrders(businessId: string): Promise<Order[]> {
  const { data } = await supabase.from('orders').select('*, product:products(name)').eq('business_id', businessId).order('created_at', { ascending: false });
  return (data ?? []) as Order[];
}
export async function updateOrderStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Support tickets & notifications
// ---------------------------------------------------------------------------
export async function businessTickets(businessId: string): Promise<SupportTicket[]> {
  const { data } = await supabase.from('support_tickets').select('*').eq('business_id', businessId).order('created_at', { ascending: false });
  return (data ?? []) as SupportTicket[];
}
export async function createTicket(input: Partial<SupportTicket>): Promise<void> {
  const { error } = await supabase.from('support_tickets').insert(input);
  if (error) throw error;
}
export async function businessNotifications(businessId: string): Promise<AppNotification[]> {
  const { data } = await supabase.from('notifications').select('*').eq('business_id', businessId).order('created_at', { ascending: false });
  return (data ?? []) as AppNotification[];
}
export async function markNotificationRead(id: string): Promise<void> {
  await supabase.from('notifications').update({ is_read: true }).eq('id', id);
}

// ---------------------------------------------------------------------------
// Merchant registration (onboarding)
// ---------------------------------------------------------------------------
export interface MerchantInput {
  name: string; description: string; category_id: string; city_id: string;
  contact_person: string; mobile: string; email: string; whatsapp: string;
  cr_number: string; vat_number: string; national_address: string;
  cr_document_url: string; logo_url: string;
}
export async function registerMerchant(input: MerchantInput): Promise<Business> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('not authenticated');
  const slug = (input.name || 'merchant').toLowerCase().trim()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).slice(2, 6);
  const { data, error } = await supabase.from('businesses').insert({
    ...input, slug, owner_id: user.id, status: 'pending',
    verification_status: input.cr_document_url ? 'under_review' : 'pending',
    is_claimed: true, plan: 'free',
    cover_url: `https://picsum.photos/seed/${slug}/1200/600`,
  }).select(BUSINESS_SELECT).single();
  if (error) throw error;
  await supabase.from('notifications').insert({
    business_id: (data as Business).id, title: 'تم استلام طلبك',
    body: 'جارٍ مراجعة مستنداتك. سيتم تفعيل حسابك خلال 24 ساعة.', type: 'system',
  });
  return data as Business;
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------
export async function adminSetVerification(id: string, verification_status: 'pending' | 'under_review' | 'approved' | 'rejected'): Promise<void> {
  const patch: Partial<Business> = { verification_status };
  if (verification_status === 'approved') { patch.is_verified = true; patch.status = 'active'; }
  if (verification_status === 'rejected') { patch.is_verified = false; }
  const { error } = await supabase.from('businesses').update(patch).eq('id', id);
  if (error) throw error;
}
export async function adminAllBusinesses(): Promise<Business[]> {
  const { data } = await supabase.from('businesses').select(BUSINESS_SELECT).order('created_at', { ascending: false });
  return (data ?? []) as Business[];
}
export async function adminAllReviews(): Promise<Review[]> {
  const { data } = await supabase.from('reviews').select('*, business:businesses(name, slug)').order('created_at', { ascending: false });
  return (data ?? []) as Review[];
}
export async function adminAllLeads(): Promise<Lead[]> {
  const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
  return (data ?? []) as Lead[];
}
export async function adminInvoices(): Promise<Invoice[]> {
  const { data } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
  return (data ?? []) as Invoice[];
}
export async function adminCampaigns(): Promise<AdCampaign[]> {
  const { data } = await supabase.from('ad_campaigns').select('*, ad_product:ad_products(*), business:businesses(name, slug)').order('created_at', { ascending: false });
  return (data ?? []) as AdCampaign[];
}
export async function adminAffiliates(): Promise<Affiliate[]> {
  const { data } = await supabase.from('affiliates').select('*').order('created_at', { ascending: false });
  return (data ?? []) as Affiliate[];
}
export async function adminUpdateBusiness(id: string, patch: Partial<Business>): Promise<void> {
  const { error } = await supabase.from('businesses').update(patch).eq('id', id);
  if (error) throw error;
}
export async function adminModerateReview(id: string, status: 'pending' | 'approved' | 'rejected'): Promise<void> {
  const { error } = await supabase.from('reviews').update({ status }).eq('id', id);
  if (error) throw error;
}

export interface AdminStats {
  businesses: number; activeBusinesses: number; pendingBusinesses: number;
  reviews: number; leads: number; revenue: number; affiliates: number;
  topCategories: { name: string; count: number }[];
  topCities: { name: string; count: number }[];
}

export async function adminStats(): Promise<AdminStats> {
  const [biz, invoices, reviews, leads, affiliates, cats, cities] = await Promise.all([
    adminAllBusinesses(), adminInvoices(), adminAllReviews(), adminAllLeads(), adminAffiliates(),
    getCategories(), getCities(),
  ]);
  const revenue = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + Number(i.amount), 0);
  const catCount = (cid: string | null) => biz.filter((b) => b.category_id === cid).length;
  const cityCount = (cid: string | null) => biz.filter((b) => b.city_id === cid).length;
  const topCategories = cats.map((c) => ({ name: c.name_ar, count: catCount(c.id) })).sort((a, b) => b.count - a.count).slice(0, 5);
  const topCities = cities.map((c) => ({ name: c.name_ar, count: cityCount(c.id) })).sort((a, b) => b.count - a.count).slice(0, 5);
  return {
    businesses: biz.length,
    activeBusinesses: biz.filter((b) => b.status === 'active').length,
    pendingBusinesses: biz.filter((b) => b.status === 'pending').length,
    reviews: reviews.length, leads: leads.length, revenue, affiliates: affiliates.length,
    topCategories, topCities,
  };
}
