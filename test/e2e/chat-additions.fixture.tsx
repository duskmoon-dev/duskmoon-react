import React, { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Chat,
  ChatSessionComposer,
  ComposerSettings,
  createComposerRecoveryOwner,
  type ChatRequestState,
  type ComposerDocumentUpdate,
  type ComposerSessionHost,
  type ComposerSettingRequest,
  type ComposerSettingResult,
} from "../../packages/components/src/components/chat";

function Context({ name }: { name: string }) {
  const [goal, setGoal] = useState(true);
  return (
    <Chat.ComposerContext aria-label={`${name} context`}>
      <Chat.ComposerContextItem
        title="workspace/project/with/a/long/path/and/a/long/file/name.tsx"
        icon={
          <svg viewBox="0 0 16 16">
            <path d="M1 3h14v11H1z" />
          </svg>
        }
      >
        workspace/project/with/a/long/path/and/a/long/file/name.tsx
      </Chat.ComposerContextItem>
      <Chat.ComposerContextEnd>
        {goal ? (
          <Chat.ComposerContextItem
            action={{
              label: `Clear ${name} goal`,
              onClick: () => setGoal(false),
              children: "×",
            }}
          >
            Plan mode
          </Chat.ComposerContextItem>
        ) : null}
        <Chat.ComposerConnection state="connected" />
      </Chat.ComposerContextEnd>
    </Chat.ComposerContext>
  );
}

function Fixture() {
  const [revision, setRevision] = useState(1);
  const [values, setValues] = useState<Record<string, string>>({
    access: "ask",
    model: "standard",
    effort: "low",
  });
  const [requests, setRequests] = useState<ComposerSettingRequest[]>([]);
  const pending = useRef<
    | {
        request: ComposerSettingRequest;
        resolve: (result: ComposerSettingResult) => void;
      }
    | undefined
  >(undefined);
  const [approval, setApproval] = useState<ChatRequestState>("pending");
  const [decisionPending, setDecisionPending] = useState(false);
  const [decision, setDecision] = useState("");
  const [text, setText] = useState("");
  const [document, setDocument] = useState<ComposerDocumentUpdate>({
    revision: 0,
    origin: "replace",
    originId: "fixture",
    document: { schemaVersion: 1, content: [] },
  });
  const [host] = useState<ComposerSessionHost>(() => ({
    recovery: createComposerRecoveryOwner(),
    capabilities: {
      protocolVersion: 1,
      documentVersions: [1],
      intents: ["send"],
      commands: false,
      attachments: false,
      queue: { edit: "none", remove: false, promote: false },
      durableRecovery: false,
    },
    submit: async () => {
      throw new Error("Browser fixture must never submit");
    },
  }));

  function settle(outcome: "accepted" | "rejected") {
    const item = pending.current;
    if (!item) return;
    pending.current = undefined;
    item.resolve({
      ...item.request,
      revision: item.request.expectedRevision + 1,
      ...(outcome === "accepted"
        ? { outcome, value: item.request.value }
        : { outcome, message: "Host rejected this choice" }),
    });
  }

  return (
    <section
      aria-label="Chat additions fixture"
      style={{
        maxWidth: 760,
        margin: "0 auto",
        padding: 16,
        background: "var(--color-surface)",
        color: "var(--color-on-surface)",
      }}
    >
      <h1>Chat additions browser fixture</h1>
      <button type="button" onClick={() => settle("accepted")}>
        Accept settings
      </button>
      <button type="button" onClick={() => settle("rejected")}>
        Reject settings
      </button>
      <button
        type="button"
        onClick={() => setRevision((current) => current + 5)}
      >
        Advance settings revision
      </button>
      <output aria-label="Settings requests">{JSON.stringify(requests)}</output>
      <output aria-label="Settings revision">{revision}</output>
      <Chat.Composer
        value={text}
        onValueChange={setText}
        onSubmit={() => false}
        compact
        textareaProps={{ "aria-label": "Settings message" }}
        context={<Context name="settings" />}
      >
        <ComposerSettings
          variant="menu"
          scopeKey="fixture"
          revision={revision}
          groups={[
            {
              id: "access",
              label: "Access settings",
              settingIds: ["access"],
              appearance: "access",
            },
            {
              id: "model",
              label: "Model settings",
              settingIds: ["model", "effort"],
              nestedSettingIds: ["model"],
              appearance: "model",
            },
          ]}
          settings={[
            {
              id: "access",
              label: "Access",
              value: values.access,
              choices: [
                {
                  value: "ask",
                  label: "Ask for approval",
                  description: "Review every action",
                },
                {
                  value: "full",
                  label: "Full access",
                  description: "Allow actions without prompts",
                  tone: "warning",
                },
              ],
            },
            {
              id: "model",
              label: "Model",
              value: values.model,
              choices: [
                { value: "standard", label: "Standard" },
                {
                  value: "fast",
                  label: "Fast",
                  description: "A quicker model",
                },
              ],
            },
            {
              id: "effort",
              label: "Effort",
              value: values.effort,
              ordered: true,
              defaultValue: "medium",
              choices: [
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
              ],
            },
          ]}
          onRequest={(request) => {
            setRequests((current) => [...current, request]);
            return new Promise((resolve) => {
              pending.current = { request, resolve };
            });
          }}
          onAcknowledged={(result) => {
            setRevision(result.revision);
            if (result.outcome === "accepted")
              setValues((current) => ({
                ...current,
                [result.settingId]: result.value,
              }));
          }}
        />
      </Chat.Composer>
      <h2>Approval timeline</h2>
      <button
        type="button"
        onClick={() => {
          setApproval("approved");
          setDecisionPending(false);
        }}
      >
        Resolve approval
      </button>
      <button
        type="button"
        onClick={() => {
          setApproval("pending");
          setDecisionPending(false);
        }}
      >
        Reset approval
      </button>
      <label>
        Approval state
        <select
          aria-label="Approval state"
          value={approval}
          onChange={(event) => {
            setApproval(event.currentTarget.value as ChatRequestState);
            setDecisionPending(false);
          }}
        >
          {[
            "pending",
            "approved",
            "approved-for-session",
            "declined",
            "expired",
            "answer-elsewhere",
          ].map((state) => (
            <option key={state}>{state}</option>
          ))}
        </select>
      </label>
      <output aria-label="Approval decision">{decision}</output>
      <Chat.Agent>
        <Chat.Tool>
          <Chat.ToolHeader>Run tests</Chat.ToolHeader>
          <Chat.ToolCall>npm test</Chat.ToolCall>
        </Chat.Tool>
        <Chat.Request
          title="Run npm test?"
          state={approval}
          pending={decisionPending}
          explanation={
            approval === "answer-elsewhere"
              ? "Answer in the connected terminal"
              : undefined
          }
          actions={[
            {
              id: "approve",
              label: "Approve",
              tone: "primary",
              onSelect: () => {
                setDecision("approve");
                setDecisionPending(true);
              },
            },
            {
              id: "session",
              label: "Approve for session",
              onSelect: () => {
                setDecision("session");
                setDecisionPending(true);
              },
            },
            {
              id: "decline",
              label: "Decline",
              tone: "danger",
              onSelect: () => {
                setDecision("decline");
                setDecisionPending(true);
              },
            },
          ]}
        >
          <code>npm test</code>
        </Chat.Request>
      </Chat.Agent>
      <h2>Context variants</h2>
      {(["default", "compact", "ghost", "compact-ghost"] as const).map(
        (variant) => (
          <React.Fragment key={variant}>
            <Chat.Composer
              aria-label={`legacy ${variant}`}
              className={
                variant.includes("ghost") ? "chat-composer-ghost" : undefined
              }
              compact={variant.includes("compact")}
              value=""
              onValueChange={() => {}}
              onSubmit={() => false}
              textareaProps={{ "aria-label": `legacy ${variant} message` }}
              context={<Context name={`legacy ${variant}`} />}
            />
            <ChatSessionComposer
              aria-label={`session ${variant}`}
              className={
                variant.includes("ghost") ? "chat-composer-ghost" : undefined
              }
              compact={variant.includes("compact")}
              value={document}
              onDocumentChange={setDocument}
              scope={{ contextKey: "fixture", conversationId: variant }}
              draftKey={variant}
              host={host}
              label={`session ${variant} message`}
              context={<Context name={`session ${variant}`} />}
            />
          </React.Fragment>
        ),
      )}
    </section>
  );
}

export function mountChatAdditionsFixture() {
  const container = document.createElement("div");
  document.body.replaceChildren(container);
  createRoot(container).render(<Fixture />);
}
