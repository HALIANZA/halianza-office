import { useCallback, useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";

export type PainterMode = "off" | "once" | "sticky";

type CapturedMark = { name: string; attrs: Record<string, unknown> };

// Pincel de formatação: copia as marcas de caractere do início da seleção
// (fonte, tamanho, cor, realce, negrito etc.) e as aplica à próxima seleção.
export function useFormatPainter(editor: Editor | null) {
  const [mode, setMode] = useState<PainterMode>("off");
  const captured = useRef<CapturedMark[]>([]);

  const capture = useCallback((): boolean => {
    if (!editor) {
      return false;
    }

    const { selection, storedMarks } = editor.state;
    const marks = selection.empty
      ? (storedMarks ?? selection.$from.marks())
      : (selection.$from.nodeAfter?.marks ?? selection.$from.marks());

    captured.current = marks
      .filter((mark) => mark.type.name !== "link")
      .map((mark) => ({ name: mark.type.name, attrs: { ...mark.attrs } }));

    return true;
  }, [editor]);

  // Um clique: uma aplicação. Clique de novo para cancelar.
  const toggle = useCallback(() => {
    if (mode !== "off") {
      setMode("off");
      return;
    }

    if (capture()) {
      setMode("once");
    }
  }, [mode, capture]);

  // Duplo clique: o pincel fica ativo até Esc.
  const lock = useCallback(() => {
    if (capture()) {
      setMode("sticky");
    }
  }, [capture]);

  useEffect(() => {
    if (!editor || mode === "off") {
      return;
    }

    const target = editor;
    const dom = target.view.dom;
    let pending: number | undefined;

    dom.classList.add("hw-painter-armed");

    function apply() {
      const { state, view } = target;
      const { from, to, empty } = state.selection;

      if (empty) {
        return;
      }

      const tr = state.tr;

      for (const type of Object.values(state.schema.marks)) {
        if (type.name !== "link") {
          tr.removeMark(from, to, type);
        }
      }

      for (const { name, attrs } of captured.current) {
        const type = state.schema.marks[name];

        if (type) {
          tr.addMark(from, to, type.create(attrs));
        }
      }

      view.dispatch(tr);

      if (mode === "once") {
        setMode("off");
      }
    }

    // O ProseMirror atualiza a seleção logo depois do mouseup.
    function handleMouseUp() {
      window.clearTimeout(pending);
      pending = window.setTimeout(apply, 30);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMode("off");
      }
    }

    dom.addEventListener("mouseup", handleMouseUp);
    dom.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(pending);
      dom.classList.remove("hw-painter-armed");
      dom.removeEventListener("mouseup", handleMouseUp);
      dom.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor, mode]);

  return { mode, toggle, lock };
}
