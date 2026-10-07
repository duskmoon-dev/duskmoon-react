import { expect, test } from "@playwright/test";

const baseUrl = process.env.DOCS_TEST_URL ?? "http://127.0.0.1:4334";
const hydratedDemo =
  'astro-island[component-export="JsonSchemaFormDemo"]:not([ssr])';

test("generates, validates, and submits the profile example", async ({
  page,
}) => {
  await page.goto(`${baseUrl}/utilities/form/`);
  await expect(page.locator(hydratedDemo)).toBeAttached();
  const preview = page.getByRole("region", { name: "Generated form preview" });
  const output = page.locator('pre[aria-label="Submitted JSON"]');

  await expect(preview.getByLabel("Name")).toBeVisible();
  await expect(preview.getByLabel("Age")).toBeVisible();
  await preview.getByLabel("Name").fill("A");
  await preview.getByLabel("Age").fill("37");
  await preview.getByRole("button", { name: "Submit" }).click();
  await expect(preview.getByRole("alert")).toBeVisible();
  await expect(output).toContainText("Submit the form");

  await preview.getByLabel("Name").fill("Ada");
  await preview.getByRole("button", { name: "Submit" }).click();
  await expect(output).toContainText('"name": "Ada"');
  await expect(output).toContainText('"age": 37');
  await expect(output).toContainText('"role": "viewer"');
  await expect(output).toContainText('"active": true');

  await preview.getByRole("button", { name: "Reset form" }).click();
  await expect(output).toContainText("Submit the form");
});

test("edits schema, handles invalid JSON, and offers nested and array examples", async ({
  page,
}) => {
  await page.goto(`${baseUrl}/utilities/form/`);
  await expect(page.locator(hydratedDemo)).toBeAttached();
  const source = page.getByRole("textbox", { name: "JSON Schema" });
  const preview = page.getByRole("region", { name: "Generated form preview" });
  const output = page.locator('pre[aria-label="Submitted JSON"]');

  await source.fill(
    '{"type":"object","properties":{"city":{"type":"string","title":"City"}},"required":["city"]}',
  );
  await page.getByRole("button", { name: "Generate form" }).click();
  await expect(preview.getByLabel("City")).toBeVisible();
  await preview.getByLabel("City").fill("Paris");
  await preview.getByRole("button", { name: "Submit" }).click();
  await expect(output).toContainText('"city": "Paris"');

  await source.fill("{invalid");
  await page.getByRole("button", { name: "Generate form" }).click();
  await expect(
    page.getByRole("region", { name: "Schema editor" }).getByRole("alert"),
  ).toBeVisible();

  await page.getByLabel("Example schema").selectOption("Nested object");
  await expect(preview.getByLabel("Email")).toBeVisible();
  await page.getByLabel("Example schema").selectOption("Array");
  await expect(preview.getByRole("button", { name: "Add Tags" })).toBeVisible();
});

test("JSON Schema form fits a phone viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/utilities/form/`);
  await expect(page.locator(hydratedDemo)).toBeAttached();
  await expect(
    page.getByRole("textbox", { name: "JSON Schema" }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Generated form preview" }),
  ).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(390);
});

test("direct preset pages hydrate their schema and clear submitted state when switching", async ({
  page,
}) => {
  const presets = [
    ["profile", "Profile", "Name"],
    ["string", "String", "Display name"],
    ["number", "Number", "Amount"],
    ["integer", "Integer", "Quantity"],
    ["boolean", "Boolean", "Notifications"],
    ["enum", "Enum", "Color"],
    ["object", "Nested object", "Email"],
    ["array", "Array", "Add Tags"],
  ] as const;
  for (const [id, title, field] of presets) {
    await page.goto(`${baseUrl}/utilities/form/${id}/`);
    await expect(page.locator(hydratedDemo)).toBeAttached();
    await expect(page.getByLabel("Example schema")).toHaveValue(title);
    await expect(
      page.locator('[data-doc-nav-entry][aria-current="page"]'),
    ).toHaveText(title);
    const preview = page.getByRole("region", {
      name: "Generated form preview",
    });
    if (id === "array")
      await expect(preview.getByRole("button", { name: field })).toBeVisible();
    else await expect(preview.getByLabel(field)).toBeVisible();
    await page.reload();
    await expect(page.locator(hydratedDemo)).toBeAttached();
    await expect(page.getByLabel("Example schema")).toHaveValue(title);
  }

  await page.goto(`${baseUrl}/utilities/form/boolean/`);
  await expect(page.locator(hydratedDemo)).toBeAttached();
  const preview = page.getByRole("region", { name: "Generated form preview" });
  const output = page.locator('pre[aria-label="Submitted JSON"]');
  await preview.getByRole("button", { name: "Submit" }).click();
  await expect(output).toContainText('"notifications": false');
  await page.getByLabel("Example schema").selectOption("Profile");
  await expect(output).toContainText("Submit the form");
  await expect(preview.getByLabel("Name")).toBeVisible();
  await expect(preview.getByLabel("Notifications")).toHaveCount(0);
});

test("switch and choice groups support keyboard edits, typed submissions, validation, and reset", async ({
  page,
}) => {
  await page.goto(`${baseUrl}/utilities/form/`);
  await expect(page.locator(hydratedDemo)).toBeAttached();
  const source = page.getByRole("textbox", { name: "JSON Schema" });
  const preview = page.getByRole("region", { name: "Generated form preview" });
  const output = page.locator('pre[aria-label="Submitted JSON"]');
  await source.fill(
    JSON.stringify({
      type: "object",
      properties: {
        enabled: {
          type: "boolean",
          title: "Enabled",
          "x-widget": "switch",
          default: true,
        },
        priority: {
          type: "number",
          title: "Priority",
          "x-widget": "radio-group",
          enum: [0, 1.5],
          default: 0,
        },
        flags: {
          type: "array",
          title: "Flags",
          "x-widget": "checkbox-group",
          uniqueItems: true,
          minItems: 1,
          items: { type: "boolean", enum: [false, true] },
          default: [false],
        },
      },
    }),
  );
  await page.getByRole("button", { name: "Generate form" }).click();
  const enabled = preview.getByRole("switch", { name: "Enabled" });
  await enabled.focus();
  await page.keyboard.press("Space");
  await expect(enabled).not.toBeChecked();
  const zero = preview.getByRole("radio", { name: "0", exact: true });
  await zero.focus();
  await page.keyboard.press("ArrowDown");
  await expect(preview.getByRole("radio", { name: "1.5" })).toBeChecked();
  await preview.getByRole("checkbox", { name: "true", exact: true }).focus();
  await page.keyboard.press("Space");
  await preview.getByRole("button", { name: "Submit" }).click();
  await expect(output).toContainText('"enabled": false');
  await expect(output).toContainText('"priority": 1.5');
  expect(JSON.parse((await output.textContent())!)).toEqual({
    enabled: false,
    priority: 1.5,
    flags: [false, true],
  });
  await preview.getByRole("checkbox", { name: "false", exact: true }).uncheck();
  await preview.getByRole("checkbox", { name: "true", exact: true }).uncheck();
  await preview.getByRole("button", { name: "Submit" }).click();
  const firstCheckbox = preview.getByRole("checkbox", {
    name: "false",
    exact: true,
  });
  await expect(firstCheckbox).toBeFocused();
  await expect(firstCheckbox).toHaveAttribute("aria-invalid", "true");
  await expect(preview.getByRole("alert")).toContainText("fewer than 1");
  await preview.getByRole("button", { name: "Reset form" }).click();
  await expect(enabled).toBeChecked();
  await expect(zero).toBeChecked();
  await expect(firstCheckbox).toBeChecked();
  await expect(output).toContainText("Submit the form");
});
