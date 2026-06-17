import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { useLocale } from '../context';

export default function NotFound() {
  const { t } = useLocale();
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <Compass className="w-16 h-16 text-teal-500 mb-4" />
      <h1 className="text-4xl font-bold font-arabic mb-2">404</h1>
      <p className="text-slate-500 dark:text-slate-400 font-arabic mb-6">الصفحة غير موجودة</p>
      <Link to="/" className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold font-arabic">{t('nav_home')}</Link>
    </div>
  );
}
