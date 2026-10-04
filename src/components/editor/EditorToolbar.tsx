"use client";

import { Download, FileCode2, FolderPlus, Home, Save, Sparkles, Wand2 } from "lucide-react";

export type SaveState = "saved" | "saving" | "unsaved";
interface EditorToolbarProps {
  saveState: SaveState; onSave: () => void; onFormat: () => void;
  onInsert: (snippet: string) => void; onDownload: () => void;
}
const snippets = [
  { label: "ويدجت جديد", icon: FolderPlus, value: "<b:widget id=\"CustomWidget1\" title=\"ويدجت جديد\" type=\"HTML\" version=\"2\" visible=\"true\">\n  <b:includable id=\"main\">\n    <!-- المحتوى -->\n  </b:includable>\n</b:widget>\n" },
  { label: "شرط المقال", icon: FileCode2, value: "<b:if cond=\"data:blog.pageType == &quot;item&quot;\">\n  <!-- محتوى صفحة المقال -->\n</b:if>\n" },
  { label: "شرط الرئيسية", icon: Home, value: "<b:if cond=\"data:blog.pageType == &quot;index&quot;\">\n  <!-- محتوى الصفحة الرئيسية -->\n</b:if>\n" }
];
export function EditorToolbar({ saveState, onSave, onFormat, onInsert, onDownload }: EditorToolbarProps) {
  const label = saveState === "saving" ? "جارٍ الحفظ..." : saveState === "unsaved" ? "تغييرات غير محفوظة" : "تم الحفظ";
  return <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 bg-slate-900 px-4 py-3 text-sm">
    <button onClick={onSave} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 font-semibold text-white hover:bg-indigo-500"><Save className="size-4" /> حفظ</button>
    <button onClick={onFormat} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-slate-200 hover:bg-slate-800"><Wand2 className="size-4" /> تنسيق الكود</button>
    {snippets.map(({ label: itemLabel, icon: Icon, value }) => <button key={itemLabel} onClick={() => onInsert(value)} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-slate-300 hover:bg-slate-800"><Icon className="size-4" /> {itemLabel}</button>)}
    <button onClick={onDownload} className="ms-auto inline-flex items-center gap-2 rounded-lg border border-emerald-700/50 bg-emerald-500/10 px-3 py-2 font-semibold text-emerald-300 hover:bg-emerald-500/20"><Download className="size-4" /> template.xml</button>
    <span className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1.5 text-xs text-slate-300"><Sparkles className="size-3.5" /> {label}</span>
  </div>;
}
