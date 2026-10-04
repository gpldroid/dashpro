import Link from "next/link";
import { FolderKanban, Plus } from "lucide-react";

import { ProjectCard } from "@/components/dashboard/project-card";
import type { ProjectRow } from "@/types/database";

export function ProjectsList({ projects }: { projects: ProjectRow[] }) {
  if (projects.length === 0) {
    return (
      <section className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
          <FolderKanban className="size-6" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">لا توجد مشاريع بعد</h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
          أنشئ مشروعك الأول واختر بين قالب Blogger XML أو موقع ثابت HTML.
        </p>
        <Link href="/dashboard/projects/new" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
          <Plus className="size-4" /> إنشاء أول مشروع
        </Link>
      </section>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
