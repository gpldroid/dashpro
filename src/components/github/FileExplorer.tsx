"use client";
import { ChevronDown, ChevronRight, FileCode2, Folder } from "lucide-react";
import { useMemo,useState } from "react";
import type { GithubTreeEntry } from "@/types";
type Node={name:string;path:string;type:"tree"|"blob";children:Node[];entry?:GithubTreeEntry};
export function FileExplorer({entries,onOpen,activePath,dirtyPaths=[]}:{entries:GithubTreeEntry[];onOpen:(path:string)=>void;activePath?:string;dirtyPaths?:string[]}){
 const [open,setOpen]=useState<Record<string,boolean>>({});
 const root=useMemo(()=>{const r:Node={name:"root",path:"",type:"tree",children:[]};for(const e of entries){const parts=e.path.split("/");let cur=r;parts.forEach((name,i)=>{const path=parts.slice(0,i+1).join("/");let n=cur.children.find(x=>x.name===name);if(!n){n={name,path,type:i===parts.length-1?e.type:"tree",children:[],entry:e};cur.children.push(n);}cur=n;});}const sort=(n:Node)=>{n.children.sort((a,b)=>Number(b.type==="tree")-Number(a.type==="tree")||a.name.localeCompare(b.name));n.children.forEach(sort)};sort(r);return r;},[entries]);
 const render=(nodes:Node[],depth=0)=><div>{nodes.map(n=>n.type==="tree"?<div key={n.path}><button type="button" onClick={()=>setOpen(x=>({...x,[n.path]:!x[n.path]}))} className="flex w-full items-center gap-1 rounded-lg px-2 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800" style={{paddingRight:8+depth*14}}>{open[n.path]?<ChevronDown className="size-3"/>:<ChevronRight className="size-3" />}<Folder className="size-3.5"/><span className="truncate">{n.name}</span></button>{open[n.path]&&render(n.children,depth+1)}</div>:<button type="button" key={n.path} onClick={()=>onOpen(n.path)} className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${activePath===n.path?"bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300":"hover:bg-slate-100 dark:hover:bg-slate-800"}`} style={{paddingRight:10+depth*14}}><FileCode2 className="size-3.5"/><span className="truncate">{n.name}</span>{dirtyPaths.includes(n.path)&&<span className="ms-auto size-1.5 rounded-full bg-amber-500"/>}</button>)}</div>;
 return <div className="max-h-[620px] overflow-auto p-2">{render(root.children)}</div>;
}
