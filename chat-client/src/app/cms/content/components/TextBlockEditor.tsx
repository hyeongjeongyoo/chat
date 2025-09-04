"use client";

import { LexicalEditor } from "@/components/common/LexicalEditor";

interface TextBlockEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function TextBlockEditor({ value, onChange }: TextBlockEditorProps) {
  return (
    <LexicalEditor
      initialContent={value}
      onChange={onChange}
      contextMenu="CONTENT"
      placeholder="내용을 입력하세요..."
    />
  );
}
