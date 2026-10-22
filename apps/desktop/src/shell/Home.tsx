import { useMemo, useState } from "react";
import type { AppId, OpenRequest, RecentItem, SuiteApp } from "./apps";
import ProfileAvatar from "./ProfileAvatar";

type HomeProps = {
  apps: SuiteApp[];
  onOpenApp: (id: AppId, request?: OpenRequest) => void;
};

function greeting(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Bom dia";
  }

  if (hour >= 12 && hour < 18) {
    return "Boa tarde";
  }

  return "Boa noite";
}

function formatRelative(timestamp: number | null): string {
  if (timestamp === null) {
    return "";
  }

  const minutes = Math.floor((Date.now() - timestamp) / 60000);

  if (minutes < 1) {
    return "Agora";
  }

  if (minutes < 60) {
    return `há ${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `há ${hours} h`;
  }

  if (hours < 48) {
    return "Ontem";
  }

  return new Date(timestamp).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

function byRecency(a: RecentItem, b: RecentItem): number {
  return (b.updatedAtMs ?? -1) - (a.updatedAtMs ?? -1);
}

export default function Home({ apps, onOpenApp }: HomeProps) {
  const [search, setSearch] = useState("");

  // A tela inicial é remontada a cada volta, então a lista é sempre atual.
  const recentItems = useMemo(
    () =>
      apps
        .flatMap((app) => app.listRecent?.() ?? [])
        // Sem carimbo, a ordem de criação invertida é a melhor aproximação.
        .reverse()
        .sort(byRecency),
    [apps],
  );

  const query = search.trim().toLowerCase();

  const visibleItems = query
    ? recentItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.preview.toLowerCase().includes(query),
      )
    : recentItems;

  function glyphOf(id: AppId): string {
    return apps.find((app) => app.id === id)?.glyph ?? "";
  }

  return (
    <div className="hs-home">
      <header className="hs-topbar">
        <div className="hs-topbar-brand">
          <div className="hs-brand-mark">H</div>
          <span className="hs-brand-name">HALIANZA Office</span>
        </div>

        <label className="hs-search">
          <span className="hs-search-icon" aria-hidden="true">
            ⌕
          </span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Pesquisar documentos"
            aria-label="Pesquisar documentos"
          />
        </label>

        <ProfileAvatar />
      </header>

      <div className="hs-body">
        <nav className="hs-rail" aria-label="Aplicativos">
          <button
            type="button"
            className="hs-rail-item hs-rail-item-active"
            aria-current="page"
          >
            <span className="hs-rail-glyph" aria-hidden="true">
              ⌂
            </span>
            <span className="hs-rail-label">Início</span>
          </button>

          <div className="hs-rail-divider" />

          {apps.map((app) => {
            const available = app.component !== undefined;

            return (
              <button
                key={app.id}
                type="button"
                className="hs-rail-item"
                disabled={!available}
                title={
                  available
                    ? `${app.name} — ${app.description}`
                    : `${app.name} — em breve`
                }
                onClick={() => onOpenApp(app.id)}
              >
                <span className="hs-rail-glyph" aria-hidden="true">
                  {app.glyph}
                </span>
                <span className="hs-rail-label">{app.name}</span>
              </button>
            );
          })}
        </nav>

        <main className="hs-content">
          <h1 className="hs-greeting">{greeting()}</h1>

          <section aria-labelledby="hs-create-title">
            <h2 id="hs-create-title" className="hs-section-title">
              Criar
            </h2>

            <div className="hs-create-row">
              {apps
                .filter((app) => app.createLabel)
                .map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    className="hs-create-tile"
                    disabled={app.component === undefined}
                    onClick={() => onOpenApp(app.id, { kind: "new" })}
                  >
                    <span className="hs-create-plus" aria-hidden="true">
                      +
                    </span>
                    <span>{app.createLabel}</span>
                  </button>
                ))}
            </div>
          </section>

          <section aria-labelledby="hs-recent-title">
            <h2 id="hs-recent-title" className="hs-section-title">
              Recentes
            </h2>

            {visibleItems.length > 0 ? (
              <div className="hs-recent-grid">
                {visibleItems.map((item) => (
                  <button
                    key={`${item.appId}:${item.id}`}
                    type="button"
                    className="hs-recent-card"
                    onClick={() =>
                      onOpenApp(item.appId, { kind: "open", itemId: item.id })
                    }
                  >
                    <span className="hs-recent-preview">
                      {item.preview || "Documento vazio"}
                    </span>

                    <span className="hs-recent-meta">
                      <span className="hs-app-glyph" aria-hidden="true">
                        {glyphOf(item.appId)}
                      </span>
                      <span className="hs-recent-text">
                        <span className="hs-recent-title">{item.title}</span>
                        <span className="hs-recent-date">
                          {formatRelative(item.updatedAtMs)}
                        </span>
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="hs-empty">
                {query
                  ? "Nenhum documento encontrado."
                  : "Nenhum documento ainda. Crie o primeiro acima."}
              </p>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
