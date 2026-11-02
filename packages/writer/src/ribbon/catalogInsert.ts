import type { Tip } from "./catalog";

export const INSERT_TIPS = {
  blankPage: {
    label: "Página em branco",
    description: "Insere uma página vazia no ponto do cursor.",
  },
  pageBreak: {
    label: "Quebra de página",
    description: "O texto seguinte começa em nova página na impressão.",
  },
  table: {
    label: "Tabela",
    description: "Insere uma tabela escolhendo linhas e colunas.",
  },
  rowAbove: {
    label: "Inserir linha acima",
    description: "Adiciona uma linha antes da linha atual.",
  },
  rowBelow: {
    label: "Inserir linha abaixo",
    description: "Adiciona uma linha depois da linha atual.",
  },
  columnLeft: {
    label: "Inserir coluna à esquerda",
    description: "Adiciona uma coluna antes da coluna atual.",
  },
  columnRight: {
    label: "Inserir coluna à direita",
    description: "Adiciona uma coluna depois da coluna atual.",
  },
  tableDelete: {
    label: "Excluir",
    description: "Exclui a linha, a coluna ou a tabela inteira.",
  },
  mergeCells: {
    label: "Mesclar células",
    description: "Combina as células selecionadas em uma só.",
  },
  splitCell: {
    label: "Dividir célula",
    description: "Divide a célula mesclada em células separadas.",
  },
  headerRow: {
    label: "Linha de cabeçalho",
    description: "Alterna a primeira linha como cabeçalho da tabela.",
  },
  image: {
    label: "Imagem",
    description: "Insere uma imagem de um arquivo ou de um endereço.",
  },
  imageSize: {
    label: "Tamanho da imagem",
    description: "Define a largura da imagem em relação à página.",
  },
  imageAlt: {
    label: "Texto alternativo",
    description: "Descreve a imagem para leitores de tela.",
  },
  imageDelete: {
    label: "Excluir imagem",
    description: "Remove a imagem selecionada.",
  },
  shapes: { label: "Formas", description: "Insere formas geométricas." },
  link: {
    label: "Link",
    description: "Insere ou edita um hiperlink no texto.",
  },
  unlink: {
    label: "Remover link",
    description: "Remove o hiperlink e mantém o texto.",
  },
  header: {
    label: "Cabeçalho",
    description: "Insere um cabeçalho em cada página.",
  },
  footer: { label: "Rodapé", description: "Insere um rodapé em cada página." },
  pageNumber: {
    label: "Número de página",
    description: "Numera as páginas do documento.",
  },
  textBox: {
    label: "Caixa de texto",
    description: "Insere uma caixa de texto flutuante.",
  },
  dateTime: {
    label: "Data e hora",
    description: "Insere a data e a hora atuais como texto.",
  },
  equation: { label: "Equação", description: "Insere uma equação matemática." },
  symbol: { label: "Símbolo", description: "Insere um caractere especial." },
} as const satisfies Record<string, Tip>;
