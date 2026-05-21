import { User } from '@supabase/supabase-js';
import { MessageSquare, PenTool, Languages, BarChart3, ArrowRight } from 'lucide-react';

interface DashboardProps {
  user: User | null;
  onOpenTool: (tool: string) => void;
  onBack: () => void;
}

const tools = [
  {
    id: 'chat',
    icon: MessageSquare,
    title: 'محادثة AI',
    desc: 'تحدث مع المساعد الذكي بأي موضوع',
    gradient: 'from-orange-500 to-orange-600',
    glow: 'glow-orange',
    iconBg: 'bg-orange-500/20',
    iconColor: 'text-orange-400',
  },
  {
    id: 'writer',
    icon: PenTool,
    title: 'كاتب المحتوى',
    desc: 'أنشئ محتوى تسويقي ومقالات احترافية',
    gradient: 'from-blue-500 to-blue-600',
    glow: 'glow-blue',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
  },
  {
    id: 'translator',
    icon: Languages,
    title: 'المترجم الذكي',
    desc: 'ترجمة دقيقة تحافظ على السياق والمعنى',
    gradient: 'from-emerald-500 to-emerald-600',
    glow: '',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
  },
  {
    id: 'analyzer',
    icon: BarChart3,
    title: 'محلل البيانات',
    desc: 'حلّل بياناتك واحصل على رؤى قابلة للتنفيذ',
    gradient: 'from-amber-500 to-amber-600',
    glow: '',
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-400',
  },
];

export default function Dashboard({ user, onOpenTool, onBack }: DashboardProps) {
  return (
    <div className="min-h-screen bg-[#060f33] pt-28 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/50 hover:text-white font-arabic text-sm mb-6 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            العودة للرئيسية
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold font-arabic text-white mb-3">
            مرحباً، <span className="text-gradient">{user?.user_metadata?.full_name || 'صديقنا'}</span>
          </h1>
          <p className="text-white/55 font-arabic text-lg">
            اختر أداة للبدء
          </p>
        </div>

        {/* Tools grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onOpenTool(tool.id)}
              className="group text-right p-6 rounded-2xl glass-card border border-white/8 hover:border-white/20 transition-all duration-300 hover:scale-[1.02]"
            >
              <div className={`w-14 h-14 rounded-2xl ${tool.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <tool.icon className={`w-7 h-7 ${tool.iconColor}`} />
              </div>
              <h3 className="text-xl font-bold text-white font-arabic mb-2">{tool.title}</h3>
              <p className="text-white/50 font-arabic text-sm leading-relaxed">{tool.desc}</p>
              <div className="mt-4 flex items-center gap-2 text-sm font-arabic text-white/40 group-hover:text-orange-400 transition-colors">
                ابدأ الآن
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
