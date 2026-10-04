import type { Session } from "@supabase/supabase-js";
import { githubService } from "@/lib/github/githubService";

function requireGithubSession(session: Session | null): Session {
  if (!session?.provider_token) {
    throw new Error(
      "جلسة GitHub غير متاحة أو انتهت صلاحيتها. أعد تسجيل الدخول عبر GitHub ثم حاول مجددًا."
    );
  }
  return session;
}

/**
 * Thin client facade. GitHub credentials remain in the authenticated session
 * and are sent only to the github-workspace Edge Function.
 */
export const octokitClient = {
  listRepositories: (session: Session | null) =>
    githubService.listRepositories(requireGithubSession(session)),
  getTree: (session: Session | null, owner: string, repo: string, ref?: string) =>
    githubService.getTree(requireGithubSession(session), owner, repo, ref),
  getFile: (session: Session | null, owner: string, repo: string, path: string, ref?: string) =>
    githubService.getFile(requireGithubSession(session), owner, repo, path, ref),
  listBranches: (session: Session | null, owner: string, repo: string) =>
    githubService.listBranches(requireGithubSession(session), owner, repo),
  createBranch: (session: Session | null, owner: string, repo: string, name: string, from: string) =>
    githubService.createBranch(requireGithubSession(session), owner, repo, name, from),
  compare: (session: Session | null, owner: string, repo: string, base: string, head: string) =>
    githubService.compare(requireGithubSession(session), owner, repo, base, head),
  commit: (
    session: Session | null,
    owner: string,
    repo: string,
    branch: string,
    message: string,
    changes: Parameters<typeof githubService.commit>[5]
  ) =>
    githubService.commit(
      requireGithubSession(session),
      owner,
      repo,
      branch,
      message,
      changes
    )
};

export function parseRepositoryUrl(value: string) {
  try {
    const url = new URL(value.trim());
    if (
      (url.protocol !== "https:" && url.protocol !== "http:") ||
      !["github.com", "www.github.com"].includes(url.hostname.toLowerCase())
    ) {
      return null;
    }

    const segments = url.pathname.split("/").filter(Boolean);
    if (segments.length < 2) return null;

    const owner = segments[0];
    const repo = segments[1].replace(/\.git$/i, "");
    if (!owner || !repo || owner.includes(".") || repo.includes(".")) {
      if (!owner || !repo) return null;
    }

    return { owner, repo };
  } catch {
    return null;
  }
}
