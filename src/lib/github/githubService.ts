import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export type GithubRepository = {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  default_branch: string;
  html_url: string;
  description: string | null;
};

export type GithubTreeEntry = {
  path: string;
  mode?: string;
  type?: string;
  sha?: string;
  size?: number;
};

export type GithubFile = {
  path: string;
  sha: string;
  size: number;
  content: string;
};

export type GithubBranch = {
  name: string;
  sha: string;
  protected: boolean;
};

export type GithubCommit = { sha: string; message: string; author: string; date: string | null; url: string };

export type GithubPullRequest = { number: number; title: string; state: string; draft: boolean | null; head: string; base: string; user: string; url: string; updated_at: string };\n\nexport type GithubCommitResult = {
  commit: string;
  branch: string;
  url: string;
  files: string[];
};

async function callGithub<T>(session: Session | null, payload: Record<string, unknown>): Promise<T> {
  const token = session?.provider_token;
  if (!token) throw new Error("جلسة GitHub غير متاحة. سجّل الدخول عبر GitHub من جديد.");

  const supabase = createClient();
  const { data, error } = await supabase.functions.invoke("github-workspace", {
    body: { ...payload, githubToken: token },
  });

  if (error) throw new Error(error.message || "تعذر الاتصال بخدمة GitHub.");
  if (data?.error) throw new Error(String(data.error));
  return data as T;
}

export const githubService = {
  listRepositories(session: Session | null) {
    return callGithub<GithubRepository[]>(session, { action: "list_repositories" });
  },

  createRepository(session: Session | null, name: string, description: string, isPrivate: boolean) {
    return callGithub<GithubRepository>(session, {
      action: "create_repository",
      name,
      description,
      private: isPrivate,
    });
  },

  getTree(session: Session | null, owner: string, repo: string, ref?: string) {
    return callGithub<GithubTreeEntry[]>(session, { action: "get_tree", owner, repo, ref });
  },

  getFile(session: Session | null, owner: string, repo: string, path: string, ref?: string) {
    return callGithub<GithubFile>(session, { action: "get_file", owner, repo, path, ref });
  },

  listBranches(session: Session | null, owner: string, repo: string) {
    return callGithub<GithubBranch[]>(session, { action: "list_branches", owner, repo });
  },

  createBranch(session: Session | null, owner: string, repo: string, name: string, from: string) {
    return callGithub<GithubBranch>(session, {
      action: "create_branch",
      owner,
      repo,
      branch: name,
      from,
    });
  },

  compare(session: Session | null, owner: string, repo: string, base: string, head: string) {
    return callGithub<Record<string, unknown>>(session, { action: "compare", owner, repo, base, head });
  },

  listCommits(session: Session | null, owner: string, repo: string, ref?: string) {
    return callGithub<GithubCommit[]>(session, { action: "list_commits", owner, repo, ref });
  },

  listPullRequests(session: Session | null, owner: string, repo: string) {
    return callGithub<GithubPullRequest[]>(session, { action: "list_pull_requests", owner, repo });
  },

  createPullRequest(session: Session | null, owner: string, repo: string, title: string, head: string, base: string, body: string, draft = false) {
    return callGithub<GithubPullRequest>(session, { action: "create_pull_request", owner, repo, title, head, base, body, draft });
  },

  commit(
    session: Session | null,
    owner: string,
    repo: string,
    branch: string,
    message: string,
    changes: Array<{ path: string; content?: string; deleted?: boolean; mode?: "100644" | "100755" }>,
  ) {
    return callGithub<GithubCommitResult>(session, {
      action: "commit",
      owner,
      repo,
      branch,
      message,
      changes,
    });
  },
};