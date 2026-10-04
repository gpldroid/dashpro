"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Blocks,
  ChevronLeft,
  ChevronRight,
  Code2,
  FolderKanban,
  Github,
  GitBranch,
  HardDrive,
  LayoutDashboard,
  Puzzle,
  Settings2
} from "lucide-react";
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

type SidebarProps = {
  collapsed?: boolean;
  onToggle?: () => void;
};

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { t, language } = useLanguage();
  const CollapseIcon = language === "ar"
    ? (collapsed ? ChevronLeft : ChevronRight)
    : (collapsed ? ChevronRight : ChevronLeft);

  return (
    <aside
      className={`dashboard-sidebar sticky top-0 hidden h-dvh max-h-dvh shrink-0 flex-col overflow-x-hidden overflow-y-auto border-e border-slate-200 bg-white/95 px-3 py-5 backdrop-blur-md transition-[width] duration-200 dark:border-slate-800 dark:bg-slate-900/90 lg:flex ${collapsed ? "w-[76px]" : "w-[252px] xl:w-[272px]"}`}
      aria-label={t("navigation")}
    >
      <div className={`mb-8 flex min-h-11 items-center ${collapsed ? "justify-center" : "justify-between gap-2 px-2"}`}>
        <Link
          href="/dashboard"
          title="DashPro"
          className={`inline-flex min-w-0 items-center text-2xl font-black tracking-tight text-slate-950 dark:text-white ${collapsed ? "justify-center" : ""}`}
        >
          {collapsed ? <span className="text-indigo-600">D</span> : <>Dash<span className="text-indigo-600">Pro</span></>}
        </Link>
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? t("expandSidebar") : t("collapseSidebar")}
            title={collapsed ? t("expandSidebar") : t("collapseSidebar")}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-indigo-500/10"
          >
            <CollapseIcon className="size-4" />
          </button>
        )}
      </div>

      {!collapsed && (
        <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
          {t("workspace")}
        </p>
      )}

      <nav className="flex flex-col gap-1.5" aria-label={t("navigation")}>
        {navigation.map(({ href, key, icon: Icon }) => {
          const active = href === "/dashboard"
            ? pathname === href
            : pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              title={collapsed ? t(key) : undefined}
              className={`group relative flex min-h-11 min-w-0 items-center rounded-xl py-2.5 text-sm font-semibold transition-all duration-150 focus-visible:outline-offset-2 ${collapsed ? "justify-center px-2" : "gap-3 px-3"} ${active
                ? "bg-indigo-50 text-indigo-700 shadow-sm dark:bg-indigo-500/15 dark:text-indigo-300"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"}`}
            >
              <Icon className={`size-5 shrink-0 ${active ? "text-indigo-600 dark:text-indigo-300" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200"}`} />
              {!collapsed && <span className="min-w-0 truncate">{t(key)}</span>}
              {active && <span className="absolute inset-y-2 start-0 w-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-8">
        {!collapsed ? (
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/90 p-4 dark:border-slate-700/70 dark:bg-slate-800/70">
            <p className="text-sm font-bold text-slate-800 dark:text-white">{t("creativeSpace")}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{t("creativeDescription")}</p>
            <p className="mt-3 text-[10px] font-semibold tracking-wider text-slate-400">DASHPRO · {language.toUpperCase()}</p>
          </div>
        ) : (
          <div className="flex justify-center text-[10px] font-black tracking-wider text-slate-400">DP</div>
        )}
      </div>
    </aside>
  );
}
