import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { Business, Category, City, Offer, BlogPost } from '../types';
import { listBusinesses, getCategories, getCities, listOffers, listPosts } from '../api';
import { useLocale } from '../context';
import { localName, formatNumber } from '../utils';
import SEO from '../components/SEO';
import SearchBar from '../components/SearchBar';
import BusinessCard from '../components/BusinessCard';
import { SectionHeader, Loader } from '../components/ui';

function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Cmp = (Icons as unknown as Record<string, Icons.LucideIcon>)[name] || Icons.Store;
  return <Cmp className={className} />;
}

export default function Home() {
  const { locale, t } = useLocale();
  const [featured, setFeatured] = useState<Business[]>([]);
  const [sponsored, setSponsored] = useState<Business[]>([]);
  const [trending, setTrending] = useState<Business[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      listBusinesses({ featured: true, limit: 8 }),
      listBusinesses({ sponsored: true, limit: 4 }),
      listBusinesses({ sort: 'views', limit: 8 }),
      getCategories(), getCities(),
      listOffers(6), listPosts(3),
    ]).then(([f, s, tr, c, ci, o, p]) => {
      setFeatured(f); setSponsored(s); setTrending(tr);
      setCategories(c); setCities(ci); setOffers(o); setPosts(p);
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
          <p className="text-white/80 font-arabic text-lg mb-8 max-w-2xl mx-auto">
            مطاعم، مقاهي، فنادق، عيادات، متاجر وخدمات — كل ما تبحث عنه في مكان واحد.
          </p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
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
          <SectionHeader title={t('featured')} subtitle="أعمال مختارة بعناية" />
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
          <SectionHeader title={t('trending')} subtitle="الأكثر مشاهدة" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trending.slice(0, 4).map((b) => <BusinessCard key={b.id} business={b} />)}
          </div>
        </section>

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
                      <Icons.Eye className="w-3.5 h-3.5" />{formatNumber(p.views, locale)}
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
