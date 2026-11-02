import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import type { Editor } from "@tiptap/react";
import { TIPS } from "./catalog";
import FindPanel from "./FindPanel";
import { ChevronDownIcon, ChevronUpIcon, RedoIcon, UndoIcon } from "./icons";
import HomeTab from "./tabs/HomeTab";
import RoadmapPanel from "./tabs/RoadmapPanel";
import { RibbonButton } from "./ui";
import { useFormatPainter } from "./useFormatPainter";
import { useRibbonSnapshot } from "./useRibbonSnapshot";
import "./ribbon.css";

const TABS = [
  { id: "inicio", label: "Início" },
  { id: "inserir", label: "Inserir" },
  { id: "layout", label: "Layout" },
  { id: "referencias", label: "Referências" },
  { id: "revisao", label: "Revisão" },
  { id: "exibir", label: "Exibir" },
] as const;

type TabId = (typeof TABS)[number]["id"];
type FindMode = "find" | "replace";

export default function Ribbon({ editor }: { editor: Editor | null }) {
  const [activeTab, setActiveTab] = useState<TabId>("inicio");
  const [collapsed, setCollapsed] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [findMode, setFindMode] = useState<FindMode | null>(null);
  const [findKey, setFindKey] = useState(0);
  const noticeTimer = useRef<number | undefined>(undefined);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const snap = useRibbonSnapshot(editor);
  const painter = useFormatPainter(editor);

  function notify(message: string) {
    window.clearTimeout(noticeTimer.current);
    setNotice(message);
    noticeTimer.current = window.setTimeout(() => setNotice(null), 6000);
  }

  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);

  function openFind(mode: FindMode) {
    setFindMode(mode);
    setFindKey((key) => key + 1);
  }

  // Ctrl+F localiza e Ctrl+H substitui, só quando o Writer está visível.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const root = rootRef.current;

      if (
        !(event.ctrlKey || event.metaKey) ||
        !root ||
        root.offsetParent === null
      ) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === "f") {
        event.preventDefault();
        setFindMode("find");
        setFindKey((current) => current + 1);
      } else if (key === "h") {
        event.preventDefault();
        setFindMode("replace");
        setFindKey((current) => current + 1);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function selectTab(id: TabId) {
    setActiveTab(id);
    setCollapsed(false);
  }

  function handleTabKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const index = TABS.findIndex((tab) => tab.id === activeTab);
    let next = index;

    if (event.key === "ArrowRight") next = (index + 1) % TABS.length;
    else if (event.key === "ArrowLeft")
      next = (index - 1 + TABS.length) % TABS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = TABS.length - 1;
    else return;

    event.preventDefault();
    setActiveTab(TABS[next].id);
    tabRefs.current[next]?.focus();
  }

  return (
    <div className="hw-ribbon" ref={rootRef}>
      <div className="hw-ribbon-header">
        <div className="hw-qat" role="group" aria-label="Acesso rápido">
          <RibbonButton
            icon={UndoIcon}
            tip={TIPS.undo}
            disabled={!snap.canUndo}
            onClick={() => editor?.chain().focus().undo().run()}
          />
          <RibbonButton
            icon={RedoIcon}
            tip={TIPS.redo}
            disabled={!snap.canRedo}
            onClick={() => editor?.chain().focus().redo().run()}
          />
        </div>

        <div
          className="hw-rb-tabs"
          role="tablist"
          aria-label="Faixa de opções"
          onKeyDown={handleTabKeyDown}
        >
          {TABS.map((tab, index) => (
            <button
              key={tab.id}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              id={`hw-tab-${tab.id}`}
              type="button"
              role="tab"
              className="hw-rb-tab"
              aria-selected={activeTab === tab.id}
              aria-controls="hw-ribbon-panel"
              tabIndex={activeTab === tab.id ? 0 : -1}
              onClick={() => selectTab(tab.id)}
              onDoubleClick={() => setCollapsed((current) => !current)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {notice && (
          <span className="hw-rb-notice" role="status">
            {notice}
          </span>
        )}

        <button
          type="button"
          className="hw-rb-collapse"
          aria-label={
            collapsed ? "Expandir a faixa de opções" : TIPS.collapse.label
          }
          title={collapsed ? "Expandir a faixa de opções" : TIPS.collapse.label}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((current) => !current)}
        >
          {collapsed ? (
            <ChevronDownIcon className="hw-rb-chevron" />
          ) : (
            <ChevronUpIcon className="hw-rb-chevron" />
          )}
        </button>
      </div>

      {!collapsed && (
        <div
          id="hw-ribbon-panel"
          role="tabpanel"
          aria-labelledby={`hw-tab-${activeTab}`}
          className="hw-rb-panel"
        >
          {activeTab === "inicio" ? (
            <HomeTab
              editor={editor}
              snap={snap}
              notify={notify}
              painter={painter}
              onFind={openFind}
            />
          ) : (
            <RoadmapPanel tabId={activeTab} />
          )}
        </div>
      )}

      {findMode && editor && (
        <FindPanel
          editor={editor}
          mode={findMode}
          focusKey={findKey}
          onModeChange={setFindMode}
          onClose={() => setFindMode(null)}
        />
      )}
    </div>
  );
}
