import { expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import React, { useState } from "react";
import { ChatComposer } from "./ChatComposer";
import type { ChatComposerProps } from "./Chat.types";
import type { ComposerAttachmentRejection } from "./ComposerAttachment.types";

function Fixture(props: Partial<ChatComposerProps>) {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <ChatComposer
      value="Text stays editable"
      onValueChange={() => {}}
      onSubmit={() => false}
      {...props}
      attachments={files}
      onAttachmentsChange={setFiles}
    />
  );
}

for (const source of ["picker", "paste", "drop"] as const) {
  test(`${source} applies the same file policy and reports partial failures`, () => {
    const rejected: ComposerAttachmentRejection[] = [];
    const { container } = render(
      <Fixture
        attachmentPolicy={{ accept: ".txt", maxFiles: 1, maxFileBytes: 8 }}
        onAttachmentRejected={(items) => rejected.push(...items)}
      />,
    );
    const good = new File(["ok"], "allowed.txt", { type: "text/plain" });
    const wrongType = new File(["ok"], "image.png", { type: "image/png" });
    const oversized = new File(["too much content"], "large.txt", {
      type: "text/plain",
    });
    const overCount = new File(["ok"], "second.txt", { type: "text/plain" });
    const files = [good, wrongType, oversized, overCount];
    const editor = screen.getByLabelText("Message");
    if (source === "picker")
      fireEvent.change(container.querySelector("input[type=file]")!, {
        target: { files },
      });
    else if (source === "paste")
      expect(
        fireEvent.paste(editor, {
          clipboardData: { files, getData: () => "Mixed pasted text" },
        }),
      ).toBe(true);
    else fireEvent.drop(editor, { dataTransfer: { files, types: ["Files"] } });
    expect(
      screen.getByRole("button", { name: "Remove allowed.txt" }),
    ).toBeTruthy();
    expect(rejected.map((item) => [item.source, item.error.code])).toEqual([
      [source, "unsupported_type"],
      [source, "file_too_large"],
      [source, "too_many_files"],
    ]);
    expect(screen.getByRole("alert").textContent).toContain("image.png");
    expect((editor as HTMLTextAreaElement).value).toBe("Text stays editable");
    expect((editor as HTMLTextAreaElement).disabled).toBe(false);
  });
}

test("consumer cancellation and disabled state prevent paste/drop intake", () => {
  const file = new File(["ok"], "ignored.txt", { type: "text/plain" });
  const { rerender } = render(
    <Fixture
      onPaste={(event) => event.preventDefault()}
      onDrop={(event) => event.preventDefault()}
    />,
  );
  fireEvent.paste(screen.getByLabelText("Message"), {
    clipboardData: { files: [file] },
  });
  fireEvent.drop(screen.getByLabelText("Message"), {
    dataTransfer: { files: [file] },
  });
  expect(
    screen.queryByRole("button", { name: "Remove ignored.txt" }),
  ).toBeNull();
  rerender(<Fixture disabled />);
  fireEvent.paste(screen.getByLabelText("Message"), {
    clipboardData: { files: [file] },
  });
  expect(
    screen.queryByRole("button", { name: "Remove ignored.txt" }),
  ).toBeNull();
});
