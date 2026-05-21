import { Zap, Twitter, Linkedin, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/8 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" fill="currentColor" />
              </div>
              <div>
                <span className="text-white font-bold font-arabic">AI Hub Arabia</span>
              </div>
            </div>
            <p className="text-white/45 font-arabic text-sm leading-relaxed">
              المنصة الأولى عربياً للذكاء الاصطناعي للشركات ورواد الأعمال.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[Twitter, Linkedin, Instagram].map((Icon, i) => (
                <button
                  key={i}
                  className="w-9 h-9 rounded-lg glass border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/20 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: 'المنصة',
              links: ['المميزات', 'الحلول', 'الأسعار', 'التوثيق', 'حالة الخدمة'],
            },
            {
              title: 'الشركة',
              links: ['من نحن', 'المدونة', 'الوظائف', 'اتصل بنا', 'الشراكات'],
            },
            {
              title: 'الدعم',
              links: ['مركز المساعدة', 'الأسئلة الشائعة', 'سياسة الخصوصية', 'شروط الاستخدام'],
            },
          ].map((col, i) => (
            <div key={i}>
              <h4 className="text-white font-bold font-arabic mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link, li) => (
                  <li key={li}>
                    <button className="text-white/45 hover:text-white font-arabic text-sm transition-colors duration-200">
                      {link}
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
