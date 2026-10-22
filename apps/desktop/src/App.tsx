import { Suspense, useRef, useState } from "react";
import AppSwitcherButton from "./shell/AppSwitcherButton";
import Home from "./shell/Home";
import {
  suiteApps,
  type AppId,
  type OpenRequest,
  type ProductCommand,
} from "./shell/apps";
import "./shell/shell.css";

function App() {
  const [activeAppId, setActiveAppId] = useState<AppId | null>(null);
  const [openedAppIds, setOpenedAppIds] = useState<AppId[]>([]);
  const [commands, setCommands] = useState<
    Partial<Record<AppId, ProductCommand>>
  >({});
  const nonceRef = useRef(0);

  function openApp(id: AppId, request?: OpenRequest) {
    if (request) {
      nonceRef.current += 1;

      const command: ProductCommand = { ...request, nonce: nonceRef.current };

      setCommands((current) => ({ ...current, [id]: command }));
    }

    setOpenedAppIds((ids) => (ids.includes(id) ? ids : [...ids, id]));
    setActiveAppId(id);
  }

  return (
    <>
      {activeAppId === null && <Home apps={suiteApps} onOpenApp={openApp} />}

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
                command={commands[id]}
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
