import Link from "next/link";
import { ArrowRight, Construction } from "lucide-react";

export default function NewProjectPage() {
  return (
    <section className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
      <Link href="/dashboard/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-300"><ArrowRight className="size-4" /> العودة إلى المشاريع</Link>
      <div className="mt-8 flex size-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300"><Construction className="size-6" /></div>
      <h1 className="mt-5 text-2xl font-black text-slate-900 dark:text-white">إنشاء مشروع جديد</h1>
      <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">واجهة إنشاء المشروع وربطها بقاعدة البيانات ستكون ضمن مرحلة إدارة المشاريع. هيكل المصادقة ولوحة التحكم جاهز الآن.</p>
    </section>
  );
}
