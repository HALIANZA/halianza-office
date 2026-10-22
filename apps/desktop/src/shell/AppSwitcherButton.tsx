type AppSwitcherButtonProps = {
  onClick: () => void;
};

const dots = [2, 8, 14];

export default function AppSwitcherButton({ onClick }: AppSwitcherButtonProps) {
  return (
    <button
      type="button"
      className="hs-switcher"
      onClick={onClick}
      title="Todos os aplicativos"
      aria-label="Voltar à tela inicial do HALIANZA Office"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        {dots.flatMap((cx) =>
          dots.map((cy) => (
            <circle
              key={`${cx}-${cy}`}
              cx={cx}
              cy={cy}
              r="1.6"
              fill="currentColor"
            />
          )),
        )}
      </svg>
    </button>
  );
}
