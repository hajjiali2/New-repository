import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Rocket, ShieldCheck, TrendingUp, Headphones, MapPin, FileCheck,
  Store, BarChart3, Megaphone, Package, Gift, ChevronDown, CheckCircle2,
} from 'lucide-react';
import { publicStats, PublicStats } from '../api';
import { useLocale } from '../context';
import { formatNumber } from '../utils';
import SEO from '../components/SEO';

const benefits = [
  { icon: Store, title: 'متجر احترافي', desc: 'صفحة متجر كاملة بمنتجاتك وعروضك وبيانات التواصل.' },
  { icon: TrendingUp, title: 'وصول لآلاف العملاء', desc: 'ظهور في البحث والفئات والمدن أمام جمهور يبحث عنك.' },
  { icon: ShieldCheck, title: 'شارة موثوقية', desc: 'وثّق سجلك التجاري واكسب ثقة العملاء بشارة "تاجر موثّق".' },
  { icon: Megaphone, title: 'أدوات تسويق', desc: 'كوبونات، عروض، إعلانات ممولة وإبراز في الصفحة الرئيسية.' },
  { icon: BarChart3, title: 'تحليلات متقدمة', desc: 'تابع المشاهدات والطلبات والعملاء المحتملين والإيرادات.' },
  { icon: Headphones, title: 'دعم مخصص', desc: 'فريق دعم سعودي يساعدك في كل خطوة على مدار الساعة.' },
];

const whyChooseUs = [
  { icon: Rocket, title: 'تأسيس أسرع', desc: 'فعّل متجرك خلال دقائق لا أيام.' },
  { icon: TrendingUp, title: 'تكلفة أقل', desc: 'اشتراك ثابت بلا عمولات على مبيعاتك.' },
  { icon: Headphones, title: 'دعم مخصص', desc: 'مدير حساب وفريق دعم باللغة العربية.' },
  { icon: MapPin, title: 'خبرة بالسوق السعودي', desc: 'منصة مصممة خصيصاً للتاجر السعودي.' },
  { icon: FileCheck, title: 'دعم الامتثال', desc: 'توثيق السجل التجاري ودعم ضريبة القيمة المضافة.' },
];

const commission = [
  { plan: 'مجاني', fee: '0%', monthly: '0 ر.س', note: 'للبدء والتجربة' },
  { plan: 'الخطط المدفوعة', fee: '0%', monthly: 'اشتراك ثابت', note: 'بدون عمولة على المبيعات' },
];

const faqs = [
  { q: 'كم تبلغ العمولة على مبيعاتي؟', a: 'لا نأخذ أي عمولة على مبيعاتك في الخطط المدفوعة — تدفع اشتراكاً شهرياً ثابتاً فقط. الخطة المجانية متاحة دائماً.' },
  { q: 'كيف أوثّق متجري؟', a: 'ارفع السجل التجاري ورقم ضريبة القيمة المضافة عند التسجيل، ويقوم فريقنا بمراجعتها خلال 24 ساعة لمنحك شارة "تاجر موثّق".' },
  { q: 'هل أحتاج سجلاً تجارياً؟', a: 'يمكنك البدء بالخطة المجانية، ويُنصح بإضافة السجل التجاري للحصول على شارة التوثيق وزيادة ثقة العملاء.' },
  { q: 'ما هي مدة العرض المجاني؟', a: 'عند التسجيل الآن تحصل على أول 3 أشهر مجاناً على أي خطة مدفوعة، بدون أي التزام.' },
  { q: 'هل المنصة تدعم العربية وضريبة القيمة المضافة؟', a: 'نعم، المنصة عربية بالكامل (RTL) وتدعم الريال السعودي وضريبة القيمة المضافة والعنوان الوطني.' },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-800/60 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-3 p-4 text-start">
        <span className="font-bold font-arabic">{q}</span>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="px-4 pb-4 text-slate-600 dark:text-slate-300 font-arabic leading-relaxed">{a}</p>}
    </div>
  );
}

export default function MerchantLanding() {
  const { locale } = useLocale();
  const [stats, setStats] = useState<PublicStats | null>(null);
  useEffect(() => { publicStats().then(setStats); }, []);

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  return (
    <>
      <SEO title="انضم كتاجر — نمّ أعمالك مع سعودي ديسكفري" description="انضم لأكبر منصة تجار في السعودية واحصل على أول 3 أشهر مجاناً. متجر احترافي، توثيق، وأدوات تسويق." jsonLd={jsonLd} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-teal-900 to-emerald-900 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-sm font-arabic mb-6"><Gift className="w-4 h-4" />أول 3 أشهر مجاناً</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-arabic leading-tight mb-4">نمِّ متجرك مع أكبر منصة تجار في السعودية</h1>
          <p className="text-white/80 font-arabic text-lg mb-8 max-w-2xl mx-auto">انضم لآلاف التجار، اعرض منتجاتك أمام عملاء جاهزين للشراء، واحصل على أدوات تسويق وتحليلات احترافية.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/merchants/register" className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold font-arabic text-lg hover:opacity-95 transition-opacity inline-flex items-center gap-2"><Rocket className="w-5 h-5" />سجّل متجرك مجاناً</Link>
            <Link to="/pricing" className="px-8 py-4 rounded-xl bg-white/10 border border-white/20 text-white font-bold font-arabic text-lg hover:bg-white/20 transition-colors">شاهد الأسعار</Link>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="bg-white dark:bg-navy-900 border-b border-slate-200 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { v: stats?.merchants, s: '+', label: 'تاجر نشط' },
            { v: stats?.products, s: '+', label: 'منتج' },
            { v: stats?.cities, s: '', label: 'مدينة' },
            { v: stats?.reviews, s: '+', label: 'تقييم موثوق' },
          ].map((x, i) => (
            <div key={i}>
              <div className="text-3xl sm:text-4xl font-extrabold text-teal-600 dark:text-teal-400">{x.v != null ? formatNumber(x.v, locale) : '—'}{x.s}</div>
              <div className="text-slate-500 dark:text-slate-400 font-arabic mt-1">{x.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-20">
        {/* Benefits */}
        <section>
          <h2 className="text-3xl font-bold font-arabic text-center mb-3">مزايا الانضمام</h2>
          <p className="text-slate-500 dark:text-slate-400 font-arabic text-center mb-10">كل ما تحتاجه لإطلاق متجرك ونموه في مكان واحد</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((b, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4"><b.icon className="w-6 h-6 text-teal-600 dark:text-teal-400" /></div>
                <h3 className="font-bold font-arabic text-lg mb-1">{b.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-arabic text-sm">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Commission structure */}
        <section>
          <h2 className="text-3xl font-bold font-arabic text-center mb-3">هيكل العمولة</h2>
          <p className="text-slate-500 dark:text-slate-400 font-arabic text-center mb-10">شفافية كاملة — بدون عمولات خفية على مبيعاتك</p>
          <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {commission.map((c, i) => (
              <div key={i} className="p-6 rounded-2xl border-2 border-teal-500/30 bg-teal-500/5 text-center">
                <h3 className="font-bold font-arabic text-lg">{c.plan}</h3>
                <div className="text-4xl font-extrabold text-teal-600 dark:text-teal-400 my-3">{c.fee}</div>
                <p className="font-arabic text-sm text-slate-500 dark:text-slate-400">عمولة على المبيعات</p>
                <div className="mt-3 font-arabic font-semibold">{c.monthly}</div>
                <p className="font-arabic text-xs text-slate-400 mt-1">{c.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why choose us */}
        <section>
          <h2 className="text-3xl font-bold font-arabic text-center mb-10">لماذا يختارنا التجار</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {whyChooseUs.map((w, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10 text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mx-auto mb-3"><w.icon className="w-6 h-6 text-white" /></div>
                <h3 className="font-bold font-arabic mb-1">{w.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-arabic text-sm">{w.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Success metrics */}
        <section className="rounded-3xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white p-10 text-center">
          <h2 className="text-3xl font-bold font-arabic mb-8">نتائج تتحدث عن نفسها</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: TrendingUp, v: '3x', label: 'زيادة في الوصول للعملاء' },
              { icon: Package, v: '+40%', label: 'نمو في الطلبات خلال 90 يوماً' },
              { icon: CheckCircle2, v: '24h', label: 'متوسط مدة التوثيق' },
            ].map((m, i) => (
              <div key={i}>
                <m.icon className="w-8 h-8 mx-auto mb-2 opacity-80" />
                <div className="text-4xl font-extrabold">{m.v}</div>
                <div className="font-arabic mt-1 opacity-90">{m.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold font-arabic text-center mb-8">الأسئلة الشائعة</h2>
          <div className="space-y-3">{faqs.map((f, i) => <FAQItem key={i} {...f} />)}</div>
        </section>

        {/* Final CTA */}
        <section className="text-center rounded-3xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10 p-12">
          <h2 className="text-3xl font-bold font-arabic mb-3">جاهز للنمو؟</h2>
          <p className="text-slate-500 dark:text-slate-400 font-arabic mb-6">انضم الآن واحصل على أول 3 أشهر مجاناً</p>
          <Link to="/merchants/register" className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold font-arabic text-lg"><Rocket className="w-5 h-5" />سجّل متجرك الآن</Link>
        </section>
      </div>
    </>
  );
}
