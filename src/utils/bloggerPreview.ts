export interface DummyPost { id: string; title: string; body: string; url: string; author: string; timestamp: string; labels: string[]; thumbnail: string; }
export interface DummyBloggerData { blog: { title: string; description: string; url: string; homepageUrl: string; pageType: string }; posts: DummyPost[]; }
const DEFAULT_DATA: DummyBloggerData = {
  blog: { title: "مدونة DashPro التجريبية", description: "معاينة حية لقالب Blogger داخل DashPro", url: "https://example.invalid/", homepageUrl: "https://example.invalid/", pageType: "index" },
  posts: [
    { id: "1", title: "مرحباً بك في المعاينة الحية", body: "<p>هذا محتوى تجريبي للمقال الأول.</p>", url: "#post-1", author: "أحمد", timestamp: "4 أكتوبر 2026", labels: ["Blogger"], thumbnail: "" },
    { id: "2", title: "بناء واجهة عربية متجاوبة", body: "<p>مثال ثانٍ لاختبار الشبكات والسايدبار.</p>", url: "#post-2", author: "سارة", timestamp: "2 أكتوبر 2026", labels: ["RTL"], thumbnail: "" }
  ]
};
function escapeHtml(value: string): string { return value.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;"); }
function dataValue(key: string, data: DummyBloggerData): string {
  const values: Record<string,string> = { "blog.title":data.blog.title, "blog.description":data.blog.description, "blog.url":data.blog.url, "blog.homepageUrl":data.blog.homepageUrl, "blog.pageType":data.blog.pageType };
  return values[key] ?? "";
}
function replaceSimpleData(source: string, data: DummyBloggerData): string {
  return source.replace(/<data:([a-zA-Z0-9_.-]+)\s*\/?>/g, (_, key: string) => escapeHtml(dataValue(key,data)));
}
function replaceLoops(source: string, data: DummyBloggerData): string {
  return source.replace(/<b:loop\b([^>]*)>([\s\S]*?)<\/b:loop>/gi, (_, attrs: string, body: string) => {
    const values = /values\s*=\s*["']([^"']+)["']/i.exec(attrs)?.[1] ?? "";
    if (!values.includes("data:posts")) return "";
    return data.posts.map((post) => body.replace(/<data:post\.([a-zA-Z0-9_.-]+)\s*\/?>/g, (_x, key: string) => escapeHtml(String((post as unknown as Record<string,string>)[key] ?? "")))).join("\n");
  });
}
function replaceConditionals(source: string, data: DummyBloggerData): string {
  return source.replace(/<b:if\b([^>]*)>([\s\S]*?)<\/b:if>/gi, (_, attrs: string, body: string) => {
    const cond = /cond\s*=\s*["']([^"']+)["']/i.exec(attrs)?.[1] ?? "";
    if (cond.includes("data:blog.url") && cond.includes("homepageUrl")) return data.blog.url === data.blog.homepageUrl ? body : "";
    return body;
  });
}
function removeBloggerOnlyTags(source: string): string {
  return source.replace(/<b:(?:skin|template-skin)\b[^>]*>[\s\S]*?<\/b:(?:skin|template-skin)>/gi,"").replace(/<\/?b:(?:section|widget|includable)\b[^>]*>/gi,"").replace(/<b:[^>]+\/>/gi,"");
}
function documentFromXml(xml: string): string {
  try {
    const parser = new DOMParser(); const doc = parser.parseFromString(xml,"application/xml");
    if (doc.querySelector("parsererror")) throw new Error("invalid xml");
    const root = doc.documentElement; const skin = Array.from(root.getElementsByTagName("*")).find((node) => node.tagName === "b:skin" || node.localName === "skin");
    const body = root.getElementsByTagName("body")[0];
    return '<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>' + (skin?.textContent ?? "") + '</style></head><body>' + (body?.innerHTML ?? "") + '</body></html>';
  } catch { return '<!doctype html><html lang="ar" dir="rtl"><body style="font-family:system-ui;padding:24px"><h2>تعذر تحليل القالب</h2><p>أكمل XML ثم ستظهر المعاينة.</p></body></html>'; }
}
export function buildPreviewDocument(xml: string, data: DummyBloggerData = DEFAULT_DATA): string {
  try { return documentFromXml(removeBloggerOnlyTags(replaceSimpleData(replaceConditionals(replaceLoops(xml,data),data),data))); }
  catch { return documentFromXml(""); }
}
export const DEFAULT_BLOGGER_PREVIEW_DATA = DEFAULT_DATA;
