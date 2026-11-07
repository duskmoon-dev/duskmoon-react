import { expect, test, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { closeMenus, openAdd } from "./chat-demo.helpers";

const base = process.env.DOCS_TEST_URL ?? "http://127.0.0.1:4334";
async function demo(page: Page, plain = false) {
  await page.goto(`${base}/components/chat/`);
  const root = page.locator("astro-island:not([ssr]) [data-chat-compact-demo]");
  const editor = root.getByRole("textbox", { name: "Compact demo message" });
  await expect(editor).toBeEditable();
  if (plain) {
    await openAdd(root);
    await root.getByLabel("Use rich editor").uncheck();
    await closeMenus(root);
  }
  await expect(
    root.getByRole("button", { name: "Send", exact: true }),
  ).toBeEnabled();
  return { root, editor };
}
async function query(editor: Locator, text: string) {
  await editor.scrollIntoViewIfNeeded();
  await editor.fill("");
  await editor.pressSequentially(text);
}

test("compact corner actions are equal and their icons stay centered", async ({
  page,
}) => {
  const { root, editor } = await demo(page);
  for (const state of ["ready", "running", "follow-up"]) {
    if (state === "running") {
      await editor.press("Control+Enter");
      await expect(root.getByLabel("Compact host state")).toContainText(
        "running",
      );
    }
    if (state === "follow-up") await editor.fill("A follow-up");
    const actions = root.locator(
      ".chat-composer-toolbar-compact > .btn-circle, .chat-composer-actions > .btn-circle",
    );
    await expect(actions).toHaveCount(2);
    for (const button of await actions.all()) {
      const { b, icon } = await button.evaluate((element) => ({
        b: element.getBoundingClientRect().toJSON(),
        icon: element.querySelector("svg")!.getBoundingClientRect().toJSON(),
      }));
      expect(b.width).toBe(28);
      expect(b.height).toBe(28);
      expect(icon.width).toBe(18);
      expect(icon.height).toBe(18);
      expect(
        Math.abs(icon.x + icon.width / 2 - b.x - b.width / 2),
      ).toBeLessThan(0.1);
      expect(
        Math.abs(icon.y + icon.height / 2 - b.y - b.height / 2),
      ).toBeLessThan(0.1);
    }
  }
});

test("slash skills and commands open above the default composer and run their distinct host actions", async ({
  page,
}) => {
  const { root, editor } = await demo(page);
  await expect(editor).toHaveAttribute("contenteditable", "true");
  await query(editor, "/");
  const panel = root.locator(
    ".chat-composer-completions[popover]:popover-open",
  );
  await expect(panel).toBeVisible();
  await expect(
    root.getByRole("option", { name: "Commands: /help" }),
  ).toBeVisible();
  await expect(
    root.getByRole("option", { name: "Skills: /summarize" }),
  ).toBeVisible();
  await expect(panel.getByText("Demo", { exact: true })).toHaveCount(4);
  await editor.press("ArrowUp");
  await expect(editor).toHaveAttribute(
    "aria-activedescendant",
    (await root
      .getByRole("option", { name: "Skills: /summarize" })
      .getAttribute("id"))!,
  );
  const composer = (await root.locator(".chat-composer").boundingBox())!;
  const menu = (await panel.boundingBox())!;
  expect(menu.y + menu.height).toBeLessThanOrEqual(composer.y);
  expect(menu.width).toBeCloseTo(composer.width, 0);
  await query(editor, "/summ");
  await expect(
    root.getByRole("option", { name: "Skills: /summarize" }),
  ).toBeVisible();
  await editor.press("Enter");
  await expect(panel).toHaveCount(0);
  await expect(editor).toContainText(
    "Summarize the changes and list the checks that passed.",
  );
  await expect(root.locator('[data-composer-kind="command"]')).toHaveCount(0);
  await expect(root.getByLabel("Compact host state")).toContainText(
    "Host: idle",
  );
  await editor.press("Control+Enter");
  await expect(root.getByLabel("Compact host state")).toContainText(
    "Prompt admitted:",
  );
  await root.getByRole("button", { name: "Stop", exact: true }).click();
  await query(editor, "/help");
  await expect(
    root.getByRole("option", { name: "Commands: /help" }),
  ).toBeVisible();
  await editor.press("Enter");
  await expect(root.locator('[data-composer-kind="command"]')).toHaveCount(1);
  await editor.press("Control+Enter");
  await expect(root.getByLabel("Compact host state")).toContainText(
    "Command result:",
  );
  await expect(root.getByLabel("Compact host state")).toContainText(
    "Host: idle",
  );
  await query(editor, "/inspect");
  await root.getByRole("option", { name: "Commands: /inspect" }).click();
  await expect(root.getByLabel("Compact host state")).toContainText(
    "Provider invocation executed independently",
  );
  await expect(root.getByLabel("Compact host state")).toContainText(
    "Host: idle",
  );
});

test("large completion lists escape ancestor clipping and scroll only their own tray", async ({
  page,
}) => {
  await page.goto(`${base}/components/chat/`);
  const path = new URL("./chat-completion.fixture.tsx", import.meta.url)
    .pathname;
  await page.evaluate(async (path) => {
    const fixture = await import(/* @vite-ignore */ path);
    fixture.mountCompletionFixture();
  }, `/@fs${path}`);
  const root = page.getByRole("region", {
    name: "Completion overflow fixture",
  });
  const editor = root.getByRole("textbox", {
    name: "Completion fixture message",
  });
  await query(editor, "/");
  const panel = root.locator(".chat-composer-completions:popover-open");
  await expect(root.getByRole("option")).toHaveCount(30);
  expect(
    await root
      .locator(".chat-composer")
      .evaluate((element) =>
        (element as HTMLElement).style.getPropertyValue("anchor-name"),
      ),
  ).toContain("--caller-composer");
  const scrollY = await page.evaluate(() => window.scrollY);
  for (let index = 0; index < 24; index++) await editor.press("ArrowDown");
  const active = root.getByRole("option", { name: "Skills: /skill-24" });
  await expect(active).toHaveAttribute("aria-selected", "true");
  const bounds = (await panel.boundingBox())!;
  const row = (await active.boundingBox())!;
  expect(row.y).toBeGreaterThanOrEqual(bounds.y);
  expect(row.y + row.height).toBeLessThanOrEqual(bounds.y + bounds.height);
  expect(bounds.y).toBeLessThan(
    (await root.locator("div").first().boundingBox())!.y,
  );
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
  await editor.press("Enter");
  await expect(panel).toHaveCount(0);
  await expect(editor).toHaveValue("/skill-24 ");
  await expect(root.getByRole("status")).toHaveText(
    "Selected skill-24; submissions 0",
  );
});

test("plain slash suggestions preserve text skills, disable rich commands and allow host invocation", async ({
  page,
}) => {
  const { root, editor } = await demo(page, true);
  await query(editor, "/");
  const help = root.getByRole("option", { name: "Commands: /help" });
  await expect(help).toHaveAttribute("aria-disabled", "true");
  await expect(help).toContainText("Requires the rich editor");
  await editor.press("Enter");
  await expect(root.getByLabel("Compact host state")).toContainText(
    "Provider invocation executed independently",
  );
  await expect(root.getByLabel("Compact host state")).toContainText(
    "Host: idle",
  );
  await query(editor, "/summ");
  await expect(
    root.getByRole("option", { name: "Skills: /summarize" }),
  ).toBeVisible();
  await editor.press("Tab");
  await expect(editor).toHaveValue(
    "Summarize the changes and list the checks that passed. ",
  );
  await expect(editor).toBeFocused();
});

test("slash popover fits both themes and directions and dismisses without changing the draft", async ({
  page,
}) => {
  const { root, editor } = await demo(page);
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
        await query(editor, "/");
        const panel = root.locator(
          ".chat-composer-completions[popover]:popover-open",
        );
        await expect(panel).toBeVisible();
        await expect(root.getByRole("option")).toHaveCount(4);
        const b = (await panel.boundingBox())!;
        expect(b.x).toBeGreaterThanOrEqual(0);
        expect(b.x + b.width).toBeLessThanOrEqual(width + 1);
        expect(b.y).toBeGreaterThanOrEqual(0);
        expect(b.y + b.height).toBeLessThanOrEqual(1001);
        expect(
          (
            await new AxeBuilder({ page })
              .include("[data-chat-compact-demo]")
              .analyze()
          ).violations,
        ).toEqual([]);
        await editor.press("Escape");
        await expect(panel).toHaveCount(0);
        await expect(editor).toContainText("/");
        await expect(editor).toBeFocused();
        await expect(editor).not.toHaveAttribute("aria-activedescendant");
      }
  }
  await query(editor, "/summ");
  await expect(root.getByRole("listbox")).toBeVisible();
  await page.getByRole("heading", { name: "Chat", exact: true }).click();
  await expect(root.getByRole("listbox")).toHaveCount(0);
  await expect(editor).toContainText("/summ");
});
