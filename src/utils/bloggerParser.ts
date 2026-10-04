export type BloggerSeverity = "error" | "warning";
export type BloggerNodeKind = "document" | "element" | "text" | "comment" | "conditional" | "loop" | "data" | "skin" | "section" | "widget" | "includable";

export interface BloggerAttribute { name: string; value: string; quote: "'" | '"' | null; }
export interface BloggerNode {
  id: string; kind: BloggerNodeKind; name: string; attributes: BloggerAttribute[];
  children: BloggerNode[]; text: string; start: number; end: number; parentId: string | null;
}
export interface BloggerDiagnostic {
  severity: BloggerSeverity; message: string; line: number; column: number; offset: number;
  code: "malformed-tag" | "unclosed-tag" | "unexpected-close" | "mismatched-close" | "missing-root" | "missing-namespace" | "missing-section" | "missing-widget";
}
export interface BloggerVariable { name: string; value: string; type: "color" | "font" | "dimension" | "text" | "unknown"; group: string | null; }
export interface BloggerTemplate {
  root: BloggerNode; sections: BloggerNode[]; widgets: BloggerNode[]; includables: BloggerNode[];
  conditionals: BloggerNode[]; loops: BloggerNode[]; dataExpressions: string[];
  variables: BloggerVariable[]; diagnostics: BloggerDiagnostic[]; isValid: boolean;
}

function pos(source: string, offset: number) {
  const before = source.slice(0, offset);
  const line = before.split("\n").length;
  return { line, column: offset - before.lastIndexOf("\n") };
}
function diag(source: string, offset: number, message: string, code: BloggerDiagnostic["code"], severity: BloggerSeverity = "error"): BloggerDiagnostic {
  return { severity, message, code, offset, ...pos(source, offset) };
}
function attrs(raw: string): BloggerAttribute[] {
  const out: BloggerAttribute[] = [];
  const re = /([:\w.-]+)\s*=\s*(["'])([\s\S]*?)\2|([:\w.-]+)\s*=\s*([^\s"'=<>]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) out.push({ name: m[1] || m[4], value: m[3] || m[5] || "", quote: m[2] ? m[2] as "'" | '"' : null });
  return out;
}
function kind(name: string): BloggerNodeKind {
  const n = name.toLowerCase();
  if (n === "b:section") return "section";
  if (n === "b:widget") return "widget";
  if (n === "b:includable") return "includable";
  if (n === "b:if") return "conditional";
  if (n === "b:loop") return "loop";
  if (n === "b:skin") return "skin";
  if (n.startsWith("data:")) return "data";
  return "element";
}
function variables(source: string): BloggerVariable[] {
  const skin = source.match(/<b:skin\b[^>]*>([\s\S]*?)<\/b:skin>/i)?.[1] || "";
  const out: BloggerVariable[] = [];
  const re = /<Variable\s+([^>]+?)\s*\/?\s*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(skin))) {
    const raw = m[1];
    const name = raw.match(/name\s*=\s*["']([^"']+)["']/i)?.[1] || "";
    const value = raw.match(/default\s*=\s*["']([^"']+)["']/i)?.[1] || raw.match(/value\s*=\s*["']([^"']+)["']/i)?.[1] || "";
    const t = (raw.match(/type\s*=\s*["']([^"']+)["']/i)?.[1] || "").toLowerCase();
    const type: BloggerVariable["type"] = t.includes("color") ? "color" : t.includes("font") ? "font" : t.includes("length") || t.includes("dimension") ? "dimension" : t.includes("text") ? "text" : "unknown";
    if (name) out.push({ name, value, type, group: null });
  }
  return out;
}
export function parseBloggerTemplate(source: string): BloggerTemplate {
  const root: BloggerNode = { id: "root", kind: "document", name: "#document", attributes: [], children: [], text: "", start: 0, end: source.length, parentId: null };
  const stack: BloggerNode[] = [root], diagnostics: BloggerDiagnostic[] = [];
  let id = 0, cursor = 0, m: RegExpExecArray | null;
  const re = /<!--[\s\S]*?-->|<\/?[A-Za-z_][^<>]*?>/g;
  while ((m = re.exec(source))) {
    if (m.index > cursor) stack[stack.length - 1].children.push({ id: "text-" + id++, kind: "text", name: "#text", attributes: [], children: [], text: source.slice(cursor, m.index), start: cursor, end: m.index, parentId: stack[stack.length - 1].id });
    const raw = m[0];
    if (raw.startsWith("<!--")) {
      stack[stack.length - 1].children.push({ id: "comment-" + id++, kind: "comment", name: "#comment", attributes: [], children: [], text: raw.slice(4, -3), start: m.index, end: m.index + raw.length, parentId: stack[stack.length - 1].id });
      cursor = m.index + raw.length; continue;
    }
    if (raw.startsWith("</")) {
      const close = raw.match(/^<\/\s*([^\s>]+)\s*>$/);
      if (!close) diagnostics.push(diag(source, m.index, "وسم الإغلاق غير صالح.", "malformed-tag"));
      else {
        const name = close[1], current = stack[stack.length - 1];
        if (current.name === name) stack.pop()!.end = m.index + raw.length;
        else {
          diagnostics.push(diag(source, m.index, "وسم الإغلاق " + name + " لا يطابق الوسم المفتوح.", "mismatched-close"));
          const found = stack.slice(1).some(n => n.name === name);
          if (found) {
            while (stack.length > 1 && stack[stack.length - 1].name !== name) diagnostics.push(diag(source, stack.pop()!.start, "وسم غير مغلق.", "unclosed-tag"));
            if (stack.length > 1) stack.pop()!.end = m.index + raw.length;
          } else diagnostics.push(diag(source, m.index, "وسم الإغلاق لا يطابق أي وسم مفتوح.", "unexpected-close"));
        }
      }
      cursor = m.index + raw.length; continue;
    }
    const open = raw.match(/^<\s*([A-Za-z_][\w:.-]*)([\s\S]*?)(\/?)>$/);
    if (!open) { diagnostics.push(diag(source, m.index, "تعذر تحليل وسم XML.", "malformed-tag")); cursor = m.index + raw.length; continue; }
    const node: BloggerNode = { id: "node-" + id++, kind: kind(open[1]), name: open[1], attributes: attrs(open[2]), children: [], text: "", start: m.index, end: m.index + raw.length, parentId: stack[stack.length - 1].id };
    stack[stack.length - 1].children.push(node);
    if (!open[3] && !/^(!DOCTYPE|\?xml)$/i.test(node.name)) stack.push(node);
    cursor = m.index + raw.length;
  }
  while (stack.length > 1) diagnostics.push(diag(source, stack.pop()!.start, "الوسم غير مغلق.", "unclosed-tag"));
  const all: BloggerNode[] = [];
  const visit = (n: BloggerNode) => { if (n.kind !== "document" && n.kind !== "text" && n.kind !== "comment") all.push(n); n.children.forEach(visit); };
  visit(root);
  const html = all.find(n => n.name.toLowerCase() === "html");
  if (!html) diagnostics.push(diag(source, 0, "الترويسة الجذرية <html> مفقودة.", "missing-root"));
  else if (!html.attributes.some(a => a.name === "xmlns:b")) diagnostics.push(diag(source, html.start, "namespace xmlns:b مفقود من <html>.", "missing-namespace"));
  const sections = all.filter(n => n.kind === "section"), widgets = all.filter(n => n.kind === "widget");
  if (html && !sections.length) diagnostics.push(diag(source, html.start, "لم يتم العثور على <b:section>.", "missing-section", "warning"));
  if (sections.length && !widgets.length) diagnostics.push(diag(source, sections[0].start, "تم العثور على sections بدون widgets.", "missing-widget", "warning"));
  return {
    root, sections, widgets, includables: all.filter(n => n.kind === "includable"),
    conditionals: all.filter(n => n.kind === "conditional"), loops: all.filter(n => n.kind === "loop"),
    dataExpressions: [...new Set((source.match(/<data:[^>]+>/g) || []).map(x => x.slice(1, -1)))],
    variables: variables(source), diagnostics, isValid: diagnostics.every(d => d.severity !== "error")
  };
}
export function formatBloggerXml(source: string): string {
  const tokens = source.replace(/>\s*</g, "><").trim().match(/<!--[\s\S]*?-->|<[^>]+>|[^<]+/g) || [];
  const lines: string[] = []; let depth = 0;
  for (const token of tokens) {
    const t = token.trim(); if (!t) continue;
    if (t.startsWith("</")) depth = Math.max(0, depth - 1);
    lines.push("  ".repeat(depth) + t);
    if (/^<[^!?/][^>]*>$/.test(t) && !t.endsWith("/>")) depth++;
  }
  return lines.join("\n");
}
export function generateBloggerXml(source: string): string { return source.endsWith("\n") ? source : source + "\n"; }
