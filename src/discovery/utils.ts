import { Locale } from './i18n';

export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

export function localName(entity: { name_ar: string; name_en: string } | null | undefined, locale: Locale): string {
  if (!entity) return '';
  return locale === 'ar' ? entity.name_ar : entity.name_en || entity.name_ar;
}

export function formatPrice(amount: number, currency = 'SAR', locale: Locale = 'ar'): string {
  const n = new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US').format(amount);
  return locale === 'ar' ? `${n} ر.س` : `${currency} ${n}`;
}

export function formatNumber(n: number, locale: Locale = 'ar'): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US').format(n);
}

export const PLAN_BADGE: Record<string, string> = {
  free: 'bg-slate-500/15 text-slate-400',
  silver: 'bg-slate-400/20 text-slate-300',
  gold: 'bg-amber-500/20 text-amber-400',
  diamond: 'bg-cyan-500/20 text-cyan-300',
  enterprise: 'bg-fuchsia-500/20 text-fuchsia-300',
};
