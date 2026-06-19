import { useEffect, useState, FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import {
  BadgeCheck, MapPin, Phone, Mail, Globe, MessageCircle, Star, Megaphone,
  Instagram, Twitter, Facebook, Tag, Ticket, Check, Copy, Send,
} from 'lucide-react';
import { Business, BusinessImage, Review, Offer, Coupon, Product } from '../types';
import {
  getBusinessBySlug, getBusinessImages, getBusinessReviews, getBusinessOffers,
  getBusinessCoupons, getSimilarBusinesses, submitReview, submitLead, incrementBusinessViews, redeemCoupon,
  getBusinessProducts,
} from '../api';
import { useLocale } from '../context';
import { localName } from '../utils';
import SEO from '../components/SEO';
import BusinessCard from '../components/BusinessCard';
import ProductCard from '../components/ProductCard';
import OrderModal from '../components/OrderModal';
import { Rating, Badge, Loader, EmptyState } from '../components/ui';

export default function BusinessProfile() {
  const { slug = '' } = useParams();
  const { locale, t } = useLocale();
  const [biz, setBiz] = useState<Business | null>(null);
  const [images, setImages] = useState<BusinessImage[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [similar, setSimilar] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [buying, setBuying] = useState<Product | null>(null);

  // forms
  const [lead, setLead] = useState({ name: '', phone: '', email: '', message: '' });
  const [leadSent, setLeadSent] = useState(false);
  const [quote, setQuote] = useState(false);
  const [rev, setRev] = useState({ reviewer_name: '', rating: 5, title: '', body: '' });
  const [revSent, setRevSent] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getBusinessBySlug(slug).then(async (b) => {
      if (!active) return;
      setBiz(b);
      if (!b) { setLoading(false); return; }
      incrementBusinessViews(b.id, b.views_count).catch(() => {});
      const [imgs, revs, ofs, cps, prods, sim] = await Promise.all([
        getBusinessImages(b.id), getBusinessReviews(b.id), getBusinessOffers(b.id),
        getBusinessCoupons(b.id), getBusinessProducts(b.id), getSimilarBusinesses(b),
      ]);
      if (!active) return;
      setImages(imgs as BusinessImage[]); setReviews(revs); setOffers(ofs); setCoupons(cps);
      setProducts((prods as Product[]).filter((p) => p.status === 'active')); setSimilar(sim);
      setLoading(false);
    });
    return () => { active = false; };
  }, [slug]);

  const sendLead = async (e: FormEvent) => {
    e.preventDefault();
    if (!biz) return;
    await submitLead({ business_id: biz.id, ...lead, source: quote ? 'quote' : 'profile' });
    setLeadSent(true);
    setLead({ name: '', phone: '', email: '', message: '' });
  };

  const sendReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!biz) return;
    await submitReview({ business_id: biz.id, ...rev });
    setRevSent(true);
    setReviews((r) => [{ id: 'tmp' + Date.now(), business_id: biz.id, user_id: null, photos: [], business_response: '', status: 'approved', created_at: new Date().toISOString(), ...rev } as Review, ...r]);
    setRev({ reviewer_name: '', rating: 5, title: '', body: '' });
  };

  const copyCode = async (c: Coupon) => {
    await navigator.clipboard.writeText(c.code);
    setCopied(c.id);
    redeemCoupon(c.id, c.used_count).catch(() => {});
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) return <Loader />;
  if (!biz) return <EmptyState message={t('no_results')} />;

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'LocalBusiness', name: biz.name,
    description: biz.description, image: biz.cover_url, telephone: biz.phone,
    address: biz.address, aggregateRating: biz.rating_count > 0 ? { '@type': 'AggregateRating', ratingValue: biz.rating_avg, reviewCount: biz.rating_count } : undefined,
  };

  const contacts = [
    biz.whatsapp && { icon: MessageCircle, label: 'واتساب', href: `https://wa.me/${biz.whatsapp}`, color: 'text-emerald-500' },
    biz.phone && { icon: Phone, label: biz.phone, href: `tel:${biz.phone}`, color: 'text-teal-500' },
    biz.email && { icon: Mail, label: biz.email, href: `mailto:${biz.email}`, color: 'text-blue-500' },
    biz.website && { icon: Globe, label: 'الموقع', href: biz.website, color: 'text-indigo-500' },
    biz.google_maps_url && { icon: MapPin, label: 'الموقع على الخريطة', href: biz.google_maps_url, color: 'text-rose-500' },
  ].filter(Boolean) as { icon: typeof Phone; label: string; href: string; color: string }[];

  const socials = [
    biz.instagram && { icon: Instagram, href: `https://instagram.com/${biz.instagram}` },
    biz.twitter && { icon: Twitter, href: `https://twitter.com/${biz.twitter}` },
    biz.facebook && { icon: Facebook, href: `https://facebook.com/${biz.facebook}` },
  ].filter(Boolean) as { icon: typeof Instagram; href: string }[];

  return (
    <>
      <SEO title={biz.name} description={biz.description} image={biz.cover_url} type="business.business" jsonLd={jsonLd} />

      {/* Cover */}
      <div className="relative h-56 sm:h-72">
        <img src={biz.cover_url} alt={biz.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="relative -mt-16 flex flex-col sm:flex-row items-start sm:items-end gap-4 mb-8">
          <img src={biz.logo_url} alt={biz.name} className="w-28 h-28 rounded-2xl border-4 border-white dark:border-navy-950 object-cover shadow-lg" />
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold font-arabic text-slate-900 dark:text-white">{biz.name}</h1>
              {biz.is_verified && <BadgeCheck className="w-6 h-6 text-teal-500" />}
              {biz.is_sponsored && <Badge className="bg-fuchsia-500 text-white"><Megaphone className="w-3 h-3" />{t('sponsored')}</Badge>}
              {biz.is_featured && <Badge className="bg-amber-500 text-white"><Star className="w-3 h-3" />{t('featured')}</Badge>}
            </div>
            <div className="flex items-center gap-3 mt-2 flex-wrap text-sm text-slate-500 dark:text-slate-400 font-arabic">
              <Rating value={Number(biz.rating_avg)} count={biz.rating_count} />
              {biz.city && <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" />{localName(biz.city, locale)}</span>}
              {biz.category && <span className="px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400">{localName(biz.category, locale)}</span>}
            </div>
            {/* Trust signals */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {biz.response_rate > 0 && <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-arabic font-semibold">{t('response_rate')}: {biz.response_rate}%</span>}
              {biz.completion_score > 0 && <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-arabic font-semibold">{t('completion_score')}: {biz.completion_score}%</span>}
              {biz.is_verified && <span className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-arabic font-semibold inline-flex items-center gap-1"><BadgeCheck className="w-3.5 h-3.5" />{t('verified_merchant')}</span>}
            </div>
            {/* Quick actions */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {biz.whatsapp && (
                <a href={`https://wa.me/${biz.whatsapp}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-bold font-arabic hover:bg-emerald-600">
                  <MessageCircle className="w-4 h-4" />{t('whatsapp')}
                </a>
              )}
              <button onClick={() => { setQuote(true); document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-sm font-bold font-arabic">
                <Send className="w-4 h-4" />{t('request_quote')}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
          {/* Main */}
          <div className="lg:col-span-2 space-y-10">
            <section>
              <h2 className="text-xl font-bold font-arabic mb-3">نبذة</h2>
              <p className="text-slate-600 dark:text-slate-300 font-arabic leading-relaxed">{biz.description}</p>
              {biz.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {biz.tags.map((tag) => <span key={tag} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-sm font-arabic">{tag}</span>)}
                </div>
              )}
            </section>

            {images.length > 0 && (
              <section>
                <h2 className="text-xl font-bold font-arabic mb-3">معرض الصور</h2>
                <div className="grid grid-cols-3 gap-3">
                  {images.map((img) => <img key={img.id} src={img.url} alt="" loading="lazy" className="w-full h-32 object-cover rounded-xl" />)}
                </div>
              </section>
            )}

            {products.length > 0 && (
              <section>
                <h2 className="text-xl font-bold font-arabic mb-3">{t('products')}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {products.map((p) => <ProductCard key={p.id} product={p} onBuy={setBuying} />)}
                </div>
              </section>
            )}

            {offers.length > 0 && (
              <section>
                <h2 className="text-xl font-bold font-arabic mb-3 flex items-center gap-2"><Tag className="w-5 h-5 text-rose-500" />{t('offers')}</h2>
                <div className="space-y-3">
                  {offers.map((o) => (
                    <div key={o.id} className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10">
                      <span className="px-2.5 py-1 rounded-lg bg-rose-500 text-white text-sm font-bold">-{o.discount_percent}%</span>
                      <div><h3 className="font-bold font-arabic">{o.title}</h3><p className="text-sm text-slate-500 dark:text-slate-400 font-arabic">{o.description}</p></div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {coupons.length > 0 && (
              <section>
                <h2 className="text-xl font-bold font-arabic mb-3 flex items-center gap-2"><Ticket className="w-5 h-5 text-teal-500" />{t('coupons')}</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {coupons.map((c) => (
                    <div key={c.id} className="flex items-center justify-between gap-3 p-4 rounded-xl border-2 border-dashed border-teal-400/40">
                      <div><h3 className="font-bold font-arabic text-sm">{c.title}</h3></div>
                      <button onClick={() => copyCode(c)} className="px-3 py-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold text-sm flex items-center gap-1.5">
                        {copied === c.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}<span dir="ltr">{c.code}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            <section>
              <h2 className="text-xl font-bold font-arabic mb-4">{t('reviews')} ({reviews.length})</h2>
              <form onSubmit={sendReview} className="mb-6 p-4 rounded-xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10 space-y-3">
                {revSent && <p className="text-emerald-500 text-sm font-arabic">شكراً لتقييمك!</p>}
                <div className="flex items-center gap-3">
                  <input value={rev.reviewer_name} onChange={(e) => setRev({ ...rev, reviewer_name: e.target.value })} placeholder="اسمك" required
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 text-sm font-arabic" />
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button type="button" key={i} onClick={() => setRev({ ...rev, rating: i })}>
                        <Star className={`w-6 h-6 ${i <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea value={rev.body} onChange={(e) => setRev({ ...rev, body: e.target.value })} placeholder="اكتب تقييمك..." required rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 text-sm font-arabic" />
                <button className="px-4 py-2 rounded-lg bg-teal-500 text-white text-sm font-bold font-arabic">{t('send')}</button>
              </form>
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="p-4 rounded-xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="font-bold font-arabic">{r.reviewer_name}</span>
                      <Rating value={r.rating} />
                    </div>
                    {r.title && <p className="font-semibold font-arabic mt-2">{r.title}</p>}
                    <p className="text-slate-600 dark:text-slate-300 font-arabic mt-1">{r.body}</p>
                    {r.business_response && (
                      <div className="mt-3 ps-3 border-s-2 border-teal-400 text-sm">
                        <span className="font-bold font-arabic text-teal-600 dark:text-teal-400">رد النشاط:</span>
                        <p className="text-slate-500 dark:text-slate-400 font-arabic">{r.business_response}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10 p-5">
              <h3 className="font-bold font-arabic mb-3">معلومات التواصل</h3>
              <div className="space-y-2">
                {contacts.map((c, i) => (
                  <a key={i} href={c.href} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 text-sm font-arabic">
                    <c.icon className={`w-4 h-4 ${c.color}`} /><span dir="auto">{c.label}</span>
                  </a>
                ))}
              </div>
              {socials.length > 0 && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-white/10">
                  {socials.map((s, i) => (
                    <a key={i} href={s.href} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center hover:bg-teal-500/10">
                      <s.icon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            <form id="lead-form" onSubmit={sendLead} className="rounded-2xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10 p-5 space-y-3">
              <h3 className="font-bold font-arabic">{quote ? t('request_quote') : t('contact_business')}</h3>
              {leadSent && <p className="text-emerald-500 text-sm font-arabic">تم الإرسال! سيتواصل معك النشاط قريباً.</p>}
              <input value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} placeholder="الاسم" required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 text-sm font-arabic" />
              <input value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} placeholder="الجوال" required dir="ltr"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 text-sm" />
              <input value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} placeholder="البريد الإلكتروني" type="email" dir="ltr"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 text-sm" />
              <textarea value={lead.message} onChange={(e) => setLead({ ...lead, message: e.target.value })} placeholder="رسالتك" rows={3}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 text-sm font-arabic" />
              <button className="w-full py-2.5 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold font-arabic flex items-center justify-center gap-2"><Send className="w-4 h-4" />{t('send')}</button>
            </form>
          </div>
        </div>

        {similar.length > 0 && (
          <section className="pb-12">
            <h2 className="text-xl font-bold font-arabic mb-4">{t('similar')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {similar.map((b) => <BusinessCard key={b.id} business={b} />)}
            </div>
          </section>
        )}
      </div>

      {buying && <OrderModal product={buying} onClose={() => setBuying(null)} />}
    </>
  );
}
