"use client";

import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}

export default DashboardLayout;
