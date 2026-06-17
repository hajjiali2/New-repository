import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useLocale } from '../context';

export default function SearchBar({ large }: { large?: boolean }) {
  const { t } = useLocale();
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <form onSubmit={onSubmit} className={`flex items-stretch gap-2 ${large ? 'max-w-2xl mx-auto' : ''}`}>
      <div className="relative flex-1">
        <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-5 h-5 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('search_placeholder')}
          className={`w-full ps-11 pe-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-800/80 text-slate-900 dark:text-white placeholder-slate-400 font-arabic focus:outline-none focus:border-teal-400 transition-colors ${large ? 'py-4 text-base' : 'py-2.5 text-sm'}`}
        />
      </div>
      <button type="submit" className={`rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold font-arabic hover:from-teal-600 hover:to-emerald-700 transition-all ${large ? 'px-8 text-base' : 'px-5 text-sm'}`}>
        {t('search_btn')}
      </button>
    </form>
  );
}
