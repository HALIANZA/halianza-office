import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import "./App.css";

type IconName =
  | "home"
  | "file"
  | "sheet"
  | "slides"
  | "search"
  | "settings"
  | "plus"
  | "clock"
  | "chevron"
  | "more"
  | "folder"
  | "arrow";

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="m3 10 9-7 9 7" />
          <path d="M5 9v11h14V9M9 20v-7h6v7" />
        </svg>
      );
    case "file":
      return (
        <svg {...common}>
          <path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10z" />
          <path d="M13 3v7h7M8 14h8M8 17h8" />
        </svg>
      );
    case "sheet":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 9v12M15 9v12M3 15h18" />
        </svg>
      );
    case "slides":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="14" rx="2" />
          <path d="M12 17v4M8 21h8M8 8h8M8 12h5" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="10.8" cy="10.8" r="6.8" />
          <path d="m16 16 4.5 4.5" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path
            d="m19.4 15 .1.1 1.1 1.8-1.7 2.9-2.1-.6a8 8 0 0 1-1.6.9l-.5 2.1h-3.4l-.5-2.1a8 8 0 0 1-1.6-.9l-2.1.6-1.7-2.9 1.1-1.8a7 7 0 0 1 0-1.9l-1.1-1.8 1.7-2.9 2.1.6a8 8 0 0 1 1.6-.9l.5-2.1h3.4l.5 2.1a8 8 0 0 1 1.6.9l2.1-.6 1.7 2.9-1.1 1.8a7 7 0 0 1-.1 1.8Z"
            transform="translate(-1 -1) scale(1.08)"
          />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "chevron":
      return (
        <svg {...common}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      );
    case "more":
      return (
        <svg {...common}>
          <circle cx="5" cy="12" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
        </svg>
      );
    case "folder":
      return (
        <svg {...common}>
          <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <path d="M3 10h18" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
  }
}

const navigation: { label: string; icon: IconName }[] = [
  { label: "Início", icon: "home" },
  { label: "Documentos", icon: "file" },
  { label: "Planilhas", icon: "sheet" },
  { label: "Apresentações", icon: "slides" },
];

const templates = [
  {
    title: "Documento em branco",
    description: "Escreva e organize suas ideias.",
    icon: "file" as const,
    color: "blue",
    type: "Documento",
  },
  {
    title: "Planilha em branco",
    description: "Organize dados e informações.",
    icon: "sheet" as const,
    color: "green",
    type: "Planilha",
  },
  {
    title: "Apresentação em branco",
    description: "Transforme ideias em apresentações.",
    icon: "slides" as const,
    color: "orange",
    type: "Apresentação",
  },
];

function App() {
  const [activePage, setActivePage] = useState("Início");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [documentPath, setDocumentPath] = useState<string | null>(null);
  const [documentTitle, setDocumentTitle] = useState("Documento sem título");
  const [documentContent, setDocumentContent] = useState("");
  const [documentDirty, setDocumentDirty] = useState(false);

  const pageDescriptions: Record<string, string> = {
    Início: "Tudo o que você precisa para começar.",
    Documentos: "Crie e organize seus documentos de texto.",
    Planilhas: "Organize informações e trabalhe com dados.",
    Apresentações: "Prepare apresentações para suas ideias.",
  };

  function selectPage(page: string) {
    setActivePage(page);
    setNotice("");
  }

  function requestCreation(type: string) {
    if (type !== "Documento") {
      setNotice(
        `O editor de ${type.toLowerCase()} será implementado nas próximas etapas.`,
      );
      return;
    }

    setDocumentPath(null);
    setDocumentTitle("Documento sem título");
    setDocumentContent("");
    setDocumentDirty(false);
    setNotice("");
    setEditorOpen(true);
  }

  async function openDocument() {
    try {
      const selectedPath = await open({
        multiple: false,
        directory: false,
        filters: [
          {
            name: "Documentos de texto",
            extensions: ["txt", "md"],
          },
        ],
      });

      if (!selectedPath || Array.isArray(selectedPath)) {
        return;
      }

      const document = await invoke<{
        path: string;
        content: string;
      }>("read_document", { path: selectedPath });

      const fileName = selectedPath.split(/[\\/]/).pop();

      setDocumentPath(document.path);
      setDocumentTitle(fileName || "Documento sem título");
      setDocumentContent(document.content);
      setDocumentDirty(false);
      setNotice("");
      setEditorOpen(true);
    } catch (error) {
      setNotice(`Não foi possível abrir o documento: ${String(error)}`);
    }
  }

  async function saveDocument() {
    try {
      let targetPath = documentPath;

      if (!targetPath) {
        targetPath = await save({
          defaultPath: "Documento.txt",
          filters: [
            {
              name: "Documento de texto",
              extensions: ["txt"],
            },
          ],
        });

        if (!targetPath) {
          return;
        }

        if (!targetPath.toLowerCase().endsWith(".txt")) {
          targetPath += ".txt";
        }
      }

      await invoke("save_document", {
        path: targetPath,
        content: documentContent,
      });

      setDocumentPath(targetPath);
      setDocumentTitle(targetPath.split(/[\\/]/).pop() || "Documento.txt");
      setDocumentDirty(false);
      setNotice("Documento salvo com sucesso.");
    } catch (error) {
      setNotice(`Não foi possível salvar o documento: ${String(error)}`);
    }
  }

  function closeEditor() {
    if (
      documentDirty &&
      !window.confirm("Há alterações não salvas. Deseja fechar sem salvar?")
    ) {
      return;
    }

    setEditorOpen(false);
    setNotice("");
  }

  const visibleTemplates = templates.filter((template) =>
    `${template.title} ${template.description} ${template.type}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button
          className="brand"
          onClick={() => selectPage("Início")}
          aria-label="HALIANZA Office — início"
        >
          <span className="brand-mark">H</span>
          <span className="brand-copy">
            <span className="brand-name">HALIANZA</span>
            <span className="brand-product">Office</span>
          </span>
        </button>

        <div className="sidebar-section-label">ESPAÇO DE TRABALHO</div>

        <nav className="navigation" aria-label="Navegação principal">
          {navigation.map((item) => (
            <button
              key={item.label}
              className={`nav-item ${activePage === item.label ? "active" : ""}`}
              onClick={() => selectPage(item.label)}
              aria-current={activePage === item.label ? "page" : undefined}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
              {activePage === item.label && (
                <span className="active-indicator" />
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-divider" />
          <button
            className="nav-item settings-button"
            onClick={() =>
              setNotice(
                "As configurações estarão disponíveis em uma próxima etapa.",
              )
            }
          >
            <Icon name="settings" size={19} />
            <span>Configurações</span>
          </button>
          <div className="version-card">
            <span className="version-dot" />
            <div>
              <span className="version-title">HALIANZA Office</span>
              <span className="version-subtitle">
                Prévia de desenvolvimento
              </span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <span>HALIANZA Office</span>
            <Icon name="chevron" size={15} />
            <span className="breadcrumb-current">{activePage}</span>
          </div>

          <label className="search-box">
            <Icon name="search" size={18} />
            <input
              type="search"
              placeholder="Pesquisar modelos..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Pesquisar modelos"
            />
            <span className="search-shortcut">/</span>
          </label>
        </header>

        <div className="page-content">
          <section className="welcome-section">
            <div>
              <div className="eyebrow">SEU ESPAÇO DE PRODUTIVIDADE</div>
              <h1>
                {activePage === "Início" ? "Bom ter você aqui." : activePage}
              </h1>
              <p className="welcome-description">
                {pageDescriptions[activePage]}
              </p>
            </div>
            <div className="welcome-mark" aria-hidden="true">
              <div className="welcome-mark-inner">H</div>
            </div>
          </section>

          <section className="section-block">
            <div className="section-heading">
              <div>
                <h2>Comece algo novo</h2>
                <p>Escolha o tipo de arquivo que deseja criar.</p>
              </div>
            </div>

            <div className="template-grid">
              {visibleTemplates
                .filter((template) => {
                  if (activePage === "Início") return true;
                  if (activePage === "Documentos")
                    return template.type === "Documento";
                  if (activePage === "Planilhas")
                    return template.type === "Planilha";
                  return template.type === "Apresentação";
                })
                .map((template) => (
                  <button
                    className="template-card"
                    key={template.title}
                    onClick={() => requestCreation(template.type)}
                  >
                    <div className={`template-icon ${template.color}`}>
                      <Icon name={template.icon} size={23} />
                    </div>
                    <div className="template-card-copy">
                      <span className="template-title">{template.title}</span>
                      <span className="template-description">
                        {template.description}
                      </span>
                    </div>
                    <span className="template-arrow">
                      <Icon name="arrow" size={17} />
                    </span>
                  </button>
                ))}
            </div>

            {visibleTemplates.length === 0 && (
              <div className="search-empty">
                Nenhum modelo corresponde a “{search}”.
              </div>
            )}
          </section>

          {notice && (
            <div className="notice" role="status">
              <span>{notice}</span>
              <button onClick={() => setNotice("")} aria-label="Fechar aviso">
                ×
              </button>
            </div>
          )}

          <section className="section-block recent-section">
            <div className="section-heading recent-heading">
              <div>
                <h2>Recentes</h2>
                <p>Continue de onde você parou.</p>
              </div>
              <button
                className="subtle-button"
                onClick={() =>
                  setNotice(
                    "A listagem de arquivos estará disponível quando o gerenciamento local for implementado.",
                  )
                }
              >
                <Icon name="more" size={20} />
                <span>Opções</span>
              </button>
            </div>

            <div className="empty-state">
              <div className="empty-illustration">
                <div className="empty-sheet">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="empty-clock">
                  <Icon name="clock" size={21} />
                </div>
              </div>
              <h3>Nenhum arquivo por aqui — ainda.</h3>
              <p>
                Seus documentos recentes aparecerão aqui quando o gerenciamento
                de arquivos estiver disponível.
              </p>
              <button
                className="text-button"
                onClick={() =>
                  setNotice(
                    "A abertura de arquivos será implementada em uma próxima etapa.",
                  )
                }
              >
                Saiba mais <Icon name="chevron" size={15} />
              </button>
            </div>
          </section>

          <footer className="page-footer">
            <span>HALIANZA Office</span>
            <span>Feito para trabalhar com suas ideias.</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;
