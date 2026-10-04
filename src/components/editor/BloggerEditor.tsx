"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CodeEditor } from "@/components/editor/CodeEditor";
import { LayoutBuilder } from "@/components/builder/LayoutBuilder";
import { StyleCustomizer } from "@/components/builder/StyleCustomizer";
import { PreviewCanvas } from "@/components/preview/PreviewCanvas";
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
  const [builderTab, setBuilderTab] = useState<"preview" | "layout" | "style">("preview");
  const [previewCss, setPreviewCss] = useState("");

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

  const updateSkinVariable = useCallback((name: string, value: string) => {
    const escaped = name.replace(/[.*+?^$()|[\]\\]/g, "\\  const reorderWidgets = useCallback");
    const pattern = new RegExp("(<Variable\\\\b[^>]*\\\\bname=[\\\"']" + escaped + "[\\\"'][^>]*?(?:value|default)=[\\\"'])([^\\\"']*)([\\\"'])", "i");
    const next = code.replace(pattern, "$1" + value + "$3");
    if (next !== code) updateCode(next);
    if (/font/i.test(name)) setPreviewCss("body{font-family:" + value + ",sans-serif}");
    else setPreviewCss("--" + name + ":" + value + ";");
  }, [code, updateCode]);

  const reorderWidgets = useCallback((sectionId: string, activeId: string, overId: string) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(code, "application/xml");
      if (doc.querySelector("parsererror")) return;
      const section = Array.from(doc.getElementsByTagName("*")).find(
        (node) => (node.tagName === "b:section" || node.localName === "section") && node.getAttribute("id") === sectionId,
      );
      if (!section) return;
      const widgets = Array.from(section.children).filter((node) => node.tagName === "b:widget" || node.localName === "widget");
      const active = widgets.find((node) => node.getAttribute("id") === activeId);
      const over = widgets.find((node) => node.getAttribute("id") === overId);
      if (!active || !over || active === over) return;
      section.insertBefore(active, over);
      updateCode(new XMLSerializer().serializeToString(doc));
    } catch (error) {
      console.error("DashPro layout reorder failed:", error);
    }
  }, [code, updateCode]);

  const addComponent = useCallback((sectionId: string, component: { type: string; title: string }) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(code, "application/xml");
      if (doc.querySelector("parsererror")) return;
      const section = Array.from(doc.getElementsByTagName("*")).find(
        (node) => (node.tagName === "b:section" || node.localName === "section") && node.getAttribute("id") === sectionId,
      );
      if (!section) return;
      const widget = doc.createElement("b:widget");
      widget.setAttribute("id", component.type + "DashPro" + Date.now());
      widget.setAttribute("type", component.type);
      widget.setAttribute("title", component.title);
      widget.setAttribute("locked", "false");
      const includable = doc.createElement("b:includable");
      includable.setAttribute("id", "main");
      includable.textContent = component.title;
      widget.appendChild(includable);
      section.appendChild(widget);
      updateCode(new XMLSerializer().serializeToString(doc));
    } catch (error) {
      console.error("DashPro component insertion failed:", error);
    }
  }, [code, updateCode]);

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

        <div className="border-t border-slate-800 bg-slate-950 p-3">
          <div className="mb-3 flex flex-wrap gap-2">
            {([
              ["preview", "المعاينة الحية"],
              ["layout", "باني التخطيط"],
              ["style", "المظهر والألوان"],
            ] as const).map(([value, label]) => (
              <button key={value} type="button" onClick={() => setBuilderTab(value)} className={builderTab === value ? "rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-900" : "rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-slate-300"}>{label}</button>
            ))}
          </div>
          {builderTab === "preview" ? <PreviewCanvas code={code} customCss={previewCss} /> : null}
          {builderTab === "layout" ? <LayoutBuilder sections={analysis.sections} onReorder={reorderWidgets} onAddComponent={addComponent} /> : null}
          {builderTab === "style" ? <StyleCustomizer variables={analysis.skin?.variables ?? []} onChange={updateSkinVariable} /> : null}
        </div>

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
