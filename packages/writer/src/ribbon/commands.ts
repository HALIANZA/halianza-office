import type { JSONContent } from "@tiptap/core";
import type { Mark } from "@tiptap/pm/model";
import type { Editor } from "@tiptap/react";

export const FONT_FAMILIES = [
  "Arial",
  "Calibri",
  "DM Sans",
  "Georgia",
  "Times New Roman",
  "Verdana",
  "Courier New",
].map((name) => ({ label: name, value: name }));

export const FONT_SIZES = [
  8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72,
];

// Tamanho efetivo do texto do documento quando nenhum tamanho foi definido.
export const DEFAULT_FONT_SIZE = 14;

export const FONT_SIZE_OPTIONS = FONT_SIZES.map((size) => ({
  label: String(size),
  value: `${size}px`,
}));

export const LINE_SPACINGS = [
  { label: "Padrão", value: "" },
  { label: "1,0", value: "1" },
  { label: "1,15", value: "1.15" },
  { label: "1,5", value: "1.5" },
  { label: "2,0", value: "2" },
  { label: "2,5", value: "2.5" },
  { label: "3,0", value: "3" },
];

const INDENT_STEP = 24;
const MAX_INDENT = 240;

export function stepFontSize(editor: Editor, direction: 1 | -1) {
  const current =
    parseFloat(String(editor.getAttributes("textStyle").fontSize ?? "")) ||
    DEFAULT_FONT_SIZE;

  const next =
    direction > 0
      ? FONT_SIZES.find((size) => size > current)
      : [...FONT_SIZES].reverse().find((size) => size < current);

  if (next !== undefined) {
    editor.chain().focus().setFontSize(`${next}px`).run();
  }
}

export type CaseMode = "upper" | "lower" | "title" | "toggle";

function transformCase(
  text: string,
  mode: CaseMode,
  previous: { char: string },
): string {
  let result = "";

  for (const char of text) {
    if (mode === "upper") {
      result += char.toUpperCase();
    } else if (mode === "lower") {
      result += char.toLowerCase();
    } else if (mode === "toggle") {
      result +=
        char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase();
    } else {
      result += /[\p{L}\p{N}'’]/u.test(previous.char)
        ? char
        : char.toUpperCase();
    }

    previous.char = char;
  }

  return result;
}

// Troca a capitalização preservando as marcas (negrito, cor etc.).
export function changeCase(editor: Editor, mode: CaseMode): boolean {
  const { state, view } = editor;
  const { from, to } = state.selection;

  if (from === to) {
    return false;
  }

  const previous = { char: " " };
  const edits: {
    from: number;
    to: number;
    text: string;
    marks: readonly Mark[];
  }[] = [];

  state.doc.nodesBetween(from, to, (node, pos) => {
    if (node.isTextblock) {
      previous.char = " ";
    }

    if (!node.isText || !node.text) {
      return;
    }

    const start = Math.max(from, pos);
    const end = Math.min(to, pos + node.nodeSize);
    const slice = node.text.slice(start - pos, end - pos);

    edits.push({
      from: start,
      to: end,
      text: transformCase(slice, mode, previous),
      marks: node.marks,
    });
  });

  if (edits.length === 0) {
    return false;
  }

  const tr = state.tr;

  for (const edit of [...edits].reverse()) {
    tr.replaceWith(
      edit.from,
      edit.to,
      state.schema.text(edit.text, edit.marks),
    );
  }

  view.dispatch(tr);
  editor.commands.focus();

  return true;
}

export function clearFormatting(editor: Editor) {
  editor
    .chain()
    .focus()
    .unsetAllMarks()
    .unsetTextAlign()
    .setParagraph()
    .setParagraphFormat({
      lineHeight: null,
      spaceBefore: null,
      spaceAfter: null,
      indentLeft: null,
      indentRight: null,
    })
    .run();
}

export function changeIndent(editor: Editor, direction: 1 | -1) {
  const listType = editor.isActive("taskItem")
    ? "taskItem"
    : editor.isActive("listItem")
      ? "listItem"
      : null;

  if (listType) {
    const chain = editor.chain().focus();

    if (direction > 0) {
      chain.sinkListItem(listType).run();
    } else {
      chain.liftListItem(listType).run();
    }

    return;
  }

  const block = {
    ...editor.getAttributes("heading"),
    ...editor.getAttributes("paragraph"),
  };
  const current = parseInt(String(block.indentLeft ?? "0"), 10) || 0;
  const next = Math.min(
    MAX_INDENT,
    Math.max(0, current + direction * INDENT_STEP),
  );

  editor
    .chain()
    .focus()
    .setParagraphFormat({ indentLeft: next > 0 ? `${next}px` : null })
    .run();
}

export function setLineSpacing(editor: Editor, value: string) {
  editor
    .chain()
    .focus()
    .setParagraphFormat({ lineHeight: value || null })
    .run();
}

// Equivalentes a "Adicionar/Remover espaço antes/depois do parágrafo" do Word.
export function setParagraphSpace(
  editor: Editor,
  side: "before" | "after",
  amount: string | null,
) {
  editor
    .chain()
    .focus()
    .setParagraphFormat(
      side === "before" ? { spaceBefore: amount } : { spaceAfter: amount },
    )
    .run();
}

export type StyleId =
  "normal" | "title1" | "title2" | "title3" | "title4" | "quote";

export function applyStyle(editor: Editor, style: StyleId) {
  const chain = editor.chain().focus();

  if (style === "quote") {
    if (!editor.isActive("blockquote")) {
      chain.setBlockquote().run();
    }

    return;
  }

  if (editor.isActive("blockquote")) {
    chain.lift("blockquote");
  }

  if (style === "normal") {
    chain.setParagraph().run();
    return;
  }

  const level = Number(style.replace("title", "")) as 1 | 2 | 3 | 4;

  chain.setHeading({ level }).run();
}

export function clipboardCommand(
  editor: Editor,
  kind: "cut" | "copy",
): boolean {
  editor.commands.focus();

  return document.execCommand(kind);
}

// Devolve uma mensagem de erro, ou null se colou.
export async function pasteFromClipboard(
  editor: Editor,
  plainOnly: boolean,
): Promise<string | null> {
  const failure =
    "Não foi possível acessar a área de transferência. Use Ctrl+V para colar.";

  try {
    if (!plainOnly && typeof navigator.clipboard?.read === "function") {
      for (const item of await navigator.clipboard.read()) {
        if (item.types.includes("text/html")) {
          const html = await (await item.getType("text/html")).text();

          editor.chain().focus().insertContent(html).run();

          return null;
        }
      }
    }

    const text = await navigator.clipboard.readText();

    if (!text) {
      return null;
    }

    const lines = text.split(/\r?\n/);
    const content: JSONContent[] =
      lines.length === 1
        ? [{ type: "text", text }]
        : lines.map((line) =>
            line
              ? { type: "paragraph", content: [{ type: "text", text: line }] }
              : { type: "paragraph" },
          );

    editor.chain().focus().insertContent(content).run();

    return null;
  } catch {
    return failure;
  }
}
