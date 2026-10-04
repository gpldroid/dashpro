"use client";

import { useMemo, useState } from "react";
import { Github, Play, Save, Monitor, Code2 } from "lucide-react";
import { BloggerXmlEditor } from "@/components/editor/BloggerXmlEditor";
import { UniversalCodeEditor } from "@/components/editor/UniversalCodeEditor";
import { RepoCloner } from "@/components/github/RepoCloner";
import { WebAppViewer } from "@/components/preview/WebAppViewer";
import { TemplateSelector } from "@/components/templates/TemplateSelector";
import { defaultDummyBlogData, injectBloggerDummyData } from "@/lib/blogger/dummyData";
import { starterTemplates } from "@/data/starterTemplates";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { githubService } from "@/lib/github/githubService";
import type { GithubRepository, StarterTemplate } from "@/types";

export default function DashboardPage() {
  const { session } = useAuth();
  const { t, tr } = useLanguage();

  // Each editor owns its own content state. Template selection only affects Blogger XML.
  const [template, setTemplate] = useState<StarterTemplate>(starterTemplates[0]);
  const [bloggerCode, setBloggerCode] = useState(starterTemplates[0].files[0].content);
  const [universalCode, setUniversalCode] = useState("<!doctype html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>My page</title>\n</head>\n<body>\n  <h1>Hello, world!</h1>\n</body>\n</html>\n");
  const [repo, setRepo] = useState<GithubRepository | null>(null);
  const [bloggerStatus, setBloggerStatus] = useState("");
  const [universalStatus, setUniversalStatus] = useState("");
  const [repoStatus, setRepoStatus] = useState("");

  const bloggerPreview = useMemo(
    () => injectBloggerDummyData(bloggerCode, { data: defaultDummyBlogData }).content,
    [bloggerCode]
  );
  const bloggerPreviewDocument = useMemo(
    () => ({ title: template.name, html: bloggerPreview, css: "body{margin:0}", javascript: "" }),
    [template.name, bloggerPreview]
  );
  const universalPreviewDocument = useMemo(() => {
    const body = universalCode.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? universalCode;
    const embeddedCss = [...universalCode.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(match => match[1]).join("\n");
    const embeddedJs = [...universalCode.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(match => match[1]).join("\n");
    const html = body.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
    return { title: "Universal editor preview", html, css: embeddedCss, javascript: embeddedJs };
  }, [universalCode]);

  const selectTemplate = (next: StarterTemplate) => {
    setTemplate(next);
    setBloggerCode(next.files[0]?.content ?? "");
    setBloggerStatus(t("loadedTemplate"));
  };

  const saveToGithub = async (path: string, content: string, message: string, setStatus: (value: string) => void) => {
    if (!repo || !session) {
      setStatus(t("chooseRepository"));
      return;
    }
    try {
      const [owner, name] = repo.full_name.split("/");
      await githubService.commit(session, owner, name, repo.default_branch, message, [{ path, content }]);
      setStatus(tr("تم حفظ الملف في GitHub.", "File saved to GitHub."));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t("unableSave"));
    }
  };

  const saveBlogger = () => saveToGithub(
    template.entryFile,
    bloggerCode,
    "feat: update Blogger template from DashPro",
    setBloggerStatus
  );
  const saveUniversal = () => saveToGithub(
    "index.html",
    universalCode,
    "feat: update standalone HTML from DashPro",
    setUniversalStatus
  );

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6" dir="auto">
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-5 text-white shadow-lg sm:rounded-3xl sm:p-7">
        <div className="flex min-w-0 flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-indigo-200">DashPro Cloud Studio</p>
            <h1 className="text-2xl font-black sm:text-3xl">{t("cloudStudio")}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-indigo-100">{t("editBlogger")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void saveBlogger()} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-indigo-700 transition hover:bg-indigo-50">
              <Save className="size-4" />{tr("حفظ قالب Blogger","Save Blogger template")}
            </button>
            <button type="button" onClick={() => void saveUniversal()} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/40 bg-indigo-950/20 px-4 py-3 text-sm font-black text-white transition hover:bg-indigo-950/40">
              <Code2 className="size-4" />{tr("حفظ HTML مستقل","Save standalone HTML")}
            </button>
          </div>
        </div>
      </section>

      <section className="grid min-w-0 gap-3 sm:grid-cols-2">
        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-2"><h2 className="font-bold">{t("bloggerEditor")}</h2><span className="text-xs text-indigo-600">{tr("محرر مستقل","Independent editor")}</span></div>
          <p className="mt-1 text-xs text-slate-500">{tr("يحتفظ بمحتوى قالب Blogger ومعاينته وحفظه بشكل منفصل.","Owns its Blogger template, preview, and save action.")}</p>
        </div>
        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-2"><h2 className="font-bold">{t("universalEditor")}</h2><span className="text-xs text-emerald-600">{tr("محرر مستقل","Independent editor")}</span></div>
          <p className="mt-1 text-xs text-slate-500">{tr("يحتفظ بملف HTML الخاص به ولا يتأثر بتغييرات Blogger.","Owns its HTML file and is unaffected by Blogger edits.")}</p>
        </div>
      </section>

      <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:p-4">
        <div className="mb-4 flex items-center gap-2"><Play className="size-4 text-indigo-600" /><h2 className="font-black">{t("chooseTemplate")} — {t("bloggerEditor")}</h2></div>
        <TemplateSelector selected={template.id} onSelect={selectTemplate} />
      </section>

      <section className="grid min-w-0 grid-cols-1 gap-4 2xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,.85fr)]">
        <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:p-4">
          <div className="mb-3 flex min-w-0 flex-wrap items-center justify-between gap-2">
            <div><h2 className="font-black">{t("bloggerEditor")}</h2><p className="mt-1 text-xs text-slate-500">{template.name}</p></div>
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">{tr("حالة مستقلة","Separate state")}</span>
          </div>
          <BloggerXmlEditor value={bloggerCode} onChange={setBloggerCode} onSave={setBloggerCode} />
          {bloggerStatus && <p role="status" className="mt-3 break-words rounded-lg bg-slate-50 p-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{bloggerStatus}</p>}
        </div>

        <aside className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:p-4">
          <div className="mb-3 flex items-center gap-2"><Github className="size-4" /><h2 className="font-black">{t("github")}</h2></div>
          <p className="mb-3 text-xs leading-6 text-slate-500">{tr("اختر المستودع مرة واحدة، ثم احفظ كل محرر في ملف مستقل.","Choose a repository once, then save each editor to its own file.")}</p>
          <RepoCloner onSelect={selected => { setRepo(selected); setRepoStatus(`${t("selectedProject")}: ${selected.full_name}`); }} />
          {(repoStatus || repo) && <p className="mt-3 break-all rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">{repoStatus || `${t("selectedProject")}: ${repo?.full_name}`}</p>}
        </aside>
      </section>

      <section className="min-w-0 space-y-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:p-4">
        <div className="flex flex-wrap items-center gap-2"><Monitor className="size-4 text-indigo-600" /><h2 className="font-black">{t("livePreview")} — {t("bloggerEditor")}</h2></div>
        <WebAppViewer document={bloggerPreviewDocument} />
      </section>

      <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h2 className="font-black">{t("universalEditor")}</h2><p className="mt-1 text-xs text-slate-500">{tr("مستقل تمامًا عن محرر Blogger XML.","Completely independent from the Blogger XML editor.")}</p></div><button type="button" onClick={() => void saveUniversal()} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"><Save className="size-4" />{tr("حفظ index.html","Save index.html")}</button></div>
        <UniversalCodeEditor value={universalCode} onChange={setUniversalCode} language="html" onSave={setUniversalCode} />
        {universalStatus && <p role="status" className="mt-3 break-words rounded-lg bg-slate-50 p-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{universalStatus}</p>}
      </section>

      <section className="min-w-0 space-y-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:p-4">
        <div className="flex flex-wrap items-center gap-2"><Monitor className="size-4 text-emerald-600" /><h2 className="font-black">{t("livePreview")} — {t("universalEditor")}</h2></div>
        <WebAppViewer document={universalPreviewDocument} />
      </section>
    </div>
  );
}
