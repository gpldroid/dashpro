import type { StarterTemplate } from "@/types";

const shell=(accent:string,title:string,body:string)=>`<?xml version="1.0" encoding="UTF-8" ?>
<b:template-skin><![CDATA[
:root{--accent:${accent};--ink:#0f172a;--bg:#f8fafc}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:system-ui,sans-serif}.wrap{max-width:1100px;margin:auto;padding:24px}.hero{padding:32px;background:var(--accent);color:#fff;border-radius:24px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:20px}.card{background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:18px}.card img{width:100%;aspect-ratio:16/10;object-fit:cover;border-radius:12px}@media(max-width:760px){.grid{grid-template-columns:1fr 1fr}}@media(max-width:520px){.grid{grid-template-columns:1fr}}
]]></b:template-skin>
<b:section id="main" showaddelement="yes"><b:widget id="HTML1" type="HTML" title="${title}"><b:includable id="main"><div class="wrap"><header class="hero"><h1><data:blog.title/></h1><p><data:blog.description/></p></header><section class="grid">${body}</section></div></b:includable></b:widget></b:section>`;
const posts=(extra:string)=>`<b:loop values="data:posts" var="post"><article class="card"><img expr:src="data:post.firstImageUrl" expr:alt="data:post.title"/><h2><a expr:href="data:post.url"><data:post.title/></a></h2><p><data:post.snippet/></p><small><data:post.author/> · <data:post.timestampISO8601/></small>${extra}</article></b:loop>`;
export const starterTemplates:StarterTemplate[]=[
{id:"dashpro-news",name:"مجلة DashPro الإخبارية",category:"news",description:"قالب مجلة RTL متجاوب للأخبار والتصنيفات.",version:"1.0.0",license:"MIT",entryFile:"template.xml",tags:["news","magazine","rtl"],files:[{path:"template.xml",language:"xml",content:shell("#1d4ed8","آخر الأخبار",posts("<p>خبر عاجل ومحتوى تحريري.</p>"))}]},
{id:"dashpro-store",name:"متجر DashPro المصغر",category:"store",description:"واجهة متجر تجريبية خفيفة لعرض المنتجات.",version:"1.0.0",license:"MIT",entryFile:"template.xml",tags:["store","ecommerce","products"],files:[{path:"template.xml",language:"xml",content:shell("#7c3aed","متجري",posts("<strong>السعر التجريبي</strong>"))}]},
{id:"dashpro-personal",name:"مدونة DashPro الشخصية",category:"personal",description:"قالب شخصي بسيط يركز على القراءة والكتابة.",version:"1.0.0",license:"MIT",entryFile:"template.xml",tags:["blog","personal","minimal"],files:[{path:"template.xml",language:"xml",content:shell("#b45309","مدونتي الشخصية",posts("<p>مساحة شخصية للقصص والأفكار.</p>"))}]}
];
export const starterTemplateMap=Object.fromEntries(starterTemplates.map(t=>[t.id,t])) as Record<string,StarterTemplate>;
export function getStarterTemplate(id:string){return starterTemplateMap[id];}
