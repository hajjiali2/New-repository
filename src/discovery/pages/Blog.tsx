import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Calendar } from 'lucide-react';
import { BlogPost } from '../types';
import { listPosts } from '../api';
import { useLocale } from '../context';
import { formatNumber } from '../utils';
import SEO from '../components/SEO';
import { Loader, SectionHeader } from '../components/ui';

export default function Blog() {
  const { locale, t } = useLocale();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { listPosts().then(setPosts).finally(() => setLoading(false)); }, []);
  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SEO title={t('nav_blog')} description="مقالات وأدلة ونصائح من سعودي ديسكفري" />
      <SectionHeader title={t('nav_blog')} subtitle="أدلة، أخبار ونصائح" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((p) => (
          <Link key={p.id} to={`/blog/${p.slug}`} className="rounded-2xl overflow-hidden bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10 hover:shadow-md transition-all group">
            <img src={p.cover_url} alt={p.title} loading="lazy" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="p-5">
              <div className="flex flex-wrap gap-2 mb-2">
                {p.tags.slice(0, 2).map((tag) => <span key={tag} className="px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-arabic">{tag}</span>)}
              </div>
              <h3 className="font-bold font-arabic text-lg line-clamp-2">{p.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-arabic line-clamp-2 mt-2">{p.excerpt}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 font-arabic">
                <span className="inline-flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{formatNumber(p.views, locale)}</span>
                <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(p.published_at).toLocaleDateString('ar-SA')}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
