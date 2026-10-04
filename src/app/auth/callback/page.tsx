"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const requestedNext = url.searchParams.get("next");
    const next =
      requestedNext?.startsWith("/dashpro/") && !requestedNext.startsWith("//")
        ? requestedNext
        : "/dashpro/dashboard";

    if (!code) {
      setError("لم يصل رمز المصادقة من مزود تسجيل الدخول.");
      return;
    }

    void supabase.auth
      .exchangeCodeForSession(code)
      .then(({ error: exchangeError }) => {
        if (exchangeError) {
          setError(exchangeError.message);
          return;
        }
        router.replace(next);
      });
  }, [router]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <section className="max-w-md rounded-2xl border border-rose-200 bg-white p-7 text-center shadow-sm dark:border-rose-900 dark:bg-slate-900">
          <h1 className="text-lg font-bold text-rose-700 dark:text-rose-300">تعذر إكمال تسجيل الدخول</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{error}</p>
          <button onClick={() => router.replace("/login")} className="mt-5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white">العودة إلى تسجيل الدخول</button>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <LoaderCircle className="size-4 animate-spin" />
        جارٍ إكمال تسجيل الدخول…
      </div>
    </main>
  );
}
