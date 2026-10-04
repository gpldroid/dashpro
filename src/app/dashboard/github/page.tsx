import { GithubWorkspace } from "@/components/github/GithubWorkspace";

export const metadata = {
  title: "مساحة GitHub — DashPro",
  description: "استعراض وتحرير وCommit لمستودعات GitHub من DashPro."
};

export default function GithubPage() {
  return <GithubWorkspace />;
}
