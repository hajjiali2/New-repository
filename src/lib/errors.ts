/**
 * Extracts a human-readable message from any thrown value. Supabase /
 * PostgREST errors are plain objects (not Error instances), so a naive
 * String(err) would render "[object Object]".
 */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object') {
    const o = err as Record<string, unknown>;
    if (typeof o.message === 'string' && o.message) return o.message;
    if (typeof o.error_description === 'string' && o.error_description) return o.error_description;
    if (typeof o.hint === 'string' && o.hint) return o.hint;
  }
  return 'حدث خطأ غير متوقع';
}
