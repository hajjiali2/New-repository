import { useState } from 'react';
import { Building2, User, CheckCircle2, ArrowLeft } from 'lucide-react';

const companySolutions = [
  {
    title: 'توليد المحتوى التسويقي',
    desc: 'أنشئ محتوى تسويقياً احترافياً بالعربية والإنجليزية في ثوانٍ - إعلانات، منشورات، وصف منتجات.',
  },
  {
    title: 'خدمة العملاء الذكية',
    desc: 'روبوت محادثة يفهم العربية ويرد على استفسارات العملاء على مدار الساعة بدقة عالية.',
  },
  {
    title: 'تحليل البيانات والتقارير',
    desc: 'حوّل بياناتك الخام إلى تقارير تحليلية شاملة مع رؤى استراتيجية قابلة للتنفيذ.',
  },
  {
    title: 'أتمتة سير العمل',
    desc: 'أتمتة العمليات الداخلية من الموارد البشرية إلى المحاسبة وتوفير ساعات عمل يومياً.',
  },
];

const individualSolutions = [
  {
    title: 'مساعد الكتابة الإبداعية',
    desc: 'احصل على مساعدة في كتابة المقالات، الكتب، القصص، والمحتوى الإبداعي بأسلوبك الخاص.',
  },
  {
    title: 'الترجمة والتلخيص',
    desc: 'ترجمة دقيقة لأي نص مع الحفاظ على السياق والمعنى، وتلخيص المستندات الطويلة فوراً.',
  },
  {
    title: 'الدراسة والبحث',
    desc: 'مساعد بحثي ذكي يساعدك في الدراسة والبحث الأكاديمي وفهم المفاهيم المعقدة.',
  },
  {
    title: 'تطوير المهارات',
    desc: 'تعلم مهارات جديدة بسرعة مع مرشد ذكاء اصطناعي يكيّف أسلوب التعليم مع احتياجاتك.',
  },
];

export default function Solutions() {
  const [active, setActive] = useState<'company' | 'individual'>('company');
  const solutions = active === 'company' ? companySolutions : individualSolutions;

  return (
    <section id="solutions" className="py-24 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[400px] rounded-full bg-blue-500/4 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-orange-500/20 mb-6">
            <Building2 className="w-4 h-4 text-orange-400" />
            <span className="text-orange-300 text-sm font-arabic font-medium">حلولنا</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-arabic text-white mb-5">
            حلول <span className="text-gradient">مصممة لك</span>
          </h2>
          <p className="text-white/55 text-lg font-arabic max-w-xl mx-auto">
            سواء كنت صاحب شركة أو فرداً، لدينا الحل المناسب لاحتياجاتك
          </p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-12">
          <div className="glass rounded-2xl p-1.5 flex gap-1">
            <button
              onClick={() => setActive('company')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-arabic font-semibold text-sm transition-all duration-300 ${
                active === 'company'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white glow-orange'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              للشركات
            </button>
            <button
              onClick={() => setActive('individual')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-arabic font-semibold text-sm transition-all duration-300 ${
                active === 'individual'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white glow-blue'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              للأفراد
            </button>
          </div>
        </div>

        {/* Solutions grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {solutions.map((sol, i) => (
            <div
              key={`${active}-${i}`}
              className="glass-card rounded-2xl p-6 border border-white/8 hover:border-orange-500/20 transition-all duration-300 group animate-slide-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex gap-4">
                <CheckCircle2 className={`w-6 h-6 flex-shrink-0 mt-0.5 ${active === 'company' ? 'text-orange-400' : 'text-blue-400'}`} />
                <div>
                  <h3 className="text-white font-bold font-arabic mb-2">{sol.title}</h3>
                  <p className="text-white/55 font-arabic text-sm leading-relaxed">{sol.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold font-arabic text-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 glow-orange hover:scale-105">
            استكشف جميع الحلول
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
