import { useState, FormEvent } from 'react';
import { X, ShoppingCart, Check, Minus, Plus } from 'lucide-react';
import { Product } from '../types';
import { placeOrder } from '../api';
import { useLocale } from '../context';
import { formatPrice } from '../utils';

export default function OrderModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { locale } = useLocale();
  const [qty, setQty] = useState(1);
  const [form, setForm] = useState({ customer_name: '', customer_phone: '', customer_email: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const unit = Number(product.sale_price ?? product.price);
  const subtotal = unit * qty;
  const vat = subtotal * (Number(product.vat_percent) / 100);
  const total = subtotal + vat;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await placeOrder({
        business_id: product.business_id, product_id: product.id,
        customer_name: form.customer_name, customer_phone: form.customer_phone,
        customer_email: form.customer_email, quantity: qty, total, status: 'new',
      });
      setDone(true);
    } finally { setLoading(false); }
  };

  const input = 'w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 text-sm font-arabic focus:outline-none focus:border-teal-400';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 p-6 animate-slide-up">
        <button onClick={onClose} className="absolute top-4 end-4 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"><X className="w-4 h-4" /></button>

        {done ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto mb-4"><Check className="w-7 h-7" /></div>
            <h3 className="text-xl font-bold font-arabic mb-2">تم إرسال طلبك!</h3>
            <p className="text-slate-500 dark:text-slate-400 font-arabic mb-5">سيتواصل معك التاجر لتأكيد الطلب والتوصيل.</p>
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-teal-500 text-white font-bold font-arabic">حسناً</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <h3 className="text-lg font-bold font-arabic flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-teal-500" />إتمام الطلب</h3>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-navy-900">
              <img src={product.image_url} alt={product.name} className="w-14 h-14 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold font-arabic text-sm truncate">{product.name}</h4>
                <span className="text-teal-600 dark:text-teal-400 font-bold text-sm">{formatPrice(unit, 'SAR', locale)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center"><Minus className="w-3.5 h-3.5" /></button>
                <span className="w-6 text-center font-bold">{qty}</span>
                <button type="button" onClick={() => setQty((q) => q + 1)} className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center"><Plus className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            <input required value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} placeholder="الاسم" className={input} />
            <input required dir="ltr" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} placeholder="رقم الجوال" className={input} />
            <input type="email" dir="ltr" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} placeholder="البريد الإلكتروني (اختياري)" className={input} />

            <div className="rounded-xl bg-slate-50 dark:bg-navy-900 p-3 text-sm font-arabic space-y-1">
              <div className="flex justify-between text-slate-500 dark:text-slate-400"><span>المجموع الفرعي</span><span>{formatPrice(subtotal, 'SAR', locale)}</span></div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400"><span>ضريبة القيمة المضافة ({Number(product.vat_percent)}%)</span><span>{formatPrice(Math.round(vat), 'SAR', locale)}</span></div>
              <div className="flex justify-between font-bold text-base pt-1 border-t border-slate-200 dark:border-white/10"><span>الإجمالي</span><span className="text-teal-600 dark:text-teal-400">{formatPrice(Math.round(total), 'SAR', locale)}</span></div>
            </div>

            <button disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold font-arabic disabled:opacity-50">
              {loading ? '...' : 'تأكيد الطلب'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
