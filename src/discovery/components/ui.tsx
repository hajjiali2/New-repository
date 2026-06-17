import { Star, Loader2 } from 'lucide-react';
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../utils';

export function Rating({ value, count, size = 14 }: { value: number; count?: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} width={size} height={size}
          className={i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'} />
      ))}
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{value.toFixed(1)}</span>
      {count != null && <span className="text-xs text-slate-400">({count})</span>}
    </span>
  );
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold', className)}>{children}</span>;
}

export function Loader({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
      <Loader2 className="w-7 h-7 animate-spin text-teal-500" />
      {label && <span className="font-arabic text-sm">{label}</span>}
    </div>
  );
}

export function SectionHeader({ title, subtitle, href, viewAllLabel }: { title: string; subtitle?: string; href?: string; viewAllLabel?: string }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold font-arabic text-slate-900 dark:text-white">{title}</h2>
        {subtitle && <p className="text-slate-500 dark:text-slate-400 font-arabic mt-1">{subtitle}</p>}
      </div>
      {href && (
        <Link to={href} className="text-teal-600 dark:text-teal-400 font-arabic text-sm font-semibold hover:underline whitespace-nowrap">
          {viewAllLabel} ←
        </Link>
      )}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <div className="text-center py-16 text-slate-400 font-arabic">{message}</div>;
}
