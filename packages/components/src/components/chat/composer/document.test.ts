import { describe, expect, test } from "bun:test";
import type { ComposerDocument, ComposerSubmission } from "../Composer.types";
import {
  exportComposerMarkdown,
  exportComposerText,
  migrateLegacyComposerDocument,
  readComposerDocument,
  readComposerDraft,
  snapshotComposerDocument,
  snapshotComposerSubmission,
} from "./document";

const scope = { contextKey: "repository-1", conversationId: "conversation-1" };
const document: ComposerDocument = {
  schemaVersion: 1,
  content: [
    { type: "text", text: "你好 🌙 **source** " },
    {
      type: "reference",
      nodeId: "ref-1",
      providerId: "not-installed",
      refId: "file-1",
      label: "File",
      plainText: "@file",
    },
    {
      type: "quote",
      nodeId: "quote-1",
      text: "one\r\ntwo",
      source: { label: "Alice" },
    },
    { type: "text", text: "after" },
  ],
};

function submission(): ComposerSubmission {
  return {
    protocolVersion: 1,
    clientSubmissionId: "submission-1",
    scope,
    draftKey: "draft-1",
    draftRevision: 2,
    operation: "prompt",
    intent: "send",
    document,
    attachments: [
      {
        entryId: "attachment-1",
        metadata: { name: "photo.png", mediaType: "image/png", size: 12 },
        handle: {
          providerId: "uploads",
          reference: { id: "upload-1", nested: [1, { receipt: "approved" }] },
        },
      },
    ],
    options: { model: "model-1", flags: [true] },
  };
}

describe("portable semantic document", () => {
  test("legacy strings migrate without parsing commands or Markdown", () => {
    const value = "/reload-tools 你好\n**source**";
    expect(migrateLegacyComposerDocument(value)).toEqual({
      schemaVersion: 1,
      content: [{ type: "text", text: value }],
    });
    expect(readComposerDocument(value)).toMatchObject({
      status: "compatible",
      migrated: true,
    });
    expect(migrateLegacyComposerDocument("").content).toEqual([
      { type: "text", text: "" },
    ]);
  });

  test("missing providers do not invalidate or authorize a stored reference", () => {
    const result = readComposerDocument(document);
    expect(result.status).toBe("compatible");
    if (result.status === "compatible") expect(result.value).toEqual(document);
  });

  test("repeated reference targets retain separate occurrence identities", () => {
    const reference = document.content[1];
    const input = {
      schemaVersion: 1,
      content: [reference, { ...reference, nodeId: "ref-2" }],
    };
    expect(readComposerDocument(input).status).toBe("compatible");
    expect(
      readComposerDocument({ ...input, content: [reference, reference] })
        .status,
    ).toBe("incompatible");
  });

  test("quote occurrence identities cannot collide with reference identities", () => {
    expect(
      readComposerDocument({
        schemaVersion: 1,
        content: [
          document.content[1],
          { type: "quote", nodeId: "ref-1", text: "quote" },
        ],
      }).status,
    ).toBe("incompatible");
  });

  test.each([
    { schemaVersion: 2, content: [] },
    { schemaVersion: 1, content: [{ type: "future", data: "recover me" }] },
    {
      schemaVersion: 1,
      content: [{ type: "text", text: "source", future: true }],
    },
    { schemaVersion: 1, content: [], future: { preserve: true } },
    { schemaVersion: 1, content: [], command: { providerId: "commands" } },
    {
      schemaVersion: 1,
      content: [
        {
          type: "quote",
          nodeId: "q",
          text: "quote",
          source: { url: "unsupported" },
        },
      ],
    },
  ])("preserves unsupported input for recovery: %j", (input) => {
    const result = readComposerDocument(input);
    expect(result.status).toBe("incompatible");
    if (result.status === "incompatible") expect(result.input).toBe(input);
  });

  test("non-JSON runtime values, accessors and cycles are incompatible", () => {
    const cyclic: { self?: unknown } = {};
    cyclic.self = cyclic;
    const getter = Object.defineProperty({}, "schemaVersion", {
      enumerable: true,
      get() {
        throw new Error("must not execute");
      },
    });
    for (const extra of [
      new Date(),
      new Map(),
      undefined,
      NaN,
      Infinity,
      () => {},
      1n,
      cyclic,
      getter,
      new Array(2),
    ]) {
      const input = { schemaVersion: 1, content: [], extra };
      const result = readComposerDocument(input);
      expect(result.status).toBe("incompatible");
      if (result.status === "incompatible") expect(result.input).toBe(input);
    }
    const input = {
      schemaVersion: 1,
      content: [],
      [Symbol("runtime")]: "hidden",
    };
    expect(readComposerDocument(input).status).toBe("incompatible");
  });

  test("custom array methods and species cannot discard recoverable content", () => {
    let mapCalls = 0;
    let speciesCalls = 0;
    class CustomContent extends Array {
      map() {
        mapCalls++;
        return [];
      }
    }
    class SpeciesContent extends Array {
      static get [Symbol.species]() {
        speciesCalls++;
        return Array;
      }
    }
    const unsupported = { type: "future", payload: "recover me" };
    const customContent = new CustomContent();
    customContent.push(unsupported);
    const speciesContent = new SpeciesContent();
    speciesContent.push(unsupported);
    for (const content of [
      customContent,
      speciesContent,
      Object.setPrototypeOf([unsupported], null),
    ]) {
      const input = { schemaVersion: 1, content };
      const result = readComposerDocument(input);
      expect(result.status).toBe("incompatible");
      if (result.status === "incompatible") expect(result.input).toBe(input);
      expect(() => snapshotComposerDocument(input as ComposerDocument)).toThrow(
        TypeError,
      );
    }
    expect(mapCalls).toBe(0);
    expect(speciesCalls).toBe(0);
  });

  test("array index accessors are rejected without executing them", () => {
    let getterCalls = 0;
    const content: unknown[] = [];
    Object.defineProperty(content, "0", {
      enumerable: true,
      get() {
        getterCalls++;
        return { type: "text", text: "do not execute" };
      },
    });
    const input = { schemaVersion: 1, content };
    const result = readComposerDocument(input);
    expect(result.status).toBe("incompatible");
    if (result.status === "incompatible") expect(result.input).toBe(input);
    expect(getterCalls).toBe(0);
  });

  test("semantic snapshots detach and freeze all nested values", () => {
    const mutable = {
      schemaVersion: 1 as const,
      content: [
        {
          type: "quote" as const,
          nodeId: "q",
          text: "original",
          source: { label: "Alice" },
        },
      ],
    };
    const snapshot = snapshotComposerDocument(mutable);
    mutable.content[0].source.label = "changed";
    mutable.content[0].text = "changed";
    expect(snapshot.content[0]).toMatchObject({
      text: "original",
      source: { label: "Alice" },
    });
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.content)).toBe(true);
    expect(Object.isFrozen(snapshot.content[0])).toBe(true);
    expect(
      snapshot.content[0].type === "quote" &&
        Object.isFrozen(snapshot.content[0].source),
    ).toBe(true);
    expect(snapshot).not.toBe(mutable);
  });

  test("exports preserve source, reference order and quote attribution", () => {
    const expected = "你好 🌙 **source** @file\n> one\n> two\n> — Alice\nafter";
    expect(exportComposerText(document)).toBe(expected);
    expect(exportComposerMarkdown(document)).toBe(expected);
    expect(
      exportComposerText({
        schemaVersion: 1,
        content: [{ type: "text", text: "/reload-tools" }],
        command: { providerId: "commands", commandId: "reload-tools" },
      }),
    ).toBe("/reload-tools");
  });

  test("empty nodes, consecutive quotes and multiline attribution do not flatten order", () => {
    expect(
      exportComposerText({
        schemaVersion: 1,
        content: [
          {
            type: "quote",
            nodeId: "q1",
            text: "first",
            source: { label: "Alice\nmessage-1" },
          },
          { type: "text", text: "" },
          { type: "quote", nodeId: "q2", text: "second" },
          { type: "text", text: "\nnext" },
        ],
      }),
    ).toBe("> first\n> — Alice\n> message-1\n> second\nnext");
  });

  test("invalid exports fail explicitly instead of losing unsupported content", () => {
    const input = {
      schemaVersion: 1,
      content: [{ type: "future", text: "preserve" }],
    };
    expect(() =>
      exportComposerText(input as unknown as ComposerDocument),
    ).toThrow(TypeError);
  });
});

describe("versioned drafts and immutable logical submissions", () => {
  test("legacy draft migration uses the host scope, no guessed identities", () => {
    const result = readComposerDraft("草稿", { scope, draftKey: "host-key" });
    expect(result).toEqual({
      status: "compatible",
      migrated: true,
      value: {
        draftVersion: 1,
        scope,
        draftKey: "host-key",
        revision: 0,
        document: {
          schemaVersion: 1,
          content: [{ type: "text", text: "草稿" }],
        },
        attachments: [],
      },
    });
  });

  test("unsupported draft input is retained intact", () => {
    const input = { draftVersion: 999, payload: "recover" };
    const result = readComposerDraft(input, { scope, draftKey: "host-key" });
    expect(result.status).toBe("incompatible");
    if (result.status === "incompatible") expect(result.input).toBe(input);
  });

  test("filename metadata alone cannot restore a ready attachment", () => {
    const draft = {
      draftVersion: 1,
      scope,
      draftKey: "draft-1",
      revision: 2,
      document,
      attachments: [
        {
          entryId: "a1",
          metadata: { name: "file.png", mediaType: "image/png", size: 12 },
          status: "reattach",
        },
      ],
    };
    expect(
      readComposerDraft(draft, { scope, draftKey: "draft-1" }).status,
    ).toBe("compatible");
    expect(
      readComposerDraft(
        {
          ...draft,
          attachments: [{ ...draft.attachments[0], status: "ready" }],
        },
        { scope, draftKey: "draft-1" },
      ).status,
    ).toBe("incompatible");
  });

  test("submission snapshots freeze scope, options and attachment metadata/receipts", () => {
    const input = submission();
    const snapshot = snapshotComposerSubmission(input);
    expect(snapshot).toEqual(input);
    expect(snapshot.scope).not.toBe(input.scope);
    expect(snapshot.document).not.toBe(input.document);
    expect(snapshot.attachments[0].metadata).not.toBe(
      input.attachments[0].metadata,
    );
    expect(Object.isFrozen(snapshot.attachments[0].handle.reference)).toBe(
      true,
    );
    expect(Object.isFrozen(snapshot.options.flags)).toBe(true);
    expect(Object.isFrozen(snapshot.attachments[0].metadata)).toBe(true);
  });

  test("steering requires a target and command operations require a claim", () => {
    const input = submission();
    for (const invalid of [
      { ...input, intent: "steer" },
      { ...input, intent: "send", targetTurnId: "unrelated-turn" },
      { ...input, operation: "command" },
      { ...input, protocolVersion: 2 },
      { ...input, draftRevision: -1 },
      { ...input, options: { binary: new Uint8Array([1]) } },
      { ...input, attachments: [input.attachments[0], input.attachments[0]] },
    ])
      expect(() =>
        snapshotComposerSubmission(invalid as ComposerSubmission),
      ).toThrow(TypeError);
  });

  test("exotic nested draft and submission arrays cannot bypass JSON snapshots", () => {
    class DroppingArray extends Array {
      map() {
        return [];
      }
    }
    const attachments = new DroppingArray();
    attachments.push({ file: "unsupported local handle" });
    const draft = {
      draftVersion: 1,
      scope,
      draftKey: "draft-1",
      revision: 2,
      document,
      attachments,
    };
    const result = readComposerDraft(draft, { scope, draftKey: "draft-1" });
    expect(result.status).toBe("incompatible");
    if (result.status === "incompatible") expect(result.input).toBe(draft);
    const input = submission();
    const runtimeValues = new DroppingArray();
    runtimeValues.push(new Date());
    expect(() =>
      snapshotComposerSubmission({
        ...input,
        options: { hiddenRuntime: runtimeValues },
      }),
    ).toThrow(TypeError);
    expect(attachments).toHaveLength(1);
  });
});
