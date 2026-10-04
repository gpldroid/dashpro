"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Blocks, Code2, FolderKanban, Github, LayoutDashboard, Puzzle, Settings2 } from "lucide-react";

const navigation = [
  { href: "/dashboard", label: "نظرة عامة", icon: LayoutDashboard },
  { href: "/dashboard/projects", label: "المشاريع", icon: FolderKanban },
  { href: "/dashboard/editor", label: "محرر القوالب", icon: Code2 },
  { href: "/dashboard/github", label: "مدير ملفات GitHub", icon: Github },
  { href: "/dashboard/snippets", label: "مكتبة الأكواد", icon: Blocks },
  { href: "/dashboard/components", label: "المكونات", icon: Puzzle },
  { href: "/dashboard/settings", label: "الإعدادات", icon: Settings2 }
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-64 shrink-0 border-e border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:flex lg:flex-col">
      <Link href="/dashboard" className="mb-10 inline-flex px-3 text-2xl font-black tracking-tight text-slate-950 dark:text-white">Dash<span className="text-indigo-600">Pro</span></Link>
      <p className="mb-3 px-3 text-xs font-bold tracking-wider text-slate-400">مساحة العمل</p>
      <nav className="space-y-1">
        {navigation.map(({ href, label, icon: Icon }) => {
          const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${active ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}><Icon className="size-5" />{label}</Link>;
        })}
      </nav>
      <div className="mt-auto rounded-2xl bg-slate-50 p-4 dark:bg-slate-800"><p className="text-sm font-bold text-slate-800 dark:text-white">مساحة إبداعك</p><p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">كل أدوات بناء الويب في مكان واحد.</p></div>
    </aside>
  );
}