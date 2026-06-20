import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { Business, City } from '../types';
import { getCityBySlug, listBusinesses } from '../api';
import { useLocale } from '../context';
import { localName } from '../utils';
import SEO from '../components/SEO';
import BusinessCard from '../components/BusinessCard';
import { Loader, EmptyState } from '../components/ui';

export default function CityDetail() {
  const { slug = '' } = useParams();
  const { locale, t } = useLocale();
  const [city, setCity] = useState<City | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getCityBySlug(slug), listBusinesses({ citySlug: slug })])
      .then(([c, b]) => { setCity(c); setBusinesses(b); })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <Loader />;

  return (
    <>
      <SEO title={city ? localName(city, locale) : t('nav_cities')} description={`أعمال في ${city ? localName(city, locale) : ''}`} image={city?.image_url} />
      <div className="relative h-56">
        <img src={city?.image_url} alt={city?.name_ar} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/30" />
        <div className="absolute bottom-6 max-w-7xl mx-auto inset-x-0 px-4 sm:px-6 lg:px-8 text-white">
          <h1 className="text-3xl sm:text-4xl font-bold font-arabic flex items-center gap-2"><MapPin className="w-7 h-7" />{city ? localName(city, locale) : ''}</h1>
          <p className="text-white/80 font-arabic">{businesses.length} {t('results')} • {city?.region}</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {businesses.length === 0 ? <EmptyState message={t('no_results')} /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {businesses.map((b) => <BusinessCard key={b.id} business={b} />)}
          </div>
        )}
      </div>
    </>
  );
}
