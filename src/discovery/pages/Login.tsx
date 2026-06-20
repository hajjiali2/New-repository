import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Mail, Lock, User as UserIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getErrorMessage } from '../../lib/errors';
import { useLocale } from '../context';
import SEO from '../components/SEO';

export default function Login() {
  const { t } = useLocale();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setInfo(''); setLoading(true);
    try {
      if (mode === 'register') {
        const { error: err } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
        if (err) throw err;
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) { setInfo('تم إنشاء الحساب. سجّل الدخول الآن.'); setMode('login'); return; }
        navigate('/dashboard');
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg.includes('Invalid login') ? 'البريد أو كلمة المرور غير صحيحة' : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <SEO title={mode === 'login' ? t('login') : t('register')} />
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10 p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mx-auto mb-3">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold font-arabic">{mode === 'login' ? t('login') : t('register')}</h1>
        </div>

        {info && <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-arabic text-center">{info}</div>}
        {error && <div className="mb-4 p-3 rounded-lg bg-rose-500/10 text-rose-500 text-sm font-arabic text-center">{error}</div>}

        <form onSubmit={submit} className="space-y-4">
          {mode === 'register' && (
            <div className="relative">
              <UserIcon className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-slate-400" />
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="الاسم الكامل" required
                className="w-full ps-10 pe-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 font-arabic text-sm focus:outline-none focus:border-teal-400" />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-slate-400" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد الإلكتروني" required dir="ltr"
              className="w-full ps-10 pe-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 text-sm focus:outline-none focus:border-teal-400" />
          </div>
          <div className="relative">
            <Lock className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-slate-400" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور" required dir="ltr"
              className="w-full ps-10 pe-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 text-sm focus:outline-none focus:border-teal-400" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold font-arabic hover:from-teal-600 hover:to-emerald-700 transition-all disabled:opacity-50">
            {loading ? '...' : (mode === 'login' ? t('login') : t('register'))}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 font-arabic mt-5">
          {mode === 'login' ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} className="text-teal-600 dark:text-teal-400 font-bold mx-1 hover:underline">
            {mode === 'login' ? t('register') : t('login')}
          </button>
        </p>
      </div>
    </div>
  );
}
