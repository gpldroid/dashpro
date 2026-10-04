"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Blocks, Code2, FolderKanban, Github, GitBranch, LayoutDashboard, Puzzle, Settings2, HardDrive } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

const navigation = [
  { href: "/dashboard", key: "overview" as const, icon: LayoutDashboard },
  { href: "/dashboard/projects", key: "projects" as const, icon: FolderKanban },
  { href: "/dashboard/editor", key: "templateEditor" as const, icon: Code2 },
  { href: "/dashboard/github", key: "githubManager" as const, icon: Github },
  { href: "/dashboard/github/delivery", key: "githubDelivery" as const, icon: GitBranch },
  { href: "/dashboard/local-files", key: "localFiles" as const, icon: HardDrive },
  { href: "/dashboard/snippets", key: "snippets" as const, icon: Blocks },
  { href: "/dashboard/components", key: "components" as const, icon: Puzzle },
  { href: "/dashboard/settings", key: "settings" as const, icon: Settings2 }
];

export function Sidebar() {
  const pathname = usePathname();
  const { t, language } = useLanguage();
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto border-e border-slate-200 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-900 lg:flex">
      <Link href="/dashboard" className="mb-8 inline-flex shrink-0 px-3 text-2xl font-black tracking-tight text-slate-950 dark:text-white">Dash<span className="text-indigo-600">Pro</span></Link>
      <p className="mb-3 px-3 text-xs font-bold tracking-wider text-slate-400">{t("workspace")}</p>
      <nav aria-label={t("navigation")} className="flex flex-col gap-1">
        {navigation.map(({ href, key, icon: Icon }) => {
          const active = href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${active ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}>
              <Icon className="size-5 shrink-0" /><span className="min-w-0 truncate">{t(key)}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-8">
        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
          <p className="text-sm font-bold text-slate-800 dark:text-white">{t("creativeSpace")}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{t("creativeDescription")}</p>
        </div>
        <p className="mt-4 px-3 text-[11px] text-slate-400">DashPro · {language.toUpperCase()}</p>
      </div>
    </aside>
  );
}
