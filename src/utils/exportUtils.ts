import { zipSync, strToU8 } from "fflate";

import { generateBloggerXml, validateBloggerXml } from "@/utils/bloggerParser";

export interface StaticSiteFiles {
  html: string;
  css?: string;
  js?: string;
  additionalFiles?: Record<string, string>;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

export function exportBloggerXML(source: string): void {
  if (typeof window === "undefined") {
    throw new Error("تصدير القالب متاح من المتصفح فقط.");
  }

  const diagnostics = validateBloggerXml(source);
  const errors = diagnostics.filter((item) => item.severity === "error");
  if (errors.length > 0) {
    throw new Error(
      "لا يمكن التصدير: قالب Blogger يحتوي على " +
        errors.length +
        " خطأ/أخطاء XML. صحح الأخطاء أولاً.",
    );
  }

  let xml: string;
  try {
    xml = generateBloggerXml(source);
  } catch (error) {
    console.error("DashPro Blogger export failed:", error);
    throw new Error("تعذر تجهيز قالب Blogger للتصدير.");
  }

  downloadBlob(
    new Blob([xml], { type: "application/xml;charset=utf-8" }),
    "template.xml",
  );
}

export function exportStaticSiteZip(files: StaticSiteFiles): void {
  if (typeof window === "undefined") {
    throw new Error("تصدير الموقع متاح من المتصفح فقط.");
  }

  if (!files.html.trim()) {
    throw new Error("لا يمكن تصدير موقع ثابت بدون ملف index.html.");
  }

  try {
    const entries: Record<string, Uint8Array> = {
      "index.html": strToU8(files.html),
      "style.css": strToU8(files.css ?? ""),
      "script.js": strToU8(files.js ?? ""),
    };

    for (const [path, content] of Object.entries(files.additionalFiles ?? {})) {
      const normalized = path.replace(/^\/+/, "").replace(/\\/g, "/");
      if (
        !normalized ||
        normalized.includes("..") ||
        normalized.startsWith("http:") ||
        normalized.startsWith("https:")
      ) {
        throw new Error("مسار ملف غير صالح: " + path);
      }
      entries[normalized] = strToU8(content);
    }

    const archive = zipSync(entries, { level: 6 });
    const archiveBuffer = new ArrayBuffer(archive.byteLength);
    new Uint8Array(archiveBuffer).set(archive);

    downloadBlob(
      new Blob([archiveBuffer], { type: "application/zip" }),
      "dashpro-static-site.zip",
    );
  } catch (error) {
    console.error("DashPro static export failed:", error);
    if (error instanceof Error && error.message.startsWith("مسار ملف غير صالح")) {
      throw error;
    }
    throw new Error("تعذر إنشاء ملف ZIP للموقع الثابت.");
  }
}
