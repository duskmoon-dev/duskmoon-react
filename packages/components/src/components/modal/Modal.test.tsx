import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import React, { createRef } from "react";
import { Modal } from "./Modal";

describe("Modal", () => {
  test("renders open modal with title and children", () => {
    render(
      <Modal open title="Test modal">
        Modal content
      </Modal>,
    );

    expect(screen.getByText("Test modal")).toBeTruthy();
    expect(screen.getByText("Modal content")).toBeTruthy();
    expect(screen.getByRole("dialog").className).toContain("modal");
    expect(document.querySelector(".modal-backdrop")?.className).toContain(
      "modal-open",
    );
  });

  test("supports uncontrolled defaultOpen and close button", () => {
    let cancelCount = 0;
    render(
      <Modal defaultOpen title="Closable" onCancel={() => cancelCount++}>
        Content
      </Modal>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(cancelCount).toBe(1);
    expect(document.querySelector(".modal-backdrop")?.className).not.toContain(
      "modal-open",
    );
  });

  test("calls ok and cancel callbacks from default footer", () => {
    let okCount = 0;
    let cancelCount = 0;
    render(
      <Modal
        open
        okText="Save"
        cancelText="Dismiss"
        onOk={() => okCount++}
        onCancel={() => cancelCount++}
      >
        Content
      </Modal>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));

    expect(okCount).toBe(1);
    expect(cancelCount).toBe(1);
  });

  test("supports content, custom footer, width, centered, and custom classes", () => {
    render(
      <Modal
        open
        content="Content prop"
        footer={<button>Custom action</button>}
        width={420}
        centered
        className="custom-modal"
        maskClassName="custom-mask"
      />,
    );

    const dialog = screen.getByRole("dialog");
    const backdrop = document.querySelector(".modal-backdrop");
    expect(screen.getByText("Content prop")).toBeTruthy();
    expect(screen.getByText("Custom action")).toBeTruthy();
    expect(dialog.style.width).toBe("420px");
    expect(dialog.className).toContain("custom-modal");
    expect(backdrop?.className).toContain("modal-backdrop-center");
    expect(backdrop?.className).toContain("custom-mask");
  });

  test("honors maskClosable and closable flags", () => {
    let cancelCount = 0;
    render(
      <Modal
        open
        closable={false}
        maskClosable={false}
        onCancel={() => cancelCount++}
      >
        Content
      </Modal>,
    );

    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
    fireEvent.click(document.querySelector(".modal-backdrop") as Element);
    expect(cancelCount).toBe(0);
  });

  test("supports destroyOnClose and afterOpenChange", () => {
    const changes: boolean[] = [];
    const { rerender } = render(
      <Modal
        open
        destroyOnClose
        afterOpenChange={(nextOpen) => changes.push(nextOpen)}
      >
        Content
      </Modal>,
    );

    rerender(
      <Modal
        open={false}
        destroyOnClose
        afterOpenChange={(nextOpen) => changes.push(nextOpen)}
      >
        Content
      </Modal>,
    );

    expect(screen.queryByText("Content")).toBeNull();
    expect(changes).toEqual([false]);
  });

  test("applies confirmLoading to ok button", () => {
    render(
      <Modal open confirmLoading okText="Confirm">
        Content
      </Modal>,
    );

    const okButton = screen.getByRole("button", { name: "Confirm" });
    expect(okButton.getAttribute("aria-busy")).toBe("true");
    expect(okButton).toHaveProperty("disabled", true);
  });

  test("forwards dialog ref and native props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Modal ref={ref} open data-testid="modal">
        Content
      </Modal>,
    );

    expect(ref.current).toBe(screen.getByTestId("modal") as HTMLDivElement);
  });

  test("provides static service placeholders", () => {
    const handle = Modal.confirm({ title: "Confirm" });

    expect(typeof handle.destroy).toBe("function");
    expect(typeof handle.update).toBe("function");
    handle.update({ title: "Updated" });
    Modal.destroyAll();
  });
});
