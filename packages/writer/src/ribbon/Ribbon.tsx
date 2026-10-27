import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { Editor } from "@tiptap/react";
import { TIPS } from "./catalog";
import { ChevronDownIcon, ChevronUpIcon, RedoIcon, UndoIcon } from "./icons";
import HomeTab from "./tabs/HomeTab";
import RoadmapPanel from "./tabs/RoadmapPanel";
import { RibbonButton } from "./ui";
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

export default function Ribbon({ editor }: { editor: Editor | null }) {
  const [activeTab, setActiveTab] = useState<TabId>("inicio");
  const [collapsed, setCollapsed] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimer = useRef<number | undefined>(undefined);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const snap = useRibbonSnapshot(editor);

  function notify(message: string) {
    window.clearTimeout(noticeTimer.current);
    setNotice(message);
    noticeTimer.current = window.setTimeout(() => setNotice(null), 6000);
  }

  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);

  function selectTab(id: TabId) {
    setActiveTab(id);
    setCollapsed(false);
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
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
    <div className="hw-ribbon">
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
            <HomeTab editor={editor} snap={snap} notify={notify} />
          ) : (
            <RoadmapPanel tabId={activeTab} />
          )}
        </div>
      )}
    </div>
  );
}
