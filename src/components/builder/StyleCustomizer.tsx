"use client";

import { Palette, Ruler, Type } from "lucide-react";
import type { BloggerSkinVariable } from "@/utils/bloggerParser";

interface Props { variables: BloggerSkinVariable[]; onChange: (name: string, value: string) => void; }

function fieldKind(v: BloggerSkinVariable) {
  const value = v.value ?? v.defaultValue ?? "";
  if ((v.type ?? "").toLowerCase().includes("color") || /^#/.test(value)) return "color";
  if (/font/i.test(v.name) || (v.type ?? "").toLowerCase().includes("font")) return "font";
  if (/width|height|spacing|margin|padding|size/i.test(v.name)) return "range";
  return "text";
}

export function StyleCustomizer({ variables, onChange }: Props) {
  const groups = new Map<string, BloggerSkinVariable[]>();
  for (const variable of variables) {
    const key = variable.group ?? "التنسيق العام";
    groups.set(key, [...(groups.get(key) ?? []), variable]);
  }

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900" dir="rtl">
      <h2 className="font-black">المظهر السريع</h2>
      <p className="mt-1 text-xs text-slate-500">تعديل مباشر لمتغيرات b:skin.</p>
      <div className="mt-4 space-y-5">
        {[...groups.entries()].map(([group, items]) => (
          <div key={group}>
            <p className="mb-2 text-xs font-black text-slate-400">{group}</p>
            <div className="space-y-3">
              {items.map((variable) => {
                const value = variable.value ?? variable.defaultValue ?? "";
                const kind = fieldKind(variable);
                if (kind === "color") return (
                  <label key={variable.name} className="block">
                    <span className="mb-1 block text-xs font-bold">{variable.description || variable.name}</span>
                    <div className="flex gap-2">
                      <input type="color" value={/^#/.test(value) ? value.slice(0,7) : "#334155"} onChange={(event) => onChange(variable.name,event.target.value)} />
                      <input value={value} onChange={(event) => onChange(variable.name,event.target.value)} className="min-w-0 flex-1 rounded-lg border px-2 py-2 text-xs" />
                    </div>
                    <Palette className="mt-1 size-3 text-slate-400" />
                  </label>
                );
                if (kind === "font") return (
                  <label key={variable.name} className="block">
                    <span className="mb-1 block text-xs font-bold">{variable.description || variable.name}</span>
                    <select value={value} onChange={(event) => onChange(variable.name,event.target.value)} className="w-full rounded-lg border px-2 py-2 text-xs">
                      {["Cairo","Tajawal","Noto Sans Arabic","Inter","Roboto","Arial"].map((font) => <option key={font} value={font}>{font}</option>)}
                    </select>
                    <Type className="mt-1 size-3 text-slate-400" />
                  </label>
                );
                if (kind === "range") {
                  const n = Number.parseInt(value,10);
                  const safe = Number.isFinite(n) ? Math.min(160,Math.max(0,n)) : 40;
                  return (
                    <label key={variable.name} className="block">
                      <span className="mb-1 flex justify-between text-xs font-bold"><span>{variable.description || variable.name}</span><span>{safe}px</span></span>
                      <input type="range" min="0" max="160" value={safe} onChange={(event) => onChange(variable.name,event.target.value+"px")} className="w-full" />
                      <Ruler className="mt-1 size-3 text-slate-400" />
                    </label>
                  );
                }
                return <label key={variable.name} className="block"><span className="mb-1 block text-xs font-bold">{variable.description || variable.name}</span><input value={value} onChange={(event) => onChange(variable.name,event.target.value)} className="w-full rounded-lg border px-2 py-2 text-xs" /></label>;
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
