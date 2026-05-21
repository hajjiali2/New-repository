import { Zap, Twitter, Linkedin, Instagram } from 'lucide-react';

const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

const openAuth = () =>
  document.dispatchEvent(new CustomEvent('open-auth'));

const cols = [
  {
    title: 'المنصة',
    links: [
      { label: 'المميزات', action: () => scrollTo('features') },
      { label: 'الحلول', action: () => scrollTo('solutions') },
      { label: 'الأسعار', action: () => scrollTo('pricing') },
      { label: 'التوثيق', action: openAuth },
      { label: 'حالة الخدمة', action: openAuth },
    ],
  },
  {
    title: 'الشركة',
    links: [
      { label: 'من نحن', action: openAuth },
      { label: 'المدونة', action: openAuth },
      { label: 'الوظائف', action: openAuth },
      { label: 'اتصل بنا', action: () => scrollTo('contact') },
      { label: 'الشراكات', action: openAuth },
    ],
  },
  {
    title: 'الدعم',
    links: [
      { label: 'مركز المساعدة', action: openAuth },
      { label: 'الأسئلة الشائعة', action: openAuth },
      { label: 'سياسة الخصوصية', action: openAuth },
      { label: 'شروط الاستخدام', action: openAuth },
    ],
  },
];

const socials = [
  { Icon: Twitter, href: 'https://twitter.com' },
  { Icon: Linkedin, href: 'https://linkedin.com' },
  { Icon: Instagram, href: 'https://instagram.com' },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/8 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" fill="currentColor" />
              </div>
              <span className="text-white font-bold font-arabic">AI Hub Arabia</span>
            </div>
            <p className="text-white/45 font-arabic text-sm leading-relaxed">
              المنصة الأولى عربياً للذكاء الاصطناعي للشركات ورواد الأعمال.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {socials.map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg glass border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/20 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {cols.map((col, i) => (
            <div key={i}>
              <h4 className="text-white font-bold font-arabic mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map(({ label, action }, li) => (
                  <li key={li}>
                    <button
                      onClick={action}
                      className="text-white/45 hover:text-white font-arabic text-sm transition-colors duration-200"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/35 font-arabic text-sm">
            © 2024 AI Hub Arabia. جميع الحقوق محفوظة.
          </p>
          <p className="text-white/35 font-arabic text-sm">
            صُنع بـ ❤️ في المملكة العربية السعودية
          </p>
        </div>
      </div>
    </footer>
  );
}
