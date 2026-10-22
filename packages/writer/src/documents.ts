import { loadWorkspace } from "./services/documentStorage";

export type DocumentSummary = {
  id: string;
  title: string;
  preview: string;
  updatedAtMs: number | null;
};

function toPreview(html: string): string {
  const body = new DOMParser().parseFromString(html, "text/html").body;
  const first = body.firstElementChild;

  // O título já aparece no cartão: ignora o primeiro H1.
  if (first?.tagName === "H1") {
    first.remove();
  }

  return (body.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 160);
}

export function listDocuments(): DocumentSummary[] {
  const workspace = loadWorkspace();

  if (!workspace) {
    return [];
  }

  return workspace.documents.map((document) => ({
    id: document.id,
    title: document.title,
    preview: toPreview(document.content),
    updatedAtMs:
      typeof document.updatedAtMs === "number" ? document.updatedAtMs : null,
  }));
}
