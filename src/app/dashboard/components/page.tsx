"use client";
import { useLanguage } from "@/contexts/language-context";

export default function Page() {
  const { t } = useLanguage();
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:rounded-3xl sm:p-8" dir="auto">
      <h1 className="text-2xl font-black text-slate-900 dark:text-white">{t("componentsTitle")}</h1>
      <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">{t("componentsDescription")}</p>
    </section>
  );
}
