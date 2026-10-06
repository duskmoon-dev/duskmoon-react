import { expect, test } from "@playwright/test";

const baseUrl = process.env.DOCS_TEST_URL ?? "http://127.0.0.1:4334";
const hydratedDemo =
  'astro-island[component-export="JsonSchemaFormDemo"]:not([ssr])';

test("generated form uses readable spacing in light and dark themes", async ({
  page,
}) => {
  await page.goto(`${baseUrl}/utilities/form/`);
  await expect(page.locator(hydratedDemo)).toBeAttached();
  const preview = page.getByRole("region", { name: "Generated form preview" });
  const editor = page.getByRole("region", { name: "Schema editor" });
  const form = preview.locator("form");
  const firstItem = form.locator(".form-item").first();
  const buttons = form.locator(".schema-form-actions button");

  await expect(form).toHaveClass(/form-vertical/);
  await expect(firstItem).toHaveClass(/form-item-required/);
  const geometry = await page.evaluate(() => {
    const get = (selector: string) =>
      document.querySelector(selector)!.getBoundingClientRect();
    return {
      editorHeight: get(".schema-editor").height,
      previewHeight: get(".schema-preview").height,
      formGap: parseFloat(
        getComputedStyle(document.querySelector(".schema-form")!).gap,
      ),
      actionGap:
        get(".schema-form-actions button:nth-child(2)").left -
        get(".schema-form-actions button:first-child").right,
      fieldsetBorder: getComputedStyle(
        document.querySelector(".schema-form > .schema-object")!,
      ).borderTopWidth,
    };
  });
  expect(geometry.previewHeight).toBeLessThan(geometry.editorHeight);
  expect(geometry.formGap).toBeGreaterThan(0);
  expect(geometry.actionGap).toBeGreaterThanOrEqual(8);
  expect(geometry.fieldsetBorder).toBe("0px");

  const name = preview.getByRole("textbox", { name: "Name" });
  await buttons.first().click();
  await expect(name).toBeFocused();
  await expect(name).toHaveAttribute("aria-invalid", "true");
  const errorId = (await name.getAttribute("aria-describedby"))!
    .split(" ")
    .at(-1)!;
  await expect(page.locator(`[id="${errorId}"]`)).toHaveAttribute(
    "role",
    "alert",
  );

  const lightSurface = await preview.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  await page.getByRole("button", { name: "Light" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "moonlight");
  const darkSurface = await preview.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  expect(darkSurface).not.toBe(lightSurface);
  await expect(
    editor.getByRole("textbox", { name: "JSON Schema" }),
  ).toBeVisible();
});

test("nested groups and array controls fit a phone viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/utilities/form/`);
  await expect(page.locator(hydratedDemo)).toBeAttached();
  const source = page.getByRole("textbox", { name: "JSON Schema" });
  const preview = page.getByRole("region", { name: "Generated form preview" });
  await source.fill(
    JSON.stringify({
      type: "object",
      properties: {
        contact: {
          type: "object",
          title: "Contact",
          properties: {
            email: { type: "string", title: "Email" },
          },
        },
        tags: { type: "array", title: "Tags", items: { type: "string" } },
      },
    }),
  );
  await page.getByRole("button", { name: "Generate form" }).click();
  await preview.getByRole("button", { name: "Add Tags" }).click();
  await expect(preview.getByRole("group", { name: "Contact" })).toBeVisible();
  await expect(preview.getByRole("group", { name: "Tags" })).toBeVisible();
  await expect(preview.getByRole("textbox", { name: "Tags 1" })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(390);
});

test("array editor stays at its content height as preview rows grow", async ({
  page,
}) => {
  await page.goto(`${baseUrl}/utilities/form/array/`);
  await expect(page.locator(hydratedDemo)).toBeAttached();
  const preview = page.getByRole("region", { name: "Generated form preview" });
  await preview.getByRole("button", { name: "Add Tags" }).click();
  await preview.getByRole("button", { name: "Add Contacts" }).click();
  await expect(preview.getByRole("textbox", { name: "Tag" })).toBeVisible();
  await expect(preview.getByRole("textbox", { name: "Name" })).toBeVisible();
  await preview.getByRole("button", { name: "Add Tags" }).click();

  const heights = await page.evaluate(() => ({
    editor: document.querySelector(".schema-editor")!.getBoundingClientRect()
      .height,
    preview: document.querySelector(".schema-preview")!.getBoundingClientRect()
      .height,
  }));
  expect(heights.preview).toBeGreaterThan(heights.editor + 100);
});

test("switch and choice groups keep theme styling and readable spacing on phones", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/utilities/form/`);
  await expect(page.locator(hydratedDemo)).toBeAttached();
  const preview = page.getByRole("region", { name: "Generated form preview" });
  await page.getByRole("textbox", { name: "JSON Schema" }).fill(
    JSON.stringify({
      type: "object",
      properties: {
        enabled: {
          type: "boolean",
          title: "Enabled",
          "x-widget": "switch",
          enum: [true],
        },
        delivery: {
          type: "string",
          title: "Delivery",
          description: "Choose one delivery method.",
          "x-widget": "radio-group",
          enum: ["Standard delivery with tracking", "Express delivery"],
          default: "",
        },
        updates: {
          type: "array",
          title: "Updates",
          "x-widget": "checkbox-group",
          uniqueItems: true,
          items: {
            type: "string",
            enum: [
              "Product announcements and release notes",
              "Service notices",
            ],
          },
        },
      },
      required: ["delivery"],
    }),
  );
  await page.getByRole("button", { name: "Generate form" }).click();
  await expect(preview.getByRole("switch", { name: "Enabled" })).toBeVisible();
  await expect(
    preview.getByRole("radiogroup", { name: "Delivery" }),
  ).toBeVisible();
  await expect(preview.getByRole("group", { name: "Updates" })).toBeVisible();
  const geometry = await preview
    .locator(".schema-choice-group")
    .evaluateAll((groups) =>
      groups.map((group) => {
        const options = group.querySelector(".schema-choice-options")!;
        const labels = Array.from(options.children).map((label) =>
          label.getBoundingClientRect(),
        );
        return {
          optionGap: parseFloat(getComputedStyle(options).gap),
          separation: labels[1].top - labels[0].bottom,
          border: getComputedStyle(group).borderTopWidth,
        };
      }),
    );
  for (const group of geometry) {
    expect(group.optionGap).toBeGreaterThanOrEqual(8);
    expect(group.separation).toBeGreaterThanOrEqual(8);
    expect(group.border).toBe("0px");
  }
  const track = preview.locator(".switch-track");
  const initialBorder = await track.evaluate(
    (element) => getComputedStyle(element).borderColor,
  );
  await preview.getByRole("button", { name: "Submit" }).click();
  await expect(preview.getByRole("switch", { name: "Enabled" })).toBeFocused();
  await expect
    .poll(() =>
      track.evaluate((element) => getComputedStyle(element).borderColor),
    )
    .not.toBe(initialBorder);
  await preview.getByRole("switch", { name: "Enabled" }).press("Space");
  await preview.getByRole("button", { name: "Submit" }).click();
  const first = preview.getByRole("radio", {
    name: "Standard delivery with tracking",
  });
  await expect(first).toBeFocused();
  await expect(first).toHaveAttribute("aria-invalid", "true");
  const lightSurface = await preview.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  await page.getByRole("button", { name: "Light" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "moonlight");
  const darkSurface = await preview.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  expect(darkSurface).not.toBe(lightSurface);
  await expect(first).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(390);
});

for (const viewport of [
  { name: "desktop", width: 1280, height: 900 },
  { name: "phone", width: 390, height: 844 },
]) {
  for (const theme of ["sunshine", "moonlight"]) {
    test(`hierarchy searches fill their panels above the options on ${viewport.name} in ${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      for (const control of [
        {
          preset: "cascader",
          trigger: ".cascader",
          popup: ".cascader-dropdown",
          search: ".cascader-search",
          options: ".cascader-menus",
        },
        {
          preset: "tree-select",
          trigger: ".tree-select-trigger",
          popup: ".tree-select-dropdown",
          search: ".tree-select-search-input",
          options: ".tree-select-list",
        },
      ]) {
        await page.goto(`${baseUrl}/utilities/form/${control.preset}/`, {
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
        await preview.locator(control.trigger).first().click();
        const popup = preview.locator(control.popup).first();
        await expect(popup.locator(control.search)).toBeVisible();
        await expect(popup.locator(control.options)).toBeVisible();
        const geometry = await popup.evaluate((element, selectors) => {
          const search = element.querySelector(selectors.search)!;
          const options = element.querySelector(selectors.options)!;
          const panelRect = element.getBoundingClientRect();
          const searchRect = search.getBoundingClientRect();
          const optionsRect = options.getBoundingClientRect();
          const panelStyle = getComputedStyle(element);
          const searchStyle = getComputedStyle(search);
          return {
            searchTop: searchRect.top,
            searchBottom: searchRect.bottom,
            searchWidth: searchRect.width,
            expectedWidth:
              element.clientWidth -
              parseFloat(panelStyle.paddingLeft) -
              parseFloat(panelStyle.paddingRight) -
              parseFloat(searchStyle.marginLeft) -
              parseFloat(searchStyle.marginRight),
            optionsTop: optionsRect.top,
            panelTop: panelRect.top,
            panelLeft: panelRect.left,
            panelRight: panelRect.right,
          };
        }, control);
        expect(geometry.searchWidth).toBeGreaterThan(0);
        expect(
          Math.abs(geometry.searchWidth - geometry.expectedWidth),
        ).toBeLessThanOrEqual(2);
        expect(geometry.searchTop).toBeGreaterThanOrEqual(geometry.panelTop);
        expect(geometry.searchBottom).toBeLessThanOrEqual(
          geometry.optionsTop + 1,
        );
        expect(geometry.panelLeft).toBeGreaterThanOrEqual(0);
        expect(geometry.panelRight).toBeLessThanOrEqual(viewport.width + 1);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth),
        ).toBeLessThanOrEqual(viewport.width);
      }
    });
  }
}
