import React, { useEffect, useRef, useState } from "react";
import { Chat, type ChatRequestState } from "@duskmoon-dev/components/chat";

/** The demo host, rather than Chat.Request, confirms each delayed decision. */
export function ChatRequestsPreview() {
  const [state, setState] = useState<ChatRequestState>("pending");
  const [pending, setPending] = useState(false);
  const [value, setValue] = useState("");
  const [sent, setSent] = useState("");
  const [goal, setGoal] = useState(true);
  const [compact, setCompact] = useState(true);
  const [ghost, setGhost] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  function decide(next: ChatRequestState) {
    if (timer.current || state !== "pending") return;
    setPending(true);
    timer.current = setTimeout(() => {
      setState(next);
      setPending(false);
      timer.current = undefined;
    }, 650);
  }

  function reset() {
    clearTimeout(timer.current);
    timer.current = undefined;
    setPending(false);
    setState("pending");
  }

  return (
    <div
      data-chat-requests-demo
      style={{ width: "min(44rem, 100%)", display: "grid", gap: "1rem" }}
    >
      <div
        className="chat-demo-controls"
        role="group"
        aria-label="Demo controls"
      >
        <button type="button" className="btn btn-sm" onClick={reset}>
          Reset approval request
        </button>
        <label>
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={compact}
            onChange={(event) => setCompact(event.currentTarget.checked)}
          />{" "}
          Compact composer
        </label>
        <label>
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={ghost}
            onChange={(event) => setGhost(event.currentTarget.checked)}
          />{" "}
          Ghost composer
        </label>
      </div>
      <Chat.Agent>
        <Chat.Header>Assistant</Chat.Header>
        <Chat.Content>
          I can check the changes. This command needs your approval first.
        </Chat.Content>
        <Chat.Tool status="pending" open>
          <Chat.ToolHeader>
            Run project tests <Chat.ToolStatus>Not executed</Chat.ToolStatus>
          </Chat.ToolHeader>
          <Chat.ToolCall>
            <code>npm test</code>
          </Chat.ToolCall>
          <Chat.ToolResult>
            This preview records a decision without executing the command.
          </Chat.ToolResult>
        </Chat.Tool>
        <Chat.Request
          title="Allow the assistant to run npm test?"
          state={state}
          pending={pending}
          actions={[
            {
              id: "approve",
              label: "Approve",
              tone: "primary",
              onSelect: () => decide("approved"),
            },
            {
              id: "session",
              label: "Approve for this session",
              onSelect: () => decide("approved-for-session"),
            },
            {
              id: "decline",
              label: "Decline",
              tone: "danger",
              onSelect: () => decide("declined"),
            },
          ]}
        >
          <pre aria-label="Requested command">
            <code>npm test</code>
          </pre>
          <p>Working directory: /workspace/example</p>
        </Chat.Request>
        <Chat.Request
          title="Apply changes to three files?"
          state="expired"
          explanation={
            <p>The host withdrew this request after the turn ended.</p>
          }
        />
        <Chat.Request
          title="Confirm the deployment?"
          state="answer-elsewhere"
          explanation={
            <p>Open the original terminal client to answer this request.</p>
          }
        />
      </Chat.Agent>
      <Chat.Composer
        compact={compact}
        className={ghost ? "chat-composer-ghost" : undefined}
        value={value}
        onValueChange={setValue}
        onSubmit={(submission) => setSent(submission.value)}
        textareaProps={{
          "aria-label": "Approval demo message",
          placeholder: "Keep writing while the host confirms a decision…",
        }}
        context={
          <Chat.ComposerContext>
            <Chat.ComposerContextItem icon={<span>⌘</span>}>
              /workspace/example
            </Chat.ComposerContextItem>
            {goal ? (
              <Chat.ComposerContextItem
                action={{
                  label: "Clear active goal",
                  children: "×",
                  onClick: () => setGoal(false),
                }}
              >
                Goal: verify the changes
              </Chat.ComposerContextItem>
            ) : null}
            <Chat.ComposerContextEnd>
              <Chat.ComposerConnection
                state="connected"
                label="Local host connected"
              />
            </Chat.ComposerContextEnd>
          </Chat.ComposerContext>
        }
      />
      {sent ? (
        <p role="status" aria-label="Demo submitted message">
          Submitted: {sent}
        </p>
      ) : null}
    </div>
  );
}
