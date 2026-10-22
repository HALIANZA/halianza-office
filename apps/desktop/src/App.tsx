import { Suspense, useState } from "react";
import AppSwitcherButton from "./shell/AppSwitcherButton";
import Home from "./shell/Home";
import { suiteApps, type AppId } from "./shell/apps";
import "./shell/shell.css";

function App() {
  const [activeAppId, setActiveAppId] = useState<AppId | null>(null);
  const [openedAppIds, setOpenedAppIds] = useState<AppId[]>([]);

  function openApp(id: AppId) {
    setOpenedAppIds((ids) => (ids.includes(id) ? ids : [...ids, id]));
    setActiveAppId(id);
  }

  return (
    <>
      {activeAppId === null && <Home apps={suiteApps} onOpen={openApp} />}

      {/* Aplicativos já abertos continuam montados (só escondidos), para
          que o salvamento pendente e o estado de cada um não se percam. */}
      {openedAppIds.map((id) => {
        const app = suiteApps.find((item) => item.id === id);

        if (!app?.component) {
          return null;
        }

        const Product = app.component;

        return (
          <div key={id} hidden={id !== activeAppId}>
            <Suspense
              fallback={
                <div className="hs-loading" role="status">
                  Carregando {app.name}...
                </div>
              }
            >
              <Product
                topbarStart={
                  <AppSwitcherButton onClick={() => setActiveAppId(null)} />
                }
              />
            </Suspense>
          </div>
        );
      })}
    </>
  );
}

export default App;
