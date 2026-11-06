import { afterEach, describe, expect, test } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { createElement, StrictMode, type ReactNode } from "react";
import type {
  ComposerAttachmentHandle,
  ComposerDraftAttachment,
  ComposerScope,
} from "../Composer.types";
import type {
  ComposerAttachmentController,
  ComposerAttachmentOptions,
  ComposerAttachmentPreparationContext,
  ComposerAttachmentSource,
} from "../ComposerAttachment.types";
import {
  createComposerAttachmentController,
  validateComposerAttachmentIntake,
} from "./attachments";
import { useComposerAttachments } from "./useComposerAttachments";

const scope = { contextKey: "repository-a", conversationId: "conversation" };
const handle = { providerId: "uploads", reference: { id: "uploaded" } };
const controllers: ComposerAttachmentController[] = [];
const originalCreate = URL.createObjectURL;
const originalRevoke = URL.revokeObjectURL;

afterEach(() => {
  for (const controller of controllers.splice(0)) controller.dispose();
  URL.createObjectURL = originalCreate;
  URL.revokeObjectURL = originalRevoke;
});

function file(name = "notes.txt", type = "text/plain", text = "a") {
  return new File([text], name, { type, lastModified: 42 });
}

function controller(options: Partial<ComposerAttachmentOptions> = {}) {
  const result = createComposerAttachmentController({
    scope,
    prepare: () => handle,
    ...options,
  });
  controllers.push(result);
  return result;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (cause: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

async function flush() {
  for (let index = 0; index < 6; index++) await Promise.resolve();
}

function draft(entryId: string): ComposerDraftAttachment {
  return {
    entryId,
    metadata: { name: "recovered.png", mediaType: "image/png", size: 5 },
    status: "ready",
    handle,
  };
}

function previewMocks() {
  const created: string[] = [];
  const revoked: string[] = [];
  URL.createObjectURL = () => {
    const url = `blob:attachment-${created.length}`;
    created.push(url);
    return url;
  };
  URL.revokeObjectURL = (url) => revoked.push(url);
  return { created, revoked };
}

describe("shared attachment intake", () => {
  test("picker, paste and drop enforce identical type, size and count policy", () => {
    const files = [
      file("script.js", "text/javascript"),
      file("large.png", "image/png", "large"),
      file("photo.PNG", "image/png"),
      file("notes.TXT", ""),
    ];
    for (const source of ["picker", "paste", "drop"] as const) {
      const result = validateComposerAttachmentIntake(
        files,
        1,
        { accept: "image/*, .txt", maxFileBytes: 3, maxFiles: 2 },
        source,
      );
      expect(result.accepted).toEqual([files[2]]);
      expect(result.rejected.map(({ error }) => error.code)).toEqual([
        "unsupported_type",
        "file_too_large",
        "too_many_files",
      ]);
      expect(
        result.rejected.every((rejection) => rejection.source === source),
      ).toBe(true);
      expect(result.rejected[0].metadata.name).toBe("script.js");
    }
    expect(files).toHaveLength(4);
  });

  test("extension matching works without a MIME type; exact MIME and unrestricted rules work", () => {
    const text = file("NOTES.TXT", "");
    const png = file("image.png", "image/png");
    expect(
      validateComposerAttachmentIntake([text], 0, { accept: ".txt" }).accepted,
    ).toEqual([text]);
    expect(
      validateComposerAttachmentIntake([png], 0, { accept: "IMAGE/PNG" })
        .accepted,
    ).toEqual([png]);
    expect(
      validateComposerAttachmentIntake([text, png], 0, { accept: "*/*" })
        .accepted,
    ).toEqual([text, png]);
    expect(validateComposerAttachmentIntake([text, png], 0).accepted).toEqual([
      text,
      png,
    ]);
  });

  test("zero limits are meaningful and invalid configuration is not silently ignored", () => {
    const empty = file("empty.txt", "text/plain", "");
    expect(
      validateComposerAttachmentIntake([empty], 0, { maxFileBytes: 0 })
        .accepted,
    ).toEqual([empty]);
    expect(
      validateComposerAttachmentIntake([empty], 0, { maxFiles: 0 }).rejected[0]
        .error.code,
    ).toBe("too_many_files");
    expect(() => validateComposerAttachmentIntake([], -1)).toThrow(TypeError);
    expect(() =>
      validateComposerAttachmentIntake([], 0, { maxFiles: Infinity }),
    ).toThrow(TypeError);
    expect(() =>
      validateComposerAttachmentIntake([], 0, { maxFileBytes: -1 }),
    ).toThrow(TypeError);
  });

  test("custom host validation has the same source-aware boundary for each intake path", () => {
    const sources: ComposerAttachmentSource[] = [];
    const selected = file();
    for (const source of ["picker", "paste", "drop"] as const) {
      const result = validateComposerAttachmentIntake(
        [selected],
        0,
        {
          validate: (received, path) => {
            expect(received).toBe(selected);
            sources.push(path);
            return { code: "host_rejected", message: "Choose another file." };
          },
        },
        source,
      );
      expect(result.accepted).toEqual([]);
      expect(result.rejected[0].error.message).toBe("Choose another file.");
    }
    expect(sources).toEqual(["picker", "paste", "drop"]);
  });
});

describe("attachment occurrence lifecycle", () => {
  test("repeated files and removed/reselected files always have distinct occurrence IDs", async () => {
    const store = controller();
    const selected = file();
    const first = store.intake([selected, selected], "picker").entryIds;
    expect(new Set(first).size).toBe(2);
    await flush();
    const snapshot = store.sendableSnapshot();
    store.remove(first[0]);
    const second = store.intake([selected], "paste").entryIds[0];
    expect(first).not.toContain(second);
    for (const attachment of snapshot) store.remove(attachment.entryId);
    expect(store.getSnapshot().entries.map(({ entryId }) => entryId)).toEqual([
      second,
    ]);
    expect(store.file(second)).toBe(selected);
  });

  test("preparation captures scope, reports upload progress and produces a detached handle", async () => {
    const incomingScope = { ...scope };
    const ready = deferred<ComposerAttachmentHandle>();
    let context!: ComposerAttachmentPreparationContext;
    const selected = file();
    const store = controller({
      scope: incomingScope,
      prepare: (received, next) => {
        expect(received).toBe(selected);
        context = next;
        return ready.promise;
      },
    });
    const entryId = store.intake([selected], "drop").entryIds[0];
    expect(store.getSnapshot().entries[0].state.status).toBe("preparing");
    incomingScope.contextKey = "changed-in-place";
    await flush();
    expect(context.entryId).toBe(entryId);
    expect(context.scope).toEqual(scope);
    context.reportProgress(0.4);
    expect(store.getSnapshot().entries[0].state).toEqual({
      status: "uploading",
      progress: 0.4,
    });
    context.reportProgress(5);
    expect(store.getSnapshot().entries[0].state).toEqual({
      status: "uploading",
      progress: 1,
    });
    const beforeInvalidProgress = store.getSnapshot();
    context.reportProgress(NaN);
    expect(store.getSnapshot()).toBe(beforeInvalidProgress);
    const mutableHandle = { providerId: "uploads", reference: { id: "first" } };
    ready.resolve(mutableHandle);
    await flush();
    mutableHandle.reference.id = "mutated";
    const snapshot = store.sendableSnapshot();
    expect(snapshot[0].handle.reference).toEqual({ id: "first" });
    expect(Object.isFrozen(snapshot[0].handle.reference)).toBe(true);
    expect(Object.isFrozen(snapshot[0].metadata)).toBe(true);
    const readySnapshot = store.getSnapshot();
    context.reportProgress(0.1);
    expect(store.getSnapshot()).toBe(readySnapshot);
  });

  test("a provider ignoring abort cannot resurrect removed occurrences", async () => {
    const ready = deferred<ComposerAttachmentHandle>();
    let context!: ComposerAttachmentPreparationContext;
    const store = controller({
      prepare: (_, next) => {
        context = next;
        return ready.promise;
      },
    });
    const id = store.intake([file()], "picker").entryIds[0];
    await flush();
    store.remove(id);
    expect(context.signal.aborted).toBe(true);
    const removed = store.getSnapshot();
    context.reportProgress(0.8);
    ready.resolve(handle);
    await flush();
    expect(store.getSnapshot()).toBe(removed);
    expect(store.file(id)).toBeUndefined();
  });

  test("context changes invalidate preparation even when the conversation ID is unchanged", async () => {
    const pending: {
      context: ComposerAttachmentPreparationContext;
      result: ReturnType<typeof deferred<ComposerAttachmentHandle>>;
    }[] = [];
    const store = controller({
      prepare: (_, context) => {
        const result = deferred<ComposerAttachmentHandle>();
        pending.push({ context, result });
        return result.promise;
      },
    });
    const selected = file();
    const firstId = store.intake([selected], "drop").entryIds[0];
    await flush();
    store.setScope({ ...scope, contextKey: "repository-b" });
    const secondId = store.intake([selected], "drop").entryIds[0];
    await flush();
    expect(secondId).not.toBe(firstId);
    expect(pending[0].context.signal.aborted).toBe(true);
    expect(pending[1].context.scope.contextKey).toBe("repository-b");
    pending[0].context.reportProgress(1);
    pending[0].result.resolve(handle);
    await flush();
    expect(store.getSnapshot().entries[0].entryId).toBe(secondId);
    expect(store.getSnapshot().entries[0].state.status).toBe("preparing");
    pending[1].result.resolve(handle);
    await flush();
    expect(store.sendableSnapshot()[0].entryId).toBe(secondId);
  });

  test("cancel/retry keeps occurrence identity and ignores the superseded attempt", async () => {
    const pending: ReturnType<typeof deferred<ComposerAttachmentHandle>>[] = [];
    const contexts: ComposerAttachmentPreparationContext[] = [];
    const store = controller({
      prepare: (_, context) => {
        const result = deferred<ComposerAttachmentHandle>();
        pending.push(result);
        contexts.push(context);
        return result.promise;
      },
    });
    const id = store.intake([file()], "picker").entryIds[0];
    await flush();
    store.cancel(id);
    expect(contexts[0].signal.aborted).toBe(true);
    expect(store.getSnapshot().entries[0].state.status).toBe("cancelled");
    expect(store.retry(id)).toBe(true);
    await flush();
    pending[0].resolve({ providerId: "uploads", reference: "obsolete" });
    await flush();
    expect(store.getSnapshot().entries[0].state.status).toBe("preparing");
    pending[1].resolve(handle);
    await flush();
    expect(store.sendableSnapshot()[0]).toEqual({
      entryId: id,
      metadata: {
        name: "notes.txt",
        mediaType: "text/plain",
        size: 1,
        lastModified: 42,
      },
      handle,
    });
    expect(store.retry(id)).toBe(false);
  });

  test("sync and async preparation failures remain visible and independently retryable", async () => {
    let calls = 0;
    const store = controller({
      prepare: () => {
        calls++;
        if (calls === 1) throw new Error("Preparation rejected this file.");
        if (calls === 2) return Promise.reject(new Error("Upload failed."));
        return handle;
      },
    });
    const id = store.intake([file()], "picker").entryIds[0];
    await flush();
    expect(store.getSnapshot().entries[0].state).toEqual({
      status: "error",
      error: {
        code: "preparation_failed",
        message: "Preparation rejected this file.",
      },
    });
    expect(store.retry(id)).toBe(true);
    await flush();
    expect(store.getSnapshot().entries[0].state).toEqual({
      status: "error",
      error: { code: "preparation_failed", message: "Upload failed." },
    });
    expect(store.retry(id)).toBe(true);
    await flush();
    expect(store.getSnapshot().entries[0].state.status).toBe("ready");
    expect(calls).toBe(3);
  });

  test("nonportable handles cannot become ready, persisted or silently omitted", async () => {
    const store = controller({
      prepare: () => ({
        providerId: "uploads",
        reference: file() as unknown as string,
      }),
    });
    const id = store.intake([file()], "picker").entryIds[0];
    expect(() => store.sendableSnapshot()).toThrow("must be ready");
    await flush();
    expect(store.getSnapshot().entries[0].state.status).toBe("error");
    expect(() => store.sendableSnapshot()).toThrow("must be ready");
    expect(store.draftSnapshot()).toEqual([
      {
        entryId: id,
        metadata: {
          name: "notes.txt",
          mediaType: "text/plain",
          size: 1,
          lastModified: 42,
        },
        status: "reattach",
      },
    ]);
  });

  test("partial intake rejections remain visible until dismissed, with no private files in state", async () => {
    const store = controller({ policy: { accept: ".txt", maxFiles: 1 } });
    const result = store.intake(
      [file(), file("photo.png", "image/png")],
      "paste",
    );
    expect(result.entryIds).toHaveLength(1);
    expect(result.rejected[0].error.code).toBe("unsupported_type");
    store.intake([file("second.txt")], "drop");
    expect(
      store.getSnapshot().rejections.map(({ error }) => error.code),
    ).toEqual(["unsupported_type", "too_many_files"]);
    await flush();
    expect(JSON.stringify(store.getSnapshot())).not.toContain("blob:");
    expect(Object.keys(store.getSnapshot().entries[0])).toEqual([
      "entryId",
      "metadata",
      "state",
    ]);
    store.clearRejections();
    expect(store.getSnapshot().rejections).toEqual([]);
  });

  test("preview URLs are revoked once on cancel, remove, scope change, restore and disposal", async () => {
    const { created, revoked } = previewMocks();
    const store = controller({ prepare: () => new Promise(() => {}) });
    const image = file("image.png", "image/png");
    const first = store.intake([image], "picker").entryIds[0];
    expect(store.previewUrl(first)).toBe(created[0]);
    await flush();
    store.cancel(first);
    expect(revoked).toEqual([created[0]]);
    expect(store.previewUrl(first)).toBeUndefined();
    store.retry(first);
    expect(store.previewUrl(first)).toBe(created[1]);
    store.remove(first);
    store.intake([image], "paste");
    store.setScope({ ...scope, contextKey: "next" });
    store.intake([image], "drop");
    store.restore([]);
    store.intake([image], "picker");
    store.dispose();
    store.dispose();
    expect(revoked).toEqual(created);
  });

  test("retrying a failed upload reuses its preview until occurrence removal", async () => {
    const { created, revoked } = previewMocks();
    let attempts = 0;
    const store = controller({
      prepare: () => {
        if (++attempts === 1) throw new Error("Retry upload.");
        return handle;
      },
    });
    const id = store.intake([file("image.png", "image/png")], "picker")
      .entryIds[0];
    await flush();
    expect(store.getSnapshot().entries[0].state.status).toBe("error");
    const originalPreview = store.previewUrl(id);
    store.retry(id);
    await flush();
    expect(store.previewUrl(id)).toBe(originalPreview);
    expect(created).toHaveLength(1);
    store.remove(id);
    expect(revoked).toEqual(created);
  });

  test("configuration updates future work without replaying a pending upload", async () => {
    const first = deferred<ComposerAttachmentHandle>();
    let firstCalls = 0;
    let secondCalls = 0;
    const store = controller({
      prepare: () => {
        firstCalls++;
        return first.promise;
      },
    });
    store.intake([file()], "picker");
    await flush();
    store.configure({
      scope,
      prepare: () => {
        secondCalls++;
        return handle;
      },
    });
    store.intake([file("second.txt")], "picker");
    first.resolve(handle);
    await flush();
    expect(firstCalls).toBe(1);
    expect(secondCalls).toBe(1);
    expect(store.sendableSnapshot()).toHaveLength(2);
  });
});

describe("attachment draft recovery and ownership", () => {
  test("draft key changes release old occurrences and preserve newly restored handles", async () => {
    const previews = previewMocks();
    const pending = deferred<ComposerAttachmentHandle>();
    let preparation!: ComposerAttachmentPreparationContext;
    const prepare: ComposerAttachmentOptions["prepare"] = (
      selected,
      context,
    ) => {
      if (selected.name === "pending.png") {
        preparation = context;
        return pending.promise;
      }
      return handle;
    };
    const store = controller({
      draftKey: "first",
      prepare,
      canRecover: () => true,
    });
    const oldIds = store.intake(
      [file("ready.png", "image/png"), file("pending.png", "image/png")],
      "picker",
    ).entryIds;
    await flush();
    expect(
      store.getSnapshot().entries.map(({ state }) => state.status),
    ).toEqual(["ready", "preparing"]);
    store.configure({
      scope,
      draftKey: "second",
      prepare,
      canRecover: () => true,
    });
    expect(preparation.signal.aborted).toBe(true);
    expect(previews.revoked).toEqual(previews.created);
    expect(store.getSnapshot().entries).toEqual([]);
    expect(store.draftSnapshot()).toEqual([]);
    for (const entryId of oldIds) expect(store.file(entryId)).toBeUndefined();
    store.restore([draft("second-draft-handle")]);
    const restored = store.getSnapshot();
    preparation.reportProgress(1);
    pending.resolve(handle);
    await flush();
    expect(store.getSnapshot()).toBe(restored);
    store.configure({
      scope,
      draftKey: "second",
      prepare,
      canRecover: () => true,
    });
    expect(store.sendableSnapshot().map(({ entryId }) => entryId)).toEqual([
      "second-draft-handle",
    ]);
  });

  test("local files are saved as reattach unless the host explicitly supports handle recovery", async () => {
    const store = controller();
    const id = store.intake([file()], "picker").entryIds[0];
    await flush();
    expect(store.getSnapshot().entries[0].state.status).toBe("ready");
    expect(store.draftSnapshot()[0].status).toBe("reattach");
    store.restore([draft(id)]);
    expect(store.getSnapshot().entries[0].state.status).toBe("reattach");
    expect(store.file(id)).toBeUndefined();
    expect(store.retry(id)).toBe(false);
    expect(() => store.sendableSnapshot()).toThrow("must be ready");
  });

  test("only explicit scope-aware host validation permits a recovered ready handle", async () => {
    const received: ComposerScope[] = [];
    const store = controller({
      canRecover: (_, current) => {
        received.push(current);
        return current.contextKey === scope.contextKey;
      },
    });
    const mutable = draft("saved");
    store.restore([mutable]);
    expect(store.getSnapshot().entries[0].state.status).toBe("ready");
    expect(store.sendableSnapshot()[0].handle).toEqual(handle);
    const saved = store.draftSnapshot();
    expect(saved[0].status).toBe("ready");
    expect(Object.isFrozen(saved)).toBe(true);
    expect(Object.isFrozen(saved[0].metadata)).toBe(true);
    store.setScope({ ...scope, contextKey: "another-repository" });
    store.restore(saved);
    expect(store.getSnapshot().entries[0].state.status).toBe("reattach");
    expect(received.at(-1)?.contextKey).toBe("another-repository");
    await flush();
  });

  test("malformed drafts and failing recovery policy preserve the current local selection", async () => {
    let context!: ComposerAttachmentPreparationContext;
    const selected = file();
    const store = controller({
      prepare: (_, next) => {
        context = next;
        return new Promise(() => {});
      },
      canRecover: () => {
        throw new Error("Recovery service unavailable.");
      },
    });
    const id = store.intake([selected], "picker").entryIds[0];
    await flush();
    const before = store.getSnapshot();
    expect(() =>
      store.restore([draft("duplicate"), draft("duplicate")]),
    ).toThrow(TypeError);
    expect(() => store.restore([draft("recover")])).toThrow(
      "Recovery service unavailable.",
    );
    expect(store.getSnapshot()).toBe(before);
    expect(store.file(id)).toBe(selected);
    expect(context.signal.aborted).toBe(false);
  });

  test("restoration invalidates pending results and never reuses restored occurrence IDs", async () => {
    const pending = deferred<ComposerAttachmentHandle>();
    let context!: ComposerAttachmentPreparationContext;
    const store = controller({
      prepare: (_, next) => {
        context = next;
        return pending.promise;
      },
    });
    const id = store.intake([file()], "picker").entryIds[0];
    await flush();
    const futureId = id.replace(/-1$/, "-2");
    store.restore([draft(futureId)]);
    expect(context.signal.aborted).toBe(true);
    const restored = store.getSnapshot();
    pending.resolve(handle);
    await flush();
    expect(store.getSnapshot()).toBe(restored);
    const newId = store.intake([file()], "paste").entryIds[0];
    expect(newId).not.toBe(futureId);
  });

  test("snapshots are stable between updates; unsubscribe and disposal release ownership", async () => {
    let updates = 0;
    let context!: ComposerAttachmentPreparationContext;
    const store = controller({
      prepare: (_, next) => {
        context = next;
        return new Promise(() => {});
      },
    });
    const initial = store.getSnapshot();
    expect(store.getSnapshot()).toBe(initial);
    expect(Object.isFrozen(initial.rejections)).toBe(true);
    const unsubscribe = store.subscribe(() => updates++);
    store.intake([file()], "picker");
    await flush();
    expect(updates).toBe(1);
    unsubscribe();
    store.clear();
    expect(updates).toBe(1);
    expect(Object.isFrozen(store.getSnapshot().rejections)).toBe(true);
    expect(context.signal.aborted).toBe(true);
    store.dispose();
    expect(() => store.intake([file()], "picker")).toThrow("disposed");
    expect(store.getSnapshot().entries).toEqual([]);
    const inactive = store.subscribe(() => updates++);
    inactive();
    expect(updates).toBe(1);
  });

  test("React hook survives StrictMode replay, tracks scope and aborts/releases on unmount", async () => {
    const previews = previewMocks();
    const contexts: ComposerAttachmentPreparationContext[] = [];
    const prepare: ComposerAttachmentOptions["prepare"] = (_, context) => {
      contexts.push(context);
      return new Promise(() => {});
    };
    const { result, rerender, unmount } = renderHook(
      ({ currentScope }) =>
        useComposerAttachments({ scope: currentScope, prepare }),
      {
        initialProps: { currentScope: scope },
        wrapper: ({ children }: { children: ReactNode }) =>
          createElement(StrictMode, null, children),
      },
    );
    await act(async () => {
      result.current.controller.intake(
        [file("photo.png", "image/png")],
        "paste",
      );
      await flush();
    });
    expect(result.current.entries).toHaveLength(1);
    expect(contexts).toHaveLength(1);
    rerender({ currentScope: { ...scope, contextKey: "new-context" } });
    expect(result.current.entries).toEqual([]);
    expect(result.current.scope.contextKey).toBe("new-context");
    expect(contexts[0].signal.aborted).toBe(true);
    await act(async () => {
      result.current.controller.intake([file("new.png", "image/png")], "drop");
      await flush();
    });
    expect(contexts).toHaveLength(2);
    unmount();
    expect(contexts[1].signal.aborted).toBe(true);
    expect(previews.revoked).toEqual(previews.created);
  });
});
