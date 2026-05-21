import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Menu, X, Zap, LogOut, CircleUser as UserCircle, LayoutGrid } from 'lucide-react';

interface NavbarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  user: User | null;
  onAuthClick: () => void;
  onSignOut: () => void;
  onDashboard: () => void;
}

const navLinks = [
  { id: 'hero', label: 'الرئيسية' },
  { id: 'features', label: 'المميزات' },
  { id: 'solutions', label: 'الحلول' },
  { id: 'pricing', label: 'الأسعار' },
  { id: 'contact', label: 'تواصل معنا' },
];

export default function Navbar({ activeSection, onNavigate, user, onAuthClick, onSignOut, onDashboard }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (id: string) => {
    onNavigate(id);
    setIsOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass border-b border-white/10 py-3' : 'py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => user ? onDashboard() : handleNav('hero')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center glow-orange">
              <Zap className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <div>
              <span className="text-white font-bold text-lg leading-none font-arabic">
                AI Hub
              </span>
              <span className="block text-orange-400 text-xs font-arabic">Arabia</span>
            </div>
          </div>

          {/* Desktop nav */}
          {!user && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNav(link.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium font-arabic transition-all duration-200 ${
                    activeSection === link.id
                      ? 'text-orange-400 bg-orange-500/10'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          )}

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <button
                  onClick={onDashboard}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold font-arabic hover:from-orange-600 hover:to-orange-700 transition-all duration-200 glow-orange"
                >
                  <LayoutGrid className="w-4 h-4" />
                  الأدوات
                </button>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-white/10">
                  <UserCircle className="w-4 h-4 text-orange-400" />
                  <span className="text-white/80 text-sm font-arabic truncate max-w-[120px]">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                </div>
                <button
                  onClick={onSignOut}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/10 text-white/70 text-sm font-arabic hover:text-white hover:bg-white/10 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  خروج
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onAuthClick}
                  className="px-5 py-2.5 rounded-xl glass border border-white/15 text-white text-sm font-semibold font-arabic hover:bg-white/10 transition-all duration-200"
                >
                  تسجيل الدخول
                </button>
                <button
                  onClick={onAuthClick}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold font-arabic hover:from-orange-600 hover:to-orange-700 transition-all duration-200 glow-orange"
                >
                  ابدأ الآن
                </button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-white/80 hover:text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/10">
            <div className="flex flex-col gap-1 pt-4">
              {!user && navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNav(link.id)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium font-arabic text-right transition-all duration-200 ${
                    activeSection === link.id
                      ? 'text-orange-400 bg-orange-500/10'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <div className={`${user ? '' : 'mt-3 pt-3 border-t border-white/10'} flex flex-col gap-2`}>
                {user ? (
                  <>
                    <div className="flex items-center gap-2 px-4 py-2">
                      <UserCircle className="w-4 h-4 text-orange-400" />
                      <span className="text-white/80 text-sm font-arabic truncate">
                        {user.user_metadata?.full_name || user.email}
                      </span>
                    </div>
                    <button
                      onClick={() => { onDashboard(); setIsOpen(false); }}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-arabic text-sm font-semibold justify-center"
                    >
                      <LayoutGrid className="w-4 h-4" />
                      الأدوات
                    </button>
                    <button
                      onClick={() => { onSignOut(); setIsOpen(false); }}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg text-white/70 font-arabic text-sm hover:bg-white/5 justify-center"
                    >
                      <LogOut className="w-4 h-4" />
                      تسجيل الخروج
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { onAuthClick(); setIsOpen(false); }}
                      className="px-5 py-3 rounded-xl glass border border-white/15 text-white text-sm font-semibold font-arabic text-center"
                    >
                      تسجيل الدخول
                    </button>
                    <button
                      onClick={() => { onAuthClick(); setIsOpen(false); }}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold font-arabic text-center"
                    >
                      ابدأ الآن
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
