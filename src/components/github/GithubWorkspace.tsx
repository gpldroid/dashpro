"use client";

import { useCallback, useMemo, useState } from "react";
import { GitBranch, GitCommitHorizontal, Github, Loader2, RefreshCw, Save, Search, FolderTree } from "lucide-react";

import { CodeEditor } from "@/components/editor/CodeEditor";
import { useAuth } from "@/contexts/auth-context";
import { githubService, type GithubRepository, type GithubTreeEntry } from "@/lib/github/githubService";
import { getErrorMessage } from "@/utils/helpers";

export function GithubWorkspace() {
  const { session } = useAuth();
  const [repos, setRepos] = useState<GithubRepository[]>([]);
  const [tree, setTree] = useState<GithubTreeEntry[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GithubRepository | null>(null);
  const [selectedPath, setSelectedPath] = useState("");
  const [code, setCode] = useState("");
  const [originalCode, setOriginalCode] = useState("");
  const [branch, setBranch] = useState("");
  const [commitMessage, setCommitMessage] = useState("feat: update from DashPro");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadRepos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const next = await githubService.listRepositories(session);
      setRepos(next);
      if (!selectedRepo && next[0]) {
        setSelectedRepo(next[0]);
        setBranch(next[0].default_branch);
      }
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [session, selectedRepo]);

  const loadTree = useCallback(async () => {
    if (!selectedRepo) return;
    setLoading(true);
    setError("");
    try {
      const [owner, repo] = selectedRepo.full_name.split("/");
      const next = await githubService.getTree(session, owner, repo, branch || selectedRepo.default_branch);
      setTree(next.filter((item) => item.type === "blob"));
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [session, selectedRepo, branch]);

  const openFile = useCallback(async (path: string) => {
    if (!selectedRepo) return;
    setLoading(true);
    setError("");
    try {
      const [owner, repo] = selectedRepo.full_name.split("/");
      const file = await githubService.getFile(session, owner, repo, path, branch || selectedRepo.default_branch);
      setSelectedPath(file.path);
      setCode(file.content);
      setOriginalCode(file.content);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [session, selectedRepo, branch]);

  const save = useCallback(async () => {
    if (!selectedRepo || !selectedPath || code === originalCode) return;
    setSaving(true);
    setError("");
    try {
      const [owner, repo] = selectedRepo.full_name.split("/");
      await githubService.commit(session, owner, repo, branch || selectedRepo.default_branch, commitMessage.trim() || "chore: update from DashPro", [
        { path: selectedPath, content: code }
      ]);
      setOriginalCode(code);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }, [session, selectedRepo, selectedPath, code, originalCode, branch, commitMessage]);

  const filteredTree = useMemo(
    () => tree.filter((item) => item.path.toLowerCase().includes(search.toLowerCase())),
    [tree, search]
  );

  const changed = code !== originalCode;

  return (
    <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-950 md:p-6" dir="rtl">
      <div className="mx-auto max-w-[1600px] space-y-4">
        <header className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-slate-950 text-white"><Github className="size-5" /></div>
            <div>
              <h1 className="text-xl font-black">GitHub Workspace</h1>
              <p className="text-xs text-slate-500">استعراض الملفات، تحرير Monaco، ومقارنة ثم Commit مباشر.</p>
            </div>
          </div>
          <button type="button" onClick={loadRepos} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            تحميل المستودعات
          </button>
        </header>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="grid min-h-[720px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[280px_1fr]">
          <aside className="border-b border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950 lg:border-b-0 lg:border-l">
            <div className="mb-3 flex items-center gap-2 text-sm font-black"><FolderTree className="size-4" /> المستودعات</div>
            <div className="space-y-1">
              {repos.map((repo) => (
                <button key={repo.id} type="button" onClick={() => { setSelectedRepo(repo); setBranch(repo.default_branch); setTree([]); setSelectedPath(""); setCode(""); }} className={`w-full rounded-xl p-3 text-right text-sm transition ${selectedRepo?.id === repo.id ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200" : "hover:bg-white dark:hover:bg-slate-900"}`}>
                  <span className="block font-bold">{repo.name}</span>
                  <span className="text-[11px] text-slate-500">{repo.private ? "خاص" : "عام"} · {repo.default_branch}</span>
                </button>
              ))}
              {repos.length === 0 && <p className="rounded-xl border border-dashed p-4 text-xs text-slate-500">اضغط تحميل المستودعات.</p>}
            </div>
          </aside>

          <main className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 p-3 dark:border-slate-800">
              <select value={selectedRepo?.full_name ?? ""} onChange={(e) => { const repo = repos.find((item) => item.full_name === e.target.value); if (repo) { setSelectedRepo(repo); setBranch(repo.default_branch); } }} className="min-w-52 rounded-lg border px-3 py-2 text-sm">
                <option value="">اختر مستودعاً</option>
                {repos.map((repo) => <option key={repo.id} value={repo.full_name}>{repo.full_name}</option>)}
              </select>
              <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
                <GitBranch className="size-4 text-slate-500" />
                <input value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="main" className="w-28 bg-transparent text-sm outline-none" />
              </div>
              <button type="button" onClick={loadTree} disabled={!selectedRepo || loading} className="rounded-lg border px-3 py-2 text-sm font-bold hover:bg-slate-50 disabled:opacity-50">شجرة الملفات</button>
              <div className="relative ms-auto">
                <Search className="absolute start-2 top-2.5 size-4 text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث في الملفات" className="w-48 rounded-lg border py-2 pe-3 ps-8 text-sm" />
              </div>
            </div>

            <div className="grid h-[620px] lg:grid-cols-[280px_1fr]">
              <div className="overflow-auto border-b border-slate-200 p-2 dark:border-slate-800 lg:border-b-0 lg:border-l">
                {filteredTree.map((file) => (
                  <button key={file.path} type="button" onClick={() => openFile(file.path)} className={`block w-full rounded-lg px-3 py-2 text-right text-xs ${selectedPath === file.path ? "bg-indigo-50 font-bold text-indigo-700 dark:bg-indigo-950/30" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}>{file.path}</button>
                ))}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 p-2 dark:border-slate-800">
                  <span className="me-auto truncate text-xs text-slate-500">{selectedPath || "اختر ملفاً"}</span>
                  <input value={commitMessage} onChange={(e) => setCommitMessage(e.target.value)} className="w-56 rounded-lg border px-2 py-1.5 text-xs" aria-label="رسالة Commit" />
                  <button type="button" onClick={save} disabled={!changed || saving} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40">
                    {saving ? <Loader2 className="size-3 animate-spin" /> : <Save className="size-3" />}
                    Commit & Push
                  </button>
                </div>
                {selectedPath ? (
                  <CodeEditor value={code} onChange={setCode} language={selectedPath.endsWith(".css") ? "css" : selectedPath.endsWith(".js") || selectedPath.endsWith(".ts") ? "javascript" : "xml"} height="560px" />
                ) : (
                  <div className="flex h-[560px] items-center justify-center text-sm text-slate-500">اختر ملفاً لبدء التحرير.</div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
