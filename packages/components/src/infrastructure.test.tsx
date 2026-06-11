import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  getDmDatePickerLocale,
  getDmTheme,
  onDmThemeUpdate,
  setDmDatePickerLocale,
  setDmPrefixCls,
  setDmPrimaryColor,
  theme,
  unstableSetRender,
  usePersistedPageSize,
  version,
} from "./infrastructure";

function PageSizeProbe({ storageKey }: { storageKey?: string }) {
  const [pageSize, setPageSize] = usePersistedPageSize(storageKey, 20);

  return (
    <>
      <span>Page size {pageSize}</span>
      <button type="button" onClick={() => setPageSize(50)}>
        Set size
      </button>
    </>
  );
}

describe("infrastructure exports", () => {
  test("exposes version, theme token helpers, and render override", () => {
    unstableSetRender(() => undefined);

    expect(version).toBe("0.1.1");
    expect(theme.getDesignToken().colorPrimary).toBe("#0065ff");
    expect(theme.useToken().token.colorPrimary).toBe("#0065ff");
  });

  test("updates Dm theme state and notifies subscribers", () => {
    let calls = 0;
    const unsubscribe = onDmThemeUpdate(() => {
      calls += 1;
    });

    setDmPrimaryColor("#ff0000");
    setDmPrefixCls("custom");

    expect(calls).toBe(2);
    expect(getDmTheme().prefixCls).toBe("custom");
    expect(getDmTheme().token.colorPrimary).toBe("#ff0000");

    unsubscribe();
    setDmPrimaryColor("#0065ff");
    setDmPrefixCls("dm");
    expect(calls).toBe(2);
  });

  test("stores date picker locale", () => {
    setDmDatePickerLocale("zh");
    expect(getDmDatePickerLocale()).toBe("zh");

    setDmDatePickerLocale("en");
  });

  test("persists page size", () => {
    localStorage.clear();
    render(<PageSizeProbe storageKey="table" />);

    expect(screen.getByText("Page size 20")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Set size" }));

    expect(screen.getByText("Page size 50")).toBeTruthy();
    expect(localStorage.getItem("table_pageSize")).toBe("50");
  });
});
