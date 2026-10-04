"use client";

import { useEffect, useState } from "react";

import { ProjectCard } from "@/components/dashboard/project-card";
import { createClient } from "@/lib/supabase/client";
import type { ProjectRow } from "@/types/database";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    void supabase
      .from("projects")
      .select("*")
      .order("updated_at", { ascending: false })
      .then(({ data, error: queryError }) => {
        setProjects((data ?? []) as ProjectRow[]);
        setError(Boolean(queryError));
        setLoading(false);
      });
  }, []);

  return (
    <section className="mx-auto max-w-7xl">
      <h1 className="text-2xl font-black text-slate-900 dark:text-white">المشاريع</h1>
      <p className="mb-7 mt-2 text-sm text-slate-500 dark:text-slate-400">جميع قوالب Blogger ومشاريع المواقع الخاصة بك.</p>
      {error ? (
        <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">تعذر تحميل المشاريع. تحقق من إعداد قاعدة البيانات وسياسات الوصول.</p>
      ) : loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">جارٍ تحميل المشاريع…</div>
      ) : projects.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{projects.map((project) => <ProjectCard key={project.id} project={project} />)}</div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500 dark:border-slate-700">لم تنشئ أي مشروع حتى الآن.</div>
      )}
    </section>
  );
}
