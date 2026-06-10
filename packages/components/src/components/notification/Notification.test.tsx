import React, { useEffect } from "react";
import { afterEach, describe, expect, test } from "bun:test";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { notification, useNotification } from "./Notification";

afterEach(() => {
  act(() => {
    notification.destroy();
    notification.config({
      duration: 4.5,
      placement: "topRight",
      maxCount: undefined,
      closeIcon: undefined,
    });
  });
});

describe("notification", () => {
  test("opens typed notifications with placement and description", async () => {
    await act(async () => {
      notification.config({ duration: 0, placement: "bottomLeft" });
      notification.success({
        message: "Saved",
        description: "The record is ready",
        className: "custom-notice",
      });
    });

    expect(await screen.findByText("Saved")).toBeTruthy();
    expect(screen.getByText("The record is ready")).toBeTruthy();
    expect(document.querySelector(".notification-bottom-left")).toBeTruthy();
    expect(screen.getByRole("alert").className).toContain("toast-success");
    expect(screen.getByRole("alert").className).toContain("custom-notice");
  });

  test("supports key updates, close, destroy, and onClose", async () => {
    let closeCount = 0;

    await act(async () => {
      notification.open({
        key: "job",
        message: "Queued",
        duration: 0,
        onClose: () => {
          closeCount += 1;
        },
      });
      notification.info({
        key: "job",
        message: "Running",
        duration: 0,
        onClose: () => {
          closeCount += 1;
        },
      });
    });

    expect(await screen.findByText("Running")).toBeTruthy();
    expect(screen.queryByText("Queued")).toBeNull();

    await act(async () => {
      notification.close("job");
    });

    await waitFor(() => {
      expect(screen.queryByText("Running")).toBeNull();
    });
    expect(closeCount).toBe(1);

    await act(async () => {
      notification.error({ key: "failed", message: "Failed", duration: 0 });
    });
    expect(await screen.findByText("Failed")).toBeTruthy();

    await act(async () => {
      notification.destroy();
    });

    await waitFor(() => {
      expect(screen.queryByText("Failed")).toBeNull();
    });
  });

  test("config applies maxCount and custom close icon", async () => {
    await act(async () => {
      notification.config({
        duration: 0,
        placement: "topRight",
        maxCount: 1,
        closeIcon: "dismiss",
      });
      notification.warning({ message: "First" });
      notification.error({ message: "Second" });
    });

    expect(await screen.findByText("Second")).toBeTruthy();
    expect(screen.queryByText("First")).toBeNull();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Close notification" }));
    });

    await waitFor(() => {
      expect(screen.queryByText("Second")).toBeNull();
    });
  });

  test("useNotification returns scoped api and context holder", async () => {
    function Demo() {
      const [api, contextHolder] = useNotification({
        duration: 0,
        placement: "top",
      });

      useEffect(() => {
        api.info({
          key: "scoped",
          message: "Scoped",
          description: "Rendered by holder",
          btn: <button type="button">Action</button>,
        });
      }, [api]);

      return <div>{contextHolder}</div>;
    }

    render(<Demo />);

    expect(await screen.findByText("Scoped")).toBeTruthy();
    expect(screen.getByText("Rendered by holder")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Action" })).toBeTruthy();
    expect(document.querySelector(".notification-top")).toBeTruthy();
  });
});
