import type {
  ComposerAttempt,
  ComposerActionEligibility,
  ComposerRecoveryOwner,
  ComposerSessionContext,
  ComposerSessionSnapshot,
} from "../ComposerSession.types";
import type {
  ComposerError,
  ComposerIntent,
  ComposerReceipt,
  ComposerScope,
  ComposerSubmission,
} from "../Composer.types";
import {
  exportComposerText,
  snapshotComposerJson,
  snapshotComposerSubmission,
} from "./document";

export function sameComposerScope(a: ComposerScope, b: ComposerScope) {
  return a.contextKey === b.contextKey && a.conversationId === b.conversationId;
}

export class ComposerUncertainTransportError extends Error {
  readonly code = "uncertain_transport";
}

function canonical(value: unknown): string {
  const json = snapshotComposerJson(value);
  function encode(item: typeof json): string {
    if (item === null || typeof item !== "object") return JSON.stringify(item);
    if (Array.isArray(item)) return `[${item.map(encode).join(",")}]`;
    return `{${Object.keys(item)
      .sort()
      .map(
        (key) =>
          `${JSON.stringify(key)}:${encode((item as Record<string, typeof json>)[key])}`,
      )
      .join(",")}}`;
  }
  return encode(json);
}

/** All callbacks receive detached immutable snapshots, never live editor state. */
export function createComposerRecoveryOwner(
  initial: readonly ComposerAttempt[] = [],
  onRetain?: (attempt: ComposerAttempt) => void,
): ComposerRecoveryOwner & { forget: (id: string) => void } {
  const records = new Map<string, ComposerAttempt>();
  const listeners = new Set<() => void>();
  let snapshot: readonly ComposerAttempt[] = Object.freeze([]);
  const emit = () => {
    snapshot = Object.freeze([...records.values()]);
    const failures: unknown[] = [];
    for (const listener of listeners) {
      try {
        listener();
      } catch (cause) {
        failures.push(cause);
      }
    }
    if (failures.length)
      throw new AggregateError(failures, "Recovery notification failed");
  };
  const retain = (input: ComposerAttempt) => {
    const submission = snapshotComposerSubmission(input.snapshot);
    const previous = records.get(submission.clientSubmissionId);
    if (previous && canonical(previous.snapshot) !== canonical(submission))
      throw new TypeError("A logical submission ID cannot change its payload");
    if (
      !input.instanceId ||
      !Number.isSafeInteger(input.instanceGeneration) ||
      input.instanceGeneration < 0 ||
      !Number.isFinite(input.createdAt) ||
      input.createdAt < 0 ||
      !["pending", "accepted", "rejected", "unknown"].includes(input.status)
    )
      throw new TypeError("Invalid recovery record");
    if (
      input.status !== "pending" &&
      (!input.receipt ||
        snapshotComposerReceipt(input.receipt, submission).outcome !==
          input.status)
    )
      throw new TypeError("Recovery receipt does not match its status");
    if (input.status === "pending" && input.receipt)
      throw new TypeError("Pending records cannot claim a receipt");
    // A late uncertain lookup must not overwrite a definitive admission result.
    if (previous?.status === "accepted" || previous?.status === "rejected") {
      if (input.status === "pending" || input.status === "unknown") return;
      if (canonical(input.receipt) !== canonical(previous.receipt))
        throw new TypeError("Conflicting definitive receipts");
      return;
    }
    const record = snapshotComposerJson({
      ...input,
      snapshot: submission,
    }) as unknown as ComposerAttempt;
    // Record before notifying an application persistence observer. An observer
    // failure must never make an unresolved operation disappear from memory.
    records.set(submission.clientSubmissionId, record);
    const failures: unknown[] = [];
    try {
      emit();
    } catch (cause) {
      failures.push(cause);
    }
    try {
      onRetain?.(record);
    } catch (cause) {
      failures.push(cause);
    }
    if (failures.length)
      throw new AggregateError(failures, "Recovery handoff failed");
  };
  for (const record of initial) retain(record);
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    retain,
    forget: (id) => {
      const record = records.get(id);
      if (record?.status === "pending" || record?.status === "unknown")
        throw new Error("Resolve an uncertain operation before forgetting it");
      if (records.delete(id)) emit();
    },
  };
}

/** Visible actions and keyboard gestures must share this exact policy. */
export function composerActionEligibility(
  context: ComposerSessionContext,
  requestedIntent?: ComposerIntent,
): ComposerActionEligibility {
  const { host, runtime, document } = context;
  const operation = document.command
    ? (host.commandOperation?.(document.command) ?? "prompt")
    : "prompt";
  const intent =
    requestedIntent ??
    (runtime.status === "running"
      ? (context.policy?.runningIntent ?? "follow_up")
      : "send");
  const label =
    operation === "command"
      ? "Run command"
      : { send: "Send", follow_up: "Send follow-up", steer: "Steer turn" }[
          intent
        ];
  const result = {
    operation,
    ...(operation === "prompt" ? { intent } : {}),
    label,
  };
  let reason: string | undefined;
  if (context.disabled || runtime.status === "read_only") reason = "Read only";
  else if (runtime.status === "disconnected") reason = "Disconnected";
  else if (context.busy) reason = "Awaiting admission";
  else if (context.canSubmit === false) reason = "Admission unavailable";
  else if (context.attachmentsPending) reason = "Attachments are not ready";
  else if (!host.capabilities.documentVersions.includes(1))
    reason = "Unsupported document version";
  else if (document.command && !host.capabilities.commands)
    reason = "Commands unavailable";
  else if (
    (context.attachments?.length ?? 0) > 0 &&
    !host.capabilities.attachments
  )
    reason = "Attachments unavailable";
  else if (
    operation === "prompt" &&
    !host.capabilities.intents.includes(intent)
  )
    reason = "Intent unavailable";
  else if (
    intent === "steer" &&
    operation === "prompt" &&
    (runtime.status !== "running" || !runtime.activeTurnId)
  )
    reason = "No active steering target";
  else if (
    !document.command &&
    !exportComposerText(document).trim() &&
    !(context.allowAttachmentOnly && context.attachments?.length)
  )
    reason = "Empty draft";
  return { ...result, allowed: !reason, ...(reason ? { reason } : {}) };
}

function error(code: string, message: string): ComposerError {
  return Object.freeze({ code, message });
}

function unknownReceipt(
  snapshot: ComposerSubmission,
  cause: ComposerError,
): ComposerReceipt {
  return Object.freeze({
    protocolVersion: 1,
    clientSubmissionId: snapshot.clientSubmissionId,
    scope: snapshot.scope,
    operation: snapshot.operation,
    outcome: "unknown",
    error: cause,
  });
}

/** Untrusted host replies cannot manufacture acceptance or prompt identities. */
export function snapshotComposerReceipt(
  input: unknown,
  submission: ComposerSubmission,
): ComposerReceipt {
  const value = snapshotComposerJson(input);
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new TypeError("Invalid receipt");
  const candidate = value as Record<string, unknown>;
  const scope = candidate.scope as ComposerScope | undefined;
  if (
    candidate.protocolVersion !== 1 ||
    candidate.clientSubmissionId !== submission.clientSubmissionId ||
    !scope ||
    typeof scope !== "object" ||
    Array.isArray(scope) ||
    Object.keys(scope).length !== 2 ||
    typeof scope.contextKey !== "string" ||
    !scope.contextKey ||
    typeof scope.conversationId !== "string" ||
    !scope.conversationId ||
    !sameComposerScope(scope, submission.scope) ||
    candidate.operation !== submission.operation
  )
    throw new TypeError("Receipt identity mismatch");
  const common = [
    "protocolVersion",
    "clientSubmissionId",
    "scope",
    "operation",
    "outcome",
  ];
  let allowed: string[];
  if (candidate.outcome === "accepted") {
    if (submission.operation === "command") {
      if (!Object.hasOwn(candidate, "result"))
        throw new TypeError("Missing command result");
      allowed = [...common, "result"];
    } else {
      if (
        !["immediate", "follow_up", "steer"].includes(
          String(candidate.delivery),
        ) ||
        !["volatile", "durable"].includes(String(candidate.persistence))
      )
        throw new TypeError("Missing prompt admission evidence");
      if ((submission.intent === "steer") !== (candidate.delivery === "steer"))
        throw new TypeError("Unexpected steering delivery");
      for (const key of ["messageId", "turnId", "queueItemId"])
        if (
          Object.hasOwn(candidate, key) &&
          (typeof candidate[key] !== "string" || !candidate[key])
        )
          throw new TypeError("Invalid admission identity");
      if (
        Object.hasOwn(candidate, "queueRevision") &&
        (!Number.isSafeInteger(candidate.queueRevision) ||
          Number(candidate.queueRevision) < 0)
      )
        throw new TypeError("Invalid queue revision");
      allowed = [
        ...common,
        "delivery",
        "persistence",
        "messageId",
        "turnId",
        "queueItemId",
        "queueRevision",
      ];
    }
  } else if (
    candidate.outcome === "rejected" ||
    candidate.outcome === "unknown"
  ) {
    const detail = candidate.error as ComposerError | undefined;
    if (
      !detail ||
      typeof detail !== "object" ||
      Array.isArray(detail) ||
      Object.keys(detail).some(
        (key) => !["code", "message", "details"].includes(key),
      ) ||
      typeof detail.code !== "string" ||
      !detail.code ||
      typeof detail.message !== "string"
    )
      throw new TypeError("Missing receipt explanation");
    allowed = [...common, "error"];
  } else throw new TypeError("Unknown receipt outcome");
  if (Object.keys(candidate).some((key) => !allowed.includes(key)))
    throw new TypeError("Unsupported receipt fields");
  return value as unknown as ComposerReceipt;
}

export function createComposerSessionController(
  initial: ComposerSessionContext,
  identity: {
    readonly instanceId: string;
    readonly nextSubmissionId?: () => string;
  },
) {
  let context = initial;
  let disposed = false;
  let state: ComposerSessionSnapshot = Object.freeze({ submitting: false });
  const listeners = new Set<() => void>();
  const work = new Map<
    string,
    {
      attempt: ComposerAttempt;
      abort: AbortController;
      owner: ComposerRecoveryOwner;
    }
  >();
  let activeId: string | undefined;
  const recoveryFailures = new Map<string, ComposerAttempt>();
  const emit = (next: ComposerSessionSnapshot) => {
    state = Object.freeze({
      ...next,
      recoveryFailures: recoveryFailures.size
        ? Object.freeze([...recoveryFailures.values()])
        : undefined,
    });
    if (disposed) return;
    for (const listener of listeners) listener();
  };
  const current = (attempt: ComposerAttempt) =>
    !disposed &&
    attempt.instanceId === identity.instanceId &&
    attempt.instanceGeneration === context.instanceGeneration &&
    sameComposerScope(attempt.snapshot.scope, context.scope) &&
    attempt.snapshot.draftKey === context.draftKey &&
    activeId === attempt.snapshot.clientSubmissionId;

  function handoffFailure(attempt: ComposerAttempt, cause: unknown) {
    recoveryFailures.set(attempt.snapshot.clientSubmissionId, attempt);
    return error(
      "recovery_handoff_failed",
      `Recovery handoff failed; draft retained. ${cause instanceof Error ? cause.message : "Host recovery owner failed"}`,
    );
  }

  async function transmit(attempt: ComposerAttempt, lookup = false) {
    const { snapshot } = attempt;
    const id = snapshot.clientSubmissionId;
    if (work.has(id)) return;
    const host = context.host;
    const abort = new AbortController();
    const pending = Object.freeze({
      snapshot,
      instanceId: attempt.instanceId,
      instanceGeneration: attempt.instanceGeneration,
      createdAt: attempt.createdAt,
      status: "pending" as const,
    });
    // The host already owns the recovery linkage when transmission begins.
    try {
      host.recovery.retain(pending);
      recoveryFailures.delete(id);
    } catch (cause) {
      const failure = handoffFailure(pending, cause);
      emit({ ...state, submitting: false, error: failure });
      return;
    }
    work.set(id, { attempt: pending, abort, owner: host.recovery });
    if (current(attempt)) emit({ submitting: true });
    let receipt: ComposerReceipt;
    try {
      const response = lookup
        ? await host.reconcile!(snapshot, abort.signal)
        : await host.submit(snapshot, abort.signal);
      receipt =
        response.outcome === "not_found"
          ? unknownReceipt(
              snapshot,
              error(
                "not_found",
                "No admission record found. Delivery remains unresolved; retry requires host authorization.",
              ),
            )
          : snapshotComposerReceipt(response, snapshot);
    } catch (cause) {
      receipt = unknownReceipt(
        snapshot,
        error(
          cause instanceof ComposerUncertainTransportError
            ? cause.code
            : "unresolved_submission",
          cause instanceof Error
            ? cause.message
            : "Admission could not be confirmed",
        ),
      );
    }
    work.delete(id);
    let recoveryError: ComposerError | undefined;
    let settled: ComposerAttempt = Object.freeze({
      ...attempt,
      status: receipt.outcome,
      receipt,
    });
    try {
      const definitive = host.recovery
        .getSnapshot()
        .find(
          (record) =>
            record.snapshot.clientSubmissionId === id &&
            (record.status === "accepted" || record.status === "rejected"),
        );
      if (definitive?.receipt) {
        if (canonical(definitive.snapshot) !== canonical(snapshot))
          throw new TypeError("Recovery snapshot identity mismatch");
        receipt = snapshotComposerReceipt(definitive.receipt, snapshot);
        settled = Object.freeze({
          ...attempt,
          status: receipt.outcome,
          receipt,
        });
      }
      // Still resolve the ORIGINAL owner after disposal or a scope switch.
      host.recovery.retain(settled);
      recoveryFailures.delete(id);
    } catch (cause) {
      recoveryError = handoffFailure(settled, cause);
    }
    if (!current(attempt))
      emit({ ...state, ...(recoveryError ? { error: recoveryError } : {}) });
    if (current(attempt)) {
      emit({
        submitting: false,
        lastReceipt: receipt,
        ...(recoveryError
          ? { error: recoveryError }
          : receipt.outcome !== "accepted"
            ? { error: receipt.error }
            : {}),
      });
      if (
        current(attempt) &&
        receipt.outcome === "accepted" &&
        !recoveryError
      ) {
        if (
          context.revision === snapshot.draftRevision &&
          canonical(context.document) === canonical(snapshot.document)
        )
          context.onAccepted?.(snapshot);
        // A clearing callback may synchronously switch context or unmount.
        if (current(attempt))
          context.onAcceptedAttachments?.(snapshot.attachments);
      }
    }
    return receipt;
  }

  return {
    /** React StrictMode may replay effects; old attempts never regain editor ownership. */
    activate() {
      if (!disposed) return;
      disposed = false;
      activeId = undefined;
      emit({ submitting: false });
    },
    getSnapshot: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    update(next: ComposerSessionContext) {
      const switched =
        context.instanceGeneration !== next.instanceGeneration ||
        !sameComposerScope(context.scope, next.scope) ||
        context.draftKey !== next.draftKey;
      context = next;
      if (switched) {
        activeId = undefined;
        emit({ submitting: false });
      }
    },
    eligibility: (intent?: ComposerIntent) =>
      composerActionEligibility(context, intent),
    async submit(intent?: ComposerIntent) {
      const action = composerActionEligibility(context, intent);
      if (disposed || state.submitting || !action.allowed) return;
      const clientSubmissionId =
        identity.nextSubmissionId?.() ?? crypto.randomUUID();
      const common = {
        protocolVersion: 1 as const,
        clientSubmissionId,
        scope: context.scope,
        draftKey: context.draftKey,
        draftRevision: context.revision,
        document: context.document,
        attachments: context.attachments ?? [],
        options: context.options ?? {},
      };
      const snapshot = snapshotComposerSubmission(
        action.operation === "command"
          ? {
              ...common,
              operation: "command",
              document: {
                ...context.document,
                command: context.document.command!,
              },
            }
          : action.intent === "steer"
            ? {
                ...common,
                operation: "prompt",
                intent: "steer",
                targetTurnId: context.runtime.activeTurnId!,
              }
            : {
                ...common,
                operation: "prompt",
                intent: action.intent! as "send" | "follow_up",
              },
      );
      const attempt: ComposerAttempt = Object.freeze({
        snapshot,
        instanceId: identity.instanceId,
        instanceGeneration: context.instanceGeneration,
        createdAt: Date.now(),
        status: "pending",
      });
      activeId = clientSubmissionId;
      return transmit(attempt);
    },
    async reconcile(id: string) {
      if (disposed || !context.host.reconcile) return;
      const record = context.host.recovery
        .getSnapshot()
        .find((item) => item.snapshot.clientSubmissionId === id);
      if (
        !record ||
        (record.status !== "pending" && record.status !== "unknown")
      )
        return;
      return transmit(record, true);
    },
    async retry(id: string) {
      if (disposed || !context.host.authorizeRetry) return;
      const host = context.host;
      const authorizeRetry = host.authorizeRetry;
      const record = host.recovery
        .getSnapshot()
        .find((item) => item.snapshot.clientSubmissionId === id);
      if (
        !record ||
        record.status !== "unknown" ||
        work.has(id) ||
        !authorizeRetry ||
        !(await authorizeRetry(record)) ||
        disposed
      )
        return;
      // A definitive receipt may have arrived while authorization was pending.
      const latest = host.recovery
        .getSnapshot()
        .find((item) => item.snapshot.clientSubmissionId === id);
      if (latest?.status !== "unknown" || context.host !== host) return;
      return transmit(record);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const { attempt, abort, owner } of work.values()) {
        const receipt = unknownReceipt(
          attempt.snapshot,
          error(
            "composer_disposed",
            "Composer closed before admission was confirmed",
          ),
        );
        const unresolved = Object.freeze({
          ...attempt,
          status: "unknown" as const,
          receipt,
        });
        try {
          owner.retain(unresolved);
          recoveryFailures.delete(attempt.snapshot.clientSubmissionId);
        } catch (cause) {
          emit({
            ...state,
            submitting: false,
            error: handoffFailure(unresolved, cause),
          });
        } finally {
          abort.abort();
        }
      }
      emit({ ...state, submitting: false });
      listeners.clear();
    },
  };
}

export type ComposerSessionController = ReturnType<
  typeof createComposerSessionController
>;
