export type ProjectType = "blogger_xml" | "static_site";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  github_username: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  project_type: ProjectType;
  code_content: string | null;
  settings: Record<string, unknown> | null;
  is_public: boolean | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Snippet {
  id: string;
  user_id: string;
  title: string;
  category: string | null;
  code: string;
  language: string | null;
  is_favorite: boolean | null;
  created_at: string;
  updated_at: string;
}

export type TemplateComponentCategory =
  | "header"
  | "footer"
  | "sidebar"
  | "post_grid"
  | "slider"
  | "widget"
  | "custom";

export interface TemplateComponent {
  id: string;
  name: string;
  category: TemplateComponentCategory;
  html_markup: string;
  css_markup: string | null;
  js_markup: string | null;
  preview_image: string | null;
  is_system: boolean | null;
  user_id: string | null;
  created_at: string;
}
