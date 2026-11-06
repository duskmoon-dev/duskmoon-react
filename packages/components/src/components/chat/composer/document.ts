import type {
  ComposerDocument,
  ComposerDraft,
  ComposerJson,
  ComposerScope,
  ComposerSubmission,
} from "../Composer.types";

export type ComposerReadResult<T> =
  | {
      readonly status: "compatible";
      readonly value: T;
      readonly migrated: boolean;
    }
  | {
      readonly status: "incompatible";
      readonly input: unknown;
      readonly reason: string;
    };

type JsonObject = { readonly [key: string]: ComposerJson };

function object(value: ComposerJson): value is JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function keys(
  value: JsonObject,
  required: readonly string[],
  optional: readonly string[] = [],
): boolean {
  return (
    required.every((key) => Object.hasOwn(value, key)) &&
    Object.keys(value).every(
      (key) => required.includes(key) || optional.includes(key),
    )
  );
}

function identity(value: ComposerJson | undefined): value is string {
  return typeof value === "string" && value.length > 0;
}

function revision(value: ComposerJson | undefined): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

/** Reject anything JSON cannot retain, including accessors, sparse arrays and cycles. */
function copyJson(value: unknown, ancestors = new Set<object>()): ComposerJson {
  if (value === null || typeof value === "string" || typeof value === "boolean")
    return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "object" || value === null)
    throw new TypeError("Expected JSON data");
  if (ancestors.has(value))
    throw new TypeError("Cyclic data is not portable JSON");
  const prototype = Object.getPrototypeOf(value);
  if (Array.isArray(value) && prototype !== Array.prototype) {
    throw new TypeError("Only plain JSON arrays are supported");
  }
  if (
    !Array.isArray(value) &&
    prototype !== Object.prototype &&
    prototype !== null
  ) {
    throw new TypeError("Only plain JSON objects are supported");
  }
  ancestors.add(value);
  try {
    const descriptors = Object.getOwnPropertyDescriptors(value);
    if (Reflect.ownKeys(value).some((key) => typeof key !== "string"))
      throw new TypeError("Symbol fields are not portable JSON");
    for (const [key, descriptor] of Object.entries(descriptors)) {
      if (Array.isArray(value) && key === "length") continue;
      if (!descriptor.enumerable || !("value" in descriptor))
        throw new TypeError("Non-JSON property descriptor");
    }
    if (Array.isArray(value)) {
      if (
        Object.keys(value).length !== value.length ||
        Object.keys(value).some((key, index) => key !== String(index))
      ) {
        throw new TypeError(
          "Sparse arrays or array properties are not portable JSON",
        );
      }
      const result: ComposerJson[] = [];
      for (let index = 0; index < value.length; index++) {
        result.push(copyJson(descriptors[String(index)].value, ancestors));
      }
      return Object.freeze(result);
    }
    const result: Record<string, ComposerJson> = {};
    for (const [key, descriptor] of Object.entries(descriptors)) {
      Object.defineProperty(result, key, {
        value: copyJson(descriptor.value, ancestors),
        enumerable: true,
      });
    }
    return Object.freeze(result);
  } finally {
    ancestors.delete(value);
  }
}

/** Internal portable-data boundary shared by the lifecycle adapters. */
export function snapshotComposerJson(value: unknown): ComposerJson {
  return copyJson(value);
}

function validScope(value: ComposerJson | undefined): boolean {
  return (
    value !== undefined &&
    object(value) &&
    keys(value, ["contextKey", "conversationId"]) &&
    identity(value.contextKey) &&
    identity(value.conversationId)
  );
}

function validCommand(value: ComposerJson | undefined): boolean {
  return (
    value !== undefined &&
    object(value) &&
    keys(value, ["providerId", "commandId"]) &&
    identity(value.providerId) &&
    identity(value.commandId)
  );
}

function validDocument(value: ComposerJson): boolean {
  if (
    !object(value) ||
    !keys(value, ["schemaVersion", "content"], ["command"]) ||
    value.schemaVersion !== 1 ||
    !Array.isArray(value.content)
  )
    return false;
  if (Object.hasOwn(value, "command") && !validCommand(value.command))
    return false;
  const ids = new Set<string>();
  return value.content.every((node) => {
    if (!object(node)) return false;
    if (node.type === "text")
      return keys(node, ["type", "text"]) && typeof node.text === "string";
    if (!identity(node.nodeId) || ids.has(node.nodeId)) return false;
    ids.add(node.nodeId);
    if (node.type === "reference") {
      return (
        keys(node, [
          "type",
          "nodeId",
          "providerId",
          "refId",
          "label",
          "plainText",
        ]) &&
        identity(node.providerId) &&
        identity(node.refId) &&
        typeof node.label === "string" &&
        typeof node.plainText === "string"
      );
    }
    if (node.type === "quote") {
      if (
        !keys(node, ["type", "nodeId", "text"], ["source"]) ||
        typeof node.text !== "string"
      )
        return false;
      if (!Object.hasOwn(node, "source")) return true;
      return (
        node.source !== undefined &&
        object(node.source) &&
        keys(
          node.source,
          [],
          ["providerId", "refId", "label", "messageId", "conversationId"],
        ) &&
        Object.values(node.source).every((field) => typeof field === "string")
      );
    }
    return false;
  });
}

function validMetadata(value: ComposerJson | undefined): boolean {
  return (
    value !== undefined &&
    object(value) &&
    keys(value, ["name", "mediaType", "size"], ["lastModified"]) &&
    typeof value.name === "string" &&
    typeof value.mediaType === "string" &&
    revision(value.size) &&
    (!Object.hasOwn(value, "lastModified") || revision(value.lastModified))
  );
}

function validHandle(value: ComposerJson | undefined): boolean {
  return (
    value !== undefined &&
    object(value) &&
    keys(value, ["providerId", "reference"]) &&
    identity(value.providerId)
  );
}

function validAttachments(
  value: ComposerJson | undefined,
  draft: boolean,
): boolean {
  if (!Array.isArray(value)) return false;
  const ids = new Set<string>();
  return value.every((entry) => {
    if (
      !object(entry) ||
      !identity(entry.entryId) ||
      ids.has(entry.entryId) ||
      !validMetadata(entry.metadata)
    )
      return false;
    ids.add(entry.entryId);
    if (!draft)
      return (
        keys(entry, ["entryId", "metadata", "handle"]) &&
        validHandle(entry.handle)
      );
    return entry.status === "reattach"
      ? keys(entry, ["entryId", "metadata", "status"])
      : entry.status === "ready" &&
          keys(entry, ["entryId", "metadata", "status", "handle"]) &&
          validHandle(entry.handle);
  });
}

function read<T>(
  input: unknown,
  validate: (value: ComposerJson) => boolean,
  reason: string,
): ComposerReadResult<T> {
  try {
    const value = copyJson(input);
    if (!validate(value)) return { status: "incompatible", input, reason };
    return { status: "compatible", value: value as T, migrated: false };
  } catch (error) {
    return {
      status: "incompatible",
      input,
      reason: error instanceof Error ? error.message : reason,
    };
  }
}

/** A legacy string always becomes exactly one editable text node, even if empty. */
export function migrateLegacyComposerDocument(text: string): ComposerDocument {
  return Object.freeze({
    schemaVersion: 1,
    content: Object.freeze([Object.freeze({ type: "text", text })]),
  });
}

/** Unknown versions, fields and nodes remain available as the original input. */
export function readComposerDocument(
  input: unknown,
): ComposerReadResult<ComposerDocument> {
  if (typeof input === "string")
    return {
      status: "compatible",
      value: migrateLegacyComposerDocument(input),
      migrated: true,
    };
  return read(
    input,
    validDocument,
    "Unsupported or invalid ComposerDocument v1",
  );
}

/** Snapshot before asynchronous work; never retain the caller's nested objects. */
export function snapshotComposerDocument(
  document: ComposerDocument,
): ComposerDocument {
  const result = read(
    document,
    validDocument,
    "Unsupported or invalid ComposerDocument v1",
  );
  if (result.status === "incompatible") throw new TypeError(result.reason);
  return result.value as ComposerDocument;
}

export function readComposerDraft(
  input: unknown,
  legacy: { readonly scope: ComposerScope; readonly draftKey: string },
): ComposerReadResult<ComposerDraft> {
  const migrated = typeof input === "string";
  const candidate = migrated
    ? {
        draftVersion: 1,
        scope: legacy.scope,
        draftKey: legacy.draftKey,
        revision: 0,
        document: migrateLegacyComposerDocument(input),
        attachments: [],
      }
    : input;
  const result = read<ComposerDraft>(
    candidate,
    (value) =>
      object(value) &&
      keys(value, [
        "draftVersion",
        "scope",
        "draftKey",
        "revision",
        "document",
        "attachments",
      ]) &&
      value.draftVersion === 1 &&
      validScope(value.scope) &&
      identity(value.draftKey) &&
      revision(value.revision) &&
      value.document !== undefined &&
      validDocument(value.document) &&
      validAttachments(value.attachments, true),
    "Unsupported or invalid ComposerDraft v1",
  );
  return result.status === "compatible"
    ? { ...result, migrated }
    : { ...result, input };
}

export function snapshotComposerSubmission(
  submission: ComposerSubmission,
): ComposerSubmission {
  const result = read<ComposerSubmission>(
    submission,
    (value) => {
      if (
        !object(value) ||
        !keys(
          value,
          [
            "protocolVersion",
            "clientSubmissionId",
            "scope",
            "draftKey",
            "draftRevision",
            "operation",
            "document",
            "attachments",
            "options",
          ],
          ["intent", "targetTurnId"],
        ) ||
        value.protocolVersion !== 1 ||
        !identity(value.clientSubmissionId) ||
        !validScope(value.scope) ||
        !identity(value.draftKey) ||
        !revision(value.draftRevision) ||
        value.document === undefined ||
        !validDocument(value.document) ||
        !validAttachments(value.attachments, false) ||
        value.options === undefined ||
        !object(value.options)
      )
        return false;
      if (value.operation === "command")
        return (
          object(value.document) &&
          validCommand(value.document.command) &&
          !Object.hasOwn(value, "intent") &&
          !Object.hasOwn(value, "targetTurnId")
        );
      if (value.operation !== "prompt") return false;
      return value.intent === "steer"
        ? identity(value.targetTurnId)
        : (value.intent === "send" || value.intent === "follow_up") &&
            !Object.hasOwn(value, "targetTurnId");
    },
    "Unsupported or invalid ComposerSubmission v1",
  );
  if (result.status === "incompatible") throw new TypeError(result.reason);
  return result.value;
}

/**
 * Deterministic readable export, not reference resolution or a submission adapter.
 * Text/Markdown source is unchanged; references use plainText. Quotes occupy
 * ordered blocks: each line starts `> `, followed by `> — source.label` when set.
 * Quote line endings normalize to LF; other text retains its original bytes.
 * Command identity adds no text: the leading editable source already contains it.
 */
export function exportComposerText(document: ComposerDocument): string {
  const snapshot = snapshotComposerDocument(document);
  let output = "";
  let afterQuote = false;
  for (const node of snapshot.content) {
    const text = node.type === "reference" ? node.plainText : node.text;
    if (node.type === "quote") {
      if (output && !output.endsWith("\n")) output += "\n";
      output += text
        .split(/\r\n|\r|\n/)
        .map((line) => `> ${line}`)
        .join("\n");
      if (node.source?.label) {
        output +=
          "\n" +
          node.source.label
            .split(/\r\n|\r|\n/)
            .map((line, index) => `> ${index === 0 ? "— " : ""}${line}`)
            .join("\n");
      }
      afterQuote = true;
    } else {
      if (
        afterQuote &&
        text &&
        !text.startsWith("\n") &&
        !text.startsWith("\r")
      )
        output += "\n";
      output += text;
      if (text) afterQuote = false;
    }
  }
  return output;
}

/** Markdown stays editable source; quote blocks use the same readable projection. */
export const exportComposerMarkdown = exportComposerText;
