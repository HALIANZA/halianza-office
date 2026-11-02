import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  MAX_TABLE_COLUMNS,
  MAX_TABLE_ROWS,
  normalizeHttpsUrl,
  normalizeUrl,
} from "./insertCommands";

// Caixa de diálogo modal nativa (<dialog>): foco, Esc e fundo já tratados.
function Dialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;

    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }, []);

  return (
    <dialog
      ref={ref}
      className="hw-dialog"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="hw-dialog-body">
        <h2 id={titleId} className="hw-dialog-title">
          {title}
        </h2>
        {children}
      </div>
    </dialog>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="hw-dialog-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Actions({
  submitLabel,
  onClose,
  extra,
}: {
  submitLabel: string;
  onClose: () => void;
  extra?: ReactNode;
}) {
  return (
    <div className="hw-dialog-actions">
      {extra}
      <button type="button" className="hw-dialog-button" onClick={onClose}>
        Cancelar
      </button>
      <button
        type="submit"
        className="hw-dialog-button hw-dialog-button-primary"
      >
        {submitLabel}
      </button>
    </div>
  );
}

export function TableDialog({
  onSubmit,
  onClose,
}: {
  onSubmit: (rows: number, cols: number, header: boolean) => void;
  onClose: () => void;
}) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [header, setHeader] = useState(true);

  function submit(event: FormEvent) {
    event.preventDefault();
    onSubmit(rows, cols, header);
  }

  return (
    <Dialog title="Inserir tabela" onClose={onClose}>
      <form className="hw-dialog-form" onSubmit={submit}>
        <Field label={`Linhas (1 a ${MAX_TABLE_ROWS})`}>
          <input
            type="number"
            min={1}
            max={MAX_TABLE_ROWS}
            value={rows}
            onChange={(event) => setRows(Number(event.target.value))}
          />
        </Field>
        <Field label={`Colunas (1 a ${MAX_TABLE_COLUMNS})`}>
          <input
            type="number"
            min={1}
            max={MAX_TABLE_COLUMNS}
            value={cols}
            onChange={(event) => setCols(Number(event.target.value))}
          />
        </Field>
        <label className="hw-dialog-check">
          <input
            type="checkbox"
            checked={header}
            onChange={(event) => setHeader(event.target.checked)}
          />
          Primeira linha como cabeçalho
        </label>
        <Actions submitLabel="Inserir" onClose={onClose} />
      </form>
    </Dialog>
  );
}

export function LinkDialog({
  initialHref,
  editing,
  selectionEmpty,
  onSubmit,
  onRemove,
  onClose,
}: {
  initialHref: string;
  editing: boolean;
  selectionEmpty: boolean;
  onSubmit: (href: string, text: string) => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  const [href, setHref] = useState(initialHref);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(event: FormEvent) {
    event.preventDefault();

    const normalized = normalizeUrl(href);

    if (!normalized) {
      setError("Endereço inválido. Use http, https, mailto ou tel.");
      return;
    }

    onSubmit(normalized, text.trim());
  }

  return (
    <Dialog title={editing ? "Editar link" : "Inserir link"} onClose={onClose}>
      <form className="hw-dialog-form" onSubmit={submit}>
        {!editing && selectionEmpty && (
          <Field label="Texto a exibir">
            <input
              type="text"
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
          </Field>
        )}
        <Field label="Endereço">
          <input
            type="text"
            autoFocus
            placeholder="https://exemplo.com"
            value={href}
            onChange={(event) => {
              setHref(event.target.value);
              setError(null);
            }}
          />
        </Field>
        {error && (
          <p className="hw-dialog-error" role="alert">
            {error}
          </p>
        )}
        <Actions
          submitLabel={editing ? "Atualizar" : "Inserir"}
          onClose={onClose}
          extra={
            editing ? (
              <button
                type="button"
                className="hw-dialog-button hw-dialog-extra"
                onClick={onRemove}
              >
                Remover link
              </button>
            ) : undefined
          }
        />
      </form>
    </Dialog>
  );
}

export function ImageUrlDialog({
  onSubmit,
  onClose,
}: {
  onSubmit: (src: string, alt: string) => void;
  onClose: () => void;
}) {
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(event: FormEvent) {
    event.preventDefault();

    const normalized = normalizeHttpsUrl(url);

    if (!normalized) {
      setError("Informe um endereço completo que comece com https://.");
      return;
    }

    onSubmit(normalized, alt.trim());
  }

  return (
    <Dialog title="Imagem de um endereço" onClose={onClose}>
      <form className="hw-dialog-form" onSubmit={submit}>
        <Field label="Endereço da imagem (https)">
          <input
            type="text"
            autoFocus
            placeholder="https://exemplo.com/imagem.png"
            value={url}
            onChange={(event) => {
              setUrl(event.target.value);
              setError(null);
            }}
          />
        </Field>
        <Field label="Texto alternativo (opcional)">
          <input
            type="text"
            value={alt}
            onChange={(event) => setAlt(event.target.value)}
          />
        </Field>
        <p className="hw-dialog-hint">
          A imagem não é incorporada: o documento guarda só o endereço e precisa
          de internet para exibi-la.
        </p>
        {error && (
          <p className="hw-dialog-error" role="alert">
            {error}
          </p>
        )}
        <Actions submitLabel="Inserir" onClose={onClose} />
      </form>
    </Dialog>
  );
}

export function AltTextDialog({
  initial,
  onSubmit,
  onClose,
}: {
  initial: string;
  onSubmit: (alt: string) => void;
  onClose: () => void;
}) {
  const [alt, setAlt] = useState(initial);

  function submit(event: FormEvent) {
    event.preventDefault();
    onSubmit(alt.trim());
  }

  return (
    <Dialog title="Texto alternativo" onClose={onClose}>
      <form className="hw-dialog-form" onSubmit={submit}>
        <Field label="Descrição da imagem">
          <input
            type="text"
            autoFocus
            value={alt}
            onChange={(event) => setAlt(event.target.value)}
          />
        </Field>
        <p className="hw-dialog-hint">
          Descreva o conteúdo da imagem para quem usa leitores de tela.
        </p>
        <Actions submitLabel="Salvar" onClose={onClose} />
      </form>
    </Dialog>
  );
}
