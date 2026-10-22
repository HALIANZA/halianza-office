import { lazy, type ComponentType, type ReactNode } from "react";
import { listDocuments } from "@halianza/writer/documents";

export type AppId =
  "writer" | "sheets" | "slides" | "mail" | "teams" | "drive" | "notes";

// O que a tela inicial pede a um produto ao abri-lo.
export type OpenRequest = { kind: "new" } | { kind: "open"; itemId: string };

export type ProductCommand = OpenRequest & { nonce: number };

// Contrato entre o shell e cada produto da suíte.
export type ProductProps = {
  topbarStart?: ReactNode;
  command?: ProductCommand;
};

export type RecentItem = {
  id: string;
  appId: AppId;
  title: string;
  preview: string;
  updatedAtMs: number | null;
};

export type SuiteApp = {
  id: AppId;
  name: string;
  description: string;
  glyph: string;
  // Rótulo do atalho "Criar" da tela inicial.
  createLabel?: string;
  // Sem componente = produto ainda não implementado ("Em breve").
  component?: ComponentType<ProductProps>;
  listRecent?: () => RecentItem[];
};

const Writer = lazy(() =>
  import("@halianza/writer").then((module) => ({ default: module.Writer })),
);

export const suiteApps: SuiteApp[] = [
  {
    id: "writer",
    name: "Writer",
    description: "Documentos e edição de texto.",
    glyph: "Wr",
    createLabel: "Novo documento",
    component: Writer,
    listRecent: () =>
      listDocuments().map((document) => ({
        ...document,
        appId: "writer" as const,
      })),
  },
  {
    id: "sheets",
    name: "Sheets",
    description: "Planilhas e cálculos.",
    glyph: "Sh",
    createLabel: "Nova planilha",
  },
  {
    id: "slides",
    name: "Slides",
    description: "Criação e edição de apresentações.",
    glyph: "Sl",
    createLabel: "Nova apresentação",
  },
  {
    id: "mail",
    name: "Mail",
    description: "E-mail e calendário.",
    glyph: "Ma",
  },
  {
    id: "teams",
    name: "Teams",
    description: "Mensagens e videoconferência.",
    glyph: "Te",
  },
  {
    id: "drive",
    name: "Drive",
    description: "Armazenamento e sincronização de arquivos.",
    glyph: "Dr",
  },
  {
    id: "notes",
    name: "Notes",
    description: "Anotações digitais.",
    glyph: "No",
    createLabel: "Nova anotação",
  },
];
