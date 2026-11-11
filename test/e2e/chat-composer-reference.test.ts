import { test, expect, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  openAdd,
  openControls,
  closeMenus,
  demoAction,
  openModel,
  chooseModel,
  settingsStatus,
} from "./chat-demo.helpers";

const base = process.env.DOCS_TEST_URL ?? "http://127.0.0.1:4334";
async function demo(page: Page) {
  await page.goto(`${base}/components/chat-authoritative-queue`);
  const root = page.locator(
    'astro-island:not([ssr]) [data-chat-session-demo="rich"]',
  );
  await expect(root.getByRole("textbox")).toBeEditable();
  await expect(
    root.getByRole("button", { name: "Save draft", includeHidden: true }),
  ).toBeEnabled();
  return root;
}
async function height(root: Locator) {
  return (await root.locator(".chat-composer").boundingBox())!.height;
}

test("reference hierarchy stays at one footer after saving, running and adding a ready image", async ({
  page,
}) => {
  const root = await demo(page);
  const initial = await height(root);
  await expect(root.getByRole("button")).toHaveCount(4);
  await expect(root.getByRole("button", { name: "Save draft" })).toHaveCount(0);
  await expect(root.locator(".chat-composer-toolbar-compact")).toHaveCount(1);
  for (const button of await root.getByRole("button").all()) {
    expect(
      await button.evaluate((element) =>
        Boolean(element.closest(".chat-composer-toolbar-compact")),
      ),
    ).toBe(true);
  }
  const add = root.getByRole("button", {
    name: "Add files and more",
    exact: true,
  });
  await add.focus();
  await add.press("Enter");
  await page.keyboard.press("Tab");
  await expect(
    root.getByRole("button", { name: "Files", exact: true }),
  ).toBeFocused();
  await root.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(
    root.getByText("Draft saved by host storage.", { exact: true }),
  ).toHaveClass("sr-only");
  await expect(
    root.getByRole("group", { name: "Add files and more", exact: true }),
  ).toBeHidden();
  expect(await height(root)).toBe(initial);
  await expect(root.getByRole("textbox")).toContainText(
    "Review the latest changes.",
  );
  await openAdd(root);
  await root.getByRole("button", { name: "Reload stored draft" }).click();
  await expect(root.getByRole("textbox")).toContainText(
    "Review the latest changes.",
  );
  expect(await height(root)).toBe(initial);
  await demoAction(root, "Start demo turn");
  await expect(
    root.getByRole("button", { name: "Send follow-up", exact: true }),
  ).toBeVisible();
  await expect(
    root.getByRole("button", { name: "Stop", exact: true }),
  ).toHaveCount(0);
  await root.getByRole("textbox").fill("");
  await expect(
    root.getByRole("button", { name: "Stop", exact: true }),
  ).toBeVisible();
  await expect(
    root.getByRole("button", { name: "Send follow-up", exact: true }),
  ).toHaveCount(0);
  expect(await height(root)).toBe(initial);
  await root.getByRole("button", { name: "Stop", exact: true }).click();
  await expect(
    root.getByRole("status").filter({ hasText: /^Host:/ }),
  ).toContainText("Host: idle");
  const controls = await openControls(root);
  await controls.getByLabel("Fail first preparation").uncheck();
  await closeMenus(root);
  await openAdd(root);
  const chooser = page.waitForEvent("filechooser");
  await root.getByRole("button", { name: "Files", exact: true }).click();
  await (
    await chooser
  ).setFiles({
    name: "reference.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  const rail = root.locator(".chat-composer-thumbnails");
  await expect(rail.getByRole("img", { name: "reference.png" })).toBeVisible();
  const image = (await rail.boundingBox())!;
  expect(image.y + image.height).toBeLessThanOrEqual(
    (await root.getByRole("textbox").boundingBox())!.y,
  );
  await expect(root.locator(".chat-composer-toolbar-compact")).toHaveCount(1);
  await root.getByRole("button", { name: "Remove reference.png" }).click();
  expect(await height(root)).toBe(initial);
});

test("reference permission, effort and model menus apply only acknowledged host values", async ({
  page,
}) => {
  const root = await demo(page);
  await root.getByRole("button", { name: /^Approval mode:/ }).click();
  await root.getByRole("button", { name: /^Full access/ }).click();
  await expect(root.locator(".chat-composer-menu:popover-open")).toHaveCount(0);
  await expect(settingsStatus(root)).toContainText("Change pending");
  await expect(
    root.getByRole("button", { name: /^Approval mode:/ }),
  ).toHaveAccessibleName("Approval mode: Ask for approval");
  await expect(
    root.getByRole("button", { name: /^Approval mode:/ }),
  ).toHaveAccessibleName("Approval mode: Full access");
  await root.getByRole("button", { name: /^Approval mode:/ }).click();
  await expect(
    root.getByRole("button", { name: /^Full access/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await closeMenus(root);
  const model = root.getByRole("button", { name: /^Model settings:/ });
  const settings = await openModel(root);
  const effort = settings.getByRole("slider", { name: "Reasoning effort" });
  await effort.focus();
  await page.keyboard.down("End");
  await expect(effort).toHaveAttribute("aria-valuetext", "Max");
  await expect(model).toHaveAccessibleName(
    "Model settings: Standard demo model, Medium",
  );
  await page.keyboard.up("End");
  await expect(settings).toBeHidden();
  await expect(settingsStatus(root)).toContainText("Change pending");
  await expect(model).toHaveAccessibleName(
    "Model settings: Standard demo model, Max",
  );
  await expect(model).toBeFocused();
  await openModel(root);
  await expect(effort).toHaveAttribute("aria-valuetext", "Max");
  await settings
    .getByRole("button", { name: "Reset reasoning effort" })
    .click();
  await expect(settings).toBeHidden();
  await expect(model).toHaveAccessibleName(
    "Model settings: Standard demo model, Medium",
  );
  await chooseModel(root, "Fast demo model");
  await expect(model).toHaveAccessibleName(
    "Model settings: Standard demo model, Medium",
  );
  await expect(model).toHaveAccessibleName(
    "Model settings: Fast demo model, Medium",
  );
  await chooseModel(root, "Restricted model (host rejects)");
  await expect(settingsStatus(root)).toContainText(
    "Demo host declined this model",
  );
  await expect(model).toHaveAccessibleName(
    "Model settings: Fast demo model, Medium",
  );
  await closeMenus(root);
  await expect(model).toBeFocused();
});

test("secondary demo controls and help are reachable through the Add menu", async ({
  page,
}) => {
  const root = await demo(page);
  const controls = await openControls(root);
  await controls.getByLabel("Admission outcome").selectOption("reject");
  await closeMenus(root);
  await root.getByRole("textbox").press("Control+Enter");
  await expect(root.getByRole("alert")).toContainText(
    "Demo host rejected this request",
  );
  await expect(root.getByRole("textbox")).toContainText(
    "Review the latest changes.",
  );
  await openAdd(root);
  const trigger = root.getByRole("button", {
    name: "Composer help",
    exact: true,
  });
  await trigger.focus();
  await trigger.press("Enter");
  const help = root.getByRole("group", { name: "Composer help", exact: true });
  await expect(help).toContainText("Cmd/Ctrl+Enter sends");
  await page.keyboard.press("Escape");
  await expect(help).toBeHidden();
  await expect(trigger).toBeFocused();
  await root
    .getByRole("button", { name: "Inspect demo state", exact: true })
    .click();
  await expect(
    root.getByRole("log", { name: "Demo host events" }),
  ).toContainText("Request rejected; draft retained");
  await closeMenus(root);
  await expect(
    root.getByRole("button", { name: "Add files and more", exact: true }),
  ).toBeFocused();
});

test("reference footer and menus fit mobile, desktop, both directions and themes", async ({
  page,
}) => {
  test.setTimeout(120_000);
  const root = await demo(page);
  for (const width of [320, 390, 1440]) {
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
        expect(
          await root.evaluate(
            (element) => element.scrollWidth <= element.clientWidth,
          ),
        ).toBe(true);
        const positions = await root
          .getByRole("button")
          .evaluateAll((elements) =>
            elements.map((element) => element.getBoundingClientRect().y),
          );
        expect(
          Math.max(...positions) - Math.min(...positions),
        ).toBeLessThanOrEqual(8);
        // Keep the original editor/footer height budget independent of the
        // newly attached composer context bar.
        const context = root.locator(".chat-composer-context");
        await expect(context).toBeVisible();
        expect(
          (await height(root)) - (await context.boundingBox())!.height,
        ).toBeLessThan(150);
        for (const name of [
          "Add files and more",
          "Approval mode",
          "Composer model settings",
          "Choose a model",
        ]) {
          if (name === "Add files and more") await openAdd(root);
          else if (name === "Approval mode")
            await root.getByRole("button", { name: /^Approval mode:/ }).click();
          else if (name === "Composer model settings") await openModel(root);
          else {
            await openModel(root);
            await root
              .getByRole("button", { name: /^Choose a model:/ })
              .click();
          }
          const panel = root.getByRole("group", { name, exact: true });
          await expect(panel).toBeVisible();
          await panel.evaluate(async (element) => {
            await Promise.allSettled(
              element.getAnimations().map((animation) => animation.finished),
            );
          });
          const rect = (await panel.boundingBox())!;
          expect(rect.x).toBeGreaterThanOrEqual(0);
          expect(rect.x + rect.width).toBeLessThanOrEqual(width + 1);
          expect(rect.y).toBeGreaterThanOrEqual(0);
          expect(rect.y + rect.height).toBeLessThanOrEqual(1001);
          expect(
            (
              await new AxeBuilder({ page })
                .include('[data-chat-session-demo="rich"]')
                .analyze()
            ).violations,
          ).toEqual([]);
          await closeMenus(root);
        }
      }
  }
});
