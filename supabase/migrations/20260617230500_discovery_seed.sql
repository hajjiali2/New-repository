/*
  # Saudi Discovery — seed data
  Categories, cities, subscription plans, ad products, demo businesses (with
  media), reviews, offers, coupons, leads, blog content and sample analytics.
  Catalog rows use ON CONFLICT; demo content is inserted only on a fresh DB.
*/

-- Categories ----------------------------------------------------------------
INSERT INTO public.categories (slug, name_ar, name_en, icon, description_ar, sort_order) VALUES
  ('restaurants', 'مطاعم', 'Restaurants', 'UtensilsCrossed', 'أفضل المطاعم في المملكة', 1),
  ('cafes', 'مقاهي', 'Cafes', 'Coffee', 'مقاهي ومحامص مختصة', 2),
  ('hotels', 'فنادق', 'Hotels', 'Hotel', 'فنادق ومنتجعات', 3),
  ('clinics', 'عيادات', 'Clinics', 'Stethoscope', 'عيادات ومراكز طبية', 4),
  ('contractors', 'مقاولات', 'Contractors', 'HardHat', 'مقاولون وخدمات بناء', 5),
  ('ecommerce', 'متاجر إلكترونية', 'E-commerce', 'ShoppingCart', 'متاجر إلكترونية', 6),
  ('services', 'خدمات', 'Services', 'Wrench', 'خدمات متنوعة', 7),
  ('tourism', 'سياحة', 'Tourism', 'Plane', 'سياحة ومغامرات', 8),
  ('stores', 'متاجر', 'Stores', 'Store', 'متاجر ومحلات', 9),
  ('beauty', 'تجميل', 'Beauty', 'Sparkles', 'صالونات ومراكز تجميل', 10)
ON CONFLICT (slug) DO NOTHING;

-- Cities --------------------------------------------------------------------
INSERT INTO public.cities (slug, name_ar, name_en, region, latitude, longitude, image_url, sort_order) VALUES
  ('riyadh', 'الرياض', 'Riyadh', 'المنطقة الوسطى', 24.7136, 46.6753, 'https://picsum.photos/seed/riyadh/800/500', 1),
  ('jeddah', 'جدة', 'Jeddah', 'المنطقة الغربية', 21.4858, 39.1925, 'https://picsum.photos/seed/jeddah/800/500', 2),
  ('dammam', 'الدمام', 'Dammam', 'المنطقة الشرقية', 26.4207, 50.0888, 'https://picsum.photos/seed/dammam/800/500', 3),
  ('mecca', 'مكة المكرمة', 'Mecca', 'المنطقة الغربية', 21.3891, 39.8579, 'https://picsum.photos/seed/mecca/800/500', 4),
  ('medina', 'المدينة المنورة', 'Medina', 'المنطقة الغربية', 24.5247, 39.5692, 'https://picsum.photos/seed/medina/800/500', 5),
  ('khobar', 'الخبر', 'Khobar', 'المنطقة الشرقية', 26.2794, 50.2083, 'https://picsum.photos/seed/khobar/800/500', 6),
  ('abha', 'أبها', 'Abha', 'منطقة عسير', 18.2164, 42.5053, 'https://picsum.photos/seed/abha/800/500', 7),
  ('taif', 'الطائف', 'Taif', 'المنطقة الغربية', 21.2703, 40.4158, 'https://picsum.photos/seed/taif/800/500', 8)
ON CONFLICT (slug) DO NOTHING;

-- Subscription plans --------------------------------------------------------
INSERT INTO public.subscription_plans (key, name_ar, name_en, price_monthly, features, max_images, max_offers, max_coupons, featured_slots, sort_order, is_popular) VALUES
  ('free', 'مجاني', 'Free', 0, '["صفحة عمل أساسية","حتى 3 صور","عرض واحد","ظهور في البحث"]', 3, 1, 1, 0, 1, false),
  ('silver', 'فضي', 'Silver', 99, '["كل مميزات المجاني","حتى 10 صور","5 عروض","3 كوبونات","شارة موثّق"]', 10, 5, 3, 0, 2, false),
  ('gold', 'ذهبي', 'Gold', 249, '["كل مميزات الفضي","صور غير محدودة","عروض غير محدودة","ظهور مميّز في الفئة","تحليلات متقدمة"]', 100, 100, 50, 1, 3, true),
  ('diamond', 'ماسي', 'Diamond', 499, '["كل مميزات الذهبي","ظهور في الصفحة الرئيسية","راعٍ في المدينة","أولوية الدعم","حملة بريدية شهرية"]', 500, 500, 200, 3, 4, false),
  ('enterprise', 'مؤسسي', 'Enterprise', 1499, '["حلول مخصصة","عدة فروع","مدير حساب","API","تقارير مخصصة"]', 9999, 9999, 9999, 10, 5, false)
ON CONFLICT (key) DO NOTHING;

-- Advertising products ------------------------------------------------------
INSERT INTO public.ad_products (key, name_ar, name_en, description_ar, price, unit, placement, icon, sort_order) VALUES
  ('featured_listing', 'إدراج مميز', 'Featured Listing', 'ظهور عملك بشارة مميزة أعلى نتائج البحث', 199, 'per_month', 'featured_listing', 'Star', 1),
  ('homepage_placement', 'ظهور بالصفحة الرئيسية', 'Homepage Placement', 'بطاقة عملك في الصفحة الرئيسية', 499, 'per_month', 'homepage', 'Home', 2),
  ('category_placement', 'تصدّر الفئة', 'Category Placement', 'تصدّر صفحة فئتك', 299, 'per_month', 'category', 'LayoutGrid', 3),
  ('sponsored_business', 'عمل مموّل', 'Sponsored Business', 'وسم "مموّل" وأولوية ظهور', 399, 'per_month', 'sponsored', 'Megaphone', 4),
  ('banner_ads', 'لافتات إعلانية', 'Banner Ads', 'لافتة إعلانية عبر المنصة', 599, 'per_month', 'banner', 'Image', 5),
  ('city_featured', 'تميّز في المدينة', 'City Featured', 'تصدّر صفحة مدينتك', 249, 'per_month', 'city_featured', 'MapPin', 6),
  ('push_notifications', 'إشعارات', 'Push Notifications', 'حملة إشعارات للمستخدمين', 149, 'per_week', 'push', 'Bell', 7),
  ('email_campaign', 'حملة بريدية', 'Email Campaign', 'ظهور في النشرة البريدية', 349, 'per_week', 'email', 'Mail', 8)
ON CONFLICT (key) DO NOTHING;

-- Blog categories & author --------------------------------------------------
INSERT INTO public.blog_categories (slug, name_ar, name_en) VALUES
  ('guides', 'أدلة', 'Guides'),
  ('news', 'أخبار', 'News'),
  ('tips', 'نصائح', 'Tips')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.authors (name, bio, avatar_url)
SELECT 'فريق سعودي ديسكفري', 'فريق التحرير في منصة سعودي ديسكفري', 'https://ui-avatars.com/api/?name=SD&background=0d9488&color=fff&size=128'
WHERE NOT EXISTS (SELECT 1 FROM public.authors);

-- Demo content (only on fresh DB) -------------------------------------------
DO $seed$
DECLARE
  cat_rest uuid; cat_cafe uuid; cat_hotel uuid; cat_clinic uuid; cat_contract uuid;
  cat_ecom uuid; cat_serv uuid; cat_tour uuid; cat_store uuid; cat_beauty uuid;
  c_riyadh uuid; c_jeddah uuid; c_dammam uuid; c_mecca uuid; c_khobar uuid; c_abha uuid;
  author_id uuid; bc_guides uuid; bc_news uuid; bc_tips uuid;
  b record;
BEGIN
  IF (SELECT count(*) FROM public.businesses) > 0 THEN RETURN; END IF;

  SELECT id INTO cat_rest FROM public.categories WHERE slug='restaurants';
  SELECT id INTO cat_cafe FROM public.categories WHERE slug='cafes';
  SELECT id INTO cat_hotel FROM public.categories WHERE slug='hotels';
  SELECT id INTO cat_clinic FROM public.categories WHERE slug='clinics';
  SELECT id INTO cat_contract FROM public.categories WHERE slug='contractors';
  SELECT id INTO cat_ecom FROM public.categories WHERE slug='ecommerce';
  SELECT id INTO cat_serv FROM public.categories WHERE slug='services';
  SELECT id INTO cat_tour FROM public.categories WHERE slug='tourism';
  SELECT id INTO cat_store FROM public.categories WHERE slug='stores';
  SELECT id INTO cat_beauty FROM public.categories WHERE slug='beauty';

  SELECT id INTO c_riyadh FROM public.cities WHERE slug='riyadh';
  SELECT id INTO c_jeddah FROM public.cities WHERE slug='jeddah';
  SELECT id INTO c_dammam FROM public.cities WHERE slug='dammam';
  SELECT id INTO c_mecca FROM public.cities WHERE slug='mecca';
  SELECT id INTO c_khobar FROM public.cities WHERE slug='khobar';
  SELECT id INTO c_abha FROM public.cities WHERE slug='abha';

  INSERT INTO public.businesses
    (slug, name, description, category_id, city_id, logo_url, cover_url, website, whatsapp, phone, email, address, google_maps_url, instagram, tags, plan, status, is_featured, is_sponsored, is_verified, is_claimed, rating_avg, rating_count, views_count)
  VALUES
  ('najd-grill', 'مطعم نجد جريل', 'مطعم سعودي أصيل يقدم أشهى المأكولات الشعبية والمشويات على الفحم.', cat_rest, c_riyadh, 'https://ui-avatars.com/api/?name=NG&background=ea580c&color=fff&size=128', 'https://picsum.photos/seed/najd-grill/1200/600', 'https://najdgrill.example.com', '966500000001', '0112345001', 'info@najdgrill.example.com', 'حي العليا، الرياض', 'https://maps.google.com/?q=24.7136,46.6753', 'najdgrill', ARRAY['مشويات','كبسة','عائلي'], 'diamond', 'active', true, true, true, true, 4.8, 312, 15400),
  ('roast-house', 'محمصة روست هاوس', 'محمصة قهوة مختصة مع جلسات داخلية وخارجية وأجواء هادئة.', cat_cafe, c_jeddah, 'https://ui-avatars.com/api/?name=RH&background=7c3aed&color=fff&size=128', 'https://picsum.photos/seed/roast-house/1200/600', 'https://roasthouse.example.com', '966500000002', '0122345002', 'hi@roasthouse.example.com', 'حي الروضة، جدة', 'https://maps.google.com/?q=21.4858,39.1925', 'roasthouse', ARRAY['قهوة مختصة','حلويات'], 'gold', 'active', true, false, true, true, 4.6, 198, 8700),
  ('rosa-hotel', 'فندق روزا', 'فندق خمس نجوم بإطلالة بحرية ومرافق متكاملة وخدمة استثنائية.', cat_hotel, c_jeddah, 'https://ui-avatars.com/api/?name=RZ&background=0ea5e9&color=fff&size=128', 'https://picsum.photos/seed/rosa-hotel/1200/600', 'https://rosahotel.example.com', '966500000003', '0122345003', 'booking@rosahotel.example.com', 'الكورنيش، جدة', 'https://maps.google.com/?q=21.4858,39.1925', 'rosahotel', ARRAY['5 نجوم','إطلالة بحرية'], 'diamond', 'active', true, true, true, true, 4.9, 540, 23000),
  ('smile-dental', 'عيادة سمايل لطب الأسنان', 'عيادة أسنان متكاملة بأحدث التقنيات وفريق نخبة من الأطباء.', cat_clinic, c_riyadh, 'https://ui-avatars.com/api/?name=SD&background=10b981&color=fff&size=128', 'https://picsum.photos/seed/smile-dental/1200/600', 'https://smiledental.example.com', '966500000004', '0112345004', 'care@smiledental.example.com', 'حي الملقا، الرياض', 'https://maps.google.com/?q=24.7136,46.6753', 'smiledental', ARRAY['أسنان','تقويم','تجميل'], 'gold', 'active', false, false, true, true, 4.7, 156, 6200),
  ('al-bina-contracting', 'البناء للمقاولات', 'شركة مقاولات عامة متخصصة في البناء والتشطيبات الفاخرة.', cat_contract, c_dammam, 'https://ui-avatars.com/api/?name=BC&background=f59e0b&color=fff&size=128', 'https://picsum.photos/seed/al-bina/1200/600', 'https://albina.example.com', '966500000005', '0132345005', 'projects@albina.example.com', 'حي الفيصلية، الدمام', 'https://maps.google.com/?q=26.4207,50.0888', 'albina', ARRAY['بناء','تشطيب','فلل'], 'silver', 'active', false, false, true, true, 4.4, 89, 3100),
  ('souq-online', 'سوق أونلاين', 'متجر إلكتروني للإلكترونيات والأجهزة المنزلية بأفضل الأسعار.', cat_ecom, c_riyadh, 'https://ui-avatars.com/api/?name=SO&background=ef4444&color=fff&size=128', 'https://picsum.photos/seed/souq-online/1200/600', 'https://souqonline.example.com', '966500000006', '0112345006', 'support@souqonline.example.com', 'متجر إلكتروني', 'https://maps.google.com/?q=24.7136,46.6753', 'souqonline', ARRAY['إلكترونيات','توصيل سريع'], 'gold', 'active', true, false, true, true, 4.3, 421, 19800),
  ('clean-pro', 'كلين برو للخدمات', 'خدمات تنظيف منازل ومكاتب احترافية على مدار الأسبوع.', cat_serv, c_khobar, 'https://ui-avatars.com/api/?name=CP&background=06b6d4&color=fff&size=128', 'https://picsum.photos/seed/clean-pro/1200/600', 'https://cleanpro.example.com', '966500000007', '0132345007', 'book@cleanpro.example.com', 'حي العقربية، الخبر', 'https://maps.google.com/?q=26.2794,50.2083', 'cleanpro', ARRAY['تنظيف','تعقيم'], 'silver', 'active', false, true, true, true, 4.5, 112, 4500),
  ('asir-adventures', 'مغامرات عسير', 'رحلات سياحية ومغامرات جبلية في عسير مع مرشدين محترفين.', cat_tour, c_abha, 'https://ui-avatars.com/api/?name=AA&background=22c55e&color=fff&size=128', 'https://picsum.photos/seed/asir-adv/1200/600', 'https://asiradventures.example.com', '966500000008', '0172345008', 'trips@asiradventures.example.com', 'وسط أبها', 'https://maps.google.com/?q=18.2164,42.5053', 'asiradventures', ARRAY['مغامرات','تخييم','جبال'], 'gold', 'active', true, false, true, true, 4.8, 203, 9900),
  ('luxe-store', 'متجر لوكس', 'متجر أزياء وإكسسوارات راقية لأحدث صيحات الموضة.', cat_store, c_jeddah, 'https://ui-avatars.com/api/?name=LX&background=db2777&color=fff&size=128', 'https://picsum.photos/seed/luxe-store/1200/600', 'https://luxestore.example.com', '966500000009', '0122345009', 'hello@luxestore.example.com', 'مول الردف، جدة', 'https://maps.google.com/?q=21.4858,39.1925', 'luxestore', ARRAY['أزياء','إكسسوارات'], 'silver', 'active', false, false, true, true, 4.2, 76, 2800),
  ('glow-beauty', 'صالون جلو للتجميل', 'صالون تجميل نسائي متكامل بخدمات عناية وبشرة وشعر.', cat_beauty, c_riyadh, 'https://ui-avatars.com/api/?name=GB&background=e11d48&color=fff&size=128', 'https://picsum.photos/seed/glow-beauty/1200/600', 'https://glowbeauty.example.com', '966500000010', '0112345010', 'book@glowbeauty.example.com', 'حي النخيل، الرياض', 'https://maps.google.com/?q=24.7136,46.6753', 'glowbeauty', ARRAY['تجميل','عناية','شعر'], 'gold', 'active', true, false, true, true, 4.6, 134, 5600),
  ('pearl-cafe', 'مقهى اللؤلؤة', 'مقهى عائلي بإطلالة مميزة وقائمة مشروبات وحلويات متنوعة.', cat_cafe, c_dammam, 'https://ui-avatars.com/api/?name=PC&background=8b5cf6&color=fff&size=128', 'https://picsum.photos/seed/pearl-cafe/1200/600', 'https://pearlcafe.example.com', '966500000011', '0132345011', 'info@pearlcafe.example.com', 'الكورنيش، الدمام', 'https://maps.google.com/?q=26.4207,50.0888', 'pearlcafe', ARRAY['قهوة','عائلي'], 'free', 'active', false, false, false, false, 4.1, 58, 1900),
  ('grand-feast', 'مطعم الوليمة الكبرى', 'بوفيه عالمي مفتوح بأطباق من مختلف المطابخ العالمية.', cat_rest, c_mecca, 'https://ui-avatars.com/api/?name=GF&background=f97316&color=fff&size=128', 'https://picsum.photos/seed/grand-feast/1200/600', 'https://grandfeast.example.com', '966500000012', '0122345012', 'info@grandfeast.example.com', 'العزيزية، مكة', 'https://maps.google.com/?q=21.3891,39.8579', 'grandfeast', ARRAY['بوفيه','عالمي'], 'silver', 'active', false, false, true, true, 4.4, 167, 7300);

  -- Gallery images (2 per business)
  INSERT INTO public.business_images (business_id, url, sort_order)
  SELECT bz.id, 'https://picsum.photos/seed/' || bz.slug || '-g' || g || '/800/600', g
  FROM public.businesses bz CROSS JOIN generate_series(1,3) AS g;

  -- Reviews
  FOR b IN SELECT id, slug FROM public.businesses LOOP
    INSERT INTO public.reviews (business_id, reviewer_name, rating, title, body, status, business_response) VALUES
      (b.id, 'أحمد العتيبي', 5, 'تجربة ممتازة', 'خدمة رائعة وجودة عالية، أنصح الجميع بالتعامل معهم.', 'approved', 'شكراً لك على تقييمك الرائع!'),
      (b.id, 'سارة القحطاني', 4, 'جيد جداً', 'المكان نظيف والموظفون متعاونون، تجربة مريحة.', 'approved', ''),
      (b.id, 'محمد الدوسري', 5, 'الأفضل', 'من أفضل ما جربت، سأعود مرة أخرى بالتأكيد.', 'approved', '');
  END LOOP;

  -- Offers / deals
  INSERT INTO public.offers (business_id, title, description, image_url, discount_percent, original_price, sale_price, ends_at)
  SELECT bz.id,
    'خصم ' || (20 + (random()*40)::int) || '% لفترة محدودة',
    'عرض حصري لعملاء سعودي ديسكفري على ' || bz.name,
    'https://picsum.photos/seed/' || bz.slug || '-offer/600/400',
    (20 + (random()*40)::int),
    200, 120,
    now() + interval '30 days'
  FROM public.businesses bz
  WHERE bz.is_featured OR bz.plan IN ('gold','diamond');

  -- Coupons
  INSERT INTO public.coupons (business_id, code, title, description, discount_type, discount_value, usage_limit, expires_at)
  SELECT bz.id, upper(replace(bz.slug,'-','')) || '20', 'كوبون خصم 20%', 'استخدم الكود للحصول على خصم فوري', 'percent', 20, 100, now() + interval '60 days'
  FROM public.businesses bz WHERE bz.plan IN ('silver','gold','diamond');

  -- Sample leads for the first two businesses
  INSERT INTO public.leads (business_id, name, phone, email, message, source, status)
  SELECT bz.id, 'عميل محتمل ' || n, '96655500' || lpad(n::text,4,'0'), 'lead' || n || '@example.com',
    'مهتم بخدماتكم، أرجو التواصل.', (ARRAY['profile','offer','search','ad'])[1 + (n % 4)], (ARRAY['new','contacted','converted'])[1 + (n % 3)]
  FROM public.businesses bz CROSS JOIN generate_series(1,4) AS n
  WHERE bz.slug IN ('najd-grill','rosa-hotel','smile-dental');

  -- Subscriptions + invoices for paid businesses
  INSERT INTO public.business_subscriptions (business_id, plan_key, status, current_period_end)
  SELECT id, plan, 'active', now() + interval '30 days' FROM public.businesses WHERE plan <> 'free';

  INSERT INTO public.invoices (business_id, amount, status, description, kind)
  SELECT bz.id, p.price_monthly, 'paid', 'اشتراك خطة ' || p.name_ar, 'subscription'
  FROM public.businesses bz JOIN public.subscription_plans p ON p.key = bz.plan
  WHERE bz.plan <> 'free';

  -- Some ad campaigns (revenue)
  INSERT INTO public.ad_campaigns (business_id, ad_product_id, placement, status, budget, impressions, clicks, ends_at)
  SELECT bz.id, ap.id, ap.placement, 'active', ap.price, (random()*5000)::int, (random()*300)::int, now() + interval '30 days'
  FROM public.businesses bz
  JOIN public.ad_products ap ON ap.key = (CASE WHEN bz.is_sponsored THEN 'sponsored_business' ELSE 'featured_listing' END)
  WHERE bz.is_featured OR bz.is_sponsored;

  INSERT INTO public.invoices (business_id, amount, status, description, kind)
  SELECT bz.id, ap.price, 'paid', 'حملة إعلانية: ' || ap.name_ar, 'ad'
  FROM public.businesses bz
  JOIN public.ad_products ap ON ap.key = (CASE WHEN bz.is_sponsored THEN 'sponsored_business' ELSE 'featured_listing' END)
  WHERE bz.is_featured OR bz.is_sponsored;

  -- Blog posts
  SELECT id INTO author_id FROM public.authors LIMIT 1;
  SELECT id INTO bc_guides FROM public.blog_categories WHERE slug='guides';
  SELECT id INTO bc_news FROM public.blog_categories WHERE slug='news';
  SELECT id INTO bc_tips FROM public.blog_categories WHERE slug='tips';

  INSERT INTO public.blog_posts (slug, title, excerpt, content, cover_url, author_id, category_id, tags, seo_title, seo_description) VALUES
  ('best-restaurants-riyadh', 'أفضل 10 مطاعم في الرياض 2026', 'دليلك الشامل لأشهى المطاعم في العاصمة الرياض.', 'تتميز الرياض بتنوع مطاعمها الكبير... في هذا الدليل نستعرض أفضل عشرة مطاعم تستحق الزيارة بناءً على تقييمات العملاء على منصة سعودي ديسكفري.', 'https://picsum.photos/seed/blog-rest/1200/600', author_id, bc_guides, ARRAY['مطاعم','الرياض','دليل'], 'أفضل المطاعم في الرياض 2026', 'دليل شامل لأفضل المطاعم في الرياض.'),
  ('grow-your-business-online', 'كيف تنمّي عملك عبر الإنترنت', 'خطوات عملية لزيادة ظهور نشاطك التجاري ووصوله للعملاء.', 'الحضور الرقمي أصبح ضرورة لكل نشاط تجاري... نشرح هنا كيف تستفيد من الإدراج المميز والإعلانات الممولة لزيادة عملائك.', 'https://picsum.photos/seed/blog-grow/1200/600', author_id, bc_tips, ARRAY['تسويق','نمو'], 'نمّ عملك عبر الإنترنت', 'نصائح لتنمية عملك رقمياً.'),
  ('discover-asir-tourism', 'اكتشف سياحة عسير الساحرة', 'وجهات لا تفوّت في منطقة عسير الجبلية.', 'تعد عسير من أجمل وجهات السياحة الجبلية في المملكة... إليك أبرز الأنشطة والمعالم.', 'https://picsum.photos/seed/blog-asir/1200/600', author_id, bc_news, ARRAY['سياحة','عسير'], 'سياحة عسير', 'اكتشف أجمل وجهات عسير.');

  -- Sample analytics events
  INSERT INTO public.analytics_events (type, business_id, city_id, category_id, created_at)
  SELECT (ARRAY['view','view','view','click','lead'])[1 + (n % 5)], bz.id, bz.city_id, bz.category_id, now() - make_interval(days => (n % 14))
  FROM public.businesses bz CROSS JOIN generate_series(1,20) AS n;
END
$seed$;
