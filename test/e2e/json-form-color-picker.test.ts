import { expect, test } from "@playwright/test";

const baseUrl = process.env.DOCS_TEST_URL ?? "http://127.0.0.1:4334";
const hydratedDemo =
  'astro-island[component-export="JsonSchemaFormDemo"]:not([ssr])';

test.use({ hasTouch: true });

for (const viewport of [
  { name: "desktop", width: 1280, height: 900 },
  { name: "phone", width: 390, height: 844 },
]) {
  for (const theme of ["sunshine", "moonlight"]) {
    test(`visual color selection submits and resets on ${viewport.name} in ${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto(`${baseUrl}/utilities/form/color-picker/`, {
        waitUntil: "domcontentloaded",
      });
      await expect(page.locator(hydratedDemo)).toBeAttached();
      await page.evaluate(
        (theme) => document.documentElement.setAttribute("data-theme", theme),
        theme,
      );
      const preview = page.getByRole("region", {
        name: "Generated form preview",
      });
      const trigger = preview.getByRole("button", {
        name: "Brand color",
        exact: true,
      });
      await trigger.click();
      const panel = preview.getByRole("dialog", { name: "Choose color" });
      const area = panel.getByRole("slider", {
        name: "Saturation and brightness",
      });
      const hue = panel.getByRole("slider", { name: "Hue", exact: true });
      const input = panel.getByRole("textbox", { name: "Color value" });
      await expect(area).toBeVisible();
      await expect(hue).toBeVisible();
      await expect(input).toHaveValue("#2563eb");
      const panelBox = (await panel.boundingBox())!;
      expect(panelBox.x).toBeGreaterThanOrEqual(0);
      expect(panelBox.x + panelBox.width).toBeLessThanOrEqual(
        viewport.width + 1,
      );
      await hue.focus();
      await hue.press("Home");
      await area.scrollIntoViewIfNeeded();
      const bounds = (await area.boundingBox())!;
      expect(bounds.width).toBeGreaterThan(120);
      expect(bounds.height).toBeGreaterThan(100);
      expect(
        await area.evaluate(
          (element) => getComputedStyle(element).backgroundImage,
        ),
      ).toContain("linear-gradient");

      const x = bounds.x + bounds.width / 2;
      const y = bounds.y + bounds.height / 2;
      if (viewport.name === "phone") {
        await page.touchscreen.tap(x, y);
      } else {
        await page.mouse.move(x, y);
        await page.mouse.down();
        // Pointer capture keeps selection active beyond the plane bounds.
        await page.mouse.move(bounds.x + bounds.width + 15, bounds.y - 10);
        await expect(input).toHaveValue("#ff0000");
        await page.mouse.move(x, y);
        await page.mouse.up();
      }
      await expect(input).toHaveValue("#804040");
      await area.focus();
      await area.press("ArrowRight");
      await expect(input).toHaveValue("#803f3f");
      await hue.focus();
      await hue.press("ArrowRight");
      const selected = await input.inputValue();
      expect(selected).toMatch(/^#[0-9a-f]{6}$/);
      expect(selected).not.toBe("#803f3f");
      await expect(
        preview.getByRole("combobox", { name: "Color format" }),
      ).toHaveValue("hex");
      await hue.press("Escape");
      await expect(panel).toHaveCount(0);
      await expect(trigger).toBeFocused();
      await preview
        .getByRole("button", { name: "Submit", exact: true })
        .click();
      const output = page.getByRole("region", { name: "Submitted output" });
      await expect(output).toContainText(selected);
      expect(JSON.parse((await output.locator("pre").textContent())!)).toEqual({
        brandColor: selected,
      });
      await preview
        .getByRole("button", { name: "Reset form", exact: true })
        .click();
      await trigger.click();
      await expect(input).toHaveValue("#2563eb");
      await page
        .getByRole("heading", { name: "ColorPicker JSON Form", exact: true })
        .click();
      await expect(panel).toHaveCount(0);
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
        .toBeLessThanOrEqual(viewport.width);
    });
  }
}

test("invalid color candidates remain editable and fail schema submission until corrected", async ({
  page,
}) => {
  await page.goto(`${baseUrl}/utilities/form/color-picker/`, {
    waitUntil: "domcontentloaded",
  });
  await expect(page.locator(hydratedDemo)).toBeAttached();
  const preview = page.getByRole("region", { name: "Generated form preview" });
  await preview
    .getByRole("button", { name: "Brand color", exact: true })
    .click();
  const input = preview.getByRole("textbox", { name: "Color value" });
  await input.fill("#oops");
  await expect(input).toHaveValue("#oops");
  await input.press("Escape");
  await preview.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(preview.getByRole("alert")).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Submitted output" }),
  ).not.toContainText("#oops");
  await preview
    .getByRole("button", { name: "Brand color", exact: true })
    .click();
  await expect(input).toHaveValue("#oops");
  await input.fill("#00ff00");
  await input.press("Escape");
  await preview.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "Submitted output" }),
  ).toContainText("#00ff00");
});
