import Image from "@tiptap/extension-image";

// Imagem com largura configurável (guardada no estilo do próprio elemento).
export const WriterImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.width || null,
        renderHTML: (attributes: Record<string, unknown>) =>
          attributes.width
            ? { style: `width: ${String(attributes.width)}; height: auto` }
            : {},
      },
    };
  },
}).configure({ allowBase64: true });
