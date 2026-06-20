import { describe, it, expect } from 'vitest';
import { translate } from './i18n';

describe('translate', () => {
  it('returns the Arabic string for a known key', () => {
    expect(translate('login', 'ar')).toBe('تسجيل الدخول');
  });
  it('returns the English string for a known key', () => {
    expect(translate('login', 'en')).toBe('Login');
  });
  it('returns the key itself when unknown', () => {
    expect(translate('__missing_key__', 'ar')).toBe('__missing_key__');
  });
  it('has the 3-months-free campaign copy', () => {
    expect(translate('join_free_3m', 'ar')).toContain('3 أشهر');
  });
});
