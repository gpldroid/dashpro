"use client";
import { useMemo,useState } from "react";
import { Github,Play,Save } from "lucide-react";
import { BloggerXmlEditor } from "@/components/editor/BloggerXmlEditor";
import { UniversalCodeEditor } from "@/components/editor/UniversalCodeEditor";
import { RepoCloner } from "@/components/github/RepoCloner";
import { WebAppViewer } from "@/components/preview/WebAppViewer";
import { TemplateSelector } from "@/components/templates/TemplateSelector";
import { defaultDummyBlogData,injectBloggerDummyData } from "@/lib/blogger/dummyData";
import { starterTemplates } from "@/data/starterTemplates";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { githubService } from "@/lib/github/githubService";
import type { GithubRepository,StarterTemplate } from "@/types";

export default function DashboardPage(){
 const {session}=useAuth();const {t}=useLanguage();const [template,setTemplate]=useState<StarterTemplate>(starterTemplates[0]);const [code,setCode]=useState(template.files[0].content);const [repo,setRepo]=useState<GithubRepository|null>(null);const [status,setStatus]=useState("");
 const preview=useMemo(()=>injectBloggerDummyData(code,{data:defaultDummyBlogData}).content,[code]);
 const selectTemplate=(next:StarterTemplate)=>{setTemplate(next);setCode(next.files[0]?.content??"");setStatus(t("loadedTemplate"));};
 const save=async()=>{if(!repo||!session){setStatus(t("chooseRepository"));return;}try{const [owner,name]=repo.full_name.split("/");await githubService.commit(session,owner,name,repo.default_branch,"feat: update Blogger template from DashPro",[{path:template.entryFile,content:code}]);setStatus(t("savedGithub"));}catch(e){setStatus(e instanceof Error?e.message:t("unableSave"));}};
 return <div className="space-y-5 sm:space-y-6" dir="auto">
  <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-5 text-white shadow-lg sm:rounded-3xl sm:p-7"><div className="flex min-w-0 flex-col gap-5 xl:flex-row xl:items-center xl:justify-between"><div className="min-w-0"><p className="mb-2 text-xs font-bold uppercase tracking-widest text-indigo-200">DashPro Cloud Studio</p><h1 className="text-2xl font-black sm:text-3xl">{t("cloudStudio")}</h1><p className="mt-2 max-w-2xl text-sm leading-7 text-indigo-100">{t("editBlogger")}</p></div><button type="button" onClick={()=>void save()} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-indigo-700 transition hover:bg-indigo-50"><Save className="size-4"/>{t("saveGithub")}</button></div></section>
  {status&&<div role="status" className="break-words rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200">{status}</div>}
  <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:p-4"><div className="mb-4 flex items-center gap-2"><Play className="size-4 text-indigo-600"/><h2 className="font-black">{t("chooseTemplate")}</h2></div><TemplateSelector selected={template.id} onSelect={selectTemplate}/></section>
  <section className="grid min-w-0 grid-cols-1 gap-4 2xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,.85fr)]"><div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:p-4"><div className="mb-3 flex min-w-0 flex-wrap items-center justify-between gap-2"><h2 className="font-black">{t("bloggerEditor")}</h2><span className="max-w-full truncate text-xs text-slate-500">{template.name}</span></div><BloggerXmlEditor value={code} onChange={setCode} onSave={setCode}/></div><div className="grid min-w-0 gap-4"><div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:p-4"><div className="mb-3 flex items-center gap-2"><Github className="size-4"/><h2 className="font-black">{t("github")}</h2></div><RepoCloner onSelect={r=>{setRepo(r);setStatus(`${t("selectedProject")}: ${r.full_name}`);}}/>{repo&&<p className="mt-3 break-all rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">{t("selectedProject")}: {repo.full_name}</p>}</div><div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:p-4"><h2 className="mb-3 font-black">{t("livePreview")}</h2><WebAppViewer document={{title:template.name,html:preview,css:"body{margin:0}",javascript:""}}/></div></div></section>
  <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:p-4"><h2 className="mb-3 font-black">{t("universalEditor")}</h2><UniversalCodeEditor value={code} onChange={setCode} language="xml"/></section>
 </div>;
}
