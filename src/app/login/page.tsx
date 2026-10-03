import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = {
  title: "تسجيل الدخول"
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <AuthCard />
    </main>
  );
}
