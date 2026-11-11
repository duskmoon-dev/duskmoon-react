import { expect, test, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  openAdd,
  closeMenus,
  chooseModel as requestModel,
  settingsStatus,
  openModel,
} from "./chat-demo.helpers";

const base = process.env.DOCS_TEST_URL ?? "http://127.0.0.1:4334";
const richFixturePath = new URL("./chat-rich.fixture.tsx", import.meta.url)
  .pathname;
const image = {
  name: "pixel.png",
  mimeType: "image/png",
  buffer: Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
    "base64",
  ),
};

async function demo(page: Page, rich = false) {
  await page.goto(`${base}/components/chat/`);
  const root = page.locator("astro-island:not([ssr]) [data-chat-compact-demo]");
  await expect(
    root.getByRole("button", { name: "Send", exact: true }),
  ).toBeEnabled();
  await openAdd(root);
  await root.getByLabel("Use rich editor").setChecked(rich);
  await closeMenus(root);
  await expect(
    root.getByRole("textbox", { name: "Compact demo message" }),
  ).toBeVisible();
  await expect(
    root.getByRole("button", { name: "Send", exact: true }),
  ).toBeEnabled();
  return root;
}

async function chooseModel(page: Page, root: Locator, label: string) {
  const trigger = root.getByRole("button", { name: /^Model settings:/ });
  await requestModel(root, label);
  const menu = root.getByRole("group", {
    name: "Composer model settings",
    exact: true,
    includeHidden: true,
  });
  return { trigger, menu };
}

for (const rich of [false, true]) {
  test(`compact ${rich ? "rich" : "plain"} editor grows and keeps Stop independent of follow-ups`, async ({
    page,
  }) => {
    const root = await demo(page, rich);
    const message = root.getByRole("textbox", { name: "Compact demo message" });
    const initial = (await message.boundingBox())!.height;
    expect(initial).toBeLessThanOrEqual(28);
    await message.fill("First line");
    await message.press("Enter");
    await message.press("a");
    await expect(root.getByLabel("Compact host state")).toContainText("idle");
    await expect
      .poll(async () => (await message.boundingBox())!.height)
      .toBeGreaterThan(initial);
    await message.fill(
      Array.from({ length: 30 }, (_, at) => `Line ${at}`).join("\n"),
    );
    expect((await message.boundingBox())!.height).toBeLessThanOrEqual(160);
    expect(
      await message.evaluate(
        (element) => element.scrollHeight > element.clientHeight,
      ),
    ).toBe(true);
    await message.fill("Review the compact composer");
    await expect
      .poll(async () => (await message.boundingBox())!.height)
      .toBeLessThanOrEqual(initial + 1);
    await message.press("Control+Enter");
    await expect(root.getByLabel("Compact host state")).toContainText(
      "running",
    );
    await expect(
      root.getByRole("button", { name: "Stop", exact: true }),
    ).toBeEnabled();
    await message.fill("A queued follow-up");
    await root
      .getByRole("button", { name: "Send follow-up", exact: true })
      .click();
    await expect(root.getByLabel("Compact host state")).toContainText(
      "waiting messages: 1",
    );
    await root.getByRole("button", { name: "Stop", exact: true }).click();
    await expect(root.getByLabel("Compact host state")).toContainText("idle");
    await expect(root.getByLabel("Compact host state")).toContainText(
      "waiting messages: 1",
    );
  });
}

test("rich minRows and maxRows bound content and restore the requested minimum after clearing", async ({
  page,
}) => {
  await page.goto(`${base}/components/chat/`);
  await page.evaluate(async (path) => {
    const fixture = await import(/* @vite-ignore */ path);
    fixture.mountRichFailureFixture({ minRows: 3.8, maxRows: 4.9 });
  }, `/@fs${richFixturePath}`);
  const message = page
    .getByRole("region", { name: "Rich editor failure fixture" })
    .getByRole("textbox");
  await expect(message).toBeEditable();
  await message.fill("");
  const lineHeight = await message.evaluate((element) =>
    parseFloat(getComputedStyle(element).lineHeight),
  );
  await expect
    .poll(async () => (await message.boundingBox())!.height)
    .toBeCloseTo(3 * lineHeight, 0);
  await message.fill(
    Array.from({ length: 30 }, (_, at) => `Line ${at}`).join("\n"),
  );
  await expect
    .poll(async () => (await message.boundingBox())!.height)
    .toBeCloseTo(4 * lineHeight, 0);
  expect(
    await message.evaluate(
      (element) => element.scrollHeight > element.clientHeight,
    ),
  ).toBe(true);
  await message.fill("");
  await expect
    .poll(async () => (await message.boundingBox())!.height)
    .toBeCloseTo(3 * lineHeight, 0);
});

test("compact native settings waits for host acknowledgment and keeps rejected choices", async ({
  page,
}) => {
  const root = await demo(page);
  let controls = await chooseModel(page, root, "Fast demo model");
  await expect(root.getByLabel("Compact host state")).toContainText(
    "model: standard",
  );
  await expect(controls.menu).toBeHidden();
  await expect(controls.trigger).toHaveAttribute("aria-busy", "true");
  await expect(settingsStatus(root)).toContainText("Change pending");
  await openModel(root);
  await expect(
    controls.menu.getByRole("button", { name: /^Choose a model:/ }),
  ).toBeDisabled();
  await expect(controls.menu.getByRole("slider")).toBeDisabled();
  await closeMenus(root);
  await expect(controls.trigger).toHaveAccessibleName(
    "Model settings: Fast demo model, Medium",
  );
  await openModel(root);
  await controls.menu.getByRole("button", { name: /^Choose a model:/ }).focus();
  await page.keyboard.press("Escape");
  await expect(controls.menu).toBeHidden();
  await expect(controls.trigger).toBeFocused();
  controls = await chooseModel(page, root, "Restricted model (host rejects)");
  await expect(settingsStatus(root)).toContainText(
    "Demo host declined this model",
  );
  await expect(controls.trigger).toHaveAccessibleName(
    "Model settings: Fast demo model, Medium",
  );
  await expect(root.getByLabel("Compact host state")).toContainText(
    "model: fast",
  );
  await expect(controls.menu).toBeHidden();
  await expect(controls.trigger).toBeFocused();
  await openModel(root);
  // The anchored menu covers the editor's right side; click exposed text space.
  await root.getByRole("textbox").click({ position: { x: 8, y: 8 } });
  await expect(controls.menu).toBeHidden();
  await expect(root.getByRole("textbox")).toBeFocused();
});

test("ready-image rail removes native previews and mixed files retain complete rows", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const revoked: string[] = [];
    const original = URL.revokeObjectURL.bind(URL);
    URL.revokeObjectURL = (url) => {
      revoked.push(url);
      original(url);
    };
    (
      window as unknown as { revokedComposerUrls: string[] }
    ).revokedComposerUrls = revoked;
  });
  const root = await demo(page);
  const picker = root.locator('input[type="file"]');
  await picker.setInputFiles([
    image,
    { ...image, name: "second.png" },
    { ...image, name: "third.png" },
  ]);
  const rail = root.locator(".chat-composer-thumbnails");
  await expect(rail.locator(".chat-composer-attachment-tile")).toHaveCount(3);
  const stripBounds = (await rail.boundingBox())!;
  expect(stripBounds.y + stripBounds.height).toBeLessThanOrEqual(
    (await root.getByRole("textbox").boundingBox())!.y,
  );
  await page.setViewportSize({ width: 320, height: 1000 });
  expect(
    await rail.evaluate((element) => element.scrollWidth > element.clientWidth),
  ).toBe(true);
  expect((await rail.boundingBox())!.height).toBeLessThanOrEqual(112);
  await expect(
    rail.getByRole("img", { name: "third.png", exact: true }),
  ).toBeAttached();
  await page.setViewportSize({ width: 1440, height: 1000 });
  const preview = rail.getByRole("img", { name: "pixel.png", exact: true });
  const previewUrl = await preview.getAttribute("src");
  await expect
    .poll(() =>
      preview.evaluate((element) => (element as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  expect((await rail.boundingBox())!.height).toBeLessThanOrEqual(112);
  await root
    .getByRole("button", { name: "Remove pixel.png", exact: true })
    .click();
  await expect(preview).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(
        (url) =>
          (
            window as unknown as { revokedComposerUrls: string[] }
          ).revokedComposerUrls.includes(url!),
        previewUrl,
      ),
    )
    .toBe(true);
  await root
    .getByRole("button", { name: "Remove second.png", exact: true })
    .click();
  await root
    .getByRole("button", { name: "Remove third.png", exact: true })
    .click();
  await picker.setInputFiles([
    image,
    {
      name: "notes.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("Notes"),
    },
  ]);
  await expect(root.getByText("Ready", { exact: true })).toHaveCount(2);
  await expect(root.locator(".chat-composer-thumbnails")).toHaveCount(0);
  await expect(root.getByText("notes.txt", { exact: true })).toBeVisible();
  await expect(
    root.getByRole("button", { name: "Remove notes.txt", exact: true }),
  ).toBeVisible();
});

test("compact controls and native menu remain bounded across themes, directions and narrow widths", async ({
  page,
}) => {
  const root = await demo(page);
  for (const width of [1440, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const theme of ["sunshine", "moonlight"]) {
      await page.evaluate(
        (value) => document.documentElement.setAttribute("data-theme", value),
        theme,
      );
      for (const direction of ["ltr", "rtl"]) {
        await root.evaluate(
          (element, value) => element.setAttribute("dir", value),
          direction,
        );
        await root.getByRole("textbox").fill("Draft");
        const shell = root.locator(".chat-composer");
        // Center the example clear of the documentation's sticky header.
        await shell.evaluate((element) =>
          element.scrollIntoView({ block: "center", behavior: "instant" }),
        );
        const bounds = await shell.boundingBox();
        expect(bounds!.x).toBeGreaterThanOrEqual(0);
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
        expect(
          await shell.evaluate(
            (element) => element.scrollWidth <= element.clientWidth + 1,
          ),
        ).toBe(true);
        const buttons = root.locator(
          ".chat-composer-toolbar-compact button:visible",
        );
        const positions = await buttons.evaluateAll((elements) =>
          elements.map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              x: rect.x,
              y: rect.y,
              end: rect.right,
              height: rect.height,
            };
          }),
        );
        expect(
          Math.max(...positions.map((rect) => rect.y)) -
            Math.min(...positions.map((rect) => rect.y)),
        ).toBeLessThanOrEqual(8);
        const ordered = positions.toSorted((a, b) => a.x - b.x);
        for (let index = 1; index < ordered.length; index++)
          expect(ordered[index].x).toBeGreaterThanOrEqual(
            ordered[index - 1].end - 1,
          );
        const trigger = root.getByRole("button", { name: /^Model settings:/ });
        await trigger.click();
        const menu = root.getByRole("group", {
          name: "Composer model settings",
        });
        await expect(menu).toBeVisible();
        const menuBounds = (await menu.boundingBox())!;
        expect(menuBounds.x).toBeGreaterThanOrEqual(0);
        expect(menuBounds.x + menuBounds.width).toBeLessThanOrEqual(width + 1);
        expect(menuBounds.y).toBeGreaterThanOrEqual(0);
        expect(menuBounds.y + menuBounds.height).toBeLessThanOrEqual(1001);
        await page.keyboard.press("Escape");
        await expect(menu).toBeHidden();
      }
      const audit = await new AxeBuilder({ page })
        .include("[data-chat-compact-demo]")
        .analyze();
      expect(
        audit.violations,
        `${width}px ${theme} compact accessibility`,
      ).toEqual([]);
    }
  }
});
