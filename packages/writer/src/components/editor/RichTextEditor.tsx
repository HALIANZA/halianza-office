import { EditorContent, type Editor } from "@tiptap/react";
import "./RichTextEditor.css";

interface RichTextEditorProps {
  editor: Editor | null;
}

// Só o conteúdo: os comandos de formatação ficam na faixa de opções.
export default function RichTextEditor({ editor }: RichTextEditorProps) {
  if (!editor) {
    return <div className="hw-rich-text-loading">Preparando editor...</div>;
  }

  return (
    <div className="hw-rich-text-editor">
      <EditorContent editor={editor} className="hw-rich-text-canvas" />
    </div>
  );
}
