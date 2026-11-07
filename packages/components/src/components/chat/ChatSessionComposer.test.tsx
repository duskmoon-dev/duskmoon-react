import { afterEach, expect, test } from "bun:test";
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
import type { ComposerAttachmentPreparationContext } from "./ComposerAttachment.types";
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

const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;
afterEach(() => {
  URL.createObjectURL = originalCreateObjectURL;
  URL.revokeObjectURL = originalRevokeObjectURL;
});

function imagePreviews() {
  let nextId = 0;
  const revoked: string[] = [];
  URL.createObjectURL = () => `blob:session-image-${++nextId}`;
  URL.revokeObjectURL = (url) => revoked.push(url);
  return revoked;
}

test("compact sessions retain host intent labels and switch the primary action after admission", async () => {
  const submissions: ComposerSubmission[] = [];
  let stops = 0;
  const { container } = render(
    <Fixture
      compact
      runtime={{ status: "running", activeTurnId: "turn" }}
      attachLabel="Add a file"
      stopLabel="Stop demo turn"
      attachmentOptions={{
        prepare: () => ({ providerId: "host", reference: "ready" }),
      }}
      onStop={() => stops++}
      host={host(async (snapshot) => {
        submissions.push(snapshot);
        return accept(snapshot);
      })}
    >
      <button type="button">Host settings</button>
    </Fixture>,
  );
  const send = screen.getByRole("button", { name: "Send follow-up" });
  expect(screen.queryByRole("button", { name: "Stop demo turn" })).toBeNull();
  const attach = screen.getByRole("button", { name: "Add a file" });
  expect(send.textContent).toBe("");
  expect(attach.parentElement?.className).toContain(
    "chat-composer-toolbar-compact",
  );
  expect(
    screen.getByRole("button", { name: "Host settings" }).parentElement,
  ).toBe(send.parentElement);
  expect(
    container.querySelector(".chat-composer")?.hasAttribute("compact"),
  ).toBe(false);
  await act(async () => fireEvent.click(send));
  const stop = screen.getByRole("button", { name: "Stop demo turn" });
  expect(stop.querySelector("svg")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Send follow-up" })).toBeNull();
  fireEvent.click(stop);
  expect(submissions).toHaveLength(1);
  expect(submissions[0]).toMatchObject({
    operation: "prompt",
    intent: "follow_up",
  });
  expect(submissions[0]).not.toHaveProperty("targetTurnId");
  expect(stops).toBe(1);
});

test("compact sessions tile only actual ready image previews and preserve default Ready rows", async () => {
  const revoked = imagePreviews();
  const attachmentOptions = {
    prepare: () => ({ providerId: "host", reference: "ready" }),
  };
  const { container, rerender } = render(
    <Fixture compact attachmentOptions={attachmentOptions} />,
  );
  const picker = container.querySelector('input[type="file"]')!;
  const image = new File(["image"], "ready.png", { type: "image/png" });
  await act(async () =>
    fireEvent.change(picker, { target: { files: [image] } }),
  );
  expect(screen.getByRole("list", { name: "Attachments" }).className).toContain(
    "chat-composer-thumbnails",
  );
  const preview = screen.getByRole("img", { name: "ready.png" });
  expect(preview.className).toBe("chat-composer-preview");
  const previewUrl = preview.getAttribute("src")!;
  expect(screen.queryByText("Ready")).toBeNull();
  await act(async () =>
    fireEvent.change(picker, {
      target: {
        files: [new File(["notes"], "notes.txt", { type: "text/plain" })],
      },
    }),
  );
  expect(container.querySelector(".chat-composer-thumbnails")).toBeNull();
  expect(
    container.querySelectorAll(".chat-composer-attachment-info"),
  ).toHaveLength(2);
  expect(screen.getAllByText("Ready")).toHaveLength(2);
  fireEvent.click(screen.getByRole("button", { name: "Remove notes.txt" }));
  expect(
    container.querySelector(".chat-composer-attachment-tile"),
  ).toBeTruthy();
  rerender(<Fixture attachmentOptions={attachmentOptions} />);
  expect(container.querySelector(".chat-composer-thumbnails")).toBeNull();
  expect(screen.getByText("Ready")).toBeTruthy();
  expect(screen.getByText("ready.png")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Remove ready.png" }));
  expect(revoked).toContain(previewUrl);
});

test("compact lifecycle rows expose Core progress, preparation errors, Retry and Cancel", async () => {
  imagePreviews();
  let context!: ComposerAttachmentPreparationContext;
  let fail!: (cause: Error) => void;
  const { container } = render(
    <Fixture
      compact
      attachmentOptions={{
        prepare: (_file, nextContext) => {
          context = nextContext;
          return new Promise((_resolve, reject) => {
            fail = reject;
          });
        },
      }}
    />,
  );
  const picker = container.querySelector('input[type="file"]')!;
  await act(async () =>
    fireEvent.change(picker, {
      target: {
        files: [new File(["image"], "upload.png", { type: "image/png" })],
      },
    }),
  );
  expect(screen.getByText("preparing")).toBeTruthy();
  act(() => context.reportProgress(0.4));
  const progress = screen.getByRole("progressbar", {
    name: "Preparing upload.png",
  }) as HTMLProgressElement;
  expect(progress.className).toBe("progress");
  expect(progress.value).toBe(0.4);
  expect(progress.max).toBe(1);
  expect(container.querySelector(".chat-composer-attachment-tile")).toBeNull();
  expect(screen.getByText("uploading")).toBeTruthy();
  expect(
    screen.getByRole("button", { name: "Cancel upload.png" }),
  ).toBeTruthy();
  await act(async () => fail(new Error("Host rejected upload")));
  expect(screen.getByText("Host rejected upload")).toBeTruthy();
  expect(screen.getByText("upload.png")).toBeTruthy();
  expect(screen.queryByRole("progressbar")).toBeNull();
  await act(async () =>
    fireEvent.click(screen.getByRole("button", { name: "Retry upload.png" })),
  );
  fireEvent.click(screen.getByRole("button", { name: "Cancel upload.png" }));
  expect(context.signal.aborted).toBe(true);
  expect(screen.getByText("cancelled")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Retry upload.png" })).toBeTruthy();
  expect(
    screen.getByRole("button", { name: "Remove upload.png" }),
  ).toBeTruthy();
  expect(container.querySelector(".chat-composer-thumbnails")).toBeNull();
});

test("compact draft menu keeps explicit save/reload without changing editor identity or adding status rows", async () => {
  const saved: ComposerDraft[] = [];
  let loads = 0;
  render(
    <Fixture
      compact
      draftAdapter={{
        load: async () => {
          loads++;
          return undefined;
        },
        save: async (draft) => {
          saved.push(draft);
        },
      }}
    />,
  );
  await act(async () => {});
  const save = screen.getByRole("button", { name: "Save draft" });
  const reload = screen.getByRole("button", {
    name: "Reload stored draft",
  });
  const editor = screen.getByRole("textbox");
  expect(save.textContent).toBe("Save draft");
  expect(reload.textContent).toBe("Reload stored draft");
  expect(save.querySelector('svg[aria-hidden="true"]')).toBeTruthy();
  expect(save.closest("[popover]")?.getAttribute("aria-label")).toBe(
    "Add files and more",
  );
  expect(saved).toHaveLength(0);
  await act(async () => fireEvent.click(save));
  expect(saved).toHaveLength(1);
  expect(saved[0].document.content).toEqual([
    { type: "text", text: "Initial draft" },
  ]);
  expect(screen.getByText("Draft saved by host storage.")).toBeTruthy();
  expect(screen.getByText("Draft saved by host storage.").className).toBe(
    "sr-only",
  );
  expect(screen.getByRole("textbox")).toBe(editor);
  const beforeReload = loads;
  await act(async () => fireEvent.click(reload));
  expect(loads).toBe(beforeReload + 1);
});

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

test("compact pending admission has no hidden interactive controls and reveals unknown recovery", async () => {
  let resolve!: (receipt: ComposerReceipt) => void;
  let submitted!: ComposerSubmission;
  const pending = new Promise<ComposerReceipt>((yes) => {
    resolve = yes;
  });
  const owner: ComposerSessionHost = {
    ...host(async (snapshot) => {
      submitted = snapshot;
      return pending;
    }),
    reconcile: async (snapshot) => accept(snapshot),
  };
  render(<Fixture compact host={owner} />);
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
  });
  const status = screen.getByText("Awaiting admission");
  expect(status.getAttribute("role")).toBe("status");
  expect(status.className).toBe("sr-only");
  expect(status.closest("details")).toBeNull();
  expect(
    screen.queryByRole("button", {
      name: "Check submission status",
      hidden: true,
    }),
  ).toBeNull();
  await act(async () => {
    resolve({
      protocolVersion: 1,
      scope: submitted.scope,
      clientSubmissionId: submitted.clientSubmissionId,
      operation: "prompt",
      outcome: "unknown",
      error: { code: "lost", message: "Admission response lost" },
    });
  });
  const summary = screen.getByText(
    "Submission outcome unknown — draft retained",
  );
  expect(summary.closest("details")?.className).toBe("chat-composer-status");
  fireEvent.click(summary);
  expect(
    screen
      .getByRole("button", { name: "Check submission status", hidden: true })
      .closest(".sr-only"),
  ).toBeNull();
  expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe(
    "Initial draft",
  );
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
