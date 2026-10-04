"use client";

import {
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  FileCode2,
} from "lucide-react";

import type { BloggerDiagnostic } from "@/utils/bloggerParser";

interface EditorStatusBarProps {
  line: number;
  column: number;
  content: string;
  diagnostics: BloggerDiagnostic[];
  language: string;
  saveState: "saved" | "saving" | "unsaved";
}

export function EditorStatusBar({
  line,
  column,
  content,
  diagnostics,
  language,
  saveState,
}: EditorStatusBarProps) {
  const errors = diagnostics.filter(
    (item) => item.severity === "error",
  ).length;
  const warnings = diagnostics.filter(
    (item) => item.severity === "warning",
  ).length;
  const lines = content ? content.split("\n").length : 1;

  return (
    <div className="border-t border-slate-800 bg-slate-950 text-xs text-slate-400">
      <div className="flex flex-wrap items-center gap-4 px-4 py-2">
        <span className="inline-flex items-center gap-1.5">
          <FileCode2 className="size-3.5" /> {language.toUpperCase()}
        </span>
        <span>
          السطر {line}، العمود {column}
        </span>
        <span>{lines} سطر</span>
        <span className={errors ? "text-rose-300" : "text-emerald-300"}>
          <CircleAlert className="mr-1 inline size-3.5" /> {errors} أخطاء
        </span>
        <span className={warnings ? "text-amber-300" : "text-slate-400"}>
          <AlertTriangle className="mr-1 inline size-3.5" /> {warnings} تحذيرات
        </span>
        <span className="ms-auto">
          {saveState === "saving"
            ? "جارٍ الحفظ…"
            : saveState === "saved"
              ? "تم الحفظ"
              : "تعديلات غير محفوظة"}
        </span>
        {errors === 0 && (
          <span className="inline-flex items-center gap-1.5 text-emerald-300">
            <CheckCircle2 className="size-3.5" /> صالح مبدئيًا
          </span>
        )}
      </div>

      {diagnostics.length > 0 && (
        <div className="max-h-36 overflow-auto border-t border-slate-800">
          {diagnostics.slice(0, 20).map((item, index) => (
            <div
              key={`${item.code}-${item.offset}-${index}`}
              className="flex gap-3 px-4 py-1.5 hover:bg-slate-900"
            >
              <span
                className={
                  item.severity === "error"
                    ? "text-rose-300"
                    : "text-amber-300"
                }
              >
                {item.severity === "error" ? "خطأ" : "تنبيه"}
              </span>
              <span>
                سطر {item.line}:{item.column} — {item.message}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
