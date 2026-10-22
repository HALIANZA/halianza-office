import { useEffect, useState, type ReactNode } from "react";
import RichTextEditor from "./components/editor/RichTextEditor";
import {
  loadWorkspace,
  saveWorkspace,
  type DocumentItem,
} from "./services/documentStorage";
import "./Writer.css";

type RibbonTab =
  | "Arquivo"
  | "Início"
  | "Inserir"
  | "Layout"
  | "Referências"
  | "Revisão"
  | "Exibir";

const ribbonTabs: RibbonTab[] = [
  "Arquivo",
  "Início",
  "Inserir",
  "Layout",
  "Referências",
  "Revisão",
  "Exibir",
];

const initialDocuments: DocumentItem[] = [
  {
    id: "welcome",
    title: "Bem-vindo ao HALIANZA Office",
    content:
      "<h1>Bem-vindo ao HALIANZA Office</h1><p>Seu espaço de trabalho para criar, organizar e editar documentos.</p><h2>Comece por aqui</h2><p>Selecione o texto e utilize a barra de ferramentas para formatar seu documento.</p><ul><li>Escreva suas ideias.</li><li>Organize suas informações.</li><li>Crie documentos profissionais.</li></ul>",
    updatedAt: "Agora",
  },
  {
    id: "notes",
    title: "Anotações",
    content:
      "<h1>Anotações</h1><p>Registre aqui suas ideias e observações.</p>",
    updatedAt: "Agora",
  },
];

export type WriterProps = {
  // Conteúdo que o desktop injeta no início da barra superior.
  topbarStart?: ReactNode;
};

function Writer({ topbarStart }: WriterProps) {
  const [initialWorkspace] = useState(() => loadWorkspace());

  const [documents, setDocuments] = useState<DocumentItem[]>(
    () => initialWorkspace?.documents ?? initialDocuments,
  );

  const [activeDocumentId, setActiveDocumentId] = useState(
    () => initialWorkspace?.activeDocumentId ?? "welcome",
  );

  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dirty, setDirty] = useState(false);

  const [saveStatus, setSaveStatus] = useState<
    "saved" | "pending" | "saving" | "error"
  >("saved");

  const [activeRibbonTab, setActiveRibbonTab] = useState<RibbonTab>("Início");

  const activeDocument =
    documents.find((document) => document.id === activeDocumentId) ??
    documents[0];

  const filteredDocuments = documents.filter((document) =>
    document.title.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    if (!dirty) {
      return;
    }

    setSaveStatus("pending");

    const timeoutId = window.setTimeout(() => {
      setSaveStatus("saving");

      const success = saveWorkspace({
        documents,
        activeDocumentId,
      });

      setSaveStatus(success ? "saved" : "error");

      if (success) {
        setDirty(false);
      }
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [documents, activeDocumentId, dirty]);

  function markChanged() {
    setDirty(true);
  }

  function updateDocumentContent(content: string) {
    if (content === activeDocument.content) {
      return;
    }

    setDocuments((currentDocuments) =>
      currentDocuments.map((document) =>
        document.id === activeDocumentId
          ? {
              ...document,
              content,
              updatedAt: new Date().toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            }
          : document,
      ),
    );

    markChanged();
  }

  function renameDocument(id: string, title: string) {
    setDocuments((currentDocuments) =>
      currentDocuments.map((document) =>
        document.id === id && document.title !== title
          ? { ...document, title, updatedAt: "Agora" }
          : document,
      ),
    );

    markChanged();
  }

  function selectDocument(id: string) {
    if (id === activeDocumentId) {
      return;
    }

    setActiveDocumentId(id);
    markChanged();
  }

  function createDocument() {
    const id = crypto.randomUUID();

    const newDocument: DocumentItem = {
      id,
      title: "Novo documento",
      content: "<h1>Novo documento</h1><p>Comece a escrever...</p>",
      updatedAt: "Agora",
    };

    setDocuments((currentDocuments) => [...currentDocuments, newDocument]);
    setActiveDocumentId(id);
    setActiveRibbonTab("Início");
    markChanged();
  }

  function deleteDocument(id: string) {
    if (documents.length <= 1) {
      return;
    }

    const remainingDocuments = documents.filter(
      (document) => document.id !== id,
    );

    setDocuments(remainingDocuments);

    if (activeDocumentId === id) {
      setActiveDocumentId(remainingDocuments[0].id);
    }

    markChanged();
  }

  const saveStatusText = {
    saved: "Salvo localmente",
    pending: "Aguardando salvamento...",
    saving: "Salvando...",
    error: "Falha ao salvar",
  }[saveStatus];

  return (
    <main className="hw-app-shell">
      <aside
        className={`hw-sidebar ${sidebarOpen ? "" : "hw-sidebar-collapsed"}`}
      >
        <div className="hw-sidebar-header">
          <div className="hw-brand-mark">H</div>

          {sidebarOpen && (
            <div className="hw-brand-copy">
              <span className="hw-brand-name">HALIANZA</span>
              <span className="hw-brand-product">Office</span>
            </div>
          )}
        </div>

        <div className="hw-workspace-label">
          {sidebarOpen && <span>ESPAÇO DE TRABALHO</span>}
        </div>

        <button
          className="hw-create-document-button"
          onClick={createDocument}
          title="Criar documento"
        >
          <span className="hw-button-icon">+</span>
          {sidebarOpen && <span>Novo documento</span>}
        </button>

        {sidebarOpen && (
          <>
            <div className="hw-search-container">
              <span className="hw-search-icon">⌕</span>

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar documentos..."
                aria-label="Buscar documentos"
              />
            </div>

            <div className="hw-documents-heading">
              <span>SEUS DOCUMENTOS</span>
              <span className="hw-document-count">
                {filteredDocuments.length}
              </span>
            </div>

            <nav className="hw-document-list" aria-label="Documentos">
              {filteredDocuments.map((document) => (
                <div
                  key={document.id}
                  className={`hw-document-item ${
                    document.id === activeDocumentId
                      ? "hw-document-item-active"
                      : ""
                  }`}
                >
                  <button
                    className="hw-document-select"
                    onClick={() => selectDocument(document.id)}
                    title={document.title}
                  >
                    <span className="hw-document-icon">▤</span>
                    <span className="hw-document-title">{document.title}</span>
                  </button>

                  {documents.length > 1 && (
                    <button
                      className="hw-document-delete"
                      onClick={() => deleteDocument(document.id)}
                      title={`Excluir ${document.title}`}
                      aria-label={`Excluir ${document.title}`}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              {filteredDocuments.length === 0 && (
                <p className="hw-empty-search">Nenhum documento encontrado.</p>
              )}
            </nav>
          </>
        )}

        <div className="hw-sidebar-footer">
          <div className="hw-status-indicator" />
          {sidebarOpen && <span>Espaço local</span>}
        </div>
      </aside>

      <section className="hw-main-panel">
        <header className="hw-topbar">
          <div className="hw-topbar-left">
            {topbarStart}
            <button
              className="hw-icon-button hw-sidebar-toggle"
              onClick={() => setSidebarOpen((open) => !open)}
              title={sidebarOpen ? "Recolher menu" : "Expandir menu"}
              aria-label={sidebarOpen ? "Recolher menu" : "Expandir menu"}
            >
              ☰
            </button>

            <div className="hw-breadcrumb">
              <span className="hw-breadcrumb-muted">Documentos</span>
              <span className="hw-breadcrumb-separator">/</span>
              <span className="hw-breadcrumb-current">
                {activeDocument.title}
              </span>
            </div>
          </div>

          <div className="hw-topbar-right">
            <div className="hw-save-status" title={saveStatusText}>
              <span
                className="hw-save-status-dot"
                style={{
                  background:
                    saveStatus === "error"
                      ? "#c64747"
                      : saveStatus === "saved"
                        ? "#65a77b"
                        : "#c49a52",
                }}
              />
              <span>{saveStatusText}</span>
            </div>

            <div className="hw-profile-avatar" title="Perfil local">
              V
            </div>
          </div>
        </header>

        <nav className="hw-ribbon-tabs" aria-label="Faixa de opções">
          {ribbonTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`hw-ribbon-tab ${
                activeRibbonTab === tab ? "hw-ribbon-tab-active" : ""
              }`}
              aria-current={activeRibbonTab === tab ? "page" : undefined}
              onClick={() => setActiveRibbonTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        {activeRibbonTab === "Início" ? (
          <div className="hw-editor-toolbar">
            <div className="hw-toolbar-document-info">
              <span className="hw-toolbar-document-icon">▤</span>

              <input
                className="hw-document-name-input"
                value={activeDocument.title}
                onChange={(event) =>
                  renameDocument(activeDocument.id, event.target.value)
                }
                aria-label="Nome do documento"
                spellCheck={false}
              />
            </div>

            <div className="hw-toolbar-divider" />

            <span className="hw-toolbar-hint">Editor de documentos</span>
          </div>
        ) : (
          <div className="hw-ribbon-placeholder" role="status">
            <strong>{activeRibbonTab}</strong>
            <span>Esta seção está em desenvolvimento.</span>
          </div>
        )}

        <div className="hw-editor-scroll-area">
          <article className="hw-document-page">
            <div className="hw-document-page-content">
              <RichTextEditor
                content={activeDocument.content}
                onChange={updateDocumentContent}
              />
            </div>
          </article>
        </div>

        <footer className="hw-editor-footer">
          <span>HALIANZA Office</span>
          <span>Editor de documentos</span>
          <span>{activeDocument.updatedAt}</span>
        </footer>
      </section>
    </main>
  );
}

export default Writer;
