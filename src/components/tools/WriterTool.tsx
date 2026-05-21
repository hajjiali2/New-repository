import { useState } from 'react';
import { PenTool, ArrowRight, Copy, Check } from 'lucide-react';
import { chatWithAI } from '../../lib/openrouter';

interface WriterToolProps {
  onBack: () => void;
}

const contentTypes = [
  { id: 'ad', label: 'إعلان تسويقي' },
  { id: 'post', label: 'منشور سوشيال ميديا' },
  { id: 'article', label: 'مقال' },
  { id: 'email', label: 'بريد إلكتروني' },
  { id: 'product', label: 'وصف منتج' },
  { id: 'blog', label: 'مقال مدونة' },
];

const tones = [
  { id: 'professional', label: 'احترافي' },
  { id: 'friendly', label: 'ودود' },
  { id: 'formal', label: 'رسمي' },
  { id: 'creative', label: 'إبداعي' },
];

export default function WriterTool({ onBack }: WriterToolProps) {
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState('ad');
  const [tone, setTone] = useState('professional');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim() || loading) return;
    setLoading(true);
    setResult('');

    const typeLabel = contentTypes.find((c) => c.id === contentType)?.label || contentType;
    const toneLabel = tones.find((t) => t.id === tone)?.label || tone;

    const prompt = `اكتب ${typeLabel} باللغة العربية عن الموضوع التالي: "${topic}".
النبرة: ${toneLabel}.
اجعل المحتوى احترافياً وجذاباً ومناسباً للجمهور العربي.`;

    try {
      const reply = await chatWithAI([{ role: 'user', content: prompt }]);
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
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <PenTool className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-bold text-white font-arabic">كاتب المحتوى</h2>
          </div>
        </div>

        {/* Form */}
        <div className="glass-card rounded-2xl border border-white/8 p-6 space-y-5">
          {/* Content type */}
          <div>
            <label className="block text-white/70 font-arabic text-sm mb-3">نوع المحتوى</label>
            <div className="flex flex-wrap gap-2">
              {contentTypes.map((ct) => (
                <button
                  key={ct.id}
                  onClick={() => setContentType(ct.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-arabic transition-all ${
                    contentType === ct.id
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'glass border border-white/10 text-white/50 hover:text-white hover:border-white/20'
                  }`}
                >
                  {ct.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div>
            <label className="block text-white/70 font-arabic text-sm mb-3">النبرة</label>
            <div className="flex flex-wrap gap-2">
              {tones.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-arabic transition-all ${
                    tone === t.id
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'glass border border-white/10 text-white/50 hover:text-white hover:border-white/20'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-white/70 font-arabic text-sm mb-2">الموضوع</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="مثال: تطبيق توصيل طعام يستهدف الشباب في السعودية..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-white placeholder-white/30 font-arabic text-sm focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold font-arabic text-sm hover:from-blue-600 hover:to-blue-700 transition-all glow-blue disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="animate-spin inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
            ) : (
              'إنشاء المحتوى'
            )}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="mt-6 glass-card rounded-2xl border border-blue-500/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold font-arabic">النتيجة</h3>
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
