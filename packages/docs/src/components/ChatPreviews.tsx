import React, { useId, useState } from "react";
import * as DmComponents from "@duskmoon-dev/components";

const Chat = DmComponents.Chat;
const Avatar = DmComponents.Avatar;
const Tooltip = DmComponents.Tooltip;

function ChatAvatar({ name, color }: { name: string; color?: string }) {
  return <Chat.Avatar><Avatar size="sm" fallback={name} className={color} /></Chat.Avatar>;
}

function Action({ label, onClick, children }: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip title={label}>
      <button type="button" className="btn btn-ghost btn-xs btn-square" aria-label={label} onClick={onClick}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          {children}
        </svg>
      </button>
    </Tooltip>
  );
}

function CodePane({ title, children }: { title: "Call" | "Result"; children: string }) {
  return (
    <div className="code-block code-block-compact">
      <div className="code-header"><span className="code-title">{title}</span><span className="code-language">json</span></div>
      <div className="code-content"><pre tabIndex={0} aria-label={`${title} JSON payload`}><code>{children}</code></pre></div>
    </div>
  );
}

export function BasicChatPreview() {
  return (
    <div className="chat-demo" style={{ width: "min(42rem, 100%)", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Chat>
        <ChatAvatar name="AI" color="avatar-primary" />
        <Chat.Header>Assistant - 2:15 PM</Chat.Header>
        <Chat.Bubble>How can I help you today? Read the <a href="/components/chat">Chat guide</a> for longer messages and links.</Chat.Bubble>
        <Chat.Footer>Delivered</Chat.Footer>
      </Chat>
      <Chat placement="end">
        <ChatAvatar name="GA" />
        <Chat.Header>You - 2:16 PM</Chat.Header>
        <Chat.Bubble color="primary">Show me a compact chat transcript.</Chat.Bubble>
        <Chat.Footer>Sent</Chat.Footer>
      </Chat>
    </div>
  );
}

const scrollReplies = [
  "Welcome back. The left ticks mark each assistant reply — scroll or click a tick to jump to that response.",
  "Each agent row exposes a named view timeline. The parent raises timeline scope so indicators can follow visible replies.",
  "No. Ticks only navigate to an agent response. User turns remain in the transcript without ticks.",
  "Indicators brighten as their paired assistant message enters the panel and fade as it leaves.",
  "Hash navigation scrolls the document. These buttons scroll only this conversation panel.",
  "The handler aligns the agent row with the top of the panel, allowing for its scroll margin.",
  "This longer answer gives the transcript enough height to scroll while the sticky indicator rail stays visible beside the message column. Long links, such as the DuskMoon component documentation, wrap inside a message instead of widening the panel.",
  "Done. Click the last dash to return to this assistant response without moving the page behind the panel.",
] as const;
const scrollQuestions = [
  "Can the rail follow assistant replies?",
  "Should user messages get ticks?",
  "What about animation range?",
  "Why avoid hash links?",
  "Can ticks land on the reply start?",
  "Add one more long answer.",
  "Great — take me to the last reply.",
] as const;
const scrollTimelines = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export function ScrollDrivenChatPreview() {
  const transcriptId = useId();
  const replyIds = scrollTimelines.map((timeline) => `${transcriptId}-reply-${timeline}`);
  return (
    <Chat.Scroll className="chat-demo" style={{ width: "min(48rem, 100%)", height: "22rem" }} aria-label="Example chat transcript">
      <Chat.ScrollTrack aria-label="Assistant replies">
        {scrollTimelines.map((timeline, index) => <Chat.ScrollIndicator key={timeline} timeline={timeline} targetId={replyIds[index]} />)}
      </Chat.ScrollTrack>
      <Chat.ScrollBody>
        {scrollTimelines.map((timeline, index) => (
          <React.Fragment key={timeline}>
            <Chat id={replyIds[index]} timeline={timeline}>
              <ChatAvatar name="AI" color="avatar-primary" />
              <Chat.Header>Assistant - 2:{String(index).padStart(2, "0")} PM</Chat.Header>
              <Chat.Bubble>{scrollReplies[index]}</Chat.Bubble>
            </Chat>
            {index < scrollQuestions.length && (
              <Chat placement="end">
                <ChatAvatar name="GA" />
                <Chat.Header>You - 2:{String(index + 1).padStart(2, "0")} PM</Chat.Header>
                <Chat.Bubble color="primary">{scrollQuestions[index]}</Chat.Bubble>
              </Chat>
            )}
          </React.Fragment>
        ))}
      </Chat.ScrollBody>
    </Chat.Scroll>
  );
}

export function BubbleColorsPreview() {
  const colors = ["primary", "secondary", "tertiary", "info", "success", "warning", "error"] as const;
  return (
    <div className="chat-demo" style={{ width: "min(42rem, 100%)", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <Chat><Chat.Bubble>Default bubble</Chat.Bubble></Chat>
      {colors.map((color) => <Chat key={color}><Chat.Bubble color={color}>{color} bubble</Chat.Bubble></Chat>)}
      <Chat placement="end"><Chat.Bubble color="primary" filled>Filled primary bubble</Chat.Bubble></Chat>
    </div>
  );
}

export function RtlBubblePreview() {
  return (
    <div className="chat-demo" dir="rtl" lang="ar" style={{ width: "min(42rem, 100%)", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Chat><ChatAvatar name="AI" color="avatar-primary" /><Chat.Header>المساعد</Chat.Header><Chat.Bubble>كيف يمكنني مساعدتك اليوم؟</Chat.Bubble></Chat>
      <Chat placement="end"><ChatAvatar name="GA" /><Chat.Header>أنت</Chat.Header><Chat.Bubble color="primary">أرني مثالاً للمحادثة.</Chat.Bubble></Chat>
    </div>
  );
}

export function BubbleSizesPreview() {
  const sizes = [["xs", "Extra small transcript bubble"], ["sm", "Small dense chat bubble"], ["md", "Medium default chat bubble"], ["lg", "Large accessible chat bubble"]] as const;
  return (
    <div className="chat-demo" style={{ width: "min(42rem, 100%)", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {sizes.map(([size, label]) => <Chat key={size}><Chat.Bubble size={size}>{label}</Chat.Bubble></Chat>)}
    </div>
  );
}

export function LlmChatPreview() {
  return (
    <div className="chat-demo" style={{ width: "min(48rem, 100%)", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Chat aria-live="polite">
        <ChatAvatar name="AI" color="avatar-info" />
        <Chat.Header>Assistant - 2:18 PM</Chat.Header>
        <Chat.Bubble>
          <Chat.Reasoning open>
            <summary>Thinking (3s)</summary>
            <div className="chat-reasoning-body">
              <div>I should call the weather tool, then summarize the result in one sentence.</div>
              <Chat.Tool status="running" open>
                <Chat.ToolHeader><span>get_weather</span><Chat.ToolStatus>Running...</Chat.ToolStatus></Chat.ToolHeader>
                <Chat.ToolCall><CodePane title="Call">{'{"city":"Tokyo"}'}</CodePane></Chat.ToolCall>
              </Chat.Tool>
              <div>Tool returned cloudy at 18 C. Drafting the final answer.</div>
            </div>
          </Chat.Reasoning>
          <Chat.Tool status="success" open>
            <Chat.ToolHeader><span>get_weather</span><Chat.ToolStatus>Done</Chat.ToolStatus></Chat.ToolHeader>
            <Chat.ToolCall><CodePane title="Call">{'{"city":"Tokyo"}'}</CodePane></Chat.ToolCall>
            <Chat.ToolResult><CodePane title="Result">{'{"temperature":"18 C","condition":"cloudy"}'}</CodePane></Chat.ToolResult>
          </Chat.Tool>
          <div className="chat-bubble-content chat-bubble-streaming">It is 18 C and cloudy in Tokyo right now.</div>
        </Chat.Bubble>
        <Chat.Footer>Streaming</Chat.Footer>
      </Chat>
    </div>
  );
}

export function LiveStatesPreview() {
  return (
    <div className="chat-demo" style={{ width: "min(42rem, 100%)", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Chat><ChatAvatar name="AI" color="avatar-secondary" /><Chat.Bubble><Chat.Typing /></Chat.Bubble></Chat>
      <Chat><ChatAvatar name="AI" color="avatar-secondary" /><Chat.Bubble streaming>Generating a response</Chat.Bubble></Chat>
    </div>
  );
}

export function MessageActionsPreview() {
  const editId = useId();
  const [question, setQuestion] = useState("Summarize the deployment checks.");
  const [draft, setDraft] = useState(question);
  const [editing, setEditing] = useState(false);
  const [generating, setGenerating] = useState(true);
  const [revision, setRevision] = useState(0);
  const [feedback, setFeedback] = useState("");
  const answer = revision === 0 ? "The build completed and all deployment smoke tests passed." : `Revision ${revision}: the build and smoke tests passed.`;
  async function copyAnswer() {
    try {
      await navigator.clipboard.writeText(answer);
      setFeedback("Deployment summary copied.");
    } catch {
      setFeedback("Copy failed. Select the summary to copy it.");
    }
  }
  return (
    <div className="chat-demo" style={{ width: "min(42rem, 100%)", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Chat placement="end">
        <ChatAvatar name="GA" /><Chat.Header>You</Chat.Header>
        <Chat.Bubble color="primary">{question}</Chat.Bubble>
        <Chat.Status><Chat.StatusItem>Sent</Chat.StatusItem><Chat.StatusItem><Chat.StatusValue>12</Chat.StatusValue> tokens</Chat.StatusItem></Chat.Status>
        <Chat.Actions hover>
          <Action label="Edit your deployment question" onClick={() => { setDraft(question); setEditing(true); }}><path d="m16 3 5 5-12 12H4v-5Z" /><path d="m14 5 5 5" /></Action>
        </Chat.Actions>
        {editing && <form onSubmit={(event) => { event.preventDefault(); setQuestion(draft); setEditing(false); setFeedback("Question updated."); }}>
          <label htmlFor={editId}>Edit question</label>
          <input id={editId} className="input" value={draft} onChange={(event) => setDraft(event.target.value)} />
          <button type="submit" className="btn btn-primary btn-xs">Save</button>
        </form>}
      </Chat>
      <Chat>
        <ChatAvatar name="AI" color="avatar-secondary" /><Chat.Header>Assistant · {generating ? "Generating" : "Stopped"}</Chat.Header>
        <Chat.Bubble streaming={generating}>{generating ? "Checking the build and smoke-test results" : "Generation stopped."}</Chat.Bubble>
        <Chat.Status><Chat.StatusItem>{generating ? "Generating" : "Stopped"}</Chat.StatusItem><Chat.StatusItem><Chat.StatusValue>42</Chat.StatusValue> token/s</Chat.StatusItem><Chat.StatusItem><Chat.StatusValue>256</Chat.StatusValue> tokens</Chat.StatusItem></Chat.Status>
        {generating && <Chat.Actions hover><Action label="Stop generating the deployment summary" onClick={() => { setGenerating(false); setFeedback("Generation stopped."); }}><rect x="5" y="5" width="14" height="14" rx="2" /></Action></Chat.Actions>}
      </Chat>
      <Chat>
        <ChatAvatar name="AI" color="avatar-primary" /><Chat.Header>Assistant · Completed</Chat.Header>
        <Chat.Bubble>{answer}</Chat.Bubble>
        <Chat.Status><Chat.StatusItem>Completed</Chat.StatusItem><Chat.StatusItem><Chat.StatusValue>42</Chat.StatusValue> token/s</Chat.StatusItem><Chat.StatusItem><Chat.StatusValue>1,248</Chat.StatusValue> tokens</Chat.StatusItem></Chat.Status>
        <Chat.Actions hover>
          <Action label="Retry the deployment summary" onClick={() => { setRevision((current) => current + 1); setFeedback("Summary regenerated locally."); }}><path d="M3 11a9 9 0 1 1 2.6 7.4" /><path d="M3 4v7h7" /></Action>
          <Action label="Copy the deployment summary" onClick={() => { void copyAnswer(); }}><rect x="8" y="8" width="13" height="13" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></Action>
        </Chat.Actions>
      </Chat>
      <p role="status">{feedback}</p>
    </div>
  );
}

export function ToolStatusesPreview() {
  const tools = [["pending", "search_docs", "Pending"], ["running", "run_query", "Running..."], ["success", "get_profile", "Done"], ["error", "deploy_preview", "Failed"]] as const;
  return (
    <div className="chat-demo" style={{ width: "min(42rem, 100%)", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {tools.map(([status, name, label]) => <Chat.Tool key={status} status={status} open><Chat.ToolHeader><span>{name}</span><Chat.ToolStatus>{label}</Chat.ToolStatus></Chat.ToolHeader></Chat.Tool>)}
    </div>
  );
}

export function MarkdownChatPreview() {
  return (
    <div className="chat-demo" style={{ width: "min(42rem, 100%)" }}>
      <Chat><ChatAvatar name="AI" color="avatar-tertiary" /><Chat.Bubble><div className="markdown-body"><p><strong>Summary:</strong> the deployment is ready.</p><ul><li>Build completed</li><li>Smoke test passed</li></ul></div></Chat.Bubble></Chat>
    </div>
  );
}

export const chatShowcasePreviews = {
  "Basic Chat": BasicChatPreview,
  "Scroll-Driven Chat Indicators": ScrollDrivenChatPreview,
  "Bubble Colors": BubbleColorsPreview,
  "RTL Bubble Alignment": RtlBubblePreview,
  "Bubble Sizes": BubbleSizesPreview,
  "Reasoning, Tool Call, and Streaming": LlmChatPreview,
  "Typing and Streaming": LiveStatesPreview,
  "Token Metrics and Message Actions": MessageActionsPreview,
  "Tool Statuses": ToolStatusesPreview,
  "Markdown Body in a Bubble": MarkdownChatPreview,
} as const;
