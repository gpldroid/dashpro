import { GithubDeliveryCenter } from "@/components/github/GithubDeliveryCenter";

export const metadata = {
  title: "مركز التسليم GitHub — DashPro",
  description: "إدارة Commits وPull Requests من لوحة DashPro.",
};

export default function GithubDeliveryPage() {
  return <GithubDeliveryCenter />;
}
