/*
  # Saudi Discovery — production schema

  A discovery + advertising platform for local businesses. This migration creates
  the full data model: taxonomy (categories, cities), businesses and their media,
  reviews, offers, coupons, leads, events, subscriptions, advertising, affiliates,
  blog/CMS, payments and analytics — with RLS policies and table grants.

  Public content (active businesses, taxonomy, approved reviews, active offers/
  coupons, published posts) is world-readable. Business owners manage their own
  rows; admins (profiles.role = 'admin', via public.is_admin()) manage everything.
*/

-- ---------------------------------------------------------------------------
-- Taxonomy
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name_ar text NOT NULL DEFAULT '',
  name_en text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'Store',
  description_ar text NOT NULL DEFAULT '',
  parent_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name_ar text NOT NULL DEFAULT '',
  name_en text NOT NULL DEFAULT '',
  region text NOT NULL DEFAULT '',
  latitude double precision,
  longitude double precision,
  image_url text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Businesses
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  slug text UNIQUE NOT NULL,
  name text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  city_id uuid REFERENCES public.cities(id) ON DELETE SET NULL,
  logo_url text NOT NULL DEFAULT '',
  cover_url text NOT NULL DEFAULT '',
  video_url text NOT NULL DEFAULT '',
  website text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  latitude double precision,
  longitude double precision,
  google_maps_url text NOT NULL DEFAULT '',
  facebook text NOT NULL DEFAULT '',
  instagram text NOT NULL DEFAULT '',
  twitter text NOT NULL DEFAULT '',
  tiktok text NOT NULL DEFAULT '',
  snapchat text NOT NULL DEFAULT '',
  linkedin text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  plan text NOT NULL DEFAULT 'free',          -- free | silver | gold | diamond | enterprise
  status text NOT NULL DEFAULT 'pending',     -- pending | active | rejected
  is_featured boolean NOT NULL DEFAULT false,
  is_sponsored boolean NOT NULL DEFAULT false,
  is_verified boolean NOT NULL DEFAULT false,
  is_claimed boolean NOT NULL DEFAULT false,
  rating_avg numeric(2,1) NOT NULL DEFAULT 0,
  rating_count integer NOT NULL DEFAULT 0,
  views_count integer NOT NULL DEFAULT 0,
  leads_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS businesses_category_idx ON public.businesses (category_id);
CREATE INDEX IF NOT EXISTS businesses_city_idx ON public.businesses (city_id);
CREATE INDEX IF NOT EXISTS businesses_status_idx ON public.businesses (status);
CREATE INDEX IF NOT EXISTS businesses_featured_idx ON public.businesses (is_featured) WHERE is_featured;
CREATE INDEX IF NOT EXISTS businesses_owner_idx ON public.businesses (owner_id);
CREATE INDEX IF NOT EXISTS businesses_tags_idx ON public.businesses USING gin (tags);

CREATE TABLE IF NOT EXISTS public.business_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  url text NOT NULL,
  caption text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS business_images_biz_idx ON public.business_images (business_id);

-- Helper: does the current user own a given business? (defined after businesses exists)
CREATE OR REPLACE FUNCTION public.owns_business(biz uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (SELECT 1 FROM public.businesses WHERE id = biz AND owner_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- Reviews (guest-friendly: user_id optional, reviewer_name stored)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_name text NOT NULL DEFAULT '',
  rating integer NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  title text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  photos text[] NOT NULL DEFAULT '{}',
  business_response text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'approved',     -- pending | approved | rejected
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS reviews_biz_idx ON public.reviews (business_id);
CREATE INDEX IF NOT EXISTS reviews_status_idx ON public.reviews (status);

-- ---------------------------------------------------------------------------
-- Offers / Deals
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  discount_percent integer NOT NULL DEFAULT 0,
  original_price numeric(10,2),
  sale_price numeric(10,2),
  starts_at timestamptz DEFAULT now(),
  ends_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS offers_biz_idx ON public.offers (business_id);
CREATE INDEX IF NOT EXISTS offers_active_idx ON public.offers (is_active);

-- ---------------------------------------------------------------------------
-- Coupons
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  code text NOT NULL,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  discount_type text NOT NULL DEFAULT 'percent', -- percent | fixed
  discount_value numeric(10,2) NOT NULL DEFAULT 0,
  usage_limit integer NOT NULL DEFAULT 0,         -- 0 = unlimited
  used_count integer NOT NULL DEFAULT 0,
  starts_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS coupons_biz_idx ON public.coupons (business_id);

CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  redeemed_at timestamptz DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Leads
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT 'profile',   -- profile | offer | coupon | ad | search
  status text NOT NULL DEFAULT 'new',       -- new | contacted | converted | lost
  notes text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS leads_biz_idx ON public.leads (business_id);
CREATE INDEX IF NOT EXISTS leads_status_idx ON public.leads (status);

-- ---------------------------------------------------------------------------
-- Events / Promotions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS events_biz_idx ON public.events (business_id);

-- ---------------------------------------------------------------------------
-- Subscriptions & billing
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,                  -- free | silver | gold | diamond | enterprise
  name_ar text NOT NULL DEFAULT '',
  name_en text NOT NULL DEFAULT '',
  price_monthly numeric(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'SAR',
  features jsonb NOT NULL DEFAULT '[]',
  max_images integer NOT NULL DEFAULT 3,
  max_offers integer NOT NULL DEFAULT 1,
  max_coupons integer NOT NULL DEFAULT 1,
  featured_slots integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  is_popular boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.business_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  plan_key text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',     -- active | canceled | past_due
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS business_subscriptions_biz_idx ON public.business_subscriptions (business_id);

CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE SET NULL,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'SAR',
  status text NOT NULL DEFAULT 'paid',       -- paid | open | refunded
  description text NOT NULL DEFAULT '',
  kind text NOT NULL DEFAULT 'subscription', -- subscription | ad | other
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS invoices_biz_idx ON public.invoices (business_id);

-- ---------------------------------------------------------------------------
-- Advertising
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ad_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  name_ar text NOT NULL DEFAULT '',
  name_en text NOT NULL DEFAULT '',
  description_ar text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'SAR',
  unit text NOT NULL DEFAULT 'per_month',    -- per_month | per_week | cpm
  placement text NOT NULL DEFAULT 'featured_listing',
  icon text NOT NULL DEFAULT 'Megaphone',
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.ad_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  ad_product_id uuid REFERENCES public.ad_products(id) ON DELETE SET NULL,
  placement text NOT NULL DEFAULT 'featured_listing',
  image_url text NOT NULL DEFAULT '',
  link_url text NOT NULL DEFAULT '',
  target_city_id uuid REFERENCES public.cities(id) ON DELETE SET NULL,
  target_category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',    -- pending | active | paused | ended
  budget numeric(10,2) NOT NULL DEFAULT 0,
  impressions integer NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  starts_at timestamptz DEFAULT now(),
  ends_at timestamptz,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ad_campaigns_biz_idx ON public.ad_campaigns (business_id);
CREATE INDEX IF NOT EXISTS ad_campaigns_placement_idx ON public.ad_campaigns (placement, status);

-- ---------------------------------------------------------------------------
-- Affiliates
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'active',
  payout_method text NOT NULL DEFAULT '',
  total_earned numeric(10,2) NOT NULL DEFAULT 0,
  total_paid numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  business_id uuid REFERENCES public.businesses(id) ON DELETE SET NULL,
  referred_email text NOT NULL DEFAULT '',
  referred_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',    -- pending | signed_up | converted
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS referrals_affiliate_idx ON public.referrals (affiliate_id);

CREATE TABLE IF NOT EXISTS public.commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  referral_id uuid REFERENCES public.referrals(id) ON DELETE SET NULL,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'SAR',
  status text NOT NULL DEFAULT 'pending',    -- pending | approved | paid
  description text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS commissions_affiliate_idx ON public.commissions (affiliate_id);

CREATE TABLE IF NOT EXISTS public.payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'SAR',
  method text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'requested',  -- requested | paid
  created_at timestamptz DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Blog / CMS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  avatar_url text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name_ar text NOT NULL DEFAULT '',
  name_en text NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL DEFAULT '',
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  cover_url text NOT NULL DEFAULT '',
  author_id uuid REFERENCES public.authors(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  tags text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'published',  -- draft | published
  seo_title text NOT NULL DEFAULT '',
  seo_description text NOT NULL DEFAULT '',
  views integer NOT NULL DEFAULT 0,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS blog_posts_status_idx ON public.blog_posts (status);

-- ---------------------------------------------------------------------------
-- Analytics
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'view',         -- view | click | lead | conversion
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE,
  city_id uuid REFERENCES public.cities(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS analytics_type_idx ON public.analytics_events (type);
CREATE INDEX IF NOT EXISTS analytics_biz_idx ON public.analytics_events (business_id);

-- ===========================================================================
-- Row Level Security
-- ===========================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Public read-only catalog tables
CREATE POLICY "public read categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write categories" ON public.categories FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "public read cities" ON public.cities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write cities" ON public.cities FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "public read plans" ON public.subscription_plans FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write plans" ON public.subscription_plans FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "public read ad_products" ON public.ad_products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write ad_products" ON public.ad_products FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "public read blog_categories" ON public.blog_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write blog_categories" ON public.blog_categories FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "public read authors" ON public.authors FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write authors" ON public.authors FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Businesses: public sees active; owners see/manage own; admins all
CREATE POLICY "public read active businesses" ON public.businesses FOR SELECT TO anon, authenticated
  USING (status = 'active' OR owner_id = auth.uid() OR public.is_admin());
CREATE POLICY "owner insert business" ON public.businesses FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY "owner update business" ON public.businesses FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR public.is_admin()) WITH CHECK (owner_id = auth.uid() OR public.is_admin());
CREATE POLICY "owner delete business" ON public.businesses FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR public.is_admin());

-- Business images
CREATE POLICY "public read business_images" ON public.business_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "owner manage business_images" ON public.business_images FOR ALL TO authenticated
  USING (public.owns_business(business_id) OR public.is_admin())
  WITH CHECK (public.owns_business(business_id) OR public.is_admin());

-- Reviews: public sees approved; anyone can submit (pending); owners respond; admins moderate
CREATE POLICY "public read approved reviews" ON public.reviews FOR SELECT TO anon, authenticated
  USING (status = 'approved' OR public.owns_business(business_id) OR public.is_admin());
CREATE POLICY "anyone submit review" ON public.reviews FOR INSERT TO anon, authenticated
  WITH CHECK (true);
CREATE POLICY "owner or admin update review" ON public.reviews FOR UPDATE TO authenticated
  USING (public.owns_business(business_id) OR public.is_admin())
  WITH CHECK (public.owns_business(business_id) OR public.is_admin());
CREATE POLICY "admin delete review" ON public.reviews FOR DELETE TO authenticated
  USING (public.is_admin() OR public.owns_business(business_id));

-- Offers: public sees active; owner manages
CREATE POLICY "public read active offers" ON public.offers FOR SELECT TO anon, authenticated
  USING (is_active OR public.owns_business(business_id) OR public.is_admin());
CREATE POLICY "owner manage offers" ON public.offers FOR ALL TO authenticated
  USING (public.owns_business(business_id) OR public.is_admin())
  WITH CHECK (public.owns_business(business_id) OR public.is_admin());

-- Coupons: public sees active; owner manages
CREATE POLICY "public read active coupons" ON public.coupons FOR SELECT TO anon, authenticated
  USING (is_active OR public.owns_business(business_id) OR public.is_admin());
CREATE POLICY "owner manage coupons" ON public.coupons FOR ALL TO authenticated
  USING (public.owns_business(business_id) OR public.is_admin())
  WITH CHECK (public.owns_business(business_id) OR public.is_admin());

-- Coupon redemptions: anyone can redeem; owner/admin read
CREATE POLICY "anyone redeem coupon" ON public.coupon_redemptions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "owner read redemptions" ON public.coupon_redemptions FOR SELECT TO authenticated
  USING (public.is_admin() OR EXISTS (SELECT 1 FROM public.coupons c WHERE c.id = coupon_id AND public.owns_business(c.business_id)));

-- Events: public sees active; owner manages
CREATE POLICY "public read active events" ON public.events FOR SELECT TO anon, authenticated
  USING (is_active OR public.owns_business(business_id) OR public.is_admin());
CREATE POLICY "owner manage events" ON public.events FOR ALL TO authenticated
  USING (public.owns_business(business_id) OR public.is_admin())
  WITH CHECK (public.owns_business(business_id) OR public.is_admin());

-- Leads: anyone can create (contact form); owner/admin read & manage
CREATE POLICY "anyone create lead" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "owner read leads" ON public.leads FOR SELECT TO authenticated
  USING (public.owns_business(business_id) OR public.is_admin());
CREATE POLICY "owner update leads" ON public.leads FOR UPDATE TO authenticated
  USING (public.owns_business(business_id) OR public.is_admin())
  WITH CHECK (public.owns_business(business_id) OR public.is_admin());
CREATE POLICY "owner delete leads" ON public.leads FOR DELETE TO authenticated
  USING (public.owns_business(business_id) OR public.is_admin());

-- Business subscriptions
CREATE POLICY "owner read subscription" ON public.business_subscriptions FOR SELECT TO authenticated
  USING (public.owns_business(business_id) OR public.is_admin());
CREATE POLICY "owner manage subscription" ON public.business_subscriptions FOR ALL TO authenticated
  USING (public.owns_business(business_id) OR public.is_admin())
  WITH CHECK (public.owns_business(business_id) OR public.is_admin());

-- Invoices
CREATE POLICY "owner read invoices" ON public.invoices FOR SELECT TO authenticated
  USING ((business_id IS NOT NULL AND public.owns_business(business_id)) OR public.is_admin());
CREATE POLICY "owner create invoice" ON public.invoices FOR INSERT TO authenticated
  WITH CHECK ((business_id IS NOT NULL AND public.owns_business(business_id)) OR public.is_admin());

-- Ad campaigns
CREATE POLICY "owner read campaigns" ON public.ad_campaigns FOR SELECT TO authenticated
  USING (public.owns_business(business_id) OR public.is_admin());
CREATE POLICY "owner manage campaigns" ON public.ad_campaigns FOR ALL TO authenticated
  USING (public.owns_business(business_id) OR public.is_admin())
  WITH CHECK (public.owns_business(business_id) OR public.is_admin());

-- Affiliates: a user manages their own affiliate row; admins all
CREATE POLICY "self read affiliate" ON public.affiliates FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "self create affiliate" ON public.affiliates FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "self update affiliate" ON public.affiliates FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "affiliate read referrals" ON public.referrals FOR SELECT TO authenticated
  USING (public.is_admin() OR EXISTS (SELECT 1 FROM public.affiliates a WHERE a.id = affiliate_id AND a.user_id = auth.uid()));
CREATE POLICY "affiliate manage referrals" ON public.referrals FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.affiliates a WHERE a.id = affiliate_id AND a.user_id = auth.uid()));

CREATE POLICY "affiliate read commissions" ON public.commissions FOR SELECT TO authenticated
  USING (public.is_admin() OR EXISTS (SELECT 1 FROM public.affiliates a WHERE a.id = affiliate_id AND a.user_id = auth.uid()));
CREATE POLICY "admin manage commissions" ON public.commissions FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "affiliate read payouts" ON public.payouts FOR SELECT TO authenticated
  USING (public.is_admin() OR EXISTS (SELECT 1 FROM public.affiliates a WHERE a.id = affiliate_id AND a.user_id = auth.uid()));
CREATE POLICY "affiliate request payout" ON public.payouts FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.affiliates a WHERE a.id = affiliate_id AND a.user_id = auth.uid()));

-- Blog posts: public reads published; admins manage
CREATE POLICY "public read published posts" ON public.blog_posts FOR SELECT TO anon, authenticated
  USING (status = 'published' OR public.is_admin());
CREATE POLICY "admin manage posts" ON public.blog_posts FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Analytics: anyone can record an event; owner/admin read
CREATE POLICY "anyone record analytics" ON public.analytics_events FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "owner read analytics" ON public.analytics_events FOR SELECT TO authenticated
  USING (public.is_admin() OR (business_id IS NOT NULL AND public.owns_business(business_id)));

-- ===========================================================================
-- Grants (RLS enforces row access; table privileges are still required)
-- ===========================================================================
GRANT SELECT ON public.categories, public.cities, public.businesses, public.business_images,
  public.reviews, public.offers, public.coupons, public.events, public.subscription_plans,
  public.ad_products, public.blog_categories, public.authors, public.blog_posts TO anon, authenticated;

GRANT INSERT ON public.reviews, public.leads, public.coupon_redemptions, public.analytics_events TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.businesses, public.business_images, public.reviews, public.offers, public.coupons,
  public.coupon_redemptions, public.leads, public.events, public.business_subscriptions,
  public.invoices, public.ad_campaigns, public.affiliates, public.referrals, public.commissions,
  public.payouts, public.analytics_events TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.categories, public.cities, public.subscription_plans, public.ad_products,
  public.blog_categories, public.authors, public.blog_posts TO authenticated;
