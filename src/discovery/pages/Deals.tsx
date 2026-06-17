import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Ticket, Check, Copy } from 'lucide-react';
import { Offer, Coupon } from '../types';
import { listOffers, listCoupons, redeemCoupon } from '../api';
import { useLocale } from '../context';
import SEO from '../components/SEO';
import { Loader, SectionHeader } from '../components/ui';

export default function Deals() {
  const { t } = useLocale();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listOffers(), listCoupons()]).then(([o, c]) => { setOffers(o); setCoupons(c); }).finally(() => setLoading(false));
  }, []);

  const handleCopy = async (c: Coupon) => {
    await navigator.clipboard.writeText(c.code);
    setCopied(c.id);
    redeemCoupon(c.id, c.used_count).catch(() => {});
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
      <SEO title={t('nav_deals')} description="أحدث العروض والكوبونات من الأعمال في السعودية" />

      <section>
        <SectionHeader title={t('latest_deals')} subtitle={`${offers.length} عرض`} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {offers.map((o) => (
            <div key={o.id} className="rounded-2xl overflow-hidden bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10 hover:shadow-md transition-all">
              <div className="relative h-40">
                <img src={o.image_url} alt={o.title} loading="lazy" className="w-full h-full object-cover" />
                <span className="absolute top-3 start-3 px-2.5 py-1 rounded-lg bg-rose-500 text-white text-sm font-bold flex items-center gap-1"><Tag className="w-3.5 h-3.5" />-{o.discount_percent}%</span>
              </div>
              <div className="p-4">
                <h3 className="font-bold font-arabic">{o.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-arabic line-clamp-2 mt-1">{o.description}</p>
                {o.business && <Link to={`/business/${o.business.slug}`} className="text-teal-600 dark:text-teal-400 text-sm font-arabic font-semibold mt-3 inline-block hover:underline">{o.business.name} ←</Link>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title={t('coupons')} subtitle={`${coupons.length} كوبون`} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {coupons.map((c) => (
            <div key={c.id} className="rounded-2xl p-5 bg-white dark:bg-navy-800/60 border-2 border-dashed border-teal-400/40 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                <Ticket className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold font-arabic truncate">{c.title}</h3>
                {c.business && <Link to={`/business/${c.business.slug}`} className="text-xs text-slate-500 dark:text-slate-400 font-arabic hover:text-teal-500">{c.business.name}</Link>}
              </div>
              <button onClick={() => handleCopy(c)} className="px-3 py-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold text-sm flex items-center gap-1.5 hover:bg-teal-500/20 transition-colors flex-shrink-0">
                {copied === c.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span dir="ltr">{c.code}</span>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
