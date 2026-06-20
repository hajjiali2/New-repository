import { useEffect, useState } from 'react';
import { Product, Category } from '../types';
import { listProducts, ProductFilter, getCategories } from '../api';
import { useLocale } from '../context';
import { localName } from '../utils';
import SEO from '../components/SEO';
import ProductCard from '../components/ProductCard';
import OrderModal from '../components/OrderModal';
import { Loader, SectionHeader, EmptyState } from '../components/ui';

export default function Products() {
  const { locale, t } = useLocale();
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<ProductFilter['sort']>('newest');
  const [categoryId, setCategoryId] = useState('');
  const [buying, setBuying] = useState<Product | null>(null);

  useEffect(() => { getCategories().then(setCategories); }, []);

  useEffect(() => {
    setLoading(true);
    const handler = setTimeout(() => {
      listProducts({ q: q || undefined, sort, categoryId: categoryId || undefined }).then(setItems).finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(handler);
  }, [q, sort, categoryId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SEO title={t('products')} description="تصفّح منتجات التجار الموثوقين على سعودي ديسكفري واطلبها مباشرة." />
      <SectionHeader title={t('products')} subtitle="منتجات من تجار موثوقين في جميع أنحاء المملكة" />

      <div className="flex flex-wrap gap-3 mb-6">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن منتج..."
          className="flex-1 min-w-48 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-800 font-arabic text-sm focus:outline-none focus:border-teal-400" />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-800 font-arabic text-sm">
          <option value="">كل الفئات</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{localName(c, locale)}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as ProductFilter['sort'])}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-800 font-arabic text-sm">
          <option value="newest">الأحدث</option>
          <option value="price_asc">السعر: الأقل أولاً</option>
          <option value="price_desc">السعر: الأعلى أولاً</option>
        </select>
      </div>

      {loading ? <Loader /> : items.length === 0 ? <EmptyState message={t('no_results')} /> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map((p) => <ProductCard key={p.id} product={p} onBuy={setBuying} />)}
        </div>
      )}

      {buying && <OrderModal product={buying} onClose={() => setBuying(null)} />}
    </div>
  );
}
