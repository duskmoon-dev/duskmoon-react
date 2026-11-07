import React, { useId, useRef, useState } from "react";
import { Chat } from "@duskmoon-dev/components/chat";

export function AgentActivityPreview() {
  return (
    <div data-chat-agent-demo style={{ width: "min(42rem, 100%)" }}>
      <Chat.Agent>
        <Chat.Work>
          <Chat.WorkSummary>Worked · 2 tool calls · 0 failed</Chat.WorkSummary>
          <Chat.WorkBody>
            <Chat.Reasoning>
              <summary>Reasoning</summary>
              <div className="chat-reasoning-body">
                Compare the source contract before checking behavior.
              </div>
            </Chat.Reasoning>
            <Chat.Tool status="success">
              <Chat.ToolHeader>
                Review source <Chat.ToolStatus>Done</Chat.ToolStatus>
              </Chat.ToolHeader>
              <Chat.ToolResult>Markup reviewed.</Chat.ToolResult>
            </Chat.Tool>
          </Chat.WorkBody>
        </Chat.Work>
        <Chat.Content className="markdown-body">
          <p>The answer stays visible when activity is closed.</p>
        </Chat.Content>
      </Chat.Agent>
      <Chat.Agent>
        <Chat.Content streaming>Progress without an avatar</Chat.Content>
      </Chat.Agent>
    </div>
  );
}

const initialMessage =
  "Review the chat view.\nKeep the waiting queue.\nSupport immediate steer.\nPreserve message order.\nKeep multiline text.\nCheck keyboard focus.\nCheck narrow screens.\nShare the results.";

export function CollapsibleMessagePreview() {
  const [message, setMessage] = useState(initialMessage);
  const id = useId();
  return (
    <div
      data-chat-collapse-demo
      style={{ width: "min(42rem, 100%)", display: "grid", gap: "1rem" }}
    >
      <label htmlFor={id}>Sent message text (edit to remeasure)</label>
      <textarea
        id={id}
        className="textarea"
        value={message}
        rows={3}
        onChange={(event) => setMessage(event.currentTarget.value)}
      />
      <Chat placement="end">
        <Chat.Bubble color="primary" collapsible>
          {message}
        </Chat.Bubble>
      </Chat>
    </div>
  );
}

function QueueIcon({
  action,
}: {
  action: "send" | "steer" | "complete" | "reject" | "reset";
}) {
  const paths = {
    send: "m5 12 7-7 7 7M12 5v14",
    steer: "m15 4 5 5-5 5M20 9h-9a6 6 0 0 0-6 6v4",
    complete: "m5 12 4 4L19 6",
    reject: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM6 6l12 12",
    reset: "M3 11a9 9 0 1 1 2.6 7.4M3 4v7h7",
  };
  return (
    <svg
      width="18"
      height="18"
      style={{ flexShrink: 0 }}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[action]} />
    </svg>
  );
}

/** Local simulation only. Applications await their transport before changing the queue. */
export function WaitingQueuePreview() {
  const inputId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const serial = useRef(2);
  const [draft, setDraft] = useState("");
  const [active, setActive] = useState(true);
  const [turns, setTurns] = useState(1);
  const [rejectNext, setRejectNext] = useState(false);
  const [queue, setQueue] = useState([
    { id: "queued-1", text: "Also include the accessibility checks." },
    { id: "queued-2", text: "Check narrow screens too." },
  ]);
  const [sent, setSent] = useState<{ id: string; text: string }[]>([]);
  const [status, setStatus] = useState(
    "Reply in progress. 2 messages waiting.",
  );

  function accepted() {
    if (!rejectNext) return true;
    setRejectNext(false);
    setStatus(
      "Admission rejected. The draft and waiting messages are preserved; retry the action.",
    );
    return false;
  }

  function admit(steer = false) {
    if (!draft.trim() || (steer && !active) || !accepted()) return;
    const item = { id: `message-${++serial.current}`, text: draft };
    if (active && !steer) {
      setQueue((current) => [...current, item]);
      setStatus(`Message queued. ${queue.length + 1} messages waiting.`);
    } else {
      setSent((current) => [...current, item]);
      if (!steer) {
        setActive(true);
        setTurns((current) => current + 1);
      }
      setStatus(
        steer
          ? `Draft steered into the current reply. ${queue.length} messages waiting.`
          : "Message sent. Reply started.",
      );
    }
    setDraft("");
  }

  function consume(id: string, steer: boolean) {
    const item = queue.find((entry) => entry.id === id);
    if (!item || (steer && !accepted())) return;
    setQueue((current) => current.filter((entry) => entry.id !== id));
    if (steer) setSent((current) => [...current, item]);
    setStatus(
      `${steer ? "Message steered into the current reply" : "Waiting message removed"}. ${queue.length - 1} messages waiting.`,
    );
    inputRef.current?.focus();
  }

  function complete() {
    const next = queue[0];
    if (next && !accepted()) return;
    if (next) {
      setQueue((current) => current.slice(1));
      setSent((current) => [...current, next]);
      setTurns((current) => current + 1);
      setStatus(
        `Reply completed; oldest waiting message dispatched. ${queue.length - 1} messages waiting.`,
      );
    } else {
      setActive(false);
      setStatus("Reply completed. No messages waiting.");
    }
  }

  return (
    <div
      data-chat-queue-demo
      data-reply-count={turns}
      style={{ width: "min(42rem, 100%)", display: "grid", gap: "1rem" }}
    >
      {sent.map((item) => (
        <Chat key={item.id} placement="end">
          <Chat.Bubble color="primary" collapsible>
            {item.text}
          </Chat.Bubble>
        </Chat>
      ))}
      <Chat.Agent>
        <Chat.Content streaming={active}>
          {active ? "Simulated reply in progress" : "Simulated reply complete"}
        </Chat.Content>
      </Chat.Agent>
      <Chat.InputArea>
        <Chat.Queue
          items={queue}
          steerDisabled={!active}
          onSteer={(id) => consume(id, true)}
          onRemove={(id) => consume(id, false)}
        />
        <Chat.ComposerForm
          ghost
          onSubmit={(event) => {
            event.preventDefault();
            admit();
          }}
        >
          <label className="sr-only" htmlFor={inputId}>
            Queue demo message
          </label>
          <Chat.ComposerInput
            ref={inputRef}
            id={inputId}
            name="message"
            value={draft}
            rows={3}
            placeholder="Message the agent…"
            onChange={(event) => setDraft(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (
                event.nativeEvent.isComposing ||
                event.keyCode === 229 ||
                event.key !== "Enter" ||
                event.shiftKey ||
                event.altKey
              )
                return;
              event.preventDefault();
              if (event.ctrlKey || event.metaKey) admit(true);
              else event.currentTarget.form?.requestSubmit();
            }}
          />
          <Chat.ComposerActions>
            <button
              className="btn btn-primary btn-sm btn-circle btn-icon btn-icon-sm"
              type="submit"
              disabled={!draft.trim()}
              aria-label={active ? "Queue message" : "Send message"}
              title={active ? "Queue message (Enter)" : "Send message (Enter)"}
              aria-keyshortcuts="Enter"
            >
              <QueueIcon action="send" />
            </button>
            <button
              className="btn btn-ghost btn-sm btn-circle btn-icon btn-icon-sm"
              type="button"
              disabled={!active || !draft.trim()}
              aria-label="Steer current message"
              title="Steer current message (Ctrl/⌘+Enter)"
              aria-keyshortcuts="Control+Enter Meta+Enter"
              onClick={() => admit(true)}
            >
              <QueueIcon action="steer" />
            </button>
          </Chat.ComposerActions>
        </Chat.ComposerForm>
      </Chat.InputArea>
      <p role="status" aria-atomic="true">
        {status}
      </p>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button
          className="btn btn-ghost btn-sm btn-circle btn-icon btn-icon-sm"
          type="button"
          disabled={!active}
          aria-label="Complete response"
          title="Complete response"
          onClick={complete}
        >
          <QueueIcon action="complete" />
        </button>
        <button
          className="btn btn-ghost btn-sm btn-circle btn-icon btn-icon-sm"
          type="button"
          aria-label="Reject next admission"
          title="Reject next admission"
          aria-pressed={rejectNext}
          onClick={() => setRejectNext(!rejectNext)}
        >
          <QueueIcon action="reject" />
        </button>
        <button
          className="btn btn-ghost btn-sm btn-circle btn-icon btn-icon-sm"
          type="button"
          aria-label="Start fresh"
          title="Start fresh"
          onClick={() => {
            setActive(false);
            setQueue([]);
            setSent([]);
            setDraft("");
            setTurns(0);
            setRejectNext(false);
            setStatus("Idle. No messages waiting.");
            inputRef.current?.focus();
          }}
        >
          <QueueIcon action="reset" />
        </button>
      </div>
    </div>
  );
}
