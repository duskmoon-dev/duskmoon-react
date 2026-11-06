import React from "react";
import { expect, test } from "bun:test";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { ChatAuthoritativeQueue } from "./ChatAuthoritativeQueue";
import { ChatQueue } from "./ChatPrimitives";
import type {
  ComposerQueueMutation,
  ComposerQueueMutationResult,
  ComposerQueueProjection,
} from "./Composer.types";
import type { ChatAuthoritativeQueueProps } from "./ComposerQueue.types";

const capabilities = { edit: "text" as const, remove: true, promote: true };
function projection(revision = 1, ids = ["a", "b"]): ComposerQueueProjection {
  return {
    protocolVersion: 1,
    scope: { contextKey: "repo", conversationId: "chat" },
    revision,
    items: ids.map((id) => ({
      id,
      document: {
        schemaVersion: 1,
        content: [{ type: "text", text: `Message ${id}` }],
      },
      attachments: [],
      capabilities,
    })),
  };
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((yes) => {
    resolve = yes;
  });
  return { promise, resolve };
}
function props(
  overrides: Partial<ChatAuthoritativeQueueProps> = {},
): ChatAuthoritativeQueueProps {
  return {
    projection: projection(),
    capabilities,
    targetTurnId: "turn1",
    onProjection: () => {},
    onMutation: async (request) => ({
      requestId: request.requestId,
      outcome: "accepted",
      projection: projection(2),
    }),
    ...overrides,
  };
}

test("legacy Chat.Queue callbacks remain usable without changing confirmed rows", () => {
  const actions: string[] = [];
  render(
    <ChatQueue
      items={[{ id: "a", text: "Legacy" }]}
      onSteer={(id) => actions.push(`steer:${id}`)}
      onRemove={(id) => actions.push(`remove:${id}`)}
    />,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Steer waiting message 1" }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Remove waiting message 1" }),
  );
  expect(actions).toEqual(["steer:a", "remove:a"]);
  expect(screen.getByText("Legacy")).toBeTruthy();
});

test("remove captures revision, remains pending, and applies only host projection", async () => {
  const pending = deferred<ComposerQueueMutationResult>();
  let request!: ComposerQueueMutation;
  const applied: ComposerQueueProjection[] = [];
  const config = props({
    onMutation: async (value) => {
      request = value;
      return pending.promise;
    },
    onProjection: (value) => applied.push(value),
  });
  const view = render(<ChatAuthoritativeQueue {...config} />);
  fireEvent.click(
    screen.getByRole("button", { name: "Remove waiting message 1" }),
  );
  expect(request.operation).toBe("remove");
  expect(request.expectedRevision).toBe(1);
  expect(screen.getByText("Message a")).toBeTruthy();
  expect(
    (
      screen.getByRole("button", {
        name: "Remove waiting message 1",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
  await act(async () => {
    pending.resolve({
      requestId: request.requestId,
      outcome: "accepted",
      projection: projection(2, ["b"]),
    });
  });
  expect(applied).toHaveLength(1);
  expect(screen.getByText("Message a")).toBeTruthy();
  view.rerender(<ChatAuthoritativeQueue {...config} projection={applied[0]} />);
  expect(screen.queryByText("Message a")).toBeNull();
});

test("a rejected queued replacement can be corrected and retried against the canonical revision", async () => {
  const mutations: ComposerQueueMutation[] = [];
  let current = projection();
  function Fixture() {
    const [value, setValue] = React.useState(current);
    return (
      <ChatAuthoritativeQueue
        {...props()}
        projection={value}
        onProjection={(next) => {
          current = next;
          setValue(next);
        }}
        onMutation={async (request) => {
          mutations.push(request);
          return mutations.length === 1
            ? {
                requestId: request.requestId,
                outcome: "rejected",
                error: {
                  code: "policy",
                  message: "Please correct the replacement",
                },
                projection: projection(3),
              }
            : {
                requestId: request.requestId,
                outcome: "accepted",
                projection: projection(4),
              };
        }}
      />
    );
  }
  render(<Fixture />);
  fireEvent.click(
    screen.getByRole("button", { name: "Edit waiting message 1" }),
  );
  fireEvent.change(screen.getByRole("textbox", { name: "Queued message" }), {
    target: { value: "Replacement" },
  });
  await act(async () => {
    fireEvent.click(
      screen.getByRole("button", { name: "Save queued message" }),
    );
  });
  expect(current.revision).toBe(3);
  expect(
    (
      screen.getByRole("textbox", {
        name: "Queued message",
      }) as HTMLTextAreaElement
    ).value,
  ).toBe("Replacement");
  fireEvent.change(screen.getByRole("textbox", { name: "Queued message" }), {
    target: { value: "Corrected replacement" },
  });
  await act(async () => {
    fireEvent.click(
      screen.getByRole("button", { name: "Save queued message" }),
    );
  });
  expect(mutations[1].expectedRevision).toBe(3);
  expect(mutations[1].operation).toBe("edit");
  if (mutations[1].operation === "edit")
    expect(mutations[1].document.content).toEqual([
      { type: "text", text: "Corrected replacement" },
    ]);
  expect(screen.queryByRole("textbox", { name: "Queued message" })).toBeNull();
});

test("editing captures opening revision; consumed-item rejection applies canonical projection", async () => {
  const mutations: ComposerQueueMutation[] = [];
  const applied: ComposerQueueProjection[] = [];
  const config = props({
    onProjection: (value) => applied.push(value),
    onMutation: async (request) => {
      mutations.push(request);
      return {
        requestId: request.requestId,
        outcome: "rejected",
        error: { code: "consumed", message: "Message already started" },
        projection: projection(3, ["b"]),
      };
    },
  });
  const view = render(<ChatAuthoritativeQueue {...config} />);
  fireEvent.click(
    screen.getByRole("button", { name: "Edit waiting message 1" }),
  );
  fireEvent.change(screen.getByRole("textbox", { name: "Queued message" }), {
    target: { value: "Corrected" },
  });
  view.rerender(
    <ChatAuthoritativeQueue
      {...config}
      projection={projection(2, ["b", "a"])}
    />,
  );
  await act(async () => {
    fireEvent.click(
      screen.getByRole("button", { name: "Save queued message" }),
    );
  });
  expect(mutations[0].expectedRevision).toBe(1);
  expect(mutations[0].itemId).toBe("a");
  expect(mutations[0].operation).toBe("edit");
  if (mutations[0].operation === "edit")
    expect(mutations[0].document.content).toEqual([
      { type: "text", text: "Corrected" },
    ]);
  expect(applied[0].revision).toBe(3);
  expect(screen.getByRole("alert").textContent).toBe("Message already started");
  view.rerender(<ChatAuthoritativeQueue {...config} projection={applied[0]} />);
  expect(
    (
      screen.getByRole("textbox", {
        name: "Queued message",
      }) as HTMLTextAreaElement
    ).value,
  ).toBe("Corrected");
  expect(screen.queryByText("Message a")).toBeNull();
  expect(
    (
      screen.getByRole("button", {
        name: "Save queued message",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
});

test("reconnect/newer projection wins over late ack; scope switch cancels request", async () => {
  const first = deferred<ComposerQueueMutationResult>();
  const second = deferred<ComposerQueueMutationResult>();
  const mutations: ComposerQueueMutation[] = [];
  const signals: AbortSignal[] = [];
  const applied: ComposerQueueProjection[] = [];
  const config = props({
    onProjection: (value) => applied.push(value),
    onMutation: async (request, signal) => {
      mutations.push(request);
      signals.push(signal);
      return mutations.length === 1 ? first.promise : second.promise;
    },
  });
  const view = render(<ChatAuthoritativeQueue {...config} />);
  fireEvent.click(
    screen.getByRole("button", { name: "Remove waiting message 1" }),
  );
  view.rerender(
    <ChatAuthoritativeQueue
      {...config}
      projection={projection(8, ["b", "a"])}
    />,
  );
  await act(async () => {
    first.resolve({
      requestId: mutations[0].requestId,
      outcome: "accepted",
      projection: projection(2, ["b"]),
    });
  });
  expect(applied).toHaveLength(0);
  expect(screen.getByText("Message a")).toBeTruthy();
  fireEvent.click(
    screen.getByRole("button", { name: "Steer waiting message 1" }),
  );
  expect(mutations[1].operation).toBe("promote");
  if (mutations[1].operation === "promote")
    expect(mutations[1].targetTurnId).toBe("turn1");
  view.rerender(
    <ChatAuthoritativeQueue
      {...config}
      projection={{
        ...projection(),
        scope: { contextKey: "other", conversationId: "new" },
      }}
    />,
  );
  expect(signals[1].aborted).toBe(true);
  await act(async () => {
    second.resolve({
      requestId: mutations[1].requestId,
      outcome: "accepted",
      projection: projection(9),
    });
  });
  expect(applied).toHaveLength(0);
});

test("malformed ack identity is rejected and structured text edits stay unavailable", async () => {
  let applies = 0;
  const structured = projection();
  const withReference = {
    ...structured,
    items: [
      {
        ...structured.items[0],
        document: {
          schemaVersion: 1 as const,
          content: [
            {
              type: "reference" as const,
              nodeId: "r",
              providerId: "files",
              refId: "readme",
              label: "README",
              plainText: "@README",
            },
          ],
        },
      },
    ],
  };
  render(
    <ChatAuthoritativeQueue
      {...props({
        projection: withReference,
        onProjection: () => {
          applies++;
        },
        onMutation: async () => ({
          requestId: "wrong",
          outcome: "accepted",
          projection: projection(2),
        }),
      })}
    />,
  );
  expect(
    screen.queryByRole("button", { name: "Edit waiting message 1" }),
  ).toBeNull();
  await act(async () => {
    fireEvent.click(
      screen.getByRole("button", { name: "Remove waiting message 1" }),
    );
  });
  expect(applies).toBe(0);
  expect(screen.getByRole("alert").textContent).toContain(
    "Invalid queue acknowledgment identity",
  );
});

test("document editing uses an explicit host editor and retains semantic reference identity", async () => {
  const document = {
    schemaVersion: 1 as const,
    content: [
      {
        type: "reference" as const,
        nodeId: "ref",
        providerId: "files",
        refId: "readme",
        label: "README",
        plainText: "@README",
      },
    ],
  };
  const current = projection();
  let received!: ComposerQueueMutation;
  render(
    <ChatAuthoritativeQueue
      {...props({
        capabilities: { ...capabilities, edit: "document" },
        projection: {
          ...current,
          items: [
            {
              ...current.items[0],
              document,
              capabilities: { ...capabilities, edit: "document" },
            },
          ],
        },
        renderDocumentEditor: (editor) => (
          <button type="button" onClick={editor.onSave}>
            Host save reference
          </button>
        ),
        onMutation: async (request) => {
          received = request;
          return {
            requestId: request.requestId,
            outcome: "accepted",
            projection: projection(2),
          };
        },
      })}
    />,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Edit waiting message 1" }),
  );
  expect(screen.queryByRole("textbox")).toBeNull();
  await act(async () => {
    fireEvent.click(
      screen.getByRole("button", { name: "Host save reference" }),
    );
  });
  expect(received.operation).toBe("edit");
  if (received.operation === "edit")
    expect(received.document).toEqual(document);
});
