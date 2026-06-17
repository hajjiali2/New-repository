import { useEffect, useState } from 'react';
import {
  Store, Users, Star, DollarSign, Megaphone, TrendingUp, Check, X,
  BadgeCheck, Crown,
} from 'lucide-react';
import {
  AdminStats, adminStats, adminAllBusinesses, adminUpdateBusiness, adminAllReviews,
  adminModerateReview, adminAllLeads, adminCampaigns, adminAffiliates, adminInvoices,
} from '../../api';
import { Business, Review, Lead, AdCampaign, Affiliate, Invoice } from '../../types';
import { useLocale } from '../../context';
import { localName, formatPrice, formatNumber, PLAN_BADGE } from '../../utils';
import SEO from '../../components/SEO';
import { Loader, EmptyState } from '../../components/ui';

type Tab = 'overview' | 'businesses' | 'reviews' | 'leads' | 'ads' | 'affiliates' | 'revenue';

export default function AdminDashboard() {
  const { t } = useLocale();
  const [tab, setTab] = useState<Tab>('overview');
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SEO title={t('nav_admin')} />
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center"><Crown className="w-6 h-6 text-white" /></div>
        <h1 className="text-2xl sm:text-3xl font-bold font-arabic">لوحة الإدارة العليا</h1>
      </div>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {([
          ['overview', 'نظرة عامة'], ['businesses', 'الأعمال'], ['reviews', 'التقييمات'],
          ['leads', 'العملاء'], ['ads', 'الإعلانات'], ['affiliates', 'المسوّقون'], ['revenue', 'الإيرادات'],
        ] as [Tab, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-arabic font-semibold whitespace-nowrap transition-colors ${tab === key ? 'bg-fuchsia-500 text-white' : 'bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10'}`}>
            {label}
          </button>
        ))}
      </div>
      {tab === 'overview' && <Overview />}
      {tab === 'businesses' && <Businesses />}
      {tab === 'reviews' && <Reviews />}
      {tab === 'leads' && <Leads />}
      {tab === 'ads' && <Ads />}
      {tab === 'affiliates' && <Affiliates />}
      {tab === 'revenue' && <Revenue />}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Store; label: string; value: string | number; color: string }) {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}><Icon className="w-5 h-5" /></div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-slate-500 dark:text-slate-400 font-arabic">{label}</div>
    </div>
  );
}

function Overview() {
  const { locale } = useLocale();
  const [stats, setStats] = useState<AdminStats | null>(null);
  useEffect(() => { adminStats().then(setStats); }, []);
  if (!stats) return <Loader />;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="إجمالي الإيرادات" value={formatPrice(stats.revenue, 'SAR', locale)} color="bg-emerald-500/15 text-emerald-500" />
        <StatCard icon={Store} label="الأعمال" value={formatNumber(stats.businesses, locale)} color="bg-teal-500/15 text-teal-500" />
        <StatCard icon={Users} label="العملاء المحتملون" value={formatNumber(stats.leads, locale)} color="bg-amber-500/15 text-amber-500" />
        <StatCard icon={Star} label="التقييمات" value={formatNumber(stats.reviews, locale)} color="bg-rose-500/15 text-rose-500" />
        <StatCard icon={TrendingUp} label="أعمال نشطة" value={formatNumber(stats.activeBusinesses, locale)} color="bg-blue-500/15 text-blue-500" />
        <StatCard icon={Store} label="قيد المراجعة" value={formatNumber(stats.pendingBusinesses, locale)} color="bg-orange-500/15 text-orange-500" />
        <StatCard icon={Megaphone} label="المسوّقون" value={formatNumber(stats.affiliates, locale)} color="bg-fuchsia-500/15 text-fuchsia-500" />
      </div>
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10">
          <h3 className="font-bold font-arabic mb-4">أعلى الفئات</h3>
          {stats.topCategories.map((c) => (
            <div key={c.name} className="mb-3">
              <div className="flex justify-between text-sm font-arabic mb-1"><span>{c.name}</span><span className="text-slate-400">{c.count}</span></div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden"><div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500" style={{ width: `${(c.count / Math.max(...stats.topCategories.map((x) => x.count), 1)) * 100}%` }} /></div>
            </div>
          ))}
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10">
          <h3 className="font-bold font-arabic mb-4">أعلى المدن</h3>
          {stats.topCities.map((c) => (
            <div key={c.name} className="mb-3">
              <div className="flex justify-between text-sm font-arabic mb-1"><span>{c.name}</span><span className="text-slate-400">{c.count}</span></div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden"><div className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-500" style={{ width: `${(c.count / Math.max(...stats.topCities.map((x) => x.count), 1)) * 100}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Businesses() {
  const { locale } = useLocale();
  const [items, setItems] = useState<Business[]>([]);
  const load = () => adminAllBusinesses().then(setItems);
  useEffect(() => { load(); }, []);
  const toggle = async (b: Business, patch: Partial<Business>) => { await adminUpdateBusiness(b.id, patch); load(); };
  return (
    <div className="overflow-x-auto rounded-2xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 font-arabic">
          <th className="px-4 py-3 text-start">النشاط</th><th className="px-4 py-3 text-start">الخطة</th><th className="px-4 py-3 text-start">الحالة</th><th className="px-4 py-3 text-start">إجراءات</th>
        </tr></thead>
        <tbody>
          {items.map((b) => (
            <tr key={b.id} className="border-b border-slate-100 dark:border-white/5">
              <td className="px-4 py-3 font-arabic">{b.name}<div className="text-xs text-slate-400">{b.category ? localName(b.category, locale) : ''}</div></td>
              <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-md text-xs font-bold ${PLAN_BADGE[b.plan]}`}>{b.plan}</span></td>
              <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-md text-xs font-arabic ${b.status === 'active' ? 'bg-emerald-500/15 text-emerald-500' : b.status === 'pending' ? 'bg-amber-500/15 text-amber-500' : 'bg-rose-500/15 text-rose-500'}`}>{b.status}</span></td>
              <td className="px-4 py-3">
                <div className="flex gap-1.5 flex-wrap">
                  {b.status !== 'active' && <button onClick={() => toggle(b, { status: 'active' })} className="px-2 py-1 rounded-md bg-emerald-500/15 text-emerald-500 text-xs font-arabic">تفعيل</button>}
                  <button onClick={() => toggle(b, { is_featured: !b.is_featured })} className={`px-2 py-1 rounded-md text-xs font-arabic ${b.is_featured ? 'bg-amber-500 text-white' : 'bg-amber-500/15 text-amber-500'}`}>مميّز</button>
                  <button onClick={() => toggle(b, { is_sponsored: !b.is_sponsored })} className={`px-2 py-1 rounded-md text-xs font-arabic ${b.is_sponsored ? 'bg-fuchsia-500 text-white' : 'bg-fuchsia-500/15 text-fuchsia-500'}`}>ممول</button>
                  <button onClick={() => toggle(b, { is_verified: !b.is_verified })} className={`px-2 py-1 rounded-md text-xs font-arabic inline-flex items-center gap-1 ${b.is_verified ? 'bg-teal-500 text-white' : 'bg-teal-500/15 text-teal-500'}`}><BadgeCheck className="w-3 h-3" />توثيق</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Reviews() {
  const [items, setItems] = useState<Review[]>([]);
  const load = () => adminAllReviews().then(setItems);
  useEffect(() => { load(); }, []);
  const moderate = async (id: string, status: 'approved' | 'rejected') => { await adminModerateReview(id, status); load(); };
  if (items.length === 0) return <EmptyState message="لا توجد تقييمات" />;
  return (
    <div className="space-y-3">
      {items.map((r) => (
        <div key={r.id} className="p-4 rounded-xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10 flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2"><span className="font-bold font-arabic">{r.reviewer_name}</span><span className="text-amber-400 text-sm">{r.rating}★</span><span className="text-xs text-slate-400 font-arabic">{r.business?.name}</span></div>
            <p className="text-slate-600 dark:text-slate-300 font-arabic text-sm mt-1">{r.body}</p>
            <span className={`inline-block mt-2 px-2 py-0.5 rounded-md text-xs font-arabic ${r.status === 'approved' ? 'bg-emerald-500/15 text-emerald-500' : r.status === 'pending' ? 'bg-amber-500/15 text-amber-500' : 'bg-rose-500/15 text-rose-500'}`}>{r.status}</span>
          </div>
          <div className="flex gap-1.5">
            <button onClick={() => moderate(r.id, 'approved')} className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center"><Check className="w-4 h-4" /></button>
            <button onClick={() => moderate(r.id, 'rejected')} className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-500 flex items-center justify-center"><X className="w-4 h-4" /></button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Leads() {
  const [items, setItems] = useState<Lead[]>([]);
  useEffect(() => { adminAllLeads().then(setItems); }, []);
  if (items.length === 0) return <EmptyState message="لا يوجد عملاء" />;
  return (
    <div className="overflow-x-auto rounded-2xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 font-arabic">
          <th className="px-4 py-3 text-start">الاسم</th><th className="px-4 py-3 text-start">الجوال</th><th className="px-4 py-3 text-start">المصدر</th><th className="px-4 py-3 text-start">الحالة</th>
        </tr></thead>
        <tbody>{items.map((l) => (
          <tr key={l.id} className="border-b border-slate-100 dark:border-white/5">
            <td className="px-4 py-3 font-arabic">{l.name}</td><td className="px-4 py-3" dir="ltr">{l.phone}</td><td className="px-4 py-3 font-arabic">{l.source}</td><td className="px-4 py-3 font-arabic">{l.status}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function Ads() {
  const { locale } = useLocale();
  const [items, setItems] = useState<AdCampaign[]>([]);
  useEffect(() => { adminCampaigns().then(setItems); }, []);
  if (items.length === 0) return <EmptyState message="لا توجد حملات" />;
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((c) => (
        <div key={c.id} className="p-4 rounded-xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between"><span className="font-arabic font-semibold">{c.business?.name}</span><span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500 text-xs">{c.status}</span></div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-arabic mt-1">{c.ad_product?.name_ar || c.placement}</p>
          <div className="flex gap-4 mt-2 text-xs text-slate-400 font-arabic"><span>{formatNumber(c.impressions, locale)} ظهور</span><span>{formatNumber(c.clicks, locale)} نقرة</span><span>{formatPrice(c.budget, 'SAR', locale)}</span></div>
        </div>
      ))}
    </div>
  );
}

function Affiliates() {
  const { locale } = useLocale();
  const [items, setItems] = useState<Affiliate[]>([]);
  useEffect(() => { adminAffiliates().then(setItems); }, []);
  if (items.length === 0) return <EmptyState message="لا يوجد مسوّقون" />;
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((a) => (
        <div key={a.id} className="p-4 rounded-xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10">
          <span className="font-bold" dir="ltr">{a.code}</span>
          <div className="text-sm text-slate-500 dark:text-slate-400 font-arabic mt-1">أرباح: {formatPrice(a.total_earned, 'SAR', locale)}</div>
        </div>
      ))}
    </div>
  );
}

function Revenue() {
  const { locale } = useLocale();
  const [items, setItems] = useState<Invoice[]>([]);
  useEffect(() => { adminInvoices().then(setItems); }, []);
  const total = items.filter((i) => i.status === 'paid').reduce((s, i) => s + Number(i.amount), 0);
  return (
    <div>
      <div className="mb-5 p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
        <span className="font-arabic text-sm opacity-80">إجمالي الإيرادات</span>
        <div className="text-3xl font-extrabold">{formatPrice(total, 'SAR', locale)}</div>
      </div>
      <div className="overflow-x-auto rounded-2xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 font-arabic">
            <th className="px-4 py-3 text-start">الوصف</th><th className="px-4 py-3 text-start">النوع</th><th className="px-4 py-3 text-start">المبلغ</th><th className="px-4 py-3 text-start">الحالة</th>
          </tr></thead>
          <tbody>{items.map((i) => (
            <tr key={i.id} className="border-b border-slate-100 dark:border-white/5">
              <td className="px-4 py-3 font-arabic">{i.description}</td><td className="px-4 py-3 font-arabic">{i.kind}</td><td className="px-4 py-3">{formatPrice(Number(i.amount), i.currency, locale)}</td>
              <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500 text-xs font-arabic">{i.status}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
