"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Code2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorStatusBar } from "@/components/editor/EditorStatusBar";
import { EditorToolbar, type SaveState } from "@/components/editor/EditorToolbar";
import { formatBloggerXml, generateBloggerXml, parseBloggerTemplate } from "@/utils/bloggerParser";

const STARTER = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>\n<html b:version=\"2\" xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:b=\"http://www.google.com/2005/gml/b\" xmlns:data=\"http://www.google.com/2005/gml/data\" xmlns:expr=\"http://www.google.com/2005/gml/expr\">\n  <head>\n    <b:skin><![CDATA[\n      <Variable name=\"main.color\" description=\"اللون الرئيسي\" type=\"color\" default=\"#6366f1\" />\n    ]]></b:skin>\n  </head>\n  <body>\n    <b:section id=\"main\" class=\"main\" showaddelement=\"yes\">\n      <b:widget id=\"HTML1\" title=\"محتوى\" type=\"HTML\" version=\"2\" visible=\"true\">\n        <b:includable id=\"main\">المحتوى</b:includable>\n      </b:widget>\n    </b:section>\n  </body>\n</html>\n";

export default function Page() {
  const params = useSearchParams();
  const requestedProjectId = params.get("project");
  const supabase = useMemo(() => createClient(), []);
  const [projectId, setProjectId] = useState<string | null>(requestedProjectId);
  const [title, setTitle] = useState("محرر Blogger");
  const [code, setCode] = useState(STARTER);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const parsed = useMemo(() => parseBloggerTemplate(code), [code]);

  useEffect(() => {
    let active = true;
    async function load() {
      let query = supabase.from("projects").select("id,title,code_content,project_type");
      query = requestedProjectId ? query.eq("id", requestedProjectId) : query.eq("project_type", "blogger_xml").order("updated_at", { ascending: false }).limit(1);
      const { data } = await query.maybeSingle();
      if (!active || !data) return;
      setProjectId(data.id); setTitle(data.title);
      if (data.code_content) setCode(data.code_content);
      setSaveState("saved");
    }
    void load();
    return () => { active = false; };
  }, [requestedProjectId, supabase]);

  const save = useCallback(async (nextCode = code) => {
    if (!projectId) return;
    setSaveState("saving");
    const { error } = await supabase.from("projects").update({ code_content: generateBloggerXml(nextCode) }).eq("id", projectId);
    setSaveState(error ? "unsaved" : "saved");
  }, [code, projectId, supabase]);

  const updateCode = (next: string) => { setCode(next); setSaveState("unsaved"); };
  const insert = (snippet: string) => updateCode(code + (code.endsWith("\n") ? "" : "\n") + snippet);
  const download = () => {
    const url = URL.createObjectURL(new Blob([generateBloggerXml(code)], { type: "application/xml;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "template.xml"; a.click(); URL.revokeObjectURL(url);
  };

  return <section className="flex min-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-xl">
    <div className="flex items-center gap-3 border-b border-slate-800 bg-slate-900 px-4 py-3">
      <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300"><Code2 className="size-5" /></div>
      <div className="min-w-0"><h1 className="truncate font-bold text-white">{title}</h1><p className="text-xs text-slate-400">{projectId ? "مرتبط بالمشروع" : "وضع المعاينة — أنشئ مشروع Blogger للحفظ"}</p></div>
    </div>
    <EditorToolbar saveState={saveState} onSave={() => void save()} onFormat={() => updateCode(formatBloggerXml(code))} onInsert={insert} onDownload={download} />
    <div className="min-h-0 flex-1"><CodeEditor value={code} language="xml" onChange={updateCode} onSave={next => void save(next)} onCursorChange={(line, column) => setCursor({ line, column })} /></div>
    <EditorStatusBar line={cursor.line} column={cursor.column} content={code} diagnostics={parsed.diagnostics} language="xml" />
  </section>;
}
