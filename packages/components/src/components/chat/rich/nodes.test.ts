import { describe, expect, test } from "bun:test";
import {
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isTextNode,
  CLEAR_HISTORY_COMMAND,
  createEditor,
  HISTORY_PUSH_TAG,
  RootNode,
  UNDO_COMMAND,
  REDO_COMMAND,
} from "lexical";
import { createEmptyHistoryState, registerHistory } from "@lexical/history";
import type {
  ComposerDocument,
  ComposerReferenceNode,
} from "../Composer.types";
import type { ComposerProviderSelectionEffect } from "../ComposerProvider.types";
import {
  $applyComposerProvider,
  $claimComposerCommand,
  $composerClipboardDocument,
  $composerSelection,
  $exportComposerDocument,
  $insertComposerDocument,
  $insertComposerReference,
  $normalizeComposerCommands,
  $replaceComposerDocument,
  ComposerAtomNode,
} from "./nodes";
import { exportComposerText } from "../composer/document";

const reference: ComposerReferenceNode = {
  type: "reference",
  nodeId: "ref-one",
  providerId: "files",
  refId: "src/main.ts",
  label: "Main file",
  plainText: "src/main.ts",
};
const mixed: ComposerDocument = {
  schemaVersion: 1,
  content: [
    { type: "text", text: "Markdown **source**\n你好 " },
    reference,
    { type: "text", text: " then " },
    {
      type: "quote",
      nodeId: "quote-one",
      text: "quoted\nline",
      source: {
        providerId: "messages",
        messageId: "msg-1",
        label: "Assistant",
      },
    },
    { type: "text", text: " 末尾" },
  ],
};
function setup(document: ComposerDocument) {
  const editor = createEditor({
    nodes: [ComposerAtomNode],
    onError: (error) => {
      throw error;
    },
  });
  const history = createEmptyHistoryState();
  const cleanup = registerHistory(editor, history, 300);
  const cleanupTransform = editor.registerNodeTransform(
    RootNode,
    $normalizeComposerCommands,
  );
  const update = (action: () => void) =>
    editor.update(action, { discrete: true, tag: HISTORY_PUSH_TAG });
  update(() => $replaceComposerDocument(document));
  editor.update(
    () => {
      editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
    },
    { discrete: true },
  );
  history.current = { editor, editorState: editor.getEditorState() };
  return {
    editor,
    update,
    read: () => editor.getEditorState().read($exportComposerDocument),
    dispose: () => {
      cleanupTransform();
      cleanup();
    },
  };
}

describe("Lexical semantic Composer model", () => {
  test("round-trips ordered Markdown source, CJK, references and attributed quotes without Lexical metadata", () => {
    const instance = setup(mixed);
    expect(instance.read()).toEqual(mixed);
    const json = JSON.stringify(instance.read());
    expect(json).not.toContain("__key");
    expect(json).not.toContain("duskmoon-composer-atom");
    expect(exportComposerText(instance.read())).toBe(
      "Markdown **source**\n你好 src/main.ts then \n> quoted\n> line\n> — Assistant\n 末尾",
    );
    const parsed = instance.editor.parseEditorState(
      instance.editor.getEditorState().toJSON(),
    );
    expect(parsed.read($exportComposerDocument)).toEqual(mixed);
    instance.dispose();
  });

  test("CRLF and blank source lines survive editor round trips", () => {
    const value: ComposerDocument = {
      schemaVersion: 1,
      content: [{ type: "text", text: "first\r\n\nlast\r" }],
    };
    const instance = setup(value);
    expect(instance.read()).toEqual(value);
    instance.dispose();
  });

  test("deleting command arguments retains the claim; removing the token exits; undo and redo restore both", () => {
    const value: ComposerDocument = {
      schemaVersion: 1,
      command: { providerId: "commands", commandId: "review" },
      content: [{ type: "text", text: "/review arguments" }],
    };
    const instance = setup(value);
    instance.update(() => {
      const paragraph = $getRoot().getFirstChild();
      expect($isElementNode(paragraph)).toBe(true);
      if ($isElementNode(paragraph)) paragraph.getLastChild()?.remove();
    });
    expect(instance.read()).toEqual({
      ...value,
      content: [{ type: "text", text: "/review" }],
    });
    instance.update(() => {
      $getRoot().getFirstDescendant()?.remove();
    });
    expect(instance.read().command).toBeUndefined();
    instance.update(() => {
      instance.editor.dispatchCommand(UNDO_COMMAND, undefined);
    });
    expect(instance.read()).toEqual({
      ...value,
      content: [{ type: "text", text: "/review" }],
    });
    instance.update(() => {
      instance.editor.dispatchCommand(REDO_COMMAND, undefined);
    });
    expect(instance.read().command).toBeUndefined();
    instance.dispose();
  });

  test("reference removal is atomic and editor undo restores its occurrence identity", () => {
    const instance = setup(mixed);
    instance.update(() => {
      const paragraph = $getRoot().getFirstChild();
      const atom = $isElementNode(paragraph)
        ? paragraph
            .getChildren()
            .find((node) => node instanceof ComposerAtomNode)
        : undefined;
      expect(atom instanceof ComposerAtomNode).toBe(true);
      if (atom instanceof ComposerAtomNode) {
        atom.select(0, atom.getTextContentSize());
        const selection = $getSelection();
        if ($isRangeSelection(selection)) selection.removeText();
      }
    });
    expect(
      instance.read().content.some((node) => node.type === "reference"),
    ).toBe(false);
    instance.update(() => {
      instance.editor.dispatchCommand(UNDO_COMMAND, undefined);
    });
    expect(instance.read()).toEqual(mixed);
    instance.dispose();
  });

  test("copy selects the exact semantic range without mutating source and paste creates fresh occurrences in order", () => {
    const instance = setup(mixed);
    instance.update(() => {
      $getRoot().select(0, $getRoot().getChildrenSize());
    });
    const copied = instance.editor
      .getEditorState()
      .read($composerClipboardDocument);
    expect(copied).toEqual(mixed);
    expect(instance.read()).toEqual(mixed);
    instance.update(() => {
      $getRoot().selectEnd();
      $insertComposerDocument(copied!);
    });
    const result = instance.read();
    const atoms = result.content.filter((node) => node.type !== "text");
    expect(atoms.map((node) => node.type)).toEqual([
      "reference",
      "quote",
      "reference",
      "quote",
    ]);
    expect(new Set(atoms.map((node) => node.nodeId)).size).toBe(4);
    expect(typeof atoms[2].nodeId).toBe("string");
    expect(atoms[2]).toEqual({ ...reference, nodeId: atoms[2].nodeId });
    expect(exportComposerText(result)).toContain("src/main.ts");
    instance.dispose();
  });

  test("partial text copy uses UTF-16 selection and keeps skill source editable", () => {
    const value: ComposerDocument = {
      schemaVersion: 1,
      content: [{ type: "text", text: "/skill 你好🌙 end" }],
    };
    const instance = setup(value);
    instance.update(() => {
      const text = $getRoot().getFirstDescendant();
      if ($isTextNode(text)) text.select(7, 11);
    });
    const copied = instance.editor
      .getEditorState()
      .read($composerClipboardDocument);
    expect(copied).toEqual({
      schemaVersion: 1,
      content: [{ type: "text", text: "你好🌙" }],
    });
    expect(instance.read().command).toBeUndefined();
    instance.dispose();
  });

  test("selection maps through command tokens and line breaks into semantic text offsets", () => {
    const instance = setup({
      schemaVersion: 1,
      command: { providerId: "commands", commandId: "review" },
      content: [{ type: "text", text: "/review first\n@src" }],
    });
    instance.update(() => {
      const paragraph = $getRoot().getFirstChild();
      const last = $isElementNode(paragraph)
        ? paragraph.getLastChild()
        : undefined;
      if ($isTextNode(last)) last.selectEnd();
    });
    const selection = instance.editor.getEditorState().read($composerSelection);
    expect(selection).toEqual({ nodeIndex: 0, start: 18, end: 18 });
    instance.dispose();
  });

  test("provider replacement verifies caret and range, inserts an atomic reference once, and remains undoable", () => {
    const instance = setup({
      schemaVersion: 1,
      content: [{ type: "text", text: "Check @src" }],
    });
    const effect: ComposerProviderSelectionEffect = {
      itemId: "files:main",
      request: {
        requestId: "request",
        providerId: "files",
        query: "src",
        scope: { contextKey: "repo", conversationId: "chat" },
        documentRevision: 1,
        instanceGeneration: 0,
        trigger: { text: "@src", nodeIndex: 0, start: 6, end: 10, caret: 10 },
      },
      candidate: {
        id: "main",
        label: "Main file",
        action: { type: "insert", content: [reference] },
      },
      action: { type: "insert", content: [reference] },
    };
    instance.update(() => {
      $getRoot().selectEnd();
      expect($applyComposerProvider(effect)).toBe(true);
    });
    const inserted = instance.read().content[1];
    expect(inserted.type).toBe("reference");
    if (inserted.type !== "text") {
      expect(typeof inserted.nodeId).toBe("string");
      expect(inserted).toEqual({ ...reference, nodeId: inserted.nodeId });
    }
    instance.update(() => {
      expect($applyComposerProvider(effect)).toBe(false);
    });
    instance.update(() => {
      instance.editor.dispatchCommand(UNDO_COMMAND, undefined);
    });
    expect(exportComposerText(instance.read())).toBe("Check @src");
    instance.update(() => {
      const text = $getRoot().getFirstDescendant();
      if ($isTextNode(text)) text.select(2, 2);
      expect($applyComposerProvider(effect)).toBe(false);
    });
    instance.dispose();
  });

  test("programmatic command claiming preserves existing arguments; nonleading commands become editable source", () => {
    const instance = setup({
      schemaVersion: 1,
      content: [{ type: "text", text: "/review arguments" }],
    });
    instance.update(() => {
      $claimComposerCommand(
        { providerId: "commands", commandId: "review" },
        "/review",
      );
    });
    expect(instance.read()).toEqual({
      schemaVersion: 1,
      command: { providerId: "commands", commandId: "review" },
      content: [{ type: "text", text: "/review arguments" }],
    });
    instance.update(() => {
      $getRoot().selectStart();
      $insertComposerDocument({
        schemaVersion: 1,
        content: [{ type: "text", text: "prefix " }],
      });
    });
    expect(instance.read().command).toBeUndefined();
    expect(exportComposerText(instance.read())).toBe(
      "prefix /review arguments",
    );
    instance.dispose();
  });

  test("programmatic repeated reference insertion creates distinct occurrences rather than duplicate persistent IDs", () => {
    const instance = setup({ schemaVersion: 1, content: [] });
    instance.update(() => {
      $getRoot().selectEnd();
      $insertComposerReference(reference);
    });
    instance.update(() => {
      $getRoot().selectEnd();
      $insertComposerReference(reference);
    });
    const references = instance
      .read()
      .content.filter((node) => node.type === "reference");
    expect(references).toHaveLength(2);
    expect(references[0].nodeId).not.toBe(references[1].nodeId);
    expect(references.map((node) => node.refId)).toEqual([
      "src/main.ts",
      "src/main.ts",
    ]);
    instance.dispose();
  });
});
