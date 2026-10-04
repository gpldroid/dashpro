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
import { githubService } from "@/lib/github/githubService";
import type { GithubRepository,StarterTemplate } from "@/types";

export default function DashboardPage(){
 const {session}=useAuth();const [template,setTemplate]=useState<StarterTemplate>(starterTemplates[0]);const [code,setCode]=useState(template.files[0].content);const [repo,setRepo]=useState<GithubRepository|null>(null);const [status,setStatus]=useState("");
 const preview=useMemo(()=>injectBloggerDummyData(code,{data:defaultDummyBlogData}).content,[code]);
 const selectTemplate=(t:StarterTemplate)=>{setTemplate(t);setCode(t.files[0]?.content??"");setStatus("تم تحميل القالب في المحرر.");};
 const save=async()=>{if(!repo||!session){setStatus("اختر مستودع GitHub وسجّل الدخول أولًا.");return;}try{const [owner,name]=repo.full_name.split("/");await githubService.commit(session,owner,name,repo.default_branch,"feat: update Blogger template from DashPro",[{path:template.entryFile,content:code}]);setStatus("تم الحفظ مباشرة في GitHub.");}catch(e){setStatus(e instanceof Error?e.message:"تعذر الحفظ في GitHub.");}};
 return <div className="space-y-6" dir="rtl">
  <section className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-7 text-white shadow-xl"><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-widest text-indigo-200">DashPro Cloud Studio</p><h1 className="text-3xl font-black">استوديو التطوير السحابي</h1><p className="mt-2 max-w-2xl text-sm leading-7 text-indigo-100">حرّر قوالب Blogger، افحص البنية، عاين التصميم على عدة أجهزة، ثم احفظ مباشرة في GitHub.</p></div><button type="button" onClick={()=>void save()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-indigo-700"><Save className="size-4"/>حفظ مباشر في GitHub</button></div></section>
  {status&&<div role="status" className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-700">{status}</div>}
  <section className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="mb-4 flex items-center gap-2"><Play className="size-4 text-indigo-600"/><h2 className="font-black">1. القوالب الجاهزة</h2></div><TemplateSelector selected={template.id} onSelect={selectTemplate}/></section>
  <section className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,.75fr)]"><div className="rounded-2xl border bg-white p-3 dark:border-slate-800 dark:bg-slate-900"><div className="mb-3 flex items-center justify-between"><h2 className="font-black">2. محرر Blogger XML</h2><span className="text-xs text-slate-500">{template.name}</span></div><BloggerXmlEditor value={code} onChange={setCode} onSave={setCode}/></div><div className="space-y-4"><div className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="mb-3 flex items-center gap-2"><Github className="size-4"/><h2 className="font-black">3. GitHub</h2></div><RepoCloner onSelect={r=>{setRepo(r);setStatus("تم اختيار "+r.full_name);}}/>{repo&&<p className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700">المشروع المحدد: {repo.full_name}</p>}</div><div className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><h2 className="mb-3 font-black">4. معاينة حيّة</h2><WebAppViewer document={{title:template.name,html:preview,css:"body{margin:0}",javascript:""}}/></div></div></section>
  <section className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><h2 className="mb-3 font-black">5. المحرر العام</h2><UniversalCodeEditor value={code} onChange={setCode} language="xml"/></section>
 </div>;
}
