import { expect, test } from "bun:test";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import React, {
  forwardRef,
  StrictMode,
  useLayoutEffect,
  useState,
} from "react";
import type {
  ComposerDocumentUpdate,
  ComposerDraft,
  ComposerReceipt,
  ComposerSubmission,
} from "./Composer.types";
import type { ComposerSessionHost } from "./ComposerSession.types";
import type { ChatSessionComposerProps } from "./ChatSessionComposer.types";
import { ChatSessionComposer } from "./ChatSessionComposer";
import { createComposerRecoveryOwner } from "./composer/session";
import { SemanticComposer } from "./composer/SemanticComposer";
import { PlainSemanticEditor } from "./composer/PlainSemanticEditor";
import type {
  ComposerEditorAdapterProps,
  ComposerEditorHandle,
} from "./composer/EditorAdapter.types";

function host(submit?: ComposerSessionHost["submit"]): ComposerSessionHost {
  return {
    recovery: createComposerRecoveryOwner(),
    capabilities: {
      protocolVersion: 1,
      documentVersions: [1],
      intents: ["send", "follow_up", "steer"],
      commands: true,
      attachments: true,
      queue: { edit: "none", remove: false, promote: false },
      durableRecovery: false,
    },
    submit: submit ?? (async (snapshot) => accept(snapshot)),
  };
}
function accept(snapshot: ComposerSubmission): ComposerReceipt {
  if (snapshot.operation !== "prompt") throw new Error("Unexpected command");
  return {
    protocolVersion: 1,
    clientSubmissionId: snapshot.clientSubmissionId,
    scope: snapshot.scope,
    operation: "prompt",
    outcome: "accepted",
    delivery: snapshot.intent === "send" ? "immediate" : snapshot.intent,
    persistence: "volatile",
  };
}
function Fixture({
  initial,
  ...props
}: Partial<ChatSessionComposerProps> & { initial?: ComposerDocumentUpdate }) {
  const [fallbackHost] = useState(() => host());
  const [value, setValue] = useState<ComposerDocumentUpdate>(
    initial ?? {
      document: {
        schemaVersion: 1,
        content: [{ type: "text", text: "Initial draft" }],
      },
      revision: 1,
      origin: "restore",
      originId: "host",
    },
  );
  return (
    <ChatSessionComposer
      host={fallbackHost}
      scope={{ contextKey: "repo", conversationId: "chat" }}
      draftKey="draft"
      {...props}
      value={value}
      onDocumentChange={setValue}
    />
  );
}

test("typed prompt admission uses the shared plain shell and clears only its current revision", async () => {
  const submissions: ComposerSubmission[] = [];
  render(
    <Fixture
      host={host(async (snapshot) => {
        submissions.push(snapshot);
        return accept(snapshot);
      })}
    />,
  );
  const message = screen.getByRole("textbox", { name: "Message" });
  expect((message as HTMLTextAreaElement).disabled).toBe(false);
  await act(async () => {
    fireEvent.keyDown(message, { key: "Enter", ctrlKey: true });
  });
  expect(submissions).toHaveLength(1);
  expect(submissions[0]).toMatchObject({
    operation: "prompt",
    intent: "send",
    document: { content: [{ text: "Initial draft" }] },
  });
  expect((message as HTMLTextAreaElement).value).toBe("");
  expect(screen.getByRole("status").textContent).toContain("volatile");
});

test("editing remains available during pending admission and newer text survives", async () => {
  let resolve!: (receipt: ComposerReceipt) => void;
  let submitted!: ComposerSubmission;
  const pending = new Promise<ComposerReceipt>((yes) => {
    resolve = yes;
  });
  render(
    <Fixture
      host={host(async (snapshot) => {
        submitted = snapshot;
        return pending;
      })}
    />,
  );
  const message = screen.getByRole("textbox", {
    name: "Message",
  }) as HTMLTextAreaElement;
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
  });
  expect(message.disabled).toBe(false);
  expect(
    (
      screen.getByRole("button", {
        name: "Send",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
  fireEvent.change(message, { target: { value: "A newer draft" } });
  await act(async () => {
    resolve(accept(submitted));
  });
  expect(message.value).toBe("A newer draft");
});

test("unknown outcomes retain a submitted snapshot separately from the live draft", async () => {
  const owner = host(async () => {
    throw new Error("Disconnected after transmit");
  });
  render(<Fixture host={owner} />);
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
  });
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "Next draft" },
  });
  expect(owner.recovery.getSnapshot()[0].snapshot.document.content).toEqual([
    { type: "text", text: "Initial draft" },
  ]);
  expect(owner.recovery.getSnapshot()[0].status).toBe("unknown");
  expect(
    screen.getByText("Submission outcome unknown — draft retained"),
  ).toBeTruthy();
  expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe(
    "Next draft",
  );
});

test("provider insertion consumes Enter without also submitting and uses a stable ARIA option ID", async () => {
  let sends = 0;
  const owner = host(async (snapshot) => {
    sends++;
    return accept(snapshot);
  });
  render(
    <Fixture
      host={owner}
      providers={[
        {
          providerId: "skills",
          label: "Skills",
          trigger: { text: "/", position: "leading" },
          query: async (request) => ({
            request,
            candidates: [
              {
                id: "explain",
                label: "Explain",
                action: {
                  type: "insert",
                  content: [{ type: "text", text: "/explain " }],
                },
              },
            ],
          }),
        },
      ]}
    />,
  );
  const message = screen.getByRole("textbox") as HTMLTextAreaElement;
  await act(async () => {
    fireEvent.change(message, { target: { value: "/ex" } });
  });
  const option = screen.getByRole("option", { name: "Skills: Explain" });
  expect(message.getAttribute("aria-activedescendant")).toBe(option.id);
  await act(async () => {
    fireEvent.keyDown(message, { key: "Enter" });
  });
  expect(message.value).toBe("/explain ");
  expect(sends).toBe(0);
});

test("plain semantic sessions preserve structured input behind an explicit export path", () => {
  const reference = {
    type: "reference" as const,
    nodeId: "occurrence",
    providerId: "files",
    refId: "readme",
    label: "README",
    plainText: "@README",
  };
  render(
    <Fixture
      initial={{
        revision: 2,
        origin: "restore",
        originId: "host",
        document: { schemaVersion: 1, content: [reference] },
      }}
    />,
  );
  expect(screen.queryByRole("textbox")).toBeNull();
  expect(
    screen
      .getByRole("link", { name: "Export preserved draft" })
      .getAttribute("href"),
  ).toContain("occurrence");
  expect(
    (
      screen.getByRole("button", {
        name: "Send",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
});

test("StrictMode effect replay leaves a live session and native editor", async () => {
  const owner = host();
  render(
    <StrictMode>
      <Fixture host={owner} />
    </StrictMode>,
  );
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
  });
  expect(owner.recovery.getSnapshot()[0].status).toBe("accepted");
  expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe("");
});

test("consumer prevention runs before configured Enter admission and candidate selection", async () => {
  const owner = host();
  render(
    <Fixture
      host={owner}
      policy={{ shortcut: "enter" }}
      onKeyDown={(event) => event.preventDefault()}
    />,
  );
  await act(async () =>
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" }),
  );
  expect(owner.recovery.getSnapshot()).toEqual([]);
  expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe(
    "Initial draft",
  );
});

test("adapter-disabled candidates are skipped by initial and wrapped keyboard navigation", async () => {
  render(
    <Fixture
      providers={[
        {
          providerId: "choices",
          trigger: { text: "/", position: "leading" },
          query: async (request) => ({
            request,
            candidates: [
              {
                id: "rich",
                label: "Atomic reference",
                action: {
                  type: "insert",
                  content: [
                    {
                      type: "reference",
                      nodeId: "r",
                      providerId: "files",
                      refId: "readme",
                      label: "README",
                      plainText: "@README",
                    },
                  ],
                },
              },
              {
                id: "text",
                label: "Editable skill",
                action: {
                  type: "insert",
                  content: [{ type: "text", text: "/explain " }],
                },
              },
              {
                id: "invoke",
                label: "Unavailable host action",
                action: {
                  type: "invoke",
                  command: { providerId: "commands", commandId: "reload" },
                },
              },
            ],
          }),
        },
      ]}
    />,
  );
  const message = screen.getByRole("textbox") as HTMLTextAreaElement;
  await act(async () => fireEvent.change(message, { target: { value: "/" } }));
  const option = screen.getByRole("option", { name: /Editable skill/ });
  expect(message.getAttribute("aria-activedescendant")).toBe(option.id);
  fireEvent.keyDown(message, { key: "ArrowDown" });
  expect(message.getAttribute("aria-activedescendant")).toBe(option.id);
  await act(async () => fireEvent.keyDown(message, { key: "Enter" }));
  expect(message.value).toBe("/explain ");
  expect(message.selectionStart).toBe(message.value.length);
});

test("stored drafts restore with a new controlled revision and save only on request", async () => {
  const saved: unknown[] = [];
  render(
    <Fixture
      draftAdapter={{
        load: async () => "Stored 日本語 draft",
        save: async (draft) => {
          saved.push(draft);
        },
      }}
    />,
  );
  await act(async () => {});
  expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe(
    "Stored 日本語 draft",
  );
  expect(saved).toEqual([]);
  await act(async () =>
    fireEvent.click(screen.getByRole("button", { name: "Save draft" })),
  );
  expect(saved).toHaveLength(1);
  expect(saved[0]).toMatchObject({
    revision: 2,
    document: { content: [{ text: "Stored 日本語 draft" }] },
  });
});

test("a late stored draft remains exportable while newer typing wins", async () => {
  let resolve!: (input: unknown) => void;
  const loaded = new Promise((yes) => {
    resolve = yes;
  });
  render(
    <Fixture draftAdapter={{ load: () => loaded, save: async () => {} }} />,
  );
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "Typed before storage answered" },
  });
  await act(async () => resolve("Older stored draft"));
  expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe(
    "Typed before storage answered",
  );
  expect(
    screen
      .getByRole("link", { name: "Export preserved draft" })
      .getAttribute("href"),
  ).toContain("Older%20stored%20draft");
  await act(async () =>
    fireEvent.click(
      screen.getByRole("button", { name: "Restore stored draft" }),
    ),
  );
  expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe(
    "Older stored draft",
  );
});

test("unsupported storage is never overwritten without its explicit recovery action", async () => {
  const saved: unknown[] = [];
  render(
    <Fixture
      draftAdapter={{
        load: async () => ({ draftVersion: 99, future: "preserve me" }),
        save: async (draft) => {
          saved.push(draft);
        },
      }}
    />,
  );
  await act(async () => {});
  const storage = screen.getByLabelText("Draft storage");
  const save = within(storage).getByRole("button", {
    name: "Save draft",
  }) as HTMLButtonElement;
  expect(save.disabled).toBe(true);
  expect(saved).toEqual([]);
  expect(
    within(storage)
      .getByRole("link", { name: "Export preserved draft" })
      .getAttribute("href"),
  ).toContain("preserve%20me");
  fireEvent.click(
    within(storage).getByRole("button", {
      name: "Allow replacing this stored draft",
    }),
  );
  await act(async () => fireEvent.click(save));
  expect(saved).toHaveLength(1);
});

test("late acceptance removes submitted occurrences while a reselected same File survives", async () => {
  let resolve!: (receipt: ComposerReceipt) => void;
  let submitted!: ComposerSubmission;
  const pending = new Promise<ComposerReceipt>((yes) => {
    resolve = yes;
  });
  const owner = host(async (snapshot) => {
    submitted = snapshot;
    return pending;
  });
  const file = new File(["original"], "same.txt", { type: "text/plain" });
  const { container } = render(
    <Fixture
      host={owner}
      attachmentOptions={{
        prepare: async () => ({ providerId: "host", reference: "prepared" }),
      }}
    />,
  );
  const picker = container.querySelector('input[type="file"]')!;
  await act(async () =>
    fireEvent.change(picker, { target: { files: [file] } }),
  );
  await act(async () =>
    fireEvent.click(screen.getByRole("button", { name: "Send" })),
  );
  fireEvent.click(screen.getByRole("button", { name: "Remove same.txt" }));
  await act(async () =>
    fireEvent.change(picker, { target: { files: [file] } }),
  );
  await act(async () => resolve(accept(submitted)));
  expect(screen.getByRole("button", { name: "Remove same.txt" })).toBeTruthy();
  expect(submitted.attachments).toHaveLength(1);
});

test.each([false, true])(
  "changing draft keys clears local files before saving/submitting (stored replacement: %s)",
  async (storedReplacement) => {
    const submitted: ComposerSubmission[] = [];
    const saved: ComposerDraft[] = [];
    let pendingContext!: { signal: AbortSignal };
    let finishPreparation!: (handle: {
      providerId: string;
      reference: string;
    }) => void;
    const pending = new Promise<{ providerId: string; reference: string }>(
      (resolve) => {
        finishPreparation = resolve;
      },
    );
    const nextDraft: ComposerDraft = {
      draftVersion: 1,
      scope: { contextKey: "repo", conversationId: "chat" },
      draftKey: "second",
      revision: 5,
      document: {
        schemaVersion: 1,
        content: [{ type: "text", text: "Second draft" }],
      },
      attachments: [
        {
          entryId: "second-handle",
          metadata: { name: "restored.txt", mediaType: "text/plain", size: 3 },
          status: "ready",
          handle: { providerId: "host", reference: "second" },
        },
      ],
    };
    const config: Partial<ChatSessionComposerProps> = {
      host: host(async (snapshot) => {
        submitted.push(snapshot);
        return accept(snapshot);
      }),
      attachmentOptions: {
        canRecover: () => true,
        prepare: (file, context) => {
          if (file.name === "pending.txt") {
            pendingContext = context;
            return pending;
          }
          return { providerId: "host", reference: "first" };
        },
      },
      draftAdapter: {
        load: async ({ draftKey }) =>
          draftKey === "second" && storedReplacement ? nextDraft : null,
        save: async (draft) => {
          saved.push(draft);
        },
      },
    };
    const view = render(<Fixture {...config} draftKey="first" />);
    await act(async () => {});
    await act(async () =>
      fireEvent.change(view.container.querySelector('input[type="file"]')!, {
        target: {
          files: [
            new File(["ready"], "ready.txt"),
            new File(["pending"], "pending.txt"),
          ],
        },
      }),
    );
    expect(
      screen.getByRole("button", { name: "Remove ready.txt" }),
    ).toBeTruthy();
    await act(async () =>
      view.rerender(<Fixture {...config} draftKey="second" />),
    );
    expect(pendingContext.signal.aborted).toBe(true);
    expect(
      screen.queryByRole("button", { name: "Remove ready.txt" }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Remove pending.txt" }),
    ).toBeNull();
    expect(
      Boolean(screen.queryByRole("button", { name: "Remove restored.txt" })),
    ).toBe(storedReplacement);
    await act(async () =>
      finishPreparation({ providerId: "host", reference: "late-first" }),
    );
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: "Save draft" })),
    );
    expect(saved).toHaveLength(1);
    expect(saved[0].draftKey).toBe("second");
    expect(saved[0].attachments.map(({ entryId }) => entryId)).toEqual(
      storedReplacement ? ["second-handle"] : [],
    );
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: "Send" })),
    );
    expect(submitted).toHaveLength(1);
    expect(submitted[0].draftKey).toBe("second");
    expect(submitted[0].attachments.map(({ entryId }) => entryId)).toEqual(
      storedReplacement ? ["second-handle"] : [],
    );
  },
);

test("editor failures belong to their scope and cannot poison the next conversation", async () => {
  const Adapter = forwardRef<ComposerEditorHandle, ComposerEditorAdapterProps>(
    (props, ref) => {
      const { instanceGeneration, onError } = props;
      useLayoutEffect(() => {
        if (instanceGeneration === 0) onError?.(new Error("Old editor failed"));
      }, [instanceGeneration, onError]);
      return <PlainSemanticEditor {...props} ref={ref} />;
    },
  );
  const owner = host();
  const value: ComposerDocumentUpdate = {
    revision: 1,
    origin: "restore",
    originId: "host",
    document: {
      schemaVersion: 1,
      content: [{ type: "text", text: "Preserved" }],
    },
  };
  const props = {
    Editor: Adapter,
    structured: false,
    host: owner,
    value,
    onDocumentChange: () => {},
    draftKey: "draft",
  };
  const view = render(
    <SemanticComposer
      {...props}
      scope={{ contextKey: "repo", conversationId: "a" }}
    />,
  );
  expect(screen.getByText(/Old editor failed/)).toBeTruthy();
  view.rerender(
    <SemanticComposer
      {...props}
      scope={{ contextKey: "repo", conversationId: "b" }}
    />,
  );
  expect(screen.queryByText(/Old editor failed/)).toBeNull();
  expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe(
    "Preserved",
  );
});

test("folder suggestions support mouse drill, keyboard return and insertion without submission", async () => {
  const owner = host();
  render(
    <Fixture
      host={owner}
      providers={[
        {
          providerId: "files",
          trigger: { text: "@", position: "word" },
          query: async (request, _signal, navigation) => ({
            request,
            candidates: navigation?.refId
              ? [
                  {
                    id: "file",
                    label: "Notes",
                    action: {
                      type: "insert",
                      content: [{ type: "text", text: "notes.txt " }],
                    },
                  },
                ]
              : [
                  {
                    id: "folder",
                    label: "Source folder",
                    action: { type: "drill", refId: "src" },
                  },
                ],
          }),
        },
      ]}
    />,
  );
  const message = screen.getByRole("textbox") as HTMLTextAreaElement;
  await act(async () => fireEvent.change(message, { target: { value: "@" } }));
  const folder = screen.getByRole("option", { name: /Source folder/ });
  await act(async () => {
    fireEvent.mouseDown(folder);
    fireEvent.click(folder);
  });
  expect(
    screen.getByRole("navigation", { name: "Suggestion folders" }),
  ).toBeTruthy();
  expect(screen.getByRole("option", { name: /Notes/ })).toBeTruthy();
  await act(async () =>
    fireEvent.keyDown(message, { key: "ArrowLeft", altKey: true }),
  );
  expect(screen.getByRole("option", { name: /Source folder/ })).toBeTruthy();
  await act(async () => fireEvent.keyDown(message, { key: "Enter" }));
  await act(async () => fireEvent.keyDown(message, { key: "Enter" }));
  expect(message.value).toBe("notes.txt ");
  expect(owner.recovery.getSnapshot()).toEqual([]);
});

test("a rejected provider invocation cannot show an old scope error in the new conversation", async () => {
  let reject!: (cause: unknown) => void;
  const pending = new Promise<void>((_resolve, no) => {
    reject = no;
  });
  const providers: ChatSessionComposerProps["providers"] = [
    {
      providerId: "commands",
      trigger: { text: "/", position: "leading" },
      query: async (request) => ({
        request,
        candidates: [
          {
            id: "reload",
            label: "Reload",
            action: {
              type: "invoke",
              command: { providerId: "commands", commandId: "reload" },
            },
          },
        ],
      }),
    },
  ];
  const props = { host: host(), providers, onProviderInvoke: () => pending };
  const view = render(
    <Fixture {...props} scope={{ contextKey: "repo", conversationId: "a" }} />,
  );
  await act(async () =>
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "/" } }),
  );
  await act(async () =>
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" }),
  );
  view.rerender(
    <Fixture {...props} scope={{ contextKey: "repo", conversationId: "b" }} />,
  );
  await act(async () => reject(new Error("Old conversation action failed")));
  expect(screen.queryByRole("alert")).toBeNull();
});
