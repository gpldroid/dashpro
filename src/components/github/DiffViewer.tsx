"use client";

import { Diff } from "lucide-react";
import { DiffEditor } from "@monaco-editor/react";

export function DiffViewer({ before, after, language = "plaintext" }: { before: string; after: string; language?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-slate-950">
      <div className="flex items-center gap-2 border-b border-slate-800 px-3 py-2 text-xs text-slate-400">
        <Diff className="size-4" /> مقارنة حقيقية
      </div>
      <DiffEditor
        height="560px"
        theme="dashpro-dark"
        language={language}
        original={before}
        modified={after}
        options={{
          readOnly: true,
          renderSideBySide: true,
          automaticLayout: true,
          minimap: { enabled: false },
          lineNumbers: "on",
          folding: true,
          scrollBeyondLastLine: false,
          renderOverviewRuler: true,
        }}
        loading={<div className="flex h-96 items-center justify-center text-sm text-slate-400">جارٍ تحميل المقارنة…</div>}
      />
    </div>
  );
}
