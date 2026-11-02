import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import type { Editor } from "@tiptap/react";
import {
  STORAGE_SOFT_LIMIT,
  workspaceSize,
} from "../../services/documentStorage";
import { TIPS } from "../catalog";
import { INSERT_TIPS } from "../catalogInsert";
import {
  AltTextDialog,
  ImageUrlDialog,
  LinkDialog,
  TableDialog,
} from "../dialogs";
import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon } from "../icons";
import {
  BlankPageIcon,
  DateTimeIcon,
  DeleteIcon,
  DeleteRowIcon,
  EditIcon,
  EquationIcon,
  FooterIcon,
  HeaderIcon,
  ImageIcon,
  InsertColumnIcon,
  InsertRowIcon,
  LinkIcon,
  MergeCellsIcon,
  PageBreakIcon,
  PageNumberIcon,
  ShapesIcon,
  SplitCellIcon,
  SymbolIcon,
  TableIcon,
  TextBoxIcon,
  UnlinkIcon,
} from "../iconsInsert";
import { prepareImage } from "../imageTools";
import {
  applyLink,
  dateTimeOptions,
  deleteImage,
  insertPageBreak,
  insertPlainText,
  insertTable,
  removeLink,
  setImageAlt,
  setImageWidth,
  SYMBOLS,
} from "../insertCommands";
import {
  cx,
  MenuItem,
  MenuSeparator,
  RibbonButton,
  RibbonGroup,
  RibbonMenu,
  Row,
  Stack,
} from "../ui";
import type { RibbonSnapshot } from "../useRibbonSnapshot";

type InsertTabProps = {
  editor: Editor | null;
  snap: RibbonSnapshot;
  notify: (message: string) => void;
};

type DialogId = "table" | "link" | "imageUrl" | "alt";

const GRID_ROWS = 6;
const GRID_COLUMNS = 8;

const IMAGE_SIZES = [
  { label: "Tamanho original", value: "" },
  { label: "25% da largura", value: "25%" },
  { label: "50% da largura", value: "50%" },
  { label: "75% da largura", value: "75%" },
  { label: "100% da largura", value: "100%" },
];

// Seletor visual de linhas × colunas, como no Word.
function TableGrid({
  onPick,
}: {
  onPick: (rows: number, cols: number) => void;
}) {
  const [hover, setHover] = useState({ rows: 0, cols: 0 });
  const cells: ReactNode[] = [];

  for (let row = 1; row <= GRID_ROWS; row += 1) {
    for (let col = 1; col <= GRID_COLUMNS; col += 1) {
      const highlighted = row <= hover.rows && col <= hover.cols;

      cells.push(
        <button
          key={`${row}-${col}`}
          type="button"
          className={cx("hw-rb-gridcell", highlighted && "hw-rb-gridcell-on")}
          aria-label={`${row} linhas por ${col} colunas`}
          onMouseEnter={() => setHover({ rows: row, cols: col })}
          onFocus={() => setHover({ rows: row, cols: col })}
          onClick={() => onPick(row, col)}
        />,
      );
    }
  }

  return (
    <div className="hw-rb-tablegrid-wrap">
      <div
        className="hw-rb-tablegrid"
        onMouseLeave={() => setHover({ rows: 0, cols: 0 })}
      >
        {cells}
      </div>
      <div className="hw-rb-tablegrid-label">
        {hover.rows > 0
          ? `${hover.rows} × ${hover.cols} (linhas × colunas)`
          : "Selecione o tamanho"}
      </div>
    </div>
  );
}

export default function InsertTab({ editor, snap, notify }: InsertTabProps) {
  const [dialog, setDialog] = useState<DialogId | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const off = editor === null;

  const act = (action: (current: Editor) => unknown) => () => {
    if (editor) {
      action(editor);
    }
  };

  function closeDialog() {
    setDialog(null);
    editor?.commands.focus();
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file || !editor) {
      return;
    }

    try {
      const image = await prepareImage(file);

      if (workspaceSize() + image.src.length > STORAGE_SOFT_LIMIT) {
        notify(
          "O armazenamento local está quase cheio: a imagem não foi inserida.",
        );
        return;
      }

      editor.chain().focus().setImage({ src: image.src, alt: image.alt }).run();

      if (image.note) {
        notify(image.note);
      }
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "Não foi possível inserir a imagem.",
      );
    }
  }

  return (
    <>
      <RibbonGroup title="Páginas">
        <RibbonButton
          icon={BlankPageIcon}
          tip={INSERT_TIPS.blankPage}
          label="Página em branco"
          size="large"
          planned="exige paginação real; o editor usa uma página contínua"
        />
        <RibbonButton
          icon={PageBreakIcon}
          tip={INSERT_TIPS.pageBreak}
          label="Quebra de página"
          size="large"
          disabled={off}
          onClick={act(insertPageBreak)}
        />
      </RibbonGroup>

      <RibbonGroup title="Tabelas">
        <RibbonMenu
          label="Tabela"
          renderTrigger={({ open, toggle, ref }) => (
            <RibbonButton
              icon={TableIcon}
              tip={INSERT_TIPS.table}
              label="Tabela"
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
              <TableGrid
                onPick={(rows, cols) => {
                  close();

                  if (editor) {
                    insertTable(editor, rows, cols, true);
                  }
                }}
              />
              <MenuSeparator />
              <MenuItem
                label="Inserir tabela…"
                onSelect={() => {
                  close();
                  setDialog("table");
                }}
              />
            </>
          )}
        </RibbonMenu>
      </RibbonGroup>

      <RibbonGroup title="Ilustrações">
        <RibbonMenu
          label="Imagem"
          renderTrigger={({ open, toggle, ref }) => (
            <RibbonButton
              icon={ImageIcon}
              tip={INSERT_TIPS.image}
              label="Imagem"
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
                icon={ImageIcon}
                label="Deste computador…"
                onSelect={() => {
                  close();
                  fileInput.current?.click();
                }}
              />
              <MenuItem
                label="De um endereço (URL)…"
                onSelect={() => {
                  close();
                  setDialog("imageUrl");
                }}
              />
            </>
          )}
        </RibbonMenu>
        <input
          ref={fileInput}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          hidden
          onChange={handleFile}
        />
      </RibbonGroup>

      <RibbonGroup title="Elementos gráficos">
        <RibbonButton
          icon={ShapesIcon}
          tip={INSERT_TIPS.shapes}
          label="Formas"
          size="large"
          planned="o editor não tem modelo de desenho"
        />
      </RibbonGroup>

      <RibbonGroup title="Links">
        <RibbonButton
          icon={LinkIcon}
          tip={INSERT_TIPS.link}
          label="Link"
          size="large"
          active={snap.inLink}
          disabled={off}
          onClick={() => setDialog("link")}
        />
        <RibbonButton
          icon={UnlinkIcon}
          tip={INSERT_TIPS.unlink}
          disabled={off || !snap.inLink}
          onClick={act(removeLink)}
        />
      </RibbonGroup>

      <RibbonGroup title="Cabeçalho e Rodapé">
        <Stack>
          <RibbonButton
            icon={HeaderIcon}
            tip={INSERT_TIPS.header}
            label="Cabeçalho"
            planned="exige paginação real"
          />
          <RibbonButton
            icon={FooterIcon}
            tip={INSERT_TIPS.footer}
            label="Rodapé"
            planned="exige paginação real"
          />
          <RibbonButton
            icon={PageNumberIcon}
            tip={INSERT_TIPS.pageNumber}
            label="Nº de página"
            planned="exige paginação real"
          />
        </Stack>
      </RibbonGroup>

      <RibbonGroup title="Texto">
        <Stack>
          <RibbonButton
            icon={TextBoxIcon}
            tip={INSERT_TIPS.textBox}
            label="Caixa de texto"
            planned="o editor não tem objetos flutuantes"
          />
          <RibbonMenu
            label="Data e hora"
            renderTrigger={({ open, toggle, ref }) => (
              <RibbonButton
                icon={DateTimeIcon}
                tip={INSERT_TIPS.dateTime}
                label="Data e hora"
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
                {dateTimeOptions(new Date()).map((text) => (
                  <MenuItem
                    key={text}
                    label={text}
                    onSelect={() => {
                      if (editor) {
                        insertPlainText(editor, text);
                      }

                      close();
                    }}
                  />
                ))}
              </>
            )}
          </RibbonMenu>
          <RibbonButton
            icon={EquationIcon}
            tip={INSERT_TIPS.equation}
            label="Equação"
            planned="depende de uma extensão de matemática"
          />
        </Stack>
      </RibbonGroup>

      <RibbonGroup title="Símbolos">
        <RibbonMenu
          label="Símbolo"
          renderTrigger={({ open, toggle, ref }) => (
            <RibbonButton
              icon={SymbolIcon}
              tip={INSERT_TIPS.symbol}
              label="Símbolo"
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
            <div className="hw-rb-symbols">
              {SYMBOLS.map((symbol) => (
                <button
                  key={symbol}
                  type="button"
                  role="menuitem"
                  className="hw-rb-symbol"
                  aria-label={`Símbolo ${symbol}`}
                  onClick={() => {
                    if (editor) {
                      insertPlainText(editor, symbol);
                    }

                    close();
                  }}
                >
                  {symbol}
                </button>
              ))}
            </div>
          )}
        </RibbonMenu>
      </RibbonGroup>

      {snap.inTable && (
        <RibbonGroup title="Ferramentas de Tabela">
          <RibbonButton
            icon={InsertRowIcon}
            tip={INSERT_TIPS.rowAbove}
            label="Linha acima"
            size="large"
            onClick={act((c) => c.chain().focus().addRowBefore().run())}
          />
          <RibbonButton
            icon={InsertRowIcon}
            tip={INSERT_TIPS.rowBelow}
            label="Linha abaixo"
            size="large"
            onClick={act((c) => c.chain().focus().addRowAfter().run())}
          />
          <RibbonButton
            icon={InsertColumnIcon}
            tip={INSERT_TIPS.columnLeft}
            label="Coluna à esquerda"
            size="large"
            onClick={act((c) => c.chain().focus().addColumnBefore().run())}
          />
          <RibbonButton
            icon={InsertColumnIcon}
            tip={INSERT_TIPS.columnRight}
            label="Coluna à direita"
            size="large"
            onClick={act((c) => c.chain().focus().addColumnAfter().run())}
          />
          <RibbonMenu
            label="Excluir"
            renderTrigger={({ open, toggle, ref }) => (
              <RibbonButton
                icon={DeleteRowIcon}
                tip={INSERT_TIPS.tableDelete}
                label="Excluir"
                size="large"
                hasMenu
                expanded={open}
                buttonRef={ref}
                onClick={toggle}
              />
            )}
          >
            {(close) => (
              <>
                <MenuItem
                  label="Excluir linha"
                  onSelect={() => {
                    editor?.chain().focus().deleteRow().run();
                    close();
                  }}
                />
                <MenuItem
                  label="Excluir coluna"
                  onSelect={() => {
                    editor?.chain().focus().deleteColumn().run();
                    close();
                  }}
                />
                <MenuItem
                  label="Excluir tabela"
                  onSelect={() => {
                    editor?.chain().focus().deleteTable().run();
                    close();
                  }}
                />
              </>
            )}
          </RibbonMenu>
          <RibbonButton
            icon={MergeCellsIcon}
            tip={INSERT_TIPS.mergeCells}
            label="Mesclar"
            size="large"
            disabled={!snap.canMergeCells}
            onClick={act((c) => c.chain().focus().mergeCells().run())}
          />
          <RibbonButton
            icon={SplitCellIcon}
            tip={INSERT_TIPS.splitCell}
            label="Dividir"
            size="large"
            disabled={!snap.canSplitCell}
            onClick={act((c) => c.chain().focus().splitCell().run())}
          />
          <RibbonButton
            icon={TableIcon}
            tip={INSERT_TIPS.headerRow}
            label="Cabeçalho"
            size="large"
            onClick={act((c) => c.chain().focus().toggleHeaderRow().run())}
          />
        </RibbonGroup>
      )}

      {snap.inImage && (
        <RibbonGroup title="Ferramentas de Imagem">
          <RibbonMenu
            label="Tamanho da imagem"
            renderTrigger={({ open, toggle, ref }) => (
              <RibbonButton
                icon={ImageIcon}
                tip={INSERT_TIPS.imageSize}
                label="Tamanho"
                size="large"
                hasMenu
                expanded={open}
                buttonRef={ref}
                onClick={toggle}
              />
            )}
          >
            {(close) => (
              <>
                {IMAGE_SIZES.map((size) => (
                  <MenuItem
                    key={size.label}
                    label={size.label}
                    checked={snap.imageWidth === size.value}
                    onSelect={() => {
                      if (editor) {
                        setImageWidth(editor, size.value || null);
                      }

                      close();
                    }}
                  />
                ))}
              </>
            )}
          </RibbonMenu>
          <Stack>
            <Row>
              <RibbonButton
                icon={AlignLeftIcon}
                tip={TIPS.alignLeft}
                active={snap.align === "left"}
                onClick={act((c) =>
                  c.chain().focus().setTextAlign("left").run(),
                )}
              />
              <RibbonButton
                icon={AlignCenterIcon}
                tip={TIPS.alignCenter}
                active={snap.align === "center"}
                onClick={act((c) =>
                  c.chain().focus().setTextAlign("center").run(),
                )}
              />
              <RibbonButton
                icon={AlignRightIcon}
                tip={TIPS.alignRight}
                active={snap.align === "right"}
                onClick={act((c) =>
                  c.chain().focus().setTextAlign("right").run(),
                )}
              />
            </Row>
          </Stack>
          <RibbonButton
            icon={EditIcon}
            tip={INSERT_TIPS.imageAlt}
            label="Texto alternativo"
            size="large"
            onClick={() => setDialog("alt")}
          />
          <RibbonButton
            icon={DeleteIcon}
            tip={INSERT_TIPS.imageDelete}
            label="Excluir"
            size="large"
            onClick={act(deleteImage)}
          />
        </RibbonGroup>
      )}

      {dialog === "table" && (
        <TableDialog
          onClose={closeDialog}
          onSubmit={(rows, cols, header) => {
            if (editor) {
              insertTable(editor, rows, cols, header);
            }

            setDialog(null);
          }}
        />
      )}

      {dialog === "link" && (
        <LinkDialog
          initialHref={snap.linkHref}
          editing={snap.inLink}
          selectionEmpty={!snap.hasSelection}
          onClose={closeDialog}
          onSubmit={(href, text) => {
            if (editor) {
              applyLink(editor, href, text);
            }

            setDialog(null);
          }}
          onRemove={() => {
            if (editor) {
              removeLink(editor);
            }

            setDialog(null);
          }}
        />
      )}

      {dialog === "imageUrl" && (
        <ImageUrlDialog
          onClose={closeDialog}
          onSubmit={(src, alt) => {
            editor?.chain().focus().setImage({ src, alt }).run();
            setDialog(null);
          }}
        />
      )}

      {dialog === "alt" && (
        <AltTextDialog
          initial={snap.imageAlt}
          onClose={closeDialog}
          onSubmit={(alt) => {
            if (editor) {
              setImageAlt(editor, alt);
            }

            setDialog(null);
          }}
        />
      )}
    </>
  );
}
