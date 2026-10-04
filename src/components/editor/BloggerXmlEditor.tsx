"use client";
import { useMemo } from "react";
import { AlertTriangle,CheckCircle2,ListTree } from "lucide-react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { beautifyBloggerXml,collectBloggerStructure,parseBloggerXml } from "@/lib/blogger/xmlParser";
export function BloggerXmlEditor({value,onChange,onSave}:{value:string;onChange:(v:string)=>void;onSave?:(v:string)=>void}){
 const doc=useMemo(()=>parseBloggerXml(value),[value]);const tree=useMemo(()=>collectBloggerStructure(doc),[doc]);const insert=(v:string)=>onChange(value+"\n"+v+"\n");
 return <div className="overflow-hidden rounded-2xl border"><EditorToolbar language="xml" onLanguageChange={()=>{}} onFormat={()=>onChange(beautifyBloggerXml(value))} onBeautify={()=>onChange(beautifyBloggerXml(value))} onValidate={()=>{}} onInsert={insert}/><div className="grid lg:grid-cols-[250px_1fr]"><aside className="max-h-[620px] overflow-auto border-e p-3">{doc.errors.length?<div className="mb-3 rounded-xl bg-rose-50 p-3 text-xs text-rose-700"><AlertTriangle className="mb-1 size-4"/>{doc.errors.length} أخطاء</div>:<div className="mb-3 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700"><CheckCircle2 className="mb-1 size-4"/>XML سليم</div>}<div className="mb-2 flex items-center gap-2 text-xs font-bold"><ListTree className="size-4"/>هيكل Blogger</div>{tree.map(n=><div key={n.id} className="truncate py-1 text-xs" style={{paddingRight:n.depth*8}}>{n.tag}</div>)}</aside><CodeEditor value={value} onChange={onChange} onSave={v=>onSave?.(v??value)} language="xml" height="620px"/></div></div>;
}