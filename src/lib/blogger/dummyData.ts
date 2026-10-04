import type { BloggerInjectionOptions, BloggerInjectionResult, DummyBlogData } from "@/types";

export const defaultDummyBlogData:DummyBlogData={
 blogTitle:"مدونة تجريبية من DashPro",blogDescription:"بيانات وهمية للمعاينة فقط.",pageTitle:"آخر المقالات",pageType:"index",url:"https://example.com/",
 labels:["تقنية","تصميم","أعمال"],
 author:{name:"أحمد الكاتب",avatar:"https://i.pravatar.cc/120?img=12",bio:"كاتب ومصمم يهتم بتجارب الويب."},
 posts:[
  {id:"1",title:"بناء واجهة عربية متجاوبة",body:"هذا نص تجريبي طويل للمعاينة داخل الاستوديو.",excerpt:"نص تجريبي للمعاينة.",author:"أحمد الكاتب",authorAvatar:"https://i.pravatar.cc/80?img=12",image:"https://picsum.photos/900/560?random=11",url:"https://example.com/p/1",publishedAt:"2026-10-01T10:00:00Z",labels:["تصميم"],comments:8},
  {id:"2",title:"إدارة المشاريع من السحابة",body:"مثال آخر لبيانات المقالات داخل المعاينة.",excerpt:"مثال آخر للمعاينة.",author:"سارة المصممة",authorAvatar:"https://i.pravatar.cc/80?img=47",image:"https://picsum.photos/900/560?random=12",url:"https://example.com/p/2",publishedAt:"2026-09-28T10:00:00Z",labels:["أعمال"],comments:4},
  {id:"3",title:"تحسين قوالب Blogger",body:"محتوى وهمي يوضح شكل الصفحة أثناء التحرير.",excerpt:"تحسين القوالب.",author:"محمد المطور",authorAvatar:"https://i.pravatar.cc/80?img=33",image:"https://picsum.photos/900/560?random=13",url:"https://example.com/p/3",publishedAt:"2026-09-25T10:00:00Z",labels:["تقنية"],comments:12}
 ]
};

const replaceAll=(s:string,re:RegExp,value:string)=>s.replace(re,value);
export function injectBloggerDummyData(source:string,options:Partial<BloggerInjectionOptions>={data:defaultDummyBlogData}):BloggerInjectionResult{
 const data=options.data??defaultDummyBlogData;let content=source,replacements=0;const warnings:string[]=[];
 const vars:Record<string,string>={
  "data:blog.title":data.blogTitle,"data:blog.description":data.blogDescription,"data:blog.pageTitle":data.pageTitle,"data:view.url":data.url,"data:blog.url":data.url,"data:blog.pageType":data.pageType,
  "data:blog.pageName":data.pageTitle,"data:blog.metaDescription":data.blogDescription
 };
 for(const [key,val] of Object.entries(vars)){const before=content;content=content.replaceAll(`<${key}/>`,val).replaceAll(`<${key} />`,val);if(before!==content)replacements++;}
 const first=data.posts[0];
 const postVars:Record<string,string>={
  "data:post.title":first?.title??"مقال تجريبي","data:post.body":first?.body??"","data:post.snippet":first?.excerpt??"","data:post.url":first?.url??"#","data:post.author":first?.author??data.author.name,"data:post.firstImageUrl":first?.image??"https://picsum.photos/900/560","data:post.timestampISO8601":first?.publishedAt??new Date().toISOString()
 };
 for(const [key,val] of Object.entries(postVars)){const before=content;content=content.replaceAll(`<${key}/>`,val).replaceAll(`<${key} />`,val);if(before!==content)replacements++;}
 if(content.includes("<b:loop"))warnings.push("تمت معاينة أول مقال داخل حلقات Blogger؛ المعاينة لا تمثل محرك Blogger الكامل.");
 if(!options.keepScripts)content=replaceAll(content,/<script[\s\S]*?<\/script>/gi,"");
 return{content,replacements,warnings};
}
