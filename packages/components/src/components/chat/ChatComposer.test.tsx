import { describe, expect, test } from "bun:test";
import { act, fireEvent, render, screen } from "@testing-library/react";
import React, { createRef, useState } from "react";
import { Chat, ChatComposer } from "./index";
import type { ChatComposerProps, ChatComposerSubmission } from "./Chat.types";

type HarnessProps = Omit<
  ChatComposerProps,
  "value" | "onValueChange" | "attachments" | "onAttachmentsChange"
> & {
  initialValue?: string;
  initialFiles?: File[];
};

function Harness({
  initialValue = "Draft message",
  initialFiles = [],
  ...props
}: HarnessProps) {
  const [value, setValue] = useState(initialValue);
  const [files, setFiles] = useState(initialFiles);
  return (
    <ChatComposer
      {...props}
      value={value}
      onValueChange={setValue}
      attachments={files}
      onAttachmentsChange={setFiles}
    />
  );
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((accept, refuse) => {
    resolve = accept;
    reject = refuse;
  });
  return { promise, resolve, reject };
}

function editor() {
  return screen.getByLabelText("Message") as HTMLTextAreaElement;
}

function file(name: string) {
  return new File([name], name, { type: "text/plain" });
}

function selectFiles(container: HTMLElement, files: File[]) {
  const input = container.querySelector("input[type=file]");
  expect(input).toBeTruthy();
  fireEvent.change(input!, { target: { files } });
}

describe("Chat.Composer", () => {
  test("exports the composer, forwards its ref, and composes extra actions", async () => {
    const ref = createRef<HTMLDivElement>();
    const submitted: ChatComposerSubmission[] = [];
    expect(Chat.Composer).toBe(ChatComposer);
    render(
      <Chat.Composer
        ref={ref}
        className="custom-composer"
        value="Public API"
        onValueChange={() => {}}
        onSubmit={(snapshot) => {
          submitted.push(snapshot);
          return false;
        }}
        textareaProps={{
          "aria-label": "Prompt",
          placeholder: "Ask a question",
        }}
      >
        {({ submit, canSubmit }) => (
          <button type="button" disabled={!canSubmit} onClick={submit}>
            Queue follow-up
          </button>
        )}
      </Chat.Composer>,
    );
    expect(ref.current?.className).toContain("custom-composer");
    expect(screen.getByLabelText("Prompt").getAttribute("placeholder")).toBe(
      "Ask a question",
    );
    fireEvent.click(screen.getByRole("button", { name: "Queue follow-up" }));
    expect(submitted).toEqual([{ value: "Public API", files: [] }]);
    await act(async () => {});
  });

  test("submits multiline text with Ctrl or Cmd+Enter and clears accepted text", async () => {
    const submissions: ChatComposerSubmission[] = [];
    render(
      <Harness
        initialValue={"Line one\nLine two"}
        onSubmit={(snapshot) => {
          submissions.push(snapshot);
        }}
      />,
    );
    fireEvent.keyDown(editor(), { key: "Enter" });
    expect(submissions).toHaveLength(0);
    fireEvent.keyDown(editor(), { key: "Enter", ctrlKey: true });
    await act(async () => {});
    expect(submissions).toEqual([{ value: "Line one\nLine two", files: [] }]);
    expect(editor().value).toBe("");
    fireEvent.change(editor(), { target: { value: "Mac shortcut" } });
    fireEvent.keyDown(editor(), { key: "Enter", metaKey: true });
    await act(async () => {});
    expect(submissions.at(-1)?.value).toBe("Mac shortcut");
  });

  test("does not submit during IME composition or the legacy 229 key event", async () => {
    const submissions: ChatComposerSubmission[] = [];
    render(
      <Harness
        onSubmit={(snapshot) => {
          submissions.push(snapshot);
          return false;
        }}
      />,
    );
    fireEvent.compositionStart(editor());
    fireEvent.keyDown(editor(), { key: "Enter", ctrlKey: true });
    fireEvent.compositionEnd(editor());
    fireEvent.keyDown(editor(), { key: "Enter", ctrlKey: true, keyCode: 229 });
    expect(submissions).toHaveLength(0);
    fireEvent.keyDown(editor(), { key: "Enter", ctrlKey: true });
    expect(submissions).toHaveLength(1);
    await act(async () => {});
  });

  test("honors a consumer keyboard handler that prevents submission", () => {
    let submitted = false;
    render(
      <Harness
        textareaProps={{ onKeyDown: (event) => event.preventDefault() }}
        onSubmit={() => {
          submitted = true;
        }}
      />,
    );
    fireEvent.keyDown(editor(), { key: "Enter", ctrlKey: true });
    expect(submitted).toBe(false);
  });

  test("rejecting admission retains text and files", async () => {
    render(
      <Harness initialFiles={[file("keep.txt")]} onSubmit={() => false} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    await act(async () => {});
    expect(editor().value).toBe("Draft message");
    expect(screen.getByText("keep.txt")).toBeTruthy();
  });

  test("rejected promises retain content and report the error", async () => {
    const pending = deferred<boolean>();
    const errors: unknown[] = [];
    render(
      <Harness
        initialFiles={[file("keep.txt")]}
        onSubmit={() => pending.promise}
        onSubmitError={(error) => errors.push(error)}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    const failure = new Error("Admission unavailable");
    await act(async () => pending.reject(failure));
    expect(errors).toEqual([failure]);
    expect(editor().value).toBe("Draft message");
    expect(screen.getByText("keep.txt")).toBeTruthy();
    expect(
      (screen.getByRole("button", { name: "Send" }) as HTMLButtonElement)
        .disabled,
    ).toBe(false);
  });

  test("synchronous submission errors preserve the draft", async () => {
    const errors: unknown[] = [];
    const failure = new Error("Admission rejected");
    render(
      <Harness
        onSubmit={() => {
          throw failure;
        }}
        onSubmitError={(error) => errors.push(error)}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    await act(async () => {});
    expect(errors).toEqual([failure]);
    expect(editor().value).toBe("Draft message");
  });

  test("pending edits and newly selected files survive acceptance", async () => {
    const pending = deferred<boolean>();
    const original = file("submitted.txt");
    const later = file("later.txt");
    const submissions: ChatComposerSubmission[] = [];
    const { container } = render(
      <Harness
        initialFiles={[original]}
        onSubmit={(snapshot) => {
          submissions.push(snapshot);
          return pending.promise;
        }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    fireEvent.keyDown(editor(), { key: "Enter", ctrlKey: true });
    expect(submissions).toHaveLength(1);
    expect(editor().disabled).toBe(false);
    fireEvent.change(editor(), { target: { value: "Next draft" } });
    selectFiles(container, [later]);
    expect(submissions[0]).toEqual({
      value: "Draft message",
      files: [original],
    });
    await act(async () => pending.resolve(true));
    expect(editor().value).toBe("Next draft");
    expect(screen.queryByText("submitted.txt")).toBeNull();
    expect(screen.getByText("later.txt")).toBeTruthy();
  });

  test("editing away and back to the submitted text still preserves that new draft", async () => {
    const pending = deferred<boolean>();
    render(<Harness onSubmit={() => pending.promise} />);
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    fireEvent.change(editor(), { target: { value: "Changed" } });
    fireEvent.change(editor(), { target: { value: "Draft message" } });
    await act(async () => pending.resolve(true));
    expect(editor().value).toBe("Draft message");
  });

  test("removing and re-adding the same File while pending preserves its new selection", async () => {
    const pending = deferred<boolean>();
    const original = file("reselected.txt");
    const { container } = render(
      <Harness initialFiles={[original]} onSubmit={() => pending.promise} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Remove reselected.txt" }),
    );
    selectFiles(container, [original]);
    await act(async () => pending.resolve(true));
    expect(screen.getByText("reselected.txt")).toBeTruthy();
  });

  test("external controlled draft replacement is preserved after pending admission", async () => {
    const pending = deferred<boolean>();
    const changes: string[] = [];
    const props = {
      onValueChange: (value: string) => changes.push(value),
      onSubmit: () => pending.promise,
    };
    const { rerender } = render(<ChatComposer {...props} value="Original" />);
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    rerender(<ChatComposer {...props} value="Restored session draft" />);
    await act(async () => pending.resolve(true));
    expect(editor().value).toBe("Restored session draft");
    expect(changes).toEqual([]);
  });

  test("unmounting suppresses pending clearing and restores the external draft on remount", async () => {
    const pending = deferred<boolean>();
    const changes: string[] = [];
    const props = {
      value: "Persisted outside composer",
      onValueChange: (value: string) => changes.push(value),
      onSubmit: () => pending.promise,
    };
    const mounted = render(<ChatComposer {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    mounted.unmount();
    render(<ChatComposer {...props} />);
    await act(async () => pending.resolve(true));
    expect(editor().value).toBe("Persisted outside composer");
    expect(changes).toEqual([]);
  });

  test("clearOnSubmit false gives the consumer control over successful drafts", async () => {
    render(
      <Harness
        initialFiles={[file("retained.txt")]}
        clearOnSubmit={false}
        onSubmit={() => true}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    await act(async () => {});
    expect(editor().value).toBe("Draft message");
    expect(screen.getByText("retained.txt")).toBeTruthy();
  });

  test("selects, removes, and submits files with text", async () => {
    const selected = file("prompt.txt");
    const removed = file("remove.txt");
    const submissions: ChatComposerSubmission[] = [];
    const { container } = render(
      <Harness
        onSubmit={(snapshot) => {
          submissions.push(snapshot);
        }}
      />,
    );
    selectFiles(container, [selected, removed]);
    fireEvent.click(screen.getByRole("button", { name: "Remove remove.txt" }));
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    await act(async () => {});
    expect(submissions).toEqual([
      { value: "Draft message", files: [selected] },
    ]);
    expect(screen.queryByText("prompt.txt")).toBeNull();
  });

  test("attachment-only submission requires application opt-in", async () => {
    const selected = file("only.txt");
    const submissions: ChatComposerSubmission[] = [];
    const onSubmit = (snapshot: ChatComposerSubmission) => {
      submissions.push(snapshot);
      return false;
    };
    const { rerender } = render(
      <Harness
        initialValue=" "
        initialFiles={[selected]}
        onSubmit={onSubmit}
      />,
    );
    expect(
      (screen.getByRole("button", { name: "Send" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    rerender(
      <Harness
        initialValue=" "
        initialFiles={[selected]}
        onSubmit={onSubmit}
        allowAttachmentOnly
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    await act(async () => {});
    expect(submissions).toEqual([{ value: " ", files: [selected] }]);
  });

  test("application errors associate with the editor and preserve controlled content", () => {
    render(<Harness error="This file is too large" onSubmit={() => false} />);
    const alert = screen.getByRole("alert");
    expect(editor().getAttribute("aria-invalid")).toBe("true");
    expect(editor().getAttribute("aria-describedby")?.split(" ")).toContain(
      alert.id,
    );
    expect(editor().value).toBe("Draft message");
  });

  test("streaming can admit follow-ups while Stop remains independent", async () => {
    let submissions = 0;
    let stops = 0;
    render(
      <Harness
        generating
        onStop={() => {
          stops += 1;
        }}
        onSubmit={() => {
          submissions += 1;
          return false;
        }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    fireEvent.click(screen.getByRole("button", { name: "Stop" }));
    expect(submissions).toBe(1);
    expect(stops).toBe(1);
    await act(async () => {});
  });

  test("canSubmit and busy gate admission without disabling draft editing", () => {
    const { rerender } = render(
      <Harness canSubmit={false} onSubmit={() => false} />,
    );
    expect(
      (screen.getByRole("button", { name: "Send" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    expect(editor().disabled).toBe(false);
    rerender(<Harness busy onSubmit={() => false} />);
    expect(
      (screen.getByRole("button", { name: "Send" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    expect(editor().disabled).toBe(false);
    rerender(<Harness disabled onSubmit={() => false} />);
    expect(editor().disabled).toBe(true);
    expect(
      (
        screen.getByRole("button", {
          name: "Attach files",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
  });

  test("replacement completion candidates keep text and pass caret context to the app", () => {
    const selections: string[] = [];
    const contexts: unknown[] = [];
    const onSelect: NonNullable<ChatComposerProps["completion"]>["onSelect"] = (
      item,
      context,
    ) => {
      selections.push(item.id);
      contexts.push(context);
    };
    const { rerender } = render(
      <Harness
        initialValue="/"
        onSubmit={() => {
          throw new Error("Unexpected submission");
        }}
        completion={{ items: [{ id: "local", label: "/local" }], onSelect }}
      />,
    );
    fireEvent.focus(editor());
    rerender(
      <Harness
        initialValue="/"
        onSubmit={() => {
          throw new Error("Unexpected submission");
        }}
        completion={{ items: [{ id: "remote", label: "/remote" }], onSelect }}
      />,
    );
    editor().setSelectionRange(1, 1);
    fireEvent.keyDown(editor(), { key: "Enter" });
    expect(selections).toEqual(["remote"]);
    expect(contexts).toEqual([
      { value: "/", selectionStart: 1, selectionEnd: 1 },
    ]);
    expect(editor().value).toBe("/");
  });

  test("keyboard completion skips disabled options and supports Tab and Escape", () => {
    const selections: string[] = [];
    render(
      <Harness
        initialValue="/"
        onSubmit={() => false}
        completion={{
          items: [
            { id: "first", label: "/first" },
            { id: "disabled", label: "/disabled", disabled: true },
            { id: "last", label: "/last" },
          ],
          onSelect: (item) => selections.push(item.id),
        }}
      />,
    );
    fireEvent.focus(editor());
    fireEvent.keyDown(editor(), { key: "ArrowDown" });
    fireEvent.keyDown(editor(), { key: "Tab" });
    expect(selections).toHaveLength(1);
    expect(selections[0]).not.toBe("disabled");
    fireEvent.change(editor(), { target: { value: "/again" } });
    fireEvent.keyDown(editor(), { key: "Escape" });
    expect(editor().getAttribute("aria-controls")).toBeNull();
    expect(editor().getAttribute("aria-activedescendant")).toBeNull();
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  test("completion leaves modified newline and submit shortcuts available", async () => {
    let selections = 0;
    const submissions: ChatComposerSubmission[] = [];
    render(
      <Harness
        initialValue="/review"
        completion={{
          items: [{ id: "review", label: "/review" }],
          onSelect: () => {
            selections += 1;
          },
        }}
        onSubmit={(snapshot) => {
          submissions.push(snapshot);
          return false;
        }}
      />,
    );
    fireEvent.keyDown(editor(), { key: "Enter", shiftKey: true });
    expect(selections).toBe(0);
    expect(submissions).toHaveLength(0);
    fireEvent.keyDown(editor(), { key: "Enter", ctrlKey: true });
    await act(async () => {});
    expect(selections).toBe(0);
    expect(submissions).toEqual([{ value: "/review", files: [] }]);
  });

  test("custom attachment rendering receives an accessible removal action", () => {
    const selected = file("custom.txt");
    render(
      <Harness
        initialFiles={[selected]}
        onSubmit={() => false}
        renderAttachment={(attachment, { remove, disabled }) => (
          <button type="button" onClick={remove} disabled={disabled}>
            Delete {attachment.name}
          </button>
        )}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Delete custom.txt" }));
    expect(
      screen.queryByRole("button", { name: "Delete custom.txt" }),
    ).toBeNull();
  });
});
