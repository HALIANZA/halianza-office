import { lazy, type ComponentType, type ReactNode } from "react";

export type AppId =
  "writer" | "sheets" | "slides" | "mail" | "teams" | "drive" | "notes";

// Contrato entre o shell e cada produto da suíte.
export type ProductProps = {
  topbarStart?: ReactNode;
};

export type SuiteApp = {
  id: AppId;
  name: string;
  description: string;
  glyph: string;
  // Sem componente = produto ainda não implementado ("Em breve").
  component?: ComponentType<ProductProps>;
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
    component: Writer,
  },
  {
    id: "sheets",
    name: "Sheets",
    description: "Planilhas e cálculos.",
    glyph: "Sh",
  },
  {
    id: "slides",
    name: "Slides",
    description: "Criação e edição de apresentações.",
    glyph: "Sl",
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
  },
];
