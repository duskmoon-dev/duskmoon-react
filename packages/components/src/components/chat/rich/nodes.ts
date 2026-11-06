import {
  $applyNodeReplacement,
  $createLineBreakNode,
  $createParagraphNode,
  $createRangeSelection,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isLineBreakNode,
  $isRangeSelection,
  $isTextNode,
  $setSelection,
  TextNode,
  type LexicalNode,
  type NodeKey,
  type PointType,
  type SerializedTextNode,
} from "lexical";
import type {
  ComposerCommand,
  ComposerDocument,
  ComposerNode,
  ComposerQuoteNode,
  ComposerReferenceNode,
} from "../Composer.types";
import type {
  ComposerProviderSelection,
  ComposerProviderSelectionEffect,
} from "../ComposerProvider.types";
import { snapshotComposerDocument } from "../composer/document";

type Atom =
  | { readonly kind: "reference"; readonly value: ComposerReferenceNode }
  | { readonly kind: "quote"; readonly value: ComposerQuoteNode }
  | {
      readonly kind: "command";
      readonly value: ComposerCommand;
      readonly source: string;
    };
type SerializedAtom = SerializedTextNode & { readonly atom: Atom };

function atomText(atom: Atom) {
  return atom.kind === "command"
    ? atom.source
    : atom.kind === "reference"
      ? atom.value.label || atom.value.plainText || atom.value.refId
      : atom.value.text || "\uFFFC";
}

/** Private Lexical token. Portable types contain no editor classes, keys or JSON. */
export class ComposerAtomNode extends TextNode {
  readonly __atom: Atom;

  static getType() {
    return "duskmoon-composer-atom";
  }
  static clone(node: ComposerAtomNode) {
    const clone = new ComposerAtomNode(node.__atom, node.__key);
    clone.__mode = node.__mode;
    clone.__format = node.__format;
    clone.__style = node.__style;
    clone.__detail = node.__detail;
    return clone;
  }
  static importJSON(serialized: SerializedAtom) {
    return $createComposerAtom(serialized.atom);
  }

  constructor(atom: Atom, key?: NodeKey) {
    super(atomText(atom), key);
    this.__atom = atom;
  }

  exportJSON(): SerializedAtom {
    return {
      ...super.exportJSON(),
      type: ComposerAtomNode.getType(),
      version: 1,
      atom: this.getLatest().__atom,
    };
  }
  createDOM(): HTMLElement {
    const atom = this.__atom;
    const element = document.createElement("span");
    element.dataset.composerKind = atom.kind;
    if (atom.kind === "quote") {
      element.className = "chat-composer-quote";
      element.dataset.nodeId = atom.value.nodeId;
      const text = document.createElement("span");
      text.className = "chat-composer-quote-text";
      text.textContent = atom.value.text;
      element.append(text);
      if (atom.value.source?.label) {
        const source = document.createElement("span");
        source.contentEditable = "false";
        source.textContent = atom.value.source.label;
        element.append(source);
      }
      element.setAttribute(
        "aria-label",
        atom.value.source?.label
          ? `Quote from ${atom.value.source.label}`
          : "Quote",
      );
    } else {
      element.className = "chip chat-composer-reference";
      const label = document.createElement("span");
      label.className = "chat-composer-label";
      label.textContent = atomText(atom);
      element.append(label);
      if (atom.kind === "reference") {
        element.dataset.nodeId = atom.value.nodeId;
        element.title = atom.value.plainText;
        element.setAttribute(
          "aria-label",
          `Reference: ${atom.value.label || atom.value.refId}`,
        );
      } else element.setAttribute("aria-label", `Command: ${atom.source}`);
    }
    return element;
  }
  updateDOM(previous: this) {
    return previous.__atom !== this.__atom;
  }
  getDOMSlot(element: HTMLElement) {
    // TextNode owns precisely this text DOM. Attribution is a presentation
    // sibling; it must not become an editor offset or clipboard source.
    return super.getDOMSlot(element.firstElementChild as HTMLElement);
  }
  isTextEntity() {
    return true;
  }
  canInsertTextBefore() {
    return false;
  }
  canInsertTextAfter() {
    return false;
  }
}

function $createComposerAtom(atom: Atom) {
  if (atom.kind === "command") {
    if (!atom.source || /\s/u.test(atom.source))
      throw new TypeError("A command token needs one nonempty source word");
    const document = snapshotComposerDocument({
      schemaVersion: 1,
      content: [],
      command: atom.value,
    });
    atom = { ...atom, value: document.command! };
  } else {
    const document = snapshotComposerDocument({
      schemaVersion: 1,
      content: [atom.value],
    });
    atom = { ...atom, value: document.content[0] } as Atom;
  }
  return $applyNodeReplacement(
    new ComposerAtomNode(Object.freeze(atom)),
  ).setMode("token");
}

let nextOccurrence = 0;
function occurrenceId() {
  return `composer-node-${globalThis.crypto?.randomUUID?.() ?? ++nextOccurrence}`;
}

function textNodes(text: string): LexicalNode[] {
  const result: LexicalNode[] = [];
  text.split("\n").forEach((line, index) => {
    if (index > 0) result.push($createLineBreakNode());
    if (line) result.push($createTextNode(line));
  });
  return result;
}

function $nodesForDocument(document: ComposerDocument, fresh = false) {
  const result: LexicalNode[] = [];
  document.content.forEach((node, index) => {
    if (node.type === "text") {
      let text = node.text;
      if (index === 0 && document.command) {
        const source = /^\S+/u.exec(text)?.[0];
        if (!source)
          throw new TypeError(
            "A claimed command requires a leading source token",
          );
        result.push(
          $createComposerAtom({
            kind: "command",
            value: document.command,
            source,
          }),
        );
        text = text.slice(source.length);
      }
      result.push(...textNodes(text));
    } else {
      const value = fresh ? { ...node, nodeId: occurrenceId() } : node;
      result.push(
        $createComposerAtom(
          value.type === "reference"
            ? { kind: "reference", value }
            : { kind: "quote", value },
        ),
      );
    }
  });
  if (document.command && document.content[0]?.type !== "text")
    throw new TypeError("A claimed command requires a leading source token");
  return result;
}

/** Explicit host replacements preserve occurrence IDs and start a new history policy. */
export function $replaceComposerDocument(value: ComposerDocument) {
  const document = snapshotComposerDocument(value);
  const children = $nodesForDocument(document);
  const paragraph = $createParagraphNode();
  paragraph.append(...children);
  $getRoot().clear().append(paragraph);
}

interface Segment {
  readonly node?: LexicalNode;
  readonly start: number;
  readonly end: number;
  readonly documentIndex: number;
  readonly textOffset: number;
  readonly value: ComposerNode;
  readonly command?: ComposerCommand;
}

function $layout() {
  const content: ComposerNode[] = [];
  const segments: Segment[] = [];
  let position = 0;
  let command: ComposerCommand | undefined;
  function appendText(
    text: string,
    node?: LexicalNode,
    claim?: ComposerCommand,
  ) {
    const previous = content.at(-1);
    const offset = previous?.type === "text" ? previous.text.length : 0;
    const value = { type: "text" as const, text };
    if (previous?.type === "text")
      content[content.length - 1] = {
        type: "text",
        text: previous.text + text,
      };
    else content.push(value);
    segments.push({
      node,
      start: position,
      end: position + text.length,
      documentIndex: content.length - 1,
      textOffset: offset,
      value,
      command: claim,
    });
    position += text.length;
  }
  function visit(node: LexicalNode) {
    if (node instanceof ComposerAtomNode) {
      const atom = node.getLatest().__atom;
      if (atom.kind === "command") {
        if (position === 0) command = atom.value;
        appendText(atom.source, node, atom.value);
      } else {
        content.push(atom.value);
        segments.push({
          node,
          start: position,
          end: position + 1,
          documentIndex: content.length - 1,
          textOffset: 0,
          value: atom.value,
        });
        position++;
      }
    } else if ($isTextNode(node)) appendText(node.getTextContent(), node);
    else if ($isLineBreakNode(node)) appendText("\n", node);
    else if ($isElementNode(node)) node.getChildren().forEach(visit);
    else throw new TypeError("Unsupported node in the Composer editing model");
  }
  $getRoot()
    .getChildren()
    .forEach((node, index) => {
      if (index > 0) appendText("\n");
      visit(node);
    });
  if (!content.length) content.push({ type: "text", text: "" });
  return {
    document: snapshotComposerDocument({
      schemaVersion: 1,
      content,
      ...(command ? { command } : {}),
    }),
    segments,
    length: position,
  };
}

export function $exportComposerDocument() {
  return $layout().document;
}

function pointPosition(point: PointType, layout: ReturnType<typeof $layout>) {
  const node = point.getNode();
  const segment = layout.segments.find(
    (entry) => entry.node?.getKey() === node.getKey(),
  );
  if (segment)
    return (
      segment.start +
      (node instanceof ComposerAtomNode
        ? point.offset === 0
          ? 0
          : segment.end - segment.start
        : Math.min(point.offset, segment.end - segment.start))
    );
  if (!$isElementNode(node)) return null;
  const child = node.getChildAtIndex(point.offset);
  if (child) {
    const first = layout.segments.find(
      (entry) =>
        entry.node && (entry.node.is(child) || child.isParentOf(entry.node)),
    );
    if (first) return first.start;
  }
  const descendants = layout.segments.filter(
    (entry) => entry.node && node.isParentOf(entry.node),
  );
  return descendants.at(-1)?.end ?? 0;
}

/** Caret/range data stays local to this adapter and is relative to semantic text. */
export function $composerSelection(): ComposerProviderSelection | null {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return null;
  const layout = $layout();
  const anchor = pointPosition(selection.anchor, layout);
  const focus = pointPosition(selection.focus, layout);
  if (anchor === null || focus === null) return null;
  if (!layout.length) return { nodeIndex: 0, start: 0, end: 0 };
  const find = (position: number) =>
    layout.segments.find(
      (entry) =>
        entry.value.type === "text" &&
        !(entry.node instanceof ComposerAtomNode) &&
        position >= entry.start &&
        position <= entry.end,
    );
  const start = find(anchor);
  const end = find(focus);
  if (!start || !end || start.documentIndex !== end.documentIndex) return null;
  return {
    nodeIndex: start.documentIndex,
    start: Math.min(
      start.textOffset + anchor - start.start,
      end.textOffset + focus - end.start,
    ),
    end: Math.max(
      start.textOffset + anchor - start.start,
      end.textOffset + focus - end.start,
    ),
  };
}

/** A command only has meaning in the first position; moving it elsewhere leaves source text. */
export function $normalizeComposerCommands() {
  const { segments } = $layout();
  for (const segment of segments)
    if (segment.command && segment.start !== 0 && segment.node)
      segment.node.replace(
        $createTextNode(
          segment.value.type === "text" ? segment.value.text : "",
        ),
      );
}

function $selectionOrEnd() {
  const selection = $getSelection();
  return $isRangeSelection(selection) ? selection : $getRoot().selectEnd();
}

/** Pasted occurrences are always new. Programmatic insertion also avoids existing IDs. */
export function $insertComposerDocument(value: ComposerDocument, fresh = true) {
  const document = snapshotComposerDocument(value);
  const nodes = $nodesForDocument(document, fresh);
  const selection = $selectionOrEnd();
  selection.insertNodes(nodes);
}

export function $insertComposerReference(reference: ComposerReferenceNode) {
  const document = $exportComposerDocument();
  const duplicate = document.content.some(
    (node) => node.type !== "text" && node.nodeId === reference.nodeId,
  );
  $insertComposerDocument(
    { schemaVersion: 1, content: [reference] },
    duplicate,
  );
}

export function $insertComposerQuote(quote: ComposerQuoteNode) {
  const duplicate = $exportComposerDocument().content.some(
    (node) => node.type !== "text" && node.nodeId === quote.nodeId,
  );
  $insertComposerDocument({ schemaVersion: 1, content: [quote] }, duplicate);
}

export function $claimComposerCommand(
  command: ComposerCommand,
  source: string,
) {
  const token = $createComposerAtom({
    kind: "command",
    value: command,
    source,
  });
  const root = $getRoot();
  const firstBlock = root.getFirstChild();
  const paragraph = $isElementNode(firstBlock)
    ? firstBlock
    : $createParagraphNode();
  if (!firstBlock) root.append(paragraph);
  const first = paragraph.getFirstChild();
  if (first instanceof ComposerAtomNode && first.__atom.kind === "command")
    first.replace(token);
  else if (
    $isTextNode(first) &&
    first.getTextContent().startsWith(source) &&
    (first.getTextContent().length === source.length ||
      /\s/u.test(first.getTextContent()[source.length]))
  ) {
    const [leading] = first.splitText(source.length);
    leading.replace(token);
  } else if (first) {
    first.insertBefore(token);
    if (!$isTextNode(first) || !/^\s/u.test(first.getTextContent()))
      token.insertAfter($createTextNode(" "));
  } else paragraph.append(token);
  token.selectEnd();
}

/** Validates both the live caret and captured semantic range before one editor transaction. */
export function $applyComposerProvider(
  effect: ComposerProviderSelectionEffect,
) {
  if (effect.action.type !== "insert") return false;
  const current = $composerSelection();
  const trigger = effect.request.trigger;
  if (
    !current ||
    current.start !== current.end ||
    current.nodeIndex !== trigger.nodeIndex ||
    current.end !== trigger.caret
  )
    return false;
  const layout = $layout();
  const node = layout.document.content[trigger.nodeIndex];
  if (
    node?.type !== "text" ||
    trigger.start < 0 ||
    trigger.end > node.text.length ||
    trigger.start > trigger.end ||
    node.text.slice(trigger.start, trigger.end) !== trigger.text
  )
    return false;
  if (effect.action.command && (trigger.nodeIndex !== 0 || trigger.start !== 0))
    return false;
  function point(offset: number, end: boolean) {
    const entries = layout.segments.filter(
      (entry) =>
        entry.documentIndex === trigger.nodeIndex &&
        entry.node &&
        $isTextNode(entry.node) &&
        !(entry.node instanceof ComposerAtomNode),
    );
    const order = end ? entries : [...entries].reverse();
    const entry = order.find(
      (candidate) =>
        offset >= candidate.textOffset &&
        offset <= candidate.textOffset + candidate.end - candidate.start,
    );
    return entry && $isTextNode(entry.node)
      ? { node: entry.node, offset: offset - entry.textOffset }
      : undefined;
  }
  const start = point(trigger.start, false);
  const end = point(trigger.end, true);
  if (!start || !end) return false;
  const replacement = snapshotComposerDocument({
    schemaVersion: 1,
    content: effect.action.content,
    ...(effect.action.command ? { command: effect.action.command } : {}),
  });
  const inserted = $nodesForDocument(replacement, true);
  const selection = $createRangeSelection();
  selection.setTextNodeRange(start.node, start.offset, end.node, end.offset);
  $setSelection(selection);
  selection.insertNodes(inserted);
  return true;
}

/** Copy the semantic range without splitting/mutating the live editor merely to copy. */
export function $composerClipboardDocument(): ComposerDocument | null {
  const selection = $getSelection();
  if (!$isRangeSelection(selection) || selection.isCollapsed()) return null;
  const layout = $layout();
  const a = pointPosition(selection.anchor, layout);
  const b = pointPosition(selection.focus, layout);
  if (a === null || b === null) return null;
  const start = Math.min(a, b);
  const end = Math.max(a, b);
  const content: ComposerNode[] = [];
  let command: ComposerCommand | undefined;
  for (const segment of layout.segments) {
    if (segment.start >= end || segment.end <= start) continue;
    if (segment.value.type !== "text") content.push(segment.value);
    else {
      const text = segment.value.text.slice(
        Math.max(0, start - segment.start),
        Math.min(segment.value.text.length, end - segment.start),
      );
      const previous = content.at(-1);
      if (previous?.type === "text")
        content[content.length - 1] = {
          type: "text",
          text: previous.text + text,
        };
      else content.push({ type: "text", text });
      if (segment.command && start <= segment.start && end >= segment.end)
        command = segment.command;
    }
  }
  return snapshotComposerDocument({
    schemaVersion: 1,
    content,
    ...(command ? { command } : {}),
  });
}
