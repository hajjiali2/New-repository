import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ShieldCheck, Truck, Store, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { getProductById, getBusinessProducts } from '../api';
import { useLocale } from '../context';
import { formatPrice } from '../utils';
import SEO from '../components/SEO';
import ProductCard from '../components/ProductCard';
import OrderModal from '../components/OrderModal';
import { Loader, EmptyState } from '../components/ui';

export default function ProductDetail() {
  const { id = '' } = useParams();
  const { locale, t } = useLocale();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<Product | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getProductById(id).then(async (p) => {
      if (!active) return;
      setProduct(p);
      if (p) {
        const rel = await getBusinessProducts(p.business_id);
        if (active) setRelated(rel.filter((r) => r.id !== p.id && r.status === 'active').slice(0, 4));
      }
      setLoading(false);
    });
    return () => { active = false; };
  }, [id]);

  if (loading) return <Loader />;
  if (!product) return <EmptyState message={t('no_results')} />;

  const price = Number(product.sale_price ?? product.price);
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Product',
    name: product.name, image: product.image_url, description: product.description,
    offers: { '@type': 'Offer', price, priceCurrency: 'SAR', availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' },
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SEO title={product.name} description={product.description} image={product.image_url} type="product" jsonLd={jsonLd} />

      <Link to="/products" className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 font-arabic text-sm mb-6 hover:underline">
        <ArrowRight className="w-4 h-4" />{t('products')}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10">
          <img src={product.image_url} alt={product.name} className="w-full h-80 object-cover" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-arabic mb-3">{product.name}</h1>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-extrabold text-teal-600 dark:text-teal-400">{formatPrice(price, 'SAR', locale)}</span>
            {product.sale_price && <span className="text-lg text-slate-400 line-through">{formatPrice(Number(product.price), 'SAR', locale)}</span>}
            <span className="text-xs text-slate-400 font-arabic">شامل ضريبة القيمة المضافة {Number(product.vat_percent)}%</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 font-arabic leading-relaxed mb-6">{product.description}</p>

          {product.business && (
            <Link to={`/business/${product.business.slug}`} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10 mb-6 hover:border-teal-400">
              <img src={product.business.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
              <div className="flex-1"><span className="text-xs text-slate-400 font-arabic flex items-center gap-1"><Store className="w-3.5 h-3.5" />التاجر</span><div className="font-bold font-arabic">{product.business.name}</div></div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          )}

          <button onClick={() => setBuying(product)} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold font-arabic inline-flex items-center justify-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5" />اشترِ الآن
          </button>

          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { icon: ShieldCheck, label: 'تاجر موثّق' },
              { icon: Truck, label: 'توصيل سريع' },
              { icon: ShoppingCart, label: 'دفع آمن' },
            ].map((x, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-navy-900 text-xs font-arabic text-slate-500 dark:text-slate-400">
                <x.icon className="w-5 h-5 mx-auto mb-1 text-teal-500" />{x.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold font-arabic mb-4">{t('similar')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {related.map((p) => <ProductCard key={p.id} product={p} onBuy={setBuying} />)}
          </div>
        </section>
      )}

      {buying && <OrderModal product={buying} onClose={() => setBuying(null)} />}
    </div>
  );
}
