import { useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { ArrowLeft, Sparkles, TrendingUp, Users, Building2 } from 'lucide-react';

const openAuth = () => document.dispatchEvent(new CustomEvent('open-auth'));

interface HeroProps {
  onNavigate: (section: string) => void;
  onDashboard: () => void;
  user: User | null;
}

export default function Hero({ onNavigate, onDashboard, user }: HeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(249, 115, 22, ${p.opacity})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Animated background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-orange-500/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-navy-800/50 blur-[80px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-orange-500/20 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span className="text-orange-300 text-sm font-arabic font-medium">
              المنصة الأولى عربياً للذكاء الاصطناعي
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold font-arabic leading-tight mb-6 animate-slide-up">
            <span className="text-white">أطلق قوة </span>
            <span className="text-gradient">الذكاء الاصطناعي</span>
            <br />
            <span className="text-white">في شركتك اليوم</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 font-arabic leading-relaxed animate-slide-up">
            منصة متكاملة تجمع أقوى نماذج الذكاء الاصطناعي لتحويل طريقة عمل شركتك،
            زيادة إنتاجيتك، وتسريع نموك في السوق العربي والعالمي.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up">
            <button
              onClick={() => user ? onDashboard() : openAuth()}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold font-arabic text-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 glow-orange hover:scale-105"
            >
              {user ? 'الذهاب للأدوات' : 'ابدأ مجاناً'}
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                onNavigate('solutions');
                document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl glass border border-white/10 text-white font-semibold font-arabic text-lg hover:bg-white/10 transition-all duration-300"
            >
              استكشف الحلول
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { icon: Building2, value: '+500', label: 'شركة تستخدمنا' },
              { icon: Users, value: '+10K', label: 'مستخدم نشط' },
              { icon: TrendingUp, value: '3x', label: 'تضاعف الإنتاجية' },
            ].map((stat, i) => (
              <div key={i} className="glass-card rounded-2xl p-4 text-center">
                <stat.icon className="w-5 h-5 text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white font-arabic">{stat.value}</div>
                <div className="text-xs text-white/50 font-arabic mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <div className="w-6 h-10 rounded-full border border-white/20 flex items-start justify-center pt-2">
          <div className="w-1.5 h-3 rounded-full bg-orange-400/60" />
        </div>
      </div>
    </section>
  );
}
