"use client";

import { useEffect, useState } from "react";

import { BloggerEditor } from "@/components/editor/BloggerEditor";
import { createClient } from "@/lib/supabase/client";

const starterXml = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns:b="http://www.google.com/2005/gml/b" xmlns:m="http://www.google.com/2005/gml/m">
  <head>
    <b:skin><![CDATA[/* DashPro Blogger CSS */]]></b:skin>
  </head>
  <body>
    <b:section id="main" class="main" showaddelement="yes"></b:section>
  </body>
</html>`;

export default function DashboardEditorPage() {
  const [project, setProject] = useState<{
    id: string;
    title: string;
    project_type: string;
    code_content: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    const query = id
      ? supabase.from("projects").select("id,title,project_type,code_content").eq("id", id).maybeSingle()
      : supabase.from("projects").select("id,title,project_type,code_content").eq("project_type", "blogger_xml").order("updated_at", { ascending: false }).limit(1).maybeSingle();

    void query.then(({ data }) => {
      setProject(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">جارٍ فتح المحرر…</div>;
  }

  if (!project) {
    return <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700"><p className="text-sm text-slate-500">لا يوجد مشروع Blogger XML بعد.</p></div>;
  }

  if (project.project_type !== "blogger_xml") {
    return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">محرر Blogger XML مخصص لمشاريع القوالب بصيغة Blogger XML.</div>;
  }

  return (
    <BloggerEditor
      projectId={project.id}
      projectTitle={project.title}
      initialCode={project.code_content ?? starterXml}
    />
  );
}
