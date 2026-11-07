import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const base = process.env.DOCS_TEST_URL ?? "http://127.0.0.1:4334";

async function chooseTheme(page: Page, label: string) {
  await page.getByRole("button", { name: /^Theme preference:/ }).click();
  await page
    .locator("#docs-theme-preference")
    .getByText(label, { exact: true })
    .click();
  await expect(page.locator("#docs-theme-preference")).toBeHidden();
}

test("Core compact Appbar keeps a single 48px row across viewport sizes and themes", async ({
  page,
}) => {
  await page.goto(`${base}/components/chat/`);
  const header = page.locator("body > .site-header");
  for (const width of [320, 390, 800, 1280, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const theme of ["sunshine", "moonlight"]) {
      await page.evaluate(
        (value) => document.documentElement.setAttribute("data-theme", value),
        theme,
      );
      await expect(
        page.getByRole("button", { name: "Navigation menu" }),
      ).toBeVisible({ visible: width < 1280 });
      const bounds = (await header.boundingBox())!;
      expect(bounds.height).toBeCloseTo(48, 0);
      expect(bounds.width).toBe(width);
      await expect(header.locator(".brand-version")).toBeVisible();
      const brand = (await header.locator(".brand").boundingBox())!;
      const actions = (await header.locator(".appbar-actions").boundingBox())!;
      expect(brand.x + brand.width).toBeLessThanOrEqual(actions.x);
      expect(actions.x + actions.width).toBeLessThanOrEqual(width);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
      const toggle = header.locator("[data-theme-toggle]");
      expect((await toggle.boundingBox())!.width).toBeCloseTo(32, 0);
      expect((await toggle.boundingBox())!.height).toBeCloseTo(32, 0);
    }
  }
  await page.evaluate(() => scrollTo(0, 600));
  await expect.poll(async () => (await header.boundingBox())!.y).toBe(0);
  const sidebar = page.getByRole("complementary", {
    name: "Documentation navigation",
  });
  expect((await sidebar.boundingBox())!.y).toBeGreaterThanOrEqual(64);
  await sidebar.getByRole("link", { name: "Demos", exact: true }).click();
  await expect
    .poll(() =>
      page
        .locator("#demos")
        .evaluate((element) => element.getBoundingClientRect().top),
    )
    .toBeGreaterThanOrEqual(48);
});

test("compact navigation uses native keyboard, expanded state and light dismissal", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/components/chat/`);
  const trigger = page.getByRole("button", { name: "Navigation menu" });
  const menu = page.locator("#docs-primary-navigation");
  await expect(menu).toBeHidden();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.focus();
  await trigger.press("Enter");
  await expect(menu).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Tab");
  await expect(
    menu.getByRole("link", { name: "Components", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();
  await menu.evaluate(async (element) => {
    await Promise.allSettled(
      element.getAnimations().map((animation) => animation.finished),
    );
  });
  const bounds = (await menu.boundingBox())!;
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
  const anchor = (await trigger.boundingBox())!;
  expect(bounds.y).toBeGreaterThanOrEqual(anchor.y + anchor.height);
  await page.getByRole("heading", { name: "Chat", exact: true }).click();
  await expect(menu).toBeHidden();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("resizing navigation preserves focus on visible controls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${base}/components/chat/`);
  const menu = page.locator("#docs-primary-navigation");
  const trigger = page.locator(".header-menu-trigger");
  const themes = menu.getByRole("link", { name: "Theming", exact: true });
  await themes.focus();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(trigger).toBeFocused();
  await expect(menu).toBeHidden();
  await trigger.press("Enter");
  await themes.focus();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(menu).not.toHaveAttribute("popover");
  await expect(themes).toBeFocused();
  await expect(trigger).toBeHidden();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(trigger).toBeFocused();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(
    menu.getByRole("link", { name: "Components", exact: true }),
  ).toBeFocused();
});

test("theme dropdown applies and restores all preferences across section navigation", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto(`${base}/components/chat/`);
  for (const [mode, label, resolved] of [
    ["moonlight", "Dark", "moonlight"],
    ["sunshine", "Light", "sunshine"],
    ["auto", "Auto (system)", "sunshine"],
  ]) {
    await chooseTheme(page, label);
    const trigger = page.getByRole("button", {
      name: `Theme preference: ${label}`,
      exact: true,
    });
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("html")).toHaveAttribute("data-theme", resolved);
    await expect(
      page.locator(`.theme-current-icon[data-theme-icon="${mode}"]`),
    ).toBeVisible();
    expect(
      await page.evaluate(() => localStorage.getItem("duskmoon-docs-theme")),
    ).toBe(mode);
    await page.reload();
    await expect(trigger).toBeEnabled();
    await expect(page.locator("html")).toHaveAttribute("data-theme", resolved);
    await expect(
      page.locator(`#docs-theme-preference input[value="${mode}"]`),
    ).toBeChecked();
    await expect(
      page.locator("#docs-theme-preference input:checked"),
    ).toHaveCount(1);
  }
  await chooseTheme(page, "Dark");
  await page
    .getByRole("navigation", { name: "Primary" })
    .getByRole("link", { name: "CSS Art", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "moonlight");
  await expect(
    page.getByRole("button", { name: "Theme preference: Dark", exact: true }),
  ).toBeVisible();
  await chooseTheme(page, "Light");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "sunshine");
});

test("Auto follows system changes while explicit theme preferences stay fixed", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto(`${base}/components/chat/`);
  await expect(
    page.getByRole("button", {
      name: "Theme preference: Auto (system)",
      exact: true,
    }),
  ).toBeEnabled();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "moonlight");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "sunshine");
  await chooseTheme(page, "Light");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "sunshine");
  await chooseTheme(page, "Dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "moonlight");
  await chooseTheme(page, "Auto (system)");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "sunshine");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "moonlight");
});

test("theme dropdown supports keyboard selection, dismissal and independent navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/components/chat/`);
  const trigger = page.getByRole("button", { name: /^Theme preference:/ });
  const group = page.getByRole("radiogroup", {
    name: "Theme preference",
    exact: true,
  });
  await trigger.focus();
  await trigger.press("Space");
  await expect(group).toBeVisible();
  await expect(group.getByRole("radio")).toHaveCount(3);
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Tab");
  await expect(
    group.getByRole("radio", { name: "Auto (system)", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(group).toBeHidden();
  await expect(trigger).toHaveAccessibleName("Theme preference: Light");
  await expect(trigger).toBeFocused();
  await trigger.press("Enter");
  await page.keyboard.press("Escape");
  await expect(group).toBeHidden();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole("heading", { name: "Chat", exact: true }).click();
  await expect(group).toBeHidden();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await chooseTheme(page, "Light");
  await expect(trigger).toBeFocused();

  const navigationTrigger = page.getByRole("button", {
    name: "Navigation menu",
    exact: true,
  });
  const navigation = page.locator("#docs-primary-navigation");
  await navigationTrigger.click();
  await expect(navigation).toBeVisible();
  await trigger.click();
  await expect(group).toBeVisible();
  await expect(navigation).toBeHidden();
  await expect(navigationTrigger).toHaveAttribute("aria-expanded", "false");
  await navigationTrigger.click();
  await expect(navigation).toBeVisible();
  await expect(group).toBeHidden();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("existing saved themes are retained and invalid preferences use the system", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto(`${base}/components/chat/`);
  for (const [stored, mode, resolved] of [
    ["sunshine", "sunshine", "sunshine"],
    ["moonlight", "moonlight", "moonlight"],
    ["invalid-theme", "auto", "moonlight"],
  ]) {
    await page.evaluate(
      (value) => localStorage.setItem("duskmoon-docs-theme", value),
      stored,
    );
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", resolved);
    await expect(
      page.locator(`#docs-theme-preference input[value="${mode}"]`),
    ).toBeChecked();
  }
});

test("theme preferences remain usable when browser storage is unavailable", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Storage is unavailable", "SecurityError");
      },
    });
  });
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto(`${base}/components/chat/`);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "moonlight");
  await chooseTheme(page, "Light");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "sunshine");
  await page.emulateMedia({ colorScheme: "light" });
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "sunshine");
  await chooseTheme(page, "Auto (system)");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "moonlight");
  expect(errors).toEqual([]);
});

test("theme dropdown fits a 320px Appbar and remains accessible in LTR and RTL", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto(`${base}/components/chat/`);
  for (const direction of ["ltr", "rtl"]) {
    await page.evaluate((value) => {
      document.documentElement.dir = value;
    }, direction);
    for (const label of ["Light", "Dark"]) {
      await chooseTheme(page, label);
      await page.getByRole("button", { name: /^Theme preference:/ }).click();
      const group = page.getByRole("radiogroup", {
        name: "Theme preference",
        exact: true,
      });
      await expect(group).toBeVisible();
      await group.evaluate(async (element) => {
        await Promise.allSettled(
          element.getAnimations().map((animation) => animation.finished),
        );
      });
      const bounds = (await group.boundingBox())!;
      expect(bounds.x).toBeGreaterThanOrEqual(0);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
      await expect(page.locator(".site-header")).toHaveCSS("height", "48px");
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(320);
      expect(
        (
          await new AxeBuilder({ page })
            .include("[data-theme-dropdown]")
            .analyze()
        ).violations,
      ).toEqual([]);
      await page.keyboard.press("Escape");
    }
  }
});

test("compact header and opened navigation remain accessible in both themes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto(`${base}/components/chat/`);
  for (const theme of ["sunshine", "moonlight"]) {
    await page.evaluate(
      (value) => document.documentElement.setAttribute("data-theme", value),
      theme,
    );
    await page.getByRole("button", { name: "Navigation menu" }).click();
    await expect(page.locator("#docs-primary-navigation")).toBeVisible();
    const audit = await new AxeBuilder({ page })
      .include(".site-header")
      .analyze();
    expect(audit.violations, `${theme} header accessibility`).toEqual([]);
    await page.keyboard.press("Escape");
  }
});

test("primary links remain available on narrow screens without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 844 },
  });
  try {
    const page = await context.newPage();
    await page.goto(`${base}/components/chat/`);
    const primary = page.getByRole("navigation", { name: "Primary" });
    for (const name of ["Components", "CSS Art", "Theming", "Utilities"]) {
      await expect(
        primary.getByRole("link", { name, exact: true }),
      ).toBeVisible();
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(320);
    await primary.getByRole("link", { name: "Theming", exact: true }).click();
    await expect(page).toHaveURL(`${base}/theming/`);
    await expect(primary.locator('[aria-current="page"]')).toHaveText(
      "Theming",
    );
  } finally {
    await context.close();
  }
});
