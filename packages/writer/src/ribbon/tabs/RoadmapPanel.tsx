const ROADMAP: Record<
  string,
  { label: string; phase: string; groups: string }
> = {
  inserir: {
    label: "Inserir",
    phase: "Fase 2",
    groups: "Páginas, Tabelas, Ilustrações, Links, Texto e símbolos",
  },
  layout: {
    label: "Layout",
    phase: "Fase 3",
    groups: "Configuração da página, Parágrafo",
  },
  referencias: {
    label: "Referências",
    phase: "Fase 4",
    groups:
      "Sumário, Notas de rodapé, Citações, Legendas, Índice, Referências cruzadas",
  },
  revisao: {
    label: "Revisão",
    phase: "Fase 5",
    groups:
      "Revisão de texto, Comentários, Controle de alterações, Comparação, Proteção",
  },
  exibir: {
    label: "Exibir",
    phase: "Fase 6",
    groups: "Modos de exibição, Mostrar, Zoom, Janela, Interface",
  },
};

// Aba ainda sem comandos reais: informa o plano, sem botões decorativos.
export default function RoadmapPanel({ tabId }: { tabId: string }) {
  const item = ROADMAP[tabId];

  return (
    <div className="hw-rb-roadmap" role="status">
      <strong>{item.label}</strong>
      <span>
        Em desenvolvimento ({item.phase}). Grupos previstos: {item.groups}.
      </span>
    </div>
  );
}
