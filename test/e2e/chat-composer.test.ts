import { expect, test, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const baseUrl = process.env.DOCS_TEST_URL ?? "http://127.0.0.1:4334";
const hydratedComposer = "astro-island:not([ssr]) [data-chat-composer-demo]";
const fixtureUrl = new URL("./chat-composer.fixture.tsx", import.meta.url)
  .pathname;
const image = {
  name: "pixel.png",
  mimeType: "image/png",
  buffer: Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
    "base64",
  ),
};
const documentFile = {
  name: "notes.txt",
  mimeType: "text/plain",
  buffer: Buffer.from("A new attachment"),
};

async function fixture(page: Page) {
  await page.goto(`${baseUrl}/components/chat/`, {
    waitUntil: "domcontentloaded",
  });
  await expect(page.locator(hydratedComposer)).toBeVisible();
  await page.evaluate(async (url) => {
    const fixture = await import(/* @vite-ignore */ url);
    fixture.mountComposerFixture();
  }, `/@fs${fixtureUrl}`);
  const root = page.getByRole("region", { name: "Composer browser fixture" });
  await expect(
    root.getByLabel("Fixture message", { exact: true }),
  ).toBeVisible();
  return root;
}

async function submissions(root: Locator) {
  return JSON.parse(
    (await root.getByLabel("Submitted snapshots").textContent())!,
  ) as { value: string; files: string[] }[];
}

test("chat docs publish the composable composer example", async ({ page }) => {
  await page.goto(`${baseUrl}/components/chat/`);
  const demo = page.locator(hydratedComposer);
  await expect(demo).toBeVisible();
  const message = demo.getByLabel("Message", { exact: true });
  await message.fill("A follow-up from the documented composer");
  await message.press("Control+Enter");
  await expect(demo.locator(".chat-bubble")).toHaveText(
    "A follow-up from the documented composer",
  );
  await expect(
    demo.getByRole("button", { name: "Stop", exact: true }),
  ).toBeVisible();
  await message.fill("Another follow-up");
  await expect(
    demo.getByRole("button", { name: "Send", exact: true }),
  ).toBeEnabled();
  await demo.getByRole("button", { name: "Stop", exact: true }).click();
  await expect(demo.getByRole("status")).toContainText("queued locally");
  await demo.locator('input[type="file"]').setInputFiles({
    name: "oversized.txt",
    mimeType: "text/plain",
    buffer: Buffer.alloc(2 * 1024 * 1024 + 1),
  });
  await demo.getByRole("button", { name: "Send", exact: true }).click();
  await expect(demo.getByRole("alert")).toHaveText(
    "Choose files smaller than 2 MiB for this example.",
  );
  await expect(message).toHaveValue("Another follow-up");
  await expect(demo.getByText("oversized.txt", { exact: true })).toBeVisible();
  await expect(demo.locator(".chat-bubble")).toHaveCount(1);
  await demo.getByRole("button", { name: "Remove oversized.txt" }).click();
  await expect(demo.getByRole("alert")).toHaveCount(0);
});

test("multiline composer grows, bounds scrolling, shrinks and respects IME", async ({
  page,
}) => {
  const root = await fixture(page);
  const message = root.getByLabel("Fixture message", { exact: true });
  const initial = (await message.boundingBox())!.height;
  expect(initial).toBeLessThanOrEqual(72);
  await message.fill("First line");
  await message.press("Enter");
  await message.press("a");
  await expect(message).toHaveValue("First line\na");
  expect(await submissions(root)).toEqual([]);
  await message.fill(
    Array.from({ length: 5 }, (_, index) => `Line ${index}`).join("\n"),
  );
  await expect
    .poll(async () => (await message.boundingBox())!.height)
    .toBeGreaterThan(initial);
  const bounded = (await message.boundingBox())!.height;
  await message.fill(
    Array.from({ length: 30 }, (_, index) => `Line ${index}`).join("\n"),
  );
  await expect
    .poll(async () => (await message.boundingBox())!.height)
    .toBeLessThanOrEqual(bounded + 1);
  expect(
    await message.evaluate(
      (element) => element.scrollHeight > element.clientHeight,
    ),
  ).toBe(true);
  await message.fill("Short");
  await expect
    .poll(async () => (await message.boundingBox())!.height)
    .toBeLessThan(bounded);
  await message.evaluate((element) => {
    element.dispatchEvent(
      new CompositionEvent("compositionstart", { bubbles: true }),
    );
    element.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Enter",
        ctrlKey: true,
        isComposing: true,
        bubbles: true,
      }),
    );
    element.dispatchEvent(
      new CompositionEvent("compositionend", { bubbles: true }),
    );
  });
  expect(await submissions(root)).toEqual([]);
  await expect(message).toHaveValue("Short");
  await message.press("Control+Enter");
  await expect(message).toHaveValue("");
  expect(await submissions(root)).toEqual([{ value: "Short", files: [] }]);
  await message.fill("Meta shortcut");
  await message.press("Meta+Enter");
  await expect(message).toHaveValue("");
  expect((await submissions(root)).at(-1)!.value).toBe("Meta shortcut");
});

test("attachment preview/removal and text or attachment-only submission use native files", async ({
  page,
}) => {
  const root = await fixture(page);
  const picker = root.locator('input[type="file"]');
  await picker.setInputFiles([image, documentFile]);
  await expect(root.getByText("pixel.png", { exact: true })).toBeVisible();
  await expect(root.getByText("notes.txt", { exact: true })).toBeVisible();
  const preview = root.locator('img[src^="blob:"]');
  await expect(preview).toHaveCount(1);
  await expect
    .poll(() =>
      preview.evaluate((element) => (element as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  await root.getByRole("button", { name: /remove.*notes.txt/i }).click();
  await expect(root.getByText("notes.txt", { exact: true })).toHaveCount(0);
  await root.getByRole("button", { name: "Send", exact: true }).click();
  await expect(root.getByText("pixel.png", { exact: true })).toHaveCount(0);
  expect(await submissions(root)).toEqual([
    { value: "", files: ["pixel.png"] },
  ]);
  await picker.setInputFiles(documentFile);
  await root
    .getByLabel("Fixture message", { exact: true })
    .fill("With a document");
  await root.getByRole("button", { name: "Send", exact: true }).click();
  await expect(root.getByText("notes.txt", { exact: true })).toHaveCount(0);
  expect((await submissions(root)).at(-1)).toEqual({
    value: "With a document",
    files: ["notes.txt"],
  });
});

test("async completion replacement preserves text and keyboard selection never submits", async ({
  page,
}) => {
  const root = await fixture(page);
  const message = root.getByLabel("Fixture message", { exact: true });
  await message.fill("/");
  await root
    .getByRole("button", { name: "Load completions asynchronously" })
    .click();
  await expect(
    root.getByRole("listbox", { name: "Commands and skills" }),
  ).toBeVisible();
  await expect(message).toHaveValue("/");
  await expect(
    root.getByRole("textbox", { name: "Fixture message" }),
  ).toBeVisible();
  await expect(message).toHaveAttribute("aria-autocomplete", "list");
  await expect(message).toHaveAttribute("aria-haspopup", "listbox");
  const listbox = root.getByRole("listbox", { name: "Commands and skills" });
  await expect(message).toHaveAttribute(
    "aria-controls",
    (await listbox.getAttribute("id"))!,
  );
  const active = root.getByRole("option", { name: "/help", exact: true });
  await expect(message).toHaveAttribute(
    "aria-activedescendant",
    (await active.getAttribute("id"))!,
  );
  await expect(active).toHaveAttribute("aria-selected", "true");
  await expect(
    root.getByRole("option", { name: "/unavailable", exact: true }),
  ).toHaveAttribute("aria-disabled", "true");
  await message.focus();
  await message.press("ArrowDown");
  await message.press("Enter");
  await expect(message).toHaveValue("/review ");
  expect(await submissions(root)).toEqual([]);
  await message.fill("/");
  await root
    .getByRole("button", { name: "Replace completions asynchronously" })
    .click();
  await expect(
    root.getByRole("option", { name: "/remote", exact: true }),
  ).toBeVisible();
  await expect(message).toHaveValue("/");
  await message.focus();
  await message.press("Tab");
  await expect(message).toHaveValue("/remote ");
  expect(await submissions(root)).toEqual([]);
  await message.fill("/");
  await message.press("Escape");
  await expect(root.getByRole("listbox")).toHaveCount(0);
  await expect(message).not.toHaveAttribute("aria-controls");
  await expect(message).not.toHaveAttribute("aria-activedescendant");
});

test("streaming allows a follow-up and Stop is independent", async ({
  page,
}) => {
  const root = await fixture(page);
  await root.getByRole("button", { name: "Start streaming" }).click();
  await expect(root.getByLabel("Streaming state")).toHaveText("Streaming");
  await root
    .getByLabel("Fixture message", { exact: true })
    .fill("Steer this reply");
  await root.getByRole("button", { name: "Send", exact: true }).click();
  await expect(root.getByLabel("Fixture message", { exact: true })).toHaveValue(
    "",
  );
  await expect(root.getByLabel("Streaming state")).toHaveText("Streaming");
  expect(await submissions(root)).toEqual([
    { value: "Steer this reply", files: [] },
  ]);
  await root.getByRole("button", { name: "Stop", exact: true }).click();
  await expect(root.getByLabel("Streaming state")).toHaveText("Stopped");
});

test("controlled draft survives remount/rejection and pending acceptance preserves newer edits/files", async ({
  page,
}) => {
  const root = await fixture(page);
  const message = root.getByLabel("Fixture message", { exact: true });
  const picker = root.locator('input[type="file"]');
  await message.fill("Restored session draft");
  await picker.setInputFiles(image);
  await root.getByRole("button", { name: "Remount composer" }).click();
  await expect(message).toHaveValue("Restored session draft");
  await expect(root.getByText("pixel.png", { exact: true })).toBeVisible();
  await root.getByLabel("Admission", { exact: true }).selectOption("reject");
  await root.getByRole("button", { name: "Send", exact: true }).click();
  await expect(root.getByRole("alert")).toHaveText(
    "Server rejected this message. Your draft is preserved.",
  );
  await expect(message).toHaveValue("Restored session draft");
  await expect(root.getByText("pixel.png", { exact: true })).toBeVisible();
  await root.getByLabel("Admission", { exact: true }).selectOption("pending");
  await root.getByRole("button", { name: "Send", exact: true }).click();
  await expect(
    root.getByRole("button", { name: "Send", exact: true }),
  ).toBeDisabled();
  await message.fill("New draft while admission is pending");
  await picker.setInputFiles(documentFile);
  await expect(root.getByText("notes.txt", { exact: true })).toBeVisible();
  await root.getByRole("button", { name: "Accept pending submission" }).click();
  await expect(message).toHaveValue("New draft while admission is pending");
  await expect(root.getByText("pixel.png", { exact: true })).toHaveCount(0);
  await expect(root.getByText("notes.txt", { exact: true })).toBeVisible();
  expect((await submissions(root)).at(-1)).toEqual({
    value: "Restored session draft",
    files: ["pixel.png"],
  });
});

test("completion is accessible and text/attachments wrap inside a resized composer", async ({
  page,
}) => {
  const root = await fixture(page);
  const message = root.getByLabel("Fixture message", { exact: true });
  await root.evaluate((element) => {
    (element as HTMLElement).style.width = "300px";
  });
  await message.fill("word ".repeat(100));
  await expect
    .poll(async () => (await message.boundingBox())!.height)
    .toBeLessThanOrEqual(160);
  expect(
    await message.evaluate(
      (element) => element.scrollHeight > element.clientHeight,
    ),
  ).toBe(true);
  expect(
    await message.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
  ).toBe(true);
  await root.locator('input[type="file"]').setInputFiles({
    ...documentFile,
    name: "a-very-long-attachment-name-that-must-wrap-inside-the-available-composer-width.txt",
  });
  expect(
    await root
      .locator(".chat-composer")
      .evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true);
  await message.fill("/");
  await root
    .getByRole("button", { name: "Load completions asynchronously" })
    .click();
  await expect(root.getByRole("listbox")).toBeVisible();
  for (const theme of ["sunshine", "moonlight"]) {
    await page.evaluate(async (theme) => {
      document.documentElement.setAttribute("data-theme", theme);
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
      .include("[data-chat-composer-fixture] .chat-composer")
      .analyze();
    expect(audit.violations, `${theme} composer accessibility`).toEqual([]);
  }
});
