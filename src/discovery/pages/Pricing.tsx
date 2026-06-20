import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Star } from 'lucide-react';
import { SubscriptionPlan, AdProduct } from '../types';
import { getPlans, getAdProducts } from '../api';
import { useLocale } from '../context';
import { localName, formatPrice } from '../utils';
import SEO from '../components/SEO';
import CategoryIcon from '../components/CategoryIcon';
import { Loader, SectionHeader } from '../components/ui';

export default function Pricing() {
  const { locale, t } = useLocale();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [ads, setAds] = useState<AdProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPlans(), getAdProducts()]).then(([p, a]) => { setPlans(p); setAds(a); }).finally(() => setLoading(false));
  }, []);
  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      <SEO title={t('nav_pricing')} description="خطط الاشتراك والمنتجات الإعلانية" />

      <section>
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold font-arabic">خطط الاشتراك</h1>
          <p className="text-slate-500 dark:text-slate-400 font-arabic mt-2">اختر الخطة المناسبة لنمو نشاطك التجاري</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {plans.map((p) => (
            <div key={p.id} className={`relative rounded-2xl p-6 border-2 transition-all flex flex-col ${p.is_popular ? 'border-teal-500 bg-teal-500/5 shadow-lg scale-105' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-navy-800/60'}`}>
              {p.is_popular && <span className="absolute -top-3 start-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-teal-500 text-white text-xs font-bold font-arabic flex items-center gap-1"><Star className="w-3 h-3" />{t('most_popular')}</span>}
              <h3 className="font-bold font-arabic text-xl">{localName(p, locale)}</h3>
              <div className="my-3">
                <span className="text-3xl font-extrabold">{p.price_monthly === 0 ? 'مجاناً' : formatPrice(p.price_monthly, p.currency, locale)}</span>
                {p.price_monthly > 0 && <span className="text-slate-400 font-arabic text-sm">{t('per_month')}</span>}
              </div>
              <ul className="space-y-2 flex-1 mb-5">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm font-arabic text-slate-600 dark:text-slate-300">
                    <Check className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>
              <Link to="/dashboard" className={`block text-center py-2.5 rounded-xl font-bold font-arabic text-sm transition-all ${p.is_popular ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:from-teal-600 hover:to-emerald-700' : 'bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20'}`}>
                {p.price_monthly === 0 ? t('add_business') : t('subscribe')}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="المنتجات الإعلانية" subtitle="عزّز ظهور نشاطك التجاري" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ads.map((a) => (
            <div key={a.id} className="rounded-2xl p-5 bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10 hover:border-teal-400 hover:shadow-md transition-all flex flex-col">
              <div className="w-11 h-11 rounded-xl bg-teal-500/10 flex items-center justify-center mb-3">
                <CategoryIcon name={a.icon} className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="font-bold font-arabic">{localName(a, locale)}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-arabic mt-1 flex-1">{a.description_ar}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-extrabold text-teal-600 dark:text-teal-400">{formatPrice(a.price, a.currency, locale)}<span className="text-xs text-slate-400 font-arabic">{a.unit === 'per_week' ? t('per_week') : t('per_month')}</span></span>
                <Link to="/dashboard" className="px-3 py-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-bold font-arabic hover:bg-teal-500/20">{t('buy')}</Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
