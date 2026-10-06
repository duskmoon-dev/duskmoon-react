import { expect, test } from "@playwright/test";

const baseUrl = process.env.DOCS_TEST_URL ?? "http://127.0.0.1:4334";
const hydratedDemo =
  'astro-island[component-export="JsonSchemaFormDemo"]:not([ssr])';

for (const [preset, name, property] of [
  ["checkbox", "Receive updates", "updates"],
  ["boolean", "Notifications", "notifications"],
] as const) {
  test(`${preset} has one inline clickable label and submits booleans in both phone themes`, async ({
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
    const checkbox = preview.getByRole("checkbox", { name, exact: true });
    const inline = preview.locator("label.checkbox-wrapper .checkbox-text");
    for (const theme of ["light", "dark"]) {
      await expect(checkbox).not.toBeChecked();
      await expect(inline).toHaveText(name);
      await expect(preview.getByText(name, { exact: true })).toHaveCount(1);
      await expect(preview.locator(".form-item-label")).toHaveCount(0);
      await expect(preview.locator("label label")).toHaveCount(0);
      const geometry = await inline.evaluate((element) => {
        const label = element.getBoundingClientRect();
        const input = element
          .closest("label")!
          .querySelector("input")!
          .getBoundingClientRect();
        return {
          inputRight: input.right,
          labelLeft: label.left,
          centerDifference: Math.abs(
            (input.top + input.bottom) / 2 - (label.top + label.bottom) / 2,
          ),
        };
      });
      expect(geometry.labelLeft).toBeGreaterThanOrEqual(geometry.inputRight);
      expect(geometry.centerDifference).toBeLessThanOrEqual(3);
      await inline.click();
      await expect(checkbox).toBeChecked();
      await preview
        .getByRole("button", { name: "Submit", exact: true })
        .click();
      const output = page.getByLabel("Submitted JSON", { exact: true });
      expect(JSON.parse((await output.textContent())!)).toEqual({
        [property]: true,
      });
      await preview
        .getByRole("button", { name: "Reset form", exact: true })
        .click();
      await expect(checkbox).not.toBeChecked();
      if (preset === "checkbox") {
        await expect(preview.locator(".form-item-required")).toHaveCount(1);
        const marker = inline.locator('.schema-required[aria-hidden="true"]');
        await expect(marker).toHaveCount(1);
        expect(
          await marker.evaluate(
            (element) => getComputedStyle(element, "::before").content,
          ),
        ).toContain("*");
      }
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
        .toBeLessThanOrEqual(390);
      if (theme === "light")
        await page.getByRole("button", { name: "Light", exact: true }).click();
    }
  });
}

test("inline acceptance label keeps help, validation errors, focus, and reset", async ({
  page,
}) => {
  await page.goto(`${baseUrl}/utilities/form/checkbox/`, {
    waitUntil: "domcontentloaded",
  });
  await expect(page.locator(hydratedDemo)).toBeAttached();
  await page.getByRole("textbox", { name: "JSON Schema", exact: true }).fill(
    JSON.stringify({
      type: "object",
      properties: {
        accepted: {
          type: "boolean",
          title: "Accept terms",
          "x-widget": "checkbox",
          enum: [true],
          default: false,
          description: "Accept to continue",
        },
      },
      required: ["accepted"],
    }),
  );
  await page
    .getByRole("button", { name: "Generate form", exact: true })
    .click();
  const preview = page.getByRole("region", { name: "Generated form preview" });
  const checkbox = preview.getByRole("checkbox", {
    name: "Accept terms",
    exact: true,
  });
  await preview.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(checkbox).toBeFocused();
  await expect(checkbox).toHaveAttribute("aria-invalid", "true");
  const help = preview.getByText("Accept to continue", { exact: true });
  const error = preview.getByRole("alert");
  await expect(checkbox).toHaveAttribute(
    "aria-describedby",
    `${await help.getAttribute("id")} ${await error.getAttribute("id")}`,
  );
  await preview.locator("label.checkbox-wrapper .checkbox-text").click();
  await expect(checkbox).toBeChecked();
  await expect(checkbox).toHaveAttribute("aria-invalid", "false");
  await preview.getByRole("button", { name: "Submit", exact: true }).click();
  expect(
    JSON.parse(
      (await page.getByLabel("Submitted JSON", { exact: true }).textContent())!,
    ),
  ).toEqual({ accepted: true });
  await preview
    .getByRole("button", { name: "Reset form", exact: true })
    .click();
  await expect(checkbox).not.toBeChecked();
});
