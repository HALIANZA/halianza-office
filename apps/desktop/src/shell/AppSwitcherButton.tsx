import { AppsIcon } from "@halianza/shared/icons";

type AppSwitcherButtonProps = {
  onClick: () => void;
};

export default function AppSwitcherButton({ onClick }: AppSwitcherButtonProps) {
  return (
    <button
      type="button"
      className="hs-switcher"
      onClick={onClick}
      title="Todos os aplicativos"
      aria-label="Voltar à tela inicial do HALIANZA Office"
    >
      <AppsIcon className="hs-switcher-icon" />
    </button>
  );
}
