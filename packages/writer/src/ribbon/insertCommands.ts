import type { Editor } from "@tiptap/react";

export const MAX_TABLE_ROWS = 50;
export const MAX_TABLE_COLUMNS = 12;

const ALLOWED_PROTOCOLS = ["http:", "https:", "mailto:", "tel:"];

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, Math.round(value)));
}

// Aceita "exemplo.com", e-mails e endereços completos; rejeita esquemas
// perigosos (javascript:, data: etc.).
export function normalizeUrl(input: string): string | null {
  const value = input.trim();

  if (!value) {
    return null;
  }

  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(value);
  const candidate = hasScheme
    ? value
    : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ? `mailto:${value}`
      : `https://${value}`;

  try {
    const url = new URL(candidate);

    return ALLOWED_PROTOCOLS.includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export function normalizeHttpsUrl(input: string): string | null {
  try {
    const url = new URL(input.trim());

    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

export function insertTable(
  editor: Editor,
  rows: number,
  cols: number,
  header: boolean,
) {
  editor
    .chain()
    .focus()
    .insertTable({
      rows: clamp(rows, 1, MAX_TABLE_ROWS),
      cols: clamp(cols, 1, MAX_TABLE_COLUMNS),
      withHeaderRow: header,
    })
    .run();
}

export function applyLink(editor: Editor, href: string, text: string) {
  if (editor.isActive("link")) {
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    return;
  }

  if (!editor.state.selection.empty) {
    editor.chain().focus().setLink({ href }).run();
    return;
  }

  editor
    .chain()
    .focus()
    .insertContent({
      type: "text",
      text: text || href,
      marks: [{ type: "link", attrs: { href } }],
    })
    .run();
}

export function removeLink(editor: Editor) {
  editor.chain().focus().extendMarkRange("link").unsetLink().run();
}

export function insertPageBreak(editor: Editor) {
  editor.chain().focus().insertPageBreak().run();
}

export function insertPlainText(editor: Editor, text: string) {
  editor.chain().focus().insertContent({ type: "text", text }).run();
}

export function dateTimeOptions(now: Date): string[] {
  const date = now.toLocaleDateString("pt-BR");
  const long = now.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const weekday = now.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const time = now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return [date, long, weekday, time, `${date} ${time}`];
}

export const SYMBOLS = [
  "©",
  "®",
  "™",
  "§",
  "¶",
  "†",
  "‡",
  "•",
  "…",
  "–",
  "—",
  "«",
  "»",
  "“",
  "”",
  "‘",
  "’",
  "°",
  "±",
  "×",
  "÷",
  "≠",
  "≤",
  "≥",
  "≈",
  "∞",
  "√",
  "∑",
  "∏",
  "∫",
  "∂",
  "µ",
  "π",
  "Ω",
  "α",
  "β",
  "γ",
  "δ",
  "λ",
  "σ",
  "Δ",
  "Σ",
  "Φ",
  "Ψ",
  "←",
  "→",
  "↑",
  "↓",
  "↔",
  "⇒",
  "⇔",
  "€",
  "£",
  "¥",
  "¢",
  "¤",
  "½",
  "¼",
  "¾",
  "²",
  "³",
  "¹",
  "‰",
  "№",
];

export function setImageWidth(editor: Editor, width: string | null) {
  editor.chain().focus().updateAttributes("image", { width }).run();
}

export function setImageAlt(editor: Editor, alt: string) {
  editor.chain().focus().updateAttributes("image", { alt }).run();
}

export function deleteImage(editor: Editor) {
  editor.chain().focus().deleteSelection().run();
}
