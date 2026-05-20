# تعليمات رفع المشروع على Bolt

المشروع جاهز وتم اختبار البناء بنجاح عبر:

```bash
npm install
npm run build
```

## الطريقة الأفضل للرفع على Bolt

1. فك ضغط الملف.
2. ارفع مجلد المشروع كامل على GitHub كمستودع جديد.
3. افتح Bolt.
4. اختر Import from GitHub.
5. اختر المستودع.
6. بعد فتح المشروع، تأكد من ملف `.env` وأضف مفتاح OpenRouter الحقيقي:

```env
VITE_OPENROUTER_API_KEY=sk-or-v1-xxxxxxxx
```

## ملاحظات

- لا تحذف متغيرات Supabase الموجودة.
- مفتاح OpenRouter يجب ألا يُرسل في المحادثات العامة.
- المشروع يحتوي قسم الشركات وقسم الأفراد.
- ربط OpenRouter موجود داخل `src/lib/openrouter.ts`.
