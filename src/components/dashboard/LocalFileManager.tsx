"use client";

import { Download, FileDown, FileUp, Upload } from "lucide-react";
import { ChangeEvent, useMemo, useState } from "react";
import { useLanguage } from "@/contexts/language-context";

type LocalFile = { name: string; size: number; type: string; file: File };

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function LocalFileManager() {
  const { tr, language } = useLanguage();
  const [file, setFile] = useState<LocalFile | null>(null);
  const [preview, setPreview] = useState("");
  const [exportName, setExportName] = useState("dashpro-export.txt");
  const [exportContent, setExportContent] = useState("");
  const [message, setMessage] = useState("");

  const isText = useMemo(() => file ? file.type.startsWith("text/") || /\.(txt|md|json|csv|xml|html|css|js|ts|tsx|jsx|sql|yaml|yml)$/i.test(file.name) : false, [file]);

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    setFile({ name: selected.name, size: selected.size, type: selected.type || "application/octet-stream", file: selected });
    setExportName(selected.name);
    setMessage(tr("تم استيراد «" + selected.name + "» محليًا.", "Imported “" + selected.name + "” locally."));
    if (selected.size <= 2 * 1024 * 1024 && (selected.type.startsWith("text/") || /\.(txt|md|json|csv|xml|html|css|js|ts|tsx|jsx|sql|yaml|yml)$/i.test(selected.name))) {
      setPreview(await selected.text());
    } else {
      setPreview("");
    }
  }

  function downloadImported() {
    if (!file) return;
    const url = URL.createObjectURL(file.file);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = file.name;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage(tr("تم تصدير «" + file.name + "» إلى جهازك.", "Exported “" + file.name + "” to your device."));
  }

  function exportText() {
    const blob = new Blob([exportContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = exportName.trim() || "dashpro-export.txt";
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage(tr("تم إنشاء الملف وتصديره إلى جهازك.", "File created and downloaded to your device."));
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6" dir={language === "ar" ? "rtl" : "ltr"}>
      <div>
        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{tr("الملفات المحلية", "Local files")}</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">{tr("استيراد وتصدير الملفات", "Import and export files")}</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{tr("استورد ملفًا من جهازك أو أنشئ ملفًا نصيًا وقم بتصديره. الملفات المستوردة تبقى داخل المتصفح ولا يتم رفعها إلى الخادم.", "Import a file from your device or create and download a text file. Imported files stay in your browser and are never uploaded to a server.")}</p>
      </div>

      {message && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">{message}</div>}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300"><FileUp className="size-5" /></div>
            <div><h2 className="font-bold">{tr("استيراد ملف من الجهاز", "Import a file from device")}</h2><p className="text-xs text-slate-500">{tr("اختر أي ملف من جهازك.", "Choose any file from your device.")}</p></div>
          </div>
          <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 px-5 py-10 text-center transition hover:border-indigo-400 hover:bg-indigo-50/40 dark:border-slate-700 dark:hover:border-indigo-500 dark:hover:bg-indigo-500/5">
            <Upload className="mb-3 size-8 text-slate-400" />
            <span className="text-sm font-bold">{tr("اختر ملفًا من جهازك", "Choose a file from your device")}</span>
            <span className="mt-1 text-xs text-slate-500">{tr("معاينة الملفات النصية الصغيرة", "Preview small text files")}</span>
            <input type="file" className="hidden" onChange={handleImport} />
          </label>
          {file && <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800/70">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0"><p className="truncate font-bold">{file.name}</p><p className="mt-1 text-xs text-slate-500">{formatSize(file.size)} · {file.type}</p></div>
              <button onClick={downloadImported} className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900"><Download className="size-4" /> {tr("تصدير", "Download")}</button>
            </div>
          </div>}
          {file && isText && <div className="mt-4"><p className="mb-2 text-xs font-bold text-slate-500">{tr("معاينة", "Preview")}</p><pre className="max-h-72 overflow-auto rounded-xl bg-slate-950 p-4 text-left text-xs leading-6 text-slate-200" dir="ltr">{preview || tr("الملف فارغ.", "The file is empty.")}</pre></div>}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"><FileDown className="size-5" /></div>
            <div><h2 className="font-bold">{tr("تصدير ملف محلي جديد", "Create a local file")}</h2><p className="text-xs text-slate-500">{tr("اكتب المحتوى وسيتم تنزيله مباشرة.", "Enter content and download it instantly.")}</p></div>
          </div>
          <label className="mt-5 block text-xs font-bold text-slate-500">{tr("اسم الملف", "File name")}</label>
          <input value={exportName} onChange={(e) => setExportName(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-indigo-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950" dir="ltr" />
          <label className="mt-4 block text-xs font-bold text-slate-500">{tr("المحتوى", "Content")}</label>
          <textarea value={exportContent} onChange={(e) => setExportContent(e.target.value)} placeholder={tr("اكتب النص أو JSON أو CSV هنا...", "Enter text, JSON, or CSV here...")} className="mt-2 min-h-64 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm outline-none ring-indigo-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950" dir="ltr" />
          <button onClick={exportText} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"><Download className="size-4" /> {tr("تصدير إلى الجهاز", "Download to device")}</button>
        </div>
      </div>
    </section>
  );
}
