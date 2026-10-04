"use client";

import { Monitor, RotateCw, Smartphone, Tablet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { buildPreviewDocument } from "@/utils/bloggerPreview";

type PreviewDevice = "desktop" | "tablet" | "mobile";
interface PreviewCanvasProps { code: string; customCss?: string; }
const sizes: Record<PreviewDevice,{width:number;height:number;label:string}> = {
  desktop:{width:1280,height:800,label:"سطح المكتب"},
  tablet:{width:820,height:1024,label:"تابلت"},
  mobile:{width:390,height:844,label:"الجوال"},
};

export function PreviewCanvas({ code, customCss = "" }: PreviewCanvasProps) {
  const [device,setDevice] = useState<PreviewDevice>("desktop");
  const [rotated,setRotated] = useState(false);
  const [revision,setRevision] = useState(0);
  const srcDoc = useMemo(() => buildPreviewDocument(code).replace("</head>", "<style data-dashpro-live-style>" + customCss + "</style></head>"), [code,customCss]);

  useEffect(() => { const timer = window.setTimeout(() => setRevision((v) => v + 1), 180); return () => window.clearTimeout(timer); }, [srcDoc]);

  const size = sizes[device]; const width = rotated ? size.height : size.width; const height = rotated ? size.width : size.height;
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-1">
          {([["desktop",Monitor],["tablet",Tablet],["mobile",Smartphone]] as const).map(([value,Icon]) => (
            <button key={value} type="button" onClick={() => setDevice(value)} className={device === value ? "rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white dark:bg-white dark:text-slate-900" : "rounded-lg px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}>
              <Icon className="me-1 inline-block size-4" />{sizes[value].label}
            </button>
          ))}
          <button type="button" onClick={() => setRotated((v) => !v)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="تدوير الشاشة"><RotateCw className="size-4" /></button>
        </div>
        <span className="text-xs font-medium text-slate-500">{width} × {height}px</span>
      </div>
      <div className="min-h-[620px] overflow-auto p-4">
        <div className="mx-auto rounded-xl border border-slate-300 bg-slate-900 p-2 shadow-xl" style={{ width:"min(100%," + Math.min(width,1280) + "px)" }}>
          <iframe key={revision} title="معاينة قالب Blogger" sandbox="allow-scripts allow-forms allow-popups" srcDoc={srcDoc} className="h-[min(80vh,900px)] w-full rounded-lg bg-white" style={{ aspectRatio: width + " / " + height }} />
        </div>
      </div>
    </section>
  );
}
