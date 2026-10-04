export type ProjectType = "blogger_xml" | "static_site";

export interface Profile { id:string; full_name:string|null; avatar_url:string|null; github_username:string|null; created_at:string; updated_at:string; }
export interface Project { id:string; user_id:string; title:string; description:string|null; project_type:ProjectType; code_content:string|null; settings:Record<string,unknown>|null; is_public:boolean|null; thumbnail_url:string|null; created_at:string; updated_at:string; }
export interface Snippet { id:string; user_id:string; title:string; category:string|null; code:string; language:string|null; is_favorite:boolean|null; created_at:string; updated_at:string; }
export type TemplateComponentCategory="header"|"footer"|"sidebar"|"post_grid"|"slider"|"widget"|"custom";
export interface TemplateComponent { id:string; name:string; category:TemplateComponentCategory; html_markup:string; css_markup:string|null; js_markup:string|null; preview_image:string|null; is_system:boolean|null; user_id:string|null; created_at:string; }

export interface GithubRepository { id:number; name:string; full_name:string; private:boolean; default_branch:string; html_url:string; description:string|null; owner?:string; updated_at?:string|null; }
export interface GithubTreeEntry { path:string; mode:string; type:"blob"|"tree"; sha:string; size?:number; url?:string; }
export interface GithubFile { path:string; sha:string; size:number; content:string; encoding?:string; html_url?:string; }
export interface GithubBranch { name:string; sha:string; protected:boolean; }
export interface GithubCommit { sha:string; message:string; author:string; date:string|null; url:string; }
export interface GithubPullRequest { number:number; title:string; state:"open"|"closed"; draft:boolean|null; head:string; base:string; user:string; url:string; updated_at:string; }
export interface GithubChange { path:string; content?:string; deleted?:boolean; mode?:"100644"|"100755"; }
export interface GithubCommitResult { commit:string; branch:string; url:string; files:string[]; }

export interface BloggerAstNode { id:string; type:"element"|"text"|"comment"; name:string; attributes:Record<string,string>; children:BloggerAstNode[]; text?:string; parentId:string|null; depth:number; start:number; end:number; }
export interface BloggerAstDocument { root:BloggerAstNode; source:string; errors:BloggerXmlError[]; }
export interface BloggerXmlError { message:string; line:number; column:number; index:number; severity:"error"|"warning"; }
export interface BloggerStructuralItem { id:string; tag:string; type:"section"|"widget"|"includable"|"skin"|"element"; attributes:Record<string,string>; depth:number; parentId:string|null; start:number; end:number; }
export interface XmlMutation { nodeId:string; attribute?:string; value?:string; replaceWith?:string; deleteNode?:boolean; }

export type BloggerTemplateCategory="news"|"store"|"personal";
export interface StarterTemplate { id:string; name:string; category:BloggerTemplateCategory; description:string; version:string; license:string; entryFile:string; files:Array<{path:string;language:"xml"|"html"|"css"|"javascript"|"json";content:string}>; tags:string[]; }

export type CodeLanguage="html"|"css"|"javascript"|"typescript"|"xml"|"java"|"json"|"markdown"|"sql"|"plaintext";
export type ViewerDeviceId="desktop-1920"|"desktop-1440"|"iphone-15-pro"|"samsung-s24"|"tablet-768"|"tablet-1024";
export type ViewerOrientation="portrait"|"landscape";
export interface ViewerDevice { id:ViewerDeviceId; label:string; platform:"desktop"|"android"|"ios"|"tablet"; width:number; height:number; frame:boolean; radius:number; orientation:ViewerOrientation; }
export interface PreviewDocument { html:string; css:string; javascript:string; title?:string; }
export interface DummyPost { id:string; title:string; body:string; excerpt:string; author:string; authorAvatar:string; image:string; url:string; publishedAt:string; labels:string[]; comments:number; }
export interface DummyBlogData { blogTitle:string; blogDescription:string; pageTitle:string; pageType:"item"|"archive"|"index"|"static_page"; url:string; posts:DummyPost[]; labels:string[]; author:{name:string;avatar:string;bio:string}; }
export interface BloggerInjectionOptions { data:DummyBlogData; keepScripts?:boolean; imageWidth?:number; }
export interface BloggerInjectionResult { content:string; replacements:number; warnings:string[]; }
