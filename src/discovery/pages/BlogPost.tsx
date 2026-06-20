import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BlogPost as Post } from '../types';
import { getPostBySlug } from '../api';
import { useLocale } from '../context';
import SEO from '../components/SEO';
import { Loader, EmptyState } from '../components/ui';

export default function BlogPost() {
  const { slug = '' } = useParams();
  const { t } = useLocale();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getPostBySlug(slug).then(setPost).finally(() => setLoading(false)); }, [slug]);
  if (loading) return <Loader />;
  if (!post) return <EmptyState message={t('no_results')} />;

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title,
    description: post.seo_description, image: post.cover_url, datePublished: post.published_at,
    author: { '@type': 'Organization', name: post.author?.name || 'Saudi Discovery' },
  };

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <SEO title={post.seo_title || post.title} description={post.seo_description || post.excerpt} image={post.cover_url} type="article" jsonLd={jsonLd} />
      <Link to="/blog" className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 font-arabic text-sm mb-6 hover:underline">
        <ArrowRight className="w-4 h-4" />{t('nav_blog')}
      </Link>
      <h1 className="text-3xl sm:text-4xl font-bold font-arabic leading-tight mb-4">{post.title}</h1>
      <div className="flex items-center gap-3 mb-6 text-sm text-slate-500 dark:text-slate-400 font-arabic">
        {post.author && <span>{post.author.name}</span>}
        <span>•</span>
        <span>{new Date(post.published_at).toLocaleDateString('ar-SA')}</span>
      </div>
      <img src={post.cover_url} alt={post.title} className="w-full h-64 sm:h-80 object-cover rounded-2xl mb-8" />
      <div className="prose prose-lg dark:prose-invert max-w-none font-arabic leading-loose text-slate-700 dark:text-slate-300 whitespace-pre-line">
        {post.content}
      </div>
    </article>
  );
}
