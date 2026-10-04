export type BloggerDiagnosticSeverity = "error" | "warning" | "info";

export interface BloggerDiagnostic {
  severity: BloggerDiagnosticSeverity;
  message: string;
  line: number;
  column: number;
  offset: number;
  code: string;
}

export interface BloggerAttribute {
  name: string;
  value: string;
  namespaceURI: string | null;
  prefix: string | null;
}

export interface BloggerAstNode {
  type: "element" | "text" | "comment";
  name: string;
  namespaceURI: string | null;
  attributes: BloggerAttribute[];
  children: BloggerAstNode[];
  text?: string;
}

export interface BloggerSection {
  id: string | null;
  className: string | null;
  maxWidgets: string | null;
  showAddElement: string | null;
  node: BloggerAstNode;
  widgets: BloggerWidget[];
}

export interface BloggerWidget {
  id: string | null;
  type: string | null;
  title: string | null;
  locked: string | null;
  node: BloggerAstNode;
  includables: BloggerIncludable[];
}

export interface BloggerIncludable {
  id: string | null;
  node: BloggerAstNode;
}

export interface BloggerSkinVariable {
  name: string;
  type: string | null;
  defaultValue: string | null;
  value: string | null;
  description: string | null;
  group: string | null;
}

export interface BloggerSkinGroup {
  description: string | null;
  selector: string | null;
  variables: BloggerSkinVariable[];
}

export interface BloggerSkin {
  rawCss: string;
  variables: BloggerSkinVariable[];
  groups: BloggerSkinGroup[];
}

export interface BloggerParseResult {
  ast: BloggerAstNode | null;
  sections: BloggerSection[];
  widgets: BloggerWidget[];
  includables: BloggerIncludable[];
  skin: BloggerSkin | null;
  dataTags: string[];
  conditionals: number;
  loops: number;
  diagnostics: BloggerDiagnostic[];
  isValid: boolean;
}

const BLOGGER_NAMESPACE = "http://www.google.com/2005/gml/b";

function position(source: string, offset: number): { line: number; column: number } {
  const before = source.slice(0, Math.max(0, offset));
  const lines = before.split("\n");
  return { line: lines.length, column: (lines.at(-1)?.length ?? 0) + 1 };
}

function makeDiagnostic(
  source: string,
  message: string,
  code: string,
  severity: BloggerDiagnosticSeverity,
  offset = 0,
): BloggerDiagnostic {
  return { severity, message, code, offset, ...position(source, offset) };
}

function attributes(element: Element): BloggerAttribute[] {
  return Array.from(element.attributes).map((attribute) => ({
    name: attribute.name,
    value: attribute.value,
    namespaceURI: attribute.namespaceURI,
    prefix: attribute.prefix,
  }));
}

function toAst(node: Node): BloggerAstNode | null {
  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element;
    return {
      type: "element",
      name: element.tagName,
      namespaceURI: element.namespaceURI,
      attributes: attributes(element),
      children: Array.from(element.childNodes)
        .map(toAst)
        .filter((child): child is BloggerAstNode => child !== null),
    };
  }

  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.nodeValue ?? "";
    return text.trim()
      ? { type: "text", name: "#text", namespaceURI: null, attributes: [], children: [], text }
      : null;
  }

  if (node.nodeType === Node.COMMENT_NODE) {
    return {
      type: "comment",
      name: "#comment",
      namespaceURI: null,
      attributes: [],
      children: [],
      text: node.nodeValue ?? "",
    };
  }

  return null;
}

function directText(element: Element): string {
  return Array.from(element.childNodes)
    .filter((node) => node.nodeType === Node.TEXT_NODE || node.nodeType === Node.CDATA_SECTION_NODE)
    .map((node) => node.nodeValue ?? "")
    .join("")
    .trim();
}

function collect(root: Element, name: string): Element[] {
  return Array.from(root.getElementsByTagName("*")).filter(
    (element) => element.tagName === name || element.localName === name,
  );
}

function parseSkin(skinElement: Element): BloggerSkin {
  const rawCss = directText(skinElement);
  const variables: BloggerSkinVariable[] = [];
  const groups: BloggerSkinGroup[] = [];

  const read = (raw: string, key: string): string | null => {
    const match = new RegExp(`\\b${key}\\s*=\\s*["']([^"']*)["']`, "i").exec(raw);
    return match?.[1] ?? null;
  };

  const variableRegex = /<Variable\s+([^>]+?)\s*\/?>(?:<\/Variable>)?/gi;
  const groupRegex = /<Group\s+([^>]+)>([\s\S]*?)<\/Group>/gi;

  for (const match of rawCss.matchAll(variableRegex)) {
    const raw = match[1];
    variables.push({
      name: read(raw, "name") ?? "",
      type: read(raw, "type"),
      defaultValue: read(raw, "default"),
      value: read(raw, "value"),
      description: read(raw, "description"),
      group: null,
    });
  }

  for (const match of rawCss.matchAll(groupRegex)) {
    const rawAttributes = match[1];
    const body = match[2];
    const description = read(rawAttributes, "description");
    const groupVariables: BloggerSkinVariable[] = [];

    for (const variableMatch of body.matchAll(variableRegex)) {
      const raw = variableMatch[1];
      groupVariables.push({
        name: read(raw, "name") ?? "",
        type: read(raw, "type"),
        defaultValue: read(raw, "default"),
        value: read(raw, "value"),
        description: read(raw, "description"),
        group: description,
      });
    }

    groups.push({
      description,
      selector: read(rawAttributes, "selector"),
      variables: groupVariables,
    });
  }

  return { rawCss, variables, groups };
}

export function validateBloggerXml(source: string): BloggerDiagnostic[] {
  const diagnostics: BloggerDiagnostic[] = [];
  const parser = new DOMParser();
  const document = parser.parseFromString(source, "application/xml");
  const parserError = document.querySelector("parsererror");

  if (parserError) {
    diagnostics.push(
      makeDiagnostic(
        source,
        parserError.textContent?.replace(/\s+/g, " ").trim() || "تعذر تحليل XML.",
        "XML_PARSE_ERROR",
        "error",
      ),
    );
    return diagnostics;
  }

  const root = document.documentElement;
  if (!root || root.tagName.toLowerCase() !== "html") {
    diagnostics.push(makeDiagnostic(source, "يجب أن يكون العنصر الجذري <html>.", "ROOT_HTML_MISSING", "error"));
    return diagnostics;
  }

  for (const prefix of ["b", "m"] as const) {
    if (!root.getAttribute(`xmlns:${prefix}`)) {
      diagnostics.push(
        makeDiagnostic(
          source,
          `ترويسة Blogger مفقودة: xmlns:${prefix} غير موجودة في <html>.`,
          `NAMESPACE_${prefix.toUpperCase()}_MISSING`,
          "error",
          source.indexOf("<html"),
        ),
      );
    }
  }

  if (root.getAttribute("xmlns:b") && root.getAttribute("xmlns:b") !== BLOGGER_NAMESPACE) {
    diagnostics.push(
      makeDiagnostic(
        source,
        "قيمة xmlns:b لا تطابق مساحة أسماء Blogger القياسية.",
        "INVALID_BLOGGER_NAMESPACE",
        "warning",
      ),
    );
  }

  const sections = collect(root, "b:section");
  if (sections.length === 0) {
    diagnostics.push(
      makeDiagnostic(
        source,
        "لم يتم العثور على <b:section>. أضف قسمًا واحدًا على الأقل قبل التصدير.",
        "SECTION_MISSING",
        "warning",
      ),
    );
  }

  for (const section of sections) {
    if (!section.getAttribute("id")) {
      diagnostics.push(
        makeDiagnostic(
          source,
          "يوجد <b:section> بدون id.",
          "SECTION_ID_MISSING",
          "error",
          source.indexOf("<b:section"),
        ),
      );
    }
  }

  for (const widget of collect(root, "b:widget")) {
    if (!widget.getAttribute("id")) {
      diagnostics.push(
        makeDiagnostic(source, "يوجد <b:widget> بدون id.", "WIDGET_ID_MISSING", "error", source.indexOf("<b:widget")),
      );
    }
    if (!widget.getAttribute("type")) {
      diagnostics.push(
        makeDiagnostic(source, "يوجد <b:widget> بدون type.", "WIDGET_TYPE_MISSING", "error", source.indexOf("<b:widget")),
      );
    }
  }

  if (!/<b:skin\b[^>]*>[\s\S]*?<\/b:skin>/i.test(source)) {
    diagnostics.push(
      makeDiagnostic(
        source,
        "لم يتم العثور على <b:skin>. سيظل التحليل ممكنًا، لكن متغيرات التنسيق لن تكون متاحة.",
        "SKIN_MISSING",
        "warning",
      ),
    );
  }

  return diagnostics;
}

export function parseBloggerXml(source: string): BloggerParseResult {
  const diagnostics = validateBloggerXml(source);
  const parser = new DOMParser();
  const document = parser.parseFromString(source, "application/xml");

  if (document.querySelector("parsererror")) {
    return {
      ast: null,
      sections: [],
      widgets: [],
      includables: [],
      skin: null,
      dataTags: [],
      conditionals: 0,
      loops: 0,
      diagnostics,
      isValid: false,
    };
  }

  const root = document.documentElement;
  const ast = root ? toAst(root) : null;
  const sections: BloggerSection[] = [];
  const widgets: BloggerWidget[] = [];
  const includables: BloggerIncludable[] = [];

  if (root) {
    for (const sectionElement of collect(root, "b:section")) {
      const sectionWidgets: BloggerWidget[] = [];

      for (const widgetElement of collect(sectionElement, "b:widget")) {
        const widgetIncludables: BloggerIncludable[] = [];

        for (const includableElement of collect(widgetElement, "b:includable")) {
          const includable = {
            id: includableElement.getAttribute("id"),
            node: toAst(includableElement) as BloggerAstNode,
          };
          widgetIncludables.push(includable);
          includables.push(includable);
        }

        const widget: BloggerWidget = {
          id: widgetElement.getAttribute("id"),
          type: widgetElement.getAttribute("type"),
          title: widgetElement.getAttribute("title"),
          locked: widgetElement.getAttribute("locked"),
          node: toAst(widgetElement) as BloggerAstNode,
          includables: widgetIncludables,
        };
        sectionWidgets.push(widget);
        widgets.push(widget);
      }

      sections.push({
        id: sectionElement.getAttribute("id"),
        className: sectionElement.getAttribute("class"),
        maxWidgets: sectionElement.getAttribute("maxwidgets"),
        showAddElement: sectionElement.getAttribute("showaddelement"),
        node: toAst(sectionElement) as BloggerAstNode,
        widgets: sectionWidgets,
      });
    }
  }

  const skinElement = root ? collect(root, "b:skin")[0] : undefined;
  const dataTags = root
    ? Array.from(root.getElementsByTagName("*"))
        .filter((element) => element.prefix === "data" || element.tagName.startsWith("data:"))
        .map((element) => element.tagName)
        .filter((value, index, values) => values.indexOf(value) === index)
    : [];

  return {
    ast,
    sections,
    widgets,
    includables,
    skin: skinElement ? parseSkin(skinElement) : null,
    dataTags,
    conditionals: root ? collect(root, "b:if").length : 0,
    loops: root ? collect(root, "b:loop").length : 0,
    diagnostics,
    isValid: diagnostics.every((item) => item.severity !== "error"),
  };
}

export function generateBloggerXml(source: string): string {
  const parser = new DOMParser();
  const document = parser.parseFromString(source, "application/xml");
  if (document.querySelector("parsererror")) {
    throw new Error("لا يمكن توليد XML من قالب غير صالح.");
  }

  const serialized = new XMLSerializer().serializeToString(document);
  return `<?xml version="1.0" encoding="UTF-8"?>\n${serialized}`;
}

export function formatBloggerXml(source: string): string {
  const generated = generateBloggerXml(source);
  const tokens = generated.replace(/>\s*</g, "><").split(/(<[^>]+>)/g).filter(Boolean);
  let depth = 0;

  return tokens
    .map((token) => {
      const trimmed = token.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("</")) depth = Math.max(0, depth - 1);
      const line = `${"  ".repeat(depth)}${trimmed}`;
      if (
        trimmed.startsWith("<") &&
        !trimmed.startsWith("</") &&
        !trimmed.startsWith("<?") &&
        !trimmed.startsWith("<!")
      ) {
        if (!trimmed.endsWith("/>")) depth += 1;
      }
      return line;
    })
    .filter(Boolean)
    .join("\n");
}

export function insertBloggerSnippet(source: string, snippet: "widget" | "post-if" | "home-if"): string {
  const snippets: Record<typeof snippet, string> = {
    widget: `<b:widget id="HTML1" type="HTML" title="ويدجت جديد">\n  <b:includable id="main">\n    <div class="widget-content">محتوى جديد</div>\n  </b:includable>\n</b:widget>`,
    "post-if": `<b:if cond='data:blog.pageType == "item"'>\n  <!-- محتوى صفحة المقال -->\n</b:if>`,
    "home-if": `<b:if cond='data:blog.url == data:blog.homepageUrl'>\n  <!-- محتوى الصفحة الرئيسية -->\n</b:if>`,
  };

  const insertion = snippets[snippet];
  const closingSection = source.lastIndexOf("</b:section>");
  return closingSection >= 0 && snippet === "widget"
    ? `${source.slice(0, closingSection)}  ${insertion}\n${source.slice(closingSection)}`
    : `${source.trimEnd()}\n${insertion}\n`;
}
