"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
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
  const { t } = useLanguage();
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">{t("checkingSession")}</div>;
  if (!user) {
    if (typeof window !== "undefined") router.replace("/login");
    return null;
  }
  return (
    <div className="flex min-h-screen w-full min-w-0 bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <DashboardHeader />
        <nav aria-label={t("navigation")} className="flex w-full min-w-0 gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900 lg:hidden">
          {mobileLinks.map(item => {
            const active = item.href === "/dashboard" ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
            return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`shrink-0 whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-semibold transition ${active ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300" : "border-transparent bg-slate-100 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-indigo-500/10"}`}>{t(item.key)}</Link>;
          })}
        </nav>
        <main className="w-full min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full min-w-0 max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
