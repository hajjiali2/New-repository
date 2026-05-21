import { useState } from 'react';
import { Lightbulb, ArrowRight, Copy, Check } from 'lucide-react';
import { chatWithAI } from '../../lib/openrouter';

interface IdeaGeneratorToolProps {
  onBack: () => void;
}

const categories = [
  { id: 'business', label: 'أفكار أعمال' },
  { id: 'content', label: 'محتوى إبداعي' },
  { id: 'product', label: 'منتجات وخدمات' },
  { id: 'marketing', label: 'حملات تسويقية' },
  { id: 'names', label: 'أسماء وعلامات تجارية' },
];

export default function IdeaGeneratorTool({ onBack }: IdeaGeneratorToolProps) {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('business');
  const [count, setCount] = useState('5');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim() || loading) return;
    setLoading(true);
    setResult('');

    const catLabel = categories.find((c) => c.id === category)?.label || category;
    const prompt = `قدّم لي ${count} أفكار إبداعية ومبتكرة لـ "${catLabel}" حول الموضوع: "${topic}".
اجعل كل فكرة مختصرة وواضحة مع شرح قصير جداً لها.
قدّمها بصيغة مرقّمة باللغة العربية.`;

    try {
      const reply = await chatWithAI([{ role: 'user', content: prompt }]);
      setResult(reply);
    } catch (err: any) {
      const isKeyError = err.message === 'MISSING_KEY' || err.message === 'INVALID_KEY';
      setResult(
        isKeyError
          ? 'مفتاح OpenRouter API غير مضبوط.\n\nالخطوات:\n1. سجّل في openrouter.ai\n2. انسخ مفتاح API\n3. ضعه في .env في المتغير VITE_OPENROUTER_API_KEY'
          : `حدث خطأ: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#060f33] pt-28 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
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
            <h2 className="text-lg font-bold text-white font-arabic">مولّد الأفكار</h2>
          </div>
        </div>

        <div className="glass-card rounded-2xl border border-white/8 p-6 space-y-5">
          <div>
            <label className="block text-white/70 font-arabic text-sm mb-3">نوع الأفكار</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-arabic transition-all ${
                    category === c.id
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'glass border border-white/10 text-white/50 hover:text-white hover:border-white/20'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-white/70 font-arabic text-sm mb-2">الموضوع أو المجال</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="مثال: تطبيق للصحة واللياقة في السعودية..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-white placeholder-white/30 font-arabic text-sm focus:outline-none focus:border-rose-500/50 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-white/70 font-arabic text-sm mb-3">عدد الأفكار</label>
            <div className="flex gap-2">
              {['3', '5', '10'].map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`px-5 py-2 rounded-xl text-sm font-arabic transition-all ${
                    count === n
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'glass border border-white/10 text-white/50 hover:text-white hover:border-white/20'
                  }`}
                >
                  {n} أفكار
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold font-arabic text-sm hover:from-rose-600 hover:to-rose-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="animate-spin inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
            ) : (
              'ولّد الأفكار'
            )}
          </button>
        </div>

        {result && (
          <div className="mt-6 glass-card rounded-2xl border border-rose-500/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold font-arabic">الأفكار المقترحة</h3>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-sm font-arabic text-white/50 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-rose-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'تم النسخ' : 'نسخ'}
              </button>
            </div>
            <div className="text-white/80 font-arabic text-sm leading-relaxed whitespace-pre-wrap">
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
