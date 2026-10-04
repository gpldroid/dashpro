"use client";

import { useCallback, useMemo, useState } from "react";
import { FilePlus2, FolderPlus, GitBranch, Github, Loader2, Plus, RefreshCw, Save, Search, Trash2, FolderTree, Lock, Globe } from "lucide-react";
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
  const [diff, setDiff] = useState("");
  const [showRepoForm, setShowRepoForm] = useState(false);
  const [repoName, setRepoName] = useState("");
  const [repoDescription, setRepoDescription] = useState("");
  const [repoPrivate, setRepoPrivate] = useState(true);
  const [showFileForm, setShowFileForm] = useState(false);
  const [newPath, setNewPath] = useState("");
  const [newContent, setNewContent] = useState("");

  const loadRepos = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const next = await githubService.listRepositories(session);
      setRepos(next);
      if (!selectedRepo && next[0]) { setSelectedRepo(next[0]); setBranch(next[0].default_branch); }
    } catch (e) { setError(getErrorMessage(e)); } finally { setLoading(false); }
  }, [session, selectedRepo]);

  const loadTree = useCallback(async () => {
    if (!selectedRepo) return;
    setLoading(true); setError(""); setDiff("");
    try {
      const [owner, repo] = selectedRepo.full_name.split("/");
      const next = await githubService.getTree(session, owner, repo, branch || selectedRepo.default_branch);
      setTree(next.filter((item) => item.type === "blob"));
    } catch (e) { setError(getErrorMessage(e)); } finally { setLoading(false); }
  }, [session, selectedRepo, branch]);

  const openFile = useCallback(async (path: string) => {
    if (!selectedRepo) return;
    setLoading(true); setError(""); setDiff("");
    try {
      const [owner, repo] = selectedRepo.full_name.split("/");
      const file = await githubService.getFile(session, owner, repo, path, branch || selectedRepo.default_branch);
      setSelectedPath(file.path); setCode(file.content); setOriginalCode(file.content);
    } catch (e) { setError(getErrorMessage(e)); } finally { setLoading(false); }
  }, [session, selectedRepo, branch]);

  const save = useCallback(async () => {
    if (!selectedRepo || !selectedPath || code === originalCode) return;
    setSaving(true); setError("");
    try {
      const [owner, repo] = selectedRepo.full_name.split("/");
      await githubService.commit(session, owner, repo, branch || selectedRepo.default_branch,
        commitMessage.trim() || "chore: update from DashPro", [{ path: selectedPath, content: code }]);
      setOriginalCode(code); await loadTree();
    } catch (e) { setError(getErrorMessage(e)); } finally { setSaving(false); }
  }, [session, selectedRepo, selectedPath, code, originalCode, branch, commitMessage, loadTree]);

  const createRepository = async () => {
    if (!repoName.trim()) return;
    setSaving(true); setError("");
    try {
      const created = await githubService.createRepository(session, repoName.trim(), repoDescription, repoPrivate);
      setRepos((current) => [created, ...current.filter((item) => item.id !== created.id)]);
      setSelectedRepo(created); setBranch(created.default_branch); setTree([]); setSelectedPath("");
      setCode(""); setOriginalCode(""); setRepoName(""); setRepoDescription(""); setShowRepoForm(false);
    } catch (e) { setError(getErrorMessage(e)); } finally { setSaving(false); }
  };

  const createFile = async () => {
    if (!selectedRepo || !newPath.trim()) return;
    setSaving(true); setError("");
    try {
      const [owner, repo] = selectedRepo.full_name.split("/");
      await githubService.commit(session, owner, repo, branch || selectedRepo.default_branch,
        "feat: add file from DashPro", [{ path: newPath.trim(), content: newContent }]);
      setShowFileForm(false); setNewPath(""); setNewContent(""); await loadTree();
      await openFile(newPath.trim());
    } catch (e) { setError(getErrorMessage(e)); } finally { setSaving(false); }
  };

  const deleteFile = async () => {
    if (!selectedRepo || !selectedPath || !window.confirm(`هل تريد حذف الملف ${selectedPath} من GitHub؟`)) return;
    setSaving(true); setError("");
    try {
      const [owner, repo] = selectedRepo.full_name.split("/");
      await githubService.commit(session, owner, repo, branch || selectedRepo.default_branch,
        `chore: delete ${selectedPath}`, [{ path: selectedPath, deleted: true }]);
      setSelectedPath(""); setCode(""); setOriginalCode(""); await loadTree();
    } catch (e) { setError(getErrorMessage(e)); } finally { setSaving(false); }
  };

  const compareBranches = useCallback(async () => {
    if (!selectedRepo || !branch || branch === selectedRepo.default_branch) return;
    setLoading(true); setError("");
    try {
      const [owner, repo] = selectedRepo.full_name.split("/");
      const result = await githubService.compare(session, owner, repo, selectedRepo.default_branch, branch);
      setDiff(String((result as { patch?: string }).patch ?? JSON.stringify(result, null, 2)));
    } catch (e) { setError(getErrorMessage(e)); } finally { setLoading(false); }
  }, [session, selectedRepo, branch]);

  const filteredTree = useMemo(() => tree.filter((item) => item.path.toLowerCase().includes(search.toLowerCase())), [tree, search]);
  const changed = code !== originalCode;

  return (
    <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-950 md:p-6" dir="rtl">
      <div className="mx-auto max-w-[1600px] space-y-4">
        <header className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-slate-950 text-white"><Github className="size-5" /></div>
            <div><h1 className="text-xl font-black">مدير ملفات GitHub</h1><p className="text-xs text-slate-500">إنشاء المستودعات، إدارة الملفات، تحريرها وحفظ التغييرات مباشرة.</p></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setShowRepoForm((v) => !v)} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-bold text-white"><Plus className="size-4" /> مستودع جديد</button>
            <button type="button" onClick={loadRepos} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold disabled:opacity-50">{loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} تحديث المستودعات</button>
          </div>
        </header>

        {showRepoForm && <section className="grid gap-3 rounded-2xl border border-indigo-200 bg-white p-4 dark:border-indigo-900 dark:bg-slate-900 md:grid-cols-[1fr_1fr_auto_auto]">
          <input value={repoName} onChange={(e) => setRepoName(e.target.value)} placeholder="اسم المستودع (مثال: my-website)" className="rounded-xl border px-3 py-2 text-sm dark:bg-slate-950" />
          <input value={repoDescription} onChange={(e) => setRepoDescription(e.target.value)} placeholder="وصف المشروع (اختياري)" className="rounded-xl border px-3 py-2 text-sm dark:bg-slate-950" />
          <button type="button" onClick={() => setRepoPrivate((v) => !v)} className="inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm">{repoPrivate ? <Lock className="size-4" /> : <Globe className="size-4" />}{repoPrivate ? "خاص" : "عام"}</button>
          <button type="button" onClick={createRepository} disabled={saving || !repoName.trim()} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{saving ? "جارٍ الإنشاء…" : "إنشاء المستودع"}</button>
        </section>}

        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="grid min-h-[720px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[280px_1fr]">
          <aside className="border-b border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950 lg:border-b-0 lg:border-l">
            <div className="mb-3 flex items-center gap-2 text-sm font-black"><FolderTree className="size-4" /> مستودعات GitHub</div>
            <div className="space-y-1">
              {repos.map((repo) => <button key={repo.id} type="button" onClick={() => { setSelectedRepo(repo); setBranch(repo.default_branch); setTree([]); setSelectedPath(""); setCode(""); setOriginalCode(""); setDiff(""); }} className={`w-full rounded-xl p-3 text-right text-sm transition ${selectedRepo?.id === repo.id ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200" : "hover:bg-white dark:hover:bg-slate-900"}`}>
                <span className="block font-bold">{repo.name}</span><span className="text-[11px] text-slate-500">{repo.private ? "خاص" : "عام"} · {repo.default_branch}</span>
              </button>)}
              {repos.length === 0 && <p className="rounded-xl border border-dashed p-4 text-xs text-slate-500">حمّل المستودعات أو أنشئ مستودعًا جديدًا.</p>}
            </div>
          </aside>

          <main className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 p-3 dark:border-slate-800">
              <select value={selectedRepo?.full_name ?? ""} onChange={(e) => { const repo = repos.find((item) => item.full_name === e.target.value); if (repo) { setSelectedRepo(repo); setBranch(repo.default_branch); setTree([]); setSelectedPath(""); setCode(""); } }} className="min-w-52 rounded-lg border px-3 py-2 text-sm dark:bg-slate-950">
                <option value="">اختر مستودعًا</option>{repos.map((repo) => <option key={repo.id} value={repo.full_name}>{repo.full_name}</option>)}
              </select>
              <div className="flex items-center gap-2 rounded-lg border px-3 py-2"><GitBranch className="size-4 text-slate-500" /><input value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="main" className="w-28 bg-transparent text-sm outline-none" /></div>
              <button type="button" onClick={loadTree} disabled={!selectedRepo || loading} className="rounded-lg border px-3 py-2 text-sm font-bold disabled:opacity-50">عرض الملفات</button>
              <button type="button" onClick={() => { setShowFileForm((v) => !v); setDiff(""); }} disabled={!selectedRepo} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold disabled:opacity-50"><FilePlus2 className="size-4" /> ملف جديد</button>
              <button type="button" onClick={() => { setNewPath((selectedPath.includes("/") ? selectedPath.slice(0, selectedPath.lastIndexOf("/") + 1) : "") + "new-folder/.gitkeep"); setNewContent(""); setShowFileForm(true); }} disabled={!selectedRepo} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold disabled:opacity-50"><FolderPlus className="size-4" /> مجلد جديد</button>
              <button type="button" onClick={compareBranches} disabled={!selectedRepo || !branch || branch === selectedRepo?.default_branch || loading} className="rounded-lg border px-3 py-2 text-sm font-bold disabled:opacity-50">Diff</button>
              <div className="relative ms-auto"><Search className="absolute start-2 top-2.5 size-4 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث في الملفات" className="w-48 rounded-lg border py-2 pe-3 ps-8 text-sm dark:bg-slate-950" /></div>
            </div>

            {showFileForm && <div className="grid gap-2 border-b border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950 md:grid-cols-[1fr_2fr_auto]">
              <input value={newPath} onChange={(e) => setNewPath(e.target.value)} placeholder="المسار: src/index.ts أو folder/.gitkeep" className="rounded-lg border px-3 py-2 text-sm dark:bg-slate-900" />
              <input value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="محتوى الملف (اتركه فارغًا لإنشاء مجلد)" className="rounded-lg border px-3 py-2 text-sm dark:bg-slate-900" />
              <button type="button" onClick={createFile} disabled={saving || !newPath.trim()} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">حفظ في GitHub</button>
            </div>}

            <div className="grid h-[620px] lg:grid-cols-[280px_1fr]">
              <div className="overflow-auto border-b border-slate-200 p-2 dark:border-slate-800 lg:border-b-0 lg:border-l">
                {filteredTree.map((file) => <button key={file.path} type="button" onClick={() => openFile(file.path)} className={`block w-full rounded-lg px-3 py-2 text-right text-xs ${selectedPath === file.path ? "bg-indigo-50 font-bold text-indigo-700 dark:bg-indigo-950/30" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}>{file.path}</button>)}
                {selectedRepo && tree.length === 0 && <p className="p-3 text-xs text-slate-400">اضغط «عرض الملفات» لتحميل محتويات المستودع.</p>}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 p-2 dark:border-slate-800">
                  <span className="me-auto truncate text-xs text-slate-500">{selectedPath || "اختر ملفًا"}</span>
                  <input value={commitMessage} onChange={(e) => setCommitMessage(e.target.value)} className="w-56 rounded-lg border px-2 py-1.5 text-xs dark:bg-slate-950" aria-label="رسالة Commit" />
                  <button type="button" onClick={save} disabled={!changed || saving} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"><Save className="size-3" /> حفظ التعديلات</button>
                  <button type="button" onClick={deleteFile} disabled={!selectedPath || saving} className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 disabled:opacity-40"><Trash2 className="size-3" /> حذف الملف</button>
                </div>
                {diff ? <pre className="max-h-[560px] overflow-auto whitespace-pre-wrap bg-slate-950 p-4 text-xs leading-6 text-slate-200" dir="ltr">{diff}</pre> : selectedPath ? <CodeEditor value={code} onChange={setCode} language={selectedPath.endsWith(".css") ? "css" : selectedPath.endsWith(".js") || selectedPath.endsWith(".ts") ? "javascript" : "xml"} height="560px" /> : <div className="flex h-[560px] items-center justify-center text-sm text-slate-500">اختر ملفًا لبدء التحرير.</div>}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}