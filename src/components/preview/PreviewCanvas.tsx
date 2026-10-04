"use client";

import { Monitor, RotateCw, Smartphone, Tablet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { buildPreviewDocument } from "@/utils/bloggerPreview";

type PreviewDevice = "desktop" | "tablet" | "mobile";

interface PreviewCanvasProps {
  code: string;
  customCss?: string;
}

const sizes: Record<PreviewDevice, { width: number; height: number; label: string }> = {
  desktop: { width: 1280, height: 800, label: "سطح المكتب" },
  tablet: { width: 820, height: 1024, label: "تابلت" },
  mobile: { width: 390, height: 844, label: "الجوال" },
};

const GOOGLE_FONTS: Record<string, string> = {
  Cairo: "Cairo:wght@400;500;600;700;800",
  Tajawal: "Tajawal:wght@400;500;700;800",
  "Noto Sans Arabic": "Noto+Sans+Arabic:wght@400;500;600;700;800",
  Inter: "Inter:wght@400;500;600;700;800",
  Roboto: "Roboto:wght@400;500;700",
};

export function PreviewCanvas({ code, customCss = "" }: PreviewCanvasProps) {
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [rotated, setRotated] = useState(false);
  const [revision, setRevision] = useState(0);
  const [customWidth, setCustomWidth] = useState<number | null>(null);
  const [customHeight, setCustomHeight] = useState<number | null>(null);

  const srcDoc = useMemo(() => {
    const fontMatch = /font-family\s*:\s*([^;},]+)/i.exec(customCss);
    const fontName = fontMatch?.[1]?.trim().replace(/^['"]|['"]$/g, "");
    const fontUrl = fontName && GOOGLE_FONTS[fontName]
      ? `https://fonts.googleapis.com/css2?family=${GOOGLE_FONTS[fontName]}&display=swap`
      : null;
    const fontImport = fontUrl
      ? `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${fontUrl}">`
      : "";
    return buildPreviewDocument(code).replace(
      "</head>",
      `${fontImport}<style data-dashpro-live-style>${customCss}</style></head>`,
    );
  }, [code, customCss]);

  useEffect(() => {
    const timer = window.setTimeout(() => setRevision((value) => value + 1), 180);
    return () => window.clearTimeout(timer);
  }, [srcDoc]);

  const preset = sizes[device];
  const baseWidth = customWidth ?? preset.width;
  const baseHeight = customHeight ?? preset.height;
  const width = rotated ? baseHeight : baseWidth;
  const height = rotated ? baseWidth : baseHeight;

  const resetDimensions = () => {
    setCustomWidth(null);
    setCustomHeight(null);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950" dir="rtl">
      <div className="space-y-3 border-b border-slate-200 bg-white px-3 py-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1">
            {([["desktop", Monitor], ["tablet", Tablet], ["mobile", Smartphone]] as const).map(([value, Icon]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setDevice(value);
                  setCustomWidth(null);
                  setCustomHeight(null);
                }}
                className={device === value ? "rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white dark:bg-white dark:text-slate-900" : "rounded-lg px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}
              >
                <Icon className="me-1 inline-block size-4" />
                {sizes[value].label}
              </button>
            ))}
            <button type="button" onClick={() => setRotated((value) => !value)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="تدوير الشاشة">
              <RotateCw className="size-4" />
            </button>
            <button type="button" onClick={resetDimensions} className="rounded-lg px-2 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              إعادة المقاس
            </button>
          </div>
          <span className="text-xs font-medium text-slate-500">{width} × {height}px</span>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <label className="text-xs font-bold text-slate-500">
            العرض: {baseWidth}px
            <input type="range" min="320" max="1920" step="10" value={baseWidth} onChange={(event) => setCustomWidth(Number(event.target.value))} className="mt-1 w-full" />
          </label>
          <label className="text-xs font-bold text-slate-500">
            الارتفاع: {baseHeight}px
            <input type="range" min="320" max="1400" step="10" value={baseHeight} onChange={(event) => setCustomHeight(Number(event.target.value))} className="mt-1 w-full" />
          </label>
        </div>
      </div>

      <div className="min-h-[620px] overflow-auto p-4">
        <div className="mx-auto rounded-xl border border-slate-300 bg-slate-900 p-2 shadow-xl" style={{ width: `min(100%, ${Math.min(width, 1280)}px)` }}>
          <iframe
            key={revision}
            title="معاينة قالب Blogger"
            sandbox="allow-scripts allow-forms allow-popups"
            srcDoc={srcDoc}
            className="h-[min(80vh,900px)] w-full rounded-lg bg-white"
            style={{ aspectRatio: `${width} / ${height}` }}
          />
        </div>
      </div>
    </section>
  );
}
