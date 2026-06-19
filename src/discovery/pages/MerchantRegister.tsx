import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, FileCheck, UploadCloud, Check, Mail, Lock, User as UserIcon,
  Phone, Hash, MapPin, Gift, ArrowLeft, Loader2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getErrorMessage } from '../../lib/errors';
import { Category, City } from '../types';
import { getCategories, getCities, registerMerchant, MerchantInput } from '../api';
import { useAuth, useLocale } from '../context';
import { localName } from '../utils';
import SEO from '../components/SEO';

const STEPS = ['الحساب', 'بيانات المتجر', 'الامتثال', 'المستندات'];

export default function MerchantRegister() {
  const { user } = useAuth();
  const { locale } = useLocale();
  const navigate = useNavigate();
  const [step, setStep] = useState(user ? 1 : 0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [account, setAccount] = useState({ email: '', password: '' });
  const [form, setForm] = useState<MerchantInput>({
    name: '', description: '', category_id: '', city_id: '',
    contact_person: '', mobile: '', email: '', whatsapp: '',
    cr_number: '', vat_number: '', national_address: '',
    cr_document_url: '', logo_url: '',
  });
  const [crFileName, setCrFileName] = useState('');

  useEffect(() => { getCategories().then(setCategories); getCities().then(setCities); }, []);
  useEffect(() => { if (user && step === 0) setStep(1); }, [user, step]);

  const set = (k: keyof MerchantInput, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const createAccount = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const { error: err } = await supabase.auth.signUp({ email: account.email, password: account.password });
      if (err) throw err;
      await supabase.auth.signInWithPassword({ email: account.email, password: account.password });
      set('email', account.email);
      setStep(1);
    } catch (err) { setError(getErrorMessage(err)); } finally { setLoading(false); }
  };

  const onCrFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setCrFileName(f.name); set('cr_document_url', `uploaded:${f.name}`); }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const logo = `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || 'M')}&background=0d9488&color=fff&size=128`;
      await registerMerchant({ ...form, logo_url: logo });
      navigate('/dashboard');
    } catch (err) { setError(getErrorMessage(err)); } finally { setLoading(false); }
  };

  const input = 'w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 font-arabic text-sm focus:outline-none focus:border-teal-400';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <SEO title="سجّل متجرك — انضم كتاجر" description="سجّل متجرك في سعودي ديسكفري واحصل على أول 3 أشهر مجاناً." />

      <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 mb-6 flex items-center gap-2 font-arabic font-bold">
        <Gift className="w-5 h-5" />أنت على بعد خطوات من 3 أشهر مجانية!
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className={`flex items-center gap-2 ${i <= step ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i < step ? 'bg-teal-500 text-white' : i === step ? 'bg-teal-500/15 border-2 border-teal-500' : 'bg-slate-100 dark:bg-white/10'}`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className="hidden sm:block text-xs font-arabic">{label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-teal-500' : 'bg-slate-200 dark:bg-white/10'}`} />}
          </div>
        ))}
      </div>

      {error && <div className="mb-4 p-3 rounded-lg bg-rose-500/10 text-rose-500 text-sm font-arabic">{error}</div>}

      <div className="rounded-2xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10 p-6 sm:p-8">
        {/* Step 0: account */}
        {step === 0 && (
          <form onSubmit={createAccount} className="space-y-4">
            <h2 className="text-xl font-bold font-arabic flex items-center gap-2"><UserIcon className="w-5 h-5 text-teal-500" />إنشاء حساب</h2>
            <div className="relative"><Mail className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-slate-400" /><input type="email" required dir="ltr" value={account.email} onChange={(e) => setAccount({ ...account, email: e.target.value })} placeholder="البريد الإلكتروني" className={input + ' ps-10'} /></div>
            <div className="relative"><Lock className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-slate-400" /><input type="password" required dir="ltr" value={account.password} onChange={(e) => setAccount({ ...account, password: e.target.value })} placeholder="كلمة المرور" className={input + ' ps-10'} /></div>
            <button disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold font-arabic disabled:opacity-50">{loading ? '...' : 'التالي'}</button>
          </form>
        )}

        {/* Step 1: company */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold font-arabic flex items-center gap-2"><Building2 className="w-5 h-5 text-teal-500" />بيانات المتجر</h2>
            <input required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="اسم الشركة / المتجر" className={input} />
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="نبذة عن المتجر" rows={2} className={input} />
            <div className="grid grid-cols-2 gap-3">
              <select value={form.category_id} onChange={(e) => set('category_id', e.target.value)} className={input}>
                <option value="">الفئة</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{localName(c, locale)}</option>)}
              </select>
              <select value={form.city_id} onChange={(e) => set('city_id', e.target.value)} className={input}>
                <option value="">المدينة</option>
                {cities.map((c) => <option key={c.id} value={c.id}>{localName(c, locale)}</option>)}
              </select>
            </div>
            <div className="relative"><UserIcon className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-slate-400" /><input value={form.contact_person} onChange={(e) => set('contact_person', e.target.value)} placeholder="الشخص المسؤول" className={input + ' ps-10'} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative"><Phone className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-slate-400" /><input dir="ltr" value={form.mobile} onChange={(e) => set('mobile', e.target.value)} placeholder="رقم الجوال" className={input + ' ps-10'} /></div>
              <div className="relative"><Phone className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-emerald-500" /><input dir="ltr" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} placeholder="واتساب" className={input + ' ps-10'} /></div>
            </div>
            <div className="relative"><Mail className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-slate-400" /><input type="email" dir="ltr" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="البريد الإلكتروني للمتجر" className={input + ' ps-10'} /></div>
            <div className="flex gap-2">
              <button onClick={() => setStep(2)} disabled={!form.name || !form.category_id || !form.city_id} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold font-arabic disabled:opacity-50">التالي</button>
            </div>
          </div>
        )}

        {/* Step 2: compliance */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold font-arabic flex items-center gap-2"><Hash className="w-5 h-5 text-teal-500" />بيانات الامتثال (السعودية)</h2>
            <div className="relative"><Hash className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-slate-400" /><input dir="ltr" value={form.cr_number} onChange={(e) => set('cr_number', e.target.value)} placeholder="رقم السجل التجاري" className={input + ' ps-10'} /></div>
            <div className="relative"><Hash className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-slate-400" /><input dir="ltr" value={form.vat_number} onChange={(e) => set('vat_number', e.target.value)} placeholder="الرقم الضريبي (VAT)" className={input + ' ps-10'} /></div>
            <div className="relative"><MapPin className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-slate-400" /><input value={form.national_address} onChange={(e) => set('national_address', e.target.value)} placeholder="العنوان الوطني" className={input + ' ps-10'} /></div>
            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/10 font-arabic"><ArrowLeft className="w-4 h-4" /></button>
              <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold font-arabic">التالي</button>
            </div>
          </div>
        )}

        {/* Step 3: documents */}
        {step === 3 && (
          <form onSubmit={submit} className="space-y-4">
            <h2 className="text-xl font-bold font-arabic flex items-center gap-2"><FileCheck className="w-5 h-5 text-teal-500" />المستندات والشعار</h2>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-white/10">
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || 'M')}&background=0d9488&color=fff&size=80`} alt="logo" className="w-12 h-12 rounded-xl" />
              <span className="font-arabic text-sm text-slate-500 dark:text-slate-400">سيتم إنشاء شعار تلقائي من اسم متجرك (يمكنك تغييره لاحقاً).</span>
            </div>
            <label className="block">
              <span className="font-arabic text-sm text-slate-600 dark:text-slate-300">رفع السجل التجاري (PDF/صورة)</span>
              <div className="mt-2 flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-teal-400/40 cursor-pointer hover:bg-teal-500/5">
                <UploadCloud className="w-6 h-6 text-teal-500" />
                <span className="font-arabic text-sm">{crFileName || 'اختر ملف السجل التجاري'}</span>
                <input type="file" accept="image/*,application/pdf" onChange={onCrFile} className="hidden" />
              </div>
            </label>
            {crFileName && <p className="text-emerald-500 text-sm font-arabic flex items-center gap-1"><Check className="w-4 h-4" />تم استلام المستند — سيُراجع للتوثيق</p>}
            <div className="flex gap-2">
              <button type="button" onClick={() => setStep(2)} className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/10 font-arabic"><ArrowLeft className="w-4 h-4" /></button>
              <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold font-arabic disabled:opacity-50 inline-flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>أنشئ متجري واحصل على 3 أشهر مجاناً</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
