import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/auth-context";
import { DirectionProvider } from "@/contexts/direction-context";
import { ThemeProvider } from "@/contexts/theme-context";
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
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body>
        <DirectionProvider>
          <ThemeProvider>
            <AuthProvider>{children}</AuthProvider>
          </ThemeProvider>
        </DirectionProvider>
      </body>
    </html>
  );
}
