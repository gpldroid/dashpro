import { LocalFileManager } from "@/components/dashboard/LocalFileManager";

export const metadata = {
  title: "الملفات المحلية — DashPro",
  description: "استيراد وتصدير الملفات محليًا من لوحة تحكم DashPro."
};

export default function LocalFilesPage() {
  return <LocalFileManager />;
}
