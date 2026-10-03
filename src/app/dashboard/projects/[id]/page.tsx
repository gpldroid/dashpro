import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: project, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();

  if (error || !project) notFound();

  return (
    <section className="mx-auto max-w-5xl">
      <Link href="/dashboard/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-300"><ArrowRight className="size-4" /> العودة إلى المشاريع</Link>
      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><h1 className="text-2xl font-black text-slate-900 dark:text-white">{project.title}</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{project.project_type === "blogger_xml" ? "قالب Blogger XML" : "موقع ثابت"}</p></div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{project.is_public ? "عام" : "خاص"}</span>
        </div>
        <p className="mt-6 text-sm leading-7 text-slate-600 dark:text-slate-300">{project.description || "لا يوجد وصف لهذا المشروع."}</p>
        <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-xs leading-6 text-slate-200"><pre className="max-h-[28rem] overflow-auto whitespace-pre-wrap break-words">{project.code_content || "لا يوجد محتوى محفوظ بعد."}</pre></div>
      </div>
    </section>
  );
}
