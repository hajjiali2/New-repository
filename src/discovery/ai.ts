import { chatWithAI } from '../lib/openrouter';

/**
 * AI features degrade gracefully: if VITE_OPENROUTER_API_KEY is configured the
 * request goes to a real model; otherwise a high-quality local template/rule
 * engine produces useful Arabic output so the feature still works in any env.
 */
function hasKey(): boolean {
  const k = import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined;
  return !!k && k.length > 10;
}

export async function generateProductDescription(name: string, category: string, keywords: string): Promise<string> {
  if (hasKey()) {
    try {
      return await chatWithAI([{
        role: 'user',
        content: `اكتب وصفاً تسويقياً احترافياً باللغة العربية لمنتج اسمه "${name}" ضمن فئة "${category}". الكلمات المفتاحية: ${keywords}. اجعله من 3 جمل جذابة.`,
      }]);
    } catch {
      // fall through to template
    }
  }
  const kw = keywords.split(/[,،]/).map((s) => s.trim()).filter(Boolean);
  const features = kw.length ? `يتميّز بـ${kw.slice(0, 3).join('، ')}، ` : '';
  return `${name} منتج ${category} عالي الجودة مصمّم ليلبي احتياجاتك بأعلى المعايير. ${features}مع ضمان الجودة وخدمة عملاء متميزة وتوصيل سريع لجميع مناطق المملكة. اطلبه الآن واستمتع بتجربة شراء موثوقة من تاجر معتمد على سعودي ديسكفري.`;
}

const FAQ_REPLIES: { match: RegExp; reply: string }[] = [
  { match: /اشتراك|خطة|سعر|باق/, reply: 'لدينا خطط مرنة: مجاني للبداية، ثم خطط مدفوعة تتيح منتجات وعروضاً غير محدودة وظهوراً مميزاً. تفضل بزيارة صفحة الأسعار للتفاصيل.' },
  { match: /توثيق|موثق|سجل تجاري|توثيقي/, reply: 'لتوثيق متجرك، ارفع السجل التجاري ورقم ضريبة القيمة المضافة عند التسجيل. يراجع فريقنا المستندات خلال 24 ساعة ويمنحك شارة "تاجر موثّق".' },
  { match: /عمول|نسبة|رسوم/, reply: 'نموذجنا شفاف: لا نأخذ عمولة على مبيعاتك في الخطط المدفوعة، وتدفع اشتراكاً شهرياً ثابتاً فقط. الخطة المجانية متاحة دائماً.' },
  { match: /تسجيل|انضمام|أبدأ|ابدأ/, reply: 'الانضمام سهل وسريع! اضغط "انضم الآن" واملأ بيانات متجرك (السجل التجاري، الرقم الضريبي، المدينة) وستحصل على أول 3 أشهر مجاناً.' },
  { match: /منتج|إضافة|رفع/, reply: 'من لوحة التحكم → تبويب المنتجات يمكنك إضافة منتجاتك مع الصور والأسعار، ويمكنك استخدام مولّد الوصف بالذكاء الاصطناعي لكتابة وصف احترافي تلقائياً.' },
];

export async function assistantReply(message: string): Promise<string> {
  if (hasKey()) {
    try {
      return await chatWithAI([
        { role: 'system', content: 'أنت مساعد ذكي لمنصة "سعودي ديسكفري" لمساعدة التجار. أجب بالعربية باختصار ومهنية.' },
        { role: 'user', content: message },
      ]);
    } catch {
      // fall through
    }
  }
  const hit = FAQ_REPLIES.find((f) => f.match.test(message));
  if (hit) return hit.reply;
  return 'أهلاً بك في مساعد سعودي ديسكفري! يمكنني مساعدتك في التسجيل، التوثيق، الاشتراكات، إضافة المنتجات والتسويق. كيف أساعدك؟';
}
