import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Input } from "../input";
import { Checkbox } from "../checkbox";
import { Form } from "./Form";

describe("Form", () => {
  test("binds item values and submits form values", async () => {
    const finishes: unknown[] = [];

    render(
      <Form
        initialValues={{ name: "Ada" }}
        onFinish={(values) => finishes.push(values)}
      >
        <Form.Item name="name" label="Name">
          <Input aria-label="Name input" />
        </Form.Item>
        <button type="submit">Submit</button>
      </Form>,
    );

    expect(
      (screen.getByLabelText("Name input") as HTMLInputElement).value,
    ).toBe("Ada");

    fireEvent.change(screen.getByLabelText("Name input"), {
      target: { value: "Grace" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(finishes.at(-1)).toEqual({ name: "Grace" }));
  });

  test("validates required fields and renders item errors", async () => {
    const failures: unknown[] = [];

    render(
      <Form onFinishFailed={(info) => failures.push(info.errorFields)}>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, message: "Email required" }]}
        >
          <Input aria-label="Email input" />
        </Form.Item>
        <button type="submit">Submit</button>
      </Form>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() =>
      expect(screen.getByText("Email required")).toBeTruthy(),
    );
    expect(failures).toHaveLength(1);
  });

  test("exposes useForm, useWatch, checked values, and reset", async () => {
    function Probe() {
      const [form] = Form.useForm<{ enabled: boolean }>();
      const enabled = Form.useWatch("enabled", form);

      return (
        <Form form={form} initialValues={{ enabled: true }}>
          <Form.Item name="enabled" valuePropName="checked">
            <Checkbox>Enabled</Checkbox>
          </Form.Item>
          <span>{String(enabled)}</span>
          <button type="button" onClick={() => form.resetFields()}>
            Reset
          </button>
        </Form>
      );
    }

    render(<Probe />);

    fireEvent.click(screen.getByRole("checkbox", { name: "Enabled" }));
    await waitFor(() => expect(screen.getByText("false")).toBeTruthy());

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    await waitFor(() => expect(screen.getByText("true")).toBeTruthy());
  });

  test("supports list operations and error list", async () => {
    render(
      <Form initialValues={{ users: ["Ada"] }}>
        <Form.List name="users">
          {(fields, operation) => (
            <>
              <span>Count {fields.length}</span>
              <button type="button" onClick={() => operation.add("Grace")}>
                Add
              </button>
            </>
          )}
        </Form.List>
        <Form.ErrorList errors={["List error"]} />
      </Form>,
    );

    expect(screen.getByText("Count 1")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    await waitFor(() => expect(screen.getByText("Count 2")).toBeTruthy());
    expect(screen.getByText("List error")).toBeTruthy();
  });
});
