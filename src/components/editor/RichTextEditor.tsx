
import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import "./RichTextEditor.css";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({
  content,
  onChange,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "rich-text-content",
        "aria-label": "Conteúdo do documento",
        spellcheck: "true",
      },
    },
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) {
      return;
    }

    if (editor.getHTML() !== content) {
      editor.commands.setContent(content, {
        emitUpdate: false,
      });
    }
  }, [editor, content]);

  if (!editor) {
    return <div className="rich-text-loading">Preparando editor...</div>;
  }

  return (
    <div className="rich-text-editor">
      <div className="rich-text-toolbar" role="toolbar" aria-label="Formatação">
        <button
          type="button"
          className={editor.isActive("bold") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="Negrito"
          title="Negrito"
        >
          <strong>N</strong>
        </button>

        <button
          type="button"
          className={editor.isActive("italic") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Itálico"
          title="Itálico"
        >
          <em>I</em>
        </button>

        <button
          type="button"
          className={editor.isActive("strike") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          aria-label="Tachado"
          title="Tachado"
        >
          <s>T</s>
        </button>

        <span className="rich-text-toolbar-divider" />

        <button
          type="button"
          className={editor.isActive("heading", { level: 1 }) ? "active" : ""}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          aria-label="Título 1"
          title="Título 1"
        >
          H1
        </button>

        <button
          type="button"
          className={editor.isActive("heading", { level: 2 }) ? "active" : ""}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          aria-label="Título 2"
          title="Título 2"
        >
          H2
        </button>

        <span className="rich-text-toolbar-divider" />

        <button
          type="button"
          className={editor.isActive("bulletList") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Lista com marcadores"
          title="Lista com marcadores"
        >
          • Lista
        </button>

        <button
          type="button"
          className={editor.isActive("orderedList") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Lista numerada"
          title="Lista numerada"
        >
          1. Lista
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          aria-label="Desfazer"
          title="Desfazer"
        >
          ↶
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          aria-label="Refazer"
          title="Refazer"
        >
          ↷
        </button>
      </div>

      <EditorContent editor={editor} className="rich-text-canvas" />
    </div>
  );
}
