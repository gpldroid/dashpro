"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Braces, Code2, Github, GitPullRequest, HardDrive, Menu, Puzzle, X } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";

const mobileLinks = [
  { href: "/dashboard", key: "overview" as const },
  { href: "/dashboard/projects", key: "projects" as const },
  { href: "/dashboard/editor", key: "templateEditor" as const },
  { href: "/dashboard/github", key: "githubManager" as const },
  { href: "/dashboard/github/delivery", key: "githubDelivery" as const },
  { href: "/dashboard/local-files", key: "localFiles" as const },
  { href: "/dashboard/snippets", key: "snippets" as const },
  { href: "/dashboard/components", key: "components" as const },
  { href: "/dashboard/settings", key: "settings" as const }
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { t, language } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50 px-4 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">
        {t("checkingSession")}
      </div>
    );
  }

  return (
    <div
      data-dashboard-root
      dir={language === "ar" ? "rtl" : "ltr"}
      className="dashboard-app flex min-h-dvh w-full min-w-0 bg-[var(--app-bg)] text-[var(--app-fg)]"
    >
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(value => !value)}
      />

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <DashboardHeader />

        <div className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 lg:hidden">
          <div className="flex min-h-14 items-center justify-between gap-3 px-3 sm:px-4">
            <span className="min-w-0 truncate text-sm font-bold text-slate-700 dark:text-slate-200">
              {t("navigation")}
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen(value => !value)}
              aria-expanded={menuOpen}
              aria-controls="dashboard-mobile-navigation"
              className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
              {menuOpen ? t("closeMenu") : t("openMenu")}
            </button>
          </div>

          {menuOpen && (
            <nav
              id="dashboard-mobile-navigation"
              aria-label={t("navigation")}
              className="grid grid-cols-1 gap-2 border-t border-[var(--app-border)] p-3 sm:grid-cols-2 sm:p-4"
            >
              {mobileLinks.map(item => {
                const active = item.href === "/dashboard"
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-11 min-w-0 items-center rounded-xl border px-3 py-2 text-start text-xs font-semibold transition-colors ${active
                      ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300"
                      : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"}`}
                  >
                    <span className="truncate">{t(item.key)}</span>
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        <nav
          aria-label={language === "ar" ? "شريط أدوات مساحة العمل" : "Workspace tools"}
          className="hidden min-h-14 items-center gap-2 overflow-x-auto border-b border-slate-200/70 bg-white/70 px-5 py-2 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/60 xl:flex xl:px-8"
        >
          <span className="me-2 shrink-0 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {language === "ar" ? "أدوات سريعة" : "Quick tools"}
          </span>
          {[
            { href: "/dashboard", label: language === "ar" ? "الاستوديو" : "Studio", icon: Braces },
            { href: "/dashboard/editor", label: t("templateEditor"), icon: Code2 },
            { href: "/dashboard/github", label: t("githubManager"), icon: Github },
            { href: "/dashboard/github/delivery", label: t("githubDelivery"), icon: GitPullRequest },
            { href: "/dashboard/snippets", label: t("snippets"), icon: Puzzle },
            { href: "/dashboard/local-files", label: t("localFiles"), icon: HardDrive }
          ].map(item => {
            const active = item.href === "/dashboard"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition-colors ${active
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"}`}
              >
                <Icon className="size-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main className="min-w-0 flex-1 overflow-x-hidden px-3 py-4 sm:px-5 sm:py-6 xl:px-8 xl:py-7">
          <div className="mx-auto w-full min-w-0 max-w-[1680px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
