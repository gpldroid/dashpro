"use client";
import Link from "next/link";
import { ArrowRight, Construction } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export default function NewProjectPage() {
  const { t } = useLanguage();
  return (
    <section className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:rounded-3xl sm:p-8" dir="auto">
      <Link href="/dashboard/projects" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-300"><ArrowRight className="size-4" />{t("backProjects")}</Link>
      <div className="mt-8 flex size-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300"><Construction className="size-6" /></div>
      <h1 className="mt-5 text-2xl font-black text-slate-900 dark:text-white">{t("createProjectTitle")}</h1>
      <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">{t("createProjectDescription")}</p>
    </section>
  );
}
