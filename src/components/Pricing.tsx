import { CheckCircle2, Zap, Building2, Crown } from 'lucide-react';

const openAuth = () => document.dispatchEvent(new CustomEvent('open-auth'));

interface PricingProps {
  onAuthClick?: () => void;
}

const plans = [
  {
    name: 'مجاني',
    nameEn: 'Free',
    price: '0',
    period: '/شهر',
    desc: 'ابدأ رحلتك مع الذكاء الاصطناعي',
    icon: Zap,
    iconBg: 'bg-white/10',
    iconColor: 'text-white/70',
    badge: null,
    features: [
      '100 رسالة في الشهر',
      'وصول لنموذجين أساسيين',
      'تاريخ المحادثات (7 أيام)',
      'دعم عبر البريد الإلكتروني',
    ],
    cta: 'ابدأ مجاناً',
    ctaStyle: 'glass border border-white/20 text-white hover:bg-white/10',
    highlight: false,
    action: 'auth',
  },
  {
    name: 'أعمال',
    nameEn: 'Business',
    price: '299',
    period: 'ر.س/شهر',
    desc: 'للشركات الصغيرة والمتوسطة',
    icon: Building2,
    iconBg: 'bg-orange-500/20',
    iconColor: 'text-orange-400',
    badge: 'الأكثر شيوعاً',
    features: [
      'رسائل غير محدودة',
      'وصول لجميع النماذج المتاحة',
      'تاريخ المحادثات (90 يوم)',
      'API للتكامل مع أنظمتك',
      'لوحة تحليلات متقدمة',
      'دعم أولوي على مدار الساعة',
      '5 حسابات فريق',
    ],
    cta: 'ابدأ تجربة 14 يوم مجاناً',
    ctaStyle: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 glow-orange',
    highlight: true,
    action: 'auth',
  },
  {
    name: 'مؤسسي',
    nameEn: 'Enterprise',
    price: 'مخصص',
    period: '',
    desc: 'للشركات الكبيرة والمؤسسات',
    icon: Crown,
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-400',
    badge: null,
    features: [
      'كل مميزات خطة الأعمال',
      'نشر خاص على السحابة',
      'تدريب نماذج مخصصة',
      'SLA مضمون 99.9%',
      'مدير حساب مخصص',
      'حسابات فريق غير محدودة',
      'تكامل SAP/Oracle/Salesforce',
    ],
    cta: 'تواصل مع فريق المبيعات',
    ctaStyle: 'glass border border-amber-500/30 text-amber-300 hover:bg-amber-500/10',
    highlight: false,
    action: 'contact',
  },
];

export default function Pricing({ onAuthClick }: PricingProps) {
  const handleAction = (action: string) => {
    if (action === 'auth') {
      openAuth();
    } else if (action === 'contact') {
      const el = document.getElementById('contact');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="pricing" className="py-24 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[400px] h-[400px] rounded-full bg-orange-500/4 blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-amber-500/20 mb-6">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 text-sm font-arabic font-medium">خطط الأسعار</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-arabic text-white mb-5">
            أسعار <span className="text-gradient">شفافة وعادلة</span>
          </h2>
          <p className="text-white/55 text-lg font-arabic max-w-xl mx-auto">
            ابدأ مجاناً وانتقل للخطة المناسبة لنمو شركتك
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-2xl p-8 transition-all duration-300 ${
                plan.highlight
                  ? 'bg-gradient-to-b from-orange-500/15 to-transparent border-2 border-orange-500/40 scale-105 shadow-2xl shadow-orange-500/20'
                  : 'glass-card border border-white/8 hover:border-white/15'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold font-arabic whitespace-nowrap">
                  {plan.badge}
                </div>
              )}

              <div className={`w-12 h-12 rounded-xl ${plan.iconBg} flex items-center justify-center mb-5`}>
                <plan.icon className={`w-6 h-6 ${plan.iconColor}`} />
              </div>

              <h3 className="text-xl font-bold text-white font-arabic mb-1">{plan.name}</h3>
              <p className="text-white/50 text-sm font-arabic mb-5">{plan.desc}</p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-white font-arabic">{plan.price}</span>
                {plan.period && (
                  <span className="text-white/50 font-arabic text-sm">{plan.period}</span>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-2.5">
                    <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlight ? 'text-orange-400' : 'text-emerald-400'}`} />
                    <span className="text-white/70 font-arabic text-sm">{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleAction(plan.action)}
                className={`w-full py-3.5 rounded-xl font-bold font-arabic text-sm transition-all duration-300 ${plan.ctaStyle}`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-white/40 text-sm font-arabic mt-8">
          جميع الأسعار بالريال السعودي وتشمل ضريبة القيمة المضافة • يمكن الإلغاء في أي وقت
        </p>
      </div>
    </section>
  );
}
