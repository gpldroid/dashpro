# DashPro — دليل النشر

هذا الدليل يوضح نشر تطبيق DashPro نفسه، ثم نشر المواقع الثابتة التي يتم تصديرها من DashPro.

## 1. متطلبات قبل النشر

DashPro يستخدم Next.js App Router وSupabase SSR/Auth، لذلك النسخة الحالية تحتاج استضافة تشغل Next.js.

الخيارات المناسبة:
- Vercel
- Netlify

GitHub Pages مناسب للمواقع الثابتة التي ينتجها التصدير، لكنه ليس هدف نشر مناسبًا للنسخة الحالية من تطبيق DashPro نفسه ما دامت تعتمد على SSR والمصادقة.

## 2. النشر على Vercel

1. أنشئ مشروعًا جديدًا في Vercel.
2. اختر Import Git Repository.
3. استورد المستودع gpldroid/dashpro.
4. اختر Next.js كإطار العمل.
5. استخدم Node.js 22 أو أحدث.
6. أضف متغيرات البيئة التالية:
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
7. شغّل النشر.
8. بعد ظهور الدومين النهائي، افتح Supabase Authentication ثم URL Configuration.
9. ضع الدومين النهائي في Site URL.
10. أضف عنوان OAuth التالي إلى Redirect URLs:
    https://YOUR-DOMAIN/auth/callback

لا تضع SUPABASE_SECRET_KEY أو service_role في أي متغير يبدأ بـ NEXT_PUBLIC_.

## 3. النشر على Netlify

1. أنشئ Site جديدًا من Git.
2. اختر المستودع gpldroid/dashpro.
3. Build command:
   npm run build
4. دع تكامل Next.js في Netlify يحدد إعدادات النشر.
5. أضف:
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
6. حدّث Site URL وRedirect URLs في Supabase إلى الدومين النهائي.
7. اختبر تسجيل الدخول ثم الوصول إلى /dashboard.

## 4. GitHub Pages للموقع الثابت المصدّر

DashPro يوفر exportStaticSiteZip لإنتاج ملف dashpro-static-site.zip.

بعد تنزيل الملف:

1. فك ضغطه.
2. تأكد من وجود index.html في جذر الملفات.
3. أنشئ مستودعًا للموقع الثابت أو استخدم مستودعًا مخصصًا له.
4. ارفع index.html وstyle.css وscript.js وأي ملفات إضافية.
5. افتح Settings ثم Pages في المستودع.
6. اختر مصدر النشر المناسب، مثل GitHub Actions أو النشر من فرع.
7. افتح رابط GitHub Pages واختبر الصفحة.

لا تضع مفاتيح Supabase السرية داخل الموقع الثابت.

## 5. متغيرات Supabase

الأسماء التي يستخدمها DashPro حاليًا هي:

    NEXT_PUBLIC_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

قد تجد في مشاريع قديمة الاسم NEXT_PUBLIC_SUPABASE_ANON_KEY. لا تغيّر الكود الحالي إلى هذا الاسم تلقائيًا؛ المشروع يستخدم publishable key وفق بنية Supabase الحالية.

المفتاح publishable/legacy anon يمكن أن يظهر في العميل، لكن ذلك لا يعني أنه مفتاح سري. لا تستخدم service_role أو secret key في المتصفح.

## 6. إعداد GitHub OAuth

إذا كان تسجيل GitHub مفعلًا:

1. في Supabase Authentication، تأكد من إعداد مزود GitHub.
2. اجعل Site URL يطابق الدومين الفعلي.
3. أضف:
   https://YOUR-DOMAIN/auth/callback
   إلى Redirect URLs في Supabase.
4. في إعداد OAuth App لدى GitHub، استخدم عنوان callback الخاص بـ Supabase الذي يعرضه لك مشروعك.
5. لا تحفظ Client Secret داخل المستودع أو داخل NEXT_PUBLIC_ variables.

## 7. التحقق بعد النشر

شغّل محليًا:

    npm run lint
    npm run typecheck
    npm run build

ثم اختبر يدويًا:

- تسجيل الدخول والخروج.
- حماية مسار /dashboard.
- تحميل المشاريع.
- فتح محرر Blogger.
- الحفظ التلقائي والحفظ اليدوي.
- المعاينة الحية والباني البصري.
- تحميل snippets وإضافتها وحذفها.
- نسخ snippet وإدراجه عند المؤشر.
- تصدير template.xml لقالب صالح.
- رفض تصدير Blogger عند وجود أخطاء XML.
- إنشاء ZIP لموقع ثابت وفك ضغطه.
- فتح index.html بعد فك الضغط.

## 8. ملاحظة مهمة حول GitHub Pages

لا تستخدم عنوان GitHub Pages لتطبيق DashPro الحالي إلا بعد تحويل التطبيق عمدًا إلى static export وإعادة تصميم الاعتماد على SSR/Auth. ملف ZIP الثابت الناتج من DashPro شيء مختلف: هو موقع المستخدم النهائي، وليس تطبيق DashPro نفسه.
