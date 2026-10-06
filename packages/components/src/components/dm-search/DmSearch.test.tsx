import React, { createRef } from "react";
import { describe, expect, test } from "bun:test";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { DmSearch } from "./DmSearch";
import type { DmSearchRef } from "./DmSearch.types";

const items = [
  {
    key: "name",
    title: "Name",
    dataIndex: "name",
    search: { type: "input" as const, extraProps: {}, formProps: {} },
  },
  {
    key: "state",
    title: "State",
    dataIndex: "state",
    search: {
      type: "select" as const,
      extraProps: { options: [{ label: "Enabled", value: "enabled" }] },
      formProps: {},
    },
  },
];

describe("DmSearch", () => {
  test("submits values and toggles collapsed fields", () => {
    const searches: Array<Record<string, unknown>> = [];
    render(
      <DmSearch items={items} onSearch={(values) => searches.push(values)} />,
    );

    expect(screen.getByText("Name")).toBeTruthy();
    expect(screen.queryByText("State")).toBeNull();

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "demo" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(searches.at(-1)).toMatchObject({ name: "demo" });

    fireEvent.click(screen.getByRole("button", { name: "Expand" }));
    expect(screen.getByText("State")).toBeTruthy();
  });

  test("honors searchParams and imperative reset", () => {
    const ref = createRef<DmSearchRef>();
    render(
      <DmSearch ref={ref} items={items} searchParams={{ name: "from-url" }} />,
    );

    expect(screen.getByDisplayValue("from-url")).toBeTruthy();
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "changed" },
    });
    act(() => {
      ref.current?.onReset();
    });
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("");
  });

  test("controlled records remain authoritative through edits, rerenders, collapse, and submission", () => {
    const changes: Array<Record<string, unknown>> = [];
    const searches: Array<Record<string, unknown>> = [];
    const value = { name: "controlled", state: "enabled", count: 0 };
    const { rerender } = render(
      <DmSearch
        items={items}
        values={value}
        searchParams={{ name: "ignored" }}
        onValuesChange={(next) => changes.push(next)}
        onSearch={(next) => searches.push(next)}
      />,
    );
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "edit" } });
    expect(changes.at(-1)).toEqual({ ...value, name: "edit" });
    expect(input.value).toBe("controlled");
    rerender(
      <DmSearch
        items={[...items]}
        values={value}
        searchParams={{ name: "new-url" }}
        onSearch={(next) => searches.push(next)}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Expand" }));
    expect(input.value).toBe("controlled");
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(searches.at(-1)).toEqual(value);
  });

  test("custom fields own labels and preserve typed values through controlled reset", () => {
    const searches: unknown[] = [];
    const resets: unknown[] = [];
    const ref = createRef<DmSearchRef>();
    const customItems = [
      {
        key: "active",
        title: null,
        dataIndex: "active",
        search: {
          type: "custom" as const,
          formProps: { initialValue: false },
          render: (value: unknown, setValue: (value: unknown) => void) => (
            <label>
              Active
              <input
                type="checkbox"
                checked={value === true}
                onChange={(event) => setValue(event.currentTarget.checked)}
              />
            </label>
          ),
        },
      },
    ];
    function ControlledSearch() {
      const [values, setValues] = React.useState<Record<string, unknown>>({
        active: false,
      });
      return (
        <DmSearch
          ref={ref}
          items={customItems}
          values={values}
          onValuesChange={setValues}
          onReset={(next) => {
            resets.push(next);
            setValues(next);
          }}
          onSearch={(next) => searches.push(next)}
        />
      );
    }
    const { container } = render(<ControlledSearch />);
    expect(container.querySelector("label label")).toBeNull();
    fireEvent.click(screen.getByRole("checkbox", { name: "Active" }));
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(searches).toEqual([{ active: true }]);
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(resets).toEqual([{ active: false }]);
    expect(searches).toHaveLength(1);
    expect(
      (screen.getByRole("checkbox", { name: "Active" }) as HTMLInputElement)
        .checked,
    ).toBe(false);
    fireEvent.click(screen.getByRole("checkbox", { name: "Active" }));
    act(() => ref.current?.onReset());
    expect(resets).toHaveLength(2);
    expect(
      (screen.getByRole("checkbox", { name: "Active" }) as HTMLInputElement)
        .checked,
    ).toBe(false);
  });

  test("legacy reset still searches while controlled reset without handler emits next values", () => {
    const searches: unknown[] = [];
    const changes: unknown[] = [];
    render(
      <DmSearch
        items={items}
        values={{ name: "edit" }}
        onValuesChange={(next) => changes.push(next)}
        onSearch={(next) => searches.push(next)}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(changes).toEqual([{ name: undefined, state: undefined }]);
    expect(searches).toEqual(changes);
  });

  test("passes noValidate to the native form so custom validation owns submission", () => {
    const searches: unknown[] = [];
    const { container } = render(
      <DmSearch
        noValidate
        items={[
          {
            key: "name",
            dataIndex: "name",
            title: "Name",
            search: { type: "input", extraProps: { required: true } },
          },
        ]}
        onSearch={(values) => searches.push(values)}
      />,
    );
    const form = container.querySelector("form")!;
    expect(form.noValidate).toBe(true);
    fireEvent.submit(form);
    expect(searches).toEqual([{ name: undefined }]);
  });
});
