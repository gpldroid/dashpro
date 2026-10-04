"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorStatusBar } from "@/components/editor/EditorStatusBar";
import { EditorToolbar, type SaveState } from "@/components/editor/EditorToolbar";
import { createClient } from "@/lib/supabase/client";
import {
  formatBloggerXml,
  generateBloggerXml,
  insertBloggerSnippet,
  parseBloggerXml,
} from "@/utils/bloggerParser";

interface BloggerEditorProps {
  projectId: string;
  projectTitle: string;
  initialCode: string;
}

export function BloggerEditor({
  projectId,
  projectTitle,
  initialCode,
}: BloggerEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveRef = useRef<(source?: string) => Promise<void>>(async () => undefined);

  const analysis = useMemo(() => parseBloggerXml(code), [code]);
  const diagnostics = analysis.diagnostics;

  const save = useCallback(
    async (source = code) => {
      setSaveState("saving");

      try {
        const supabase = createClient();
        const xml = generateBloggerXml(source);
        const { error } = await supabase
          .from("projects")
          .update({ code_content: xml })
          .eq("id", projectId);

        if (error) {
          console.error("DashPro project save failed:", error);
          setSaveState("unsaved");
          return;
        }

        setCode((current) => (current === source ? xml : current));
        setSaveState("saved");
      } catch (error) {
        console.error("DashPro project save failed:", error);
        setSaveState("unsaved");
      }
    },
    [code, projectId],
  );

  saveRef.current = save;

  const scheduleSave = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      void saveRef.current();
    }, 1200);
  }, []);

  const updateCode = useCallback(
    (nextCode: string) => {
      setCode(nextCode);
      setSaveState("unsaved");
      scheduleSave();
    },
    [scheduleSave],
  );

  const format = useCallback(() => {
    try {
      const formatted = formatBloggerXml(code);
      setCode(formatted);
      setSaveState("unsaved");
      scheduleSave();
    } catch (error) {
      console.error("DashPro XML format failed:", error);
    }
  }, [code, scheduleSave]);

  const insert = useCallback(
    (snippet: "widget" | "post-if" | "home-if") => {
      updateCode(insertBloggerSnippet(code, snippet));
    },
    [code, updateCode],
  );

  const download = useCallback(() => {
    try {
      const xml = generateBloggerXml(code);
      const blob = new Blob([xml], {
        type: "application/xml;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "template.xml";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("DashPro XML generation failed:", error);
    }
  }, [code]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-400">
            Blogger XML Editor
          </p>
          <h1 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
            {projectTitle}
          </h1>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>{analysis.sections.length} أقسام</span>
          <span>{analysis.widgets.length} ويدجت</span>
          <span>{analysis.conditionals} شرطيات</span>
          <span>{analysis.loops} حلقات</span>
          <span>{analysis.dataTags.length} data tags</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
        <EditorToolbar
          saveState={saveState}
          onSave={() => void save()}
          onFormat={format}
          onInsert={insert}
          onDownload={download}
        />

        <CodeEditor
          value={code}
          language="xml"
          onChange={updateCode}
          onSave={(source) => void save(source)}
          onFormat={format}
          onCursorChange={(line, column) => setCursor({ line, column })}
        />

        <EditorStatusBar
          line={cursor.line}
          column={cursor.column}
          content={code}
          diagnostics={diagnostics}
          language="xml"
          saveState={saveState}
        />
      </div>
    </section>
  );
}
