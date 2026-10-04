"use client";

import Link from "next/link";
import { Languages, LogOut, Moon, Plus, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import { useLanguage } from "@/contexts/language-context";

export function DashboardHeader() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

  async function handleSignOut() {
    try { await signOut(); router.push("/login"); }
    catch (error) { console.error("Sign out failed:", error); }
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || (language === "ar" ? "مستخدم DashPro" : "DashPro user");
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

  return (
    <header className="sticky top-0 z-40 flex min-h-16 w-full min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-slate-200 bg-white/95 px-3 py-3 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95 sm:px-5 xl:px-8">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-slate-400 sm:text-xs">{t("workspace")}</p>
        <p className="mt-0.5 truncate text-sm font-bold text-slate-900 dark:text-white">{t("dashboard")}</p>
      </div>
      <div className="flex min-w-0 shrink-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
        <Link href="/dashboard/projects/new" aria-label={t("newProject")} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 sm:px-3.5 sm:text-sm">
          <Plus className="size-4 shrink-0" /><span className="hidden sm:inline">{t("newProject")}</span>
        </Link>
        <button type="button" onClick={toggleLanguage} aria-label={t("switchLanguage")} title={t("switchLanguage")} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:px-3 sm:text-sm">
          <Languages className="size-4 shrink-0" /><span>{language === "ar" ? "EN" : "عربي"}</span>
        </button>
        <button type="button" onClick={toggleTheme} aria-label={theme === "dark" ? t("lightMode") : t("darkMode")} title={theme === "dark" ? t("lightMode") : t("darkMode")} className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
        <div className="flex min-w-0 max-w-40 items-center gap-2 ps-1 sm:max-w-52 sm:ps-2">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="size-9 shrink-0 rounded-full object-cover" />
          ) : (
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">{displayName.slice(0, 1).toUpperCase()}</div>
          )}
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-bold text-slate-800 dark:text-white">{displayName}</p>
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>
        <button type="button" onClick={handleSignOut} aria-label={t("signOut")} title={t("signOut")} className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-500/10"><LogOut className="size-4" /></button>
      </div>
    </header>
  );
}
