import { Link } from 'react-router-dom';
import { MapPin, BadgeCheck, Star, Megaphone, Eye } from 'lucide-react';
import { Business } from '../types';
import { useLocale } from '../context';
import { localName, formatNumber, cn } from '../utils';
import { Rating, Badge } from './ui';

export default function BusinessCard({ business }: { business: Business }) {
  const { locale, t } = useLocale();
  return (
    <Link
      to={`/business/${business.slug}`}
      className="group rounded-2xl overflow-hidden bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10 hover:border-teal-400 dark:hover:border-teal-500/50 hover:shadow-lg transition-all duration-300 flex flex-col"
    >
      <div className="relative h-40 overflow-hidden">
        <img src={business.cover_url} alt={business.name} loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-2 right-2 flex gap-1.5">
          {business.is_sponsored && <Badge className="bg-fuchsia-500 text-white"><Megaphone className="w-3 h-3" />{t('sponsored')}</Badge>}
          {business.is_featured && <Badge className="bg-amber-500 text-white"><Star className="w-3 h-3" />{t('featured')}</Badge>}
        </div>
        <img src={business.logo_url} alt=""
          className="absolute -bottom-5 right-4 w-12 h-12 rounded-xl border-2 border-white dark:border-navy-800 object-cover shadow-md" />
      </div>
      <div className="p-4 pt-7 flex-1 flex flex-col">
        <div className="flex items-center gap-1.5">
          <h3 className="font-bold font-arabic text-slate-900 dark:text-white truncate">{business.name}</h3>
          {business.is_verified && <BadgeCheck className="w-4 h-4 text-teal-500 flex-shrink-0" />}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-arabic line-clamp-2 mt-1 flex-1">{business.description}</p>
        <div className="flex items-center justify-between mt-3">
          <Rating value={Number(business.rating_avg)} count={business.rating_count} />
          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
            <Eye className="w-3.5 h-3.5" />{formatNumber(business.views_count, locale)}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400 font-arabic">
          {business.city && <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{localName(business.city, locale)}</span>}
          {business.category && <span className={cn('px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400')}>{localName(business.category, locale)}</span>}
        </div>
      </div>
    </Link>
  );
}
