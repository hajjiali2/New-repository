import { useEffect, useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Eye, MousePointerClick, Users, Tag, Ticket, Star, Megaphone, Crown,
  Trash2, BarChart3, Store, Check,
} from 'lucide-react';
import {
  Business, Offer, Coupon, Lead, Review, AdCampaign, AdProduct, SubscriptionPlan,
} from '../../types';
import {
  myBusinesses, createBusiness, ownerOffers, createOffer, deleteOffer,
  ownerCoupons, createCoupon, deleteCoupon, ownerLeads, updateLeadStatus,
  ownerReviews, respondToReview, ownerCampaigns, buyAd, getAdProducts,
  getPlans, subscribeBusiness, businessAnalytics, getCategories, getCities,
} from '../../api';
import { Category, City } from '../../types';
import { useLocale } from '../../context';
import { localName, formatPrice, formatNumber, PLAN_BADGE } from '../../utils';
import { getErrorMessage } from '../../../lib/errors';
import SEO from '../../components/SEO';
import { Loader, EmptyState } from '../../components/ui';
import CategoryIcon from '../../components/CategoryIcon';

type Tab = 'overview' | 'offers' | 'coupons' | 'leads' | 'reviews' | 'ads' | 'plan';

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
          <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10">
            <img src={selected.logo_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-bold font-arabic">{selected.name}</h2>
                <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${PLAN_BADGE[selected.plan]}`}>{selected.plan}</span>
                <span className={`px-2 py-0.5 rounded-md text-xs font-arabic ${selected.status === 'active' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'}`}>
                  {selected.status === 'active' ? 'نشط' : 'قيد المراجعة'}
                </span>
              </div>
              <Link to={`/business/${selected.slug}`} className="text-xs text-teal-600 dark:text-teal-400 font-arabic hover:underline">عرض الصفحة العامة ←</Link>
            </div>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {([
              ['overview', BarChart3, 'نظرة عامة'], ['offers', Tag, t('offers')], ['coupons', Ticket, t('coupons')],
              ['leads', Users, 'العملاء المحتملون'], ['reviews', Star, t('reviews')], ['ads', Megaphone, 'الإعلانات'], ['plan', Crown, 'الاشتراك'],
            ] as [Tab, typeof Tag, string][]).map(([key, Icon, label]) => (
              <button key={key} onClick={() => setTab(key)}
                className={`px-4 py-2 rounded-lg text-sm font-arabic font-semibold whitespace-nowrap inline-flex items-center gap-1.5 transition-colors ${tab === key ? 'bg-teal-500 text-white' : 'bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10'}`}>
                <Icon className="w-4 h-4" />{label}
              </button>
            ))}
          </div>

          {tab === 'overview' && <Overview business={selected} />}
          {tab === 'offers' && <Offers business={selected} />}
          {tab === 'coupons' && <Coupons business={selected} />}
          {tab === 'leads' && <Leads business={selected} />}
          {tab === 'reviews' && <Reviews business={selected} />}
          {tab === 'ads' && <Ads business={selected} />}
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
