import Link from "next/link";
import { ArrowLeft, Blocks, Code2, Layers3, Sparkles } from "lucide-react";

const features = [
  {
    icon: Code2,
    title: "محرر قوالب Blogger",
    description: "تحرير XML وبناء القوالب مع معاينة مباشرة."
  },
  {
    icon: Blocks,
    title: "منشئ المواقع",
    description: "إنشاء صفحات ومواقع باستخدام مكونات قابلة لإعادة الاستخدام."
  },
  {
    icon: Layers3,
    title: "مكتبة المشاريع",
    description: "حفظ المشاريع والقوالب والمقاطع البرمجية في مكان واحد."
  }
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-10">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-2xl font-black tracking-tight text-slate-950">
          Dash<span className="text-indigo-600">Pro</span>
        </Link>
        <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          منصة البناء والإبداع
        </span>
      </header>

      <section className="flex flex-1 flex-col justify-center py-20">
        <div className="mb-6 flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
          <Sparkles className="size-4 text-indigo-600" />
          مساحة عملك لبناء الويب
        </div>

        <h1 className="max-w-3xl text-4xl leading-tight font-black tracking-tight text-slate-950 sm:text-6xl">
          ابنِ قوالبك ومواقعك
          <span className="block text-indigo-600">بسهولة واحترافية.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-9 text-slate-600">
          DashPro يجمع أدوات تصميم قوالب بلوجر، وتحرير الأكواد، وبناء المواقع
          في مساحة عمل واحدة.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
          >
            استكشف لوحة التحكم
            <ArrowLeft className="size-4" />
          </Link>
          <a
            href="https://supabase.com/dashboard/project/sqseywflmchnytighlqj"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            إعداد Supabase
          </a>
        </div>
      </section>

      <section className="grid gap-4 pb-12 md:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <article
            key={title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Icon className="size-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
          </article>
        ))}
      </section>

      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} DashPro. جميع الحقوق محفوظة.
      </footer>
    </main>
  );
}
