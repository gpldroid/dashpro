import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "DashPro — Website & Blogger Builder",
    template: "%s | DashPro"
  },
  description:
    "Build Blogger templates and modern websites with the DashPro visual builder."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
