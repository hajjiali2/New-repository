import { useState } from 'react';
import { FileText, ArrowRight, Copy, Check } from 'lucide-react';
import { chatWithAI } from '../../lib/openrouter';
import { logUsage } from '../../lib/api/usage';
import { getErrorMessage } from '../../lib/errors';

interface SummarizerToolProps {
  onBack: () => void;
}

const lengths = [
  { id: 'short', label: 'قصير (3 نقاط)' },
  { id: 'medium', label: 'متوسط (5-7 نقاط)' },
  { id: 'long', label: 'تفصيلي (فقرة كاملة)' },
];

export default function SummarizerTool({ onBack }: SummarizerToolProps) {
  const [text, setText] = useState('');
  const [length, setLength] = useState('medium');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSummarize = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setResult('');

    const lengthMap: Record<string, string> = {
      short: 'لخّص في 3 نقاط رئيسية فقط',
      medium: 'لخّص في 5 إلى 7 نقاط واضحة',
      long: 'اكتب ملخصاً تفصيلياً في فقرة كاملة',
    };

    const prompt = `${lengthMap[length]} للنص التالي باللغة العربية:\n\n${text}`;

    try {
      const reply = await chatWithAI([{ role: 'user', content: prompt }]);
      logUsage('summarizer', text.length, reply.length);
      setResult(reply);
    } catch (err) {
      const msg = getErrorMessage(err);
      const isKeyError = msg === 'MISSING_KEY' || msg === 'INVALID_KEY';
      setResult(
        isKeyError
          ? 'مفتاح OpenRouter API غير مضبوط.\n\nالخطوات:\n1. سجّل في openrouter.ai\n2. انسخ مفتاح API\n3. ضعه في .env في المتغير VITE_OPENROUTER_API_KEY'
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
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-teal-400" />
            </div>
            <h2 className="text-lg font-bold text-white font-arabic">ملخص النصوص</h2>
          </div>
        </div>

        <div className="glass-card rounded-2xl border border-white/8 p-6 space-y-5">
          <div>
            <label className="block text-white/70 font-arabic text-sm mb-3">طول الملخص</label>
            <div className="flex flex-wrap gap-2">
              {lengths.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLength(l.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-arabic transition-all ${
                    length === l.id
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                      : 'glass border border-white/10 text-white/50 hover:text-white hover:border-white/20'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-white/70 font-arabic text-sm mb-2">النص المراد تلخيصه</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="الصق هنا أي نص طويل تريد تلخيصه..."
              rows={7}
              className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-white placeholder-white/30 font-arabic text-sm focus:outline-none focus:border-teal-500/50 transition-colors resize-none"
            />
          </div>

          <button
            onClick={handleSummarize}
            disabled={loading || !text.trim()}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold font-arabic text-sm hover:from-teal-600 hover:to-teal-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="animate-spin inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
            ) : (
              'لخّص الآن'
            )}
          </button>
        </div>

        {result && (
          <div className="mt-6 glass-card rounded-2xl border border-teal-500/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold font-arabic">الملخص</h3>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-sm font-arabic text-white/50 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
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
