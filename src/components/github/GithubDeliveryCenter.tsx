"use client";

import { useCallback, useEffect, useState } from "react";
import { GitCommitHorizontal, GitPullRequest, Loader2, Plus, RefreshCw, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { githubService, type GithubCommit, type GithubPullRequest, type GithubRepository, type GithubBranch } from "@/lib/github/githubService";
import { getErrorMessage } from "@/utils/helpers";

export function GithubDeliveryCenter() {
  const { session } = useAuth();
  const [repos, setRepos] = useState<GithubRepository[]>([]);
  const [branches, setBranches] = useState<GithubBranch[]>([]);
  const [repo, setRepo] = useState<GithubRepository | null>(null);
  const [branch, setBranch] = useState("");
  const [commits, setCommits] = useState<GithubCommit[]>([]);
  const [prs, setPrs] = useState<GithubPullRequest[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [base, setBase] = useState("");
  const [draft, setDraft] = useState(true);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const loadRepos = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await githubService.listRepositories(session);
      setRepos(data);
      if (!repo && data[0]) { setRepo(data[0]); setBranch(data[0].default_branch); setBase(data[0].default_branch); }
    } catch (e) { setError(getErrorMessage(e)); }
    finally { setLoading(false); }
  }, [session, repo]);

  const loadData = useCallback(async () => {
    if (!repo) return;
    setLoading(true); setError("");
    try {
      const [owner, name] = repo.full_name.split("/");
      const [nextBranches, nextCommits, nextPrs] = await Promise.all([
        githubService.listBranches(session, owner, name),
        githubService.listCommits(session, owner, name, branch || repo.default_branch),
        githubService.listPullRequests(session, owner, name),
      ]);
      setBranches(nextBranches);
      setCommits(nextCommits);
      setPrs(nextPrs);
      if (!base) setBase(repo.default_branch);
      if (!branch) setBranch(repo.default_branch);
    } catch (e) { setError(getErrorMessage(e)); }
    finally { setLoading(false); }
  }, [session, repo, branch, base]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- starts an async GitHub fetch
  useEffect(() => { void loadRepos(); }, [loadRepos]);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- starts an async GitHub fetch
  useEffect(() => { void loadData(); }, [loadData]);

  const selectRepo = (value: string) => {
    const next = repos.find((item) => item.full_name === value);
    if (!next) return;
    setRepo(next); setBranch(next.default_branch); setBase(next.default_branch); setCommits([]); setPrs([]);
  };

  const createPr = async () => {
    if (!repo || !branch || !base || !title.trim() || branch === base) return;
    setCreating(true); setError("");
    try {
      const [owner, name] = repo.full_name.split("/");
      const result = await githubService.createPullRequest(session, owner, name, title, branch, base, body, draft);
      setStatus("تم إنشاء Pull Request #" + result.number);
      setTitle(""); setBody("");
      await loadData();
    } catch (e) { setError(getErrorMessage(e)); }
    finally { setCreating(false); }
  };

  return (
    <div className="space-y-5" dir="rtl">
      <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-600 text-white"><GitPullRequest className="size-5" /></div>
          <div className="me-auto"><h1 className="text-xl font-black">مركز التسليم GitHub</h1><p className="text-xs text-slate-500">راجع سجل العمل، أنشئ Pull Request، وأدِر دورة التسليم من داخل DashPro.</p></div>
          <button type="button" onClick={() => void loadData()} disabled={loading || !repo} className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold disabled:opacity-50"><RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} /> تحديث</button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <select value={repo?.full_name ?? ""} onChange={(e) => selectRepo(e.target.value)} className="rounded-xl border px-3 py-2 text-sm dark:bg-slate-950">
            <option value="">اختر المشروع</option>{repos.map((item) => <option key={item.id} value={item.full_name}>{item.full_name}</option>)}
          </select>
          <select value={branch} onChange={(e) => setBranch(e.target.value)} className="rounded-xl border px-3 py-2 text-sm dark:bg-slate-950">
            {branches.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
          </select>
          <select value={base} onChange={(e) => setBase(e.target.value)} className="rounded-xl border px-3 py-2 text-sm dark:bg-slate-950">
            {branches.map((item) => <option key={item.name} value={item.name}>{item.name} · الهدف</option>)}
          </select>
        </div>
      </div>

      {(error || status) && <div role={error ? "alert" : "status"} className={error ? "rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" : "rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"}>{error || status}</div>}

      <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <section className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2"><GitPullRequest className="size-5 text-indigo-600" /><h2 className="font-black">Pull Requests المفتوحة</h2></div>
          <div className="space-y-2">
            {prs.map((pr) => <a key={pr.number} href={pr.url} target="_blank" rel="noreferrer" className="block rounded-xl border p-3 transition hover:border-indigo-300"><div className="flex items-center gap-2"><span className="font-bold">#{pr.number} {pr.title}</span>{pr.draft && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px]">Draft</span>}<ExternalLink className="ms-auto size-3 text-slate-400" /></div><p className="mt-1 text-xs text-slate-500">{pr.head} → {pr.base} · {pr.user}</p></a>)}
            {!prs.length && <p className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-500">لا توجد Pull Requests مفتوحة.</p>}
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2"><Plus className="size-5 text-emerald-600" /><h2 className="font-black">إنشاء Pull Request</h2></div>
          <div className="space-y-3">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان التغيير" className="w-full rounded-xl border px-3 py-2 text-sm dark:bg-slate-950" />
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="وصف التغيير، الاختبارات، والملاحظات…" rows={5} className="w-full rounded-xl border px-3 py-2 text-sm dark:bg-slate-950" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft} onChange={(e) => setDraft(e.target.checked)} /> إنشاء كـ Draft</label>
            <button type="button" onClick={() => void createPr()} disabled={creating || !repo || !title.trim() || !branch || branch === base} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{creating ? <Loader2 className="size-4 animate-spin" /> : <GitPullRequest className="size-4" />} إنشاء Pull Request</button>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center gap-2"><GitCommitHorizontal className="size-5 text-slate-700" /><h2 className="font-black">آخر الـ Commits</h2></div>
        <div className="grid gap-2 md:grid-cols-2">
          {commits.map((commit) => <a key={commit.sha} href={commit.url} target="_blank" rel="noreferrer" className="rounded-xl border p-3 hover:border-indigo-300"><p className="line-clamp-2 text-sm font-semibold">{commit.message}</p><p className="mt-1 text-[11px] text-slate-500">{commit.author} · {commit.sha.slice(0, 7)}{commit.date ? " · " + new Date(commit.date).toLocaleString("ar") : ""}</p></a>)}
          {!commits.length && <p className="text-sm text-slate-500">لا توجد Commits محملة.</p>}
        </div>
      </section>
    </div>
  );
}
