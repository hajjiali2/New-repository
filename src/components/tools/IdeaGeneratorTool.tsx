import { useState } from 'react';
import {
  Lightbulb, ArrowRight, Copy, Check, Download,
  TrendingUp, Zap, Star, DollarSign, ChevronRight,
  Briefcase, FileText, ShoppingBag, Megaphone, Tag,
} from 'lucide-react';
import { chatWithAI } from '../../lib/openrouter';

interface IdeaGeneratorToolProps {
  onBack: () => void;
}

interface Idea {
  title: string;
  description: string;
  difficulty: 'سهل' | 'متوسط' | 'صعب';
  income: string;
  tips: string;
}

const categories = [
  { id: 'business', label: 'أفكار أعمال', icon: Briefcase },
  { id: 'content', label: 'محتوى إبداعي', icon: FileText },
  { id: 'product', label: 'منتجات وخدمات', icon: ShoppingBag },
  { id: 'marketing', label: 'حملات تسويقية', icon: Megaphone },
  { id: 'names', label: 'أسماء وعلامات', icon: Tag },
];

const difficultyConfig: Record<string, { color: string; bg: string; icon: typeof Zap }> = {
  'سهل': { color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', icon: Zap },
  'متوسط': { color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30', icon: TrendingUp },
  'صعب': { color: 'text-rose-400', bg: 'bg-rose-500/15 border-rose-500/30', icon: Star },
};

const cardAccents = [
  { border: 'hover:border-orange-500/40', glow: 'hover:shadow-orange-500/10', dot: 'bg-orange-400', num: 'text-orange-400/30' },
  { border: 'hover:border-blue-500/40', glow: 'hover:shadow-blue-500/10', dot: 'bg-blue-400', num: 'text-blue-400/30' },
  { border: 'hover:border-emerald-500/40', glow: 'hover:shadow-emerald-500/10', dot: 'bg-emerald-400', num: 'text-emerald-400/30' },
  { border: 'hover:border-rose-500/40', glow: 'hover:shadow-rose-500/10', dot: 'bg-rose-400', num: 'text-rose-400/30' },
  { border: 'hover:border-teal-500/40', glow: 'hover:shadow-teal-500/10', dot: 'bg-teal-400', num: 'text-teal-400/30' },
  { border: 'hover:border-amber-500/40', glow: 'hover:shadow-amber-500/10', dot: 'bg-amber-400', num: 'text-amber-400/30' },
  { border: 'hover:border-sky-500/40', glow: 'hover:shadow-sky-500/10', dot: 'bg-sky-400', num: 'text-sky-400/30' },
  { border: 'hover:border-pink-500/40', glow: 'hover:shadow-pink-500/10', dot: 'bg-pink-400', num: 'text-pink-400/30' },
  { border: 'hover:border-lime-500/40', glow: 'hover:shadow-lime-500/10', dot: 'bg-lime-400', num: 'text-lime-400/30' },
  { border: 'hover:border-violet-500/40', glow: 'hover:shadow-violet-500/10', dot: 'bg-violet-400', num: 'text-violet-400/30' },
];

function parseIdeas(raw: string): Idea[] {
  try {
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].title) {
        return parsed as Idea[];
      }
    }
  } catch {
    // fall through to manual parse
  }

  // Fallback: split numbered lines
  const lines = raw.split('\n').filter((l) => l.trim());
  const ideas: Idea[] = [];
  let current: Partial<Idea> | null = null;

  for (const line of lines) {
    const numbered = line.match(/^(\d+)[.\-\)]\s*(.+)/);
    if (numbered) {
      if (current?.title) ideas.push(current as Idea);
      const parts = numbered[2].split(':');
      current = {
        title: parts[0].trim(),
        description: parts.slice(1).join(':').trim() || numbered[2].trim(),
        difficulty: 'متوسط',
        income: '',
        tips: '',
      };
    } else if (current) {
      current.description = (current.description || '') + ' ' + line.trim();
    }
  }
  if (current?.title) ideas.push(current as Idea);

  return ideas.length > 0
    ? ideas
    : [{ title: 'فكرة', description: raw.trim(), difficulty: 'متوسط', income: '', tips: '' }];
}

export default function IdeaGeneratorTool({ onBack }: IdeaGeneratorToolProps) {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('business');
  const [count, setCount] = useState('5');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [rawResult, setRawResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState('');

  const catLabel = categories.find((c) => c.id === category)?.label || category;

  const handleGenerate = async () => {
    if (!topic.trim() || loading) return;
    setLoading(true);
    setIdeas([]);
    setRawResult('');
    setError('');

    const prompt = `أنت مستشار أعمال خبير. قدّم ${count} أفكار إبداعية ومبتكرة لـ "${catLabel}" حول الموضوع: "${topic}".

أعد الإجابة كـ JSON array فقط بهذا الشكل (لا تضف أي نص خارج الـ JSON):
[
  {
    "title": "اسم الفكرة",
    "description": "وصف مختصر من جملتين يشرح الفكرة وكيف تعمل",
    "difficulty": "سهل" أو "متوسط" أو "صعب",
    "income": "مثال: 5,000 - 15,000 ر.س/شهر",
    "tips": "نصيحة عملية واحدة للبدء فوراً"
  }
]`;

    try {
      const reply = await chatWithAI([{ role: 'user', content: prompt }]);
      setRawResult(reply);
      const parsed = parseIdeas(reply);
      setIdeas(parsed);
    } catch (err: any) {
      const isKeyError = err.message === 'MISSING_KEY' || err.message === 'INVALID_KEY';
      setError(
        isKeyError
          ? 'مفتاح OpenRouter API غير مضبوط.\n\nالخطوات:\n1. سجّل في openrouter.ai\n2. انسخ مفتاح API\n3. ضعه في .env في المتغير VITE_OPENROUTER_API_KEY'
          : `حدث خطأ: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAll = async () => {
    const text = ideas
      .map(
        (idea, i) =>
          `${i + 1}. ${idea.title}\n${idea.description}\nالصعوبة: ${idea.difficulty}\nالدخل المتوقع: ${idea.income}\nنصيحة: ${idea.tips}`
      )
      .join('\n\n');
    await navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopyIdea = async (idea: Idea, index: number) => {
    const text = `${idea.title}\n${idea.description}\nالصعوبة: ${idea.difficulty}\nالدخل المتوقع: ${idea.income}\nنصيحة: ${idea.tips}`;
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleExport = () => {
    const lines = [
      `تقرير الأفكار - ${catLabel}`,
      `الموضوع: ${topic}`,
      `التاريخ: ${new Date().toLocaleDateString('ar-SA')}`,
      '─'.repeat(40),
      '',
      ...ideas.map(
        (idea, i) =>
          `${i + 1}. ${idea.title}\n   ${idea.description}\n   الصعوبة: ${idea.difficulty} | الدخل المتوقع: ${idea.income}\n   نصيحة: ${idea.tips}`
      ),
    ];
    const blob = new Blob([lines.join('\n\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `أفكار-${topic.slice(0, 20)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#060f33] pt-28 pb-16" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/50 hover:text-white font-arabic text-sm transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            رجوع
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-arabic leading-none">مولّد الأفكار</h2>
              <p className="text-white/40 font-arabic text-xs mt-0.5">أفكار إبداعية مدعومة بالذكاء الاصطناعي</p>
            </div>
          </div>
        </div>

        {/* Input card */}
        <div className="glass-card rounded-2xl border border-white/8 p-6 space-y-5 mb-8">
          {/* Category */}
          <div>
            <label className="block text-white/60 font-arabic text-xs mb-3 uppercase tracking-wider">نوع الأفكار</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const Icon = c.icon;
                return (
                  <button
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-arabic transition-all ${
                      category === c.id
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'glass border border-white/10 text-white/50 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-white/60 font-arabic text-xs mb-2 uppercase tracking-wider">الموضوع أو المجال</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleGenerate())}
              placeholder="مثال: تطبيق للصحة واللياقة في السعودية..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-white placeholder-white/25 font-arabic text-sm focus:outline-none focus:border-rose-500/50 transition-colors resize-none"
            />
          </div>

          {/* Count + Generate */}
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-white/60 font-arabic text-xs mb-2 uppercase tracking-wider">عدد الأفكار</label>
              <div className="flex gap-2">
                {['3', '5', '10'].map((n) => (
                  <button
                    key={n}
                    onClick={() => setCount(n)}
                    className={`px-4 py-2 rounded-xl text-sm font-arabic transition-all ${
                      count === n
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'glass border border-white/10 text-white/50 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 pt-5">
              <button
                onClick={handleGenerate}
                disabled={loading || !topic.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold font-arabic text-sm hover:from-rose-600 hover:to-rose-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <Lightbulb className="w-4 h-4" />
                    ولّد الأفكار
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 font-arabic text-sm whitespace-pre-wrap">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: Number(count) }).map((_, i) => (
              <div key={i} className="glass-card rounded-2xl border border-white/8 p-6 animate-pulse">
                <div className="h-4 bg-white/10 rounded-lg w-3/4 mb-3" />
                <div className="h-3 bg-white/6 rounded-lg w-full mb-2" />
                <div className="h-3 bg-white/6 rounded-lg w-5/6 mb-4" />
                <div className="flex gap-2">
                  <div className="h-6 bg-white/8 rounded-lg w-16" />
                  <div className="h-6 bg-white/8 rounded-lg w-24" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Ideas grid */}
        {!loading && ideas.length > 0 && (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-white/50 font-arabic text-sm">
                <span className="text-white font-bold">{ideas.length}</span> أفكار حول "{topic}"
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyAll}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass border border-white/10 text-white/60 hover:text-white hover:border-white/20 font-arabic text-xs transition-all"
                >
                  {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedAll ? 'تم النسخ' : 'نسخ الكل'}
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass border border-white/10 text-white/60 hover:text-white hover:border-white/20 font-arabic text-xs transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  تصدير
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ideas.map((idea, i) => {
                const accent = cardAccents[i % cardAccents.length];
                const diff = difficultyConfig[idea.difficulty] || difficultyConfig['متوسط'];
                const DiffIcon = diff.icon;

                return (
                  <div
                    key={i}
                    className={`group relative glass-card rounded-2xl border border-white/8 ${accent.border} p-6 transition-all duration-300 hover:shadow-xl ${accent.glow} hover:-translate-y-0.5 flex flex-col`}
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    {/* Background number watermark */}
                    <span className={`absolute top-4 left-5 text-7xl font-black ${accent.num} select-none leading-none`}>
                      {i + 1}
                    </span>

                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2 mb-3 relative">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${accent.dot}`} />
                        <h3 className="text-white font-bold font-arabic text-base leading-snug">{idea.title}</h3>
                      </div>
                      <span className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-arabic font-semibold border ${diff.bg} ${diff.color}`}>
                        <DiffIcon className="w-3 h-3" />
                        {idea.difficulty}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-white/60 font-arabic text-sm leading-relaxed mb-4 flex-1 relative">
                      {idea.description}
                    </p>

                    {/* Income */}
                    {idea.income && (
                      <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/15">
                        <DollarSign className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <div>
                          <p className="text-emerald-400 font-arabic text-xs font-semibold">الدخل المتوقع</p>
                          <p className="text-white/80 font-arabic text-sm">{idea.income}</p>
                        </div>
                      </div>
                    )}

                    {/* Tip */}
                    {idea.tips && (
                      <div className="mb-4 p-3 rounded-xl bg-white/4 border border-white/8">
                        <p className="text-white/40 font-arabic text-xs mb-1">نصيحة للبدء</p>
                        <p className="text-white/70 font-arabic text-xs leading-relaxed">{idea.tips}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyIdea(idea, i)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg glass border border-white/10 text-white/50 hover:text-white hover:border-white/20 font-arabic text-xs transition-all"
                      >
                        {copiedIndex === i ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedIndex === i ? 'تم' : 'نسخ'}
                      </button>
                      <button
                        onClick={() => {
                          setTopic(idea.title);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/20 text-white/60 hover:text-white font-arabic text-xs transition-all group"
                      >
                        استكشف هذه الفكرة أكثر
                        <ChevronRight className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Regenerate */}
            <div className="mt-8 text-center">
              <button
                onClick={handleGenerate}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass border border-rose-500/20 text-rose-300 hover:bg-rose-500/10 font-arabic text-sm transition-all"
              >
                <Lightbulb className="w-4 h-4" />
                توليد أفكار جديدة
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
