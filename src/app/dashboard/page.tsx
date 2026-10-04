import Link from "next/link";
import { ArrowLeft, FolderKanban, Plus, Sparkles } from "lucide-react";

import { ProjectsList } from "@/components/dashboard/ProjectsList";
import { createClient } from "@/lib/supabase/server";
import type { ProjectRow } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(6);

  const projectList = (projects ?? []) as ProjectRow[];

  return (
    <div className="mx-auto max-w-7xl">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 p-7 text-white shadow-xl shadow-indigo-600/15 sm:p-10">
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold">
              <Sparkles className="size-3.5" /> مساحة الإبداع تبدأ هنا
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">أهلاً بك في DashPro</h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-indigo-100 sm:text-base">
              أنشئ قوالب Blogger ومواقعك، ونظّم أكوادك ومكوناتك من لوحة تحكم واحدة.
            </p>
          </div>
          <Link href="/dashboard/projects/new" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50">
            <Plus className="size-4" /> مشروع جديد
          </Link>
        </div>
      </section>

      <section className="mt-9">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">مشاريعك الأخيرة</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">تابع آخر المشاريع التي عملت عليها.</p>
          </div>
          <Link href="/dashboard/projects" className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-300">
            جميع المشاريع <ArrowLeft className="size-4" />
          </Link>
        </div>

        {error ? (
          <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
            تعذر تحميل المشاريع. تأكد من تشغيل سياسات قاعدة البيانات للجدول.
          </div>
        ) : (
          <ProjectsList projects={projectList} />
        )}
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">مسار العمل</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">انتقل مباشرة بين مراحل بناء مشروعك.</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            التصدير النهائي متاح من المحرر
          </span>
        </div>
        <nav aria-label="مسار العمل" className="grid gap-2 sm:grid-cols-4">
          {[
            ["المشاريع", "/dashboard/projects"],
            ["محرر الأكواد", "/dashboard/editor"],
            ["الباني البصري", "/dashboard/editor"],
            ["مكتبة الأكواد", "/dashboard/snippets"],
          ].map(([label, href], index) => (
            <Link
              key={label}
              href={href}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-800 dark:text-slate-200 dark:hover:border-indigo-500/30 dark:hover:bg-indigo-500/10"
            >
              <span className="me-2 text-xs text-indigo-500">{index + 1}</span>
              {label}
            </Link>
          ))}
        </nav>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <QuickLink href="/dashboard/editor" title="محرر القوالب" description="ابدأ تعديل XML وHTML." icon="code" />
        <QuickLink href="/dashboard/snippets" title="مكتبة الأكواد" description="احتفظ بالمقاطع التي تستخدمها." icon="snippets" />
        <QuickLink href="/dashboard/components" title="مكونات جاهزة" description="استخدم أجزاء الواجهات القابلة لإعادة الاستخدام." icon="components" />
      </section>
    </div>
  );
}

function QuickLink({
  href,
  title,
  description,
  icon
}: {
  href: string;
  title: string;
  description: string;
  icon: "code" | "snippets" | "components";
}) {
  const Icon = icon === "code" ? FolderKanban : icon === "snippets" ? Sparkles : Plus;
  return (
    <Link href={href} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-indigo-200 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="font-bold text-slate-900 dark:text-white">{title}</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>
    </Link>
  );
}
