"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Download,
  FilePlus2,
  FolderPlus,
  GitBranch,
  Github,
  Globe,
  Loader2,
  Lock,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Trash2,
  FolderTree,
  ExternalLink,
  GitCompare,
  Copy,
} from "lucide-react";

import { CodeEditor, type EditorLanguage } from "@/components/editor/CodeEditor";
import { useAuth } from "@/contexts/auth-context";
import {
  githubService,
  type GithubBranch,
  type GithubRepository,
  type GithubTreeEntry,
} from "@/lib/github/githubService";
import { getErrorMessage } from "@/utils/helpers";

type TemplateId = "blank" | "static" | "blogger";

const templates: Record<TemplateId, { label: string; description: string; files: Array<{ path: string; content: string }> }> = {
  blank: { label: "مستودع فارغ", description: "ابدأ من README فقط.", files: [] },
  static: {
    label: "موقع HTML/CSS/JS",
    description: "هيكل موقع بسيط جاهز للتحرير.",
    files: [
      { path: "index.html", content: "<!doctype html>\n<html lang=\"ar\" dir=\"rtl\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>مشروعي</title>\n  <link rel=\"stylesheet\" href=\"styles.css\">\n</head>\n<body>\n  <main class=\"container\">\n    <h1>مرحبًا من DashPro</h1>\n    <p>ابدأ بناء مشروعك هنا.</p>\n  </main>\n  <script src=\"app.js\"></script>\n</body>\n</html>\n" },
      { path: "styles.css", content: "body { margin: 0; font-family: system-ui, sans-serif; background: #f8fafc; color: #0f172a; }\n.container { max-width: 900px; margin: 80px auto; padding: 24px; }\n" },
      { path: "app.js", content: "console.log('DashPro project ready');\n" },
    ],
  },
  blogger: {
    label: "قالب Blogger",
    description: "بداية XML مناسبة لتطوير قالب Blogger.",
    files: [
      { path: "template.xml", content: "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>\n<b:template-skin><![CDATA[\nbody { margin: 0; font-family: sans-serif; }\n]]></b:template-skin>\n<b:section id=\"main\" class=\"main\" maxwidgets=\"1\" showaddelement=\"yes\">\n  <b:widget id=\"HTML1\" type=\"HTML\" title=\"المحتوى\">\n    <b:includable id=\"main\">\n      <div class=\"content\">\n        <h1><data:blog.pageTitle/></h1>\n      </div>\n    </b:includable>\n  </b:widget>\n</b:section>\n" },
    ],
  },
};

function languageForPath(path: string): EditorLanguage {
  const lower = path.toLowerCase();
  if (lower.endsWith(".html")) return "html";
  if (lower.endsWith(".css")) return "css";
  if (lower.endsWith(".js") || lower.endsWith(".jsx")) return "javascript";
  if (lower.endsWith(".ts") || lower.endsWith(".tsx")) return "typescript";
  if (lower.endsWith(".json")) return "json";
  if (lower.endsWith(".md") || lower.endsWith(".mdx")) return "markdown";
  if (lower.endsWith(".sql")) return "sql";
  if (lower.endsWith(".xml")) return "xml";
  return "plaintext";
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function GithubWorkspace() {
  const { session } = useAuth();
  const [repos, setRepos] = useState<GithubRepository[]>([]);
  const [branches, setBranches] = useState<GithubBranch[]>([]);
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
  const [status, setStatus] = useState("");
  const [diff, setDiff] = useState("");
  const [showRepoForm, setShowRepoForm] = useState(false);
  const [repoName, setRepoName] = useState("");
  const [repoDescription, setRepoDescription] = useState("");
  const [repoPrivate, setRepoPrivate] = useState(true);
  const [templateId, setTemplateId] = useState<TemplateId>("static");
  const [showFileForm, setShowFileForm] = useState(false);
  const [newPath, setNewPath] = useState("");
  const [newContent, setNewContent] = useState("");
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [newBranch, setNewBranch] = useState("");
  const [cursor, setCursor] = useState({ line: 1, column: 1 });

  const changed = code !== originalCode;

  const selectRepo = useCallback((repo: GithubRepository) => {
    setSelectedRepo(repo);
    setBranch(repo.default_branch);
    setBranches([]);
    setTree([]);
    setSelectedPath("");
    setCode("");
    setOriginalCode("");
    setDiff("");
    setError("");
    setStatus("");
  }, []);

  const loadRepos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const next = await githubService.listRepositories(session);
      setRepos(next);
      if (!selectedRepo && next[0]) selectRepo(next[0]);
      setStatus(next.length + " مستودع متاح");
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [session, selectedRepo, selectRepo]);

  useEffect(() => {
    void loadRepos();
  }, [loadRepos]);

  const loadBranches = useCallback(async () => {
    if (!selectedRepo) return;
    const [owner, repo] = selectedRepo.full_name.split("/");
    try {
      const next = await githubService.listBranches(session, owner, repo);
      setBranches(next);
      if (!branch && next[0]) setBranch(next[0].name);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, [session, selectedRepo, branch]);

  const loadTree = useCallback(async () => {
    if (!selectedRepo) return;
    setLoading(true);
    setError("");
    setDiff("");
    try {
      const [owner, repo] = selectedRepo.full_name.split("/");
      const next = await githubService.getTree(session, owner, repo, branch || selectedRepo.default_branch);
      setTree(next.filter((item) => item.type === "blob"));
      setStatus("تم تحديث الملفات");
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [session, selectedRepo, branch]);

  useEffect(() => {
    if (!selectedRepo) return;
    void loadBranches();
    void loadTree();
  }, [selectedRepo]); // branch changes are applied explicitly with the branch selector

  const openFile = useCallback(async (path: string) => {
    if (!selectedRepo) return;
    setLoading(true);
    setError("");
    setDiff("");
    try {
      const [owner, repo] = selectedRepo.full_name.split("/");
      const file = await githubService.getFile(session, owner, repo, path, branch || selectedRepo.default_branch);
      setSelectedPath(file.path);
      setCode(file.content);
      setOriginalCode(file.content);
      setStatus(formatSize(file.size) + " · " + languageForPath(file.path));
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [session, selectedRepo, branch]);

  const save = useCallback(async (nextCode = code) => {
    if (!selectedRepo || !selectedPath || nextCode === originalCode) return;
    setSaving(true);
    setError("");
    try {
      const [owner, repo] = selectedRepo.full_name.split("/");
      const result = await githubService.commit(
        session,
        owner,
        repo,
        branch || selectedRepo.default_branch,
        commitMessage.trim() || "chore: update from DashPro",
        [{ path: selectedPath, content: nextCode }],
      );
      setCode(nextCode);
      setOriginalCode(nextCode);
      setStatus("تم الحفظ في GitHub · " + result.commit.slice(0, 7));
      await loadTree();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }, [session, selectedRepo, selectedPath, code, originalCode, branch, commitMessage, loadTree]);

  const createRepository = async () => {
    if (!repoName.trim()) return;
    setSaving(true);
    setError("");
    try {
      const created = await githubService.createRepository(session, repoName.trim(), repoDescription, repoPrivate);
      setRepos((current) => [created, ...current.filter((item) => item.id !== created.id)]);
      selectRepo(created);

      const template = templates[templateId];
      if (template.files.length) {
        const [owner, repo] = created.full_name.split("/");
        await githubService.commit(
          session,
          owner,
          repo,
          created.default_branch,
          "chore: initialize project from DashPro",
          template.files,
        );
      }

      setRepoName("");
      setRepoDescription("");
      setShowRepoForm(false);
      setStatus("تم إنشاء المشروع وحفظ القالب في GitHub");
      await loadRepos();
      await loadTree();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const createFile = async () => {
    if (!selectedRepo || !newPath.trim()) return;
    setSaving(true);
    setError("");
    try {
      const [owner, repo] = selectedRepo.full_name.split("/");
      await githubService.commit(
        session,
        owner,
        repo,
        branch || selectedRepo.default_branch,
        "feat: add file from DashPro",
        [{ path: newPath.trim(), content: newContent }],
      );
      const path = newPath.trim();
      setShowFileForm(false);
      setNewPath("");
      setNewContent("");
      await loadTree();
      await openFile(path);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const deleteFile = async () => {
    if (!selectedRepo || !selectedPath) return;
    if (!window.confirm("حذف " + selectedPath + " من الفرع " + branch + "؟")) return;
    setSaving(true);
    setError("");
    try {
      const [owner, repo] = selectedRepo.full_name.split("/");
      await githubService.commit(
        session,
        owner,
        repo,
        branch || selectedRepo.default_branch,
        "chore: delete " + selectedPath,
        [{ path: selectedPath, deleted: true }],
      );
      setSelectedPath("");
      setCode("");
      setOriginalCode("");
      await loadTree();
      setStatus("تم حذف الملف");
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const createBranch = async () => {
    if (!selectedRepo || !newBranch.trim()) return;
    setSaving(true);
    setError("");
    try {
      const [owner, repo] = selectedRepo.full_name.split("/");
      const created = await githubService.createBranch(
        session,
        owner,
        repo,
        newBranch.trim(),
        branch || selectedRepo.default_branch,
      );
      setBranches((current) => [...current, created]);
      setBranch(created.name);
      setNewBranch("");
      setShowBranchForm(false);
      setTree([]);
      setSelectedPath("");
      setCode("");
      setOriginalCode("");
      setStatus("تم إنشاء الفرع " + created.name);
      await loadTree();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const compareBranches = useCallback(async () => {
    if (!selectedRepo || !branch || branch === selectedRepo.default_branch) return;
    setLoading(true);
    setError("");
    try {
      const [owner, repo] = selectedRepo.full_name.split("/");
      const result = await githubService.compare(session, owner, repo, selectedRepo.default_branch, branch);
      const files = Array.isArray(result.files) ? result.files : [];
      setDiff(
        files.length
          ? files.map((file: { filename?: string; status?: string; additions?: number; deletions?: number }) =>
              (file.status || "modified") + "  " + (file.filename || "") + "  +" + (file.additions || 0) + " -" + (file.deletions || 0),
            ).join("\n")
          : "لا توجد تغييرات بين الفرعين.",
      );
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [session, selectedRepo, branch]);

  const downloadCurrent = () => {
    if (!selectedPath) return;
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = selectedPath.split("/").pop() || "file.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const copyCurrent = async () => {
    if (!selectedPath) return;
    await navigator.clipboard.writeText(code);
    setStatus("تم نسخ محتوى الملف");
  };

  const resetCurrent = () => {
    if (!changed || !window.confirm("إلغاء التعديلات غير المحفوظة؟")) return;
    setCode(originalCode);
    setStatus("تمت استعادة آخر نسخة محفوظة");
  };

  const filteredTree = useMemo(
    () => tree.filter((item) => item.path.toLowerCase().includes(search.toLowerCase())),
    [tree, search],
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-950 md:p-6" dir="rtl">
      <div className="mx-auto max-w-[1700px] space-y-4">
        <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-slate-950 text-white"><Github className="size-5" /></div>
              <div>
                <h1 className="text-xl font-black">استوديو GitHub</h1>
                <p className="text-xs text-slate-500">أنشئ المشروع، اختر الفرع، حرّر الملفات، ثم احفظ مباشرة في GitHub.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setShowRepoForm((v) => !v)} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-bold text-white"><Plus className="size-4" /> مشروع جديد</button>
              <button type="button" onClick={() => void loadRepos()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold disabled:opacity-50">{loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} تحديث</button>
              {selectedRepo && <a href={selectedRepo.html_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold"><ExternalLink className="size-4" /> GitHub</a>}
            </div>
          </div>
        </header>

        {showRepoForm && (
          <section className="rounded-2xl border border-indigo-200 bg-white p-4 dark:border-indigo-900 dark:bg-slate-900">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <input value={repoName} onChange={(e) => setRepoName(e.target.value)} placeholder="اسم المشروع / المستودع" className="rounded-xl border px-3 py-2 text-sm dark:bg-slate-950" />
              <input value={repoDescription} onChange={(e) => setRepoDescription(e.target.value)} placeholder="وصف المشروع" className="rounded-xl border px-3 py-2 text-sm dark:bg-slate-950" />
              <select value={templateId} onChange={(e) => setTemplateId(e.target.value as TemplateId)} className="rounded-xl border px-3 py-2 text-sm dark:bg-slate-950">
                {Object.entries(templates).map(([id, template]) => <option key={id} value={id}>{template.label}</option>)}
              </select>
              <button type="button" onClick={() => setRepoPrivate((v) => !v)} className="inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm">{repoPrivate ? <Lock className="size-4" /> : <Globe className="size-4" />}{repoPrivate ? "خاص" : "عام"}</button>
              <button type="button" onClick={() => void createRepository()} disabled={saving || !repoName.trim()} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{saving ? "جارٍ الإنشاء…" : "إنشاء وحفظ القالب"}</button>
            </div>
            <p className="mt-3 text-xs text-slate-500">{templates[templateId].description}</p>
          </section>
        )}

        {(error || status) && (
          <div className={error ? "rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" : "rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"} role={error ? "alert" : "status"}>
            {error || status}
          </div>
        )}

        <div className="grid min-h-[760px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[290px_1fr]">
          <aside className="border-b border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950 lg:border-b-0 lg:border-l">
            <div className="mb-3 flex items-center gap-2 text-sm font-black"><FolderTree className="size-4" /> المشاريع</div>
            <div className="space-y-1">
              {repos.map((repo) => (
                <button key={repo.id} type="button" onClick={() => selectRepo(repo)} className={"w-full rounded-xl p-3 text-right text-sm transition " + (selectedRepo?.id === repo.id ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200" : "hover:bg-white dark:hover:bg-slate-900")}>
                  <span className="block truncate font-bold">{repo.name}</span>
                  <span className="text-[11px] text-slate-500">{repo.private ? "خاص" : "عام"} · {repo.default_branch}</span>
                </button>
              ))}
              {repos.length === 0 && <p className="rounded-xl border border-dashed p-4 text-xs text-slate-500">أنشئ مشروعًا أو اضغط تحديث.</p>}
            </div>
          </aside>

          <main className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 p-3 dark:border-slate-800">
              <select value={selectedRepo?.full_name ?? ""} onChange={(e) => { const repo = repos.find((item) => item.full_name === e.target.value); if (repo) selectRepo(repo); }} className="min-w-56 rounded-lg border px-3 py-2 text-sm dark:bg-slate-950">
                <option value="">اختر مشروعًا</option>{repos.map((repo) => <option key={repo.id} value={repo.full_name}>{repo.full_name}</option>)}
              </select>

              <div className="flex items-center gap-2 rounded-lg border px-2">
                <GitBranch className="size-4 text-slate-500" />
                <select value={branch} onChange={(e) => { setBranch(e.target.value); setTree([]); setSelectedPath(""); setCode(""); setOriginalCode(""); setDiff(""); }} className="max-w-44 bg-transparent px-1 py-2 text-sm outline-none">
                  {branches.length ? branches.map((item) => <option key={item.name} value={item.name}>{item.name}</option>) : <option value={branch}>{branch || "main"}</option>}
                </select>
              </div>

              <button type="button" onClick={() => setShowBranchForm((v) => !v)} disabled={!selectedRepo} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold disabled:opacity-50"><GitBranch className="size-4" /> فرع جديد</button>
              <button type="button" onClick={() => void loadTree()} disabled={!selectedRepo || loading} className="rounded-lg border px-3 py-2 text-sm font-bold disabled:opacity-50">الملفات</button>
              <button type="button" onClick={() => { setShowFileForm((v) => !v); setDiff(""); }} disabled={!selectedRepo} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold disabled:opacity-50"><FilePlus2 className="size-4" /> ملف</button>
              <button type="button" onClick={() => { setNewPath((selectedPath.includes("/") ? selectedPath.slice(0, selectedPath.lastIndexOf("/") + 1) : "") + "new-folder/.gitkeep"); setNewContent(""); setShowFileForm(true); }} disabled={!selectedRepo} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold disabled:opacity-50"><FolderPlus className="size-4" /> مجلد</button>
              <button type="button" onClick={() => void compareBranches()} disabled={!selectedRepo || !branch || branch === selectedRepo?.default_branch || loading} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold disabled:opacity-50"><GitCompare className="size-4" /> مقارنة</button>

              <div className="relative ms-auto">
                <Search className="absolute start-2 top-2.5 size-4 text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث عن ملف" className="w-48 rounded-lg border py-2 pe-3 ps-8 text-sm dark:bg-slate-950" />
              </div>
            </div>

            {showBranchForm && (
              <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-indigo-50 p-3 dark:border-slate-800 dark:bg-indigo-950/20">
                <input value={newBranch} onChange={(e) => setNewBranch(e.target.value)} placeholder={"اسم الفرع الجديد انطلاقًا من " + (branch || "main")} className="min-w-64 flex-1 rounded-lg border px-3 py-2 text-sm dark:bg-slate-900" />
                <button type="button" onClick={() => void createBranch()} disabled={saving || !newBranch.trim()} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">إنشاء الفرع</button>
              </div>
            )}

            {showFileForm && (
              <div className="grid gap-2 border-b border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950 md:grid-cols-[1fr_2fr_auto]">
                <input value={newPath} onChange={(e) => setNewPath(e.target.value)} placeholder="المسار: src/index.ts أو folder/.gitkeep" className="rounded-lg border px-3 py-2 text-sm dark:bg-slate-900" />
                <input value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="محتوى الملف" className="rounded-lg border px-3 py-2 text-sm dark:bg-slate-900" />
                <button type="button" onClick={() => void createFile()} disabled={saving || !newPath.trim()} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">حفظ في GitHub</button>
              </div>
            )}

            <div className="grid h-[650px] lg:grid-cols-[290px_1fr]">
              <div className="overflow-auto border-b border-slate-200 p-2 dark:border-slate-800 lg:border-b-0 lg:border-l">
                {filteredTree.map((file) => (
                  <button key={file.path} type="button" onClick={() => void openFile(file.path)} className={"block w-full rounded-lg px-3 py-2 text-right text-xs " + (selectedPath === file.path ? "bg-indigo-50 font-bold text-indigo-700 dark:bg-indigo-950/30" : "hover:bg-slate-100 dark:hover:bg-slate-800")}>
                    {file.path}
                  </button>
                ))}
                {selectedRepo && tree.length === 0 && <p className="p-3 text-xs text-slate-400">لا توجد ملفات محملة لهذا الفرع.</p>}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 p-2 dark:border-slate-800">
                  <div className="me-auto min-w-0">
                    <p className="truncate text-xs font-bold text-slate-700 dark:text-slate-200">{selectedPath || "اختر ملفًا"}</p>
                    {selectedPath && <p className="text-[10px] text-slate-400">السطر {cursor.line} · العمود {cursor.column} · {languageForPath(selectedPath)}</p>}
                  </div>
                  <input value={commitMessage} onChange={(e) => setCommitMessage(e.target.value)} className="w-52 rounded-lg border px-2 py-1.5 text-xs dark:bg-slate-950" aria-label="رسالة Commit" />
                  <button type="button" onClick={() => void save()} disabled={!changed || saving} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"><Save className="size-3" /> {saving ? "حفظ…" : "حفظ"}</button>
                  <button type="button" onClick={resetCurrent} disabled={!changed || saving} className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold disabled:opacity-40"><RotateCcw className="size-3" /> تراجع</button>
                  <button type="button" onClick={downloadCurrent} disabled={!selectedPath} className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold disabled:opacity-40"><Download className="size-3" /> تنزيل</button>
                  <button type="button" onClick={() => void copyCurrent()} disabled={!selectedPath} className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold disabled:opacity-40"><Copy className="size-3" /> نسخ</button>
                  <button type="button" onClick={() => void deleteFile()} disabled={!selectedPath || saving} className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 disabled:opacity-40"><Trash2 className="size-3" /> حذف</button>
                </div>

                {diff ? (
                  <pre className="h-[590px] overflow-auto whitespace-pre-wrap bg-slate-950 p-4 text-xs leading-6 text-slate-200" dir="ltr">{diff}</pre>
                ) : selectedPath ? (
                  <CodeEditor
                    value={code}
                    onChange={setCode}
                    onSave={(next) => void save(next ?? code)}
                    onCursorChange={(line, column) => setCursor({ line, column })}
                    language={languageForPath(selectedPath)}
                    height="590px"
                  />
                ) : (
                  <div className="flex h-[590px] flex-col items-center justify-center gap-3 text-sm text-slate-500">
                    <FolderTree className="size-10 opacity-30" />
                    <p>اختر ملفًا من المشروع لبدء التحرير.</p>
                    <p className="text-xs">Ctrl/Cmd + S يحفظ مباشرة في GitHub.</p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}