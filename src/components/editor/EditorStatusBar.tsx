"use client";

import { AlertTriangle, CheckCircle2, CircleAlert, FileCode2 } from "lucide-react";
import type { BloggerDiagnostic } from "@/utils/bloggerParser";

interface EditorStatusBarProps {
  line: number; column: number; content: string; diagnostics: BloggerDiagnostic[]; language: string;
}
export function EditorStatusBar({ line, column, content, diagnostics, language }: EditorStatusBarProps) {
  const errors = diagnostics.filter(d => d.severity === "error").length;
  const warnings = diagnostics.filter(d => d.severity === "warning").length;
  const lines = content ? content.split("\n").length : 1;
  return <div className="border-t border-slate-800 bg-slate-950 text-xs text-slate-400">
    <div className="flex flex-wrap items-center gap-4 px-4 py-2">
      <span className="inline-flex items-center gap-1.5"><FileCode2 className="size-3.5" /> {language.toUpperCase()}</span>
      <span>السطر {line}، العمود {column}</span><span>{lines} سطر</span>
      <span className="ms-auto inline-flex items-center gap-1.5 text-red-300"><CircleAlert className="size-3.5" /> {errors} أخطاء</span>
      <span className="inline-flex items-center gap-1.5 text-amber-300"><AlertTriangle className="size-3.5" /> {warnings} تحذيرات</span>
      {errors === 0 && <span className="inline-flex items-center gap-1.5 text-emerald-300"><CheckCircle2 className="size-3.5" /> صالح مبدئيًا</span>}
    </div>
    {diagnostics.length > 0 && <div className="max-h-36 overflow-auto border-t border-slate-800">{diagnostics.slice(0, 20).map((d, i) =>
      <div key={d.code + d.offset + i} className="flex gap-3 px-4 py-1.5 hover:bg-slate-900">
        <span className={d.severity === "error" ? "text-red-300" : "text-amber-300"}>{d.severity === "error" ? "خطأ" : "تنبيه"}</span>
        <span>سطر {d.line}:{d.column} — {d.message}</span>
      </div>)}</div>}
  </div>;
}
