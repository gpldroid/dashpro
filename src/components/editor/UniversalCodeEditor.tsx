"use client";
import { useState } from "react";
import { CodeEditor,type EditorLanguage } from "@/components/editor/CodeEditor";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import type { CodeLanguage } from "@/types";
const editorLanguage=(v:CodeLanguage):EditorLanguage=>v==="java"?"plaintext":v;
const formatCode=(v:string,l:CodeLanguage)=>{if(l==="json"){try{return JSON.stringify(JSON.parse(v),null,2)}catch{return v}}return v.replace(/[ \t]+\n/g,"\n").replace(/\n{3,}/g,"\n\n").trim()+"\n"};
export function UniversalCodeEditor({value,onChange,language="html",onSave,height="620px"}:{value:string;onChange:(v:string)=>void;language?:CodeLanguage;onSave?:(v:string)=>void;height?:string}){
 const [lang,setLang]=useState(language);const [message,setMessage]=useState("");
 const validate=()=>{let valid=true;try{if(lang==="json")JSON.parse(value)}catch{valid=false}setMessage(valid?"الفحص الأساسي سليم.":"تم اكتشاف خطأ في JSON.");};
 return <div className="overflow-hidden rounded-2xl border"><EditorToolbar language={lang} onLanguageChange={setLang} onFormat={()=>onChange(formatCode(value,lang))} onValidate={validate}/>{message&&<div className="border-b px-3 py-2 text-xs">{message}</div>}<CodeEditor value={value} onChange={onChange} onSave={v=>onSave?.(v??value)} language={editorLanguage(lang)} height={height}/></div>;
}