import { lazy, type ComponentType, type ReactNode } from "react";
import { listDocuments } from "@halianza/writer/documents";
import {
  DocumentIcon,
  DriveIcon,
  MailIcon,
  NotesIcon,
  SheetsIcon,
  SlidesIcon,
  TeamsIcon,
} from "@halianza/shared/icons";

export type IconComponent = ComponentType<{ className?: string }>;

export type AppId =
  "writer" | "sheets" | "slides" | "mail" | "teams" | "drive" | "notes";

// O que a tela inicial pede a um produto ao abri-lo.
export type OpenRequest = { kind: "new" } | { kind: "open"; itemId: string };

export type ProductCommand = OpenRequest & { nonce: number };

// Contrato entre o shell e cada produto da suíte.
export type ProductProps = {
  topbarStart?: ReactNode;
  topbarEnd?: ReactNode;
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
  icon: IconComponent;
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
    icon: DocumentIcon,
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
    icon: SheetsIcon,
    createLabel: "Nova planilha",
  },
  {
    id: "slides",
    name: "Slides",
    description: "Criação e edição de apresentações.",
    icon: SlidesIcon,
    createLabel: "Nova apresentação",
  },
  {
    id: "mail",
    name: "Mail",
    description: "E-mail e calendário.",
    icon: MailIcon,
  },
  {
    id: "teams",
    name: "Teams",
    description: "Mensagens e videoconferência.",
    icon: TeamsIcon,
  },
  {
    id: "drive",
    name: "Drive",
    description: "Armazenamento e sincronização de arquivos.",
    icon: DriveIcon,
  },
  {
    id: "notes",
    name: "Notes",
    description: "Anotações digitais.",
    icon: NotesIcon,
    createLabel: "Nova anotação",
  },
];
