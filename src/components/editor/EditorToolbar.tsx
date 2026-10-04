"use client";
import { CheckCircle2, Code2, Maximize2, Minimize2, Sparkles, Download, Save } from "lucide-react";
import type { CodeLanguage } from "@/types";

export type SaveState = "saved" | "saving" | "unsaved";
type InsertHandler = { bivarianceHack(value: string): void }["bivarianceHack"];

export function EditorToolbar({
  language = "xml",
  onLanguageChange,
  onFormat,
  onValidate,
  onBeautify,
  onInsert,
  insertMode = "section",
  fullscreen,
  onFullscreen,
  saveState,
  onSave,
  onDownload,
}: {
  language?: CodeLanguage;
  onLanguageChange?: (v: CodeLanguage) => void;
  onFormat: () => void;
  onValidate?: () => void;
  onBeautify?: () => void;
  onInsert?: InsertHandler;
  insertMode?: "section" | "snippet";
  fullscreen?: boolean;
  onFullscreen?: () => void;
  saveState?: SaveState;
  onSave?: () => void;
  onDownload?: () => void;
}) {
  const langs: CodeLanguage[] = ["html", "css", "javascript", "typescript", "xml", "java", "json"];
  return (
    <div className="flex flex-wrap items-center gap-2 border-b bg-slate-50 p-2 dark:bg-slate-900">
      <select value={language} onChange={e => onLanguageChange?.(e.target.value as CodeLanguage)} className="rounded-lg border bg-white px-2 py-1.5 text-xs dark:bg-slate-950">
        {langs.map(x => <option key={x}>{x}</option>)}
      </select>
      <button type="button" onClick={onFormat} className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold"><Sparkles className="size-3.5"/>تنسيق</button>
      {onValidate && <button type="button" onClick={onValidate} className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold"><CheckCircle2 className="size-3.5"/>فحص</button>}
      {onBeautify && <button type="button" onClick={onBeautify} className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold"><Code2 className="size-3.5"/>Beautify XML</button>}
      {onInsert && language === "xml" && <button type="button" onClick={() => onInsert(insertMode === "snippet" ? "widget" : '<b:section id="main" showaddelement="yes"></b:section>')} className="rounded-lg border px-2.5 py-1.5 text-xs font-bold">{insertMode === "snippet" ? "Widget" : "Section"}</button>}
      {onSave && <button type="button" onClick={onSave} className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-bold"><Save className="size-3.5"/>حفظ {saveState === "saving" ? "…" : ""}</button>}
      {onDownload && <button type="button" onClick={onDownload} className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-bold"><Download className="size-3.5"/>تنزيل</button>}
      {onFullscreen && <button type="button" onClick={onFullscreen} className="ms-auto rounded-lg border p-1.5">{fullscreen ? <Minimize2 className="size-4"/> : <Maximize2 className="size-4"/>}</button>}
    </div>
  );
}
