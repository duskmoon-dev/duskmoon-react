import { describe, expect, test } from "bun:test";
import type { ComposerReceipt, ComposerSubmission } from "../Composer.types";
import type {
  ComposerAttempt,
  ComposerSessionContext,
} from "../ComposerSession.types";
import {
  composerActionEligibility,
  createComposerRecoveryOwner,
  createComposerSessionController,
  snapshotComposerReceipt,
} from "./session";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (cause: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

function accepted(snapshot: ComposerSubmission): ComposerReceipt {
  const common = {
    protocolVersion: 1 as const,
    clientSubmissionId: snapshot.clientSubmissionId,
    scope: snapshot.scope,
    outcome: "accepted" as const,
  };
  return snapshot.operation === "command"
    ? { ...common, operation: "command", result: { toolsReloaded: true } }
    : {
        ...common,
        operation: "prompt",
        delivery: snapshot.intent === "send" ? "immediate" : snapshot.intent,
        persistence: "volatile",
        messageId: "actual-message-id",
      };
}

function setup(overrides: Partial<ComposerSessionContext> = {}) {
  const submissions: ComposerSubmission[] = [];
  const cleared: ComposerSubmission[] = [];
  const clearedAttachments: ComposerSubmission["attachments"][] = [];
  const recovery = createComposerRecoveryOwner();
  const context: ComposerSessionContext = {
    scope: { contextKey: "repo-1", conversationId: "chat-1" },
    draftKey: "draft-1",
    instanceGeneration: 0,
    revision: 1,
    document: {
      schemaVersion: 1,
      content: [{ type: "text", text: "中文 draft" }],
    },
    runtime: { status: "idle" },
    host: {
      recovery,
      capabilities: {
        protocolVersion: 1,
        documentVersions: [1],
        intents: ["send", "follow_up", "steer"],
        commands: true,
        attachments: true,
        queue: { edit: "none", remove: false, promote: false },
        durableRecovery: false,
      },
      submit: async (snapshot) => {
        submissions.push(snapshot);
        return accepted(snapshot);
      },
    },
    onAccepted: (snapshot) => {
      cleared.push(snapshot);
    },
    onAcceptedAttachments: (attachments) => {
      clearedAttachments.push(attachments);
    },
    ...overrides,
  };
  let count = 0;
  const controller = createComposerSessionController(context, {
    instanceId: "editor-1",
    nextSubmissionId: () => `submission-${++count}`,
  });
  const host = context.host as {
    -readonly [
      K in keyof ComposerSessionContext["host"]
    ]: ComposerSessionContext["host"][K];
  };
  return {
    context,
    host,
    controller,
    recovery,
    submissions,
    cleared,
    clearedAttachments,
  };
}

describe("Composer receipt and recovery lifecycle", () => {
  test("captures a detached immutable snapshot and recovery owner before host invocation", async () => {
    const s = setup();
    s.host.submit = async (snapshot) => {
      expect(s.recovery.getSnapshot()[0].snapshot).toEqual(snapshot);
      expect(Object.isFrozen(snapshot.document.content[0])).toBe(true);
      return accepted(snapshot);
    };
    await s.controller.submit();
    expect(s.recovery.getSnapshot()[0].status).toBe("accepted");
    expect(s.cleared).toHaveLength(1);
    expect(s.recovery.getSnapshot()[0].receipt).toMatchObject({
      delivery: "immediate",
      persistence: "volatile",
      messageId: "actual-message-id",
    });
  });

  test("new document revisions survive delayed acceptance while old attachment occurrences can clear", async () => {
    const s = setup();
    const wait = deferred<ComposerReceipt>();
    s.host.submit = () => wait.promise;
    const pending = s.controller.submit();
    const snapshot = s.recovery.getSnapshot()[0].snapshot;
    s.controller.update({
      ...s.context,
      revision: 2,
      document: {
        schemaVersion: 1,
        content: [{ type: "text", text: "new draft" }],
      },
    });
    expect(s.controller.getSnapshot().submitting).toBe(true);
    wait.resolve(accepted(snapshot));
    await pending;
    expect(s.cleared).toEqual([]);
    expect(s.clearedAttachments).toHaveLength(1);
  });

  test("context changes invalidate a receipt even with the same conversation and draft", async () => {
    const s = setup();
    const wait = deferred<ComposerReceipt>();
    s.host.submit = () => wait.promise;
    const pending = s.controller.submit();
    const snapshot = s.recovery.getSnapshot()[0].snapshot;
    s.controller.update({
      ...s.context,
      scope: { ...s.context.scope, contextKey: "repo-2" },
    });
    expect(s.controller.getSnapshot().submitting).toBe(false);
    wait.resolve(accepted(snapshot));
    await pending;
    expect(s.cleared).toEqual([]);
    expect(s.clearedAttachments).toEqual([]);
    expect(s.recovery.getSnapshot()[0].status).toBe("accepted");
  });

  test("disposal hands off unresolved attempts; late definitive results update the original owner", async () => {
    const s = setup();
    const wait = deferred<ComposerReceipt>();
    let signal!: AbortSignal;
    s.host.submit = (_snapshot, abort) => {
      signal = abort;
      return wait.promise;
    };
    const pending = s.controller.submit();
    const snapshot = s.recovery.getSnapshot()[0].snapshot;
    s.controller.dispose();
    expect(signal.aborted).toBe(true);
    expect(s.recovery.getSnapshot()[0].status).toBe("unknown");
    expect(() => s.recovery.forget(snapshot.clientSubmissionId)).toThrow();
    wait.resolve(accepted(snapshot));
    await pending;
    expect(s.recovery.getSnapshot()[0].status).toBe("accepted");
    expect(s.cleared).toEqual([]);
  });

  test("unknown and not_found preserve the ID and snapshot without automatic replay", async () => {
    const s = setup();
    let sends = 0;
    s.host.submit = async () => {
      sends++;
      throw new Error("Connection lost after transmission");
    };
    s.host.reconcile = async () => ({ outcome: "not_found" });
    await s.controller.submit();
    const original = s.recovery.getSnapshot()[0].snapshot;
    expect(s.recovery.getSnapshot()[0].status).toBe("unknown");
    await s.controller.reconcile(original.clientSubmissionId);
    await s.controller.retry(original.clientSubmissionId);
    expect(sends).toBe(1);
    expect(s.recovery.getSnapshot()[0].snapshot).toEqual(original);
    expect(s.cleared).toEqual([]);
  });

  test("only explicit authorization retries a logical operation with the exact same ID and payload", async () => {
    const s = setup();
    const sent: ComposerSubmission[] = [];
    s.host.submit = async (snapshot) => {
      sent.push(snapshot);
      if (sent.length === 1) throw new Error("Uncertain delivery");
      return accepted(snapshot);
    };
    await s.controller.submit();
    const id = sent[0].clientSubmissionId;
    s.host.authorizeRetry = async () => false;
    await s.controller.retry(id);
    expect(sent).toHaveLength(1);
    s.host.authorizeRetry = async () => true;
    await s.controller.retry(id);
    expect(sent).toHaveLength(2);
    expect(sent[1]).toEqual(sent[0]);
    expect(s.recovery.getSnapshot()[0].status).toBe("accepted");
  });

  test("rejected operations retain content and a corrected submission receives a new ID", async () => {
    const s = setup();
    s.host.submit = async (snapshot) => ({
      protocolVersion: 1,
      clientSubmissionId: snapshot.clientSubmissionId,
      scope: snapshot.scope,
      operation: snapshot.operation,
      outcome: "rejected",
      error: { code: "invalid", message: "Correct the request" },
    });
    await s.controller.submit();
    expect(s.cleared).toEqual([]);
    expect(s.controller.getSnapshot().error?.message).toBe(
      "Correct the request",
    );
    await s.controller.submit();
    expect(
      s.recovery.getSnapshot().map((item) => item.snapshot.clientSubmissionId),
    ).toEqual(["submission-1", "submission-2"]);
  });

  test("non-prompt command acceptance retains an action result and rejects invented prompt claims", async () => {
    const s = setup({
      document: {
        schemaVersion: 1,
        content: [{ type: "text", text: "/reload-tools" }],
        command: { providerId: "commands", commandId: "reload-tools" },
      },
    });
    s.host.commandOperation = () => "command";
    await s.controller.submit();
    const attempt = s.recovery.getSnapshot()[0];
    expect(attempt.snapshot.operation).toBe("command");
    expect(attempt.snapshot).not.toHaveProperty("intent");
    expect(attempt.receipt).toMatchObject({
      operation: "command",
      result: { toolsReloaded: true },
    });
    expect(() =>
      snapshotComposerReceipt(
        { ...attempt.receipt, turnId: "invented" },
        attempt.snapshot,
      ),
    ).toThrow();
  });

  test("steering captures the target and never silently accepts unrelated delivery", async () => {
    const s = setup({
      runtime: { status: "running", activeTurnId: "turn-1" },
      policy: { runningIntent: "steer" },
    });
    s.host.submit = async (snapshot) => {
      expect(snapshot).toMatchObject({
        intent: "steer",
        targetTurnId: "turn-1",
      });
      return {
        ...accepted(snapshot),
        delivery: "immediate",
      } as ComposerReceipt;
    };
    await s.controller.submit();
    expect(s.recovery.getSnapshot()[0].status).toBe("unknown");
    expect(s.cleared).toEqual([]);
  });

  test("eligibility keeps runtime, admission and capabilities separate", () => {
    const s = setup({ runtime: { status: "running", activeTurnId: "turn-1" } });
    expect(composerActionEligibility(s.context)).toMatchObject({
      allowed: true,
      intent: "follow_up",
    });
    expect(
      composerActionEligibility({ ...s.context, busy: true }),
    ).toMatchObject({ allowed: false, reason: "Awaiting admission" });
    expect(
      composerActionEligibility(
        { ...s.context, runtime: { status: "running" } },
        "steer",
      ).allowed,
    ).toBe(false);
    expect(
      composerActionEligibility({
        ...s.context,
        runtime: { status: "disconnected" },
      }).allowed,
    ).toBe(false);
    expect(
      composerActionEligibility({
        ...s.context,
        host: {
          ...s.context.host,
          capabilities: { ...s.context.host.capabilities, intents: ["send"] },
        },
      }).allowed,
    ).toBe(false);
  });
});

describe("Composer recovery failure robustness", () => {
  test("same revision with different content never clears a newer draft", async () => {
    const s = setup();
    const wait = deferred<ComposerReceipt>();
    s.host.submit = () => wait.promise;
    const pending = s.controller.submit();
    const snapshot = s.recovery.getSnapshot()[0].snapshot;
    s.controller.update({
      ...s.context,
      document: {
        schemaVersion: 1,
        content: [{ type: "text", text: "different same-revision draft" }],
      },
    });
    wait.resolve(accepted(snapshot));
    await pending;
    expect(s.cleared).toHaveLength(0);
    expect(s.controller.getSnapshot().submitting).toBe(false);
  });

  test("a definitive lookup wins over a late uncertain transport after disposal", async () => {
    const s = setup();
    const wait = deferred<ComposerReceipt>();
    s.host.submit = () => wait.promise;
    const pending = s.controller.submit();
    const snapshot = s.recovery.getSnapshot()[0].snapshot;
    s.controller.dispose();
    s.host.reconcile = async () => accepted(snapshot);
    const lookup = createComposerSessionController(s.context, {
      instanceId: "replacement",
    });
    await lookup.reconcile(snapshot.clientSubmissionId);
    expect(s.recovery.getSnapshot()[0].status).toBe("accepted");
    wait.reject(new Error("Late transport disconnect"));
    await pending;
    expect(s.recovery.getSnapshot()[0].status).toBe("accepted");
    expect(s.recovery.getSnapshot()[0].receipt?.outcome).toBe("accepted");
    expect(s.cleared).toHaveLength(0);
    lookup.dispose();
  });

  test("observer failures after transmission retain acceptance, notify all observers, and never clear", async () => {
    let observerCalls = 0;
    const recovery = createComposerRecoveryOwner([], (attempt) => {
      observerCalls++;
      if (attempt.status === "accepted")
        throw new Error("Persistence unavailable");
    });
    recovery.subscribe(() => {
      if (recovery.getSnapshot()[0]?.status === "accepted")
        throw new Error("Observer failed");
    });
    let notified = 0;
    recovery.subscribe(() => {
      notified++;
    });
    const s = setup();
    s.host.recovery = recovery;
    await s.controller.submit();
    expect(recovery.getSnapshot()[0].status).toBe("accepted");
    expect(observerCalls).toBe(2);
    expect(notified).toBe(2);
    expect(s.controller.getSnapshot().submitting).toBe(false);
    expect(s.controller.getSnapshot().error?.code).toBe(
      "recovery_handoff_failed",
    );
    expect(
      s.controller.getSnapshot().recoveryFailures?.[0].receipt?.outcome,
    ).toBe("accepted");
    expect(s.cleared).toHaveLength(0);
    expect(s.clearedAttachments).toHaveLength(0);
  });

  test("synchronous disposal during receipt notification cannot clear accepted content", async () => {
    const s = setup();
    s.controller.subscribe(() => {
      if (s.controller.getSnapshot().lastReceipt?.outcome === "accepted")
        s.controller.dispose();
    });
    await s.controller.submit();
    expect(s.recovery.getSnapshot()[0].status).toBe("accepted");
    expect(s.cleared).toHaveLength(0);
    expect(s.clearedAttachments).toHaveLength(0);
  });

  test("a refusing custom recovery owner preserves the pending snapshot and prevents transmission", async () => {
    const s = setup();
    s.host.recovery = {
      getSnapshot: () => [],
      subscribe: () => () => {},
      retain: () => {
        throw new Error("Owner unavailable");
      },
    };
    await s.controller.submit();
    expect(s.submissions).toHaveLength(0);
    expect(s.controller.getSnapshot().submitting).toBe(false);
    expect(s.controller.getSnapshot().recoveryFailures?.[0].status).toBe(
      "pending",
    );
    expect(s.controller.getSnapshot().error?.code).toBe(
      "recovery_handoff_failed",
    );
    s.controller.dispose();
    s.controller.activate();
    expect(
      s.controller.getSnapshot().recoveryFailures?.[0].snapshot.document,
    ).toEqual(s.context.document);
  });

  test("custom owner failure after transmission keeps an unknown snapshot and releases admission", async () => {
    const s = setup();
    const records: ComposerAttempt[] = [];
    s.host.recovery = {
      getSnapshot: () => records,
      subscribe: () => () => {},
      retain: (attempt) => {
        if (attempt.status !== "pending")
          throw new Error("Recovery write failed");
        records.push(attempt);
      },
    };
    s.host.submit = async () => {
      throw new Error("Transmit outcome unknown");
    };
    await s.controller.submit();
    const state = s.controller.getSnapshot();
    expect(state.submitting).toBe(false);
    expect(state.error?.code).toBe("recovery_handoff_failed");
    expect(state.recoveryFailures?.[0].status).toBe("unknown");
    expect(state.recoveryFailures?.[0].snapshot.clientSubmissionId).toBe(
      records[0].snapshot.clientSubmissionId,
    );
    expect(s.cleared).toHaveLength(0);
  });

  test("disposal always aborts despite a failed handoff and a late receipt remains inspectable", async () => {
    const s = setup();
    const wait = deferred<ComposerReceipt>();
    let signal!: AbortSignal;
    const records: ComposerAttempt[] = [];
    s.host.recovery = {
      getSnapshot: () => records,
      subscribe: () => () => {},
      retain: (attempt) => {
        if (attempt.status !== "pending") throw new Error("Owner stopped");
        records.push(attempt);
      },
    };
    s.host.submit = (_snapshot, abort) => {
      signal = abort;
      return wait.promise;
    };
    const pending = s.controller.submit();
    const snapshot = records[0].snapshot;
    expect(() => s.controller.dispose()).not.toThrow();
    expect(signal.aborted).toBe(true);
    expect(s.controller.getSnapshot().recoveryFailures?.[0].status).toBe(
      "unknown",
    );
    wait.resolve(accepted(snapshot));
    await pending;
    expect(s.controller.getSnapshot().recoveryFailures?.[0].status).toBe(
      "accepted",
    );
    expect(s.controller.getSnapshot().submitting).toBe(false);
    expect(s.cleared).toHaveLength(0);
  });

  test("receipt validation rejects extra nested scope/error fields while preserving JSON details", async () => {
    const s = setup();
    await s.controller.submit();
    const snapshot = s.recovery.getSnapshot()[0].snapshot;
    const receipt = accepted(snapshot);
    expect(() =>
      snapshotComposerReceipt(
        { ...receipt, scope: { ...snapshot.scope, extra: true } },
        snapshot,
      ),
    ).toThrow();
    const rejected = {
      protocolVersion: 1,
      clientSubmissionId: snapshot.clientSubmissionId,
      scope: snapshot.scope,
      operation: snapshot.operation,
      outcome: "rejected",
      error: {
        code: "invalid",
        message: "Bad request",
        details: { field: "text", errors: [1, "中文"] },
      },
    };
    expect(snapshotComposerReceipt(rejected, snapshot).outcome).toBe(
      "rejected",
    );
    expect(() =>
      snapshotComposerReceipt(
        { ...rejected, error: { ...rejected.error, unexpected: "field" } },
        snapshot,
      ),
    ).toThrow();
    expect(() =>
      snapshotComposerReceipt({ ...rejected, error: [] }, snapshot),
    ).toThrow();
    expect(() =>
      snapshotComposerReceipt(
        {
          ...rejected,
          error: { ...rejected.error, details: { binary: new Uint8Array(1) } },
        },
        snapshot,
      ),
    ).toThrow();
  });
});
