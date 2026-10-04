import { notFound } from "next/navigation";

import { BloggerEditor } from "@/components/editor/BloggerEditor";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { createClient } from "@/lib/supabase/server";

export default async function ProjectEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: project, error } = await supabase
    .from("projects")
    .select("id,title,project_type,code_content")
    .eq("id", id)
    .maybeSingle();

  if (error || !project) notFound();

  if (project.project_type !== "blogger_xml") {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          محرر Blogger XML مخصص لمشاريع القوالب بصيغة Blogger XML.
        </div>
      </DashboardLayout>
    );
  }

  const initialCode =
    project.code_content ??
    '<?xml version="1.0" encoding="UTF-8"?>
<html xmlns:b="http://www.google.com/2005/gml/b" xmlns:m="http://www.google.com/2005/gml/m">
  <head>
    <b:skin><![CDATA[/* DashPro Blogger CSS */]]></b:skin>
  </head>
  <body>
    <b:section id="main" class="main" showaddelement="yes"></b:section>
  </body>
</html>';

  return (
    <DashboardLayout>
      <BloggerEditor
        projectId={project.id}
        projectTitle={project.title}
        initialCode={initialCode}
      />
    </DashboardLayout>
  );
}