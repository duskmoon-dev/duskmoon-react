import React, { useRef, useState, useSyncExternalStore } from "react";
import {
  ChatAuthoritativeQueue,
  ChatSessionComposer,
  ComposerSettings,
  createComposerRecoveryOwner,
  exportComposerText,
  type ChatSessionComposerHandle,
  type ComposerAttachmentOptions,
  type ComposerCapabilities,
  type ComposerCompletionProvider,
  type ComposerDocument,
  type ComposerProviderCandidate,
  type ComposerDocumentUpdate,
  type ComposerDraft,
  type ComposerDraftAdapter,
  type ComposerQueueEditorProps,
  type ComposerQueueMutation,
  type ComposerQueueMutationResult,
  type ComposerQueueProjection,
  type ComposerReceipt,
  type ComposerRuntimeState,
  type ComposerSessionHost,
  type ComposerSetting,
  type ComposerSettingRequest,
  type ComposerSettingResult,
  type ComposerSubmission,
} from "@duskmoon-dev/components";
import { RichChatComposer } from "@duskmoon-dev/components/chat/rich";

const scope = { contextKey: "demo-repository", conversationId: "demo-thread" };
const capabilities: ComposerCapabilities = {
  protocolVersion: 1,
  documentVersions: [1],
  intents: ["send", "follow_up", "steer"],
  commands: true,
  attachments: true,
  queue: { edit: "document", remove: true, promote: true },
  durableRecovery: false,
};
type Admission = "accept" | "reject" | "unknown";
interface DemoState {
  readonly runtime: ComposerRuntimeState;
  readonly queue: ComposerQueueProjection;
  readonly settingsRevision: number;
  readonly model: string;
  readonly events: readonly string[];
}

/** Abortable demo latency, not an upload or execution transport. */
function pause(signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Cancelled", "AbortError"));
      return;
    }
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException("Cancelled", "AbortError"));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, 400);
    signal.addEventListener("abort", abort, { once: true });
  });
}

/** Stable per-preview host: memory only, lost on page reload. */
function createDemoHost() {
  const recovery = createComposerRecoveryOwner();
  const receipts = new Map<string, ComposerReceipt>();
  const drafts = new Map<string, ComposerDraft>();
  const listeners = new Set<() => void>();
  let admission: Admission = "accept";
  let failPreparation = true;
  let turnCounter = 0;
  const preparations = new Set<string>();
  let state: DemoState = {
    runtime: { status: "idle" },
    queue: { protocolVersion: 1, scope, revision: 0, items: [] },
    settingsRevision: 0,
    model: "standard",
    events: [],
  };
  function publish(next: Partial<DemoState>, event?: string) {
    state = {
      ...state,
      ...next,
      events: event ? [...state.events.slice(-7), event] : state.events,
    };
    listeners.forEach((listener) => listener());
  }
  function accept(snapshot: ComposerSubmission): ComposerReceipt {
    const identity = {
      protocolVersion: 1 as const,
      clientSubmissionId: snapshot.clientSubmissionId,
      scope: snapshot.scope,
      outcome: "accepted" as const,
    };
    if (snapshot.operation === "command") {
      const result = { help: "Use /review for a prompt or @ for a reference." };
      publish({}, `Command result: ${JSON.stringify(result)}`);
      return { ...identity, operation: "command", result };
    }
    const text =
      exportComposerText(snapshot.document) || "Attachment-only prompt";
    if (snapshot.intent === "follow_up") {
      const id = `waiting-${snapshot.clientSubmissionId}`;
      const queue = {
        ...state.queue,
        revision: state.queue.revision + 1,
        items: [
          ...state.queue.items,
          {
            id,
            document: snapshot.document,
            attachments: snapshot.attachments,
            capabilities: capabilities.queue,
          },
        ],
      };
      publish({ queue }, `Follow-up admitted: ${text}`);
      return {
        ...identity,
        operation: "prompt",
        delivery: "follow_up",
        persistence: "volatile",
        queueItemId: id,
        queueRevision: queue.revision,
      };
    }
    const turnId =
      snapshot.intent === "steer"
        ? snapshot.targetTurnId
        : `demo-turn-${++turnCounter}`;
    publish(
      { runtime: { status: "running", activeTurnId: turnId } },
      `${snapshot.intent === "steer" ? "Steer" : "Prompt"} admitted: ${text}`,
    );
    return {
      ...identity,
      operation: "prompt",
      delivery: snapshot.intent === "steer" ? "steer" : "immediate",
      persistence: "volatile",
      turnId,
    };
  }
  const host: ComposerSessionHost = {
    capabilities,
    recovery,
    commandOperation: (command) =>
      command.commandId === "help" ? "command" : "prompt",
    async submit(snapshot, signal) {
      const mode = admission;
      await pause(signal);
      const existing = receipts.get(snapshot.clientSubmissionId);
      if (existing) return existing;
      if (mode === "reject") {
        const receipt: ComposerReceipt = {
          protocolVersion: 1,
          scope: snapshot.scope,
          clientSubmissionId: snapshot.clientSubmissionId,
          operation: snapshot.operation,
          outcome: "rejected",
          error: {
            code: "demo_rejection",
            message:
              "Demo host rejected this request. Edit or change the outcome and submit again.",
          },
        };
        receipts.set(snapshot.clientSubmissionId, receipt);
        publish({}, "Request rejected; draft retained.");
        return receipt;
      }
      const receipt = accept(snapshot);
      receipts.set(snapshot.clientSubmissionId, receipt);
      if (mode !== "unknown") return receipt;
      publish(
        {},
        "Demo response lost after admission. Check submission status to reconcile.",
      );
      return {
        protocolVersion: 1,
        scope: snapshot.scope,
        clientSubmissionId: snapshot.clientSubmissionId,
        operation: snapshot.operation,
        outcome: "unknown",
        error: {
          code: "demo_response_lost",
          message:
            "Admission response was lost; do not assume failure or resend as a new request.",
        },
      };
    },
    async reconcile(snapshot, signal) {
      await pause(signal);
      const receipt = receipts.get(snapshot.clientSubmissionId);
      publish(
        {},
        receipt
          ? `Reconciled: ${receipt.outcome}`
          : "No admission record found; outcome remains unresolved.",
      );
      return receipt ?? { outcome: "not_found" };
    },
    async authorizeRetry() {
      publish(
        {},
        "Demo host authorized retry using the original submission identity.",
      );
      return true;
    },
  };
  const draftAdapter: ComposerDraftAdapter = {
    async load({ scope: owner, draftKey, signal }) {
      await pause(signal);
      return drafts.get(JSON.stringify([owner, draftKey]));
    },
    async save(draft, signal) {
      await pause(signal);
      drafts.set(JSON.stringify([draft.scope, draft.draftKey]), draft);
      publish({}, `Draft revision ${draft.revision} saved in demo memory.`);
    },
  };
  const attachmentOptions: Omit<ComposerAttachmentOptions, "scope"> = {
    policy: {
      accept: "image/*,.txt,.md,.pdf",
      maxFiles: 3,
      maxFileBytes: 2 * 1024 * 1024,
    },
    async prepare(file, { entryId, signal, reportProgress }) {
      reportProgress(0.25);
      await pause(signal);
      if (failPreparation && !preparations.has(entryId)) {
        preparations.add(entryId);
        throw new Error("Demo preparation failed once. Retry this attachment.");
      }
      reportProgress(1);
      return {
        providerId: "demo-files",
        reference: { entryId, name: file.name },
      };
    },
    // Omitted canRecover: saved occurrences require reattachment after remount.
  };
  return {
    host,
    draftAdapter,
    attachmentOptions,
    getSnapshot: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    setAdmission(value: Admission) {
      admission = value;
    },
    setFailPreparation(value: boolean) {
      failPreparation = value;
    },
    start() {
      publish(
        {
          runtime: {
            status: "running",
            activeTurnId: `demo-turn-${++turnCounter}`,
          },
        },
        "Demo turn started; no model is executing.",
      );
    },
    stop() {
      publish(
        { runtime: { status: "idle" } },
        "Stop acknowledged by demo host; queued messages remain waiting.",
      );
    },
    invoke() {
      publish(
        {},
        "Provider invocation executed independently of prompt admission.",
      );
    },
    async mutate(
      request: ComposerQueueMutation,
      signal: AbortSignal,
    ): Promise<ComposerQueueMutationResult> {
      await pause(signal);
      const item = state.queue.items.find(
        (entry) => entry.id === request.itemId,
      );
      if (
        request.expectedRevision !== state.queue.revision ||
        !item ||
        (request.operation === "promote" &&
          request.targetTurnId !== state.runtime.activeTurnId)
      ) {
        return {
          requestId: request.requestId,
          outcome: "rejected",
          projection: state.queue,
          error: {
            code: "queue_conflict",
            message:
              "Demo queue changed; use the canonical projection and try again.",
          },
        };
      }
      const queue: ComposerQueueProjection = {
        ...state.queue,
        revision: state.queue.revision + 1,
        items:
          request.operation === "edit"
            ? state.queue.items.map((entry) =>
                entry.id === item.id
                  ? { ...entry, document: request.document }
                  : entry,
              )
            : state.queue.items.filter((entry) => entry.id !== item.id),
      };
      publish(
        { queue },
        `Queue ${request.operation} acknowledged for ${request.itemId}.`,
      );
      return {
        requestId: request.requestId,
        outcome: "accepted",
        projection: queue,
      };
    },
    applyProjection(queue: ComposerQueueProjection) {
      if (queue.revision >= state.queue.revision) publish({ queue });
    },
    async requestSetting(
      request: ComposerSettingRequest,
      signal: AbortSignal,
    ): Promise<ComposerSettingResult> {
      await pause(signal);
      const identity = {
        requestId: request.requestId,
        scopeKey: request.scopeKey,
        settingId: request.settingId,
        revision: state.settingsRevision + 1,
      };
      if (
        request.expectedRevision !== state.settingsRevision ||
        request.value === "restricted"
      ) {
        return {
          ...identity,
          outcome: "rejected",
          message:
            "Demo host declined this model; the current selection is retained.",
        };
      }
      return { ...identity, outcome: "accepted", value: request.value };
    },
    acknowledgeSetting(result: ComposerSettingResult) {
      publish(
        {
          settingsRevision: result.revision,
          ...(result.outcome === "accepted" ? { model: result.value } : {}),
        },
        `Model change ${result.outcome}.`,
      );
    },
  };
}

const providers: readonly ComposerCompletionProvider[] = [
  {
    providerId: "demo-files",
    label: "Repository references",
    trigger: { text: "@", position: "word" },
    async query(request, signal) {
      await pause(signal);
      return {
        request,
        candidates: (
          [
            {
              id: "readme",
              label: "README.md",
              description: "Demo reference, resolved by the host",
              action: {
                type: "insert",
                content: [
                  {
                    type: "reference",
                    nodeId: `${request.requestId}-reference`,
                    providerId: "demo-files",
                    refId: "README.md",
                    label: "README.md",
                    plainText: "@README.md",
                  },
                ],
              },
            },
            {
              id: "private",
              label: "Private document",
              disabledReason: "Host has not granted access",
              action: { type: "insert", content: [] },
            },
          ] satisfies ComposerProviderCandidate[]
        ).filter((candidate) =>
          candidate.label.toLowerCase().includes(request.query.toLowerCase()),
        ),
      };
    },
  },
  {
    providerId: "demo-commands",
    label: "Commands",
    trigger: { text: "/", position: "leading" },
    async query(request, signal) {
      await pause(signal);
      return {
        request,
        candidates: (
          [
            {
              id: "help",
              label: "/help",
              description: "Command result, without prompt admission",
              action: {
                type: "insert",
                command: { providerId: "demo-commands", commandId: "help" },
                content: [{ type: "text", text: "/help " }],
              },
            },
            {
              id: "review",
              label: "/review",
              description: "Claimed prompt command",
              action: {
                type: "insert",
                command: { providerId: "demo-commands", commandId: "review" },
                content: [{ type: "text", text: "/review " }],
              },
            },
            {
              id: "inspect",
              label: "/inspect",
              description: "Invoke a host action immediately",
              action: {
                type: "invoke",
                command: { providerId: "demo-commands", commandId: "inspect" },
              },
            },
          ] satisfies ComposerProviderCandidate[]
        ).filter((candidate) => candidate.label.includes(request.query)),
      };
    },
  },
  {
    providerId: "demo-skills",
    label: "Editable skills",
    trigger: { text: "/", position: "leading" },
    async query(request, signal) {
      await pause(signal);
      return {
        request,
        candidates: (
          [
            {
              id: "summarize",
              label: "/summarize",
              description:
                "Insert editable instructions, without claiming a command",
              action: {
                type: "insert",
                content: [
                  {
                    type: "text",
                    text: "Summarize the changes and list the checks that passed. ",
                  },
                ],
              },
            },
          ] satisfies ComposerProviderCandidate[]
        ).filter((candidate) => candidate.label.includes(request.query)),
      };
    },
  },
];

function QueueDocumentEditor({
  value,
  onChange,
  onSave,
  onCancel,
  pending,
}: ComposerQueueEditorProps) {
  return (
    <>
      <p className="chat-composer-hint">
        Edit text while retaining reference, quote, command and attachment
        identities.
      </p>
      {value.content.map((node, index) =>
        node.type === "text" ? (
          <textarea
            key={index}
            className="chat-composer-input"
            aria-label={`Queued text ${index + 1}`}
            value={node.text}
            disabled={pending}
            onChange={(event) =>
              onChange({
                ...value,
                content: value.content.map((entry, at) =>
                  at === index
                    ? { type: "text", text: event.currentTarget.value }
                    : entry,
                ),
              })
            }
          />
        ) : (
          <p key={node.nodeId}>
            {node.type === "reference" ? node.label : node.text}
          </p>
        ),
      )}
      <button
        type="button"
        className="btn btn-sm"
        disabled={pending}
        onClick={onSave}
      >
        Save queued document
      </button>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        disabled={pending}
        onClick={onCancel}
      >
        Cancel
      </button>
    </>
  );
}

function SessionDemo({ rich }: { rich: boolean }) {
  const [demo] = useState(createDemoHost);
  const state = useSyncExternalStore(
    demo.subscribe,
    demo.getSnapshot,
    demo.getSnapshot,
  );
  const [value, setValue] = useState<ComposerDocumentUpdate>({
    document: {
      schemaVersion: 1,
      content: [{ type: "text", text: "Review the latest changes." }],
    },
    revision: 0,
    origin: "replace",
    originId: "demo-initial",
  });
  const [mount, setMount] = useState(0);
  const [admission, setAdmission] = useState<Admission>("accept");
  const [intent, setIntent] = useState<"follow_up" | "steer">("follow_up");
  const [failPreparation, setFailPreparation] = useState(true);
  const editor = useRef<ChatSessionComposerHandle>(null);
  const occurrence = useRef(0);
  const Composer = rich ? RichChatComposer : ChatSessionComposer;
  const settings: readonly ComposerSetting[] = [
    {
      id: "model",
      label: "Model",
      value: state.model,
      choices: [
        { value: "standard", label: "Standard demo model" },
        { value: "fast", label: "Fast demo model" },
        { value: "restricted", label: "Restricted model (host rejects)" },
      ],
    },
  ];
  function replace(document: ComposerDocument) {
    setValue((current) => ({
      document,
      revision: current.revision + 1,
      origin: "replace",
      originId: `demo-replace-${++occurrence.current}`,
    }));
  }
  return (
    <div
      className="chat-demo"
      data-chat-session-demo={rich ? "rich" : "plain"}
      style={{ width: "min(48rem, 100%)", display: "grid", gap: "1rem" }}
    >
      <p>
        Interactive fake host: no backend, model execution, upload or durable
        storage. Drafts and recovery survive editor remounts in this preview;
        page reload discards them.
      </p>
      <div className="chat-composer-toolbar">
        <label>
          Admission outcome{" "}
          <select
            className="select select-sm"
            value={admission}
            onChange={(event) => {
              const next = event.currentTarget.value as Admission;
              setAdmission(next);
              demo.setAdmission(next);
            }}
          >
            <option value="accept">Accept</option>
            <option value="reject">Reject</option>
            <option value="unknown">Lose response after admission</option>
          </select>
        </label>
        <label>
          Running intent{" "}
          <select
            className="select select-sm"
            value={intent}
            onChange={(event) =>
              setIntent(event.currentTarget.value as "follow_up" | "steer")
            }
          >
            <option value="follow_up">Follow-up</option>
            <option value="steer">Steer active turn</option>
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={failPreparation}
            onChange={(event) => {
              setFailPreparation(event.currentTarget.checked);
              demo.setFailPreparation(event.currentTarget.checked);
            }}
          />{" "}
          Fail first preparation
        </label>
      </div>
      <div className="chat-composer-toolbar">
        <button className="btn btn-sm" type="button" onClick={demo.start}>
          Start demo turn
        </button>
        <button
          className="btn btn-ghost btn-sm"
          type="button"
          onClick={() => setMount((current) => current + 1)}
        >
          Remount editor
        </button>
        <button
          className="btn btn-ghost btn-sm"
          type="button"
          onClick={() =>
            replace({ schemaVersion: 1, content: [{ type: "text", text: "" }] })
          }
        >
          Replace with empty document
        </button>
        {rich ? (
          <>
            <button
              className="btn btn-ghost btn-sm"
              type="button"
              onClick={() =>
                editor.current?.insertReference({
                  type: "reference",
                  nodeId: `demo-ref-${++occurrence.current}`,
                  providerId: "demo-files",
                  refId: "README.md",
                  label: "README.md",
                  plainText: "@README.md",
                })
              }
            >
              Insert reference
            </button>
            <button
              className="btn btn-ghost btn-sm"
              type="button"
              onClick={() =>
                editor.current?.insertQuote({
                  type: "quote",
                  nodeId: `demo-quote-${++occurrence.current}`,
                  text: "Keep user edits while admission is pending.",
                  source: {
                    messageId: "demo-message",
                    conversationId: scope.conversationId,
                    label: "Earlier assistant reply",
                  },
                })
              }
            >
              Insert quote
            </button>
            <button
              className="btn btn-ghost btn-sm"
              type="button"
              onClick={() =>
                editor.current?.claimCommand(
                  { providerId: "demo-commands", commandId: "help" },
                  "/help",
                )
              }
            >
              Claim /help command
            </button>
            <button
              className="btn btn-ghost btn-sm"
              type="button"
              onClick={() =>
                editor.current?.claimCommand(
                  { providerId: "demo-commands", commandId: "review" },
                  "/review",
                )
              }
            >
              Claim /review prompt
            </button>
          </>
        ) : null}
      </div>
      <ComposerSettings
        scopeKey={scope.conversationId}
        revision={state.settingsRevision}
        settings={settings}
        onRequest={demo.requestSetting}
        onAcknowledged={demo.acknowledgeSetting}
      />
      <p className="chat-composer-status" role="status">
        Host: {state.runtime.status}; model: {state.model}; queue revision:{" "}
        {state.queue.revision}.
      </p>
      <ChatAuthoritativeQueue
        projection={state.queue}
        capabilities={capabilities.queue}
        targetTurnId={state.runtime.activeTurnId}
        onMutation={demo.mutate}
        onProjection={demo.applyProjection}
        renderDocumentEditor={(props) => <QueueDocumentEditor {...props} />}
      />
      <Composer
        key={mount}
        ref={editor}
        value={value}
        onDocumentChange={setValue}
        scope={scope}
        draftKey="demo-draft"
        host={demo.host}
        runtime={state.runtime}
        policy={{ runningIntent: intent }}
        options={{ model: state.model }}
        draftAdapter={demo.draftAdapter}
        attachmentOptions={demo.attachmentOptions}
        providers={providers}
        onProviderInvoke={demo.invoke}
        onStop={demo.stop}
        allowAttachmentOnly
        label={rich ? "Rich demo message" : "Semantic demo message"}
      />
      <p className="chat-composer-hint">
        Cmd/Ctrl+Enter submits; Enter inserts a line. Type @ for references or /
        for commands and editable skills. Choose up to three images, .txt, .md
        or .pdf files, each at most 2 MiB. Preparation fails once per occurrence
        when enabled; use Retry. Save draft explicitly before remounting to try
        restoration; files then require reattachment. Stop remains independent
        of submission and preparation.
      </p>
      <details>
        <summary>Current portable document</summary>
        <pre aria-label="Current portable document">
          {JSON.stringify(value.document, null, 2)}
        </pre>
      </details>
      <div
        aria-label="Demo host events"
        role="log"
        className="chat-composer-status"
      >
        {state.events.map((event, index) => (
          <p key={`${index}-${event}`}>{event}</p>
        ))}
      </div>
    </div>
  );
}

export function SemanticComposerPreview() {
  return <SessionDemo rich={false} />;
}
export function RichComposerPreview() {
  return <SessionDemo rich />;
}
