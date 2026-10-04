import { notFound } from "next/navigation";

import { BloggerEditor } from "@/components/editor/BloggerEditor";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardEditorPage() {
  const supabase = await createClient();
  const { data: project, error } = await supabase
    .from("projects")
    .select("id,title,project_type,code_content")
    .eq("project_type", "blogger_xml")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("DashPro editor project lookup failed:", error);
  }

  if (!project) {
    notFound();
  }

  if (project.project_type !== "blogger_xml") {
    notFound();
  }

  const initialCode =
    project.code_content ??
    '<?xml version="1.0" encoding="UTF-8"?>\n<html xmlns:b="http://www.google.com/2005/gml/b" xmlns:m="http://www.google.com/2005/gml/m">\n  <head>\n    <b:skin><![CDATA[/* DashPro Blogger CSS */]]></b:skin>\n  </head>\n  <body>\n    <b:section id="main" class="main" showaddelement="yes"></b:section>\n  </body>\n</html>';

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
