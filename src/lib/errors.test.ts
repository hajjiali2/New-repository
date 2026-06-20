import { describe, it, expect } from 'vitest';
import { getErrorMessage } from './errors';

describe('getErrorMessage', () => {
  it('reads .message from an Error', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom');
  });
  it('returns a plain string as-is', () => {
    expect(getErrorMessage('oops')).toBe('oops');
  });
  it('reads .message from a PostgREST-style object', () => {
    expect(getErrorMessage({ message: 'permission denied', code: '42501' })).toBe('permission denied');
  });
  it('falls back for an empty object (no "[object Object]")', () => {
    const msg = getErrorMessage({});
    expect(msg).not.toContain('[object');
    expect(msg).toBe('حدث خطأ غير متوقع');
  });
});
