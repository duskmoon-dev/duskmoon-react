import { describe, expect, test } from "bun:test";
import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import type {
  ComposerProviderCandidate,
  ComposerProviderRequest,
  ComposerProviderResult,
} from "../Composer.types";
import type {
  ComposerCompletionProvider,
  ComposerProviderContext,
  ComposerProviderNavigation,
} from "../ComposerProvider.types";
import {
  ComposerProviderController,
  composerProviderItemId,
  matchComposerProviderTrigger,
} from "./providers";
import { useComposerProviders } from "./useComposerProviders";

function candidate(id = "result"): ComposerProviderCandidate {
  return {
    id,
    label: id,
    action: { type: "insert", content: [{ type: "text", text: id }] },
  };
}

function deferredProvider(providerId = "files", marker = "@") {
  const calls: {
    request: ComposerProviderRequest;
    signal: AbortSignal;
    navigation?: ComposerProviderNavigation;
    resolve: (result: ComposerProviderResult) => void;
    reject: (error: Error) => void;
  }[] = [];
  const provider: ComposerCompletionProvider = {
    providerId,
    label: `${providerId} results`,
    trigger: { text: marker, position: marker === "@" ? "word" : "leading" },
    query: (request, signal, navigation) =>
      new Promise((resolve, reject) => {
        calls.push({ request, signal, navigation, resolve, reject });
      }),
  };
  function resolve(index: number, candidates = [candidate()]) {
    const call = calls[index];
    call.resolve({ request: call.request, candidates });
  }
  return { provider, calls, resolve };
}

function context(
  providers: readonly ComposerCompletionProvider[],
  text = "@src",
  overrides: Partial<ComposerProviderContext> = {},
): ComposerProviderContext {
  return {
    document: { schemaVersion: 1, content: [{ type: "text", text }] },
    documentRevision: 1,
    instanceGeneration: 0,
    scope: { contextKey: "repository-a", conversationId: "session" },
    selection: { nodeIndex: 0, start: text.length, end: text.length },
    providers,
    ...overrides,
  };
}

async function settle() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("semantic provider request controller", () => {
  test("matches configured commands, editable skills and word references without inspecting atomic nodes", () => {
    const slash = deferredProvider("commands", "/").provider;
    const skill = { ...slash, providerId: "skills" };
    expect(
      matchComposerProviderTrigger(context([slash], "/re"), slash),
    ).toEqual({
      text: "/re",
      nodeIndex: 0,
      start: 0,
      end: 3,
      caret: 3,
    });
    expect(
      matchComposerProviderTrigger(context([skill], "/review"), skill)?.text,
    ).toBe("/review");
    expect(
      matchComposerProviderTrigger(context([slash], "/agent/review"), slash)
        ?.text,
    ).toBe("/agent/review");
    expect(
      matchComposerProviderTrigger(context([slash], "hello /re"), slash),
    ).toBeUndefined();
    expect(
      matchComposerProviderTrigger(
        context([slash], "/review arguments"),
        slash,
      ),
    ).toBeUndefined();
    expect(
      matchComposerProviderTrigger(
        context([slash], "/re", {
          document: {
            schemaVersion: 1,
            content: [{ type: "text", text: "/re" }],
            command: { providerId: "commands", commandId: "review" },
          },
        }),
        slash,
      ),
    ).toBeUndefined();
    const at = deferredProvider().provider;
    expect(
      matchComposerProviderTrigger(context([at], "See @src"), at)?.start,
    ).toBe(4);
    expect(
      matchComposerProviderTrigger(context([at], "See @src/@scope/pkg"), at)
        ?.text,
    ).toBe("@src/@scope/pkg");
    expect(
      matchComposerProviderTrigger(context([at], "email@example.com"), at),
    ).toBeUndefined();
    expect(
      matchComposerProviderTrigger(
        context([at], "@src", {
          selection: { nodeIndex: 0, start: 0, end: 4 },
        }),
        at,
      ),
    ).toBeUndefined();
    expect(
      matchComposerProviderTrigger(
        context([at], "@src", {
          selection: { nodeIndex: 0, start: 99, end: 99 },
        }),
        at,
      ),
    ).toBeUndefined();
    expect(
      matchComposerProviderTrigger(
        context([at], "@src", {
          document: {
            schemaVersion: 1,
            content: [
              {
                type: "reference",
                nodeId: "one",
                providerId: "files",
                refId: "src",
                label: "@src",
                plainText: "@src",
              },
            ],
          },
        }),
        at,
      ),
    ).toBeUndefined();
  });

  test("groups providers sharing a trigger and uses collision-safe stable candidate identities", async () => {
    const files = deferredProvider("files:a");
    const sessions = deferredProvider("sessions");
    const controller = new ComposerProviderController();
    controller.update(context([files.provider, sessions.provider]));
    expect(controller.getSnapshot().status).toBe("loading");
    expect(files.calls[0].request).toMatchObject({
      providerId: "files:a",
      query: "src",
      scope: { contextKey: "repository-a", conversationId: "session" },
      instanceGeneration: 0,
      documentRevision: 1,
      trigger: { text: "@src", nodeIndex: 0, start: 0, end: 4, caret: 4 },
    });
    files.resolve(0, [
      { ...candidate("same"), disabledReason: "No access" },
      candidate("second"),
    ]);
    await settle();
    expect(controller.getSnapshot().status).toBe("loading");
    expect(controller.getSnapshot().activeId).toBe(
      composerProviderItemId("files:a", "second"),
    );
    sessions.resolve(0, [candidate("same")]);
    await settle();
    const snapshot = controller.getSnapshot();
    expect(snapshot.status).toBe("ready");
    expect(snapshot.groups.map((group) => group.label)).toEqual([
      "files:a results",
      "sessions results",
    ]);
    expect(new Set(snapshot.items.map((item) => item.id)).size).toBe(3);
    expect(composerProviderItemId("a:b", "c")).not.toBe(
      composerProviderItemId("a", "b:c"),
    );
    controller.move(1);
    expect(controller.getSnapshot().activeId).toBe(
      composerProviderItemId("sessions", "same"),
    );
    controller.move(1);
    expect(controller.getSnapshot().activeId).toBe(
      composerProviderItemId("files:a", "second"),
    );
    expect(
      controller.select(composerProviderItemId("files:a", "same")),
    ).toBeUndefined();
    controller.dispose();
  });

  test("aborts superseded work and discards out-of-order results even when the provider ignores cancellation", async () => {
    const deferred = deferredProvider();
    const controller = new ComposerProviderController();
    controller.update(context([deferred.provider], "@s"));
    controller.update(
      context([deferred.provider], "@src", { documentRevision: 2 }),
    );
    expect(deferred.calls[0].signal.aborted).toBe(true);
    deferred.resolve(1, [candidate("current")]);
    await settle();
    deferred.resolve(0, [candidate("late")]);
    await settle();
    expect(
      controller.getSnapshot().items.map((item) => item.candidate.id),
    ).toEqual(["current"]);
    controller.dispose();
  });

  test("scope, caret, revision, instance and provider changes each invalidate captured results", async () => {
    const deferred = deferredProvider();
    const controller = new ComposerProviderController();
    const initial = context([deferred.provider]);
    controller.update(initial);
    const updates: ComposerProviderContext[] = [
      {
        ...initial,
        scope: { contextKey: "repository-b", conversationId: "session" },
      },
      {
        ...initial,
        scope: { contextKey: "repository-b", conversationId: "other-session" },
      },
      { ...initial, selection: { nodeIndex: 0, start: 3, end: 3 } },
      { ...initial, documentRevision: 2 },
      { ...initial, instanceGeneration: 1 },
    ];
    for (const update of updates) {
      const previous = deferred.calls.at(-1)!;
      controller.update(update);
      expect(previous.signal.aborted).toBe(true);
      previous.resolve({
        request: previous.request,
        candidates: [candidate("stale")],
      });
      await settle();
      expect(controller.getSnapshot().items).toEqual([]);
    }
    const old = deferred.calls.at(-1)!;
    controller.update(context([]));
    expect(old.signal.aborted).toBe(true);
    expect(controller.getSnapshot().status).toBe("idle");
    old.resolve({
      request: old.request,
      candidates: [candidate("removed-provider")],
    });
    await settle();
    expect(controller.getSnapshot().items).toEqual([]);
    controller.dispose();
  });

  test("controlled echoes do not restart queries while same-revision document changes do", () => {
    const deferred = deferredProvider();
    const controller = new ComposerProviderController();
    controller.update(context([deferred.provider]));
    controller.update(
      context([
        { ...deferred.provider, trigger: { ...deferred.provider.trigger } },
      ]),
    );
    expect(deferred.calls).toHaveLength(1);
    controller.update(context([deferred.provider], "@lib"));
    expect(deferred.calls).toHaveLength(2);
    expect(deferred.calls[0].signal.aborted).toBe(true);
    controller.dispose();
  });

  test("selection revalidates live editor range and never applies a result twice", async () => {
    const deferred = deferredProvider();
    const controller = new ComposerProviderController();
    controller.update(context([deferred.provider]));
    deferred.resolve(0);
    await settle();
    const item = controller.getSnapshot().items[0];
    expect(
      controller.select(item.id, context([deferred.provider], "plain text")),
    ).toBeUndefined();
    expect(controller.getSnapshot().status).toBe("idle");
    controller.update(context([deferred.provider]));
    deferred.resolve(1);
    await settle();
    const effect = controller.select();
    expect(effect?.action.type).toBe("insert");
    expect(effect?.request).toBe(deferred.calls[1].request);
    expect(effect?.itemId).toBe(composerProviderItemId("files", "result"));
    expect(controller.select(effect?.itemId)).toBeUndefined();
    expect(controller.getSnapshot().status).toBe("idle");
    controller.dispose();
  });

  test("deleting a trigger closes suggestions and rejects an in-flight response", async () => {
    const deferred = deferredProvider();
    const controller = new ComposerProviderController();
    controller.update(context([deferred.provider]));
    controller.update(context([deferred.provider], "src"));
    expect(deferred.calls[0].signal.aborted).toBe(true);
    deferred.resolve(0);
    await settle();
    expect(controller.getSnapshot().status).toBe("idle");
    expect(controller.select()).toBeUndefined();
    controller.dispose();
  });

  test("folder drill and breadcrumb navigation requery without changing the editor document", async () => {
    const deferred = deferredProvider();
    const controller = new ComposerProviderController();
    const input = context([deferred.provider]);
    controller.update(input);
    deferred.resolve(0, [
      {
        id: "folder",
        label: "Source",
        action: { type: "drill", refId: "dir-src" },
      },
    ]);
    await settle();
    expect(controller.select()?.action).toEqual({
      type: "drill",
      refId: "dir-src",
    });
    expect(deferred.calls[1].navigation).toEqual({
      refId: "dir-src",
      breadcrumbs: [{ refId: "dir-src", label: "Source" }],
    });
    expect(deferred.calls[1].request.requestId).not.toBe(
      deferred.calls[0].request.requestId,
    );
    expect(input.document.content).toEqual([{ type: "text", text: "@src" }]);
    deferred.resolve(1, [
      {
        id: "nested",
        label: "Components",
        action: { type: "drill", refId: "dir-components" },
      },
    ]);
    await settle();
    controller.select();
    expect(controller.getSnapshot().breadcrumbs).toHaveLength(2);
    controller.back(1);
    expect(deferred.calls[2].signal.aborted).toBe(true);
    expect(deferred.calls[3].navigation?.refId).toBe("dir-src");
    controller.back(0);
    expect(deferred.calls[4].navigation).toEqual({ breadcrumbs: [] });
    expect(controller.getSnapshot().breadcrumbs).toEqual([]);
    controller.dispose();
  });

  test("invoke stays an explicit host action and does not become insertion or submission", async () => {
    const deferred = deferredProvider("commands", "/");
    const controller = new ComposerProviderController();
    controller.update(context([deferred.provider], "/reload"));
    const action = {
      type: "invoke" as const,
      command: { providerId: "commands", commandId: "reload-tools" },
      arguments: { silent: true },
    };
    deferred.resolve(0, [{ id: "reload", label: "Reload tools", action }]);
    await settle();
    const selected = controller.select();
    expect(selected?.action).toEqual(action);
    action.arguments.silent = false;
    action.command.commandId = "changed-after-query";
    expect(selected?.action).toEqual({
      type: "invoke",
      command: { providerId: "commands", commandId: "reload-tools" },
      arguments: { silent: true },
    });
    expect(controller.getSnapshot().status).toBe("idle");
    expect(deferred.calls).toHaveLength(1);
    controller.dispose();
  });

  test("atomic references and claimed commands remain semantic effects for the rich adapter", async () => {
    const deferred = deferredProvider("commands", "/");
    const controller = new ComposerProviderController();
    controller.update(context([deferred.provider], "/review"));
    const action = {
      type: "insert" as const,
      command: { providerId: "commands", commandId: "review" },
      content: [
        {
          type: "reference" as const,
          nodeId: "one",
          providerId: "files",
          refId: "src.ts",
          label: "Source",
          plainText: "src.ts",
        },
      ],
    };
    deferred.resolve(0, [{ id: "review", label: "Review", action }]);
    await settle();
    const effect = controller.select();
    expect(effect?.action).toEqual(action);
    expect(Object.isFrozen(effect?.action)).toBe(true);
    if (effect?.action.type === "insert")
      expect(Object.isFrozen(effect.action.content[0])).toBe(true);
    controller.dispose();
  });

  test("reports provider errors and empty states with explicit retry using a fresh request", async () => {
    const deferred = deferredProvider();
    const controller = new ComposerProviderController();
    controller.update(context([deferred.provider]));
    deferred.calls[0].reject(new Error("Permission changed"));
    await settle();
    expect(controller.getSnapshot().status).toBe("error");
    expect(controller.getSnapshot().groups[0].error?.message).toBe(
      "Permission changed",
    );
    controller.retry();
    expect(controller.getSnapshot().status).toBe("loading");
    expect(deferred.calls[1].request.requestId).not.toBe(
      deferred.calls[0].request.requestId,
    );
    deferred.resolve(1, []);
    await settle();
    expect(controller.getSnapshot().status).toBe("empty");
    controller.dismiss();
    controller.update(context([deferred.provider]));
    expect(controller.getSnapshot().status).toBe("idle");
    expect(deferred.calls).toHaveLength(2);
    controller.dispose();
  });

  test("rejects mismatched response identities and duplicate candidates without displaying them", async () => {
    const deferred = deferredProvider();
    const controller = new ComposerProviderController();
    controller.update(context([deferred.provider]));
    deferred.calls[0].resolve({
      request: { ...deferred.calls[0].request, query: "different" },
      candidates: [candidate()],
    });
    await settle();
    expect(controller.getSnapshot().status).toBe("error");
    expect(controller.getSnapshot().items).toEqual([]);
    controller.retry();
    deferred.resolve(1, [candidate("same"), candidate("same")]);
    await settle();
    expect(controller.getSnapshot().groups[0].error?.message).toBe(
      "Duplicate suggestion identity",
    );
    expect(controller.getSnapshot().items).toEqual([]);
    controller.dispose();
  });

  test("dispose aborts work and prevents late notifications; explicit reactivation starts a new instance request", async () => {
    const deferred = deferredProvider();
    const controller = new ComposerProviderController();
    controller.update(context([deferred.provider]));
    let updates = 0;
    controller.subscribe(() => updates++);
    controller.dispose();
    expect(deferred.calls[0].signal.aborted).toBe(true);
    deferred.resolve(0);
    await settle();
    expect(updates).toBe(0);
    expect(controller.getSnapshot().status).toBe("idle");
    controller.update(context([deferred.provider]));
    expect(deferred.calls).toHaveLength(1);
    controller.activate();
    controller.update(context([deferred.provider]));
    expect(deferred.calls).toHaveLength(2);
    deferred.resolve(1);
    await settle();
    expect(controller.getSnapshot().items).toHaveLength(1);
    controller.dispose();
  });

  test("React hook survives StrictMode effect replay, controlled echoes and unmount", async () => {
    const deferred = deferredProvider();
    const input = context([deferred.provider]);
    const { result, rerender, unmount } = renderHook(
      ({ input }) => useComposerProviders(input),
      {
        initialProps: { input },
        wrapper: ({ children }) =>
          React.createElement(React.StrictMode, null, children),
      },
    );
    expect(deferred.calls.length).toBeGreaterThanOrEqual(1);
    const latest = deferred.calls.length - 1;
    await act(async () => {
      deferred.resolve(latest);
      await settle();
    });
    await waitFor(() => expect(result.current.snapshot.status).toBe("ready"));
    rerender({ input: { ...input } });
    expect(deferred.calls).toHaveLength(latest + 1);
    const controller = result.current.controller;
    unmount();
    expect(controller.getSnapshot().status).toBe("idle");
  });
});
