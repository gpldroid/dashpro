export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

type Table<Row, Insert, Update, Relationships extends Relationship[] = []> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: Relationships;
};

export type ProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  github_username: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  project_type: "blogger_xml" | "static_site";
  code_content: string | null;
  settings: Json | null;
  is_public: boolean | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
};

export type SnippetRow = {
  id: string;
  user_id: string;
  title: string;
  category: string | null;
  code: string;
  language: string | null;
  is_favorite: boolean | null;
  created_at: string;
  updated_at: string;
};

export type TemplateComponentRow = {
  id: string;
  name: string;
  category:
    | "header"
    | "footer"
    | "sidebar"
    | "post_grid"
    | "slider"
    | "widget"
    | "custom";
  html_markup: string;
  css_markup: string | null;
  js_markup: string | null;
  preview_image: string | null;
  is_system: boolean | null;
  user_id: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<
        ProfileRow,
        Pick<ProfileRow, "id"> &
          Partial<Omit<ProfileRow, "id" | "created_at" | "updated_at">>,
        Partial<Omit<ProfileRow, "id">>,
        [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ]
      >;
      projects: Table<
        ProjectRow,
        Pick<ProjectRow, "user_id" | "title"> &
          Partial<
            Omit<ProjectRow, "id" | "user_id" | "title" | "created_at" | "updated_at">
          >,
        Partial<Omit<ProjectRow, "id" | "user_id" | "created_at" | "updated_at">>,
        [
          {
            foreignKeyName: "projects_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ]
      >;
      snippets: Table<
        SnippetRow,
        Pick<SnippetRow, "user_id" | "title" | "code"> &
          Partial<
            Omit<SnippetRow, "id" | "user_id" | "title" | "code" | "created_at" | "updated_at">
          >,
        Partial<Omit<SnippetRow, "id" | "user_id" | "created_at" | "updated_at">>,
        [
          {
            foreignKeyName: "snippets_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ]
      >;
      template_components: Table<
        TemplateComponentRow,
        Pick<TemplateComponentRow, "name" | "category" | "html_markup"> &
          Partial<
            Omit<TemplateComponentRow, "id" | "name" | "category" | "html_markup" | "created_at">
          >,
        Partial<Omit<TemplateComponentRow, "id" | "created_at">>,
        [
          {
            foreignKeyName: "template_components_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ]
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<
  Name extends keyof Database["public"]["Tables"]
> = Database["public"]["Tables"][Name]["Row"];
