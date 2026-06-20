import { useState, useRef, useEffect } from 'react';
import { Send, ArrowRight, Trash2, MessageSquare } from 'lucide-react';
import { chatWithAI, ChatMessage } from '../../lib/openrouter';
import { logUsage } from '../../lib/api/usage';
import { getErrorMessage } from '../../lib/errors';

interface ChatToolProps {
  onBack: () => void;
}

export default function ChatTool({ onBack }: ChatToolProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'system', content: 'أنت مساعد ذكي يتحدث العربية بطلاقة. ساعد المستخدم بإجابات واضحة ومفيدة.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const reply = await chatWithAI(newMessages);
      logUsage('chat', text.length, reply.length);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      const msg = getErrorMessage(err);
      const isKeyError = msg === 'MISSING_KEY' || msg === 'INVALID_KEY';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: isKeyError
            ? 'لم يتم ضبط مفتاح OpenRouter API بعد.\n\nالخطوات:\n1. سجّل في openrouter.ai\n2. انسخ مفتاح API من قسم Keys\n3. ضعه في ملف .env في المتغير VITE_OPENROUTER_API_KEY'
            : `حدث خطأ: ${msg}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      { role: 'system', content: 'أنت مساعد ذكي يتحدث العربية بطلاقة. ساعد المستخدم بإجابات واضحة ومفيدة.' },
    ]);
  };

  const visibleMessages = messages.filter((m) => m.role !== 'system');

  return (
    <div className="min-h-screen bg-[#060f33] pt-28 pb-4 flex flex-col">
      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/50 hover:text-white font-arabic text-sm transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            رجوع
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-orange-400" />
            </div>
            <h2 className="text-lg font-bold text-white font-arabic">محادثة AI</h2>
          </div>
          <button
            onClick={clearChat}
            className="flex items-center gap-1 text-white/40 hover:text-red-400 font-arabic text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-hide">
          {visibleMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <MessageSquare className="w-12 h-12 text-white/10 mb-4" />
              <p className="text-white/30 font-arabic">ابدأ محادثة مع المساعد الذكي</p>
            </div>
          )}
          {visibleMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[80%] px-5 py-3 rounded-2xl font-arabic text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-orange-500/15 border border-orange-500/20 text-white rounded-br-md'
                    : 'glass-card border border-white/10 text-white/90 rounded-bl-md'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-end">
              <div className="glass-card border border-white/10 px-5 py-3 rounded-2xl rounded-bl-md">
                <span className="animate-spin inline-block w-5 h-5 border-2 border-white/30 border-t-orange-400 rounded-full" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="glass-card rounded-2xl border border-white/10 p-3 flex items-end gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اكتب رسالتك هنا..."
            rows={1}
            className="flex-1 bg-transparent text-white placeholder-white/30 font-arabic text-sm resize-none focus:outline-none max-h-32"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-white hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
