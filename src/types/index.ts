export type ProjectType = 'blogger_xml' | 'static_site';

export interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  github_username?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  project_type: ProjectType;
  code_content: string;
  settings: Record<string, unknown>;
  is_public: boolean;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Snippet {
  id: string;
  user_id: string;
  title: string;
  category: string;
  code: string;
  language: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateComponent {
  id: string;
  name: string;
  category: 'header' | 'footer' | 'sidebar' | 'post_grid' | 'slider' | 'widget' | 'custom';
  html_markup: string;
  css_markup?: string;
  js_markup?: string;
  preview_image?: string;
  is_system: boolean;
  user_id?: string;
  created_at: string;
}
