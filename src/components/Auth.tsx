import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { getErrorMessage } from '../lib/errors';
import { X, Mail, Lock, User, ArrowLeft } from 'lucide-react';

interface AuthProps {
  onClose: () => void;
}

type Mode = 'login' | 'signup';

export default function Auth({ onClose }: AuthProps) {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error: signupError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
          },
        });
        if (signupError) throw signupError;
        setSuccess('تم إنشاء حسابك بنجاح! يمكنك الآن تسجيل الدخول.');
        setMode('login');
        setPassword('');
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) throw loginError;
        onClose();
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      if (msg.includes('Invalid login credentials')) {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      } else if (msg.includes('User already registered')) {
        setError('هذا البريد الإلكتروني مسجل مسبقاً');
      } else if (msg.includes('Password should be')) {
        setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
    setSuccess('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md glass-card rounded-3xl border border-white/10 p-8 animate-slide-up">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-8 h-8 rounded-lg glass border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-4 glow-orange">
            <User className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white font-arabic">
            {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'}
          </h2>
          <p className="text-white/50 font-arabic text-sm mt-2">
            {mode === 'login'
              ? 'أدخل بياناتك للوصول إلى حسابك'
              : 'أنشئ حسابك وابدأ رحلتك معنا'}
          </p>
        </div>

        {/* Success message */}
        {success && (
          <div className="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-arabic text-sm text-center">
            {success}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 font-arabic text-sm text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-white/70 font-arabic text-sm mb-2">الاسم الكامل</label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="محمد أحمد"
                  className="w-full pr-10 pl-4 py-3 rounded-xl glass border border-white/10 text-white placeholder-white/30 font-arabic text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-white/70 font-arabic text-sm mb-2">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@company.com"
                dir="ltr"
                className="w-full pr-10 pl-4 py-3 rounded-xl glass border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/70 font-arabic text-sm mb-2">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="w-full pr-10 pl-4 py-3 rounded-xl glass border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold font-arabic text-sm hover:from-orange-600 hover:to-orange-700 transition-all duration-300 glow-orange disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <>
                {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء الحساب'}
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Switch mode */}
        <div className="mt-6 text-center">
          <span className="text-white/50 font-arabic text-sm">
            {mode === 'login' ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
          </span>
          <button
            onClick={switchMode}
            className="text-orange-400 font-arabic text-sm font-semibold hover:text-orange-300 mr-2 transition-colors"
          >
            {mode === 'login' ? 'إنشاء حساب' : 'تسجيل الدخول'}
          </button>
        </div>
      </div>
    </div>
  );
}
