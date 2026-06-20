import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  type?: string;
  jsonLd?: Record<string, unknown>;
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/** Lightweight SEO: title, meta description, Open Graph, and optional JSON-LD schema. */
export default function SEO({ title, description, image, type = 'website', jsonLd }: SEOProps) {
  useEffect(() => {
    const full = `${title} | Saudi Discovery`;
    document.title = full;
    if (description) setMeta('name', 'description', description);
    setMeta('property', 'og:title', full);
    setMeta('property', 'og:type', type);
    if (description) setMeta('property', 'og:description', description);
    if (image) setMeta('property', 'og:image', image);
    setMeta('name', 'twitter:card', 'summary_large_image');

    let script: HTMLScriptElement | null = null;
    if (jsonLd) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
    return () => { if (script) document.head.removeChild(script); };
  }, [title, description, image, type, jsonLd]);

  return null;
}
