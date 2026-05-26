import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { Upload } from "./Upload";

function makeFile(name: string, type = "text/plain") {
  return new File(["content"], name, { type });
}

describe("Upload", () => {
  test("renders trigger, hidden input, and default file list", () => {
    render(
      <Upload
        accept=".txt"
        defaultFileList={[{ uid: "1", name: "readme.txt", percent: 40 }]}
      >
        <button type="button">Pick file</button>
      </Upload>,
    );

    const input = document.querySelector("input[type='file']") as HTMLInputElement;

    expect(screen.getByText("Pick file")).toBeTruthy();
    expect(input.hidden).toBe(true);
    expect(input.accept).toBe(".txt");
    expect(screen.getByText("readme.txt")).toBeTruthy();
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("40");
  });

  test("adds selected files and emits onChange", async () => {
    const changes: string[][] = [];

    render(
      <Upload
        multiple
        onChange={({ fileList }) => {
          changes.push(fileList.map((file) => file.name));
        }}
      >
        <button type="button">Upload</button>
      </Upload>,
    );

    const input = document.querySelector("input[type='file']") as HTMLInputElement;
    fireEvent.change(input, {
      target: { files: [makeFile("alpha.txt"), makeFile("beta.txt")] },
    });

    await screen.findByText("alpha.txt");
    expect(screen.getByText("beta.txt")).toBeTruthy();
    expect(changes.at(-1)).toEqual(["alpha.txt", "beta.txt"]);
  });

  test("supports beforeUpload false and LIST_IGNORE", async () => {
    render(
      <Upload
        beforeUpload={(file) =>
          file.name.endsWith(".tmp") ? Upload.LIST_IGNORE : false
        }
      />,
    );

    const input = document.querySelector("input[type='file']") as HTMLInputElement;
    fireEvent.change(input, {
      target: { files: [makeFile("keep.txt"), makeFile("skip.tmp")] },
    });

    await screen.findByText("keep.txt");
    expect(screen.queryByText("skip.tmp")).toBeNull();
    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  test("uses customRequest progress and success callbacks", async () => {
    render(
      <Upload
        customRequest={({ onProgress, onSuccess }) => {
          onProgress?.({ percent: 55 });
          onSuccess?.({ ok: true });
        }}
      />,
    );

    const input = document.querySelector("input[type='file']") as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile("photo.png", "image/png")] } });

    await screen.findByText("photo.png");
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("100");
  });

  test("calls preview and removes files", async () => {
    const previewed: string[] = [];
    const removed: string[] = [];

    render(
      <Upload
        defaultFileList={[{ uid: "1", name: "report.pdf" }]}
        onPreview={(file) => previewed.push(file.name)}
        onRemove={(file) => {
          removed.push(file.name);
        }}
      />,
    );

    fireEvent.click(screen.getByText("report.pdf"));
    fireEvent.click(screen.getByLabelText("Remove report.pdf"));

    expect(previewed).toEqual(["report.pdf"]);
    expect(removed).toEqual(["report.pdf"]);
    expect(screen.queryByText("report.pdf")).toBeNull();
  });

  test("renders dragger dropzone and accepts dropped files", async () => {
    render(
      <Upload.Dragger>
        <span>Drop files here</span>
      </Upload.Dragger>,
    );

    const dropzone = screen.getByRole("button", { name: "Drop files here" });
    fireEvent.drop(dropzone, {
      dataTransfer: { files: [makeFile("drop.txt")] },
    });

    await screen.findByText("drop.txt");
  });
});
