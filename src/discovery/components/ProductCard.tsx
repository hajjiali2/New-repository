import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { useLocale } from '../context';
import { formatPrice } from '../utils';

export default function ProductCard({ product, onBuy }: { product: Product; onBuy: (p: Product) => void }) {
  const { locale } = useLocale();
  const price = Number(product.sale_price ?? product.price);
  return (
    <div className="rounded-2xl overflow-hidden bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10 hover:shadow-md transition-all group flex flex-col">
      <div className="relative h-40 overflow-hidden">
        <img src={product.image_url} alt={product.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {product.sale_price && <span className="absolute top-2 start-2 px-2 py-0.5 rounded-md bg-rose-500 text-white text-xs font-bold">تخفيض</span>}
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="font-bold font-arabic text-sm line-clamp-1">{product.name}</h3>
        {product.business && <Link to={`/business/${product.business.slug}`} className="text-xs text-slate-400 font-arabic hover:text-teal-500">{product.business.name}</Link>}
        <p className="text-xs text-slate-500 dark:text-slate-400 font-arabic line-clamp-2 mt-1 flex-1">{product.description}</p>
        <div className="flex items-center justify-between mt-2 gap-2">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-teal-600 dark:text-teal-400 text-sm">{formatPrice(price, 'SAR', locale)}</span>
            {product.sale_price && <span className="text-xs text-slate-400 line-through">{formatPrice(Number(product.price), 'SAR', locale)}</span>}
          </div>
          <button onClick={() => onBuy(product)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-500 text-white text-xs font-bold font-arabic hover:bg-teal-600">
            <ShoppingCart className="w-3.5 h-3.5" />اشترِ
          </button>
        </div>
      </div>
    </div>
  );
}
