import { Extension } from "@tiptap/core";

export type ParagraphFormatAttrs = {
  lineHeight: string | null;
  spaceBefore: string | null;
  spaceAfter: string | null;
  indentLeft: string | null;
  indentRight: string | null;
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    paragraphFormat: {
      setParagraphFormat: (attrs: Partial<ParagraphFormatAttrs>) => ReturnType;
    };
  }
}

const TYPES = ["paragraph", "heading"];

function styleAttribute(name: keyof ParagraphFormatAttrs, cssProperty: string) {
  return {
    default: null,
    parseHTML: (element: HTMLElement) =>
      element.style.getPropertyValue(cssProperty) || null,
    renderHTML: (attributes: Record<string, unknown>) => {
      const value = attributes[name];

      return value ? { style: `${cssProperty}: ${String(value)}` } : {};
    },
  };
}

// Formatação de parágrafo guardada no próprio documento (HTML com estilos).
export const ParagraphFormat = Extension.create({
  name: "paragraphFormat",

  addGlobalAttributes() {
    return [
      {
        types: TYPES,
        attributes: {
          lineHeight: styleAttribute("lineHeight", "line-height"),
          spaceBefore: styleAttribute("spaceBefore", "margin-top"),
          spaceAfter: styleAttribute("spaceAfter", "margin-bottom"),
          indentLeft: styleAttribute("indentLeft", "margin-left"),
          indentRight: styleAttribute("indentRight", "margin-right"),
        },
      },
    ];
  },

  addCommands() {
    return {
      setParagraphFormat:
        (attrs) =>
        ({ state, tr, dispatch }) => {
          const targets: number[] = [];

          state.doc.nodesBetween(
            state.selection.from,
            state.selection.to,
            (node, pos) => {
              if (TYPES.includes(node.type.name)) {
                targets.push(pos);
              }
            },
          );

          if (targets.length === 0) {
            return false;
          }

          if (dispatch) {
            for (const pos of targets) {
              const node = tr.doc.nodeAt(pos);

              if (node) {
                tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...attrs });
              }
            }
          }

          return true;
        },
    };
  },
});
