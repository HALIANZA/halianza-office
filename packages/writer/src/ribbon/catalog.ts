export type Tip = { label: string; description?: string; shortcut?: string };

// Textos das dicas. Só há atalho onde o editor realmente o oferece.
export const TIPS = {
  undo: {
    label: "Desfazer",
    description: "Desfaz a última ação.",
    shortcut: "Ctrl+Z",
  },
  redo: {
    label: "Refazer",
    description: "Refaz a ação desfeita.",
    shortcut: "Ctrl+Y",
  },
  paste: {
    label: "Colar",
    description: "Insere o conteúdo da área de transferência.",
    shortcut: "Ctrl+V",
  },
  cut: {
    label: "Recortar",
    description: "Remove a seleção e a copia para a área de transferência.",
    shortcut: "Ctrl+X",
  },
  copy: {
    label: "Copiar",
    description: "Copia a seleção para a área de transferência.",
    shortcut: "Ctrl+C",
  },
  painter: {
    label: "Pincel de formatação",
    description: "Copia a formatação de um trecho e a aplica a outro.",
  },
  fontFamily: {
    label: "Fonte",
    description: "Altera a família tipográfica da seleção.",
  },
  fontSize: {
    label: "Tamanho da fonte",
    description: "Altera o tamanho do texto selecionado.",
  },
  fontIncrease: {
    label: "Aumentar fonte",
    description: "Passa para o próximo tamanho da lista.",
  },
  fontDecrease: {
    label: "Diminuir fonte",
    description: "Passa para o tamanho anterior da lista.",
  },
  changeCase: {
    label: "Maiúsculas e minúsculas",
    description: "Altera a capitalização do texto selecionado.",
  },
  clearFormat: {
    label: "Limpar toda a formatação",
    description: "Remove a formatação do texto e restaura o parágrafo normal.",
  },
  bold: { label: "Negrito", shortcut: "Ctrl+B" },
  italic: { label: "Itálico", shortcut: "Ctrl+I" },
  underline: { label: "Sublinhado", shortcut: "Ctrl+U" },
  strike: {
    label: "Tachado",
    description: "Desenha uma linha no meio do texto.",
    shortcut: "Ctrl+Shift+S",
  },
  subscript: {
    label: "Subscrito",
    description: "Cria letras pequenas abaixo da linha.",
    shortcut: "Ctrl+,",
  },
  superscript: {
    label: "Sobrescrito",
    description: "Cria letras pequenas acima da linha.",
    shortcut: "Ctrl+.",
  },
  fontColor: {
    label: "Cor da fonte",
    description: "Aplica a cor ao texto selecionado.",
  },
  highlight: {
    label: "Cor de realce do texto",
    description: "Destaca o texto selecionado com uma cor de fundo.",
    shortcut: "Ctrl+Shift+H",
  },
  bullets: {
    label: "Marcadores",
    description: "Inicia ou encerra uma lista com marcadores.",
    shortcut: "Ctrl+Shift+8",
  },
  numbering: {
    label: "Numeração",
    description: "Inicia ou encerra uma lista numerada.",
    shortcut: "Ctrl+Shift+7",
  },
  tasks: {
    label: "Lista de tarefas",
    description: "Inicia ou encerra uma lista com caixas de seleção.",
    shortcut: "Ctrl+Shift+9",
  },
  multilevel: {
    label: "Lista multinível",
    description: "Define estilos de lista para cada nível.",
  },
  outdent: {
    label: "Diminuir recuo",
    description: "Move o item de lista ou o parágrafo para a esquerda.",
  },
  indent: {
    label: "Aumentar recuo",
    description: "Move o item de lista ou o parágrafo para a direita.",
  },
  lineSpacing: {
    label: "Espaçamento entre linhas e parágrafos",
    description: "Define o espaçamento do parágrafo.",
  },
  alignLeft: { label: "Alinhar à esquerda", shortcut: "Ctrl+Shift+L" },
  alignCenter: { label: "Centralizar", shortcut: "Ctrl+Shift+E" },
  alignRight: { label: "Alinhar à direita", shortcut: "Ctrl+Shift+R" },
  alignJustify: { label: "Justificar", shortcut: "Ctrl+Shift+J" },
  borders: {
    label: "Bordas e sombreamento",
    description: "Aplica bordas e cor de fundo ao parágrafo.",
  },
  find: { label: "Localizar", description: "Procura texto no documento." },
  replace: {
    label: "Substituir",
    description: "Substitui texto no documento.",
  },
  selectAll: {
    label: "Selecionar tudo",
    description: "Seleciona todo o conteúdo do documento.",
    shortcut: "Ctrl+A",
  },
  collapse: {
    label: "Recolher a faixa de opções",
    description: "Libera espaço vertical para o documento.",
  },
} as const satisfies Record<string, Tip>;
