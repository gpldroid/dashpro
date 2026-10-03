"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Github, LoaderCircle, LockKeyhole, Mail } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "register";

export function AuthCard() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createClient();

      if (mode === "login") {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });
        if (authError) throw authError;
        window.location.assign("/dashboard");
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim() },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`
          }
        });
        if (authError) throw authError;

        if (data.session) {
          window.location.assign("/dashboard");
        } else {
          setMessage("تم إنشاء الحساب. تحقق من بريدك الإلكتروني لتأكيد التسجيل.");
        }
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "تعذر إكمال العملية.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGithubLogin() {
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`
        }
      });
      if (authError) throw authError;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "تعذر تسجيل الدخول عبر GitHub.");
      setBusy(false);
    }
  }

  return (
    <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 sm:p-9">
      <Link href="/" className="mb-8 inline-flex text-2xl font-black tracking-tight text-slate-950 dark:text-white">
        Dash<span className="text-indigo-600">Pro</span>
      </Link>

      <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white">
        {mode === "login" ? "مرحباً بعودتك" : "أنشئ حسابك"}
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
        {mode === "login"
          ? "سجّل الدخول للعودة إلى مساحة عملك."
          : "ابدأ ببناء قوالبك ومواقعك في DashPro."}
      </p>

      <div className="mt-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        <button type="button" onClick={() => setMode("login")} className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${mode === "login" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-500"}`}>
          تسجيل الدخول
        </button>
        <button type="button" onClick={() => setMode("register")} className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${mode === "register" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-500"}`}>
          حساب جديد
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {mode === "register" && (
          <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            الاسم الكامل
            <input required value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950" placeholder="اسمك" />
          </label>
        )}
        <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          البريد الإلكتروني
          <span className="relative block">
            <Mail className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className="w-full rounded-xl border border-slate-200 bg-white py-3 pe-4 ps-11 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950" placeholder="name@example.com" />
          </span>
        </label>
        <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          كلمة المرور
          <span className="relative block">
            <LockKeyhole className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} className="w-full rounded-xl border border-slate-200 bg-white py-3 pe-4 ps-11 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950" placeholder="8 أحرف على الأقل" />
          </span>
        </label>

        {error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{error}</p>}
        {message && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{message}</p>}

        <button disabled={busy} type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
          {busy && <LoaderCircle className="size-4 animate-spin" />}
          {mode === "login" ? "تسجيل الدخول" : "إنشاء الحساب"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        أو
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      </div>

      <button type="button" disabled={busy} onClick={handleGithubLogin} className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
        <Github className="size-5" />
        المتابعة باستخدام GitHub
      </button>

      <p className="mt-6 text-center text-xs leading-6 text-slate-400">
        بالمتابعة، أنت توافق على شروط الاستخدام وسياسة الخصوصية.
      </p>
    </section>
  );
}
