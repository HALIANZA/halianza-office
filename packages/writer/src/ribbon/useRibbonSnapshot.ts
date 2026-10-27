import { useEditorState, type Editor } from "@tiptap/react";

export type RibbonSnapshot = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  subscript: boolean;
  superscript: boolean;
  bulletList: boolean;
  orderedList: boolean;
  taskList: boolean;
  blockquote: boolean;
  inList: boolean;
  heading: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  align: "left" | "center" | "right" | "justify";
  fontFamily: string;
  fontSize: string;
  color: string;
  highlight: string;
  lineHeight: string;
  hasSelection: boolean;
  canUndo: boolean;
  canRedo: boolean;
};

export const EMPTY_SNAPSHOT: RibbonSnapshot = {
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  subscript: false,
  superscript: false,
  bulletList: false,
  orderedList: false,
  taskList: false,
  blockquote: false,
  inList: false,
  heading: 0,
  align: "left",
  fontFamily: "",
  fontSize: "",
  color: "",
  highlight: "",
  lineHeight: "",
  hasSelection: false,
  canUndo: false,
  canRedo: false,
};

const HEADING_LEVELS = [1, 2, 3, 4, 5, 6] as const;
const ALIGNMENTS = ["center", "right", "justify"] as const;

// Uma única assinatura do estado do editor atualiza todos os controles.
export function useRibbonSnapshot(editor: Editor | null): RibbonSnapshot {
  const snapshot = useEditorState({
    editor,
    selector: ({ editor: current }): RibbonSnapshot => {
      if (!current) {
        return EMPTY_SNAPSHOT;
      }

      const textStyle = current.getAttributes("textStyle");
      const block = {
        ...current.getAttributes("heading"),
        ...current.getAttributes("paragraph"),
      };

      return {
        bold: current.isActive("bold"),
        italic: current.isActive("italic"),
        underline: current.isActive("underline"),
        strike: current.isActive("strike"),
        subscript: current.isActive("subscript"),
        superscript: current.isActive("superscript"),
        bulletList: current.isActive("bulletList"),
        orderedList: current.isActive("orderedList"),
        taskList: current.isActive("taskList"),
        blockquote: current.isActive("blockquote"),
        inList: current.isActive("listItem") || current.isActive("taskItem"),
        heading:
          HEADING_LEVELS.find((level) =>
            current.isActive("heading", { level }),
          ) ?? 0,
        align:
          ALIGNMENTS.find((value) => current.isActive({ textAlign: value })) ??
          "left",
        fontFamily: String(textStyle.fontFamily ?? ""),
        fontSize: String(textStyle.fontSize ?? ""),
        color: String(textStyle.color ?? ""),
        highlight: String(current.getAttributes("highlight").color ?? ""),
        lineHeight: String(block.lineHeight ?? ""),
        hasSelection: !current.state.selection.empty,
        canUndo: current.can().undo(),
        canRedo: current.can().redo(),
      };
    },
  });

  return snapshot ?? EMPTY_SNAPSHOT;
}
