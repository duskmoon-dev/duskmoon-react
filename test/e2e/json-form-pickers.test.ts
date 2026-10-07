import { expect, test } from "@playwright/test";

const baseUrl = process.env.DOCS_TEST_URL ?? "http://127.0.0.1:4334";
const hydratedDemo =
  'astro-island[component-export="JsonSchemaFormDemo"]:not([ssr])';

for (const [preset, field, initial, selected] of [
  ["date-picker", "Due date", "2026-10-12", "2026-10-15"],
  ["dm-date-picker", "Start date", "2026-10-20", "2026-10-15"],
] as const) {
  test(`${preset} calendar selects, clears, closes, and resets in the generated form`, async ({
    page,
  }) => {
    await page.goto(`${baseUrl}/utilities/form/${preset}/`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.locator(hydratedDemo)).toBeAttached();
    const preview = page.getByRole("region", {
      name: "Generated form preview",
    });
    const input = preview.getByLabel(field, { exact: true });
    await preview.getByRole("button", { name: "Open date picker" }).click();
    await expect(
      preview.getByRole("dialog", { name: "Choose date" }),
    ).toBeVisible();
    await preview.getByRole("button", { name: selected, exact: true }).click();
    await expect(input).toHaveValue(selected);
    await expect(preview.getByRole("dialog")).toHaveCount(0);
    await preview.getByRole("button", { name: "Submit", exact: true }).click();
    await expect(
      page.getByRole("region", { name: "Submitted output" }),
    ).toContainText(selected);
    await input.click();
    await expect(preview.getByRole("dialog")).toBeVisible();
    await input.press("Escape");
    await expect(preview.getByRole("dialog")).toHaveCount(0);
    await preview
      .getByRole("button", { name: "Clear date", exact: true })
      .click();
    await expect(input).toHaveValue("");
    await preview
      .getByRole("button", { name: "Reset form", exact: true })
      .click();
    await expect(input).toHaveValue(initial);
    await expect(preview.getByRole("dialog")).toHaveCount(0);
  });
}

test("time columns select typed local values and keep manual partial input editable", async ({
  page,
}) => {
  await page.goto(`${baseUrl}/utilities/form/time-picker/`, {
    waitUntil: "domcontentloaded",
  });
  await expect(page.locator(hydratedDemo)).toBeAttached();
  const preview = page.getByRole("region", { name: "Generated form preview" });
  const input = preview.getByRole("textbox", {
    name: "Meeting time",
    exact: true,
  });
  await preview.getByRole("button", { name: "Open time picker" }).click();
  await expect(
    preview.getByRole("dialog", { name: "Choose time" }),
  ).toBeVisible();
  await preview.getByRole("option", { name: "Hour 10", exact: true }).click();
  await preview.getByRole("option", { name: "Minute 35", exact: true }).click();
  await preview.getByRole("option", { name: "Second 45", exact: true }).click();
  await preview.getByRole("button", { name: "Done", exact: true }).click();
  await expect(input).toHaveValue("10:35:45");
  await expect(preview.getByRole("dialog")).toHaveCount(0);
  await preview.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "Submitted output" }),
  ).toContainText("10:35:45");
  await input.fill("12:3");
  await expect(input).toHaveValue("12:3");
  await input.press("Escape");
  await expect(preview.getByRole("dialog")).toHaveCount(0);
  await preview
    .getByRole("button", { name: "Reset form", exact: true })
    .click();
  await expect(input).toHaveValue("09:30:00");
});

for (const preset of ["date-picker", "time-picker"] as const) {
  test(`${preset} dropdown fits a phone in both themes and closes outside`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseUrl}/utilities/form/${preset}/`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.locator(hydratedDemo)).toBeAttached();
    const preview = page.getByRole("region", {
      name: "Generated form preview",
    });
    const trigger = preview.getByRole("button", {
      name: preset === "date-picker" ? "Open date picker" : "Open time picker",
    });
    for (const theme of ["light", "dark"]) {
      await trigger.click();
      const dialog = preview.getByRole("dialog");
      await expect(dialog).toBeVisible();
      const bounds = await dialog.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
        .toBeLessThanOrEqual(390);
      await page
        .getByRole("textbox", { name: "JSON Schema", exact: true })
        .click();
      await expect(dialog).toHaveCount(0);
      if (theme === "light")
        await page.getByRole("button", { name: "Light", exact: true }).click();
    }
  });
}

for (const [preset, field, initial] of [
  ["date-picker", "Due date", "2026-10-12"],
  ["dm-date-picker", "Start date", "2026-10-20"],
] as const) {
  test(`${preset} year browsing preserves the value and uses edge navigation icons on phones`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseUrl}/utilities/form/${preset}/`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.locator(hydratedDemo)).toBeAttached();
    const preview = page.getByRole("region", {
      name: "Generated form preview",
    });
    const input = preview.getByLabel(field, { exact: true });
    const output = page.getByLabel("Submitted JSON", { exact: true });
    for (const theme of ["light", "dark"]) {
      const originalOutput = await output.textContent();
      await preview.getByRole("button", { name: "Open date picker" }).click();
      const dialog = preview.getByRole("dialog", { name: "Choose date" });
      await dialog.getByRole("button", { name: "Year", exact: true }).click();
      await expect(dialog.locator(".calendar-month-grid")).toBeVisible();
      await expect(
        dialog.getByRole("button", { name: "Year", exact: true }),
      ).toHaveAttribute("aria-pressed", "true");
      await dialog
        .getByRole("button", { name: "Next panel", exact: true })
        .click();
      await expect(dialog.locator(".calendar-title")).toHaveText("2027");
      const header = dialog.locator(".calendar-header");
      const geometry = await header.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        const previous = element.querySelector(
          '[aria-label="Previous panel"]',
        )!;
        const next = element.querySelector('[aria-label="Next panel"]')!;
        const center = element
          .querySelector(".calendar-controls")!
          .getBoundingClientRect();
        const previousBounds = previous.getBoundingClientRect();
        const nextBounds = next.getBoundingClientRect();
        return {
          leftGap: previousBounds.left - bounds.left,
          rightGap: bounds.right - nextBounds.right,
          previousRight: previousBounds.right,
          centerLeft: center.left,
          centerRight: center.right,
          nextLeft: nextBounds.left,
          previousText: previous.textContent,
          nextText: next.textContent,
          iconCount: element.querySelectorAll(
            '.calendar-nav > svg[aria-hidden="true"]',
          ).length,
        };
      });
      expect(geometry.leftGap).toBeLessThanOrEqual(12);
      expect(geometry.rightGap).toBeLessThanOrEqual(12);
      expect(geometry.previousRight).toBeLessThanOrEqual(geometry.centerLeft);
      expect(geometry.centerRight).toBeLessThanOrEqual(geometry.nextLeft);
      expect(geometry.previousText).toBe("");
      expect(geometry.nextText).toBe("");
      expect(geometry.iconCount).toBe(2);
      await dialog
        .getByRole("button", { name: "2027-08-01", exact: true })
        .click();
      await expect(dialog.locator(".calendar-date-grid")).toBeVisible();
      await expect(dialog.locator(".calendar-title")).toHaveText("Aug 2027");
      await expect(input).toHaveValue(initial);
      await expect(output).toHaveText(originalOutput ?? "");
      await dialog
        .getByRole("button", { name: "2027-08-16", exact: true })
        .click();
      await expect(input).toHaveValue("2027-08-16");
      await expect(dialog).toHaveCount(0);
      await preview
        .getByRole("button", { name: "Submit", exact: true })
        .click();
      await expect(output).toContainText("2027-08-16");
      await preview
        .getByRole("button", { name: "Reset form", exact: true })
        .click();
      await expect(input).toHaveValue(initial);
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
        .toBeLessThanOrEqual(390);
      if (theme === "light")
        await page.getByRole("button", { name: "Light", exact: true }).click();
    }
  });
}
