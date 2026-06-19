import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gift, X, Rocket, Sparkles } from 'lucide-react';
import { useLocale } from '../context';

const DISMISS_KEY = 'sd-campaign-dismissed';
const EXIT_KEY = 'sd-exit-shown';

/** Top campaign banner: "Join now and get your first 3 months free". */
export function CampaignBanner() {
  const { t } = useLocale();
  const [hidden, setHidden] = useState(() => sessionStorage.getItem(DISMISS_KEY) === '1');
  if (hidden) return null;
  return (
    <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white">
      <Link to="/merchants/register" className="flex items-center justify-center gap-2 px-10 py-2.5 text-center text-sm sm:text-base font-bold font-arabic hover:opacity-95 transition-opacity">
        <Gift className="w-5 h-5 flex-shrink-0" />
        {t('join_free_3m')}
        <span className="hidden sm:inline-flex items-center gap-1 ms-2 px-2 py-0.5 rounded-md bg-white/20"><Sparkles className="w-3.5 h-3.5" />عرض محدود</span>
      </Link>
      <button onClick={() => { sessionStorage.setItem(DISMISS_KEY, '1'); setHidden(true); }}
        className="absolute top-1/2 -translate-y-1/2 end-3 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/20" aria-label="إغلاق">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

/** Sticky bottom CTA encouraging merchant signup. */
export function StickyCTA() {
  const { t } = useLocale();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!show) return null;
  return (
    <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:end-6 z-40 sm:max-w-sm">
      <div className="rounded-2xl bg-navy-900 text-white shadow-2xl border border-white/10 p-4 flex items-center gap-3 animate-slide-up">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
          <Rocket className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold font-arabic text-sm leading-tight">ابدأ البيع اليوم</p>
          <p className="text-white/60 font-arabic text-xs">3 أشهر مجاناً عند التسجيل</p>
        </div>
        <Link to="/merchants/register" className="px-3 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-xs font-bold font-arabic whitespace-nowrap">{t('join_now')}</Link>
      </div>
    </div>
  );
}

/** Exit-intent popup (desktop): fires once per session when the cursor leaves the top. */
export function ExitIntentPopup() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem(EXIT_KEY) === '1') return;
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        sessionStorage.setItem(EXIT_KEY, '1');
        setOpen(true);
        document.removeEventListener('mouseout', onLeave);
      }
    };
    const timer = setTimeout(() => document.addEventListener('mouseout', onLeave), 5000);
    return () => { clearTimeout(timer); document.removeEventListener('mouseout', onLeave); };
  }, []);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 p-8 text-center animate-slide-up">
        <button onClick={() => setOpen(false)} className="absolute top-4 end-4 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"><X className="w-4 h-4" /></button>
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center mx-auto mb-4"><Gift className="w-7 h-7 text-white" /></div>
        <h3 className="text-2xl font-bold font-arabic mb-2">انتظر! عرض خاص لك</h3>
        <p className="text-slate-500 dark:text-slate-400 font-arabic mb-6">سجّل متجرك الآن واحصل على <span className="text-teal-600 dark:text-teal-400 font-bold">أول 3 أشهر مجاناً</span> بدون أي التزام.</p>
        <Link to="/merchants/register" onClick={() => setOpen(false)} className="block w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold font-arabic">{t('join_now')}</Link>
      </div>
    </div>
  );
}
