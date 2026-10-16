import { describe, expect, test } from "bun:test";
import { act, fireEvent, render, screen } from "@testing-library/react";
import React, { createRef } from "react";
import { Chat, ChatAgent, ChatContent, ChatQueue } from "./index";

describe("Chat 1.20.6 composition", () => {
  test("keeps an agent answer outside native activity disclosures", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Chat.Agent ref={ref} timeline={2}>
        <Chat.Work open>
          <Chat.WorkSummary>Worked · 1 tool call</Chat.WorkSummary>
          <Chat.WorkBody>Work record</Chat.WorkBody>
        </Chat.Work>
        <Chat.Content streaming>Final answer</Chat.Content>
      </Chat.Agent>,
    );
    expect(Chat.Agent).toBe(ChatAgent);
    expect(Chat.Content).toBe(ChatContent);
    expect(Chat.Queue).toBe(ChatQueue);
    expect(ref.current?.dataset.chatTl).toBe("2");
    expect(ref.current?.classList.contains("chat-agent")).toBe(true);
    expect(screen.getByText("Worked · 1 tool call").tagName).toBe("SUMMARY");
    const answer = screen.getByText("Final answer");
    expect(answer.closest("details")).toBeNull();
    expect(answer.classList.contains("chat-streaming")).toBe(true);
  });

  test("queue actions preserve application-owned identities and pending admission", () => {
    const calls: string[] = [];
    const items = [
      { id: "a", text: "First message" },
      { id: "b", text: "Second message" },
    ];
    const { rerender } = render(
      <Chat.Queue
        items={items}
        pendingIds={["b"]}
        onSteer={(id) => calls.push(`steer:${id}`)}
        onRemove={(id) => calls.push(`remove:${id}`)}
      />,
    );
    expect(
      screen.getByRole("region", { name: "Waiting messages" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("list", { name: "Waiting messages" }).tabIndex,
    ).toBe(0);
    expect(screen.getByText("First message").title).toBe("First message");
    fireEvent.click(
      screen.getByRole("button", { name: "Steer waiting message 1" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Remove waiting message 1" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Steer waiting message 2" }),
    );
    expect(calls).toEqual(["steer:a", "remove:a"]);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    rerender(
      <Chat.Queue items={[items[1]]} onSteer={() => {}} onRemove={() => {}} />,
    );
    expect(
      screen
        .getByText("Second message")
        .closest("li")
        ?.classList.contains("chat-queue-item-active"),
    ).toBe(true);
    rerender(<Chat.Queue items={[]} onSteer={() => {}} onRemove={() => {}} />);
    expect(screen.queryByRole("region")).toBeNull();
  });

  test("native composer preserves form submission, textarea editing and refs", () => {
    const formRef = createRef<HTMLFormElement>();
    const inputRef = createRef<HTMLTextAreaElement>();
    const submissions: string[] = [];
    render(
      <Chat.ComposerForm
        ref={formRef}
        aria-label="Message form"
        color="error"
        onSubmit={(event) => {
          event.preventDefault();
          submissions.push(
            new FormData(event.currentTarget).get("message") as string,
          );
        }}
      >
        <Chat.ComposerInput
          ref={inputRef}
          name="message"
          aria-label="Draft"
          defaultValue={"Two\nlines"}
        />
        <Chat.ComposerActions>
          <button type="submit">
            Send <Chat.ComposerHint>Enter</Chat.ComposerHint>
          </button>
        </Chat.ComposerActions>
      </Chat.ComposerForm>,
    );
    expect(formRef.current?.tagName).toBe("FORM");
    expect(inputRef.current?.tagName).toBe("TEXTAREA");
    fireEvent.submit(formRef.current!);
    expect(submissions).toEqual(["Two\nlines"]);
    expect(formRef.current?.classList.contains("chat-composer-error")).toBe(
      true,
    );
  });

  test("bubble measures wrapped lines, transfers disappearing-toggle focus and disconnects observers", () => {
    const OriginalResizeObserver = window.ResizeObserver;
    const callbacks: (() => void)[] = [];
    let disconnects = 0;
    window.ResizeObserver = class {
      constructor(callback: () => void) {
        callbacks.push(callback);
      }
      observe() {}
      unobserve() {}
      disconnect() {
        disconnects++;
      }
    } as unknown as typeof ResizeObserver;
    try {
      const expanded: boolean[] = [];
      const { container, unmount } = render(
        <Chat.Bubble
          collapsible
          onExpandedChange={(value) => expanded.push(value)}
        >
          Long message
        </Chat.Bubble>,
      );
      const content = container.querySelector<HTMLElement>(
        ".chat-bubble-content",
      )!;
      content.style.lineHeight = "20px";
      let height = 160;
      Object.defineProperty(content, "scrollHeight", {
        configurable: true,
        get: () => height,
      });
      act(() => callbacks.at(-1)!());
      const button = screen.getByRole("button", { name: "Show more" });
      expect(button.getAttribute("aria-controls")).toBe(content.id);
      fireEvent.click(button);
      expect(button.getAttribute("aria-expanded")).toBe("true");
      expect(button.textContent).toBe("Show less");
      button.focus();
      height = 120;
      act(() => callbacks.at(-1)!());
      expect(button.hidden).toBe(true);
      expect(button.getAttribute("aria-expanded")).toBe("false");
      expect(document.activeElement).toBe(content);
      expect(expanded).toEqual([true, false]);
      unmount();
      expect(disconnects).toBeGreaterThan(0);
    } finally {
      window.ResizeObserver = OriginalResizeObserver;
    }
  });

  test("controlled expansion requests collapse only once while the owner retains true", () => {
    const OriginalResizeObserver = window.ResizeObserver;
    let measure = () => {};
    window.ResizeObserver = class {
      constructor(callback: () => void) {
        measure = callback;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
    try {
      const calls: boolean[] = [];
      const { container, rerender } = render(
        <Chat.Bubble
          collapsible
          expanded
          onExpandedChange={(value) => calls.push(value)}
        >
          Short text
        </Chat.Bubble>,
      );
      const content = container.querySelector<HTMLElement>(
        ".chat-bubble-content",
      )!;
      content.style.lineHeight = "20px";
      Object.defineProperty(content, "scrollHeight", {
        configurable: true,
        value: 40,
      });
      act(() => {
        measure();
        measure();
      });
      rerender(
        <Chat.Bubble
          collapsible
          expanded
          onExpandedChange={(value) => calls.push(value)}
        >
          Short text
        </Chat.Bubble>,
      );
      act(() => measure());
      expect(calls).toEqual([false]);
    } finally {
      window.ResizeObserver = OriginalResizeObserver;
    }
  });
});
