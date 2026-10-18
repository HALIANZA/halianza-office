
export type DocumentItem = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
};

export type DocumentWorkspace = {
  documents: DocumentItem[];
  activeDocumentId: string;
};

const STORAGE_KEY = "halianza-office.workspace.v1";

function isDocumentItem(value: unknown): value is DocumentItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const document = value as Record<string, unknown>;

  return (
    typeof document.id === "string" &&
    typeof document.title === "string" &&
    typeof document.content === "string" &&
    typeof document.updatedAt === "string"
  );
}

function isDocumentWorkspace(
  value: unknown,
): value is DocumentWorkspace {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const workspace = value as Record<string, unknown>;

  return (
    Array.isArray(workspace.documents) &&
    workspace.documents.length > 0 &&
    workspace.documents.every(isDocumentItem) &&
    typeof workspace.activeDocumentId === "string" &&
    workspace.documents.some(
      (document: DocumentItem) =>
        document.id === workspace.activeDocumentId,
    )
  );
}

export function loadWorkspace(): DocumentWorkspace | null {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);

    if (storedValue === null) {
      return null;
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    if (!isDocumentWorkspace(parsedValue)) {
      console.error(
        "HALIANZA Office: os dados salvos são inválidos. O conteúdo original foi preservado.",
      );

      return null;
    }

    return parsedValue;
  } catch (error) {
    console.error(
      "HALIANZA Office: não foi possível carregar os documentos.",
      error,
    );

    return null;
  }
}

export function saveWorkspace(
  workspace: DocumentWorkspace,
): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
    return true;
  } catch (error) {
    console.error(
      "HALIANZA Office: não foi possível salvar os documentos.",
      error,
    );

    return false;
  }
}
