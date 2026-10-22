export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "halianza-office.theme.v1";
const PREFERENCES: ThemePreference[] = ["system", "light", "dark"];

let preference: ThemePreference = "system";
const listeners = new Set<() => void>();

function isThemePreference(value: unknown): value is ThemePreference {
  return PREFERENCES.some((item) => item === value);
}

function readStoredPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    return isThemePreference(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

export function resolveTheme(value: ThemePreference): ResolvedTheme {
  if (value !== "system") {
    return value;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme() {
  document.documentElement.dataset.theme = resolveTheme(preference);
}

// Chamar uma vez, antes da primeira renderização.
export function initTheme(): void {
  preference = readStoredPreference();
  applyTheme();

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      if (preference === "system") {
        applyTheme();
      }
    });
}

export function setThemePreference(next: ThemePreference): void {
  preference = next;

  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch (error) {
    console.error("HALIANZA Office: não foi possível salvar o tema.", error);
  }

  applyTheme();
  listeners.forEach((listener) => listener());
}

export function getThemePreference(): ThemePreference {
  return preference;
}

export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
