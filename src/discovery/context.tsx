import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Locale, translate } from './i18n';

// ---------------------------------------------------------------------------
// Theme (dark / light)
// ---------------------------------------------------------------------------
interface ThemeCtx { theme: 'light' | 'dark'; toggleTheme: () => void; }
const ThemeContext = createContext<ThemeCtx>({ theme: 'dark', toggleTheme: () => {} });

// ---------------------------------------------------------------------------
// Locale (ar / en) + translation + direction
// ---------------------------------------------------------------------------
interface LocaleCtx { locale: Locale; dir: 'rtl' | 'ltr'; toggleLocale: () => void; t: (k: string) => string; }
const LocaleContext = createContext<LocaleCtx>({ locale: 'ar', dir: 'rtl', toggleLocale: () => {}, t: (k) => k });

// ---------------------------------------------------------------------------
// Auth (user + profile role)
// ---------------------------------------------------------------------------
interface AuthCtx { user: User | null; role: string; loading: boolean; refresh: () => void; signOut: () => Promise<void>; }
const AuthContext = createContext<AuthCtx>({ user: null, role: 'user', loading: true, refresh: () => {}, signOut: async () => {} });

export function AppProviders({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('sd-theme') as 'light' | 'dark') || 'dark');
  const [locale, setLocale] = useState<Locale>(() => (localStorage.getItem('sd-locale') as Locale) || 'ar');
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
    localStorage.setItem('sd-theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = locale === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('sd-locale', locale);
  }, [locale]);

  const loadRole = useCallback(async (u: User | null) => {
    if (!u) { setRole('user'); return; }
    const { data } = await supabase.from('profiles').select('role').eq('id', u.id).maybeSingle();
    setRole((data?.role as string) || 'user');
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u);
      loadRole(u).finally(() => setLoading(false));
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null;
      setUser(u);
      loadRole(u);
    });
    return () => subscription.unsubscribe();
  }, [loadRole]);

  const refresh = useCallback(() => { loadRole(user); }, [user, loadRole]);
  const signOut = useCallback(async () => { await supabase.auth.signOut(); }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) }}>
      <LocaleContext.Provider value={{
        locale, dir: locale === 'ar' ? 'rtl' : 'ltr',
        toggleLocale: () => setLocale((l) => (l === 'ar' ? 'en' : 'ar')),
        t: (k) => translate(k, locale),
      }}>
        <AuthContext.Provider value={{ user, role, loading, refresh, signOut }}>
          {children}
        </AuthContext.Provider>
      </LocaleContext.Provider>
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);
// eslint-disable-next-line react-refresh/only-export-components
export const useLocale = () => useContext(LocaleContext);
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
