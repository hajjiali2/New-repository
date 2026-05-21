import { useState } from 'react';
import { BarChart3, ArrowRight, Copy, Check } from 'lucide-react';
import { chatWithAI } from '../../lib/openrouter';

interface AnalyzerToolProps {
  onBack: () => void;
}

const analysisTypes = [
  { id: 'sentiment', label: 'تحليل المشاعر' },
  { id: 'summary', label: 'تلخيص' },
  { id: 'keywords', label: 'استخراج الكلمات المفتاحية' },
  { id: 'insights', label: 'رؤى وتوصيات' },
];

export default function AnalyzerTool({ onBack }: AnalyzerToolProps) {
  const [text, setText] = useState('');
  const [analysisType, setAnalysisType] = useState('sentiment');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setResult('');

    const typeLabel = analysisTypes.find((t) => t.id === analysisType)?.label || analysisType;

    const prompts: Record<string, string> = {
      sentiment: `حلّل المشاعر في النص التالي. حدد هل المشاعر إيجابية أم سلبية أم محايدة مع نسبة مئوية لكل منها وشرح مختصر:

${text}`,
      summary: `لخّص النص التالي في نقاط مختصرة وواضحة باللغة العربية:

${text}`,
      keywords: `استخرج الكلمات المفتاحية والعبارات المهمة من النص التالي مع تصنيفها:

${text}`,
      insights: `حلّل النص التالي وقدّم رؤى وتوصيات قابلة للتنفيذ باللغة العربية:

${text}`,
    };

    try {
      const reply = await chatWithAI([{ role: 'user', content: prompts[analysisType] || prompts.sentiment }]);
      setResult(reply);
    } catch (err: any) {
      const isKeyError = err.message === 'MISSING_KEY' || err.message === 'INVALID_KEY';
      setResult(
        isKeyError
          ? 'مفتاح OpenRouter API غير مضبوط.\n\nالخطوات:\n1. سجّل في openrouter.ai\n2. انسخ مفتاح API من قسم Keys\n3. ضعه في ملف .env في المتغير VITE_OPENROUTER_API_KEY'
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
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-lg font-bold text-white font-arabic">محلل البيانات</h2>
          </div>
        </div>

        {/* Analysis type */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {analysisTypes.map((at) => (
            <button
              key={at.id}
              onClick={() => setAnalysisType(at.id)}
              className={`px-4 py-2 rounded-xl text-sm font-arabic transition-all ${
                analysisType === at.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'glass border border-white/10 text-white/50 hover:text-white'
              }`}
            >
              {at.label}
            </button>
          ))}
        </div>

        {/* Text input */}
        <div className="glass-card rounded-2xl border border-white/8 p-6 mb-4">
          <label className="block text-white/70 font-arabic text-sm mb-2">النص للتحليل</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="الصق النص أو البيانات التي تريد تحليلها..."
            rows={6}
            className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-white placeholder-white/30 font-arabic text-sm focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !text.trim()}
            className="mt-4 w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold font-arabic text-sm hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="animate-spin inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
            ) : (
              'حلّل الآن'
            )}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="glass-card rounded-2xl border border-amber-500/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold font-arabic">نتيجة التحليل</h3>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-sm font-arabic text-white/50 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
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
