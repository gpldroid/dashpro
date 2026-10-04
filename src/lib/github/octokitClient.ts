import type { Session } from "@supabase/supabase-js";
import { githubService } from "@/lib/github/githubService";
export const octokitClient={
 listRepositories:(s:Session|null)=>githubService.listRepositories(s),
 getTree:(s:Session|null,owner:string,repo:string,ref?:string)=>githubService.getTree(s,owner,repo,ref),
 getFile:(s:Session|null,owner:string,repo:string,path:string,ref?:string)=>githubService.getFile(s,owner,repo,path,ref),
 listBranches:(s:Session|null,owner:string,repo:string)=>githubService.listBranches(s,owner,repo),
 createBranch:(s:Session|null,owner:string,repo:string,name:string,from:string)=>githubService.createBranch(s,owner,repo,name,from),
 compare:(s:Session|null,owner:string,repo:string,base:string,head:string)=>githubService.compare(s,owner,repo,base,head),
 commit:(s:Session|null,owner:string,repo:string,branch:string,message:string,changes:Parameters<typeof githubService.commit>[5])=>githubService.commit(s,owner,repo,branch,message,changes),
};
export function parseRepositoryUrl(value:string){const match=value.trim().match(/^https?:\/\/github\.com\/([^/]+)\/([^/#?]+)(?:[/#?].*)?$/i);return match?{owner:match[1],repo:match[2].replace(/\.git$/,"")}:null;}
