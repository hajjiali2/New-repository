import {
  UtensilsCrossed, Coffee, Hotel, Stethoscope, HardHat, ShoppingCart, Wrench,
  Plane, Store, Sparkles, Star, Home, LayoutGrid, Megaphone, Image, MapPin,
  Bell, Mail, PackageCheck, LucideIcon,
} from 'lucide-react';

// Explicit map (avoids `import * as Icons` which bundles the entire icon set).
const ICONS: Record<string, LucideIcon> = {
  UtensilsCrossed, Coffee, Hotel, Stethoscope, HardHat, ShoppingCart, Wrench,
  Plane, Store, Sparkles, Star, Home, LayoutGrid, Megaphone, Image, MapPin,
  Bell, Mail, PackageCheck,
};

export default function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Cmp = ICONS[name] || Store;
  return <Cmp className={className} />;
}
