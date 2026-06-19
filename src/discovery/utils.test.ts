import { describe, it, expect } from 'vitest';
import { cn, localName, formatPrice, formatNumber } from './utils';

describe('cn', () => {
  it('joins truthy class names and drops falsy', () => {
    expect(cn('a', false, 'b', null, undefined, 'c')).toBe('a b c');
  });
});

describe('localName', () => {
  const entity = { name_ar: 'مطاعم', name_en: 'Restaurants' };
  it('returns Arabic name for ar locale', () => {
    expect(localName(entity, 'ar')).toBe('مطاعم');
  });
  it('returns English name for en locale', () => {
    expect(localName(entity, 'en')).toBe('Restaurants');
  });
  it('falls back to Arabic when English is empty', () => {
    expect(localName({ name_ar: 'عربي', name_en: '' }, 'en')).toBe('عربي');
  });
  it('returns empty string for null', () => {
    expect(localName(null, 'ar')).toBe('');
  });
});

describe('formatPrice', () => {
  it('appends Arabic currency for ar locale', () => {
    expect(formatPrice(1000, 'SAR', 'ar')).toContain('ر.س');
  });
  it('uses currency code for en locale', () => {
    expect(formatPrice(1000, 'SAR', 'en')).toContain('SAR');
  });
});

describe('formatNumber', () => {
  it('formats without throwing for both locales', () => {
    expect(typeof formatNumber(12345, 'ar')).toBe('string');
    expect(formatNumber(12345, 'en')).toContain('12,345');
  });
});
