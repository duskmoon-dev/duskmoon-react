import { describe, expect, spyOn, test } from "bun:test";
import { act, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { ChatComposer } from "./ChatComposer";
import type { ChatComposerProps } from "./Chat.types";

function deferred() {
  let resolve!: (accepted: boolean) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<boolean>((accept, refuse) => {
    resolve = accept;
    reject = refuse;
  });
  return { promise, resolve, reject };
}

const originalScope = {
  contextKey: "repo-a",
  conversationId: "conversation-a",
};
const otherConversation = {
  ...originalScope,
  conversationId: "conversation-b",
};
const otherContext = { ...originalScope, contextKey: "repo-b" };

function send() {
  return screen.getByRole("button", { name: "Send" }) as HTMLButtonElement;
}

function editor() {
  return screen.getByRole("textbox", {
    name: "Message",
  }) as HTMLTextAreaElement;
}

describe("Chat.Composer scope isolation", () => {
  for (const [name, destination] of [
    ["conversation", otherConversation],
    ["context with the same conversation", otherContext],
  ] as const) {
    test(`late acceptance cannot clear identical text or the same File in another ${name}`, async () => {
      const pending = deferred();
      const textChanges: string[] = [];
      const fileChanges: File[][] = [];
      const selected = new File(["image"], "same.png", { type: "image/png" });
      const props = {
        value: "Same draft",
        attachments: [selected],
        onValueChange: (value: string) => textChanges.push(value),
        onAttachmentsChange: (files: File[]) => fileChanges.push(files),
        onSubmit: () => pending.promise,
      };
      const { rerender } = render(
        <ChatComposer {...props} scope={originalScope} />,
      );
      fireEvent.click(send());
      rerender(<ChatComposer {...props} scope={destination} />);
      expect(send().disabled).toBe(false);
      await act(async () => pending.resolve(true));
      expect(editor().value).toBe("Same draft");
      expect(textChanges).toEqual([]);
      expect(fileChanges).toEqual([]);
      expect(screen.getByText("same.png")).toBeTruthy();
    });
  }

  test("switching away and back invalidates the original generation", async () => {
    const pending = deferred();
    const changes: string[] = [];
    const props = {
      value: "Same draft",
      onValueChange: (value: string) => changes.push(value),
      onSubmit: () => pending.promise,
    };
    const { rerender } = render(
      <ChatComposer {...props} scope={originalScope} />,
    );
    fireEvent.click(send());
    rerender(<ChatComposer {...props} scope={otherContext} />);
    rerender(<ChatComposer {...props} scope={originalScope} />);
    await act(async () => pending.resolve(true));
    expect(changes).toEqual([]);
    expect(send().disabled).toBe(false);
  });

  test("new scope can submit and an old finally cannot unlock the new attempt", async () => {
    const oldAttempt = deferred();
    const currentAttempt = deferred();
    let submissions = 0;
    const changes: string[] = [];
    const props = {
      value: "Same draft",
      onValueChange: (value: string) => changes.push(value),
      onSubmit: () =>
        ++submissions === 1 ? oldAttempt.promise : currentAttempt.promise,
    };
    const { rerender } = render(
      <ChatComposer {...props} scope={originalScope} />,
    );
    fireEvent.click(send());
    rerender(<ChatComposer {...props} scope={otherContext} />);
    fireEvent.click(send());
    expect(submissions).toBe(2);
    expect(send().disabled).toBe(true);
    await act(async () => oldAttempt.resolve(true));
    expect(send().disabled).toBe(true);
    fireEvent.keyDown(editor(), { key: "Enter", ctrlKey: true });
    expect(submissions).toBe(2);
    expect(changes).toEqual([]);
    await act(async () => currentAttempt.resolve(true));
    expect(changes).toEqual([""]);
    expect(send().disabled).toBe(false);
  });

  test("old promise rejection does not report an error in the current scope", async () => {
    const pending = deferred();
    const errors: unknown[] = [];
    const props = {
      value: "Draft",
      onValueChange: () => {},
      onSubmit: () => pending.promise,
      onSubmitError: (error: unknown) => errors.push(error),
    };
    const { rerender } = render(
      <ChatComposer {...props} scope={originalScope} />,
    );
    fireEvent.click(send());
    rerender(<ChatComposer {...props} scope={otherContext} />);
    await act(async () => pending.reject(new Error("Old scope failed")));
    expect(errors).toEqual([]);
    expect(screen.queryByRole("alert")).toBeNull();
    expect(send().disabled).toBe(false);
  });

  test("scope switches reset completion selection, dismissal and local errors", async () => {
    const props: Omit<ChatComposerProps, "scope"> = {
      value: "/",
      onValueChange: () => {},
      onSubmit: () => {
        throw new Error("Failed");
      },
      completion: {
        items: [
          { id: "first", label: "First" },
          { id: "second", label: "Second" },
        ],
        onSelect: () => {},
      },
    };
    const { rerender } = render(
      <ChatComposer {...props} scope={originalScope} />,
    );
    fireEvent.keyDown(editor(), { key: "ArrowDown" });
    expect(
      screen
        .getByRole("option", { name: "Second" })
        .getAttribute("aria-selected"),
    ).toBe("true");
    rerender(<ChatComposer {...props} scope={otherContext} />);
    expect(
      screen
        .getByRole("option", { name: "First" })
        .getAttribute("aria-selected"),
    ).toBe("true");
    fireEvent.keyDown(editor(), { key: "Escape" });
    fireEvent.click(send());
    await act(async () => {});
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(screen.getByRole("alert")).toBeTruthy();
    rerender(<ChatComposer {...props} scope={otherConversation} />);
    expect(screen.getByRole("listbox")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  test("equivalent scope objects preserve pending state, native editor and composition", async () => {
    const pending = deferred();
    let submissions = 0;
    const changes: string[] = [];
    const props = {
      value: "Draft",
      onValueChange: (value: string) => changes.push(value),
      onSubmit: () => {
        submissions++;
        return pending.promise;
      },
    };
    const { rerender } = render(
      <ChatComposer {...props} scope={originalScope} />,
    );
    const textarea = editor();
    textarea.focus();
    textarea.setSelectionRange(1, 3);
    fireEvent.compositionStart(textarea);
    rerender(<ChatComposer {...props} scope={{ ...originalScope }} />);
    expect(editor()).toBe(textarea);
    expect(document.activeElement).toBe(textarea);
    expect([textarea.selectionStart, textarea.selectionEnd]).toEqual([1, 3]);
    fireEvent.keyDown(textarea, { key: "Enter", ctrlKey: true });
    expect(submissions).toBe(0);
    fireEvent.compositionEnd(textarea);
    fireEvent.click(send());
    rerender(<ChatComposer {...props} scope={{ ...originalScope }} />);
    expect(send().disabled).toBe(true);
    await act(async () => pending.resolve(true));
    expect(changes).toEqual([""]);
  });

  test("removing an earlier attachment preserves the retained preview DOM owner", () => {
    const first = new File(["one"], "one.png", { type: "image/png" });
    const second = new File(["two"], "two.png", { type: "image/png" });
    const props = {
      value: "Draft",
      onValueChange: () => {},
      onSubmit: () => false,
    };
    const { rerender } = render(
      <ChatComposer {...props} attachments={[first, second]} />,
    );
    const retainedPreview = screen.getByAltText("two.png");
    rerender(<ChatComposer {...props} attachments={[second]} />);
    expect(screen.getByAltText("two.png")).toBe(retainedPreview);
  });
  test("controlled changes preserve the native editor and forward native events and root attributes", () => {
    const events: string[] = [];
    const props = {
      id: "consumer-composer",
      value: "First draft",
      onValueChange: () => {},
      onSubmit: () => false,
      textareaProps: {
        name: "prompt",
        "aria-describedby": "consumer-hint",
        onInput: () => events.push("input"),
        onPaste: () => events.push("paste"),
        onDrop: () => events.push("drop"),
        onFocus: () => events.push("focus"),
        onBlur: () => events.push("blur"),
        onCompositionStart: () => events.push("start"),
        onCompositionEnd: () => events.push("end"),
      },
    };
    const { rerender, container } = render(<ChatComposer {...props} />);
    const textarea = editor();
    fireEvent.focus(textarea);
    fireEvent.input(textarea);
    fireEvent.paste(textarea);
    fireEvent.drop(textarea);
    fireEvent.compositionStart(textarea);
    fireEvent.compositionEnd(textarea);
    fireEvent.blur(textarea);
    rerender(<ChatComposer {...props} value="Second draft" />);
    expect(editor() === textarea).toBe(true);
    expect(editor().value).toBe("Second draft");
    expect(editor().getAttribute("name")).toBe("prompt");
    expect(editor().getAttribute("aria-describedby")).toBe("consumer-hint");
    expect(container.firstElementChild?.id).toBe("consumer-composer");
    expect(events).toEqual([
      "focus",
      "input",
      "paste",
      "drop",
      "start",
      "end",
      "blur",
    ]);
  });

  test("native autosizing keeps row bounds and resize remeasurement", () => {
    const props = {
      value: "Draft",
      onValueChange: () => {},
      onSubmit: () => false,
      minRows: 2,
      maxRows: 3,
      textareaProps: {
        style: {
          lineHeight: "20px",
          padding: "4px",
          boxSizing: "content-box" as const,
        },
      },
    };
    const { rerender } = render(<ChatComposer {...props} />);
    const textarea = editor();
    expect(textarea.style.height).toBe("40px");
    Object.defineProperty(textarea, "scrollHeight", {
      configurable: true,
      value: 128,
    });
    fireEvent(window, new Event("resize"));
    expect(textarea.style.height).toBe("60px");
    expect(textarea.style.overflowY).toBe("auto");
    rerender(<ChatComposer {...props} maxRows={8} />);
    expect(editor() === textarea).toBe(true);
    expect(textarea.style.height).toBe("120px");
    expect(textarea.style.overflowY).toBe("hidden");
  });

  test("preview URLs follow occurrences, with cleanup only on removal, scope change and disposal", () => {
    const create = spyOn(URL, "createObjectURL").mockImplementation(
      () => `blob:preview-${create.mock.calls.length}`,
    );
    const revoke = spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    try {
      const first = new File(["one"], "one.png", { type: "image/png" });
      const second = new File(["two"], "two.png", { type: "image/png" });
      const props = {
        value: "Draft",
        onValueChange: () => {},
        onSubmit: () => false,
      };
      const { rerender, unmount } = render(
        <ChatComposer
          {...props}
          scope={originalScope}
          attachments={[first, second]}
        />,
      );
      const secondUrl = screen.getByAltText("two.png").getAttribute("src");
      expect(create).toHaveBeenCalledTimes(2);
      rerender(
        <ChatComposer
          {...props}
          scope={originalScope}
          attachments={[second]}
        />,
      );
      expect(create).toHaveBeenCalledTimes(2);
      expect(revoke).toHaveBeenCalledTimes(1);
      expect(screen.getByAltText("two.png").getAttribute("src")).toBe(
        secondUrl,
      );
      rerender(
        <ChatComposer {...props} scope={otherContext} attachments={[second]} />,
      );
      expect(create).toHaveBeenCalledTimes(3);
      expect(revoke).toHaveBeenCalledTimes(2);
      unmount();
      expect(revoke).toHaveBeenCalledTimes(3);
    } finally {
      create.mockRestore();
      revoke.mockRestore();
    }
  });
});
