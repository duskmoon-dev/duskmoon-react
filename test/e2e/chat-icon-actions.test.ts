import { expect, test, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const base = process.env.DOCS_TEST_URL ?? "http://127.0.0.1:4334";
function demo(page: Page, name: "composer" | "queue" | "compact") {
  return page.locator(`astro-island:not([ssr]) [data-chat-${name}-demo]`);
}
async function expectIcon(button: Locator, title: string) {
  await expect(button).toHaveText("");
  await expect(button).toHaveAttribute("title", title);
  await expect(button.locator("svg")).toHaveAttribute("aria-hidden", "true");
  await expect(button.locator("svg")).toHaveAttribute("focusable", "false");
}

test("default composer icon actions keep native file intake, sending and independent Stop", async ({
  page,
}) => {
  await page.goto(`${base}/components/chat/`);
  const root = demo(page, "composer");
  const attach = root.getByRole("button", {
    name: "Attach files",
    exact: true,
  });
  const send = root.getByRole("button", { name: "Send", exact: true });
  await expectIcon(attach, "Attach files");
  await expectIcon(send, "Send");
  await expect(send).toBeDisabled();
  const chooser = page.waitForEvent("filechooser");
  await attach.click();
  await (
    await chooser
  ).setFiles({
    name: "icon-action.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("An attachment selected with the icon button"),
  });
  await expectIcon(
    root.getByRole("button", { name: "Remove icon-action.txt" }),
    "Remove icon-action.txt",
  );
  await expect(send).toBeEnabled();
  const editor = root.getByRole("textbox", { name: "Message", exact: true });
  await editor.fill("Sent with an icon action");
  await send.click();
  await expect(root.locator(".chat-bubble")).toHaveText(
    "Sent with an icon action · Attached: icon-action.txt",
  );
  await expect(editor).toHaveValue("");
  const stop = root.getByRole("button", { name: "Stop", exact: true });
  await expectIcon(stop, "Stop");
  await editor.fill("Follow-up stays editable");
  await expect(send).toBeEnabled();
  await stop.click();
  await expect(stop).toHaveCount(0);
  await expect(editor).toHaveValue("Follow-up stays editable");
});

test("queue icon actions retain shortcuts, rejected admission, FIFO and host-owned outcomes", async ({
  page,
}) => {
  await page.goto(`${base}/components/chat/`);
  const root = demo(page, "queue");
  const editor = root.getByRole("textbox", { name: "Queue demo message" });
  const list = root.getByRole("list", { name: "Waiting messages" });
  const status = root.getByRole("status");
  const queue = root.getByRole("button", {
    name: "Queue message",
    exact: true,
  });
  const steer = root.getByRole("button", { name: "Steer current message" });
  await expectIcon(queue, "Queue message (Enter)");
  await expectIcon(steer, "Steer current message (Ctrl/⌘+Enter)");
  await expect(queue).toHaveAttribute("aria-keyshortcuts", "Enter");
  await expect(steer).toHaveAttribute(
    "aria-keyshortcuts",
    "Control+Enter Meta+Enter",
  );
  await expect(queue).toBeDisabled();
  await expect(steer).toBeDisabled();
  for (const label of [
    "Steer waiting message 1",
    "Remove waiting message 1",
    "Complete response",
    "Reject next admission",
    "Start fresh",
  ]) {
    await expectIcon(
      root.getByRole("button", { name: label, exact: true }),
      label,
    );
  }
  await editor.fill("Preserve the queued draft");
  await editor.press("Shift+Enter");
  await editor.pressSequentially("Second line");
  await editor.press("Enter");
  await expect(editor).toHaveValue("");
  await expect(list.getByRole("listitem")).toHaveCount(3);
  await expect(root).toHaveAttribute("data-reply-count", "1");
  await expect(status).toContainText("Message queued. 3 messages waiting.");
  const reject = root.getByRole("button", { name: "Reject next admission" });
  await reject.click();
  await expect(reject).toHaveAttribute("aria-pressed", "true");
  await root.getByRole("button", { name: "Steer waiting message 1" }).click();
  await expect(status).toContainText("Admission rejected");
  await expect(list.getByRole("listitem")).toHaveCount(3);
  await expect(reject).toHaveAttribute("aria-pressed", "false");
  await root.getByRole("button", { name: "Steer waiting message 1" }).click();
  await expect(root.locator(".chat-bubble-content")).toHaveText(
    "Also include the accessibility checks.",
  );
  await expect(editor).toBeFocused();
  await root.getByRole("button", { name: "Complete response" }).click();
  await expect(root.locator(".chat-bubble-content")).toHaveText([
    "Also include the accessibility checks.",
    "Check narrow screens too.",
  ]);
  await expect(root).toHaveAttribute("data-reply-count", "2");
  await root.getByRole("button", { name: "Remove waiting message 1" }).click();
  await expect(list).toHaveCount(0);
  await expect(status).toContainText(
    "Waiting message removed. 0 messages waiting.",
  );
  await root.getByRole("button", { name: "Start fresh" }).click();
  const send = root.getByRole("button", { name: "Send message", exact: true });
  await expectIcon(send, "Send message (Enter)");
  await expect(root.locator(".chat-bubble")).toHaveCount(0);
  await expect(steer).toBeDisabled();
  await editor.fill("Start a reply");
  await send.click();
  await expect(status).toHaveText("Message sent. Reply started.");
  await editor.fill("Steer using the shortcut");
  await editor.press("Control+Enter");
  await expect(status).toContainText("Draft steered into the current reply.");
  await expect(root).toHaveAttribute("data-reply-count", "1");
  await expect(root.locator(".chat-bubble-content")).toHaveText([
    "Start a reply",
    "Steer using the shortcut",
  ]);
});

test("shared composer padding is halved and icon controls stay centered within narrow LTR/RTL layouts", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.goto(`${base}/components/chat/`);
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const direction of ["ltr", "rtl"])
      for (const theme of ["sunshine", "moonlight"]) {
        await page.evaluate(
          ({ direction, theme }) => {
            document.documentElement.dir = direction;
            document.documentElement.dataset.theme = theme;
          },
          { direction, theme },
        );
        for (const name of ["compact", "composer", "queue"] as const) {
          const root = demo(page, name);
          await root.scrollIntoViewIfNeeded();
          await root.evaluate(async (element) => {
            await Promise.all(
              element
                .getAnimations({ subtree: true })
                .filter((animation) => animation instanceof CSSTransition)
                .map((animation) => animation.finished.catch(() => undefined)),
            );
          });
          const composer = root.locator(".chat-composer");
          const padding = await composer.evaluate((element) => {
            const style = getComputedStyle(element);
            return [
              style.paddingTop,
              style.paddingRight,
              style.paddingBottom,
              style.paddingLeft,
            ];
          });
          expect(padding).toEqual(["8px", "8px", "8px", "8px"]);
          const bounds = (await composer.boundingBox())!;
          expect(bounds.x).toBeGreaterThanOrEqual(0);
          expect(bounds.x + bounds.width).toBeLessThanOrEqual(width + 1);
          const icons = await root
            .locator("button.btn-circle, button.btn-square")
            .evaluateAll((buttons) =>
              buttons
                .filter((button) => button.checkVisibility())
                .map((button) => {
                  const b = button.getBoundingClientRect();
                  const svg = button
                    .querySelector("svg")!
                    .getBoundingClientRect();
                  return {
                    width: b.width,
                    height: b.height,
                    iconWidth: svg.width,
                    iconHeight: svg.height,
                    x: svg.x + svg.width / 2 - b.x - b.width / 2,
                    y: svg.y + svg.height / 2 - b.y - b.height / 2,
                  };
                }),
            );
          expect(icons.length).toBeGreaterThan(0);
          for (const icon of icons) {
            expect(icon.width).toBe(icon.height);
            expect(icon.width).toBeLessThanOrEqual(32);
            expect(icon.iconWidth).toBe(icon.iconHeight);
            expect([16, 18]).toContain(icon.iconWidth);
            expect(Math.abs(icon.x)).toBeLessThan(0.1);
            expect(Math.abs(icon.y)).toBeLessThan(0.1);
          }
          if (width === 320) {
            expect(
              (
                await new AxeBuilder({ page })
                  .include(`[data-chat-${name}-demo]`)
                  .analyze()
              ).violations,
            ).toEqual([]);
          }
        }
      }
  }
});
