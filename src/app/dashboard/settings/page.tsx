"use client";

import { Languages, Monitor, Moon, Sun } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useTheme } from "@/contexts/theme-context";

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  return (
    <section className="mx-auto w-full max-w-4xl space-y-5" dir="auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">{t("settings")}</h1>
        <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">{t("settingsDescription")}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2"><Languages className="size-5 text-indigo-600"/><h2 className="font-bold">{t("language")}</h2></div>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" aria-pressed={language === "ar"} onClick={() => setLanguage("ar")} className={`min-h-11 rounded-xl border px-3 text-sm font-semibold ${language === "ar" ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300" : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"}`}>العربية</button>
            <button type="button" aria-pressed={language === "en"} onClick={() => setLanguage("en")} className={`min-h-11 rounded-xl border px-3 text-sm font-semibold ${language === "en" ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300" : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"}`}>English</button>
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2"><Monitor className="size-5 text-indigo-600"/><h2 className="font-bold">{t("appearance")}</h2></div>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" aria-pressed={theme === "light"} onClick={() => setTheme("light")} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold ${theme === "light" ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300" : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"}`}><Sun className="size-4"/>{t("light")}</button>
            <button type="button" aria-pressed={theme === "dark"} onClick={() => setTheme("dark")} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold ${theme === "dark" ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300" : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"}`}><Moon className="size-4"/>{t("dark")}</button>
          </div>
        </section>
      </div>
    </section>
  );
}
