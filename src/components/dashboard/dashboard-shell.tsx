"use client";

import type { ReactNode } from "react";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Sidebar } from "@/components/dashboard/sidebar";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
