import type { Editor } from "@tiptap/react";
import { TIPS } from "../catalog";
import {
  applyStyle,
  changeCase,
  changeIndent,
  clearFormatting,
  clipboardCommand,
  FONT_FAMILIES,
  FONT_SIZE_OPTIONS,
  LINE_SPACINGS,
  pasteFromClipboard,
  setLineSpacing,
  setParagraphSpace,
  stepFontSize,
  type StyleId,
} from "../commands";
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  BordersIcon,
  BulletsIcon,
  ChangeCaseIcon,
  ChevronDownIcon,
  ClearFormattingIcon,
  CopyIcon,
  CutIcon,
  FindIcon,
  FontColorIcon,
  FontDecreaseIcon,
  FontIncreaseIcon,
  FormatPainterIcon,
  HighlightIcon,
  IndentIcon,
  ItalicIcon,
  LineSpacingIcon,
  MultilevelIcon,
  NumberingIcon,
  OutdentIcon,
  PasteIcon,
  ReplaceIcon,
  SelectAllIcon,
  StrikeIcon,
  SubscriptIcon,
  SuperscriptIcon,
  TasksIcon,
  UnderlineIcon,
} from "../icons";
import type { RibbonSnapshot } from "../useRibbonSnapshot";
import {
  ColorSplit,
  cx,
  MenuItem,
  MenuSeparator,
  RibbonButton,
  RibbonGroup,
  RibbonMenu,
  RibbonSelect,
  Row,
  Stack,
  Tooltip,
  type ColorOption,
} from "../ui";

const FONT_COLORS: ColorOption[] = [
  { name: "Preto", value: "#000000" },
  { name: "Cinza escuro", value: "#434343" },
  { name: "Cinza", value: "#666666" },
  { name: "Cinza médio", value: "#999999" },
  { name: "Prata", value: "#A7ADB4" },
  { name: "Cinza claro", value: "#CCCCCC" },
  { name: "Cinza muito claro", value: "#EFEFEF" },
  { name: "Branco", value: "#FFFFFF" },
  { name: "Vermelho", value: "#E03131" },
  { name: "Laranja", value: "#F76707" },
  { name: "Amarelo", value: "#F59F00" },
  { name: "Verde", value: "#2F9E44" },
  { name: "Ciano", value: "#1098AD" },
  { name: "Azul", value: "#356AE6" },
  { name: "Violeta", value: "#7656C8" },
  { name: "Rosa", value: "#D6336C" },
];

const HIGHLIGHT_COLORS: ColorOption[] = [
  { name: "Amarelo", value: "#FFF2A8" },
  { name: "Verde", value: "#B2F2BB" },
  { name: "Ciano", value: "#99E9F2" },
  { name: "Azul", value: "#DCE7FF" },
  { name: "Violeta", value: "#D0BFFF" },
  { name: "Rosa", value: "#FCC2D7" },
  { name: "Laranja", value: "#FFD8A8" },
  { name: "Vermelho", value: "#FFC9C9" },
];

const STYLE_TILES: { id: StyleId; label: string; sample: string }[] = [
  { id: "normal", label: "Normal", sample: "hw-rb-style-normal" },
  { id: "title1", label: "Título 1", sample: "hw-rb-style-h1" },
  { id: "title2", label: "Título 2", sample: "hw-rb-style-h2" },
  { id: "title3", label: "Título 3", sample: "hw-rb-style-h3" },
  { id: "quote", label: "Citação", sample: "hw-rb-style-quote" },
];

function isStyleActive(snap: RibbonSnapshot, id: StyleId): boolean {
  if (id === "quote") {
    return snap.blockquote;
  }

  if (id === "normal") {
    return snap.heading === 0 && !snap.blockquote;
  }

  return snap.heading === Number(id.replace("title", ""));
}

type HomeTabProps = {
  editor: Editor | null;
  snap: RibbonSnapshot;
  notify: (message: string) => void;
};

export default function HomeTab({ editor, snap, notify }: HomeTabProps) {
  const off = editor === null;

  // Executa uma ação só quando o editor existe.
  const act = (action: (current: Editor) => unknown) => () => {
    if (editor) {
      action(editor);
    }
  };

  async function paste(plainOnly: boolean) {
    if (!editor) {
      return;
    }

    const problem = await pasteFromClipboard(editor, plainOnly);

    if (problem) {
      notify(problem);
    }
  }

  function copyOrCut(kind: "cut" | "copy") {
    if (editor && !clipboardCommand(editor, kind)) {
      notify(
        "Não foi possível usar a área de transferência. Use o atalho do teclado.",
      );
    }
  }

  return (
    <>
      <RibbonGroup title="Área de Transferência">
        <RibbonMenu
          label="Colar"
          renderTrigger={({ open, toggle, ref }) => (
            <RibbonButton
              icon={PasteIcon}
              tip={TIPS.paste}
              label="Colar"
              size="large"
              hasMenu
              expanded={open}
              disabled={off}
              buttonRef={ref}
              onClick={toggle}
            />
          )}
        >
          {(close) => (
            <>
              <MenuItem
                icon={PasteIcon}
                label="Colar"
                onSelect={() => {
                  close();
                  void paste(false);
                }}
              />
              <MenuItem
                label="Colar somente texto"
                onSelect={() => {
                  close();
                  void paste(true);
                }}
              />
            </>
          )}
        </RibbonMenu>

        <Stack>
          <RibbonButton
            icon={CutIcon}
            tip={TIPS.cut}
            label="Recortar"
            disabled={off || !snap.hasSelection}
            onClick={() => copyOrCut("cut")}
          />
          <RibbonButton
            icon={CopyIcon}
            tip={TIPS.copy}
            label="Copiar"
            disabled={off || !snap.hasSelection}
            onClick={() => copyOrCut("copy")}
          />
          <RibbonButton
            icon={FormatPainterIcon}
            tip={TIPS.painter}
            label="Pincel"
            planned="Fase 1b"
          />
        </Stack>
      </RibbonGroup>

      <RibbonGroup title="Fonte">
        <Stack>
          <Row>
            <RibbonSelect
              tip={TIPS.fontFamily}
              width="wide"
              placeholder="Fonte"
              value={snap.fontFamily}
              options={FONT_FAMILIES}
              disabled={off}
              onChange={(value) =>
                editor &&
                (value
                  ? editor.chain().focus().setFontFamily(value).run()
                  : editor.chain().focus().unsetFontFamily().run())
              }
            />
            <RibbonSelect
              tip={TIPS.fontSize}
              width="narrow"
              placeholder="Tam."
              value={snap.fontSize}
              options={FONT_SIZE_OPTIONS}
              disabled={off}
              onChange={(value) =>
                editor &&
                (value
                  ? editor.chain().focus().setFontSize(value).run()
                  : editor.chain().focus().unsetFontSize().run())
              }
            />
            <RibbonButton
              icon={FontIncreaseIcon}
              tip={TIPS.fontIncrease}
              disabled={off}
              onClick={act((current) => stepFontSize(current, 1))}
            />
            <RibbonButton
              icon={FontDecreaseIcon}
              tip={TIPS.fontDecrease}
              disabled={off}
              onClick={act((current) => stepFontSize(current, -1))}
            />
            <RibbonMenu
              label="Maiúsculas e minúsculas"
              renderTrigger={({ open, toggle, ref }) => (
                <RibbonButton
                  icon={ChangeCaseIcon}
                  tip={TIPS.changeCase}
                  hasMenu
                  expanded={open}
                  disabled={off || !snap.hasSelection}
                  buttonRef={ref}
                  onClick={toggle}
                />
              )}
            >
              {(close) => (
                <>
                  {(
                    [
                      ["lower", "minúsculas"],
                      ["upper", "MAIÚSCULAS"],
                      ["title", "Colocar Cada Palavra em Maiúscula"],
                      ["toggle", "aLTERNAR mAIÚSCULAS/mINÚSCULAS"],
                    ] as const
                  ).map(([mode, label]) => (
                    <MenuItem
                      key={mode}
                      label={label}
                      onSelect={() => {
                        if (editor) {
                          changeCase(editor, mode);
                        }

                        close();
                      }}
                    />
                  ))}
                </>
              )}
            </RibbonMenu>
            <RibbonButton
              icon={ClearFormattingIcon}
              tip={TIPS.clearFormat}
              disabled={off}
              onClick={act(clearFormatting)}
            />
          </Row>

          <Row>
            <RibbonButton
              icon={BoldIcon}
              tip={TIPS.bold}
              active={snap.bold}
              disabled={off}
              onClick={act((c) => c.chain().focus().toggleBold().run())}
            />
            <RibbonButton
              icon={ItalicIcon}
              tip={TIPS.italic}
              active={snap.italic}
              disabled={off}
              onClick={act((c) => c.chain().focus().toggleItalic().run())}
            />
            <RibbonButton
              icon={UnderlineIcon}
              tip={TIPS.underline}
              active={snap.underline}
              disabled={off}
              onClick={act((c) => c.chain().focus().toggleUnderline().run())}
            />
            <RibbonButton
              icon={StrikeIcon}
              tip={TIPS.strike}
              active={snap.strike}
              disabled={off}
              onClick={act((c) => c.chain().focus().toggleStrike().run())}
            />
            <RibbonButton
              icon={SubscriptIcon}
              tip={TIPS.subscript}
              active={snap.subscript}
              disabled={off}
              onClick={act((c) => c.chain().focus().toggleSubscript().run())}
            />
            <RibbonButton
              icon={SuperscriptIcon}
              tip={TIPS.superscript}
              active={snap.superscript}
              disabled={off}
              onClick={act((c) => c.chain().focus().toggleSuperscript().run())}
            />
            <ColorSplit
              icon={FontColorIcon}
              tip={TIPS.fontColor}
              current={snap.color}
              initial="#E03131"
              palette={FONT_COLORS}
              clearLabel="Automático"
              disabled={off}
              onPick={(value) => editor?.chain().focus().setColor(value).run()}
              onClear={() => editor?.chain().focus().unsetColor().run()}
            />
            <ColorSplit
              icon={HighlightIcon}
              tip={TIPS.highlight}
              current={snap.highlight}
              initial="#FFF2A8"
              palette={HIGHLIGHT_COLORS}
              clearLabel="Sem realce"
              disabled={off}
              onPick={(value) =>
                editor?.chain().focus().setHighlight({ color: value }).run()
              }
              onClear={() => editor?.chain().focus().unsetHighlight().run()}
            />
          </Row>
        </Stack>
      </RibbonGroup>

      <RibbonGroup title="Parágrafo">
        <Stack>
          <Row>
            <RibbonButton
              icon={BulletsIcon}
              tip={TIPS.bullets}
              active={snap.bulletList}
              disabled={off}
              onClick={act((c) => c.chain().focus().toggleBulletList().run())}
            />
            <RibbonButton
              icon={NumberingIcon}
              tip={TIPS.numbering}
              active={snap.orderedList}
              disabled={off}
              onClick={act((c) => c.chain().focus().toggleOrderedList().run())}
            />
            <RibbonButton
              icon={TasksIcon}
              tip={TIPS.tasks}
              active={snap.taskList}
              disabled={off}
              onClick={act((c) => c.chain().focus().toggleTaskList().run())}
            />
            <RibbonButton
              icon={MultilevelIcon}
              tip={TIPS.multilevel}
              planned="exige estilos de lista próprios"
            />
            <RibbonButton
              icon={OutdentIcon}
              tip={TIPS.outdent}
              disabled={off}
              onClick={act((c) => changeIndent(c, -1))}
            />
            <RibbonButton
              icon={IndentIcon}
              tip={TIPS.indent}
              disabled={off}
              onClick={act((c) => changeIndent(c, 1))}
            />
          </Row>

          <Row>
            <RibbonButton
              icon={AlignLeftIcon}
              tip={TIPS.alignLeft}
              active={snap.align === "left"}
              disabled={off}
              onClick={act((c) => c.chain().focus().setTextAlign("left").run())}
            />
            <RibbonButton
              icon={AlignCenterIcon}
              tip={TIPS.alignCenter}
              active={snap.align === "center"}
              disabled={off}
              onClick={act((c) =>
                c.chain().focus().setTextAlign("center").run(),
              )}
            />
            <RibbonButton
              icon={AlignRightIcon}
              tip={TIPS.alignRight}
              active={snap.align === "right"}
              disabled={off}
              onClick={act((c) =>
                c.chain().focus().setTextAlign("right").run(),
              )}
            />
            <RibbonButton
              icon={AlignJustifyIcon}
              tip={TIPS.alignJustify}
              active={snap.align === "justify"}
              disabled={off}
              onClick={act((c) =>
                c.chain().focus().setTextAlign("justify").run(),
              )}
            />
            <RibbonMenu
              label="Espaçamento entre linhas e parágrafos"
              renderTrigger={({ open, toggle, ref }) => (
                <RibbonButton
                  icon={LineSpacingIcon}
                  tip={TIPS.lineSpacing}
                  hasMenu
                  expanded={open}
                  disabled={off}
                  buttonRef={ref}
                  onClick={toggle}
                />
              )}
            >
              {(close) => (
                <>
                  {LINE_SPACINGS.map((option) => (
                    <MenuItem
                      key={option.label}
                      label={option.label}
                      checked={snap.lineHeight === option.value}
                      onSelect={() => {
                        if (editor) {
                          setLineSpacing(editor, option.value);
                        }

                        close();
                      }}
                    />
                  ))}
                  <MenuSeparator />
                  {(
                    [
                      ["before", "12pt", "Adicionar espaço antes do parágrafo"],
                      ["after", "12pt", "Adicionar espaço depois do parágrafo"],
                      ["before", "0pt", "Remover espaço antes do parágrafo"],
                      ["after", "0pt", "Remover espaço depois do parágrafo"],
                    ] as const
                  ).map(([side, amount, label]) => (
                    <MenuItem
                      key={label}
                      label={label}
                      onSelect={() => {
                        if (editor) {
                          setParagraphSpace(editor, side, amount);
                        }

                        close();
                      }}
                    />
                  ))}
                </>
              )}
            </RibbonMenu>
            <RibbonButton
              icon={BordersIcon}
              tip={TIPS.borders}
              planned="exige atributos de bloco próprios"
            />
          </Row>
        </Stack>
      </RibbonGroup>

      <RibbonGroup title="Estilos">
        <div className="hw-rb-gallery" role="group" aria-label="Estilos">
          {STYLE_TILES.map((style) => {
            const active = isStyleActive(snap, style.id);

            return (
              <Tooltip
                key={style.id}
                tip={{
                  label: style.label,
                  description: "Aplica o estilo ao parágrafo.",
                }}
              >
                <button
                  type="button"
                  className={cx("hw-rb-style", active && "hw-rb-active")}
                  aria-pressed={active}
                  aria-disabled={off || undefined}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={
                    off ? undefined : act((c) => applyStyle(c, style.id))
                  }
                >
                  <span className={cx("hw-rb-style-sample", style.sample)}>
                    AaBbCc
                  </span>
                  <span className="hw-rb-style-name">{style.label}</span>
                </button>
              </Tooltip>
            );
          })}
        </div>

        <RibbonMenu
          label="Mais estilos"
          renderTrigger={({ open, toggle, ref }) => (
            <RibbonButton
              icon={ChevronDownIcon}
              tip={{
                label: "Mais estilos",
                description: "Mostra os demais estilos.",
              }}
              hasMenu={false}
              active={open}
              disabled={off}
              buttonRef={ref}
              onClick={toggle}
            />
          )}
        >
          {(close) => (
            <>
              <MenuItem
                label="Título 4"
                checked={snap.heading === 4}
                onSelect={() => {
                  if (editor) {
                    applyStyle(editor, "title4");
                  }

                  close();
                }}
              />
              <MenuSeparator />
              {[
                "Título do documento",
                "Subtítulo",
                "Sem espaçamento",
                "Ênfase",
              ].map((label) => (
                <MenuItem
                  key={label}
                  label={label}
                  disabled
                  note="Ainda não implementado: exige definições de estilo próprias."
                />
              ))}
            </>
          )}
        </RibbonMenu>
      </RibbonGroup>

      <RibbonGroup title="Edição">
        <Stack>
          <RibbonButton
            icon={FindIcon}
            tip={TIPS.find}
            label="Localizar"
            planned="Fase 1b"
          />
          <RibbonButton
            icon={ReplaceIcon}
            tip={TIPS.replace}
            label="Substituir"
            planned="Fase 1b"
          />
          <RibbonButton
            icon={SelectAllIcon}
            tip={TIPS.selectAll}
            label="Selecionar tudo"
            disabled={off}
            onClick={act((c) => c.chain().focus().selectAll().run())}
          />
        </Stack>
      </RibbonGroup>
    </>
  );
}
