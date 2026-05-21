import { Brain, Zap, Shield, Globe, BarChart3, Headphones } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'نماذج AI متعددة',
    desc: 'وصول فوري لأحدث نماذج الذكاء الاصطناعي من GPT-4 وClaude وGemini وغيرها في منصة واحدة.',
    color: 'from-orange-500/20 to-orange-600/10',
    border: 'border-orange-500/20',
    iconBg: 'bg-orange-500/20 text-orange-400',
  },
  {
    icon: Globe,
    title: 'دعم كامل للعربية',
    desc: 'نماذج مُحسّنة للغة العربية تفهم السياق الثقافي وتنتج محتوى عالي الجودة.',
    color: 'from-blue-500/20 to-blue-600/10',
    border: 'border-blue-500/20',
    iconBg: 'bg-blue-500/20 text-blue-400',
  },
  {
    icon: Zap,
    title: 'أتمتة المهام',
    desc: 'أتمتة العمليات المتكررة وتوفير وقت فريقك للتركيز على المهام الإبداعية والاستراتيجية.',
    color: 'from-emerald-500/20 to-emerald-600/10',
    border: 'border-emerald-500/20',
    iconBg: 'bg-emerald-500/20 text-emerald-400',
  },
  {
    icon: Shield,
    title: 'أمان وخصوصية',
    desc: 'بياناتك محمية بأعلى معايير التشفير والأمان، مع الامتثال الكامل للوائح المحلية والدولية.',
    color: 'from-amber-500/20 to-amber-600/10',
    border: 'border-amber-500/20',
    iconBg: 'bg-amber-500/20 text-amber-400',
  },
  {
    icon: BarChart3,
    title: 'تحليلات متقدمة',
    desc: 'لوحة تحكم شاملة تمنحك رؤية كاملة على أداء الفريق وتحليل البيانات في الوقت الفعلي.',
    color: 'from-cyan-500/20 to-cyan-600/10',
    border: 'border-cyan-500/20',
    iconBg: 'bg-cyan-500/20 text-cyan-400',
  },
  {
    icon: Headphones,
    title: 'دعم على مدار الساعة',
    desc: 'فريق دعم متخصص يتحدث العربية جاهز لمساعدتك في أي وقت وحل أي مشكلة.',
    color: 'from-rose-500/20 to-rose-600/10',
    border: 'border-rose-500/20',
    iconBg: 'bg-rose-500/20 text-rose-400',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full bg-orange-500/3 blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-blue-500/20 mb-6">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 text-sm font-arabic font-medium">لماذا AI Hub Arabia؟</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-arabic text-white mb-5">
            كل ما تحتاجه في <span className="text-gradient">منصة واحدة</span>
          </h2>
          <p className="text-white/55 text-lg font-arabic max-w-xl mx-auto">
            أدوات متكاملة مصممة خصيصاً للشركات العربية لتسريع التحول الرقمي
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className={`relative p-6 rounded-2xl glass-card border ${f.border} group hover:scale-[1.02] transition-all duration-300`}
            >
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative">
                <div className={`w-12 h-12 rounded-xl ${f.iconBg} flex items-center justify-center mb-4`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white font-arabic mb-2">{f.title}</h3>
                <p className="text-white/55 font-arabic text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
