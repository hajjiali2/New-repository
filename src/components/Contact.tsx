import { useState } from 'react';
import { Send, Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FormData {
  name: string;
  email: string;
  company: string;
  message: string;
}

export default function Contact() {
  const [form, setForm] = useState<FormData>({ name: '', email: '', company: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setLoading(true);
    setError('');

    const { error: dbError } = await supabase.from('contact_requests').insert([{
      name: form.name,
      email: form.email,
      company: form.company,
      message: form.message,
    }]);

    setLoading(false);
    if (dbError) {
      setError('حدث خطأ أثناء إرسال رسالتك. يرجى المحاولة مرة أخرى.');
    } else {
      setSuccess(true);
      setForm({ name: '', email: '', company: '', message: '' });
    }
  };

  return (
    <section id="contact" className="py-24 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-orange-500/5 blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-orange-500/20 mb-6">
            <Mail className="w-4 h-4 text-orange-400" />
            <span className="text-orange-300 text-sm font-arabic font-medium">تواصل معنا</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-arabic text-white mb-5">
            نحن هنا <span className="text-gradient">لمساعدتك</span>
          </h2>
          <p className="text-white/55 text-lg font-arabic max-w-xl mx-auto">
            تواصل معنا وسيرد عليك فريقنا خلال 24 ساعة
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Contact info */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {[
              { icon: Mail, label: 'البريد الإلكتروني', value: 'hello@aihub-arabia.com' },
              { icon: Phone, label: 'الهاتف', value: '+966 11 XXX XXXX' },
              { icon: MapPin, label: 'المقر', value: 'الرياض، المملكة العربية السعودية' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-5 glass-card rounded-2xl border border-white/8">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <div className="text-white/50 text-sm font-arabic mb-1">{item.label}</div>
                  <div className="text-white font-arabic font-medium">{item.value}</div>
                </div>
              </div>
            ))}

            {/* Social proof */}
            <div className="p-5 glass-card rounded-2xl border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-300 font-arabic font-semibold">استجابة سريعة</span>
              </div>
              <p className="text-white/55 font-arabic text-sm">
                متوسط وقت الاستجابة لدينا أقل من 2 ساعة خلال ساعات العمل
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            {success ? (
              <div className="flex flex-col items-center justify-center h-full gap-5 p-10 glass-card rounded-2xl border border-emerald-500/20">
                <CheckCircle2 className="w-16 h-16 text-emerald-400" />
                <h3 className="text-xl font-bold text-white font-arabic">تم إرسال رسالتك بنجاح!</h3>
                <p className="text-white/60 font-arabic text-center">
                  شكراً لتواصلك معنا. سيرد عليك فريقنا في أقرب وقت ممكن.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="px-6 py-3 rounded-xl bg-emerald-500/20 text-emerald-300 font-arabic font-semibold hover:bg-emerald-500/30 transition-all"
                >
                  إرسال رسالة أخرى
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="glass-card rounded-2xl border border-white/8 p-8 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-white/70 font-arabic text-sm mb-2">الاسم الكامل *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="محمد أحمد"
                      className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-white placeholder-white/30 font-arabic text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 font-arabic text-sm mb-2">البريد الإلكتروني *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="example@company.com"
                      className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-white placeholder-white/30 font-arabic text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/70 font-arabic text-sm mb-2">اسم الشركة</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="شركة المثال للتقنية"
                    className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-white placeholder-white/30 font-arabic text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-arabic text-sm mb-2">رسالتك *</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="أخبرنا كيف يمكننا مساعدتك..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-white placeholder-white/30 font-arabic text-sm focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-sm font-arabic">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold font-arabic text-base hover:from-orange-600 hover:to-orange-700 transition-all duration-300 glow-orange disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      إرسال الرسالة
                      <Send className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
