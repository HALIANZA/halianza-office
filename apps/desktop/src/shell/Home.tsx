import type { AppId, SuiteApp } from "./apps";

type HomeProps = {
  apps: SuiteApp[];
  onOpen: (id: AppId) => void;
};

export default function Home({ apps, onOpen }: HomeProps) {
  return (
    <main className="hs-home">
      <div className="hs-home-inner">
        <header className="hs-home-header">
          <div className="hs-brand-mark">H</div>
          <div>
            <h1 className="hs-home-title">HALIANZA Office</h1>
            <p className="hs-home-subtitle">
              Escolha um aplicativo para começar.
            </p>
          </div>
        </header>

        <nav className="hs-app-grid" aria-label="Aplicativos">
          {apps.map((app) => {
            const available = app.component !== undefined;

            return (
              <button
                key={app.id}
                type="button"
                className="hs-app-card"
                disabled={!available}
                onClick={() => onOpen(app.id)}
              >
                <span className="hs-app-glyph" aria-hidden="true">
                  {app.glyph}
                </span>
                <span className="hs-app-name">{app.name}</span>
                <span className="hs-app-description">{app.description}</span>
                {!available && <span className="hs-app-badge">Em breve</span>}
              </button>
            );
          })}
        </nav>
      </div>
    </main>
  );
}
