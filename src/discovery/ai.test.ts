import { describe, it, expect } from 'vitest';
import { generateProductDescription, assistantReply } from './ai';

// With no VITE_OPENROUTER_API_KEY configured, these use the built-in fallback
// engine and must still return useful Arabic text (never throw / never empty).
describe('generateProductDescription (fallback)', () => {
  it('produces a non-empty description mentioning the product name', async () => {
    const out = await generateProductDescription('ساعة فاخرة', 'إكسسوارات', 'جودة، ضمان');
    expect(out.length).toBeGreaterThan(20);
    expect(out).toContain('ساعة فاخرة');
  });
});

describe('assistantReply (fallback)', () => {
  it('answers registration questions with relevant guidance', async () => {
    const out = await assistantReply('كيف أبدأ التسجيل؟');
    expect(out).toContain('انضم');
  });
  it('returns a helpful default for unrelated input', async () => {
    const out = await assistantReply('xyz random');
    expect(out.length).toBeGreaterThan(10);
  });
});
