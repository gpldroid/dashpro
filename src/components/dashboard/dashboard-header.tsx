"use client";

import { Languages, LogOut, Moon, Sun } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import { useDirection } from "@/contexts/direction-context";

export function DashboardHeader() {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { direction, toggleDirection } = useDirection();

  async function handleSignOut() {
    try {
      await signOut();
      window.location.assign("/login");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  }

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "مستخدم DashPro";
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 sm:px-8">
      <div>
        <p className="text-xs font-medium text-slate-400">مساحة العمل</p>
        <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">لوحة التحكم</p>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <button type="button" onClick={toggleDirection} aria-label={direction === "rtl" ? "التبديل إلى الاتجاه من اليسار لليمين" : "التبديل إلى الاتجاه من اليمين لليسار"} title={direction === "rtl" ? "LTR" : "RTL"} className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
          <Languages className="size-4" />
        </button>
        <button type="button" onClick={toggleTheme} aria-label={theme === "dark" ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"} className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="size-10 rounded-full object-cover" />
          ) : (
            <div className="flex size-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
              {displayName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="hidden text-start sm:block">
            <p className="max-w-40 truncate text-sm font-bold text-slate-800 dark:text-white">{displayName}</p>
            <p className="max-w-40 truncate text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>
        <button type="button" onClick={handleSignOut} aria-label="تسجيل الخروج" className="rounded-xl p-2.5 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-500/10">
          <LogOut className="size-4" />
        </button>
      </div>
    </header>
  );
}
