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
  mode: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
};

export type GithubFile = { path: string; sha: string; size: number; content: string };
export type GithubBranch = { name: string; sha: string; protected: boolean };
export type GithubCommit = { sha: string; message: string; author: string; date: string | null; url: string };
export type GithubPullRequest = {
  number: number;
  title: string;
  state: string;
  draft: boolean | null;
  head: string;
  base: string;
  user: string;
  url: string;
  updated_at: string;
};
export type GithubCommitResult = { commit: string; branch: string; url: string; files: string[] };

export class GithubWorkspaceError extends Error {
  constructor(
    message: string,
    public readonly code: "AUTH" | "PERMISSION" | "NOT_FOUND" | "RATE_LIMIT" | "NETWORK" | "UNKNOWN" = "UNKNOWN"
  ) {
    super(message);
    this.name = "GithubWorkspaceError";
  }
}

function explainGithubError(message: string): GithubWorkspaceError {
  const normalized = message.toLowerCase();

  if (/401|unauthorized|bad credentials|token.*expired|requires authentication/.test(normalized)) {
    return new GithubWorkspaceError(
      "انتهت صلاحية جلسة GitHub أو أن الرمز غير صالح. أعد تسجيل الدخول عبر GitHub.",
      "AUTH"
    );
  }
  if (/403|forbidden|resource not accessible|permission|insufficient scope/.test(normalized)) {
    return new GithubWorkspaceError(
      "رفض GitHub العملية. تحقق من صلاحيات المستودع ونطاقات OAuth المطلوبة.",
      "PERMISSION"
    );
  }
  if (/404|not found/.test(normalized)) {
    return new GithubWorkspaceError(
      "المستودع أو الملف غير موجود، أو أن حساب GitHub لا يملك صلاحية الوصول إليه.",
      "NOT_FOUND"
    );
  }
  if (/rate limit|secondary rate/.test(normalized)) {
    return new GithubWorkspaceError(
      "وصلت إلى حد طلبات GitHub مؤقتًا. انتظر قليلًا ثم أعد المحاولة.",
      "RATE_LIMIT"
    );
  }
  if (/failed to fetch|network|fetcherror|connection/.test(normalized)) {
    return new GithubWorkspaceError(
      "تعذر الاتصال بخدمة GitHub. تحقق من اتصال الإنترنت ثم أعد المحاولة.",
      "NETWORK"
    );
  }

  return new GithubWorkspaceError(message || "تعذر تنفيذ طلب GitHub.", "UNKNOWN");
}

async function callGithub<T>(
  session: Session | null,
  payload: Record<string, unknown>
): Promise<T> {
  const token = session?.provider_token;
  if (!token) {
    throw new GithubWorkspaceError(
      "جلسة GitHub غير متاحة. سجّل الدخول عبر GitHub من جديد.",
      "AUTH"
    );
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase.functions.invoke("github-workspace", {
      body: { ...payload, githubToken: token }
    });

    if (error) {
      throw explainGithubError(error.message || "تعذر الاتصال بخدمة GitHub.");
    }

    if (data && typeof data === "object" && "error" in data && data.error) {
      throw explainGithubError(String(data.error));
    }

    if (data == null) {
      throw new GithubWorkspaceError(
        "أعادت خدمة GitHub استجابة فارغة. حاول تحديث الصفحة.",
        "NETWORK"
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof GithubWorkspaceError) throw error;
    if (error instanceof Error) throw explainGithubError(error.message);
    throw new GithubWorkspaceError("حدث خطأ غير متوقع أثناء الاتصال بـ GitHub.");
  }
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
      private: isPrivate
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
    return callGithub<GithubBranch>(session, { action: "create_branch", owner, repo, branch: name, from });
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
  createPullRequest(
    session: Session | null,
    owner: string,
    repo: string,
    title: string,
    head: string,
    base: string,
    body: string,
    draft = false
  ) {
    return callGithub<GithubPullRequest>(session, {
      action: "create_pull_request",
      owner,
      repo,
      title,
      head,
      base,
      body,
      draft
    });
  },
  commit(
    session: Session | null,
    owner: string,
    repo: string,
    branch: string,
    message: string,
    changes: Array<{
      path: string;
      content?: string;
      deleted?: boolean;
      mode?: "100644" | "100755";
    }>
  ) {
    return callGithub<GithubCommitResult>(session, {
      action: "commit",
      owner,
      repo,
      branch,
      message,
      changes
    });
  }
};
