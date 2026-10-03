"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Sidebar } from "@/components/dashboard/sidebar";

const mobileLinks = [
  { href: "/dashboard", label: "الرئيسية" },
  { href: "/dashboard/projects", label: "المشاريع" },
  { href: "/dashboard/editor", label: "المحرر" },
  { href: "/dashboard/snippets", label: "الأكواد" },
  { href: "/dashboard/components", label: "المكونات" },
  { href: "/dashboard/settings", label: "الإعدادات" }
];

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader />
        <nav aria-label="التنقل الرئيسي" className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 lg:hidden">
          {mobileLinks.map((item) => (
            <Link key={item.href} href={item.href} className="shrink-0 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300">
              {item.label}
            </Link>
          ))}
        </nav>
        <main className="flex-1 p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
