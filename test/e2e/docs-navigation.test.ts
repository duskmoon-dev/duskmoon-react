import { expect, test, type Page } from "@playwright/test";
import { JSON_FORM_PRESETS } from "../../packages/docs/src/lib/json-form-presets";

const baseUrl = process.env.DOCS_TEST_URL ?? "http://127.0.0.1:4334";

const sections = [
  { name: "Components", path: "/" },
  { name: "CSS Art", path: "/css-art/" },
  { name: "Theming", path: "/theming/" },
  { name: "Utilities", path: "/utilities/" },
] as const;

async function expectActivePrimaryLink(page: Page, name: string) {
  const primary = page.getByRole("navigation", { name: "Primary" });
  const currentLinks = primary.locator('a[aria-current="page"]');

  await expect(currentLinks).toHaveCount(1);
  await expect(currentLinks).toHaveText(name);
}

async function visibleCount(locator: ReturnType<Page["locator"]>) {
  return locator.evaluateAll(
    (elements) =>
      elements.filter((element) => !(element as HTMLElement).hidden).length,
  );
}

async function entryPaths(locator: ReturnType<Page["locator"]>) {
  return locator.evaluateAll((elements) =>
    elements.map((element) => (element as HTMLAnchorElement).pathname),
  );
}

test("primary navigation opens each section with its own sidebar", async ({
  page,
}) => {
  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });

  const primary = page.getByRole("navigation", { name: "Primary" });
  for (const section of sections) {
    await primary
      .getByRole("link", { name: section.name, exact: true })
      .click();
    await expect(page).toHaveURL(`${baseUrl}${section.path}`);
    await expectActivePrimaryLink(page, section.name);
    await expect(
      page.getByRole("complementary", { name: "Documentation navigation" }),
    ).toBeVisible();
    const sidebar = page.getByRole("complementary", {
      name: "Documentation navigation",
    });
    const entries = page.locator("[data-doc-nav-entry]");
    if (section.name === "Components") {
      await expect(
        page.getByRole("searchbox", { name: "Find documentation" }),
      ).toBeVisible();
      await expect(
        sidebar.getByRole("link", { name: "Button", exact: true }),
      ).toBeVisible();
      const groupTitles = await page
        .locator(".nav-group-title")
        .allTextContents();
      expect(groupTitles).not.toContain("CSS Art");
      expect(groupTitles).not.toContain("Theming & Configuration");
      expect(groupTitles).not.toContain("Utilities & Types");
    } else if (section.name === "CSS Art") {
      await expect(
        page.getByRole("searchbox", { name: "Find documentation" }),
      ).toBeVisible();
      await expect(
        sidebar.getByRole("link", { name: "ArtMoon", exact: true }),
      ).toBeVisible();
      await expect
        .poll(async () =>
          (await entryPaths(entries)).every((path) =>
            path.startsWith("/components/art-"),
          ),
        )
        .toBe(true);
    } else if (section.name === "Theming") {
      await expect(
        page.getByRole("searchbox", { name: "Find documentation" }),
      ).toBeVisible();
      await expect(
        sidebar.getByRole("link", { name: "theme", exact: true }),
      ).toBeVisible();
      expect(
        await page.locator(".nav-group-title").allTextContents(),
      ).toContain("Theming & Configuration");
      await expect(
        sidebar.getByRole("link", { name: "Button", exact: true }),
      ).toHaveCount(0);
      await expect(
        sidebar.getByRole("link", { name: "ArtMoon", exact: true }),
      ).toHaveCount(0);
      await expect(
        sidebar.getByRole("link", { name: "version", exact: true }),
      ).toHaveCount(0);
    } else if (section.name === "Utilities") {
      await expect(
        page.getByRole("searchbox", { name: "Find documentation" }),
      ).toBeVisible();
      await expect(
        sidebar.getByRole("link", { name: "version", exact: true }),
      ).toBeVisible();
      await expect(
        sidebar.getByRole("link", { name: "JSON Schema Form" }),
      ).toBeVisible();
      const jsonFormGroup = sidebar.locator("[data-doc-nav-group]").filter({
        has: page.getByText("JSON Form", { exact: true }),
      });
      await expect(jsonFormGroup.locator("[data-doc-nav-entry]")).toHaveCount(
        28,
      );
      for (const name of ["Input", "InputNumber"]) {
        await expect(
          jsonFormGroup.getByRole("link", { name, exact: true }),
        ).toHaveCount(0);
      }
      await expect(
        page.locator('[data-doc-card][data-search-text*="JSON Schema Form"]'),
      ).toBeVisible();
      expect(
        await page.locator(".nav-group-title").allTextContents(),
      ).toContain("Utilities & Types");
      await expect(
        sidebar.getByRole("link", { name: "Button", exact: true }),
      ).toHaveCount(0);
      await expect(
        sidebar.getByRole("link", { name: "ArtMoon", exact: true }),
      ).toHaveCount(0);
      await expect(
        sidebar.getByRole("link", { name: "theme", exact: true }),
      ).toHaveCount(0);
    }
  }
});

test("direct detail visits and reloads keep the matching section active", async ({
  page,
}) => {
  const detailPages = [
    { path: "/components/button", section: "Components" },
    { path: "/components/art-moon", section: "CSS Art" },
    { path: "/components/theme", section: "Theming" },
    { path: "/components/version", section: "Utilities" },
    { path: "/utilities/form/", section: "Utilities" },
  ] as const;

  for (const detail of detailPages) {
    await page.goto(`${baseUrl}${detail.path}`, {
      waitUntil: "domcontentloaded",
    });
    await expectActivePrimaryLink(page, detail.section);
    await expect(
      page.locator("[data-doc-nav-entry][aria-current='page']"),
    ).toHaveCount(1);

    await page.reload({ waitUntil: "domcontentloaded" });
    await expectActivePrimaryLink(page, detail.section);
    await expect(
      page.locator("[data-doc-nav-entry][aria-current='page']"),
    ).toHaveCount(1);
  }
});

test("utility tool search and legacy route lead to the JSON Schema form", async ({
  page,
}) => {
  await page.goto(`${baseUrl}/utilities/`, { waitUntil: "domcontentloaded" });
  const search = page.getByRole("searchbox", { name: "Find documentation" });
  await search.fill("JSON Schema Form");
  await expect(page.locator("[data-doc-nav-entry]:visible")).toHaveCount(1);
  await expect(page.locator("[data-doc-card]:visible")).toHaveCount(1);
  await page.locator("[data-doc-card]:visible").click();
  await expect(page).toHaveURL(`${baseUrl}/utilities/form/`);
  await expectActivePrimaryLink(page, "Utilities");
  await expect(
    page.locator("[data-doc-nav-entry][aria-current='page']"),
  ).toHaveText("JSON Schema Form");

  await page.goto(`${baseUrl}/form/`, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(`${baseUrl}/utilities/form/`);
});

test("JSON Form presets are searchable from Utilities", async ({ page }) => {
  await page.goto(`${baseUrl}/utilities/`, { waitUntil: "domcontentloaded" });
  const search = page.getByRole("searchbox", { name: "Find documentation" });
  await search.fill("Nested object");
  await expect(page.locator("[data-doc-nav-entry]:visible")).toHaveCount(1);
  await expect(page.locator("[data-doc-card]:visible")).toHaveCount(1);
  await page.locator("[data-doc-card]:visible").click();
  await expect(page).toHaveURL(`${baseUrl}/utilities/form/object/`);
  await expect(
    page.locator('[data-doc-nav-entry][aria-current="page"]'),
  ).toHaveText("Nested object");
});

for (const preset of JSON_FORM_PRESETS.filter(({ id }) =>
  ["switch", "radio-group", "checkbox-group"].includes(id),
)) {
  test(`${preset.title} preset opens its schema and survives reload`, async ({
    page,
  }) => {
    await page.goto(`${baseUrl}/utilities/`, { waitUntil: "domcontentloaded" });
    const search = page.getByRole("searchbox", { name: "Find documentation" });
    await search.fill(preset.title);
    await expect(page.locator("[data-doc-card]:visible")).toHaveCount(1);
    await page.locator("[data-doc-card]:visible").click();
    await expect(page).toHaveURL(`${baseUrl}/utilities/form/${preset.id}/`);

    for (const reload of [false, true]) {
      if (reload) await page.reload({ waitUntil: "domcontentloaded" });
      await expectActivePrimaryLink(page, "Utilities");
      await expect(
        page.locator('[data-doc-nav-entry][aria-current="page"]'),
      ).toHaveText(preset.title);
      await expect(
        page.getByRole("heading", {
          name: `${preset.title} JSON Form`,
          exact: true,
        }),
      ).toBeVisible();
      await page
        .locator(
          'astro-island[component-export="JsonSchemaFormDemo"]:not([ssr])',
        )
        .waitFor();
      await expect(page.getByLabel("Example schema")).toHaveValue(preset.title);
      expect(
        JSON.parse(
          await page.getByLabel("JSON Schema", { exact: true }).inputValue(),
        ),
      ).toEqual(preset.schema);
      await expect(
        page.getByRole("region", { name: "Generated form preview" }),
      ).toBeVisible();
    }
  });
}

for (const preset of JSON_FORM_PRESETS.slice(11)) {
  test(`${preset.title} control has a direct demo, active menu, and reloadable schema`, async ({
    page,
  }) => {
    await page.goto(`${baseUrl}/utilities/form/${preset.id}/`, {
      waitUntil: "domcontentloaded",
    });
    for (const reload of [false, true]) {
      if (reload) await page.reload({ waitUntil: "domcontentloaded" });
      await expect(
        page.locator(
          'astro-island[component-export="JsonSchemaFormDemo"]:not([ssr])',
        ),
      ).toBeAttached();
      await expectActivePrimaryLink(page, "Utilities");
      await expect(
        page.locator('[data-doc-nav-entry][aria-current="page"]'),
      ).toHaveText(preset.title);
      await expect(
        page.getByRole("heading", {
          name: `${preset.title} JSON Form`,
          exact: true,
        }),
      ).toBeVisible();
      await expect(page.getByLabel("Example schema")).toHaveValue(preset.title);
      expect(
        JSON.parse(
          await page.getByLabel("JSON Schema", { exact: true }).inputValue(),
        ),
      ).toEqual(preset.schema);
      await expect(
        page.getByRole("region", { name: "Generated form preview" }),
      ).toBeVisible();
    }
    const sidebar = page.getByRole("complementary", {
      name: "Documentation navigation",
    });
    const group = sidebar
      .locator("[data-doc-nav-group]")
      .filter({ has: page.getByText("JSON Form", { exact: true }) });
    await expect(group.locator("[data-doc-nav-entry]")).toHaveCount(28);
  });
}

test("search filters the Components sidebar and catalog, and Clear restores both", async ({
  page,
}) => {
  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });

  const entries = page.locator("[data-doc-nav-entry]");
  const cards = page.locator("[data-doc-card]");
  const initialEntryCount = await visibleCount(entries);
  const initialCardCount = await visibleCount(cards);
  expect(initialEntryCount).toBeGreaterThan(0);
  expect(initialCardCount).toBeGreaterThan(0);

  const search = page.getByRole("searchbox", { name: "Find documentation" });
  await search.fill("Button");
  await expect(
    page
      .getByRole("complementary", { name: "Documentation navigation" })
      .getByRole("link", { name: "Button", exact: true }),
  ).toBeVisible();
  await expect(
    page
      .locator("[data-doc-card]:visible")
      .getByText("Button", { exact: true }),
  ).toBeVisible();
  await expect
    .poll(() => visibleCount(entries))
    .toBeLessThan(initialEntryCount);
  await expect.poll(() => visibleCount(cards)).toBeLessThan(initialCardCount);

  await search.fill("no-document-matches-this-query");
  await expect(page.locator("[data-doc-nav-entry]:visible")).toHaveCount(0);
  await expect(page.locator("[data-doc-card]:visible")).toHaveCount(0);
  await expect(page.locator("[data-doc-nav-empty]")).toBeVisible();
  await expect(page.locator("[data-doc-catalog-empty]")).toBeVisible();

  await page.getByRole("button", { name: "Clear" }).click();
  await expect(search).toHaveValue("");
  await expect.poll(() => visibleCount(entries)).toBe(initialEntryCount);
  await expect.poll(() => visibleCount(cards)).toBe(initialCardCount);
});

test("mobile primary links stay visible and section changes do not overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });

  const primary = page.getByRole("navigation", { name: "Primary" });
  for (const section of sections) {
    const link = primary.getByRole("link", { name: section.name, exact: true });
    await expect(link).toBeVisible();
    const box = await link.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(390);

    await link.click();
    await expectActivePrimaryLink(page, section.name);
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(390);
  }
});
