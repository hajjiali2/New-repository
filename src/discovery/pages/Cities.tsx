import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { City } from '../types';
import { getCities } from '../api';
import { useLocale } from '../context';
import { localName } from '../utils';
import SEO from '../components/SEO';
import { Loader, SectionHeader } from '../components/ui';

export default function Cities() {
  const { locale, t } = useLocale();
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getCities().then(setCities).finally(() => setLoading(false)); }, []);
  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SEO title={t('explore_cities')} description="استكشف الأعمال حسب المدينة" />
      <SectionHeader title={t('explore_cities')} subtitle={`${cities.length} مدينة`} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cities.map((c) => (
          <Link key={c.id} to={`/city/${c.slug}`} className="relative h-48 rounded-2xl overflow-hidden group">
            <img src={c.image_url} alt={c.name_ar} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute bottom-4 start-4 text-white">
              <h3 className="font-bold font-arabic text-xl flex items-center gap-2"><MapPin className="w-5 h-5" />{localName(c, locale)}</h3>
              <p className="text-white/70 font-arabic text-sm">{c.region}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
