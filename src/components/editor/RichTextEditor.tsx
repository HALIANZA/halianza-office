import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle, FontFamily, FontSize } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import "./RichTextEditor.css";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const fontFamilies = [
  { label: "Fonte", value: "" },
  { label: "Arial", value: "Arial" },
  { label: "Calibri", value: "Calibri" },
  { label: "DM Sans", value: "DM Sans" },
  { label: "Georgia", value: "Georgia" },
  { label: "Times New Roman", value: "Times New Roman" },
  { label: "Verdana", value: "Verdana" },
  { label: "Courier New", value: "Courier New" },
];

const fontSizes = [
  { label: "Tamanho", value: "" },
  { label: "8", value: "8px" },
  { label: "9", value: "9px" },
  { label: "10", value: "10px" },
  { label: "11", value: "11px" },
  { label: "12", value: "12px" },
  { label: "14", value: "14px" },
  { label: "16", value: "16px" },
  { label: "18", value: "18px" },
  { label: "20", value: "20px" },
  { label: "24", value: "24px" },
  { label: "28", value: "28px" },
  { label: "32", value: "32px" },
  { label: "36", value: "36px" },
  { label: "48", value: "48px" },
  { label: "72", value: "72px" },
];

export default function RichTextEditor({
  content,
  onChange,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      StarterKit,
      TextStyle,
      FontFamily,
      FontSize,
      Color,
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Subscript,
      Superscript,
    ],
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
      <div
        className="rich-text-toolbar"
        role="toolbar"
        aria-label="Página Inicial — formatação do documento"
      >
        <div className="toolbar-group">
          <label className="toolbar-select-label">
            <span className="sr-only">Família da fonte</span>
            <select
              aria-label="Família da fonte"
              title="Família da fonte"
              defaultValue=""
              onChange={(event) => {
                const value = event.target.value;

                if (value) {
                  editor.chain().focus().setFontFamily(value).run();
                } else {
                  editor.chain().focus().unsetFontFamily().run();
                }
              }}
            >
              {fontFamilies.map((font) => (
                <option key={font.label} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </label>

          <label className="toolbar-select-label font-size-select">
            <span className="sr-only">Tamanho da fonte</span>
            <select
              aria-label="Tamanho da fonte"
              title="Tamanho da fonte"
              defaultValue=""
              onChange={(event) => {
                const value = event.target.value;

                if (value) {
                  editor.chain().focus().setFontSize(value).run();
                } else {
                  editor.chain().focus().unsetFontSize().run();
                }
              }}
            >
              {fontSizes.map((size) => (
                <option key={size.label} value={size.value}>
                  {size.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <span className="rich-text-toolbar-divider" />

        <div className="toolbar-group">
          <button
            type="button"
            className={editor.isActive("bold") ? "active" : ""}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().toggleBold().run()}
            aria-label="Negrito"
            title="Negrito"
          >
            <strong>N</strong>
          </button>

          <button
            type="button"
            className={editor.isActive("italic") ? "active" : ""}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            aria-label="Itálico"
            title="Itálico"
          >
            <em>I</em>
          </button>

          <button
            type="button"
            className={editor.isActive("underline") ? "active" : ""}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            aria-label="Sublinhado"
            title="Sublinhado"
          >
            <u>S</u>
          </button>

          <button
            type="button"
            className={editor.isActive("strike") ? "active" : ""}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            aria-label="Tachado"
            title="Tachado"
          >
            <s>T</s>
          </button>

          <button
            type="button"
            className={editor.isActive("subscript") ? "active" : ""}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            aria-label="Subscrito"
            title="Subscrito"
          >
            X<sub>2</sub>
          </button>

          <button
            type="button"
            className={editor.isActive("superscript") ? "active" : ""}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            aria-label="Sobrescrito"
            title="Sobrescrito"
          >
            X<sup>2</sup>
          </button>
        </div>

        <span className="rich-text-toolbar-divider" />

        <div className="toolbar-group color-controls">
          <label className="toolbar-color-control" title="Cor da fonte">
            <span className="color-control-symbol">A</span>
            <input
              type="color"
              aria-label="Cor da fonte"
              defaultValue="#26231f"
              onChange={(event) => {
                editor.chain().focus().setColor(event.target.value).run();
              }}
            />
          </label>

          <label
            className="toolbar-color-control highlight-control"
            title="Cor de realce"
          >
            <span className="color-control-symbol">▰</span>
            <input
              type="color"
              aria-label="Cor de realce do texto"
              defaultValue="#fff2a8"
              onChange={(event) => {
                editor
                  .chain()
                  .focus()
                  .toggleHighlight({ color: event.target.value })
                  .run();
              }}
            />
          </label>

          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().unsetColor().run()}
            aria-label="Remover cor da fonte"
            title="Remover cor da fonte"
          >
            A↺
          </button>

          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().unsetHighlight().run()}
            aria-label="Remover realce"
            title="Remover realce"
          >
            ▰↺
          </button>
        </div>

        <span className="rich-text-toolbar-divider" />

        <div className="toolbar-group">
          <button
            type="button"
            className={editor.isActive("heading", { level: 1 }) ? "active" : ""}
            onMouseDown={(event) => event.preventDefault()}
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
            onMouseDown={(event) => event.preventDefault()}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            aria-label="Título 2"
            title="Título 2"
          >
            H2
          </button>
        </div>

        <span className="rich-text-toolbar-divider" />

        <div className="toolbar-group alignment-controls">
          <button
            type="button"
            className={editor.isActive({ textAlign: "left" }) ? "active" : ""}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            aria-label="Alinhar à esquerda"
            title="Alinhar à esquerda"
          >
            ☰
          </button>

          <button
            type="button"
            className={editor.isActive({ textAlign: "center" }) ? "active" : ""}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            aria-label="Centralizar"
            title="Centralizar"
          >
            ≡
          </button>

          <button
            type="button"
            className={editor.isActive({ textAlign: "right" }) ? "active" : ""}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            aria-label="Alinhar à direita"
            title="Alinhar à direita"
          >
            ☷
          </button>

          <button
            type="button"
            className={
              editor.isActive({ textAlign: "justify" }) ? "active" : ""
            }
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            aria-label="Justificar"
            title="Justificar"
          >
            ☰
          </button>
        </div>

        <span className="rich-text-toolbar-divider" />

        <div className="toolbar-group">
          <button
            type="button"
            className={editor.isActive("bulletList") ? "active" : ""}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            aria-label="Lista com marcadores"
            title="Lista com marcadores"
          >
            • Lista
          </button>

          <button
            type="button"
            className={editor.isActive("taskList") ? "active" : ""}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            aria-label="Lista de tarefas"
            title="Lista de tarefas"
          >
            ☑ Tarefas
          </button>

          <button
            type="button"
            className={editor.isActive("orderedList") ? "active" : ""}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            aria-label="Lista numerada"
            title="Lista numerada"
          >
            1. Lista
          </button>
        </div>

        <span className="rich-text-toolbar-divider" />

        <div className="toolbar-group">
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            aria-label="Desfazer"
            title="Desfazer"
          >
            ↶
          </button>

          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            aria-label="Refazer"
            title="Refazer"
          >
            ↷
          </button>
        </div>
      </div>

      <EditorContent editor={editor} className="rich-text-canvas" />
    </div>
  );
}
