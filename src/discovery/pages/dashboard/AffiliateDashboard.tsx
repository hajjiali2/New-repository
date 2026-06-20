import { useEffect, useState, FormEvent } from 'react';
import { Users, DollarSign, Link2, Copy, Check, Send, Wallet } from 'lucide-react';
import { Affiliate, Referral, Commission } from '../../types';
import {
  myAffiliate, becomeAffiliate, affiliateReferrals, affiliateCommissions,
  inviteReferral, requestPayout,
} from '../../api';
import { useLocale } from '../../context';
import { formatPrice } from '../../utils';
import SEO from '../../components/SEO';
import { Loader } from '../../components/ui';

export default function AffiliateDashboard() {
  const { locale, t } = useLocale();
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [invite, setInvite] = useState({ email: '', name: '' });
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    const a = await myAffiliate();
    setAffiliate(a);
    if (a) {
      setReferrals(await affiliateReferrals(a.id));
      setCommissions(await affiliateCommissions(a.id));
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  if (loading) return <Loader />;

  if (!affiliate) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-4">
        <SEO title={t('nav_affiliate')} />
        <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center mx-auto mb-4"><Users className="w-7 h-7 text-teal-500" /></div>
        <h1 className="text-2xl font-bold font-arabic mb-2">انضم لبرنامج التسويق بالعمولة</h1>
        <p className="text-slate-500 dark:text-slate-400 font-arabic mb-6">ادعُ الأعمال للانضمام واكسب عمولات على كل اشتراك.</p>
        <button onClick={async () => { await becomeAffiliate(); load(); }} className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold font-arabic">انضم الآن</button>
      </div>
    );
  }

  const link = `${window.location.origin}/?ref=${affiliate.code}`;
  const copy = async () => { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const sendInvite = async (e: FormEvent) => {
    e.preventDefault();
    await inviteReferral(affiliate.id, invite.email, invite.name);
    setInvite({ email: '', name: '' }); setMsg('تم إرسال الدعوة'); load(); setTimeout(() => setMsg(''), 2500);
  };
  const payout = async () => {
    const available = affiliate.total_earned - affiliate.total_paid;
    if (available <= 0) { setMsg('لا يوجد رصيد متاح'); setTimeout(() => setMsg(''), 2500); return; }
    await requestPayout(affiliate.id, available, 'bank'); setMsg('تم طلب السحب'); setTimeout(() => setMsg(''), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SEO title={t('nav_affiliate')} />
      <h1 className="text-2xl sm:text-3xl font-bold font-arabic mb-6">{t('nav_affiliate')}</h1>
      {msg && <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 text-emerald-500 text-sm font-arabic">{msg}</div>}

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10">
          <Users className="w-5 h-5 text-teal-500 mb-2" /><div className="text-2xl font-bold">{referrals.length}</div><div className="text-sm text-slate-400 font-arabic">الإحالات</div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10">
          <DollarSign className="w-5 h-5 text-emerald-500 mb-2" /><div className="text-2xl font-bold">{formatPrice(affiliate.total_earned, 'SAR', locale)}</div><div className="text-sm text-slate-400 font-arabic">إجمالي الأرباح</div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10">
          <Wallet className="w-5 h-5 text-amber-500 mb-2" /><div className="text-2xl font-bold">{formatPrice(affiliate.total_earned - affiliate.total_paid, 'SAR', locale)}</div><div className="text-sm text-slate-400 font-arabic">رصيد متاح</div>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10 mb-6">
        <h3 className="font-bold font-arabic mb-3 flex items-center gap-2"><Link2 className="w-5 h-5 text-teal-500" />رابط الإحالة الخاص بك</h3>
        <div className="flex gap-2">
          <input readOnly value={link} dir="ltr" className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-navy-900 text-sm" />
          <button onClick={copy} className="px-4 py-2 rounded-lg bg-teal-500 text-white text-sm font-bold font-arabic inline-flex items-center gap-1.5">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}نسخ</button>
        </div>
      </div>

      <form onSubmit={sendInvite} className="p-5 rounded-2xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10 mb-6">
        <h3 className="font-bold font-arabic mb-3">ادعُ نشاطاً تجارياً</h3>
        <div className="flex flex-wrap gap-2">
          <input value={invite.name} onChange={(e) => setInvite({ ...invite, name: e.target.value })} placeholder="اسم النشاط" className="flex-1 min-w-40 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 text-sm font-arabic" />
          <input value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} placeholder="البريد الإلكتروني" type="email" required dir="ltr" className="flex-1 min-w-40 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 text-sm" />
          <button className="px-4 py-2 rounded-lg bg-teal-500 text-white text-sm font-bold font-arabic inline-flex items-center gap-1.5"><Send className="w-4 h-4" />دعوة</button>
        </div>
      </form>

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <h3 className="font-bold font-arabic mb-3">الإحالات</h3>
          <div className="space-y-2">
            {referrals.length === 0 ? <p className="text-slate-400 font-arabic text-sm">لا توجد إحالات بعد</p> : referrals.map((r) => (
              <div key={r.id} className="p-3 rounded-xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                <span className="font-arabic text-sm">{r.referred_name || r.referred_email}</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-500 text-xs font-arabic">{r.status}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold font-arabic">العمولات</h3>
            <button onClick={payout} className="px-3 py-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-bold font-arabic">طلب سحب</button>
          </div>
          <div className="space-y-2">
            {commissions.length === 0 ? <p className="text-slate-400 font-arabic text-sm">لا توجد عمولات بعد</p> : commissions.map((c) => (
              <div key={c.id} className="p-3 rounded-xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                <span className="font-arabic text-sm">{c.description || 'عمولة'}</span>
                <span className="font-bold text-sm">{formatPrice(Number(c.amount), c.currency, locale)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
