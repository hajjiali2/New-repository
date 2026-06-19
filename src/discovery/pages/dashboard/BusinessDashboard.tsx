import { useEffect, useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Eye, MousePointerClick, Users, Tag, Ticket, Star, Megaphone, Crown,
  Trash2, BarChart3, Store, Check, Package, ShoppingCart, Bell, LifeBuoy,
  Sparkles, BadgeCheck, ShieldAlert, DollarSign, TrendingUp,
} from 'lucide-react';
import {
  Business, Offer, Coupon, Lead, Review, AdCampaign, AdProduct, SubscriptionPlan,
  Product, Order, SupportTicket, AppNotification, Category, City,
} from '../../types';
import {
  myBusinesses, createBusiness, ownerOffers, createOffer, deleteOffer,
  ownerCoupons, createCoupon, deleteCoupon, ownerLeads, updateLeadStatus,
  ownerReviews, respondToReview, ownerCampaigns, buyAd, getAdProducts,
  getPlans, subscribeBusiness, businessAnalytics, getCategories, getCities,
  getBusinessProducts, createProduct, deleteProduct, businessOrders, updateOrderStatus,
  businessTickets, createTicket, businessNotifications, markNotificationRead,
} from '../../api';
import { generateProductDescription } from '../../ai';
import { useLocale } from '../../context';
import { localName, formatPrice, formatNumber, PLAN_BADGE } from '../../utils';
import { getErrorMessage } from '../../../lib/errors';
import SEO from '../../components/SEO';
import { Loader, EmptyState } from '../../components/ui';
import CategoryIcon from '../../components/CategoryIcon';

type Tab = 'overview' | 'products' | 'orders' | 'customers' | 'revenue' | 'offers' | 'coupons' | 'leads' | 'reviews' | 'ads' | 'marketing' | 'notifications' | 'support' | 'plan';

export default function BusinessDashboard() {
  const { t } = useLocale();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selected, setSelected] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    const list = await myBusinesses();
    setBusinesses(list);
    setSelected((prev) => list.find((b) => b.id === prev?.id) || list[0] || null);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SEO title={t('nav_dashboard')} />
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold font-arabic">{t('nav_dashboard')}</h1>
        {businesses.length > 0 && (
          <div className="flex items-center gap-2">
            <Link to="/affiliate" className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-white/10 text-sm font-arabic font-semibold">{t('nav_affiliate')}</Link>
            <select value={selected?.id} onChange={(e) => setSelected(businesses.find((b) => b.id === e.target.value) || null)}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-800 font-arabic text-sm">
              {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {error && <div className="mb-4 p-3 rounded-lg bg-rose-500/10 text-rose-500 text-sm font-arabic">{error}</div>}

      {businesses.length === 0 ? (
        <CreateBusiness onCreated={load} setError={setError} />
      ) : selected ? (
        <>
          <div className="flex items-center gap-3 mb-4 p-4 rounded-2xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10">
            <img src={selected.logo_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-bold font-arabic">{selected.name}</h2>
                <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${PLAN_BADGE[selected.plan]}`}>{selected.plan}</span>
                {selected.is_verified
                  ? <span className="px-2 py-0.5 rounded-md text-xs font-arabic bg-teal-500/15 text-teal-500 inline-flex items-center gap-1"><BadgeCheck className="w-3 h-3" />تاجر موثّق</span>
                  : <span className="px-2 py-0.5 rounded-md text-xs font-arabic bg-amber-500/15 text-amber-500">غير موثّق</span>}
              </div>
              <Link to={`/business/${selected.slug}`} className="text-xs text-teal-600 dark:text-teal-400 font-arabic hover:underline">عرض الصفحة العامة ←</Link>
            </div>
          </div>

          <VerificationBanner business={selected} />

          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {([
              ['overview', BarChart3, 'نظرة عامة'], ['products', Package, t('products')], ['orders', ShoppingCart, t('orders')],
              ['customers', Users, t('customers')], ['revenue', DollarSign, t('revenue')], ['offers', Tag, t('offers')], ['coupons', Ticket, t('coupons')],
              ['leads', Users, 'العملاء المحتملون'], ['reviews', Star, t('reviews')], ['ads', Megaphone, 'الإعلانات'],
              ['marketing', TrendingUp, 'تحليلات التسويق'], ['notifications', Bell, t('notifications')], ['support', LifeBuoy, t('support')], ['plan', Crown, 'الاشتراك'],
            ] as [Tab, typeof Tag, string][]).map(([key, Icon, label]) => (
              <button key={key} onClick={() => setTab(key)}
                className={`px-4 py-2 rounded-lg text-sm font-arabic font-semibold whitespace-nowrap inline-flex items-center gap-1.5 transition-colors ${tab === key ? 'bg-teal-500 text-white' : 'bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10'}`}>
                <Icon className="w-4 h-4" />{label}
              </button>
            ))}
          </div>

          {tab === 'overview' && <Overview business={selected} />}
          {tab === 'products' && <Products business={selected} />}
          {tab === 'orders' && <Orders business={selected} />}
          {tab === 'customers' && <Customers business={selected} />}
          {tab === 'revenue' && <RevenueTab business={selected} />}
          {tab === 'offers' && <Offers business={selected} />}
          {tab === 'coupons' && <Coupons business={selected} />}
          {tab === 'leads' && <Leads business={selected} />}
          {tab === 'reviews' && <Reviews business={selected} />}
          {tab === 'ads' && <Ads business={selected} />}
          {tab === 'marketing' && <Marketing business={selected} />}
          {tab === 'notifications' && <Notifications business={selected} />}
          {tab === 'support' && <Support business={selected} />}
          {tab === 'plan' && <PlanTab business={selected} onChange={load} />}
        </>
      ) : null}
    </div>
  );
}

function Card({ icon: Icon, label, value, color }: { icon: typeof Eye; label: string; value: string | number; color: string }) {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}><Icon className="w-5 h-5" /></div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-slate-500 dark:text-slate-400 font-arabic">{label}</div>
    </div>
  );
}

function Overview({ business }: { business: Business }) {
  const { locale } = useLocale();
  const [stats, setStats] = useState({ views: 0, clicks: 0, leads: 0 });
  useEffect(() => { businessAnalytics(business.id).then(setStats); }, [business.id]);
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card icon={Eye} label="المشاهدات" value={formatNumber(business.views_count, locale)} color="bg-teal-500/15 text-teal-500" />
      <Card icon={MousePointerClick} label="النقرات" value={formatNumber(stats.clicks, locale)} color="bg-blue-500/15 text-blue-500" />
      <Card icon={Users} label="العملاء المحتملون" value={formatNumber(stats.leads, locale)} color="bg-amber-500/15 text-amber-500" />
      <Card icon={Star} label="التقييم" value={Number(business.rating_avg).toFixed(1)} color="bg-rose-500/15 text-rose-500" />
    </div>
  );
}

function CreateBusiness({ onCreated, setError }: { onCreated: () => void; setError: (s: string) => void }) {
  const { locale, t } = useLocale();
  const [form, setForm] = useState({ name: '', description: '', category_id: '', city_id: '', phone: '', whatsapp: '' });
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [saving, setSaving] = useState(false);
  useEffect(() => { getCategories().then(setCategories); getCities().then(setCities); }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await createBusiness({
        name: form.name, description: form.description,
        category_id: form.category_id || null, city_id: form.city_id || null,
        phone: form.phone, whatsapp: form.whatsapp,
        logo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name)}&background=0d9488&color=fff&size=128`,
        cover_url: `https://picsum.photos/seed/${encodeURIComponent(form.name)}/1200/600`,
      });
      onCreated();
    } catch (err) { setError(getErrorMessage(err)); } finally { setSaving(false); }
  };

  return (
    <div className="max-w-xl mx-auto text-center py-8">
      <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center mx-auto mb-4"><Store className="w-7 h-7 text-teal-500" /></div>
      <h2 className="text-2xl font-bold font-arabic mb-2">{t('add_business')}</h2>
      <p className="text-slate-500 dark:text-slate-400 font-arabic mb-6">أنشئ صفحة نشاطك التجاري وابدأ باستقبال العملاء.</p>
      <form onSubmit={submit} className="space-y-3 text-start">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="اسم النشاط" required
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-800 font-arabic text-sm" />
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="وصف النشاط" rows={3}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-800 font-arabic text-sm" />
        <div className="grid grid-cols-2 gap-3">
          <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} required
            className="px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-800 font-arabic text-sm">
            <option value="">الفئة</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{localName(c, locale)}</option>)}
          </select>
          <select value={form.city_id} onChange={(e) => setForm({ ...form, city_id: e.target.value })} required
            className="px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-800 font-arabic text-sm">
            <option value="">المدينة</option>
            {cities.map((c) => <option key={c.id} value={c.id}>{localName(c, locale)}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="الهاتف" dir="ltr"
            className="px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-800 text-sm" />
          <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="واتساب" dir="ltr"
            className="px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-800 text-sm" />
        </div>
        <button disabled={saving} className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold font-arabic disabled:opacity-50">
          {saving ? '...' : t('add_business')}
        </button>
      </form>
    </div>
  );
}

function Offers({ business }: { business: Business }) {
  const [items, setItems] = useState<Offer[]>([]);
  const [title, setTitle] = useState('');
  const [discount, setDiscount] = useState(20);
  const load = () => ownerOffers(business.id).then(setItems);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [business.id]);
  const add = async (e: FormEvent) => {
    e.preventDefault();
    await createOffer({ business_id: business.id, title, discount_percent: discount, is_active: true, image_url: `https://picsum.photos/seed/${Date.now()}/600/400`, description: 'عرض خاص' });
    setTitle(''); load();
  };
  const remove = async (id: string) => { await deleteOffer(id); load(); };
  return (
    <div>
      <form onSubmit={add} className="flex flex-wrap gap-2 mb-5">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان العرض" required className="flex-1 min-w-48 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-800 font-arabic text-sm" />
        <input type="number" value={discount} onChange={(e) => setDiscount(+e.target.value)} placeholder="%" className="w-24 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-800 text-sm" />
        <button className="px-4 py-2.5 rounded-xl bg-teal-500 text-white font-bold font-arabic text-sm inline-flex items-center gap-1.5"><Plus className="w-4 h-4" />إضافة</button>
      </form>
      {items.length === 0 ? <EmptyState message="لا توجد عروض" /> : (
        <div className="space-y-2">
          {items.map((o) => (
            <div key={o.id} className="flex items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-3"><span className="px-2 py-1 rounded-lg bg-rose-500 text-white text-sm font-bold">-{o.discount_percent}%</span><span className="font-arabic font-semibold">{o.title}</span></div>
              <button onClick={() => remove(o.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Coupons({ business }: { business: Business }) {
  const [items, setItems] = useState<Coupon[]>([]);
  const [code, setCode] = useState('');
  const [value, setValue] = useState(20);
  const load = () => ownerCoupons(business.id).then(setItems);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [business.id]);
  const add = async (e: FormEvent) => {
    e.preventDefault();
    await createCoupon({ business_id: business.id, code: code.toUpperCase(), title: `خصم ${value}%`, discount_type: 'percent', discount_value: value, is_active: true });
    setCode(''); load();
  };
  const remove = async (id: string) => { await deleteCoupon(id); load(); };
  return (
    <div>
      <form onSubmit={add} className="flex flex-wrap gap-2 mb-5">
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="رمز الكوبون" required dir="ltr" className="flex-1 min-w-48 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-800 text-sm" />
        <input type="number" value={value} onChange={(e) => setValue(+e.target.value)} className="w-24 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-800 text-sm" />
        <button className="px-4 py-2.5 rounded-xl bg-teal-500 text-white font-bold font-arabic text-sm inline-flex items-center gap-1.5"><Plus className="w-4 h-4" />إضافة</button>
      </form>
      {items.length === 0 ? <EmptyState message="لا توجد كوبونات" /> : (
        <div className="space-y-2">
          {items.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-3"><span className="px-2 py-1 rounded-lg bg-teal-500/15 text-teal-500 font-bold text-sm" dir="ltr">{c.code}</span><span className="font-arabic">{c.title}</span><span className="text-xs text-slate-400 font-arabic">استُخدم {c.used_count}</span></div>
              <button onClick={() => remove(c.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Leads({ business }: { business: Business }) {
  const [items, setItems] = useState<Lead[]>([]);
  const load = () => ownerLeads(business.id).then(setItems);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [business.id]);
  const setStatus = async (id: string, status: string) => { await updateLeadStatus(id, status); load(); };
  const statusColor: Record<string, string> = { new: 'bg-blue-500/15 text-blue-500', contacted: 'bg-amber-500/15 text-amber-500', converted: 'bg-emerald-500/15 text-emerald-500', lost: 'bg-slate-500/15 text-slate-400' };
  if (items.length === 0) return <EmptyState message="لا يوجد عملاء محتملون بعد" />;
  return (
    <div className="overflow-x-auto rounded-2xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10">
      <table className="w-full text-start text-sm">
        <thead><tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 font-arabic">
          <th className="px-4 py-3 text-start">الاسم</th><th className="px-4 py-3 text-start">الجوال</th><th className="px-4 py-3 text-start">المصدر</th><th className="px-4 py-3 text-start">الحالة</th>
        </tr></thead>
        <tbody>
          {items.map((l) => (
            <tr key={l.id} className="border-b border-slate-100 dark:border-white/5">
              <td className="px-4 py-3 font-arabic">{l.name}</td>
              <td className="px-4 py-3" dir="ltr">{l.phone}</td>
              <td className="px-4 py-3 font-arabic">{l.source}</td>
              <td className="px-4 py-3">
                <select value={l.status} onChange={(e) => setStatus(l.id, e.target.value)} className={`px-2 py-1 rounded-md text-xs font-arabic ${statusColor[l.status]}`}>
                  <option value="new">جديد</option><option value="contacted">تم التواصل</option><option value="converted">تحوّل</option><option value="lost">مفقود</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Reviews({ business }: { business: Business }) {
  const [items, setItems] = useState<Review[]>([]);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const load = () => ownerReviews(business.id).then(setItems);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [business.id]);
  const respond = async (id: string) => { await respondToReview(id, draft[id] || ''); load(); };
  if (items.length === 0) return <EmptyState message="لا توجد تقييمات" />;
  return (
    <div className="space-y-3">
      {items.map((r) => (
        <div key={r.id} className="p-4 rounded-xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between">
            <span className="font-bold font-arabic">{r.reviewer_name}</span>
            <span className="inline-flex items-center gap-1 text-amber-400">{r.rating} <Star className="w-4 h-4 fill-amber-400" /></span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 font-arabic mt-1">{r.body}</p>
          {r.business_response ? (
            <p className="mt-2 text-sm text-teal-600 dark:text-teal-400 font-arabic">ردك: {r.business_response}</p>
          ) : (
            <div className="flex gap-2 mt-3">
              <input value={draft[r.id] || ''} onChange={(e) => setDraft({ ...draft, [r.id]: e.target.value })} placeholder="اكتب رداً..." className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 text-sm font-arabic" />
              <button onClick={() => respond(r.id)} className="px-3 py-2 rounded-lg bg-teal-500 text-white text-sm font-bold font-arabic">رد</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Ads({ business }: { business: Business }) {
  const { locale } = useLocale();
  const [products, setProducts] = useState<AdProduct[]>([]);
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [msg, setMsg] = useState('');
  const load = () => { getAdProducts().then(setProducts); ownerCampaigns(business.id).then(setCampaigns); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [business.id]);
  const buy = async (p: AdProduct) => { await buyAd(business.id, p); setMsg(`تم شراء: ${p.name_ar}`); load(); setTimeout(() => setMsg(''), 2500); };
  return (
    <div className="space-y-6">
      {msg && <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500 text-sm font-arabic">{msg}</div>}
      {campaigns.length > 0 && (
        <div>
          <h3 className="font-bold font-arabic mb-3">حملاتي ({campaigns.length})</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {campaigns.map((c) => (
              <div key={c.id} className="p-4 rounded-xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10">
                <div className="flex items-center justify-between"><span className="font-arabic font-semibold">{c.ad_product?.name_ar || c.placement}</span><span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500 text-xs font-arabic">{c.status}</span></div>
                <div className="flex gap-4 mt-2 text-xs text-slate-400 font-arabic"><span>{formatNumber(c.impressions, locale)} ظهور</span><span>{formatNumber(c.clicks, locale)} نقرة</span></div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div>
        <h3 className="font-bold font-arabic mb-3">اشترِ إعلاناً</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {products.map((p) => (
            <div key={p.id} className="p-4 rounded-xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10 flex flex-col">
              <CategoryIcon name={p.icon} className="w-6 h-6 text-teal-500 mb-2" />
              <span className="font-arabic font-semibold text-sm">{localName(p, locale)}</span>
              <span className="text-teal-600 dark:text-teal-400 font-bold text-sm mt-1">{formatPrice(p.price, p.currency, locale)}</span>
              <button onClick={() => buy(p)} className="mt-3 py-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-bold font-arabic hover:bg-teal-500/20">اشترِ</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Marketing({ business }: { business: Business }) {
  const { locale } = useLocale();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  useEffect(() => {
    Promise.all([ownerOffers(business.id), ownerCoupons(business.id), ownerCampaigns(business.id)])
      .then(([o, c, ca]) => { setOffers(o); setCoupons(c); setCampaigns(ca); });
  }, [business.id]);

  const activeOffers = offers.filter((o) => o.is_active).length;
  const redemptions = coupons.reduce((s, c) => s + (c.used_count || 0), 0);
  const impressions = campaigns.reduce((s, c) => s + (c.impressions || 0), 0);
  const clicks = campaigns.reduce((s, c) => s + (c.clicks || 0), 0);
  const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card icon={Tag} label="عروض نشطة" value={formatNumber(activeOffers, locale)} color="bg-rose-500/15 text-rose-500" />
        <Card icon={Ticket} label="مرات استخدام الكوبونات" value={formatNumber(redemptions, locale)} color="bg-teal-500/15 text-teal-500" />
        <Card icon={Eye} label="ظهور الإعلانات" value={formatNumber(impressions, locale)} color="bg-blue-500/15 text-blue-500" />
        <Card icon={MousePointerClick} label={`نقرات (CTR ${ctr}%)`} value={formatNumber(clicks, locale)} color="bg-amber-500/15 text-amber-500" />
      </div>

      <div className="p-5 rounded-2xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10">
        <h3 className="font-bold font-arabic mb-4">أداء الحملات الإعلانية</h3>
        {campaigns.length === 0 ? <EmptyState message="لا توجد حملات إعلانية بعد" /> : (
          <div className="space-y-3">
            {campaigns.map((c) => {
              const rate = c.impressions > 0 ? ((c.clicks / c.impressions) * 100).toFixed(1) : '0.0';
              return (
                <div key={c.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-navy-900">
                  <span className="font-arabic text-sm font-semibold">{c.ad_product?.name_ar || c.placement}</span>
                  <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400 font-arabic">
                    <span>{formatNumber(c.impressions, locale)} ظهور</span>
                    <span>{formatNumber(c.clicks, locale)} نقرة</span>
                    <span className="text-teal-600 dark:text-teal-400 font-bold">CTR {rate}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-5 rounded-2xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10">
        <h3 className="font-bold font-arabic mb-4">أداء الكوبونات</h3>
        {coupons.length === 0 ? <EmptyState message="لا توجد كوبونات بعد" /> : (
          <div className="space-y-2">
            {coupons.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-navy-900">
                <span className="font-bold text-sm" dir="ltr">{c.code}</span>
                <span className="font-arabic text-sm text-slate-500 dark:text-slate-400">{c.title}</span>
                <span className="font-arabic text-xs text-teal-600 dark:text-teal-400">استُخدم {formatNumber(c.used_count, locale)} مرة</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function VerificationBanner({ business }: { business: Business }) {
  if (business.verification_status === 'approved') return null;
  const map: Record<string, { text: string; cls: string }> = {
    pending: { text: 'وثّق متجرك: ارفع السجل التجاري للحصول على شارة "تاجر موثّق" وزيادة ثقة العملاء.', cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
    under_review: { text: 'مستنداتك قيد المراجعة. سيتم تفعيل شارة التوثيق خلال 24 ساعة.', cls: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
    rejected: { text: 'تم رفض المستندات. يرجى تحديث السجل التجاري وإعادة الإرسال.', cls: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
  };
  const v = map[business.verification_status] || map.pending;
  return <div className={`mb-4 p-3 rounded-xl border text-sm font-arabic flex items-center gap-2 ${v.cls}`}><ShieldAlert className="w-4 h-4 flex-shrink-0" />{v.text}</div>;
}

function Products({ business }: { business: Business }) {
  const { locale } = useLocale();
  const [items, setItems] = useState<Product[]>([]);
  const [form, setForm] = useState({ name: '', description: '', price: 0, keywords: '' });
  const [genLoading, setGenLoading] = useState(false);
  const load = () => getBusinessProducts(business.id).then(setItems);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [business.id]);

  const genDesc = async () => {
    if (!form.name) return;
    setGenLoading(true);
    try {
      const cat = business.category ? localName(business.category, locale) : 'منتج';
      const desc = await generateProductDescription(form.name, cat, form.keywords);
      setForm((f) => ({ ...f, description: desc }));
    } finally { setGenLoading(false); }
  };

  const add = async (e: FormEvent) => {
    e.preventDefault();
    await createProduct({
      business_id: business.id, name: form.name, description: form.description, price: form.price,
      vat_percent: 15, status: 'active', stock: 10,
      image_url: `https://picsum.photos/seed/${encodeURIComponent(form.name)}-${Date.now()}/600/600`,
    });
    setForm({ name: '', description: '', price: 0, keywords: '' });
    load();
  };
  const remove = async (id: string) => { await deleteProduct(id); load(); };

  return (
    <div className="space-y-6">
      <form onSubmit={add} className="p-5 rounded-2xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10 space-y-3">
        <h3 className="font-bold font-arabic">إضافة منتج</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="اسم المنتج" className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 font-arabic text-sm" />
          <input type="number" required value={form.price || ''} onChange={(e) => setForm({ ...form, price: +e.target.value })} placeholder="السعر (ر.س)" className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 text-sm" />
        </div>
        <input value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} placeholder="كلمات مفتاحية للوصف (اختياري)" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 font-arabic text-sm" />
        <div className="relative">
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="وصف المنتج" rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 font-arabic text-sm" />
          <button type="button" onClick={genDesc} disabled={genLoading || !form.name}
            className="absolute bottom-2 end-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white text-xs font-bold font-arabic disabled:opacity-50">
            <Sparkles className="w-3.5 h-3.5" />{genLoading ? 'جارٍ التوليد...' : 'وصف بالذكاء الاصطناعي'}
          </button>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-teal-500 text-white font-bold font-arabic text-sm inline-flex items-center gap-1.5"><Plus className="w-4 h-4" />إضافة المنتج</button>
      </form>

      {items.length === 0 ? <EmptyState message="لا توجد منتجات بعد" /> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((p) => (
            <div key={p.id} className="rounded-2xl overflow-hidden bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10">
              <img src={p.image_url} alt={p.name} className="w-full h-32 object-cover" />
              <div className="p-3">
                <h4 className="font-bold font-arabic text-sm line-clamp-1">{p.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-arabic line-clamp-2 mt-1">{p.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-teal-600 dark:text-teal-400 text-sm">{formatPrice(Number(p.price), 'SAR', locale)}</span>
                  <button onClick={() => remove(p.id)} className="text-slate-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Orders({ business }: { business: Business }) {
  const { locale } = useLocale();
  const [items, setItems] = useState<Order[]>([]);
  const load = () => businessOrders(business.id).then(setItems);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [business.id]);
  const setStatus = async (id: string, status: string) => { await updateOrderStatus(id, status); load(); };
  const color: Record<string, string> = { new: 'bg-blue-500/15 text-blue-500', processing: 'bg-amber-500/15 text-amber-500', completed: 'bg-emerald-500/15 text-emerald-500', cancelled: 'bg-slate-500/15 text-slate-400' };
  if (items.length === 0) return <EmptyState message="لا توجد طلبات بعد" />;
  return (
    <div className="overflow-x-auto rounded-2xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 font-arabic">
          <th className="px-4 py-3 text-start">العميل</th><th className="px-4 py-3 text-start">المنتج</th><th className="px-4 py-3 text-start">الإجمالي</th><th className="px-4 py-3 text-start">الحالة</th>
        </tr></thead>
        <tbody>
          {items.map((o) => (
            <tr key={o.id} className="border-b border-slate-100 dark:border-white/5">
              <td className="px-4 py-3 font-arabic">{o.customer_name}</td>
              <td className="px-4 py-3 font-arabic">{o.product?.name || '—'}</td>
              <td className="px-4 py-3">{formatPrice(Number(o.total), 'SAR', locale)}</td>
              <td className="px-4 py-3">
                <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className={`px-2 py-1 rounded-md text-xs font-arabic ${color[o.status]}`}>
                  <option value="new">جديد</option><option value="processing">قيد المعالجة</option><option value="completed">مكتمل</option><option value="cancelled">ملغى</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Customers({ business }: { business: Business }) {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => { businessOrders(business.id).then(setOrders); }, [business.id]);
  const byCustomer = new Map<string, { name: string; phone: string; orders: number; total: number }>();
  orders.forEach((o) => {
    const key = o.customer_phone || o.customer_name;
    const cur = byCustomer.get(key) || { name: o.customer_name, phone: o.customer_phone, orders: 0, total: 0 };
    cur.orders += 1; cur.total += Number(o.total);
    byCustomer.set(key, cur);
  });
  const customers = Array.from(byCustomer.values()).sort((a, b) => b.total - a.total);
  if (customers.length === 0) return <EmptyState message="لا يوجد عملاء بعد" />;
  return (
    <div className="overflow-x-auto rounded-2xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 font-arabic">
          <th className="px-4 py-3 text-start">العميل</th><th className="px-4 py-3 text-start">الجوال</th><th className="px-4 py-3 text-start">الطلبات</th><th className="px-4 py-3 text-start">إجمالي الإنفاق</th>
        </tr></thead>
        <tbody>{customers.map((c, i) => (
          <tr key={i} className="border-b border-slate-100 dark:border-white/5">
            <td className="px-4 py-3 font-arabic">{c.name}</td><td className="px-4 py-3" dir="ltr">{c.phone}</td><td className="px-4 py-3">{c.orders}</td><td className="px-4 py-3 font-bold">{Math.round(c.total)} ر.س</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function RevenueTab({ business }: { business: Business }) {
  const { locale } = useLocale();
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => { businessOrders(business.id).then(setOrders); }, [business.id]);
  const completed = orders.filter((o) => o.status === 'completed');
  const total = completed.reduce((s, o) => s + Number(o.total), 0);
  // group by day-of-month bucket (last 6 weeks-ish): simple 7-bucket bar chart
  const buckets = Array.from({ length: 7 }, () => 0);
  completed.forEach((o) => {
    const d = Math.min(6, Math.floor((Date.now() - new Date(o.created_at).getTime()) / (5 * 864e5)));
    buckets[6 - d] += Number(o.total);
  });
  const max = Math.max(...buckets, 1);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <span className="font-arabic text-sm opacity-80">إجمالي الإيرادات (مكتملة)</span>
          <div className="text-3xl font-extrabold">{formatPrice(total, 'SAR', locale)}</div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10">
          <span className="font-arabic text-sm text-slate-400">عدد الطلبات</span>
          <div className="text-3xl font-extrabold">{formatNumber(orders.length, locale)}</div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10">
          <span className="font-arabic text-sm text-slate-400">متوسط قيمة الطلب</span>
          <div className="text-3xl font-extrabold">{completed.length ? Math.round(total / completed.length) : 0} ر.س</div>
        </div>
      </div>
      <div className="p-5 rounded-2xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10">
        <h3 className="font-bold font-arabic mb-4">منحنى الإيرادات</h3>
        <div className="flex items-end gap-2 h-40">
          {buckets.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
              <div className="w-full rounded-t-lg bg-gradient-to-t from-teal-500 to-emerald-400" style={{ height: `${(v / max) * 100}%`, minHeight: 4 }} />
              <span className="text-[10px] text-slate-400">{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Notifications({ business }: { business: Business }) {
  const [items, setItems] = useState<AppNotification[]>([]);
  const load = () => businessNotifications(business.id).then(setItems);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [business.id]);
  const read = async (id: string) => { await markNotificationRead(id); load(); };
  if (items.length === 0) return <EmptyState message="لا توجد إشعارات" />;
  return (
    <div className="space-y-2">
      {items.map((n) => (
        <div key={n.id} className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${n.is_read ? 'bg-white dark:bg-navy-800/60 border-slate-200 dark:border-white/10' : 'bg-teal-500/5 border-teal-500/20'}`}>
          <div className="flex items-start gap-3">
            <Bell className={`w-5 h-5 mt-0.5 ${n.is_read ? 'text-slate-400' : 'text-teal-500'}`} />
            <div><h4 className="font-bold font-arabic text-sm">{n.title}</h4><p className="text-sm text-slate-500 dark:text-slate-400 font-arabic">{n.body}</p></div>
          </div>
          {!n.is_read && <button onClick={() => read(n.id)} className="text-xs text-teal-600 dark:text-teal-400 font-arabic whitespace-nowrap">تعليم كمقروء</button>}
        </div>
      ))}
    </div>
  );
}

function Support({ business }: { business: Business }) {
  const [items, setItems] = useState<SupportTicket[]>([]);
  const [form, setForm] = useState({ subject: '', message: '', priority: 'normal' });
  const load = () => businessTickets(business.id).then(setItems);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [business.id]);
  const add = async (e: FormEvent) => {
    e.preventDefault();
    await createTicket({ business_id: business.id, subject: form.subject, message: form.message, priority: form.priority as 'low' | 'normal' | 'high', status: 'open' });
    setForm({ subject: '', message: '', priority: 'normal' }); load();
  };
  const color: Record<string, string> = { open: 'bg-blue-500/15 text-blue-500', pending: 'bg-amber-500/15 text-amber-500', closed: 'bg-slate-500/15 text-slate-400' };
  return (
    <div className="space-y-6">
      <form onSubmit={add} className="p-5 rounded-2xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10 space-y-3">
        <h3 className="font-bold font-arabic">فتح تذكرة دعم</h3>
        <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="الموضوع" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 font-arabic text-sm" />
        <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="تفاصيل المشكلة" rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 font-arabic text-sm" />
        <div className="flex items-center gap-2">
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 font-arabic text-sm">
            <option value="low">أولوية منخفضة</option><option value="normal">عادية</option><option value="high">عاجلة</option>
          </select>
          <button className="px-4 py-2.5 rounded-xl bg-teal-500 text-white font-bold font-arabic text-sm">إرسال</button>
        </div>
      </form>
      {items.length === 0 ? <EmptyState message="لا توجد تذاكر" /> : (
        <div className="space-y-2">
          {items.map((tk) => (
            <div key={tk.id} className="p-4 rounded-xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between">
                <span className="font-bold font-arabic">{tk.subject}</span>
                <span className={`px-2 py-0.5 rounded-md text-xs font-arabic ${color[tk.status]}`}>{tk.status}</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-arabic mt-1">{tk.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlanTab({ business, onChange }: { business: Business; onChange: () => void }) {
  const { locale, t } = useLocale();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [msg, setMsg] = useState('');
  useEffect(() => { getPlans().then(setPlans); }, []);
  const choose = async (p: SubscriptionPlan) => { await subscribeBusiness(business.id, p); setMsg(`تم الاشتراك في خطة ${p.name_ar}`); onChange(); setTimeout(() => setMsg(''), 2500); };
  return (
    <div>
      {msg && <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 text-emerald-500 text-sm font-arabic">{msg}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {plans.map((p) => (
          <div key={p.id} className={`p-5 rounded-2xl border-2 flex flex-col ${business.plan === p.key ? 'border-teal-500 bg-teal-500/5' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-navy-800/60'}`}>
            <h3 className="font-bold font-arabic">{localName(p, locale)}</h3>
            <div className="my-2 text-2xl font-extrabold">{p.price_monthly === 0 ? 'مجاناً' : formatPrice(p.price_monthly, p.currency, locale)}</div>
            <ul className="space-y-1.5 flex-1 mb-4">
              {p.features.slice(0, 4).map((f, i) => <li key={i} className="flex items-start gap-1.5 text-xs font-arabic text-slate-500 dark:text-slate-400"><Check className="w-3.5 h-3.5 text-teal-500 flex-shrink-0 mt-0.5" />{f}</li>)}
            </ul>
            <button disabled={business.plan === p.key} onClick={() => choose(p)}
              className={`py-2 rounded-lg text-sm font-bold font-arabic ${business.plan === p.key ? 'bg-slate-100 dark:bg-white/10 text-slate-400' : 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white'}`}>
              {business.plan === p.key ? 'خطتك الحالية' : t('subscribe')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
