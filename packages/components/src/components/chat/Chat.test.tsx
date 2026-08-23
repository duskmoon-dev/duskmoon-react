import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import React, { createRef } from "react";
import { Avatar } from "../avatar";
import {
  Chat,
  ChatAvatar,
  ChatBubble,
  ChatFooter,
  ChatHeader,
  ChatReasoning,
  ChatTool,
  ChatToolCall,
  ChatToolHeader,
  ChatToolResult,
  ChatToolStatus,
  ChatTyping,
} from "./Chat";

describe("Chat", () => {
  test("renders a start-aligned turn with structural slots", () => {
    const ref = createRef<HTMLDivElement>();

    render(
      <Chat ref={ref} data-testid="chat-turn">
        <Chat.Avatar>
          <Avatar fallback="AI" />
        </Chat.Avatar>
        <Chat.Header>Assistant · 2:15 PM</Chat.Header>
        <Chat.Bubble>How can I help?</Chat.Bubble>
        <Chat.Footer>Delivered</Chat.Footer>
      </Chat>,
    );

    const turn = screen.getByTestId("chat-turn");
    expect(ref.current).toBe(turn as HTMLDivElement);
    expect(turn.className).toContain("chat");
    expect(turn.className).toContain("chat-start");
    expect(turn.querySelector(".chat-avatar .avatar")).toBeTruthy();
    expect(screen.getByText("Assistant · 2:15 PM").className).toContain(
      "chat-header",
    );
    expect(screen.getByText("How can I help?").className).toContain(
      "chat-bubble",
    );
    expect(screen.getByText("Delivered").className).toContain("chat-footer");
  });

  test("supports end placement and bubble variants", () => {
    render(
      <Chat placement="end" className="custom-chat">
        <Chat.Bubble
          color="accent"
          size="lg"
          filled
          streaming
          className="custom-bubble"
        >
          Streaming reply
        </Chat.Bubble>
      </Chat>,
    );

    const bubble = screen.getByText("Streaming reply");
    expect(bubble.parentElement?.className).toContain("chat-end");
    expect(bubble.parentElement?.className).toContain("custom-chat");
    expect(bubble.className).toContain("chat-bubble-accent");
    expect(bubble.className).toContain("chat-bubble-lg");
    expect(bubble.className).toContain("chat-bubble-filled");
    expect(bubble.className).toContain("chat-bubble-streaming");
    expect(bubble.className).toContain("custom-bubble");
    expect(bubble.querySelector(".chat-streaming-caret")).toBeTruthy();
  });

  test("maps every bubble size and tool state", () => {
    const sizes = ["xs", "sm", "md", "lg"] as const;
    const states = ["pending", "running", "success", "error"] as const;

    render(
      <>
        {sizes.map((size) => (
          <Chat.Bubble key={size} size={size} data-testid={`bubble-${size}`} />
        ))}
        {states.map((status) => (
          <Chat.Tool
            key={status}
            status={status}
            data-testid={`tool-${status}`}
          >
            <Chat.ToolHeader>{status}</Chat.ToolHeader>
          </Chat.Tool>
        ))}
      </>,
    );

    for (const size of sizes) {
      expect(screen.getByTestId(`bubble-${size}`).className).toContain(
        `chat-bubble-${size}`,
      );
    }
    for (const status of states) {
      expect(screen.getByTestId(`tool-${status}`).className).toContain(
        `chat-tool-${status}`,
      );
    }
  });

  test("uses native details and summary elements for LLM blocks", () => {
    render(
      <Chat>
        <Chat.Reasoning open>
          <summary>Thinking (3s)</summary>
          <div>Checking the tool result.</div>
        </Chat.Reasoning>
        <Chat.Tool status="success" open>
          <Chat.ToolHeader>
            <span>get_weather</span>
            <Chat.ToolStatus>Done</Chat.ToolStatus>
          </Chat.ToolHeader>
          <Chat.ToolCall>{'{"city":"Tokyo"}'}</Chat.ToolCall>
          <Chat.ToolResult>18°C and cloudy</Chat.ToolResult>
        </Chat.Tool>
      </Chat>,
    );

    const reasoning = screen
      .getByText("Checking the tool result.")
      .closest("details");
    const tool = screen.getByText("get_weather").closest("details");

    expect(reasoning?.className).toContain("chat-reasoning");
    expect(reasoning?.querySelector("summary")?.textContent).toBe(
      "Thinking (3s)",
    );
    expect(tool?.className).toContain("chat-tool");
    expect(tool?.className).toContain("chat-tool-success");
    expect(
      screen.getByText("get_weather").closest("summary")?.className,
    ).toContain("chat-tool-header");
    expect(screen.getByText("Done").className).toContain("chat-tool-status");
    expect(screen.getByText('{"city":"Tokyo"}').className).toContain(
      "chat-tool-call",
    );
    expect(screen.getByText("18°C and cloudy").className).toContain(
      "chat-tool-result",
    );
  });

  test("renders an accessible typing indicator with the required inner dot", () => {
    const { container } = render(
      <Chat.Bubble>
        <Chat.Typing />
      </Chat.Bubble>,
    );

    const typing = screen.getByRole("status", {
      name: "Assistant is typing",
    });
    expect(typing.className).toContain("chat-typing");
    expect(
      container
        .querySelector(".chat-typing > span")
        ?.getAttribute("aria-hidden"),
    ).toBe("true");
  });

  test("exposes named primitives through the compound API", () => {
    expect(Chat.Avatar).toBe(ChatAvatar);
    expect(Chat.Header).toBe(ChatHeader);
    expect(Chat.Bubble).toBe(ChatBubble);
    expect(Chat.Footer).toBe(ChatFooter);
    expect(Chat.Reasoning).toBe(ChatReasoning);
    expect(Chat.Tool).toBe(ChatTool);
    expect(Chat.ToolHeader).toBe(ChatToolHeader);
    expect(Chat.ToolStatus).toBe(ChatToolStatus);
    expect(Chat.ToolCall).toBe(ChatToolCall);
    expect(Chat.ToolResult).toBe(ChatToolResult);
    expect(Chat.Typing).toBe(ChatTyping);
  });
});
