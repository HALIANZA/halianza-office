import { useEffect, useState } from "react";
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

function Writer() {
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
    <main className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "" : "sidebar-collapsed"}`}>
        <div className="sidebar-header">
          <div className="brand-mark">H</div>

          {sidebarOpen && (
            <div className="brand-copy">
              <span className="brand-name">HALIANZA</span>
              <span className="brand-product">Office</span>
            </div>
          )}
        </div>

        <div className="workspace-label">
          {sidebarOpen && <span>ESPAÇO DE TRABALHO</span>}
        </div>

        <button
          className="create-document-button"
          onClick={createDocument}
          title="Criar documento"
        >
          <span className="button-icon">+</span>
          {sidebarOpen && <span>Novo documento</span>}
        </button>

        {sidebarOpen && (
          <>
            <div className="search-container">
              <span className="search-icon">⌕</span>

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar documentos..."
                aria-label="Buscar documentos"
              />
            </div>

            <div className="documents-heading">
              <span>SEUS DOCUMENTOS</span>
              <span className="document-count">{filteredDocuments.length}</span>
            </div>

            <nav className="document-list" aria-label="Documentos">
              {filteredDocuments.map((document) => (
                <div
                  key={document.id}
                  className={`document-item ${
                    document.id === activeDocumentId
                      ? "document-item-active"
                      : ""
                  }`}
                >
                  <button
                    className="document-select"
                    onClick={() => selectDocument(document.id)}
                    title={document.title}
                  >
                    <span className="document-icon">▤</span>
                    <span className="document-title">{document.title}</span>
                  </button>

                  {documents.length > 1 && (
                    <button
                      className="document-delete"
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
                <p className="empty-search">Nenhum documento encontrado.</p>
              )}
            </nav>
          </>
        )}

        <div className="sidebar-footer">
          <div className="status-indicator" />
          {sidebarOpen && <span>Espaço local</span>}
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button sidebar-toggle"
              onClick={() => setSidebarOpen((open) => !open)}
              title={sidebarOpen ? "Recolher menu" : "Expandir menu"}
              aria-label={sidebarOpen ? "Recolher menu" : "Expandir menu"}
            >
              ☰
            </button>

            <div className="breadcrumb">
              <span className="breadcrumb-muted">Documentos</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">{activeDocument.title}</span>
            </div>
          </div>

          <div className="topbar-right">
            <div className="save-status" title={saveStatusText}>
              <span
                className="save-status-dot"
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

            <div className="profile-avatar" title="Perfil local">
              V
            </div>
          </div>
        </header>

        <nav className="ribbon-tabs" aria-label="Faixa de opções">
          {ribbonTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`ribbon-tab ${
                activeRibbonTab === tab ? "ribbon-tab-active" : ""
              }`}
              aria-current={activeRibbonTab === tab ? "page" : undefined}
              onClick={() => setActiveRibbonTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        {activeRibbonTab === "Início" ? (
          <div className="editor-toolbar">
            <div className="toolbar-document-info">
              <span className="toolbar-document-icon">▤</span>

              <input
                className="document-name-input"
                value={activeDocument.title}
                onChange={(event) =>
                  renameDocument(activeDocument.id, event.target.value)
                }
                aria-label="Nome do documento"
                spellCheck={false}
              />
            </div>

            <div className="toolbar-divider" />

            <span className="toolbar-hint">Editor de documentos</span>
          </div>
        ) : (
          <div className="ribbon-placeholder" role="status">
            <strong>{activeRibbonTab}</strong>
            <span>Esta seção está em desenvolvimento.</span>
          </div>
        )}

        <div className="editor-scroll-area">
          <article className="document-page">
            <div className="document-page-content">
              <RichTextEditor
                content={activeDocument.content}
                onChange={updateDocumentContent}
              />
            </div>
          </article>
        </div>

        <footer className="editor-footer">
          <span>HALIANZA Office</span>
          <span>Editor de documentos</span>
          <span>{activeDocument.updatedAt}</span>
        </footer>
      </section>
    </main>
  );
}

export default Writer;
