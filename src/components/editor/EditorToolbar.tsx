"use client";

import { Download, FileCode2, FolderPlus, Home, Save, WandSparkles } from "lucide-react";

export type SaveState = "saved" | "saving" | "unsaved";

interface EditorToolbarProps {
  saveState: SaveState;
  onSave: () => void;
  onFormat: () => void;
  onInsert: (snippet: "widget" | "post-if" | "home-if") => void;
  onDownload: () => void;
}

export function EditorToolbar({
  saveState,
  onSave,
  onFormat,
  onInsert,
  onDownload,
}: EditorToolbarProps) {
  const label =
    saveState === "saving"
      ? "جارٍ الحفظ…"
      : saveState === "unsaved"
        ? "تعديلات غير محفوظة"
        : "تم الحفظ";

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 bg-slate-900 px-4 py-3 text-sm">
      <button
        type="button"
        onClick={onSave}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 font-semibold text-white hover:bg-indigo-500"
      >
        <Save className="size-4" /> {label}
      </button>
      <button
        type="button"
        onClick={onFormat}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-slate-200 hover:bg-slate-800"
      >
        <WandSparkles className="size-4" /> تنسيق الكود
      </button>
      <button
        type="button"
        onClick={() => onInsert("widget")}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-slate-300 hover:bg-slate-800"
      >
        <FolderPlus className="size-4" /> ويدجت جديد
      </button>
      <button
        type="button"
        onClick={() => onInsert("post-if")}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-slate-300 hover:bg-slate-800"
      >
        <FileCode2 className="size-4" /> شرط المقال
      </button>
      <button
        type="button"
        onClick={() => onInsert("home-if")}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-slate-300 hover:bg-slate-800"
      >
        <Home className="size-4" /> شرط الرئيسية
      </button>
      <button
        type="button"
        onClick={onDownload}
        className="ms-auto inline-flex items-center gap-2 rounded-lg border border-emerald-700/50 bg-emerald-500/10 px-3 py-2 font-semibold text-emerald-300 hover:bg-emerald-500/20"
      >
        <Download className="size-4" /> template.xml
      </button>
    </div>
  );
}
