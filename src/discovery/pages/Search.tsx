import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Business, Category, City } from '../types';
import { listBusinesses, getCategories, getCities } from '../api';
import { useLocale } from '../context';
import { localName } from '../utils';
import SEO from '../components/SEO';
import SearchBar from '../components/SearchBar';
import BusinessCard from '../components/BusinessCard';
import { Loader, EmptyState } from '../components/ui';

export default function SearchPage() {
  const { locale, t } = useLocale();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const categorySlug = params.get('category') || '';
  const citySlug = params.get('city') || '';
  const sort = (params.get('sort') as 'rating' | 'views' | 'newest') || 'rating';

  const [results, setResults] = useState<Business[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getCategories().then(setCategories); getCities().then(setCities); }, []);

  useEffect(() => {
    setLoading(true);
    listBusinesses({ q: q || undefined, categorySlug: categorySlug || undefined, citySlug: citySlug || undefined, sort })
      .then(setResults).finally(() => setLoading(false));
  }, [q, categorySlug, citySlug, sort]);

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SEO title={`${t('search_btn')}: ${q || t('results')}`} />
      <div className="mb-6"><SearchBar /></div>

      <div className="flex flex-wrap gap-3 mb-6">
        <select value={categorySlug} onChange={(e) => update('category', e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-800 font-arabic text-sm">
          <option value="">كل الفئات</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{localName(c, locale)}</option>)}
        </select>
        <select value={citySlug} onChange={(e) => update('city', e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-800 font-arabic text-sm">
          <option value="">كل المدن</option>
          {cities.map((c) => <option key={c.id} value={c.slug}>{localName(c, locale)}</option>)}
        </select>
        <select value={sort} onChange={(e) => update('sort', e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-800 font-arabic text-sm">
          <option value="rating">الأعلى تقييماً</option>
          <option value="views">الأكثر مشاهدة</option>
          <option value="newest">الأحدث</option>
        </select>
      </div>

      {loading ? <Loader /> : results.length === 0 ? <EmptyState message={t('no_results')} /> : (
        <>
          <p className="text-slate-500 dark:text-slate-400 font-arabic mb-4">{results.length} {t('results')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {results.map((b) => <BusinessCard key={b.id} business={b} />)}
          </div>
        </>
      )}
    </div>
  );
}
