import React, { useId, useRef, useState, useSyncExternalStore } from "react";
import {
  ChatAuthoritativeQueue,
  Chat,
  ComposerSettings,
  ChatSessionComposer,
  Button,
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
  readonly effort: string;
  readonly approval: string;
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

const settingsValues: Record<string, readonly string[]> = {
  model: ["standard", "fast"],
  effort: ["low", "medium", "high", "max"],
  approval: ["ask", "auto", "full"],
};

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
    effort: "medium",
    approval: "ask",
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
        request.value === "restricted" ||
        !(settingsValues[request.settingId] ?? []).includes(request.value)
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
          ...(result.outcome === "accepted"
            ? { [result.settingId]: result.value }
            : {}),
        },
        `${result.settingId} change ${result.outcome}.`,
      );
    },
  };
}

const providers: readonly ComposerCompletionProvider[] = [
  {
    providerId: "demo-files",
    label: "Repository references",
    icon: <DemoIcon name="reference" />,
    sourceLabel: "Demo",
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
    icon: <DemoIcon name="command" />,
    sourceLabel: "Demo",
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
              description: "Show available commands",
              action: {
                type: "insert",
                command: { providerId: "demo-commands", commandId: "help" },
                content: [{ type: "text", text: "/help " }],
              },
            },
            {
              id: "review",
              label: "/review",
              description: "Review the current changes",
              action: {
                type: "insert",
                command: { providerId: "demo-commands", commandId: "review" },
                content: [{ type: "text", text: "/review " }],
              },
            },
            {
              id: "inspect",
              label: "/inspect",
              description: "Inspect the current session",
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
    label: "Skills",
    icon: <DemoIcon name="skill" />,
    sourceLabel: "Demo",
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
              description: "Summarize changes and completed checks",
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

const demoIcons = {
  start: "m8 5 11 7-11 7Z",
  remount: "M3 11a9 9 0 1 1 2.6 7.4M3 4v7h7",
  clear: "M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7",
  reference: "M14 2H6v20h12V6ZM14 2v5h5M8 12h8M8 16h5",
  quote: "M3 6h7v7H3ZM14 6h7v7h-7ZM10 13c0 4-2 6-5 6M21 13c0 4-2 6-5 6",
  command: "m4 6 6 6-6 6M13 18h7",
  skill: "m12 3 8 4v10l-8 4-8-4V7ZM4 7l8 4 8-4M12 11v10",
  review: "m15 4 5 5-11 11H4v-5ZM13 6l5 5",
  settings: "M4 7h16M4 17h16M8 4v6M16 14v6",
  help: "M12 8h.01M12 12v5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  inspect: "M4 4h16v16H4ZM7 8l3 3-3 3M12 15h5",
  save: "M5 3h12l4 4v14H3V3ZM7 3v6h10V3M7 21v-8h10v8",
  cancel: "m6 6 12 12M6 18 18 6",
};
type DemoIconName = keyof typeof demoIcons;

function DemoIcon({ name }: { name: DemoIconName }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={demoIcons[name]} />
    </svg>
  );
}

function DemoAction({
  label,
  icon,
  ...props
}: {
  label: string;
  icon: DemoIconName;
} & React.ComponentProps<typeof Button>) {
  return (
    <Button
      type="button"
      appearance="ghost"
      color="base"
      size="sm"
      shape="circle"
      {...props}
      aria-label={label}
      title={label}
    >
      <DemoIcon name={icon} />
    </Button>
  );
}

/** Core owns menu sizing/placement; the native Popover owns dismissal and focus. */
function DemoPopover({
  label,
  icon,
  children,
}: {
  label: string;
  icon: DemoIconName;
  children: React.ReactNode;
}) {
  const id = useId();
  const anchorName = `--demo-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="popover-menu-item"
        aria-label={label}
        title={label}
        popoverTarget={id}
        aria-controls={id}
        aria-expanded={open}
        style={{ anchorName } as React.CSSProperties}
      >
        <DemoIcon name={icon} />
        <span>{label}</span>
      </button>
      <div
        id={id}
        popover="auto"
        className="popover popover-menu chat-composer-menu chat-demo-popover"
        role="group"
        aria-label={label}
        style={{ positionAnchor: anchorName } as React.CSSProperties}
        onToggle={(event) =>
          setOpen(event.currentTarget.matches(":popover-open"))
        }
      >
        {children}
      </div>
    </>
  );
}

const models = [
  ["standard", "Standard demo model", "Standard"],
  ["fast", "Fast demo model", "Fast"],
  ["restricted", "Restricted model (host rejects)", "Restricted"],
] as const;
const efforts = ["low", "medium", "high", "max"];
const effortLabels = ["Low", "Medium", "High", "Max"];
const approvals = [
  ["ask", "Ask for approval", "Review each action before it runs."],
  ["auto", "Approve for me", "Request review for sensitive actions."],
  ["full", "Full access", "Allow actions without an approval prompt."],
] as const;

const menuGroups = [
  {
    id: "approval",
    label: "Approval mode",
    settingIds: ["approval"],
    appearance: "access" as const,
  },
  {
    id: "model",
    label: "Model settings",
    settingIds: ["model", "effort"],
    nestedSettingIds: ["model"],
    appearance: "model" as const,
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
      <DemoAction
        label="Save queued document"
        icon="save"
        disabled={pending}
        onClick={onSave}
      />
      <DemoAction
        label="Cancel"
        icon="cancel"
        disabled={pending}
        onClick={onCancel}
      />
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
  function replace(document: ComposerDocument) {
    setValue((current) => ({
      document,
      revision: current.revision + 1,
      origin: "replace",
      originId: `demo-replace-${++occurrence.current}`,
    }));
  }
  const addMenu = (
    <>
      <DemoPopover label="Demo controls" icon="settings">
        <div className="chat-demo-controls">
          <DemoAction
            label="Start demo turn"
            icon="start"
            onClick={demo.start}
          />
        </div>
        <div className="chat-demo-fields">
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
        <div className="chat-demo-controls">
          <DemoAction
            label="Remount editor"
            icon="remount"
            onClick={() => setMount((current) => current + 1)}
          />
          <DemoAction
            label="Replace with empty document"
            icon="clear"
            onClick={() =>
              replace({
                schemaVersion: 1,
                content: [{ type: "text", text: "" }],
              })
            }
          />
          {rich ? (
            <>
              <DemoAction
                label="Insert reference"
                icon="reference"
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
              />
              <DemoAction
                label="Insert quote"
                icon="quote"
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
              />
              <DemoAction
                label="Claim /help command"
                icon="command"
                onClick={() =>
                  editor.current?.claimCommand(
                    { providerId: "demo-commands", commandId: "help" },
                    "/help",
                  )
                }
              />
              <DemoAction
                label="Claim /review prompt"
                icon="review"
                onClick={() =>
                  editor.current?.claimCommand(
                    { providerId: "demo-commands", commandId: "review" },
                    "/review",
                  )
                }
              />
            </>
          ) : null}
        </div>
      </DemoPopover>
      <DemoPopover label="Composer help" icon="help">
        <div className="popover-body">
          <p>
            Cmd/Ctrl+Enter sends; Enter adds a line. Type @ for references or /
            for commands and editable skills.
          </p>
          <p>
            Add up to three images, .txt, .md or .pdf files, each at most 2 MiB.
            If preparation fails, use Retry.
          </p>
          <p>
            Save a draft before remounting to try restoration; files then
            require reattachment. Stop is independent of sending and
            preparation.
          </p>
          <p>
            This interactive demo keeps files, drafts and recovery in memory. It
            has no backend; reloading the page discards its state.
          </p>
        </div>
      </DemoPopover>
      <DemoPopover label="Inspect demo state" icon="inspect">
        <details>
          <summary>Current portable document</summary>
          <pre aria-label="Current portable document">
            {JSON.stringify(value.document, null, 2)}
          </pre>
        </details>
        <p>
          Host: {state.runtime.status}; model: {state.model}; queue revision:{" "}
          {state.queue.revision}.
        </p>
        <div aria-label="Demo host events" role="log" aria-live="off">
          {state.events.length ? (
            state.events.map((event, index) => (
              <p key={`${index}-${event}`}>{event}</p>
            ))
          ) : (
            <p>No events yet.</p>
          )}
        </div>
      </DemoPopover>
    </>
  );
  return (
    <div
      className="chat-demo chat-session-demo"
      data-chat-session-demo={rich ? "rich" : "plain"}
    >
      <p className="sr-only" role="status">
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
        compact
        addMenu={addMenu}
        attachLabel="Add files and more"
        className="chat-composer-ghost"
        key={mount}
        ref={editor}
        value={value}
        onDocumentChange={setValue}
        scope={scope}
        draftKey="demo-draft"
        host={demo.host}
        runtime={state.runtime}
        policy={{ runningIntent: intent }}
        options={{
          model: state.model,
          effort: state.effort,
          approval: state.approval,
        }}
        draftAdapter={demo.draftAdapter}
        attachmentOptions={demo.attachmentOptions}
        providers={providers}
        onProviderInvoke={demo.invoke}
        onStop={demo.stop}
        context={
          <Chat.ComposerContext>
            <Chat.ComposerContextItem icon={<DemoIcon name="reference" />}>
              demo-repository
            </Chat.ComposerContextItem>
            <Chat.ComposerContextEnd>
              <Chat.ComposerConnection state="connected" />
            </Chat.ComposerContextEnd>
          </Chat.ComposerContext>
        }
        allowAttachmentOnly
        label={rich ? "Rich demo message" : "Semantic demo message"}
      >
        <ComposerSettings
          variant="menu"
          groups={menuGroups}
          scopeKey={scope.conversationId}
          revision={state.settingsRevision}
          settings={[
            {
              id: "approval",
              label: "Approval mode",
              value: state.approval,
              choices: approvals.map(([value, label, description]) => ({
                value,
                label,
                description,
                tone: value === "full" ? ("warning" as const) : undefined,
              })),
            },
            {
              id: "model",
              label: "Model",
              value: state.model,
              choices: models.map(([value, label]) => ({ value, label })),
            },
            {
              id: "effort",
              label: "Reasoning effort",
              value: state.effort,
              ordered: true,
              defaultValue: "medium",
              choices: efforts.map((value, index) => ({
                value,
                label: effortLabels[index],
              })),
            },
          ]}
          onRequest={demo.requestSetting}
          onAcknowledged={demo.acknowledgeSetting}
        />
      </Composer>
    </div>
  );
}

export function SemanticComposerPreview() {
  return <SessionDemo rich={false} />;
}
export function RichComposerPreview() {
  return <SessionDemo rich />;
}

/** Focused Core 1.21.1 composition; settings still require host acknowledgment. */
export function CompactComposerPreview() {
  const [demo] = useState(() => {
    const host = createDemoHost();
    host.setFailPreparation(false);
    return host;
  });
  const state = useSyncExternalStore(
    demo.subscribe,
    demo.getSnapshot,
    demo.getSnapshot,
  );
  const [rich, setRich] = useState(true);
  const [value, setValue] = useState<ComposerDocumentUpdate>({
    document: {
      schemaVersion: 1,
      content: [{ type: "text", text: "Review the latest changes." }],
    },
    revision: 0,
    origin: "replace",
    originId: "compact-initial",
  });
  const Composer = rich ? RichChatComposer : ChatSessionComposer;
  return (
    <div className="chat-demo chat-session-demo" data-chat-compact-demo>
      <Composer
        compact
        attachLabel="Add files and more"
        addMenu={
          <>
            <DemoPopover label="Composer help" icon="help">
              <div className="popover-body">
                <p>
                  Cmd/Ctrl+Enter sends; Enter adds a line. Add files with +;
                  images become thumbnails after preparation. Type / to choose
                  skills or commands, or @ for repository references.
                </p>
                <p>
                  Choose a model and reasoning effort from the model menu.
                  Switch editors from Add. Stop and follow-up submission are
                  independent.
                </p>
                <p>
                  This in-memory demo applies model choices only after the host
                  acknowledges them.
                </p>
              </div>
            </DemoPopover>
            <label className="chat-composer-menu-field">
              <span>
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={rich}
                  onChange={(event) => setRich(event.currentTarget.checked)}
                />{" "}
                Use rich editor
              </span>
            </label>
          </>
        }
        className="chat-composer-ghost"
        value={value}
        onDocumentChange={setValue}
        scope={scope}
        draftKey="compact-demo"
        host={demo.host}
        runtime={state.runtime}
        attachmentOptions={demo.attachmentOptions}
        providers={providers}
        onProviderInvoke={demo.invoke}
        options={{
          model: state.model,
          effort: state.effort,
          approval: state.approval,
        }}
        onStop={demo.stop}
        context={
          <Chat.ComposerContext>
            <Chat.ComposerContextItem icon={<DemoIcon name="reference" />}>
              demo-repository
            </Chat.ComposerContextItem>
            <Chat.ComposerContextEnd>
              <Chat.ComposerConnection state="connected" />
            </Chat.ComposerContextEnd>
          </Chat.ComposerContext>
        }
        allowAttachmentOnly
        label="Compact demo message"
      >
        <ComposerSettings
          variant="menu"
          groups={menuGroups}
          scopeKey={scope.conversationId}
          revision={state.settingsRevision}
          settings={[
            {
              id: "approval",
              label: "Approval mode",
              value: state.approval,
              choices: approvals.map(([value, label, description]) => ({
                value,
                label,
                description,
                tone: value === "full" ? ("warning" as const) : undefined,
              })),
            },
            {
              id: "model",
              label: "Model",
              value: state.model,
              choices: models.map(([value, label]) => ({ value, label })),
            },
            {
              id: "effort",
              label: "Reasoning effort",
              value: state.effort,
              ordered: true,
              defaultValue: "medium",
              choices: efforts.map((value, index) => ({
                value,
                label: effortLabels[index],
              })),
            },
          ]}
          onRequest={demo.requestSetting}
          onAcknowledged={demo.acknowledgeSetting}
        />
      </Composer>
      <p className="sr-only" role="status" aria-label="Compact host state">
        Host: {state.runtime.status}; model: {state.model}; waiting messages:{" "}
        {state.queue.items.length}.
        {state.events.at(-1) ? ` ${state.events.at(-1)}` : ""}
      </p>
    </div>
  );
}
