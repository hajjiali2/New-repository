import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Business, Category } from '../types';
import { getCategoryBySlug, listBusinesses } from '../api';
import { useLocale } from '../context';
import { localName } from '../utils';
import SEO from '../components/SEO';
import BusinessCard from '../components/BusinessCard';
import CategoryIcon from '../components/CategoryIcon';
import { Loader, EmptyState } from '../components/ui';

export default function CategoryDetail() {
  const { slug = '' } = useParams();
  const { locale, t } = useLocale();
  const [category, setCategory] = useState<Category | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getCategoryBySlug(slug), listBusinesses({ categorySlug: slug })])
      .then(([c, b]) => { setCategory(c); setBusinesses(b); })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SEO title={category ? localName(category, locale) : t('nav_categories')} description={category?.description_ar} />
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center">
          <CategoryIcon name={category?.icon || 'Store'} className="w-7 h-7 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-arabic">{category ? localName(category, locale) : ''}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-arabic">{businesses.length} {t('results')}</p>
        </div>
      </div>
      {businesses.length === 0 ? <EmptyState message={t('no_results')} /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {businesses.map((b) => <BusinessCard key={b.id} business={b} />)}
        </div>
      )}
    </div>
  );
}
