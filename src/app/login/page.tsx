import type { Metadata } from "next";
import { ArrowLeft, Blocks, Code2, Sparkles } from "lucide-react";

import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = {
  title: "تسجيل الدخول"
};

const benefits = [
  {
    icon: Sparkles,
    title: "ابنِ بصرياً",
    text: "صمّم صفحاتك وقوالب Blogger بسرعة من واجهة واحدة."
  },
  {
    icon: Code2,
    title: "تحكم كامل بالكود",
    text: "حرّر HTML وCSS وJavaScript مع معاينة مباشرة."
  },
  {
    icon: Blocks,
    title: "مشاريعك في مكان واحد",
    text: "احفظ مشاريعك ومكوناتك واستمر من حيث توقفت."
  }
];

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-200/50 blur-3xl dark:bg-indigo-950/40" />
      <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl dark:bg-cyan-950/30" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-7xl items-center gap-12 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_460px] lg:px-8">
        <section className="hidden lg:block">
          <div className="max-w-xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm backdrop-blur dark:border-indigo-900/60 dark:bg-slate-900/70 dark:text-indigo-300">
              <span className="size-2 rounded-full bg-emerald-500" />
              DashPro Builder
            </div>

            <h2 className="text-5xl font-black leading-[1.1] tracking-tight text-slate-950 dark:text-white">
              كل أدوات بناء موقعك
              <span className="block bg-gradient-to-l from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                في لوحة واحدة.
              </span>
            </h2>

            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600 dark:text-slate-400">
              ادخل إلى مساحة عمل DashPro لإدارة المشاريع، تعديل القوالب،
              ومعاينة التصميم قبل التصدير.
            </p>

            <div className="mt-10 space-y-5">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div key={benefit.title} className="flex gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {benefit.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {benefit.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
              <ArrowLeft className="size-4" />
              سجّل الدخول للانتقال مباشرة إلى لوحة التحكم
            </div>
          </div>
        </section>

        <div className="flex w-full justify-center lg:justify-end">
          <AuthCard />
        </div>
      </div>
    </main>
  );
}
