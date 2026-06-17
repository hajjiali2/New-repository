import { useState } from 'react';
import { Languages, ArrowRight, Copy, Check, ArrowLeftRight } from 'lucide-react';
import { chatWithAI } from '../../lib/openrouter';
import { logUsage } from '../../lib/api/usage';
import { getErrorMessage } from '../../lib/errors';

interface TranslatorToolProps {
  onBack: () => void;
}

const languagePairs = [
  { id: 'ar-en', label: 'عربي ← إنجليزي', from: 'العربية', to: 'الإنجليزية' },
  { id: 'en-ar', label: 'إنجليزي ← عربي', from: 'الإنجليزية', to: 'العربية' },
  { id: 'ar-fr', label: 'عربي ← فرنسي', from: 'العربية', to: 'الفرنسية' },
  { id: 'fr-ar', label: 'فرنسي ← عربي', from: 'الفرنسية', to: 'العربية' },
];

export default function TranslatorTool({ onBack }: TranslatorToolProps) {
  const [text, setText] = useState('');
  const [langPair, setLangPair] = useState('ar-en');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setResult('');

    const pair = languagePairs.find((p) => p.id === langPair) || languagePairs[0];

    const prompt = `ترجم النص التالي من ${pair.from} إلى ${pair.to}. حافظ على المعنى والسياق وأسلوب النص الأصلي. أعطني الترجمة فقط بدون شرح:

${text}`;

    try {
      const reply = await chatWithAI([{ role: 'user', content: prompt }]);
      logUsage('translator', text.length, reply.length);
      setResult(reply);
    } catch (err) {
      const msg = getErrorMessage(err);
      const isKeyError = msg === 'MISSING_KEY' || msg === 'INVALID_KEY';
      setResult(
        isKeyError
          ? 'مفتاح OpenRouter API غير مضبوط.\n\nالخطوات:\n1. سجّل في openrouter.ai\n2. انسخ مفتاح API من قسم Keys\n3. ضعه في ملف .env في المتغير VITE_OPENROUTER_API_KEY'
          : `حدث خطأ: ${msg}`
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

  const swapLanguages = () => {
    const map: Record<string, string> = { 'ar-en': 'en-ar', 'en-ar': 'ar-en', 'ar-fr': 'fr-ar', 'fr-ar': 'ar-fr' };
    setLangPair(map[langPair] || 'en-ar');
    if (result) {
      setText(result);
      setResult('');
    }
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
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Languages className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-lg font-bold text-white font-arabic">المترجم الذكي</h2>
          </div>
        </div>

        {/* Language selector */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {languagePairs.map((lp) => (
              <button
                key={lp.id}
                onClick={() => setLangPair(lp.id)}
                className={`px-4 py-2 rounded-xl text-sm font-arabic transition-all ${
                  langPair === lp.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'glass border border-white/10 text-white/50 hover:text-white'
                }`}
              >
                {lp.label}
              </button>
            ))}
          </div>
          <button
            onClick={swapLanguages}
            className="w-9 h-9 rounded-lg glass border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        {/* Source text */}
        <div className="glass-card rounded-2xl border border-white/8 p-6 mb-4">
          <label className="block text-white/70 font-arabic text-sm mb-2">النص المصدر</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="الصق النص هنا للترجمة..."
            rows={5}
            className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-white placeholder-white/30 font-arabic text-sm focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
          />
          <button
            onClick={handleTranslate}
            disabled={loading || !text.trim()}
            className="mt-4 w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold font-arabic text-sm hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="animate-spin inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
            ) : (
              'ترجم'
            )}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="glass-card rounded-2xl border border-emerald-500/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold font-arabic">الترجمة</h3>
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
