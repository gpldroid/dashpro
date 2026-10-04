/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  Clipboard,
  Code2,
  FilePlus2,
  Loader2,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import type { SnippetRow } from "@/types/database";
import { useLanguage } from "@/contexts/language-context";

export type SnippetCategory =
  | "CSS"
  | "JavaScript"
  | "Blogger Widgets"
  | "HTML"
  | "general";

interface SnippetManagerProps {
  onInsert?: (code: string) => void;
}

const categories: Array<{ value: SnippetCategory | "all"; ar: string; en: string }> = [
  { value: "all", ar: "الكل", en: "All" },
  { value: "CSS", ar: "CSS", en: "CSS" },
  { value: "JavaScript", ar: "JavaScript", en: "JavaScript" },
  { value: "Blogger Widgets", ar: "عناصر Blogger", en: "Blogger Widgets" },
  { value: "HTML", ar: "HTML", en: "HTML" },
  { value: "general", ar: "عام", en: "General" },
];

function normalizeCategory(category: string | null): SnippetCategory {
  if (
    category === "CSS" ||
    category === "JavaScript" ||
    category === "Blogger Widgets" ||
    category === "HTML"
  ) {
    return category;
  }
  return "general";
}

export function SnippetManager({ onInsert }: SnippetManagerProps) {
  const { tr, language } = useLanguage();
  const [snippets, setSnippets] = useState<SnippetRow[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SnippetCategory | "all">("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "HTML" as SnippetCategory,
    code: "",
  });

  const loadSnippets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("snippets")
        .select("*")
        .order("updated_at", { ascending: false });

      if (fetchError) throw fetchError;
      setSnippets((data ?? []) as SnippetRow[]);
    } catch (cause) {
      console.error("DashPro snippets load failed:", cause);
      setError(tr("تعذر تحميل مكتبة الأكواد. حاول مرة أخرى.","Unable to load snippets. Please try again."));
    } finally {
      setLoading(false);
    }
  }, [tr]);

  useEffect(() => {
    void loadSnippets();
  }, [loadSnippets]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("dashpro-snippets-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "snippets" },
        () => void loadSnippets(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadSnippets]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return snippets.filter((snippet) => {
      const matchesCategory =
        category === "all" ||
        normalizeCategory(snippet.category) === category;
      const matchesQuery =
        !needle ||
        snippet.title.toLowerCase().includes(needle) ||
        snippet.code.toLowerCase().includes(needle);
      return matchesCategory && matchesQuery;
    });
  }, [category, query, snippets]);

  async function addSnippet(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim() || !form.code.trim()) {
      setError(tr("اكتب اسم الشفرة ومحتواها قبل الحفظ.","Enter a snippet name and its code before saving."));
      return;
    }

    setSaving(true);
    setError("");
    try {
      const supabase = createClient();
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) throw new Error(tr("يجب تسجيل الدخول لإضافة شفرة.","Sign in to add a snippet."));

      const { error: insertError } = await supabase.from("snippets").insert({
        user_id: userData.user.id,
        title: form.title.trim(),
        category: form.category,
        code: form.code,
        language:
          form.category === "CSS"
            ? "css"
            : form.category === "JavaScript"
              ? "javascript"
              : "html",
      });
      if (insertError) throw insertError;

      setForm({ title: "", category: "HTML", code: "" });
      setShowForm(false);
      await loadSnippets();
    } catch (cause) {
      console.error("DashPro snippet create failed:", cause);
      setError(tr("تعذر حفظ الشفرة. تأكد من صلاحيات حسابك.","Unable to save snippet. Check your account permissions."));
    } finally {
      setSaving(false);
    }
  }

  async function removeSnippet(id: string) {
    if (!window.confirm(tr("هل تريد حذف هذه الشفرة؟","Delete this snippet?"))) return;
    setError("");
    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from("snippets")
        .delete()
        .eq("id", id);
      if (deleteError) throw deleteError;
      setSnippets((current) =>
        current.filter((snippet) => snippet.id !== id),
      );
    } catch (cause) {
      console.error("DashPro snippet delete failed:", cause);
      setError(tr("تعذر حذف الشفرة.","Unable to delete snippet."));
    }
  }

  async function toggleFavorite(snippet: SnippetRow) {
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("snippets")
        .update({ is_favorite: !snippet.is_favorite })
        .eq("id", snippet.id);
      if (updateError) throw updateError;
      setSnippets((current) =>
        current.map((item) =>
          item.id === snippet.id
            ? { ...item, is_favorite: !snippet.is_favorite }
            : item,
        ),
      );
    } catch (cause) {
      console.error("DashPro snippet favorite update failed:", cause);
      setError(tr("تعذر تحديث المفضلة.","Unable to update favorites."));
    }
  }

  async function copySnippet(snippet: SnippetRow) {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopiedId(snippet.id);
      window.setTimeout(() => setCopiedId(null), 1500);
    } catch (cause) {
      console.error("DashPro clipboard copy failed:", cause);
      setError(tr("تعذر نسخ الشفرة. تحقق من صلاحية الحافظة في المتصفح.","Unable to copy. Check clipboard permissions in your browser."));
    }
  }

  return (
    <section dir={language === "ar" ? "rtl" : "ltr"} className="min-w-0 space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {tr("مكتبة الأكواد","Code snippets")}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {tr("احفظ شفراتك المتكررة واستعملها من جديد داخل المحرر.","Save reusable code and insert it into the editor whenever needed.")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((value) => !value)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
        >
          {showForm ? <X className="size-4" /> : <FilePlus2 className="size-4" />}
          {showForm ? tr("إلغاء","Cancel") : tr("شفرة جديدة","New snippet")}
        </button>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300"
        >
          {error}
        </div>
      ) : null}

      {showForm ? (
        <form
          onSubmit={addSnippet}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                {tr("اسم الشفرة","Snippet name")}
              </span>
              <input
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
                className="w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700"
                placeholder={tr("زر تحميل جذاب","Animated download button")}
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                {tr("الفئة","Category")}
              </span>
              <select
                value={form.category}
                onChange={(event) =>
                  setForm({
                    ...form,
                    category: event.target.value as SnippetCategory,
                  })
                }
                className="w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700"
              >
                {categories
                  .filter((item) => item.value !== "all")
                  .map((item) => (
                    <option key={item.value} value={item.value}>
                      {tr(item.ar, item.en)}
                    </option>
                  ))}
              </select>
            </label>
          </div>
          <label className="block space-y-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {tr("الشفرة","Code")}
            </span>
            <textarea
              value={form.code}
              onChange={(event) =>
                setForm({ ...form, code: event.target.value })
              }
              rows={8}
              dir="ltr"
              className="w-full rounded-xl border border-slate-200 bg-slate-950 p-3 font-mono text-xs text-slate-100 outline-none focus:border-indigo-500"
              placeholder="<div>...</div>"
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            {tr("حفظ الشفرة","Save snippet")}
          </button>
        </form>
      ) : null}

      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-900">
          <Search className="size-4 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none"
            placeholder={tr("ابحث في المكتبة...","Search snippets...")}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setCategory(item.value)}
              className={
                category === item.value
                  ? "rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white"
                  : "rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 dark:border-slate-800 dark:text-slate-300"
              }
            >
              {tr(item.ar, item.en)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-48 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800">
          <Loader2 className="size-6 animate-spin text-indigo-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
          <Code2 className="mx-auto size-8 text-slate-400" />
          <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">
            {tr("لا توجد شفرات مطابقة.","No matching snippets.")}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((snippet) => (
            <article
              key={snippet.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
                <div className="min-w-0">
                  <h3 className="truncate font-bold text-slate-900 dark:text-white">
                    {snippet.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    {normalizeCategory(snippet.category)} ·{" "}
                    {snippet.language ?? "html"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void toggleFavorite(snippet)}
                  aria-label={tr("تبديل المفضلة","Toggle favorite")}
                  className="rounded-lg p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                >
                  <Star
                    className={
                      snippet.is_favorite
                        ? "size-4 fill-current"
                        : "size-4"
                    }
                  />
                </button>
              </div>
              <pre
                dir="ltr"
                className="max-h-48 overflow-auto bg-slate-950 p-4 text-xs leading-6 text-slate-200"
              >
                <code>{snippet.code}</code>
              </pre>
              <div className="flex flex-wrap gap-2 p-3">
                <button
                  type="button"
                  onClick={() => void copySnippet(snippet)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold dark:border-slate-700"
                >
                  {copiedId === snippet.id ? (
                    <Check className="size-3.5" />
                  ) : (
                    <Clipboard className="size-3.5" />
                  )}
                  {copiedId === snippet.id ? tr("تم النسخ","Copied") : tr("نسخ","Copy")}
                </button>
                {onInsert ? (
                  <button
                    type="button"
                    onClick={() => onInsert(snippet.code)}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white"
                  >
                    <Code2 className="size-3.5" /> {tr("إدراج في المحرر","Insert into editor")}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => void removeSnippet(snippet.id)}
                  className="ms-auto inline-flex items-center gap-2 rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                  aria-label={tr("حذف الشفرة","Delete snippet")}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
