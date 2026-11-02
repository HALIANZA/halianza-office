import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useEditorState, type Editor } from "@tiptap/react";
import { DismissIcon } from "@halianza/shared/icons";
import { ChevronDownIcon, ChevronUpIcon } from "./icons";
import { RibbonButton } from "./ui";

type FindPanelProps = {
  editor: Editor;
  mode: "find" | "replace";
  focusKey: number;
  onModeChange: (mode: "find" | "replace") => void;
  onClose: () => void;
};

type Options = {
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
};

// Parte do estado que a extensão de busca expõe em editor.storage.findAndReplace.
type FindStorage = { results?: unknown[]; currentIndex?: number | null };

export default function FindPanel({
  editor,
  mode,
  focusKey,
  onModeChange,
  onClose,
}: FindPanelProps) {
  const [term, setTerm] = useState("");
  const [replacement, setReplacement] = useState("");
  const [options, setOptions] = useState<Options>({
    caseSensitive: false,
    wholeWord: false,
    useRegex: false,
  });
  const findRef = useRef<HTMLInputElement>(null);

  const result = useEditorState({
    editor,
    selector: ({ editor: current }) => {
      const storage = (
        current.storage as unknown as { findAndReplace?: FindStorage }
      ).findAndReplace;

      return {
        count: Array.isArray(storage?.results) ? storage.results.length : 0,
        index:
          typeof storage?.currentIndex === "number"
            ? storage.currentIndex
            : null,
      };
    },
  });

  // Ao abrir (ou reabrir com Ctrl+F), usa a seleção como termo e foca o campo.
  useEffect(() => {
    const { from, to, empty } = editor.state.selection;
    const selected = empty ? "" : editor.state.doc.textBetween(from, to, " ");

    if (selected && selected.length <= 100) {
      setTerm(selected);
      editor.commands.setSearchTerm(selected);
    }

    findRef.current?.focus();
    findRef.current?.select();
  }, [editor, focusKey]);

  function updateTerm(value: string) {
    setTerm(value);
    editor.commands.setSearchTerm(value);
  }

  function updateReplacement(value: string) {
    setReplacement(value);
    editor.commands.setReplaceTerm(value);
  }

  function toggleOption(name: keyof Options, value: boolean) {
    setOptions((current) => ({ ...current, [name]: value }));

    if (name === "caseSensitive") {
      editor.commands.setCaseSensitive(value);
    } else if (name === "wholeWord") {
      editor.commands.setWholeWord(value);
    } else {
      editor.commands.setUseRegex(value);
    }
  }

  function close() {
    editor.commands.clearSearch();
    onClose();
    editor.commands.focus();
  }

  function handleFindKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();

      if (event.shiftKey) {
        editor.commands.goToPreviousResult();
      } else {
        editor.commands.goToNextResult();
      }
    } else if (event.key === "Escape") {
      close();
    }
  }

  function handleReplaceKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      editor.commands.replace();
    } else if (event.key === "Escape") {
      close();
    }
  }

  const hasResults = result.count > 0;
  const counter = !term
    ? ""
    : hasResults
      ? `${(result.index ?? 0) + 1} de ${result.count}`
      : "Nenhum resultado";

  return (
    <div className="hw-find" role="search" aria-label="Localizar e substituir">
      <div className="hw-find-row">
        <input
          ref={findRef}
          className="hw-find-input"
          type="search"
          aria-label="Localizar"
          placeholder="Localizar no documento"
          value={term}
          onChange={(event) => updateTerm(event.target.value)}
          onKeyDown={handleFindKeyDown}
        />
        <span className="hw-find-count" role="status">
          {counter}
        </span>

        <RibbonButton
          icon={ChevronUpIcon}
          tip={{ label: "Resultado anterior", shortcut: "Shift+Enter" }}
          disabled={!hasResults}
          onClick={() => editor.commands.goToPreviousResult()}
        />
        <RibbonButton
          icon={ChevronDownIcon}
          tip={{ label: "Próximo resultado", shortcut: "Enter" }}
          disabled={!hasResults}
          onClick={() => editor.commands.goToNextResult()}
        />

        <label className="hw-find-option">
          <input
            type="checkbox"
            checked={options.caseSensitive}
            onChange={(event) =>
              toggleOption("caseSensitive", event.target.checked)
            }
          />
          Maiúsculas/minúsculas
        </label>
        <label className="hw-find-option">
          <input
            type="checkbox"
            checked={options.wholeWord}
            onChange={(event) =>
              toggleOption("wholeWord", event.target.checked)
            }
          />
          Palavra inteira
        </label>
        <label className="hw-find-option">
          <input
            type="checkbox"
            checked={options.useRegex}
            onChange={(event) => toggleOption("useRegex", event.target.checked)}
          />
          Expressão regular
        </label>

        <button
          type="button"
          className="hw-find-toggle"
          aria-expanded={mode === "replace"}
          onClick={() => onModeChange(mode === "replace" ? "find" : "replace")}
        >
          Substituir
        </button>

        <RibbonButton
          icon={DismissIcon}
          tip={{ label: "Fechar", shortcut: "Esc" }}
          onClick={close}
        />
      </div>

      {mode === "replace" && (
        <div className="hw-find-row">
          <input
            className="hw-find-input"
            type="text"
            aria-label="Substituir por"
            placeholder="Substituir por"
            value={replacement}
            onChange={(event) => updateReplacement(event.target.value)}
            onKeyDown={handleReplaceKeyDown}
          />
          <button
            type="button"
            className="hw-find-button"
            disabled={!hasResults}
            onClick={() => editor.commands.replace()}
          >
            Substituir
          </button>
          <button
            type="button"
            className="hw-find-button"
            disabled={!hasResults}
            onClick={() => editor.commands.replaceAll()}
          >
            Substituir tudo
          </button>
        </div>
      )}
    </div>
  );
}
