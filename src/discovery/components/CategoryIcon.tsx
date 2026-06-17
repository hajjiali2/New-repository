import * as Icons from 'lucide-react';

export default function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Cmp = (Icons as unknown as Record<string, Icons.LucideIcon>)[name] || Icons.Store;
  return <Cmp className={className} />;
}
