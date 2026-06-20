import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../types';
import { getCategories } from '../api';
import { useLocale } from '../context';
import { localName } from '../utils';
import SEO from '../components/SEO';
import CategoryIcon from '../components/CategoryIcon';
import { Loader, SectionHeader } from '../components/ui';

export default function Categories() {
  const { locale, t } = useLocale();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getCategories().then(setCategories).finally(() => setLoading(false)); }, []);
  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SEO title={t('browse_categories')} description="تصفح جميع فئات الأعمال على سعودي ديسكفري" />
      <SectionHeader title={t('browse_categories')} subtitle={`${categories.length} فئة`} />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {categories.map((c) => (
          <Link key={c.id} to={`/category/${c.slug}`}
            className="group p-6 rounded-2xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10 hover:border-teal-400 hover:shadow-md transition-all">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <CategoryIcon name={c.icon} className="w-7 h-7 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="font-bold font-arabic text-lg">{localName(c, locale)}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-arabic mt-1">{c.description_ar}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
