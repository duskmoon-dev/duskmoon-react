import { test, expect, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  openAdd,
  openControls,
  demoAction,
  chooseModel,
} from "./chat-demo.helpers";
import type { ComposerDocument } from "../../packages/components/src/components/chat/Composer.types";

const base = process.env.DOCS_TEST_URL ?? "http://127.0.0.1:4334";
async function demo(page: Page, mode: "plain" | "rich" = "rich") {
  await page.goto(`${base}/components/chat/`);
  const root = page.locator(
    `astro-island:not([ssr]) [data-chat-session-demo="${mode}"]`,
  );
  await expect(
    root.getByRole("textbox", {
      name: mode === "rich" ? "Rich demo message" : "Semantic demo message",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    root.getByRole("button", {
      name: "Save draft",
      exact: true,
      includeHidden: true,
    }),
  ).toBeEnabled();
  return root;
}
function editor(root: Locator) {
  return root.getByRole("textbox", { name: /^(Rich|Semantic) demo message$/ });
}
async function document(root: Locator): Promise<ComposerDocument> {
  return JSON.parse(
    (await root.getByLabel("Current portable document").textContent())!,
  );
}
async function empty(root: Locator) {
  await demoAction(root, "Replace with empty document");
  await expect
    .poll(async () => (await document(root)).content)
    .toEqual([{ type: "text", text: "" }]);
  await editor(root).focus();
}

for (const mode of ["plain", "rich"] as const) {
  test(`default ${mode} submission succeeds without crypto.randomUUID`, async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(crypto, "randomUUID", {
        configurable: true,
        value: undefined,
      });
    });
    const root = await demo(page, mode);
    expect(
      await page.evaluate(() => ({
        randomUUID: typeof crypto.randomUUID,
        getRandomValues: typeof crypto.getRandomValues,
      })),
    ).toEqual({ randomUUID: "undefined", getRandomValues: "function" });
    const message = `${mode} default submission without randomUUID`;
    await editor(root).fill(message);
    await root.getByRole("button", { name: "Send", exact: true }).click();
    await expect(root.getByRole("log", { includeHidden: true })).toContainText(
      `Prompt admitted: ${message}`,
    );
    await expect
      .poll(async () => (await document(root)).content)
      .toEqual([{ type: "text", text: "" }]);
    if (mode === "plain") await expect(editor(root)).toHaveValue("");
    else await expect(editor(root)).toHaveText("");
    await expect(root.getByRole("alert")).toHaveCount(0);
  });

  test(`native mixed text/image paste preserves text and prepares the file in ${mode} mode`, async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const root = await demo(page, mode);
    await openControls(root);
    await root.getByLabel("Fail first preparation").uncheck();
    await empty(root);
    await page.evaluate(async () => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 2;
      canvas.getContext("2d")!.fillRect(0, 0, 2, 2);
      const png = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (blob) =>
            blob
              ? resolve(blob)
              : reject(new Error("Could not create clipboard PNG")),
          "image/png",
        ),
      );
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": png,
          "text/plain": new Blob(["Mixed clipboard text"], {
            type: "text/plain",
          }),
        }),
      ]);
    });
    await editor(root).press("Control+v");
    await expect
      .poll(async () => (await document(root)).content)
      .toEqual([{ type: "text", text: "Mixed clipboard text" }]);
    await expect(root.locator(".chat-composer-attachment")).toHaveCount(1);
    await expect(
      root.getByRole("button", { name: "Send", exact: true }),
    ).toBeEnabled();
  });
}

test("rich reference and quote transactions preserve identity through caret deletion and undo", async ({
  page,
}) => {
  const root = await demo(page);
  await empty(root);
  await editor(root).pressSequentially("Before ");
  await demoAction(root, "Insert reference");
  await demoAction(root, "Insert quote");
  const before = await document(root);
  expect(before.content.map((node) => node.type)).toEqual([
    "text",
    "reference",
    "quote",
  ]);
  expect(before.content[1]).toMatchObject({
    providerId: "demo-files",
    refId: "README.md",
  });
  expect(before.content[2]).toMatchObject({
    source: { messageId: "demo-message" },
  });
  await editor(root).focus();
  await editor(root).press("End");
  await editor(root).press("Backspace");
  await expect
    .poll(async () => (await document(root)).content.map((node) => node.type))
    .toEqual(["text", "reference"]);
  await editor(root).press("Control+z");
  await expect.poll(() => document(root)).toEqual(before);
  await editor(root).press("Control+Shift+z");
  await expect
    .poll(async () => (await document(root)).content.map((node) => node.type))
    .toEqual(["text", "reference"]);
});

test("native clipboard round trip keeps ordered semantic nodes and creates fresh occurrences", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const root = await demo(page);
  await empty(root);
  await editor(root).pressSequentially("Source ");
  await demoAction(root, "Insert reference");
  await demoAction(root, "Insert quote");
  const before = await document(root);
  await editor(root).focus();
  await editor(root).press("Control+a");
  await editor(root).press("Control+c");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "@README.md",
  );
  await editor(root).press("ArrowRight");
  await editor(root).press("Control+v");
  await expect
    .poll(
      async () =>
        (await document(root)).content.filter(
          (node) => node.type === "reference",
        ).length,
    )
    .toBe(2);
  const after = await document(root);
  const original = before.content.filter((node) => node.type !== "text");
  const pasted = after.content.filter((node) => node.type !== "text").slice(2);
  expect(pasted.map((node) => node.type)).toEqual(["reference", "quote"]);
  expect(pasted[0]).toMatchObject({
    providerId: "demo-files",
    refId: "README.md",
  });
  expect(pasted.map((node) => node.nodeId)).not.toEqual(
    original.map((node) => node.nodeId),
  );
  await editor(root).press("Control+z");
  await expect.poll(() => document(root)).toEqual(before);
});

test("native partial-range cut and replacement across atomic nodes are lossless on undo", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const root = await demo(page);
  await empty(root);
  await editor(root).pressSequentially("Prefix ");
  await demoAction(root, "Insert reference");
  await demoAction(root, "Insert quote");
  const before = await document(root);
  async function selectTail() {
    await editor(root).focus();
    await editor(root).press("Control+Home");
    for (let offset = 0; offset < 3; offset++)
      await editor(root).press("ArrowRight");
    await editor(root).press("Shift+End");
  }
  await selectTail();
  await editor(root).press("Control+x");
  await expect
    .poll(async () => (await document(root)).content)
    .toEqual([{ type: "text", text: "Pre" }, before.content[2]]);
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "@README.md",
  );
  await editor(root).press("Control+z");
  await expect.poll(() => document(root)).toEqual(before);
  await selectTail();
  await editor(root).press("X");
  await expect
    .poll(async () => (await document(root)).content)
    .toEqual([{ type: "text", text: "PreX" }, before.content[2]]);
  await editor(root).press("Control+z");
  await expect.poll(() => document(root)).toEqual(before);
  await expect(
    root.getByRole("log", { includeHidden: true }),
  ).not.toContainText("admitted");
});

test("claimed command identity survives empty arguments, token deletion and undo; skills stay editable", async ({
  page,
}) => {
  const root = await demo(page);
  await empty(root);
  await demoAction(root, "Claim /help command");
  await editor(root).pressSequentially(" argument");
  await editor(root).press("Control+Backspace");
  expect((await document(root)).command).toEqual({
    providerId: "demo-commands",
    commandId: "help",
  });
  await editor(root).press("Control+a");
  await editor(root).press("Backspace");
  await expect.poll(async () => (await document(root)).command).toBeUndefined();
  await editor(root).press("Control+z");
  await expect
    .poll(async () => (await document(root)).command?.commandId)
    .toBe("help");
  await empty(root);
  await editor(root).pressSequentially("/summ");
  await expect(
    root.getByRole("option", { name: /Skills: \/summarize/ }),
  ).toBeVisible();
  await editor(root).press("Enter");
  expect((await document(root)).command).toBeUndefined();
  await expect(editor(root)).toContainText("Summarize the changes");
  await expect(
    root.getByRole("log", { includeHidden: true }),
  ).not.toContainText("admitted");
});

test("reference completion consumes Enter and a non-prompt command returns only its action result", async ({
  page,
}) => {
  const root = await demo(page);
  await empty(root);
  await editor(root).pressSequentially("@read");
  const option = root.getByRole("option", { name: /README.md/ });
  await expect(option).toBeVisible();
  await expect(editor(root)).toHaveAttribute(
    "aria-activedescendant",
    (await option.getAttribute("id"))!,
  );
  await editor(root).press("Enter");
  await expect(root.locator('[data-composer-kind="reference"]')).toHaveCount(1);
  await expect(
    root.getByRole("log", { includeHidden: true }),
  ).not.toContainText("admitted");
  await empty(root);
  await demoAction(root, "Claim /help command");
  await editor(root).press("Control+Enter");
  await expect(
    root.getByText("Command completed", { exact: true }),
  ).toHaveClass("sr-only");
  await expect(root.getByRole("log", { includeHidden: true })).toContainText(
    "Command result:",
  );
  await expect(
    root.getByRole("log", { includeHidden: true }),
  ).not.toContainText("Prompt admitted");
  await expect(
    root.getByRole("status").filter({ hasText: /^Host:/ }),
  ).toHaveText("Host: idle; model: standard; queue revision: 0.");
});

test("unknown admission retains its snapshot and reconciliation preserves edits made while pending", async ({
  page,
}) => {
  const root = await demo(page);
  await openControls(root);
  await root.getByLabel("Admission outcome").selectOption("unknown");
  await empty(root);
  await editor(root).pressSequentially("Original prompt");
  await editor(root).press("Control+Enter");
  await expect(editor(root)).toBeEnabled();
  await editor(root).pressSequentially(" with later edits");
  await expect(
    root.getByText("Submission outcome unknown — draft retained", {
      exact: true,
    }),
  ).toBeVisible();
  expect((await document(root)).content).toEqual([
    { type: "text", text: "Original prompt with later edits" },
  ]);
  await root
    .getByText("Submission outcome unknown — draft retained", { exact: true })
    .click();
  await expect(
    root.getByRole("region", { name: "Preserved draft" }),
  ).toContainText("Original prompt");
  await root.getByRole("button", { name: "Check submission status" }).click();
  await expect(root.getByRole("log", { includeHidden: true })).toContainText(
    "Reconciled: accepted",
  );
  expect((await document(root)).content).toEqual([
    { type: "text", text: "Original prompt with later edits" },
  ]);
});

test("preparation failure/retry and explicit draft remount retain recoverable files", async ({
  page,
}) => {
  const root = await demo(page, "plain");
  const picker = root.locator('input[type="file"]');
  await picker.setInputFiles({
    name: "notes.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("notes"),
  });
  await expect(
    root.getByText("Demo preparation failed once. Retry this attachment.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    root.getByRole("button", { name: "Send", exact: true }),
  ).toBeDisabled();
  await root.getByRole("button", { name: /Retry.*notes.txt/ }).click();
  await expect(
    root.getByRole("button", { name: "Send", exact: true }),
  ).toBeEnabled();
  await openAdd(root);
  await root.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(root.getByText("Draft saved by host storage.")).toHaveClass(
    "sr-only",
  );
  await demoAction(root, "Remount editor");
  await expect(
    root.getByText("Select this file again to restore it", { exact: true }),
  ).toBeVisible();
  await expect(
    root.getByRole("button", { name: "Remove notes.txt" }),
  ).toBeVisible();
  await expect(
    root.getByRole("button", { name: "Send", exact: true }),
  ).toBeDisabled();
});

test("queue actions and model choices display authoritative acknowledgments", async ({
  page,
}) => {
  const root = await demo(page, "plain");
  await demoAction(root, "Start demo turn");
  await editor(root).fill("Queue this follow-up");
  await root
    .getByRole("button", { name: "Send follow-up", exact: true })
    .click();
  await expect(root.locator(".chat-queue-item")).toHaveCount(1);
  for (const label of ["Edit", "Steer", "Remove"]) {
    const action = root.getByRole("button", {
      name: `${label} waiting message 1`,
      exact: true,
    });
    await expect(action).toHaveAttribute("title", `${label} waiting message 1`);
    await expect(action.locator('svg[aria-hidden="true"]')).toHaveCount(1);
    expect(await action.textContent()).toBe("");
  }
  const edit = root.getByRole("button", { name: "Edit waiting message 1" });
  await edit.click();
  await root
    .getByRole("textbox", { name: "Queued message" })
    .fill("Cancelled edit");
  await root.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(root.locator(".chat-queue-content")).toHaveText(
    "Queue this follow-up",
  );
  await edit.click();
  await root
    .getByRole("textbox", { name: "Queued message" })
    .fill("Revised follow-up");
  await root.getByRole("button", { name: "Save queued message" }).click();
  await expect(root.locator(".chat-queue-content")).toHaveText(
    "Queue this follow-up",
  );
  await expect(root.locator(".chat-queue-content")).toHaveText(
    "Revised follow-up",
  );
  await root.getByRole("button", { name: "Steer waiting message 1" }).click();
  await expect(root.locator(".chat-queue-item")).toHaveCount(1);
  await expect(root.locator(".chat-queue-item")).toHaveCount(0);
  await expect(
    root.getByRole("log", { name: "Demo host events", includeHidden: true }),
  ).toContainText("Queue promote acknowledged");
  await editor(root).fill("Remove this follow-up");
  await root
    .getByRole("button", { name: "Send follow-up", exact: true })
    .click();
  await expect(root.locator(".chat-queue-item")).toHaveCount(1);
  await root
    .getByRole("button", { name: /Remove.*queued|Remove waiting/ })
    .click();
  await expect(root.locator(".chat-queue-item")).toHaveCount(1);
  await expect(root.locator(".chat-queue-item")).toHaveCount(0);
  const trigger = root.getByRole("button", { name: /^Model settings:/ });
  await chooseModel(root, "Fast demo model");
  await expect(trigger).toHaveAccessibleName(
    "Model settings: Standard demo model, Medium",
  );
  await expect(trigger).toHaveAccessibleName(
    "Model settings: Fast demo model, Medium",
  );
  await chooseModel(root, "Restricted model (host rejects)");
  await expect(
    root
      .getByRole("group", { name: "Composer model settings", exact: true })
      .getByRole("status"),
  ).toContainText(
    "Demo host declined this model; the current selection is retained.",
  );
  await expect(trigger).toHaveAccessibleName(
    "Model settings: Fast demo model, Medium",
  );
});

test("external document replacement resets history while controlled echoes retain undo", async ({
  page,
}) => {
  const root = await demo(page);
  await empty(root);
  await editor(root).pressSequentially("Undo me");
  await editor(root).press("Control+z");
  await expect(editor(root)).not.toContainText("Undo me");
  await editor(root).press("Control+Shift+z");
  await expect(editor(root)).toContainText("Undo me");
  await empty(root);
  await editor(root).press("Control+z");
  expect((await document(root)).content).toEqual([{ type: "text", text: "" }]);
});

test("rich shell preserves narrow layout, focus and accessibility in both themes", async ({
  page,
}) => {
  const root = await demo(page);
  await root.evaluate((element) => {
    (element as HTMLElement).style.width = "300px";
  });
  await empty(root);
  await demoAction(root, "Insert reference");
  await editor(root).pressSequentially(" word".repeat(30));
  expect(
    await root
      .locator(".chat-composer")
      .evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true);
  await editor(root).pressSequentially(" @");
  await expect(root.getByRole("listbox")).toBeVisible();
  await editor(root).press("Escape");
  await expect(editor(root)).toBeFocused();
  await expect(root.getByRole("listbox")).toHaveCount(0);
  for (const theme of ["sunshine", "moonlight"]) {
    await page.evaluate(async (value) => {
      document.documentElement.setAttribute("data-theme", value);
      await Promise.allSettled(
        document
          .getAnimations()
          .filter((animation) =>
            Number.isFinite(animation.effect?.getComputedTiming().endTime),
          )
          .map((animation) => animation.finished),
      );
    }, theme);
    const audit = await new AxeBuilder({ page })
      .include('[data-chat-session-demo="rich"] .chat-composer')
      .analyze();
    expect(audit.violations, `${theme} rich composer accessibility`).toEqual(
      [],
    );
  }
});

test("a failed rich-editor import preserves structured input with an explicit JSON export", async ({
  page,
}) => {
  await page.route(/\/rich\/LexicalEditor\.tsx/, (route) => route.abort());
  await page.goto(`${base}/components/chat/`);
  const fixture = new URL("./chat-rich.fixture.tsx", import.meta.url).pathname;
  await page.evaluate(async (url) => {
    const module = await import(/* @vite-ignore */ url);
    module.mountRichFailureFixture();
  }, `/@fs${fixture}`);
  const root = page.getByRole("region", {
    name: "Rich editor failure fixture",
  });
  await expect(root.getByRole("alert")).toContainText(
    "Your draft is preserved",
  );
  const url = await root
    .getByRole("link", { name: "Export preserved draft" })
    .getAttribute("href");
  const preserved = JSON.parse(
    decodeURIComponent(url!.slice(url!.indexOf(",") + 1)),
  ) as ComposerDocument;
  expect(preserved.content.map((node) => node.type)).toEqual([
    "text",
    "reference",
    "quote",
  ]);
  expect(preserved.content[1]).toMatchObject({
    nodeId: "original-reference",
    refId: "README.md",
  });
  expect(preserved.content[2]).toMatchObject({
    nodeId: "original-quote",
    source: { messageId: "message" },
  });
  await expect(
    root.getByRole("button", { name: "Send", exact: true }),
  ).toBeDisabled();
});
