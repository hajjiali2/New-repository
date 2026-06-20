import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Rocket, ShieldCheck, Headphones, MapPin as MapPinIcon, Quote, Star as StarIcon, Eye } from 'lucide-react';
import { Business, Category, City, Offer, BlogPost, Product } from '../types';
import { listBusinesses, getCategories, getCities, listOffers, listPosts, listFeaturedProducts, publicStats, PublicStats } from '../api';
import { useLocale } from '../context';
import { localName, formatNumber, formatPrice } from '../utils';
import SEO from '../components/SEO';
import SearchBar from '../components/SearchBar';
import BusinessCard from '../components/BusinessCard';
import CategoryIcon from '../components/CategoryIcon';
import { SectionHeader, Loader } from '../components/ui';

export default function Home() {
  const { locale, t } = useLocale();
  const [featured, setFeatured] = useState<Business[]>([]);
  const [sponsored, setSponsored] = useState<Business[]>([]);
  const [trending, setTrending] = useState<Business[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      listBusinesses({ featured: true, limit: 8 }),
      listBusinesses({ sponsored: true, limit: 4 }),
      listBusinesses({ sort: 'views', limit: 8 }),
      getCategories(), getCities(),
      listOffers(6), listPosts(3), listFeaturedProducts(8), publicStats(),
    ]).then(([f, s, tr, c, ci, o, p, pr, st]) => {
      setFeatured(f); setSponsored(s); setTrending(tr);
      setCategories(c); setCities(ci); setOffers(o); setPosts(p);
      setProducts(pr as Product[]); setStats(st as PublicStats);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="جارٍ التحميل..." />;

  return (
    <>
      <SEO title={t('tagline')} description={t('footer_about')} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-700 text-white">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold font-arabic leading-tight mb-4">{t('tagline')}</h1>
          <p className="text-white/80 font-arabic text-lg mb-8 max-w-2xl mx-auto">{t('home_hero_sub')}</p>
          <SearchBar large />
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {categories.slice(0, 6).map((c) => (
              <Link key={c.id} to={`/category/${c.slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-sm font-arabic transition-colors">
                <CategoryIcon name={c.icon} className="w-4 h-4" />{localName(c, locale)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics band */}
      <section className="bg-white dark:bg-navy-900 border-b border-slate-200 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { v: stats?.merchants, label: t('stat_merchant') },
            { v: stats?.products, label: t('stat_product') },
            { v: stats?.cities, label: t('stat_city') },
            { v: stats?.reviews, label: t('stat_review') },
          ].map((x, i) => (
            <div key={i}>
              <div className="text-3xl font-extrabold text-teal-600 dark:text-teal-400">{x.v != null ? formatNumber(x.v, locale) : '—'}+</div>
              <div className="text-slate-500 dark:text-slate-400 font-arabic text-sm mt-1">{x.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Merchant CTA */}
        <section className="rounded-3xl bg-gradient-to-r from-teal-600 to-emerald-700 text-white p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-arabic mb-2">{t('home_cta_title')}</h2>
            <p className="text-white/80 font-arabic">{t('home_cta_sub')}</p>
          </div>
          <Link to="/merchants" className="px-8 py-4 rounded-xl bg-white text-teal-700 font-bold font-arabic text-lg whitespace-nowrap inline-flex items-center gap-2"><Rocket className="w-5 h-5" />{t('join_now')}</Link>
        </section>

        {/* Categories */}
        <section>
          <SectionHeader title={t('browse_categories')} href="/categories" viewAllLabel={t('view_all')} />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((c) => (
              <Link key={c.id} to={`/category/${c.slug}`}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10 hover:border-teal-400 hover:shadow-md transition-all text-center">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CategoryIcon name={c.icon} className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <span className="font-arabic font-semibold text-sm">{localName(c, locale)}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured */}
        <section>
          <SectionHeader title={t('featured')} subtitle={t('featured_sub')} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((b) => <BusinessCard key={b.id} business={b} />)}
          </div>
        </section>

        {/* Sponsored */}
        {sponsored.length > 0 && (
          <section>
            <SectionHeader title={t('sponsored')} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {sponsored.map((b) => <BusinessCard key={b.id} business={b} />)}
            </div>
          </section>
        )}

        {/* Trending */}
        <section>
          <SectionHeader title={t('trending')} subtitle={t('trending_sub')} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trending.slice(0, 4).map((b) => <BusinessCard key={b.id} business={b} />)}
          </div>
        </section>

        {/* Featured Products */}
        {products.length > 0 && (
          <section>
            <SectionHeader title={t('featured_products')} subtitle={t('featured_products_sub')} />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((p) => (
                <div key={p.id} className="rounded-2xl overflow-hidden bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10 hover:shadow-md transition-all group">
                  <div className="relative h-40 overflow-hidden">
                    <img src={p.image_url} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {p.sale_price && <span className="absolute top-2 start-2 px-2 py-0.5 rounded-md bg-rose-500 text-white text-xs font-bold">تخفيض</span>}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold font-arabic text-sm line-clamp-1">{p.name}</h3>
                    {p.business && <Link to={`/business/${p.business.slug}`} className="text-xs text-slate-400 font-arabic hover:text-teal-500">{p.business.name}</Link>}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-teal-600 dark:text-teal-400 text-sm">{formatPrice(Number(p.sale_price ?? p.price), 'SAR', locale)}</span>
                      {p.sale_price && <span className="text-xs text-slate-400 line-through">{formatPrice(Number(p.price), 'SAR', locale)}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Cities */}
        <section>
          <SectionHeader title={t('explore_cities')} href="/cities" viewAllLabel={t('view_all')} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {cities.map((c) => (
              <Link key={c.id} to={`/city/${c.slug}`} className="relative h-32 rounded-2xl overflow-hidden group">
                <img src={c.image_url} alt={c.name_ar} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <span className="absolute bottom-3 start-3 text-white font-bold font-arabic text-lg">{localName(c, locale)}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Deals */}
        {offers.length > 0 && (
          <section>
            <SectionHeader title={t('latest_deals')} href="/deals" viewAllLabel={t('view_all')} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {offers.map((o) => (
                <div key={o.id} className="rounded-2xl overflow-hidden bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10 flex">
                  <img src={o.image_url} alt={o.title} loading="lazy" className="w-28 h-full object-cover" />
                  <div className="p-4 flex-1">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-500 text-xs font-bold mb-2">-{o.discount_percent}%</span>
                    <h3 className="font-bold font-arabic text-sm line-clamp-1">{o.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-arabic line-clamp-2 mt-1">{o.description}</p>
                    {o.business && <Link to={`/business/${o.business.slug}`} className="text-teal-600 dark:text-teal-400 text-xs font-arabic font-semibold mt-2 inline-block hover:underline">{o.business.name} ←</Link>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Why choose us */}
        <section>
          <SectionHeader title={t('why_choose_us')} subtitle={t('why_choose_us_sub')} />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Rocket, title: t('why_faster'), desc: t('why_faster_d') },
              { icon: ShieldCheck, title: t('why_cost'), desc: t('why_cost_d') },
              { icon: Headphones, title: t('why_support'), desc: t('why_support_d') },
              { icon: MapPinIcon, title: t('why_expertise'), desc: t('why_expertise_d') },
            ].map((w, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10 text-center">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mx-auto mb-3"><w.icon className="w-5 h-5 text-white" /></div>
                <h3 className="font-bold font-arabic text-sm">{w.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-arabic text-xs mt-1">{w.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section>
          <SectionHeader title={t('testimonials')} subtitle={t('testimonials_sub')} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { name: 'خالد العمري', role: 'صاحب مطعم', text: 'زادت طلباتنا بشكل ملحوظ خلال أول شهرين على المنصة. الدعم ممتاز.' },
              { name: 'نورة السالم', role: 'متجر أزياء', text: 'سهولة إضافة المنتجات وأدوات التسويق ساعدتني أصل لعملاء جدد بسرعة.' },
              { name: 'عبدالله الشهري', role: 'خدمات مقاولات', text: 'شارة التوثيق أعطت عملي مصداقية كبيرة وزادت طلبات عروض الأسعار.' },
            ].map((tst, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10">
                <Quote className="w-7 h-7 text-teal-500/40 mb-3" />
                <p className="text-slate-600 dark:text-slate-300 font-arabic leading-relaxed">{tst.text}</p>
                <div className="flex items-center gap-1 mt-3 text-amber-400">{[1, 2, 3, 4, 5].map((s) => <StarIcon key={s} className="w-4 h-4 fill-amber-400" />)}</div>
                <div className="mt-3 font-bold font-arabic">{tst.name}</div>
                <div className="text-xs text-slate-400 font-arabic">{tst.role}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Blog */}
        {posts.length > 0 && (
          <section>
            <SectionHeader title={t('from_blog')} href="/blog" viewAllLabel={t('view_all')} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {posts.map((p) => (
                <Link key={p.id} to={`/blog/${p.slug}`} className="rounded-2xl overflow-hidden bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10 hover:shadow-md transition-all group">
                  <img src={p.cover_url} alt={p.title} loading="lazy" className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="p-4">
                    <h3 className="font-bold font-arabic line-clamp-2">{p.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-arabic line-clamp-2 mt-1">{p.excerpt}</p>
                    <span className="text-xs text-slate-400 font-arabic mt-2 inline-flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />{formatNumber(p.views, locale)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
