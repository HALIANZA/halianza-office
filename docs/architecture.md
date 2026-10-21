# HALIANZA Office — Arquitetura

## 1. Visão geral

HALIANZA Office é um ecossistema de produtividade desktop para Linux
e Windows, desenvolvido com uma arquitetura modular.

O repositório utiliza uma organização de monorepo para reunir a
aplicação desktop, os produtos e os componentes compartilhados.

## 2. Aplicação central

`apps/desktop` será a aplicação desktop principal.

Responsabilidades:
- Inicialização do HALIANZA Office.
- Navegação entre produtos.
- Acesso a documentos recentes.
- Configurações gerais.
- Integração com recursos nativos por meio do Tauri.
- Carregamento dos módulos de cada produto.

## 3. Produtos

Os seguintes produtos serão desenvolvidos como módulos independentes:

- Writer: edição de documentos.
- Slides: criação e edição de apresentações.
- Sheets: edição de planilhas.
- Mail: e-mail e calendário.
- Teams: mensagens e reuniões.
- Drive: gerenciamento e sincronização de arquivos.
- Notes: anotações digitais.

Os módulos devem manter limites claros e evitar dependências
diretas entre as implementações internas de produtos diferentes.

## 4. Pacotes compartilhados

- `packages/ui`: componentes de interface reutilizáveis.
- `packages/design-tokens`: cores, tipografia, espaçamentos e temas.
- `packages/shared`: tipos, contratos e utilitários comuns.

Pacotes adicionais, como autenticação e armazenamento, serão criados
quando os requisitos estiverem definidos.

## 5. Tecnologias

- React
- TypeScript
- Vite
- Tauri 2
- Rust
- npm workspaces para gerenciamento do monorepo

A aplicação desktop continuará sendo a entrada principal. Os produtos
não precisam de instâncias independentes de Tauri para funcionar.

## 6. Estratégia de migração

A migração ocorrerá em etapas:

1. Registrar e validar a arquitetura.
2. Configurar o monorepo sem interromper o build atual.
3. Migrar a aplicação existente para `apps/desktop`.
4. Extrair o Writer para seu módulo.
5. Criar a base do Slides e definir contratos compartilhados.
6. Adicionar os demais produtos progressivamente.
7. Validar builds e testes após cada etapa.

Nenhum arquivo deve ser removido antes de confirmar que sua
funcionalidade foi preservada.

## 7. Desenvolvimento colaborativo

Cada produto deve ter uma área de responsabilidade clara.
Alterações em componentes compartilhados devem ser revisadas e
integradas de forma coordenada.

O desenvolvimento do Slides deve ocorrer sem sobrescrever ou
modificar diretamente a implementação interna do Writer.

## 8. Princípios

- Preservar o funcionamento existente.
- Priorizar uma experiência integrada.
- Compartilhar código apenas quando houver uma abstração útil.
- Evitar dependências desnecessárias.
- Manter a possibilidade de distribuir produtos separadamente no futuro.
- Validar cada etapa com build e testes.
