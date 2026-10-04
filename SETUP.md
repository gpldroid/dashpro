# DashPro — إعداد الحسابات والمفاتيح

## 1. Supabase

المشروع المستخدم حالياً هو مشروع DashPro الموجود في منطقة eu-west-2.

1. افتح Supabase Dashboard للمشروع.
2. من Project Settings → API انسخ Project URL و Publishable key (`sb_publishable_...`).
3. محلياً أنشئ `.env.local` من `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
```

ممنوع وضع `service_role` أو Secret key أو أي GitHub secret في متغير يبدأ بـ `NEXT_PUBLIC_`.

## 2. GitHub OAuth — المسار الموصى به

DashPro لا يحتاج إلى PAT للمستخدم النهائي. عند تسجيل الدخول عبر GitHub، يستخدم التطبيق جلسة Supabase وGitHub provider token مؤقتاً، ثم يرسله فقط إلى Edge Function المصادق عليها لتنفيذ عمليات GitHub.

1. افتح GitHub → Settings → Developer settings → OAuth Apps.
2. اختر New OAuth App.
3. Homepage URL: `https://gpldroid.github.io/dashpro/`
4. Authorization callback URL: `https://sqseywflmchnytighlqj.supabase.co/auth/v1/callback`
5. انسخ Client ID.
6. ولّد Client Secret واحفظه في لوحة Supabase فقط.
7. في Supabase: Authentication → Providers → GitHub: فعّل GitHub وأدخل Client ID وClient Secret.
8. في Authentication → URL Configuration:
   - Site URL: `https://gpldroid.github.io/dashpro/`
   - Redirect URL: `https://gpldroid.github.io/dashpro/auth/callback/`
   - للتطوير: `http://localhost:3000/auth/callback/`

## 3. Personal Access Token — للاستخدام اليدوي فقط

لا تضع PAT داخل DashPro ولا في Git ولا في `.env.local` إذا لم تكن تحتاجه.

إذا احتجت PAT لاختبار GitHub API خارج DashPro:
1. GitHub → Settings → Developer settings → Personal access tokens.
2. استخدم Fine-grained token.
3. حدّد المستودعات المطلوبة فقط.
4. امنح أقل صلاحيات ممكنة، مثل Contents: Read and write للمستودع المطلوب.
5. لا ترسله في المحادثة ولا تحفظه في ملفات المشروع.
6. بعد الاختبار ألغِه إذا لم تعد تحتاجه.

## 4. تثبيت الحزم

```bash
npm install
```

للتثبيت الصريح للحزم الأساسية:

```bash
npm install next@16.3.8 react@19.3.0 react-dom@19.3.0 @supabase/supabase-js@2.117.1 @supabase/ssr@0.12.7 @octokit/rest@22.0.0 @monaco-editor/react@4.7.0 @hello-pangea/dnd@18.0.1 lucide-react@0.577.0 clsx@2.1.1 tailwind-merge@3.5.0 zod@4.1.12 fflate@0.8.2
```

## 5. أوامر التحقق

```bash
npm run typecheck
npm run lint
npm run build
```

النشر المستهدف هو GitHub Pages عبر GitHub Actions، وليس Vercel أو Netlify.

## 6. نموذج الأمان

```text
Browser
  ↓ Supabase Auth
DashPro
  ↓ authenticated Edge Function
Supabase Edge Function: github-workspace
  ↓ temporary GitHub provider token
GitHub REST API
```

لا توجد GitHub PATs أو Supabase secret keys في واجهة المتصفح.