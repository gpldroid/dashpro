"use client";

import { useCallback, useEffect, useRef } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";

export type EditorLanguage =
  | "xml"
  | "html"
  | "css"
  | "javascript"
  | "typescript"
  | "json"
  | "markdown"
  | "sql"
  | "plaintext";

interface CodeEditorProps {
  value: string;
  language?: EditorLanguage;
  onChange: (value: string) => void;
  onSave?: (value?: string) => void;
  onFormat?: () => void;
  onCursorChange?: (line: number, column: number) => void;
  onEditorReady?: (insertAtCursor: (text: string) => void) => void;
  readOnly?: boolean;
  height?: string;
}

const bloggerCompletionTags = [
  "b:section",
  "b:widget",
  "b:includable",
  "b:if",
  "b:loop",
  "b:skin",
  "data:blog",
  "data:post",
  "data:label",
];

export function CodeEditor({
  value,
  language = "xml",
  onChange,
  onSave,
  onFormat,
  onCursorChange,
  onEditorReady,
  readOnly = false,
  height = "calc(100vh - 280px)",
}: CodeEditorProps) {
  const saveRef = useRef(onSave);
  const formatRef = useRef(onFormat);

  useEffect(() => {
    saveRef.current = onSave;
    formatRef.current = onFormat;
  }, [onSave, onFormat]);

  const handleMount: OnMount = useCallback((editor, monaco) => {
    monaco.editor.defineTheme("dashpro-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "tag", foreground: "7dd3fc" },
        { token: "attribute.name", foreground: "c4b5fd" },
        { token: "attribute.value", foreground: "86efac" },
        { token: "string", foreground: "86efac" },
        { token: "comment", foreground: "64748b" },
      ],
      colors: {
        "editor.background": "#0b1020",
        "editor.foreground": "#e2e8f0",
        "editorLineNumber.foreground": "#475569",
        "editorLineNumber.activeForeground": "#a5b4fc",
        "editorCursor.foreground": "#a5b4fc",
        "editor.selectionBackground": "#3730a366",
      },
    });

    monaco.languages.registerCompletionItemProvider("xml", {
      triggerCharacters: ["<", ":", " "],
      provideCompletionItems(
        model: { getWordUntilPosition: (position: { lineNumber: number; column: number }) => { startColumn: number } },
        position: { lineNumber: number; column: number },
      ) {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: position.column,
        };

        return {
          suggestions: bloggerCompletionTags.map((tag) => ({
            label: tag,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: tag,
            detail: "Blogger",
            range,
          })),
        };
      },
    });

    editor.addAction({
      id: "dashpro-save",
      label: "حفظ التغييرات في GitHub",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: async () => {
        if (readOnly) return;
        try {
          await editor.getAction("editor.action.formatDocument")?.run();
        } catch {
          // Formatting is optional; saving must still work.
        }
        saveRef.current?.(editor.getValue());
      },
    });

    editor.addAction({
      id: "dashpro-format",
      label: "تنسيق الملف",
      keybindings: [monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.KeyF],
      run: () => formatRef.current?.(),
    });

    onEditorReady?.((text) => {
      const selection = editor.getSelection();
      const model = editor.getModel();
      if (!model) return;
      editor.executeEdits("dashpro-snippet", [{
        range: selection ?? model.getFullModelRange(),
        text,
        forceMoveMarkers: true,
      }]);
      editor.focus();
    });

    editor.onDidChangeCursorPosition((event) => {
      onCursorChange?.(event.position.lineNumber, event.position.column);
    });
  }, [onCursorChange, onEditorReady, readOnly]);

  return (
    <div className="overflow-hidden bg-[#0b1020]">
      <Editor
        height={height}
        language={language}
        value={value}
        theme="dashpro-dark"
        onMount={handleMount}
        onChange={(next) => onChange(next ?? "")}
        options={{
          automaticLayout: true,
          minimap: { enabled: true },
          lineNumbers: "on",
          folding: true,
          tabSize: 2,
          insertSpaces: true,
          formatOnPaste: true,
          formatOnType: true,
          quickSuggestions: true,
          suggestOnTriggerCharacters: true,
          bracketPairColorization: { enabled: true },
          smoothScrolling: true,
          scrollBeyondLastLine: false,
          renderWhitespace: "selection",
          stickyScroll: { enabled: true },
          padding: { top: 12, bottom: 12 },
          readOnly,
        }}
        loading={
          <div className="flex h-96 items-center justify-center bg-slate-950 text-sm text-slate-400">
            جارٍ تحميل محرر الأكواد…
          </div>
        }
      />
    </div>
  );
}