import { afterEach, describe, expect, test } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { createElement, StrictMode, type ReactNode } from "react";
import type { ComposerDocument, ComposerDraft } from "../Composer.types";
import type {
  ComposerDraftAdapter,
  ComposerDraftContext,
  ComposerDraftController,
  ComposerDraftLoadRequest,
} from "../ComposerDraft.types";
import { createComposerDraftController } from "./drafts";
import { useComposerDraft } from "./useComposerDraft";

const scope = { contextKey: "repository", conversationId: "conversation" };
const controllers: ComposerDraftController[] = [];

afterEach(() => {
  for (const controller of controllers.splice(0)) controller.dispose();
});

function document(text = ""): ComposerDocument {
  return { schemaVersion: 1, content: [{ type: "text", text }] };
}

function draft(text = "saved", revision = 3): ComposerDraft {
  return {
    draftVersion: 1,
    scope,
    draftKey: "prompt",
    revision,
    document: document(text),
    attachments: [],
  };
}

function context(
  overrides: Partial<ComposerDraftContext> = {},
): ComposerDraftContext {
  return {
    scope,
    draftKey: "prompt",
    revision: 0,
    document: document(),
    instanceGeneration: 1,
    adapter: { load: async () => null, save: async () => {} },
    ...overrides,
  };
}

function controller(props: ComposerDraftContext, activate = true) {
  const store = createComposerDraftController(props);
  controllers.push(store);
  if (activate) store.activate();
  return store;
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
  for (let index = 0; index < 12; index++) await Promise.resolve();
}

describe("scoped draft restoration", () => {
  test("migrates a legacy Unicode draft and waits for controlled restore acknowledgment before saving", async () => {
    const restored: ComposerDraft[] = [];
    const saved: ComposerDraft[] = [];
    const props = context({
      adapter: {
        load: async () => "中文 / 日本語 👩🏽‍💻",
        save: async (value) => {
          saved.push(value);
        },
      },
      onRestore: (value) => restored.push(value),
    });
    const store = controller(props);
    expect(store.getSnapshot().status).toBe("loading");
    expect(await store.save()).toEqual({
      outcome: "blocked",
      reason: "loading",
    });
    await flush();
    expect(restored).toHaveLength(1);
    expect(restored[0].document).toEqual(document("中文 / 日本語 👩🏽‍💻"));
    expect(store.getSnapshot().loaded?.migrated).toBe(true);
    expect(store.getSnapshot().restorePending).toBe(true);
    expect(await store.save()).toEqual({
      outcome: "blocked",
      reason: "restoring",
    });
    expect(saved).toEqual([]);
    store.update({
      ...props,
      revision: 1,
      originId: "restore-1",
      document: restored[0].document,
      attachments: restored[0].attachments,
    });
    expect(store.getSnapshot().restorePending).toBe(false);
    expect((await store.save()).outcome).toBe("saved");
    expect(saved[0].document).toEqual(restored[0].document);
    expect(saved[0].revision).toBe(1);
  });

  test("delayed loading cannot overwrite typing and retains the compatible loaded draft for inspection", async () => {
    const loading = deferred<unknown>();
    let restores = 0;
    const saved: ComposerDraft[] = [];
    const props = context({
      adapter: {
        load: () => loading.promise,
        save: async (value) => {
          saved.push(value);
        },
      },
      onRestore: () => restores++,
    });
    const store = controller(props);
    await flush();
    store.update({ ...props, document: document("New typing"), revision: 1 });
    loading.resolve(draft("Older stored text"));
    await flush();
    expect(restores).toBe(0);
    expect(store.getSnapshot().status).toBe("ready");
    expect(store.getSnapshot().loaded?.applied).toBe(false);
    expect(store.getSnapshot().loaded?.draft.document).toEqual(
      document("Older stored text"),
    );
    expect((await store.save()).outcome).toBe("saved");
    expect(saved[0].document).toEqual(document("New typing"));
  });

  test("typing back to identical content and same-revision replacements still invalidate restoration", async () => {
    for (const replacement of [false, true]) {
      const loading = deferred<unknown>();
      let restores = 0;
      const props = context({
        adapter: { load: () => loading.promise, save: async () => {} },
        onRestore: () => restores++,
        originId: "initial",
      });
      const store = controller(props);
      await flush();
      if (replacement) store.update({ ...props, originId: "external-replace" });
      else {
        store.update({ ...props, document: document("temporary typing") });
        store.update(props);
      }
      loading.resolve(draft());
      await flush();
      expect(restores).toBe(0);
      expect(store.getSnapshot().loaded?.applied).toBe(false);
    }
  });

  test("new attachment occurrences also prevent a delayed restore", async () => {
    const loading = deferred<unknown>();
    let restores = 0;
    const props = context({
      adapter: { load: () => loading.promise, save: async () => {} },
      onRestore: () => restores++,
    });
    const store = controller(props);
    await flush();
    store.update({
      ...props,
      attachments: [
        {
          entryId: "new-file",
          metadata: { name: "photo.png", mediaType: "image/png", size: 10 },
          status: "reattach",
        },
      ],
    });
    loading.resolve(draft());
    await flush();
    expect(restores).toBe(0);
  });

  test("context, conversation, draft key and instance changes abort and isolate old loads", async () => {
    const changes: Partial<ComposerDraftContext>[] = [
      { scope: { ...scope, contextKey: "other-repository" } },
      { scope: { ...scope, conversationId: "other-conversation" } },
      { draftKey: "another-draft" },
      { instanceGeneration: 2 },
    ];
    for (const change of changes) {
      const first = deferred<unknown>();
      const requests: ComposerDraftLoadRequest[] = [];
      let restores = 0;
      const props = context({
        adapter: {
          load: (request) => {
            requests.push(request);
            return requests.length === 1
              ? first.promise
              : Promise.resolve(null);
          },
          save: async () => {},
        },
        onRestore: () => restores++,
      });
      const store = controller(props);
      await flush();
      store.update({ ...props, ...change });
      await flush();
      expect(requests[0].signal.aborted).toBe(true);
      first.resolve(draft("Stale other scope"));
      await flush();
      expect(restores).toBe(0);
      expect(store.getSnapshot().status).toBe("ready");
      expect(store.getSnapshot().scope).toEqual(change.scope ?? scope);
      expect(store.getSnapshot().draftKey).toBe(change.draftKey ?? "prompt");
      expect(store.getSnapshot().instanceGeneration).toBe(
        change.instanceGeneration ?? 1,
      );
    }
  });

  test("mutating input context objects in place cannot disguise a storage adapter replacement", async () => {
    const loading = deferred<unknown>();
    const next = deferred<unknown>();
    let restores = 0;
    const props = {
      ...context(),
      adapter: { load: () => loading.promise, save: async () => {} },
      onRestore: () => restores++,
    };
    const store = controller(props);
    await flush();
    props.adapter = { load: () => next.promise, save: async () => {} };
    store.update(props);
    loading.resolve(draft("Old adapter"));
    next.resolve(null);
    await flush();
    expect(restores).toBe(0);
    expect(store.getSnapshot().status).toBe("ready");
  });

  test("explicit reload supersedes an earlier read even when cancellation is ignored", async () => {
    const first = deferred<unknown>();
    const second = deferred<unknown>();
    const requests: ComposerDraftLoadRequest[] = [];
    const restored: ComposerDraft[] = [];
    const props = context({
      adapter: {
        load: (request) => {
          requests.push(request);
          return requests.length === 1 ? first.promise : second.promise;
        },
        save: async () => {},
      },
      onRestore: (value) => restored.push(value),
    });
    const store = controller(props);
    await flush();
    const reloaded = store.reload();
    await flush();
    expect(requests[0].signal.aborted).toBe(true);
    first.resolve(draft("Obsolete read"));
    second.resolve(draft("Current read"));
    await reloaded;
    expect(restored.map(({ document }) => document)).toEqual([
      document("Current read"),
    ]);
  });

  test("synchronous controlled restore echoes acknowledge without a second editing history", async () => {
    let props = context();
    props = {
      ...props,
      adapter: { load: async () => draft("Restored"), save: async () => {} },
      onRestore: (value) => {
        props = {
          ...props,
          document: value.document,
          revision: 1,
          originId: "restore",
        };
        store.update(props);
      },
    };
    const store = controller(props, false);
    store.activate();
    await flush();
    expect(store.getSnapshot().restorePending).toBe(false);
    expect((await store.save()).outcome).toBe("saved");
  });
});

describe("incompatible draft preservation", () => {
  test("unsupported data is retained by identity and never automatically overwritten", async () => {
    const input = {
      ...draft(),
      document: {
        schemaVersion: 2,
        content: [{ type: "future", data: "retain me" }],
      },
    };
    const received: unknown[] = [];
    let saves = 0;
    const props = context({
      adapter: {
        load: async () => input,
        save: async () => {
          saves++;
        },
      },
      onIncompatible: (value) => received.push(value),
    });
    const store = controller(props);
    await flush();
    expect(store.getSnapshot().status).toBe("incompatible");
    expect(store.getSnapshot().incompatible?.input).toBe(input);
    expect(received).toEqual([input]);
    store.update({
      ...props,
      revision: 1,
      document: document("New editable text"),
    });
    expect(await store.save()).toEqual({
      outcome: "blocked",
      reason: "incompatible",
    });
    expect(saves).toBe(0);
    const preserved = store.getSnapshot().incompatible!;
    expect(store.allowOverwrite({ ...preserved })).toBe(false);
    expect(store.allowOverwrite(preserved)).toBe(true);
    expect(store.getSnapshot().overwriteAllowed).toBe(true);
    expect((await store.save()).outcome).toBe("saved");
    expect(saves).toBe(1);
    expect(store.getSnapshot().incompatible?.input).toBe(input);
  });

  test("typing while loading cannot hide incompatible storage and silently enable autosave", async () => {
    const loading = deferred<unknown>();
    const input = { ...draft(), draftVersion: 9 };
    let saves = 0;
    let restores = 0;
    const props = context({
      adapter: {
        load: () => loading.promise,
        save: async () => {
          saves++;
        },
      },
      onRestore: () => restores++,
    });
    const store = controller(props);
    await flush();
    store.update({
      ...props,
      revision: 1,
      document: document("Typed during load"),
    });
    loading.resolve(input);
    await flush();
    expect(restores).toBe(0);
    expect(store.getSnapshot().incompatible?.input).toBe(input);
    expect(await store.save()).toEqual({
      outcome: "blocked",
      reason: "incompatible",
    });
    expect(saves).toBe(0);
  });

  test("otherwise valid drafts from another scope or key are preserved as incompatible", async () => {
    const cases: ComposerDraft[] = [
      { ...draft(), scope: { ...scope, contextKey: "other-repository" } },
      { ...draft(), scope: { ...scope, conversationId: "other-conversation" } },
      { ...draft(), draftKey: "other-draft" },
    ];
    for (const input of cases) {
      let restores = 0;
      const store = controller(
        context({
          adapter: { load: async () => input, save: async () => {} },
          onRestore: () => restores++,
        }),
      );
      await flush();
      expect(restores).toBe(0);
      expect(store.getSnapshot().status).toBe("incompatible");
      expect(store.getSnapshot().incompatible?.input).toBe(input);
      expect(store.getSnapshot().incompatible?.reason).toContain(
        "different scope",
      );
    }
  });

  test("an old confirmation cannot authorize writes in a new scope or against a new load", async () => {
    const input = { unsupported: true };
    const props = context({
      adapter: { load: async () => input, save: async () => {} },
    });
    const store = controller(props);
    await flush();
    const old = store.getSnapshot().incompatible!;
    await store.reload();
    expect(store.allowOverwrite(old)).toBe(false);
    const previousScope = store.getSnapshot().incompatible!;
    store.update({ ...props, scope: { ...scope, contextKey: "other" } });
    await flush();
    expect(store.allowOverwrite(previousScope)).toBe(false);
    expect(await store.save()).toEqual({
      outcome: "blocked",
      reason: "incompatible",
    });
  });

  test("callback errors remain visible without losing the incompatible input", async () => {
    const input = { unsupported: true };
    const store = controller(
      context({
        adapter: { load: async () => input, save: async () => {} },
        onIncompatible: () => {
          throw new Error("Backup service unavailable.");
        },
      }),
    );
    await flush();
    expect(store.getSnapshot().status).toBe("incompatible");
    expect(store.getSnapshot().incompatible?.input).toBe(input);
    expect(store.getSnapshot().error?.message).toBe(
      "Backup service unavailable.",
    );
    expect(store.getSnapshot().errorOperation).toBe("incompatible");
  });
});

describe("serialized draft persistence", () => {
  test("saving is explicit and snapshots portable content before asynchronous work", async () => {
    const node = { type: "text" as const, text: "Original" };
    const documentValue = { schemaVersion: 1 as const, content: [node] };
    const saved: ComposerDraft[] = [];
    const props = context({
      document: documentValue,
      adapter: {
        load: async () => null,
        save: async (value) => {
          saved.push(value);
        },
      },
    });
    const store = controller(props);
    await flush();
    expect(saved).toEqual([]);
    const saving = store.save();
    node.text = "Mutated caller object";
    await saving;
    expect(saved[0].document).toEqual(document("Original"));
    expect(Object.isFrozen(saved[0].document.content)).toBe(true);
    store.update({ ...props, revision: 1, document: document("Another edit") });
    await flush();
    expect(saved).toHaveLength(1);
  });

  test("one active write settles before the coalesced latest write starts", async () => {
    const first = deferred<void>();
    const last = deferred<void>();
    const writes: number[] = [];
    const commits: number[] = [];
    const props = context({
      adapter: {
        load: async () => null,
        save: async (value) => {
          writes.push(value.revision);
          await (value.revision === 1 ? first.promise : last.promise);
          commits.push(value.revision);
        },
      },
    });
    const store = controller(props);
    await flush();
    store.update({ ...props, revision: 1, document: document("First") });
    const one = store.save();
    await flush();
    store.update({ ...props, revision: 2, document: document("Second") });
    const two = store.save();
    store.update({ ...props, revision: 3, document: document("Latest") });
    const three = store.save();
    expect((await two).outcome).toBe("superseded");
    expect(writes).toEqual([1]);
    first.resolve();
    await one;
    await flush();
    expect(writes).toEqual([1, 3]);
    expect(commits).toEqual([1]);
    expect(store.getSnapshot().saving).toBe(true);
    last.resolve();
    expect((await three).outcome).toBe("saved");
    expect(commits).toEqual([1, 3]);
    expect(store.getSnapshot().lastSavedRevision).toBe(3);
    expect(store.getSnapshot().saving).toBe(false);
  });

  test("a remount sharing the host adapter waits for an old write that ignores disposal", async () => {
    const first = deferred<void>();
    let stored: unknown = null;
    const writes: number[] = [];
    let loads = 0;
    const adapter: ComposerDraftAdapter = {
      load: async () => {
        loads++;
        return stored;
      },
      save: async (value) => {
        writes.push(value.revision);
        if (value.revision === 1) await first.promise;
        stored = value;
      },
    };
    const props = context({ adapter });
    const old = controller(props);
    await flush();
    old.update({ ...props, revision: 1, document: document("Old mount") });
    const saving = old.save();
    await flush();
    old.dispose();
    let restores = 0;
    const nextProps = {
      ...props,
      instanceGeneration: 2,
      onRestore: () => restores++,
    };
    const next = controller(nextProps);
    await flush();
    expect(loads).toBe(1);
    expect(next.getSnapshot().status).toBe("loading");
    next.update({
      ...nextProps,
      revision: 2,
      document: document("New mount typing"),
    });
    first.resolve();
    await saving;
    await flush();
    expect(loads).toBe(2);
    expect(restores).toBe(0);
    expect((await next.save()).outcome).toBe("saved");
    expect(writes).toEqual([1, 2]);
    expect((stored as ComposerDraft).document).toEqual(
      document("New mount typing"),
    );
  });

  test("pending saves retain their original scope while independent keys can progress", async () => {
    const first = deferred<void>();
    const commits: ComposerDraft[] = [];
    const props = context({
      adapter: {
        load: async () => null,
        save: async (value) => {
          if (value.scope.contextKey === scope.contextKey) await first.promise;
          commits.push(value);
        },
      },
    });
    const store = controller(props);
    await flush();
    const old = store.save();
    await flush();
    store.update({
      ...props,
      scope: { ...scope, contextKey: "other-repository" },
    });
    await flush();
    expect((await store.save()).outcome).toBe("saved");
    expect(commits.map(({ scope }) => scope.contextKey)).toEqual([
      "other-repository",
    ]);
    first.resolve();
    await old;
    expect(commits.map(({ scope }) => scope.contextKey)).toEqual([
      "other-repository",
      "repository",
    ]);
    expect(store.getSnapshot().scope.contextKey).toBe("other-repository");
    expect(store.getSnapshot().status).toBe("ready");
  });

  test("failed writes release the lane, show errors and allow an explicit retry", async () => {
    let attempts = 0;
    const props = context({
      adapter: {
        load: async () => null,
        save: async () => {
          if (++attempts === 1) throw new Error("Storage unavailable.");
        },
      },
    });
    const store = controller(props);
    await flush();
    expect((await store.save()).outcome).toBe("error");
    expect(store.getSnapshot().status).toBe("error");
    expect(store.getSnapshot().errorOperation).toBe("save");
    expect(store.getSnapshot().error?.message).toBe("Storage unavailable.");
    expect((await store.save()).outcome).toBe("saved");
    expect(store.getSnapshot().status).toBe("ready");
    expect(store.getSnapshot().error).toBeUndefined();
  });

  test("load errors cannot authorize writes; a successful explicit reload recovers", async () => {
    let attempts = 0;
    const store = controller(
      context({
        adapter: {
          load: async () => {
            if (++attempts === 1) throw new Error("Read failed.");
            return null;
          },
          save: async () => {},
        },
      }),
    );
    await flush();
    expect(store.getSnapshot().status).toBe("error");
    expect(store.getSnapshot().errorOperation).toBe("load");
    expect(await store.save()).toEqual({
      outcome: "blocked",
      reason: "load_error",
    });
    await store.reload();
    expect(store.getSnapshot().status).toBe("ready");
    expect((await store.save()).outcome).toBe("saved");
  });

  test("load cancellation and disposal suppress callbacks without abandoning queued portable writes", async () => {
    const writing = deferred<void>();
    const loading = deferred<unknown>();
    let request!: ComposerDraftLoadRequest;
    let loads = 0;
    let restores = 0;
    let notifications = 0;
    const props = context({
      adapter: {
        load: (next) => {
          request = next;
          return ++loads === 1 ? Promise.resolve(null) : loading.promise;
        },
        save: () => writing.promise,
      },
      onRestore: () => restores++,
    });
    const store = controller(props);
    await flush();
    store.subscribe(() => notifications++);
    const saving = store.save();
    await flush();
    const reloading = store.reload();
    await flush();
    expect(loads).toBe(1);
    store.dispose();
    const disposed = store.getSnapshot();
    const atDisposal = notifications;
    writing.resolve();
    await saving;
    await reloading;
    await flush();
    expect(loads).toBe(1);
    expect(restores).toBe(0);
    expect(notifications).toBe(atDisposal);
    expect(store.getSnapshot()).toBe(disposed);
    expect(await store.save()).toEqual({
      outcome: "blocked",
      reason: "inactive",
    });
    expect(request.signal.aborted).toBe(false);
  });

  test("disposal aborts an actual pending load and ignores its late result", async () => {
    const loading = deferred<unknown>();
    let request!: ComposerDraftLoadRequest;
    let restores = 0;
    const store = controller(
      context({
        adapter: {
          load: (next) => {
            request = next;
            return loading.promise;
          },
          save: async () => {},
        },
        onRestore: () => restores++,
      }),
    );
    await flush();
    store.dispose();
    const disposed = store.getSnapshot();
    expect(request.signal.aborted).toBe(true);
    loading.resolve(draft());
    await flush();
    expect(restores).toBe(0);
    expect(store.getSnapshot()).toBe(disposed);
  });

  test("React StrictMode effect replay preserves a live owner and scoped cleanup", async () => {
    const requests: {
      request: ComposerDraftLoadRequest;
      value: ReturnType<typeof deferred<unknown>>;
    }[] = [];
    let restores = 0;
    const adapter: ComposerDraftAdapter = {
      load: (request) => {
        const value = deferred<unknown>();
        requests.push({ request, value });
        return value.promise;
      },
      save: async () => {},
    };
    const { result, rerender, unmount } = renderHook(
      ({ currentScope }) =>
        useComposerDraft(
          context({
            scope: currentScope,
            adapter,
            onRestore: () => restores++,
          }),
        ),
      {
        initialProps: { currentScope: scope },
        wrapper: ({ children }: { children: ReactNode }) =>
          createElement(StrictMode, null, children),
      },
    );
    await act(flush);
    expect(result.current.snapshot.status).toBe("loading");
    expect(requests).toHaveLength(1);
    rerender({ currentScope: { ...scope, contextKey: "new-context" } });
    await act(flush);
    expect(requests[0].request.signal.aborted).toBe(true);
    expect(requests).toHaveLength(2);
    await act(async () => {
      requests[0].value.resolve(draft("Old scope"));
      requests[1].value.resolve(null);
      await flush();
    });
    expect(restores).toBe(0);
    expect(result.current.snapshot.status).toBe("ready");
    expect(result.current.snapshot.scope.contextKey).toBe("new-context");
    let reloading = Promise.resolve();
    await act(async () => {
      reloading = result.current.controller.reload();
      await flush();
    });
    unmount();
    expect(requests[2].request.signal.aborted).toBe(true);
    requests[2].value.resolve(draft("Unmounted"));
    await reloading;
    expect(restores).toBe(0);
  });
});
