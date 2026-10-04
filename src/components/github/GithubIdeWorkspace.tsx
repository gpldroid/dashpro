"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Copy, Download, ExternalLink, FilePlus2, FolderPlus, GitBranch, GitCompare, Github, GitPullRequest, Loader2, Plus, RefreshCw, RotateCcw, Save, Search, Trash2, X } from "lucide-react";
import { CodeEditor, type EditorLanguage } from "@/components/editor/CodeEditor";
import { FileExplorer } from "@/components/github/FileExplorer";
import { DiffViewer } from "@/components/github/DiffViewer";
import { useAuth } from "@/contexts/auth-context";
import { githubService, type GithubBranch, type GithubRepository, type GithubTreeEntry } from "@/lib/github/githubService";
import { getErrorMessage } from "@/utils/helpers";

type Status = "modified" | "added" | "deleted";
type FileState = { path:string; content:string; original:string|null; sha?:string; status:Status; staged:boolean };
type Tab = FileState;
type Template = { label:string; description:string; files:Array<{path:string;content:string}> };

const templates:Record<string,Template>={
  blank:{label:"مستودع فارغ",description:"ابدأ من README فقط.",files:[]},
  static:{label:"HTML/CSS/JS",description:"هيكل موقع بسيط.",files:[
    {path:"index.html",content:"<!doctype html>\n<html lang=\"ar\" dir=\"rtl\">\n<head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>مشروعي</title><link rel=\"stylesheet\" href=\"styles.css\"></head>\n<body><main class=\"container\"><h1>مرحبًا من DashPro</h1><p>ابدأ بناء مشروعك هنا.</p></main><script src=\"app.js\"></script></body></html>\n"},
    {path:"styles.css",content:"body{margin:0;font-family:system-ui,sans-serif;background:#f8fafc;color:#0f172a}.container{max-width:900px;margin:80px auto;padding:24px}\n"},
    {path:"app.js",content:"console.log('DashPro project ready');\n"}]},
  blogger:{label:"Blogger XML",description:"بداية قالب Blogger.",files:[
    {path:"template.xml",content:"<?xml version=\"1.0\" encoding=\"UTF-8\" ?>\n<b:template-skin><![CDATA[body{margin:0;font-family:sans-serif}]]></b:template-skin>\n<b:section id=\"main\" class=\"main\" maxwidgets=\"1\" showaddelement=\"yes\"><b:widget id=\"HTML1\" type=\"HTML\" title=\"المحتوى\"><b:includable id=\"main\"><div class=\"content\"><h1><data:blog.pageTitle/></h1></div></b:includable></b:widget></b:section>\n"}]}
};

function language(path:string):EditorLanguage{
  const p=path.toLowerCase();
  if(p.endsWith(".html")||p.endsWith(".htm"))return"html";
  if(p.endsWith(".css"))return"css";
  if(p.endsWith(".js")||p.endsWith(".jsx"))return"javascript";
  if(p.endsWith(".ts")||p.endsWith(".tsx"))return"typescript";
  if(p.endsWith(".json"))return"json";
  if(p.endsWith(".md")||p.endsWith(".mdx"))return"markdown";
  if(p.endsWith(".sql"))return"sql";
  if(p.endsWith(".xml"))return"xml";
  return"plaintext";
}
const dirty=(f:FileState)=>f.status==="added"||f.status==="deleted"||f.content!==f.original;

export function GithubIdeWorkspace(){
  const{session}=useAuth();
  const[repos,setRepos]=useState<GithubRepository[]>([]);
  const[repo,setRepo]=useState<GithubRepository|null>(null);
  const[branches,setBranches]=useState<GithubBranch[]>([]);
  const[branch,setBranch]=useState("");
  const[tree,setTree]=useState<GithubTreeEntry[]>([]);
  const[files,setFiles]=useState<Record<string,FileState>>({});
  const[tabs,setTabs]=useState<Tab[]>([]);
  const[active,setActive]=useState("");
  const[search,setSearch]=useState("");
  const[message,setMessage]=useState("feat: update from DashPro");
  const[status,setStatus]=useState("");
  const[error,setError]=useState("");
  const[loading,setLoading]=useState(false);
  const[saving,setSaving]=useState(false);
  const[showChanges,setShowChanges]=useState(true);
  const[showFile,setShowFile]=useState(false);
  const[newPath,setNewPath]=useState("");
  const[newContent,setNewContent]=useState("");
  const[showRename,setShowRename]=useState(false);
  const[renameTo,setRenameTo]=useState("");
  const[showBranch,setShowBranch]=useState(false);
  const[newBranch,setNewBranch]=useState("");
  const[showRepo,setShowRepo]=useState(false);
  const[repoName,setRepoName]=useState("");
  const[repoDescription,setRepoDescription]=useState("");
  const[repoPrivate,setRepoPrivate]=useState(true);
  const[template,setTemplate]=useState("static");
  const[diff,setDiff]=useState<{before:string;after:string;path:string}|null>(null);
  const[cursor,setCursor]=useState({line:1,column:1});

  const loadRepos=useCallback(async()=>{
    setLoading(true);setError("");
    try{const r=await githubService.listRepositories(session);setRepos(r);if(!repo&&r[0]){setRepo(r[0]);setBranch(r[0].default_branch)}}catch(e){setError(getErrorMessage(e))}finally{setLoading(false)}
  },[session,repo]);
  useEffect(()=>{void loadRepos()},[loadRepos]);

  const loadRemote=useCallback(async()=>{
    if(!repo)return;
    setLoading(true);setError("");
    try{const[o,r]=repo.full_name.split("/");const[b,t]=await Promise.all([githubService.listBranches(session,o,r),githubService.getTree(session,o,r,branch||repo.default_branch)]);setBranches(b);setTree(t.filter(x=>x.type==="blob"));setStatus("تم تحديث GitHub")}catch(e){setError(getErrorMessage(e))}finally{setLoading(false)}
  },[session,repo,branch]);
  useEffect(()=>{if(repo)void loadRemote()},[repo,branch,loadRemote]);

  const open=useCallback(async(path:string)=>{
    if(files[path]){setActive(path);setDiff(null);return}
    if(!repo)return;
    setLoading(true);setError("");
    try{const[o,r]=repo.full_name.split("/");const f=await githubService.getFile(session,o,r,path,branch||repo.default_branch);const next:FileState={path:f.path,content:f.content,original:f.content,sha:f.sha,status:"modified",staged:false};setFiles(x=>({...x,[path]:next}));setTabs(x=>x.some(t=>t.path===path)?x:[...x,next]);setActive(path);setDiff(null);setStatus(path)}catch(e){setError(getErrorMessage(e))}finally{setLoading(false)}
  },[session,repo,branch,files]);

  const activeFile=files[active];
  const changed=useMemo(()=>Object.values(files).filter(dirty),[files]);
  const staged=useMemo(()=>changed.filter(x=>x.staged),[changed]);
  const dirtyPaths=useMemo(()=>changed.map(x=>x.path),[changed]);
  const entries=useMemo(()=>{
    const m=new Map(tree.map(x=>[x.path,x]));
    Object.values(files).forEach(f=>{if(f.status==="deleted")m.delete(f.path);else m.set(f.path,{path:f.path,type:"blob",sha:f.sha,size:f.content.length})});
    return Array.from(m.values()).map(x=>({...x,mode:x.mode??"100644",sha:x.sha??""})).filter(x=>x.path.toLowerCase().includes(search.toLowerCase()));
  },[tree,files,search]);

  const update=(path:string,content:string)=>{setFiles(x=>x[path]?({...x,[path]:{...x[path],content,status:x[path].status==="added"?"added":"modified"}}):x);setTabs(x=>x.map(t=>t.path===path?{...t,content,status:t.status==="added"?"added":"modified"}:t))};
  const stage=(path:string,on:boolean)=>{setFiles(x=>x[path]?({...x,[path]:{...x[path],staged:on}}):x);setTabs(x=>x.map(t=>t.path===path?{...t,staged:on}:t))};

  const discard=(path:string)=>{
    const f=files[path];if(!f)return;
    if(f.status==="added"){setFiles(x=>{const n={...x};delete n[path];return n});setTabs(x=>x.filter(t=>t.path!==path));if(active===path)setActive("");return}
    const next={...f,content:f.original??"",status:"modified" as Status,staged:false};setFiles(x=>({...x,[path]:next}));setTabs(x=>x.map(t=>t.path===path?next:t));setStatus("تم Discard: "+path);
  };

  const createLocal=()=>{
    const p=newPath.trim().replace(/^\/+/, "");
    if(!p||p.includes("..")||files[p]||tree.some(x=>x.path===p)){setError("المسار غير صالح أو موجود مسبقًا.");return}
    const f:FileState={path:p,content:newContent,original:null,status:"added",staged:false};setFiles(x=>({...x,[p]:f}));setTabs(x=>[...x,f]);setActive(p);setNewPath("");setNewContent("");setShowFile(false);setStatus("أُضيف الملف إلى Workspace. Stage ثم Commit."); 
  };

  const remove=()=>{if(!activeFile)return;if(activeFile.status==="added"){discard(active);return}const n={...activeFile,content:"",status:"deleted" as Status,staged:false};setFiles(x=>({...x,[active]:n}));setTabs(x=>x.map(t=>t.path===active?n:t));setStatus("تم وضع الملف للحذف؛ لم يُحفظ بعد.")};
  const rename=()=>{
    if(!activeFile)return;const to=renameTo.trim().replace(/^\/+/, "");
    if(!to||to.includes("..")||files[to]||tree.some(x=>x.path===to)){setError("اسم الوجهة غير صالح أو موجود.");return}
    const from=activeFile.path;const moved={...activeFile,path:to,status:activeFile.status==="added"?"added":"modified",staged:false} as FileState;
    setFiles(x=>{const n={...x};delete n[from];if(activeFile.status!=="added")n[from]={...activeFile,content:"",status:"deleted",staged:false};n[to]=moved;return n});setTabs(x=>x.map(t=>t.path===from?moved:t));setActive(to);setRenameTo("");setShowRename(false);setStatus("إعادة التسمية جاهزة لـ Stage/Commit.");
  };

  const commit=async()=>{
    if(!repo||!staged.length)return;setSaving(true);setError("");
    try{const[o,r]=repo.full_name.split("/");const result=await githubService.commit(session,o,r,branch||repo.default_branch,message.trim()||"chore: update from DashPro",staged.map(f=>f.status==="deleted"?{path:f.path,deleted:true}:{path:f.path,content:f.content}));
      const paths=new Set(staged.map(f=>f.path));
      setFiles(x=>{const n={...x};for(const p of paths){const f=n[p];if(!f)continue;if(f.status==="deleted")delete n[p];else n[p]={...f,original:f.content,status:"modified",staged:false}}return n});
      setTabs(x=>x.filter(t=>!paths.has(t.path)||t.status!=="deleted").map(t=>paths.has(t.path)?{...t,original:t.content,status:"modified",staged:false}:t));
      setStatus("Commit "+result.commit.slice(0,7)+" · "+staged.length+" ملف");await loadRemote();
    }catch(e){setError(getErrorMessage(e))}finally{setSaving(false)}
  };

  const createRepo=async()=>{
    if(!repoName.trim())return;setSaving(true);setError("");
    try{const r=await githubService.createRepository(session,repoName.trim(),repoDescription,repoPrivate);setRepos(x=>[r,...x.filter(a=>a.id!==r.id)]);setRepo(r);setBranch(r.default_branch);const t=templates[template];if(t.files.length){const[o,n]=r.full_name.split("/");await githubService.commit(session,o,n,r.default_branch,"chore: initialize project from DashPro",t.files)}setShowRepo(false);setRepoName("");setRepoDescription("");setStatus("تم إنشاء المشروع والقالب في GitHub");await loadRepos()}catch(e){setError(getErrorMessage(e))}finally{setSaving(false)}
  };

  const createBranch=async()=>{
    if(!repo||!newBranch.trim())return;setSaving(true);setError("");
    try{const[o,r]=repo.full_name.split("/");const b=await githubService.createBranch(session,o,r,newBranch.trim(),branch||repo.default_branch);setBranches(x=>[...x,b]);setBranch(b.name);setFiles({});setTabs([]);setActive("");setNewBranch("");setShowBranch(false);setStatus("تم إنشاء الفرع "+b.name)}catch(e){setError(getErrorMessage(e))}finally{setSaving(false)}
  };

  const createPr=async()=>{
    if(!repo||!branch||branch===repo.default_branch){setError("اختر فرع عمل مختلفًا عن الفرع الافتراضي.");return}
    const title=message.trim()||"Changes from DashPro";setSaving(true);setError("");
    try{const[o,r]=repo.full_name.split("/");const pr=await githubService.createPullRequest(session,o,r,title,branch,repo.default_branch,"تم إنشاء Pull Request من GitHub IDE.",false);setStatus("تم إنشاء PR #"+pr.number)}catch(e){setError(getErrorMessage(e))}finally{setSaving(false)}
  };

  return <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-950 md:p-6" dir="rtl"><div className="mx-auto max-w-[1800px] space-y-4">
    <header className="rounded-2xl border bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex flex-wrap items-center gap-3"><div className="flex size-11 items-center justify-center rounded-xl bg-slate-950 text-white"><Github className="size-5"/></div><div className="me-auto"><h1 className="text-xl font-black">استوديو GitHub IDE</h1><p className="text-xs text-slate-500">Tabs · Explorer · Changes/Staging · Multi-file Commit · Diff · PR</p></div><button onClick={()=>setShowRepo(x=>!x)} className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-bold text-white"><Plus className="me-1 inline size-4"/>مشروع جديد</button><button onClick={()=>void loadRepos()} disabled={loading} className="rounded-xl border px-3 py-2 text-sm font-bold"><RefreshCw className="me-1 inline size-4"/>تحديث</button>{repo&&<a href={repo.html_url} target="_blank" rel="noreferrer" className="rounded-xl border px-3 py-2 text-sm font-bold"><ExternalLink className="me-1 inline size-4"/>GitHub</a>}</div></header>
    {(error||status)&&<div className={error?"rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700":"rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"}>{error||status}</div>}
    {showRepo&&<div className="grid gap-2 rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:grid-cols-5"><input value={repoName} onChange={e=>setRepoName(e.target.value)} placeholder="اسم المستودع" className="rounded-lg border px-3 py-2 text-sm dark:bg-slate-950"/><input value={repoDescription} onChange={e=>setRepoDescription(e.target.value)} placeholder="الوصف" className="rounded-lg border px-3 py-2 text-sm dark:bg-slate-950"/><select value={template} onChange={e=>setTemplate(e.target.value)} className="rounded-lg border px-3 py-2 text-sm dark:bg-slate-950">{Object.entries(templates).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select><button onClick={()=>setRepoPrivate(x=>!x)} className="rounded-lg border px-3 py-2 text-sm">{repoPrivate?<LockIcon/>:<GlobeIcon/>}{repoPrivate?" خاص":" عام"}</button><button onClick={()=>void createRepo()} disabled={saving||!repoName.trim()} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white">إنشاء</button></div>}
    <div className="grid min-h-[800px] overflow-hidden rounded-2xl border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[300px_1fr]">
      <aside className="border-b bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950 lg:border-b-0 lg:border-l"><select value={repo?.full_name||""} onChange={e=>{const r=repos.find(x=>x.full_name===e.target.value);if(r){setRepo(r);setBranch(r.default_branch);setFiles({});setTabs([]);setActive("")}}} className="mb-3 w-full rounded-lg border px-3 py-2 text-sm dark:bg-slate-900"><option value="">اختر مشروعًا</option>{repos.map(r=><option key={r.id} value={r.full_name}>{r.full_name}</option>)}</select><div className="relative mb-3"><Search className="absolute start-2 top-2.5 size-4 text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="بحث" className="w-full rounded-lg border py-2 ps-8 pe-3 text-xs dark:bg-slate-900"/></div><FileExplorer entries={entries} onOpen={p=>void open(p)} activePath={active} dirtyPaths={dirtyPaths}/></aside>
      <main className="min-w-0"><div className="flex flex-wrap items-center gap-2 border-b p-3 dark:border-slate-800"><div className="flex items-center gap-2 rounded-lg border px-2"><GitBranch className="size-4"/><select value={branch} onChange={e=>{if(changed.length&&!window.confirm("تغيير الفرع سيزيل التعديلات المحلية. متابعة؟"))return;setBranch(e.target.value);setFiles({});setTabs([]);setActive("")}} className="max-w-44 bg-transparent py-2 text-sm">{branches.map(b=><option key={b.name}>{b.name}</option>)}</select></div><button onClick={()=>setShowBranch(x=>!x)} className="rounded-lg border px-3 py-2 text-sm font-bold">فرع جديد</button><button onClick={()=>setShowFile(x=>!x)} className="rounded-lg border px-3 py-2 text-sm font-bold"><FilePlus2 className="me-1 inline size-4"/>ملف</button><button onClick={()=>{setNewPath((activeFile?.path.includes("/")?activeFile.path.slice(0,activeFile.path.lastIndexOf("/")+1):"")+"new-folder/.gitkeep");setNewContent("");setShowFile(true)}} className="rounded-lg border px-3 py-2 text-sm font-bold"><FolderPlus className="me-1 inline size-4"/>مجلد</button><button onClick={()=>{if(activeFile){setRenameTo(activeFile.path);setShowRename(true)}}} disabled={!activeFile||activeFile.status==="deleted"} className="rounded-lg border px-3 py-2 text-sm font-bold disabled:opacity-40">إعادة تسمية</button><button onClick={()=>setShowChanges(x=>!x)} className="ms-auto rounded-lg border px-3 py-2 text-sm font-bold">Changes ({changed.length})</button></div>
      {showBranch&&<div className="flex gap-2 border-b bg-indigo-50 p-3 dark:border-slate-800 dark:bg-indigo-950/20"><input value={newBranch} onChange={e=>setNewBranch(e.target.value)} placeholder="اسم الفرع" className="flex-1 rounded-lg border px-3 py-2 text-sm"/><button onClick={()=>void createBranch()} disabled={saving||!newBranch.trim()} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white">إنشاء</button></div>}
      {showFile&&<div className="grid gap-2 border-b bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950 md:grid-cols-[1fr_2fr_auto]"><input value={newPath} onChange={e=>setNewPath(e.target.value)} placeholder="المسار" className="rounded-lg border px-3 py-2 text-sm"/><input value={newContent} onChange={e=>setNewContent(e.target.value)} placeholder="المحتوى" className="rounded-lg border px-3 py-2 text-sm"/><button onClick={createLocal} disabled={!newPath.trim()} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white">إضافة</button></div>}
      {showRename&&<div className="flex gap-2 border-b bg-amber-50 p-3 dark:border-slate-800"><input value={renameTo} onChange={e=>setRenameTo(e.target.value)} className="flex-1 rounded-lg border px-3 py-2 text-sm"/><button onClick={rename} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white">تطبيق</button><button onClick={()=>setShowRename(false)} className="rounded-lg border px-3 py-2">إلغاء</button></div>}
      <div className="flex overflow-x-auto border-b bg-slate-50 dark:border-slate-800 dark:bg-slate-950">{tabs.map(t=><button key={t.path} onClick={()=>{setActive(t.path);setDiff(null)}} className={"flex min-w-40 items-center gap-2 border-e px-3 py-2 text-xs "+(active===t.path?"bg-white font-bold dark:bg-slate-900":"text-slate-500")}><span className={"size-1.5 rounded-full "+(t.staged?"bg-emerald-500":dirty(t)?"bg-amber-500":"bg-slate-300")}/><span className="max-w-32 truncate">{t.path.split("/").pop()}</span><X onClick={e=>{e.stopPropagation();setTabs(x=>x.filter(a=>a.path!==t.path));if(active===t.path)setActive("")}} className="ms-auto size-3"/></button>)}</div>
      <div className="grid min-h-[650px] xl:grid-cols-[1fr_300px]"><section className="min-w-0"><div className="flex flex-wrap items-center gap-2 border-b p-2 dark:border-slate-800"><div className="me-auto"><p className="truncate text-xs font-bold">{activeFile?.path||"اختر ملفًا"}</p>{activeFile&&<p className="text-[10px] text-slate-400">السطر {cursor.line} · العمود {cursor.column}</p>}</div><input value={message} onChange={e=>setMessage(e.target.value)} className="w-48 rounded-lg border px-2 py-1.5 text-xs"/><button onClick={()=>activeFile&&stage(activeFile.path,!activeFile.staged)} disabled={!activeFile||!dirty(activeFile)} className="rounded-lg border px-3 py-1.5 text-xs font-bold">{activeFile?.staged?<Check className="me-1 inline size-3"/>:null}{activeFile?.staged?"Unstage":"Stage"}</button><button onClick={()=>void commit()} disabled={!staged.length||saving} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white">Commit ({staged.length})</button><button onClick={()=>activeFile&&discard(activeFile.path)} disabled={!activeFile||!dirty(activeFile)} className="rounded-lg border px-3 py-1.5 text-xs font-bold"><RotateCcw className="me-1 inline size-3"/>Discard</button><button onClick={remove} disabled={!activeFile} className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600"><Trash2 className="me-1 inline size-3"/>حذف</button><button onClick={()=>activeFile&&setDiff({path:activeFile.path,before:activeFile.original||"",after:activeFile.status==="deleted"?"":activeFile.content})} disabled={!activeFile||!dirty(activeFile)} className="rounded-lg border px-3 py-1.5 text-xs font-bold"><GitCompare className="me-1 inline size-3"/>Diff</button><button onClick={createPr} disabled={!repo||branch===repo?.default_branch||saving} className="rounded-lg border px-3 py-1.5 text-xs font-bold"><GitPullRequest className="me-1 inline size-3"/>PR</button><button onClick={()=>downloadCurrent(activeFile)} disabled={!activeFile||activeFile.status==="deleted"} className="rounded-lg border px-2 py-1.5"><Download className="size-3"/></button><button onClick={()=>void copyCurrent(activeFile)} disabled={!activeFile} className="rounded-lg border px-2 py-1.5"><Copy className="size-3"/></button></div>
      {diff?<div className="p-3"><div className="mb-2 flex items-center justify-between text-xs font-bold">Diff · {diff.path}<button onClick={()=>setDiff(null)} className="rounded border px-2 py-1">إغلاق</button></div><DiffViewer before={diff.before} after={diff.after}/></div>:activeFile?<CodeEditor value={activeFile.content} onChange={v=>update(activeFile.path,v)} onSave={v=>{update(activeFile.path,v??activeFile.content);stage(activeFile.path,true)}} onCursorChange={(line,column)=>setCursor({line,column})} language={language(activeFile.path)} height="590px"/>:<div className="flex h-[590px] items-center justify-center text-sm text-slate-500">{loading?<Loader2 className="animate-spin"/>:"اختر ملفًا من Explorer."}</div>}</section>
      {showChanges&&<aside className="border-t bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950 xl:border-t-0 xl:border-r"><div className="mb-3"><h2 className="text-sm font-black">Changes / Staging</h2><p className="text-[10px] text-slate-500">{staged.length} staged · {changed.length} changed</p></div><div className="space-y-2">{changed.map(f=><div key={f.path} className="rounded-xl border bg-white p-2 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center gap-2"><input type="checkbox" checked={f.staged} onChange={e=>stage(f.path,e.target.checked)}/><button onClick={()=>setActive(f.path)} className="min-w-0 flex-1 truncate text-right text-xs font-bold">{f.path}</button><button onClick={()=>setDiff({path:f.path,before:f.original||"",after:f.status==="deleted"?"":f.content})}><GitCompare className="size-3"/></button></div><div className="mt-2 flex gap-1"><button onClick={()=>stage(f.path,!f.staged)} className="flex-1 rounded border px-2 py-1 text-[10px]">{f.staged?"Unstage":"Stage"}</button><button onClick={()=>discard(f.path)} className="rounded border px-2 py-1"><RotateCcw className="size-3"/></button></div></div>)}</div>{changed.length>0&&<div className="mt-3 space-y-2 border-t pt-3"><button onClick={()=>changed.forEach(f=>stage(f.path,true))} className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white">Stage All</button><button onClick={()=>void commit()} disabled={!staged.length||saving} className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Commit Staged</button></div>}</aside>}</div></main></div>
  </div></div>;
}

function downloadCurrent(file:FileState|undefined){if(!file||file.status==="deleted")return;const blob=new Blob([file.content],{type:"text/plain;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=file.path.split("/").pop()||"file.txt";a.click();URL.revokeObjectURL(url)}
async function copyCurrent(file:FileState|undefined){if(file)await navigator.clipboard.writeText(file.content)}
function LockIcon(){return <span className="me-1">🔒</span>}
function GlobeIcon(){return <span className="me-1">🌐</span>}
