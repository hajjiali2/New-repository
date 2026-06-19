import { useState, useRef, useEffect, FormEvent } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { assistantReply } from '../ai';

interface Msg { role: 'user' | 'bot'; text: string; }

/** Floating AI merchant/support assistant. Uses OpenRouter if configured, else a built-in FAQ engine. */
export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'bot', text: 'أهلاً بك! أنا مساعد سعودي ديسكفري. كيف أساعدك في تنمية متجرك؟' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, open]);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setMsgs((m) => [...m, { role: 'user', text }]);
    setInput(''); setLoading(true);
    try {
      const reply = await assistantReply(text);
      setMsgs((m) => [...m, { role: 'bot', text: reply }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      <button onClick={() => setOpen(!open)} aria-label="مساعد"
        className="fixed bottom-4 start-4 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-2xl flex items-center justify-center hover:scale-105 transition-transform">
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
      {open && (
        <div className="fixed bottom-20 start-4 z-40 w-[92vw] max-w-sm rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden" style={{ height: 460 }}>
          <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
            <Bot className="w-5 h-5" /><span className="font-bold font-arabic">مساعد سعودي ديسكفري</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm font-arabic leading-relaxed ${m.role === 'user' ? 'bg-teal-500/15 text-slate-800 dark:text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200'}`}>{m.text}</div>
              </div>
            ))}
            {loading && <div className="flex justify-end"><div className="px-3 py-2 rounded-2xl bg-slate-100 dark:bg-white/10"><span className="inline-block w-4 h-4 border-2 border-teal-500/40 border-t-teal-500 rounded-full animate-spin" /></div></div>}
            <div ref={endRef} />
          </div>
          <form onSubmit={send} className="p-3 border-t border-slate-200 dark:border-white/10 flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="اكتب سؤالك..."
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 text-sm font-arabic focus:outline-none focus:border-teal-400" />
            <button className="w-10 h-10 rounded-lg bg-teal-500 text-white flex items-center justify-center flex-shrink-0"><Send className="w-4 h-4" /></button>
          </form>
        </div>
      )}
    </>
  );
}
