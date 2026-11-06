import { expect, test } from "bun:test";
import { act, fireEvent, screen } from "@testing-library/react";
import { createDuskmoonReactChat } from "phoenix_duskmoon/react-chat";
import {
  createComposerRecoveryOwner,
  type ComposerReceipt,
  type ComposerSubmission,
} from "@duskmoon-dev/components/chat";
import { createPhoenixComposer } from "./phoenix-composer";

async function mount() {
  const recovery = createComposerRecoveryOwner();
  const Composer = createPhoenixComposer({
    contextKey: "repo",
    recovery,
    capabilities: {
      protocolVersion: 1,
      documentVersions: [1],
      intents: ["send", "follow_up"],
      commands: false,
      attachments: false,
      queue: { edit: "none", remove: false, promote: false },
      durableRecovery: false,
    },
  });
  const events: {
    event: string;
    payload: Record<string, unknown>;
    reply: (reply: unknown) => void;
  }[] = [];
  const handlers = new Map<string, (event: unknown) => void>();
  const el = document.createElement("div");
  el.id = "phoenix-chat";
  el.dataset.chat = JSON.stringify({
    conversationId: "conversation",
    messages: [],
    event: "chat:event",
    label: "Phoenix consumer",
    actions: { send: "chat.send", sync: "chat.sync", stop: "chat.stop" },
  });
  document.body.append(el);
  const hook = Object.assign(
    Object.create(createDuskmoonReactChat({ Composer })),
    {
      el,
      handleEvent(event: string, callback: (event: unknown) => void) {
        handlers.set(event, callback);
        return event;
      },
      removeHandleEvent(event: string) {
        handlers.delete(event);
      },
      pushEvent(
        event: string,
        payload: Record<string, unknown>,
        reply: (reply: unknown) => void,
      ) {
        events.push({ event, payload, reply });
      },
    },
  );
  await act(async () => {
    hook.mounted();
  });
  const destroy = async () => {
    await act(async () => {
      hook.destroyed();
    });
    el.remove();
  };
  return { hook, events, recovery, destroy };
}
function receipt(snapshot: ComposerSubmission): ComposerReceipt {
  return {
    protocolVersion: 1,
    clientSubmissionId: snapshot.clientSubmissionId,
    scope: snapshot.scope,
    operation: snapshot.operation,
    outcome: "accepted",
    ...(snapshot.operation === "prompt"
      ? {
          delivery: "immediate" as const,
          persistence: "volatile" as const,
          messageId: "real-message",
        }
      : { result: { done: true } }),
  } as ComposerReceipt;
}

test("actual Phoenix factory Composer slot transports semantic snapshots and preserves definitive typed receipt", async () => {
  const s = await mount();
  try {
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Send" }));
    });
    const event = s.events[0];
    expect(event.event).toBe("chat.send");
    expect(event.payload.id).toBe("phoenix-chat");
    expect(event.payload.conversation_id).toBe("conversation");
    const snapshot = event.payload.composer_submission as ComposerSubmission;
    expect(event.payload.request_id).toBe(snapshot.clientSubmissionId);
    expect(snapshot.document.content).toEqual([
      { type: "text", text: "Phoenix draft 中文" },
    ]);
    await act(async () => {
      event.reply({ status: "ok", composer_receipt: receipt(snapshot) });
    });
    expect(s.recovery.getSnapshot()[0].status).toBe("accepted");
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe("");
  } finally {
    await s.destroy();
  }
});

test("generic transport ack and mismatched receipt never invent admission or erase draft", async () => {
  for (const mismatched of [false, true]) {
    const s = await mount();
    try {
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Send" }));
      });
      const snapshot = s.events[0].payload
        .composer_submission as ComposerSubmission;
      await act(async () => {
        s.events[0].reply(
          mismatched
            ? {
                status: "ok",
                composer_receipt: {
                  ...receipt(snapshot),
                  scope: {
                    contextKey: "wrong",
                    conversationId: "conversation",
                  },
                },
              }
            : { status: "ok" },
        );
      });
      expect(s.recovery.getSnapshot()[0].status).toBe("unknown");
      expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe(
        "Phoenix draft 中文",
      );
    } finally {
      await s.destroy();
    }
  }
});

test("typed rejection survives Phoenix's rejected bridge promise without becoming unknown", async () => {
  const s = await mount();
  try {
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Send" }));
    });
    const snapshot = s.events[0].payload
      .composer_submission as ComposerSubmission;
    const rejection: ComposerReceipt = {
      protocolVersion: 1,
      clientSubmissionId: snapshot.clientSubmissionId,
      scope: snapshot.scope,
      operation: snapshot.operation,
      outcome: "rejected",
      error: { code: "application_policy", message: "Choose another model" },
    };
    await act(async () => {
      s.events[0].reply({
        status: "error",
        message: "Application rejected the request",
        composer_receipt: rejection,
      });
    });
    expect(s.recovery.getSnapshot()[0].status).toBe("rejected");
    expect(s.recovery.getSnapshot()[0].receipt).toEqual(rejection);
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe(
      "Phoenix draft 中文",
    );
    expect(screen.getByRole("alert").textContent).toBe("Choose another model");
  } finally {
    await s.destroy();
  }
});

test("public disconnect rejects pending bridge request while retaining uncertain recovery", async () => {
  const s = await mount();
  try {
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Send" }));
    });
    await act(async () => {
      s.hook.disconnected();
    });
    expect(s.recovery.getSnapshot()[0].status).toBe("unknown");
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe(
      "Phoenix draft 中文",
    );
  } finally {
    await s.destroy();
  }
});
