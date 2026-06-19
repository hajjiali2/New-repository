/*
  # B2B Marketplace extension

  Turns Saudi Discovery into a merchant marketplace:
  - Extends `businesses` with Saudi compliance + trust fields (CR/VAT/contact/
    national address, verification workflow, response rate, completion score).
  - New tables: products, orders, support_tickets, notifications.
  - RLS + grants consistent with the rest of the schema.
  - Seeds demo products/orders/tickets/notifications and backfills merchant fields.
*/

-- Extend businesses ---------------------------------------------------------
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS cr_number text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS vat_number text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_person text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS mobile text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS national_address text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS cr_document_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'pending', -- pending | under_review | approved | rejected
  ADD COLUMN IF NOT EXISTS response_rate integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS completion_score integer NOT NULL DEFAULT 0;

-- Products ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  sale_price numeric(10,2),
  vat_percent numeric(5,2) NOT NULL DEFAULT 15,
  image_url text NOT NULL DEFAULT '',
  stock integer NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active',  -- active | hidden
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS products_business_idx ON public.products (business_id);
CREATE INDEX IF NOT EXISTS products_featured_idx ON public.products (is_featured) WHERE is_featured;

-- Orders --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  customer_name text NOT NULL DEFAULT '',
  customer_phone text NOT NULL DEFAULT '',
  customer_email text NOT NULL DEFAULT '',
  quantity integer NOT NULL DEFAULT 1,
  total numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'new',  -- new | processing | completed | cancelled
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS orders_business_idx ON public.orders (business_id);

-- Support tickets -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  subject text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',     -- open | pending | closed
  priority text NOT NULL DEFAULT 'normal', -- low | normal | high
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tickets_business_idx ON public.support_tickets (business_id);

-- Notifications -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'info',  -- info | order | review | system
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notifications_business_idx ON public.notifications (business_id);

-- RLS -----------------------------------------------------------------------
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read active products" ON public.products FOR SELECT TO anon, authenticated
  USING (status = 'active' OR public.owns_business(business_id) OR public.is_admin());
CREATE POLICY "owner manage products" ON public.products FOR ALL TO authenticated
  USING (public.owns_business(business_id) OR public.is_admin())
  WITH CHECK (public.owns_business(business_id) OR public.is_admin());

CREATE POLICY "anyone create order" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "owner read orders" ON public.orders FOR SELECT TO authenticated
  USING (public.owns_business(business_id) OR public.is_admin());
CREATE POLICY "owner update orders" ON public.orders FOR UPDATE TO authenticated
  USING (public.owns_business(business_id) OR public.is_admin())
  WITH CHECK (public.owns_business(business_id) OR public.is_admin());

CREATE POLICY "owner manage tickets" ON public.support_tickets FOR ALL TO authenticated
  USING (public.owns_business(business_id) OR public.is_admin())
  WITH CHECK (public.owns_business(business_id) OR public.is_admin());

CREATE POLICY "owner manage notifications" ON public.notifications FOR ALL TO authenticated
  USING (public.owns_business(business_id) OR public.is_admin())
  WITH CHECK (public.owns_business(business_id) OR public.is_admin());

-- Grants --------------------------------------------------------------------
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT ON public.orders TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products, public.orders, public.support_tickets, public.notifications TO authenticated;

-- New ad product: featured product placement --------------------------------
INSERT INTO public.ad_products (key, name_ar, name_en, description_ar, price, unit, placement, icon, sort_order) VALUES
  ('featured_product', 'إبراز منتج', 'Featured Product', 'إبراز منتجك في الصفحة الرئيسية وصفحات الفئات', 249, 'per_month', 'featured_product', 'PackageCheck', 9)
ON CONFLICT (key) DO NOTHING;

-- Seed demo merchant fields + products/orders/tickets/notifications ---------
DO $mkt$
DECLARE b record; p record; idx int;
BEGIN
  -- Backfill compliance + trust fields for existing demo businesses
  UPDATE public.businesses SET
    cr_number = '10' || lpad((floor(random()*9000000)+1000000)::text, 8, '0'),
    vat_number = '3' || lpad((floor(random()*900000000)+100000000)::text, 14, '0'),
    contact_person = 'مسؤول المبيعات',
    mobile = '9665' || lpad((floor(random()*90000000)+10000000)::text, 8, '0'),
    national_address = 'الرمز البريدي ' || (floor(random()*90000)+10000)::text,
    response_rate = 80 + floor(random()*20)::int,
    completion_score = 78 + floor(random()*22)::int,
    verification_status = CASE WHEN is_verified THEN 'approved' ELSE 'pending' END
  WHERE cr_number = '';

  IF (SELECT count(*) FROM public.products) = 0 THEN
    -- Products for paid/featured merchants
    FOR b IN SELECT id, slug, name FROM public.businesses WHERE plan IN ('gold','diamond','silver') OR is_featured LOOP
      FOR idx IN 1..4 LOOP
        INSERT INTO public.products (business_id, name, description, price, sale_price, image_url, stock, is_featured, status)
        VALUES (
          b.id,
          'منتج ' || idx || ' - ' || b.name,
          'منتج عالي الجودة من ' || b.name || '. متوفر الآن بسعر تنافسي وضمان كامل.',
          (50 + floor(random()*950))::numeric,
          CASE WHEN idx % 2 = 0 THEN (40 + floor(random()*400))::numeric ELSE NULL END,
          'https://picsum.photos/seed/' || b.slug || '-p' || idx || '/600/600',
          (5 + floor(random()*95))::int,
          (idx = 1),
          'active'
        );
      END LOOP;
    END LOOP;

    -- Orders for products
    FOR p IN SELECT pr.id AS pid, pr.business_id, pr.price FROM public.products pr LIMIT 40 LOOP
      INSERT INTO public.orders (business_id, product_id, customer_name, customer_phone, customer_email, quantity, total, status, created_at)
      VALUES (
        p.business_id, p.pid,
        'عميل ' || floor(random()*1000)::text,
        '96655' || lpad((floor(random()*9000000)+1000000)::text, 7, '0'),
        'cust' || floor(random()*10000)::text || '@example.com',
        1 + floor(random()*3)::int,
        p.price * (1 + floor(random()*3)::int) * 1.15,
        (ARRAY['new','processing','completed','completed'])[1 + floor(random()*4)::int],
        now() - make_interval(days => floor(random()*30)::int)
      );
    END LOOP;

    -- Support tickets + notifications for verified merchants
    FOR b IN SELECT id FROM public.businesses WHERE is_verified LIMIT 8 LOOP
      INSERT INTO public.support_tickets (business_id, subject, message, status, priority) VALUES
        (b.id, 'استفسار عن الفوترة', 'أرغب بمعرفة تفاصيل الاشتراك الحالي.', 'open', 'normal');
      INSERT INTO public.notifications (business_id, title, body, type, is_read) VALUES
        (b.id, 'طلب جديد', 'لديك طلب جديد بانتظار المعالجة.', 'order', false),
        (b.id, 'تقييم جديد', 'حصلت على تقييم جديد من عميل.', 'review', false),
        (b.id, 'مرحباً بك', 'شكراً لانضمامك إلى سعودي ديسكفري.', 'system', true);
    END LOOP;
  END IF;
END
$mkt$;
