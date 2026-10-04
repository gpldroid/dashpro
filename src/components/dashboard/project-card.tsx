import Link from "next/link";
import { ArrowUpLeft, Code2, Globe2 } from "lucide-react";

import type { ProjectRow } from "@/types/database";

export function ProjectCard({ project }: { project: ProjectRow }) {
  const isBlogger = project.project_type === "blogger_xml";

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-black/20">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex size-11 items-center justify-center rounded-xl ${isBlogger ? "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300" : "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300"}`}>
          {isBlogger ? <Code2 className="size-5" /> : <Globe2 className="size-5" />}
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${project.is_public ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
          {project.is_public ? "عام" : "خاص"}
        </span>
      </div>
      <h3 className="mt-5 truncate text-base font-bold text-slate-900 dark:text-white">{project.title}</h3>
      <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500 dark:text-slate-400">
        {project.description || (isBlogger ? "قالب Blogger بصيغة XML" : "مشروع موقع ثابت")}
      </p>
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-400 dark:border-slate-800">
        <span>{new Date(project.updated_at).toLocaleDateString("ar")}</span>
        <Link href={`/dashboard/editor?id=${project.id}`} className="inline-flex items-center gap-1 font-semibold text-indigo-600 transition group-hover:text-indigo-700 dark:text-indigo-300">
          فتح المشروع <ArrowUpLeft className="size-3.5" />
        </Link>
      </div>
    </article>
  );
}
