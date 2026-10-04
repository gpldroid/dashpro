"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Languages, LogOut, Moon, Plus, Sun, Wifi, WifiOff } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import { useLanguage } from "@/contexts/language-context";

const routeLabels = [
  { href: "/dashboard/github/delivery", key: "githubDelivery" as const },
  { href: "/dashboard/github", key: "githubManager" as const },
  { href: "/dashboard/projects", key: "projects" as const },
  { href: "/dashboard/editor", key: "templateEditor" as const },
  { href: "/dashboard/local-files", key: "localFiles" as const },
  { href: "/dashboard/snippets", key: "snippets" as const },
  { href: "/dashboard/components", key: "components" as const },
  { href: "/dashboard/settings", key: "settings" as const }
];

export function DashboardHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  async function handleSignOut() {
    try {
      await signOut();
      router.replace("/login");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  }

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    (language === "ar" ? "مستخدم DashPro" : "DashPro user");
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const currentRoute = routeLabels.find(item =>
    pathname === item.href || pathname.startsWith(item.href + "/")
  );
  const currentTitle = currentRoute ? t(currentRoute.key) : t("dashboard");

  return (
    <header className="sticky top-0 z-40 flex min-h-16 w-full min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-slate-200/80 bg-white/90 px-3 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/85 sm:px-5 xl:px-8">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 sm:text-[11px]">
          {t("workspace")}
        </p>
        <p className="mt-0.5 truncate text-sm font-bold text-slate-900 dark:text-white">
          {currentTitle}
        </p>
      </div>

      <div className="flex min-w-0 shrink-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
        <span
          role="status"
          title={online ? t("connected") : t("disconnected")}
          className={`hidden min-h-9 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-semibold sm:inline-flex ${online
            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300"
            : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300"}`}
        >
          {online ? <Wifi className="size-3.5" /> : <WifiOff className="size-3.5" />}
          {online ? t("connected") : t("disconnected")}
        </span>

        <Link
          href="/dashboard/projects/new"
          aria-label={t("newProject")}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-offset-2 sm:px-3.5 sm:text-sm"
        >
          <Plus className="size-4 shrink-0" />
          <span className="hidden sm:inline">{t("newProject")}</span>
        </Link>

        <button
          type="button"
          onClick={toggleLanguage}
          aria-label={t("switchLanguage")}
          title={t("switchLanguage")}
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:px-3 sm:text-sm"
        >
          <Languages className="size-4 shrink-0" />
          <span>{language === "ar" ? "EN" : "عربي"}</span>
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? t("lightMode") : t("darkMode")}
          title={theme === "dark" ? t("lightMode") : t("darkMode")}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>

        <div className="flex min-w-0 max-w-40 items-center gap-2 ps-1 sm:max-w-52 sm:ps-2">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="size-9 shrink-0 rounded-full object-cover" />
          ) : (
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
              {displayName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-bold text-slate-800 dark:text-white">{displayName}</p>
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          aria-label={t("signOut")}
          title={t("signOut")}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-500/10"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </header>
  );
}
