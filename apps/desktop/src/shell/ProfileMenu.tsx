import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  getThemePreference,
  setThemePreference,
  subscribeTheme,
  type ThemePreference,
} from "@halianza/shared/theme";

const options: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "Seguir o sistema" },
  { value: "light", label: "Claro" },
  { value: "dark", label: "Escuro" },
];

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const preference = useSyncExternalStore(subscribeTheme, getThemePreference);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="hs-profile" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="hs-avatar"
        title="Perfil local"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        V
      </button>

      {open && (
        <div className="hs-popover" role="dialog" aria-label="Preferências">
          <fieldset className="hs-fieldset">
            <legend className="hs-legend">Aparência</legend>

            {options.map((option) => (
              <label key={option.value} className="hs-radio">
                <input
                  type="radio"
                  name="hz-theme"
                  value={option.value}
                  checked={preference === option.value}
                  onChange={() => setThemePreference(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </fieldset>
        </div>
      )}
    </div>
  );
}
