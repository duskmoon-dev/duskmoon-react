import { afterEach, describe, expect, test } from "bun:test";
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

const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;
afterEach(() => {
  URL.createObjectURL = originalCreateObjectURL;
  URL.revokeObjectURL = originalRevokeObjectURL;
});

function imagePreviews() {
  let nextId = 0;
  const revoked: string[] = [];
  URL.createObjectURL = () => `blob:composer-image-${++nextId}`;
  URL.revokeObjectURL = (url) => revoked.push(url);
  return revoked;
}

describe("Chat.Composer", () => {
  test("compact controls keep custom labels and native menu intake with a state-dependent primary action", async () => {
    const pending = deferred<boolean>();
    let submissions = 0;
    let stops = 0;
    const { container } = render(
      <Harness
        compact
        generating
        attachLabel="Choose files"
        sendLabel="Send follow-up"
        stopLabel="Stop current turn"
        onStop={() => stops++}
        onSubmit={() => {
          submissions++;
          return pending.promise;
        }}
      >
        {({ submit, submitting, canSubmit, generating }) => (
          <button type="button" disabled={!canSubmit} onClick={submit}>
            {submitting
              ? "Admitting"
              : generating
                ? "Queue follow-up"
                : "Queue"}
          </button>
        )}
      </Harness>,
    );
    const toolbar = container.querySelector<HTMLDivElement>(
      ".chat-composer-toolbar-compact",
    )!;
    const attach = screen.getByRole("button", { name: "Choose files" });
    const send = screen.getByRole("button", { name: "Send follow-up" });
    expect(
      screen.queryByRole("button", { name: "Stop current turn" }),
    ).toBeNull();
    expect(attach.parentElement).toBe(toolbar);
    expect(send.parentElement?.className).toBe("chat-composer-actions");
    expect(send.parentElement?.parentElement).toBe(toolbar);
    for (const button of [attach, send]) {
      expect(button.getAttribute("type")).toBe("button");
      expect(button.className).toContain("btn-circle");
      expect(button.textContent).toBe("");
      expect(button.querySelector("svg")?.getAttribute("aria-hidden")).toBe(
        "true",
      );
    }
    const picker = container.querySelector("input[type=file]")!;
    let pickerClicks = 0;
    picker.addEventListener("click", () => pickerClicks++);
    expect(attach.getAttribute("popovertarget")).toBe(
      picker.closest("[popover]")!.id,
    );
    fireEvent.click(screen.getByRole("button", { name: "Files" }));
    expect(pickerClicks).toBe(1);
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: "Queue follow-up" })),
    );
    expect(submissions).toBe(1);
    expect(screen.queryByRole("button", { name: "Send follow-up" })).toBeNull();
    expect(screen.getByRole("button", { name: "Admitting" })).toBeTruthy();
    expect(editor().disabled).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Stop current turn" }));
    expect(stops).toBe(1);
    await act(async () => pending.resolve(false));
    const nextSend = screen.getByRole("button", { name: "Send follow-up" });
    expect((nextSend as HTMLButtonElement).disabled).toBe(false);
    expect(nextSend.getAttribute("aria-busy")).toBeNull();
    await act(async () => fireEvent.click(nextSend));
    expect(submissions).toBe(2);
  });

  test("default icon controls preserve caller labels, independent Stop and image metadata rows", () => {
    imagePreviews();
    const selected = new File(["image"], "default.png", { type: "image/png" });
    const { container } = render(
      <Harness
        initialFiles={[selected]}
        onSubmit={() => false}
        generating
        onStop={() => {}}
        attachLabel="Upload files"
        sendLabel="Deliver draft"
        stopLabel="Stop answer"
      />,
    );
    expect(container.querySelector(".chat-composer-toolbar")).toBeNull();
    expect(container.querySelector(".chat-composer-thumbnails")).toBeNull();
    for (const label of [
      "Upload files",
      "Deliver draft",
      "Stop answer",
      "Remove default.png",
    ]) {
      const button = screen.getByRole("button", { name: label });
      expect(button.textContent).toBe("");
      expect(button.title).toBe(label);
      expect(button.querySelector("svg")?.getAttribute("aria-hidden")).toBe(
        "true",
      );
    }
    const attach = screen.getByRole("button", { name: "Upload files" });
    expect(attach.parentElement?.className).toBe("chat-composer-actions");
    expect(screen.getByText("default.png").getAttribute("title")).toBe(
      "default.png",
    );
    expect(screen.getByRole("img", { name: "default.png" }).className).toBe(
      "chat-composer-preview",
    );
  });

  test("compact ready images use named removable tiles and release their preview URLs", () => {
    const revoked = imagePreviews();
    const images = ["first.png", "second.png"].map(
      (name) => new File(["image"], name, { type: "image/png" }),
    );
    const { container, unmount } = render(
      <Harness compact initialFiles={images} onSubmit={() => false} />,
    );
    const strip = screen.getByRole("list", { name: "Attachments" });
    expect(strip.className).toContain("chat-composer-thumbnails");
    expect(strip.nextElementSibling).toBe(editor());
    expect(
      container.querySelectorAll(".chat-composer-attachment-tile"),
    ).toHaveLength(2);
    expect(
      container.querySelector(".chat-composer-attachment-info"),
    ).toBeNull();
    const firstImage = screen.getByRole("img", { name: "first.png" });
    const firstUrl = firstImage.getAttribute("src")!;
    expect(firstImage.className).toBe("chat-composer-preview");
    const remove = screen.getByRole("button", { name: "Remove first.png" });
    expect(remove.className).toContain("chat-composer-attachment-remove");
    expect(remove.getAttribute("title")).toBe("Remove first.png");
    fireEvent.click(remove);
    expect(screen.queryByRole("img", { name: "first.png" })).toBeNull();
    expect(revoked).toEqual([firstUrl]);
    fireEvent.click(screen.getByRole("button", { name: "Remove second.png" }));
    expect(screen.queryByRole("list", { name: "Attachments" })).toBeNull();
    expect(revoked).toHaveLength(2);
    unmount();
  });

  test("compact mixed files and custom image renderers retain complete metadata rows", () => {
    imagePreviews();
    const image = new File(["image"], "photo.png", { type: "image/png" });
    const { container, rerender } = render(
      <Harness
        compact
        initialFiles={[image, file("notes.txt")]}
        onSubmit={() => false}
      />,
    );
    expect(container.querySelector(".chat-composer-thumbnails")).toBeNull();
    expect(
      container.querySelectorAll(".chat-composer-attachment-info"),
    ).toHaveLength(2);
    expect(screen.getByText("photo.png")).toBeTruthy();
    expect(screen.getByText("notes.txt")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Remove notes.txt" }));
    expect(container.querySelector(".chat-composer-thumbnails")).toBeTruthy();
    rerender(
      <Harness
        compact
        onSubmit={() => false}
        renderAttachment={(attachment, { remove }) => (
          <button type="button" onClick={remove}>
            Custom {attachment.name}
          </button>
        )}
      />,
    );
    expect(container.querySelector(".chat-composer-thumbnails")).toBeNull();
    expect(
      container.querySelector(".chat-composer-attachment-tile"),
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Custom photo.png" }));
    expect(screen.queryByRole("list", { name: "Attachments" })).toBeNull();
  });

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

  test("the native editor retains counts and native props without standalone textarea styling", () => {
    render(
      <Chat.Composer
        value="Draft"
        onValueChange={() => {}}
        onSubmit={() => false}
        textareaProps={{
          "aria-label": "Counted draft",
          name: "message",
          maxLength: 40,
          showCount: true,
          status: "error",
          variant: "filled",
          className: "consumer-editor",
        }}
      />,
    );
    const input = screen.getByRole("textbox", { name: "Counted draft" });
    expect(input.className).toBe("chat-composer-editor consumer-editor");
    expect(input.getAttribute("name")).toBe("message");
    expect(input.getAttribute("maxlength")).toBe("40");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.hasAttribute("showCount")).toBe(false);
    expect(input.hasAttribute("variant")).toBe(false);
    expect(screen.getByText("5 / 40")).toBeTruthy();
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
