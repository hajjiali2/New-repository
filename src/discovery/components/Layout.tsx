import { ReactNode, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Moon, Sun, Menu, X, LayoutDashboard, Shield, LogOut, Store } from 'lucide-react';
import { useTheme, useLocale, useAuth } from '../context';
import { cn } from '../utils';
import { CampaignBanner, StickyCTA, ExitIntentPopup } from './Conversion';
import AIAssistant from './AIAssistant';

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink to={to} className={({ isActive }) => cn(
      'px-3 py-2 rounded-lg text-sm font-arabic font-medium transition-colors',
      isActive ? 'text-teal-600 dark:text-teal-400 bg-teal-500/10' : 'text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400'
    )}>{label}</NavLink>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const { locale, toggleLocale, t } = useLocale();
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = (
    <>
      <NavItem to="/" label={t('nav_home')} />
      <NavItem to="/categories" label={t('nav_categories')} />
      <NavItem to="/products" label={t('products')} />
      <NavItem to="/cities" label={t('nav_cities')} />
      <NavItem to="/deals" label={t('nav_deals')} />
      <NavItem to="/blog" label={t('nav_blog')} />
      <NavItem to="/pricing" label={t('nav_pricing')} />
      <NavItem to="/merchants" label={t('nav_merchants')} />
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white transition-colors">
      <CampaignBanner />
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-navy-900/90 backdrop-blur border-b border-slate-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <img src="/logo.png" alt={t('brand')} className="w-9 h-9 rounded-xl" />
              <span className="font-extrabold font-arabic text-lg hidden sm:block">{t('brand')}</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">{links}</nav>

            <div className="flex items-center gap-2">
              <button onClick={toggleLocale} title="Language" className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                <span className="text-xs font-bold">{locale === 'ar' ? 'EN' : 'ع'}</span>
              </button>
              <button onClick={toggleTheme} title="Theme" className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              {user ? (
                <div className="hidden sm:flex items-center gap-2">
                  {role === 'admin' && (
                    <Link to="/admin" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-arabic text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10">
                      <Shield className="w-4 h-4" />{t('nav_admin')}
                    </Link>
                  )}
                  <Link to="/dashboard" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-arabic text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10">
                    <LayoutDashboard className="w-4 h-4" />{t('nav_dashboard')}
                  </Link>
                  <button onClick={() => { signOut(); navigate('/'); }} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-arabic text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/login" className="px-3 py-2 rounded-lg text-sm font-arabic text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                    {t('login')}
                  </Link>
                  <Link to="/merchants/register" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-sm font-bold font-arabic hover:from-teal-600 hover:to-emerald-700 transition-all">
                    <Store className="w-4 h-4" />{t('join_now')}
                  </Link>
                </div>
              )}
              <button onClick={() => setOpen(!open)} className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10">
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
          {open && (
            <div className="lg:hidden py-3 flex flex-col gap-1 border-t border-slate-200 dark:border-white/10">
              {links}
              {user ? (
                <>
                  <NavItem to="/dashboard" label={t('nav_dashboard')} />
                  {role === 'admin' && <NavItem to="/admin" label={t('nav_admin')} />}
                  <NavItem to="/affiliate" label={t('nav_affiliate')} />
                </>
              ) : (
                <NavItem to="/login" label={t('login')} />
              )}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-white dark:bg-navy-900 border-t border-slate-200 dark:border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img src="/logo.png" alt={t('brand')} className="w-9 h-9 rounded-xl" />
              <span className="font-extrabold font-arabic text-lg">{t('brand')}</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-arabic leading-relaxed">{t('footer_about')}</p>
          </div>
          <div>
            <h4 className="font-bold font-arabic mb-3">{t('nav_categories')}</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400 font-arabic">
              <li><Link to="/categories" className="hover:text-teal-500">{t('browse_categories')}</Link></li>
              <li><Link to="/cities" className="hover:text-teal-500">{t('explore_cities')}</Link></li>
              <li><Link to="/deals" className="hover:text-teal-500">{t('nav_deals')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold font-arabic mb-3">{t('brand')}</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400 font-arabic">
              <li><Link to="/blog" className="hover:text-teal-500">{t('nav_blog')}</Link></li>
              <li><Link to="/pricing" className="hover:text-teal-500">{t('nav_pricing')}</Link></li>
              <li><Link to="/affiliate" className="hover:text-teal-500">{t('nav_affiliate')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold font-arabic mb-3">{t('add_business')}</h4>
            <Link to="/merchants/register" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 text-sm font-bold font-arabic hover:bg-teal-500/20">
              <Store className="w-4 h-4" />{t('join_now')}
            </Link>
          </div>
        </div>
        <div className="border-t border-slate-200 dark:border-white/10 py-4 text-center text-xs text-slate-400 font-arabic">
          © 2026 {t('brand')} — جميع الحقوق محفوظة
        </div>
      </footer>

      <StickyCTA />
      <ExitIntentPopup />
      <AIAssistant />
    </div>
  );
}
