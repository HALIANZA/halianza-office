import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";
import type { Tip } from "./catalog";
import { CheckIcon, ChevronDownIcon } from "./icons";

export type IconComponent = ComponentType<{ className?: string }>;

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

// Evita que o clique em um botão tire o foco (e a seleção) do editor.
const keepFocus = (event: MouseEvent) => event.preventDefault();

/* Dica com nome, descrição e atalho */

export function Tooltip({ tip, children }: { tip: Tip; children: ReactNode }) {
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const wrapper = useRef<HTMLSpanElement>(null);

  function show() {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const rect = wrapper.current?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      const x = Math.min(
        Math.max(rect.left + rect.width / 2, 140),
        window.innerWidth - 140,
      );

      setAnchor({ x, y: rect.bottom + 6 });
    }, 450);
  }

  function hide() {
    window.clearTimeout(timer.current);
    setAnchor(null);
  }

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <span
      ref={wrapper}
      className="hw-rb-tipwrap"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onMouseDown={hide}
    >
      {children}
      {anchor && (
        <span
          role="tooltip"
          className="hw-rb-tip"
          style={{ left: anchor.x, top: anchor.y }}
        >
          <span className="hw-rb-tip-title">
            {tip.label}
            {tip.shortcut ? ` (${tip.shortcut})` : ""}
          </span>
          {tip.description && (
            <span className="hw-rb-tip-text">{tip.description}</span>
          )}
        </span>
      )}
    </span>
  );
}

/* Botão da faixa: grande ou compacto; "planned" = ainda não implementado */

type RibbonButtonProps = {
  icon: IconComponent;
  tip: Tip;
  label?: string;
  size?: "large" | "small";
  active?: boolean;
  disabled?: boolean;
  planned?: string;
  hasMenu?: boolean;
  expanded?: boolean;
  onClick?: () => void;
  buttonRef?: Ref<HTMLButtonElement>;
};

export function RibbonButton({
  icon: Icon,
  tip,
  label,
  size = "small",
  active,
  disabled,
  planned,
  hasMenu,
  expanded,
  onClick,
  buttonRef,
}: RibbonButtonProps) {
  const unavailable = Boolean(disabled || planned);
  const shownTip: Tip = planned
    ? {
        ...tip,
        description:
          `${tip.description ?? ""} Ainda não implementado: ${planned}.`.trim(),
      }
    : tip;

  return (
    <Tooltip tip={shownTip}>
      <button
        ref={buttonRef}
        type="button"
        className={cx(
          "hw-rb-btn",
          `hw-rb-btn-${size}`,
          active && "hw-rb-active",
          planned && "hw-rb-planned",
        )}
        aria-label={tip.label}
        aria-pressed={hasMenu || active === undefined ? undefined : active}
        aria-disabled={unavailable || undefined}
        aria-haspopup={hasMenu ? "menu" : undefined}
        aria-expanded={hasMenu ? Boolean(expanded) : undefined}
        onMouseDown={keepFocus}
        onClick={unavailable ? undefined : onClick}
      >
        <Icon className="hw-rb-icon" />
        {label && <span className="hw-rb-label">{label}</span>}
        {hasMenu && <ChevronDownIcon className="hw-rb-chevron" />}
      </button>
    </Tooltip>
  );
}

/* Menu suspenso: fecha com Esc, clique fora ou rolagem; setas navegam */

type MenuTriggerApi = {
  open: boolean;
  toggle: () => void;
  ref: RefObject<HTMLButtonElement | null>;
};

export function RibbonMenu({
  label,
  renderTrigger,
  children,
}: {
  label: string;
  renderTrigger: (api: MenuTriggerApi) => ReactNode;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  function toggle() {
    if (!open) {
      const rect = triggerRef.current?.getBoundingClientRect();

      if (rect) {
        setPosition({
          x: Math.max(8, Math.min(rect.left, window.innerWidth - 290)),
          y: rect.bottom + 4,
        });
      }
    }

    setOpen(!open);
  }

  function close() {
    setOpen(false);
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (
        !menuRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }

    function handleClose() {
      setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("resize", handleClose);
    window.addEventListener("scroll", handleClose, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("resize", handleClose);
      window.removeEventListener("scroll", handleClose, true);
    };
  }, [open]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }

    const items = [
      ...event.currentTarget.querySelectorAll<HTMLElement>(
        '[role^="menuitem"]:not([aria-disabled="true"])',
      ),
    ];
    const index = items.indexOf(document.activeElement as HTMLElement);
    let next: number | null = null;

    if (event.key === "ArrowDown") next = index + 1;
    else if (event.key === "ArrowUp") next = index - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = items.length - 1;

    if (next !== null && items.length > 0) {
      event.preventDefault();
      items[(next + items.length) % items.length].focus();
    }
  }

  return (
    <>
      {renderTrigger({ open, toggle, ref: triggerRef })}

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={label}
          className="hw-rb-menu"
          style={{ left: position.x, top: position.y }}
          onKeyDown={handleKeyDown}
          onMouseDown={(event) => {
            if ((event.target as HTMLElement).closest("button")) {
              event.preventDefault();
            }
          }}
        >
          {children(close)}
        </div>
      )}
    </>
  );
}

export function MenuItem({
  icon: Icon,
  label,
  checked,
  disabled,
  note,
  onSelect,
}: {
  icon?: IconComponent;
  label: string;
  checked?: boolean;
  disabled?: boolean;
  note?: string;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      role={checked === undefined ? "menuitem" : "menuitemradio"}
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      title={note}
      className={cx("hw-rb-menuitem", disabled && "hw-rb-planned")}
      onClick={disabled ? undefined : onSelect}
    >
      {Icon ? <Icon className="hw-rb-icon" /> : <span className="hw-rb-icon" />}
      <span>{label}</span>
      {checked && <CheckIcon className="hw-rb-check" />}
    </button>
  );
}

export function MenuSeparator() {
  return <div role="separator" className="hw-rb-separator" />;
}

/* Seleção (fonte e tamanho) refletindo o estado atual do editor */

type SelectOption = { label: string; value: string };

export function RibbonSelect({
  tip,
  value,
  options,
  placeholder,
  width,
  disabled,
  onChange,
}: {
  tip: Tip;
  value: string;
  options: SelectOption[];
  placeholder: string;
  width: "wide" | "narrow";
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const known = options.some((option) => option.value === value);

  return (
    <Tooltip tip={tip}>
      <select
        className={cx("hw-rb-select", `hw-rb-select-${width}`)}
        aria-label={tip.label}
        value={known ? value : ""}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Tooltip>
  );
}

/* Botão dividido: aplica a última cor ou abre a paleta */

export type ColorOption = { name: string; value: string };

export function ColorSplit({
  icon: Icon,
  tip,
  current,
  palette,
  initial,
  clearLabel,
  disabled,
  onPick,
  onClear,
}: {
  icon: IconComponent;
  tip: Tip;
  current: string;
  palette: ColorOption[];
  initial: string;
  clearLabel: string;
  disabled?: boolean;
  onPick: (value: string) => void;
  onClear: () => void;
}) {
  const [last, setLast] = useState(initial);

  function pick(value: string) {
    setLast(value);
    onPick(value);
  }

  return (
    <span className="hw-rb-split">
      <Tooltip tip={tip}>
        <button
          type="button"
          className="hw-rb-btn hw-rb-btn-small hw-rb-split-main"
          aria-label={tip.label}
          aria-disabled={disabled || undefined}
          onMouseDown={keepFocus}
          onClick={disabled ? undefined : () => pick(last)}
        >
          <Icon className="hw-rb-icon" />
          <span
            className="hw-rb-swatch-bar"
            style={{ background: current || last }}
          />
        </button>
      </Tooltip>

      <RibbonMenu
        label={tip.label}
        renderTrigger={({ open, toggle, ref }) => (
          <button
            ref={ref}
            type="button"
            className="hw-rb-btn hw-rb-btn-small hw-rb-split-arrow"
            aria-label={`${tip.label}: mais cores`}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-disabled={disabled || undefined}
            onMouseDown={keepFocus}
            onClick={disabled ? undefined : toggle}
          >
            <ChevronDownIcon className="hw-rb-chevron" />
          </button>
        )}
      >
        {(close) => (
          <>
            <div className="hw-rb-swatches">
              {palette.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  role="menuitem"
                  className="hw-rb-swatch"
                  aria-label={color.name}
                  title={color.name}
                  style={{ background: color.value }}
                  onClick={() => {
                    pick(color.value);
                    close();
                  }}
                />
              ))}
            </div>

            <MenuItem
              label={clearLabel}
              onSelect={() => {
                onClear();
                close();
              }}
            />

            <label className="hw-rb-menuitem">
              <span className="hw-rb-icon" />
              <span>Mais cores…</span>
              <input
                className="hw-rb-colorinput"
                type="color"
                value={last}
                onChange={(event) => pick(event.target.value)}
              />
            </label>
          </>
        )}
      </RibbonMenu>
    </span>
  );
}

/* Estrutura: grupos com título, colunas e linhas de botões */

export function RibbonGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="hw-rb-group" role="group" aria-label={title}>
      <div className="hw-rb-group-body">{children}</div>
      <div className="hw-rb-group-title">{title}</div>
    </div>
  );
}

export function Stack({ children }: { children: ReactNode }) {
  return <div className="hw-rb-stack">{children}</div>;
}

export function Row({ children }: { children: ReactNode }) {
  return <div className="hw-rb-row">{children}</div>;
}
