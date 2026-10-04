"use client";

import { useEffect, useRef } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";

interface CodeEditorProps {
  value: string;
  language?: "xml" | "html" | "css" | "javascript";
  theme?: "vs-dark" | "vs-light" | "dashpro-dark";
  onChange: (value: string) => void;
  onSave?: (value: string) => void;
  onCursorChange?: (line: number, column: number) => void;
  readOnly?: boolean;
  height?: string;
}

export function CodeEditor({ value, language = "xml", theme = "dashpro-dark", onChange, onSave, onCursorChange, readOnly = false, height = "calc(100vh - 280px)" }: CodeEditorProps) {
  const saveRef = useRef(onSave);
  saveRef.current = onSave;
  useEffect(() => () => { saveRef.current = undefined; }, []);

  const handleMount: OnMount = (editor, monaco) => {
    monaco.editor.defineTheme("dashpro-dark", {
      base: "vs-dark", inherit: true,
      rules: [
        { token: "tag", foreground: "60A5FA" },
        { token: "attribute.name", foreground: "C4B5FD" },
        { token: "attribute.value", foreground: "86EFAC" },
        { token: "string", foreground: "86EFAC" },
        { token: "comment", foreground: "64748B" }
      ],
      colors: {
        "editor.background": "#0B1120", "editor.foreground": "#E2E8F0",
        "editorLineNumber.foreground": "#475569", "editorLineNumber.activeForeground": "#CBD5E1",
        "editorCursor.foreground": "#A78BFA", "editor.selectionBackground": "#312E81"
      }
    });
    editor.addAction({
      id: "dashpro.save", label: "حفظ القالب",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: () => saveRef.current?.(editor.getValue())
    });
    editor.onDidChangeCursorPosition(e => onCursorChange?.(e.position.lineNumber, e.position.column));
  };

  return <Editor height={height} language={language} theme={theme} value={value} onChange={v => onChange(v || "")} onMount={handleMount}
    options={{
      automaticLayout: true, minimap: { enabled: true }, lineNumbers: "on", folding: true,
      tabSize: 2, insertSpaces: true, formatOnPaste: true, formatOnType: true,
      quickSuggestions: true, suggest: { showKeywords: true, showSnippets: true },
      bracketPairColorization: { enabled: true }, smoothScrolling: true, scrollBeyondLastLine: false,
      renderWhitespace: "selection", padding: { top: 12, bottom: 12 }, readOnly
    }}
    loading={<div className="flex h-full items-center justify-center bg-slate-950 text-sm text-slate-400">جارٍ تحميل محرر الأكواد...</div>}
  />;
}
