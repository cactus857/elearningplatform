"use client";

import React, { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Menubar } from "./Menubar";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";

interface RichTextEditorProps {
  field: any;
  minHeight?: string;
  placeholder?: string;
}

export function RichTextEditor({
  field,
  minHeight = "300px",
  placeholder = "Start typing...",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: {
        class: `p-4 focus:outline-none prose prose-sm sm:prose lg:prose-lg xl:prose-lg dark:prose-invert !w-full !max-w-none`,
        style: `min-height: ${minHeight}`,
      },
    },

    onUpdate: ({ editor }) => {
      field.onChange(editor.getHTML());
    },

    content: field.value || "",
  });

  useEffect(() => {
    if (editor && field.value !== editor.getHTML()) {
      editor.commands.setContent(field.value || "");
    }
  }, [field.value, editor]);

  return (
    <div className="w-full border border-input rounded-lg overflow-hidden dark:bg-input/30">
      <style jsx global>{`
        .is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
      <Menubar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

