import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";

async function loadDropdownStyles(page: Page) {
  await page.addStyleTag({
    content: await readFile(
      new URL(
        "../../packages/docs/node_modules/@duskmoon-dev/core/dist/index.css",
        import.meta.url,
      ),
      "utf8",
    ),
  });
  await page.addStyleTag({
    content: await readFile(
      new URL("../../packages/components/src/styles.css", import.meta.url),
      "utf8",
    ),
  });
  await page.locator(".dropdown-content[popover]").evaluateAll((panels) => {
    panels.forEach((panel) => (panel as HTMLElement).showPopover());
  });
  // Injecting Core starts transitions from the browser's default button styles.
  // Measure the rendered control only after those finite transitions finish.
  await page.evaluate(async () => {
    await Promise.all(
      document.getAnimations().map((animation) => animation.finished),
    );
  });
}

test("dropdown menu renders vertical full-width items on one panel", async ({
  page,
}) => {
  await page.setContent(`
    <span class="dropdown-button">
      <button class="btn btn-base btn-outline btn-md" type="button"><span class="btn-content">Actions</span></button>
      <span class="dropdown dropdown-block-end">
        <button class="btn btn-base btn-outline btn-md" type="button" aria-label="Open dropdown" popovertarget="dropdown-menu" style="anchor-name: --dropdown-trigger"><span class="btn-content"><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.75" /><circle cx="12" cy="12" r="1.75" /><circle cx="19" cy="12" r="1.75" /></svg></span></button>
        <span id="dropdown-menu" popover="auto" class="dropdown-content" style="position-anchor: --dropdown-trigger">
          <ul class="menu dropdown-menu">
            <li><button class="menu-item" type="button"><span class="menu-item-icon">✎</span>Edit</button></li>
            <li><button class="menu-item menu-item-danger" type="button">Delete</button></li>
            <li class="menu-divider"></li>
            <li><button class="menu-item" type="button" disabled>Unavailable</button></li>
          </ul>
        </span>
      </span>
    </span>
  `);
  await loadDropdownStyles(page);

  const panel = page.locator(".dropdown-content[popover]");
  const primaryButton = page.getByRole("button", { name: "Actions" });
  const triggerButton = page.getByRole("button", { name: "Open dropdown" });
  const menu = panel.locator("ul");
  const edit = menu.getByRole("button", { name: "Edit" });
  const remove = menu.getByRole("button", { name: "Delete" });
  const unavailable = menu.getByRole("button", { name: "Unavailable" });
  const [panelStyle, menuStyle] = await Promise.all([
    panel.evaluate((element) => {
      const style = getComputedStyle(element);
      return { border: style.borderTopWidth, padding: style.paddingTop };
    }),
    menu.evaluate((element) => {
      const style = getComputedStyle(element);
      return { display: style.display, border: style.borderTopWidth };
    }),
  ]);
  const [menuBox, editBox, removeBox] = await Promise.all([
    menu.boundingBox(),
    edit.boundingBox(),
    remove.boundingBox(),
  ]);
  const [primaryBox, triggerBox] = await Promise.all([
    primaryButton.boundingBox(),
    triggerButton.boundingBox(),
  ]);

  expect(primaryBox).not.toBeNull();
  expect(triggerBox).not.toBeNull();
  expect(Math.abs(primaryBox!.height - triggerBox!.height)).toBeLessThan(1);
  expect(Math.abs(triggerBox!.width - triggerBox!.height)).toBeLessThan(1);
  expect(panelStyle).toEqual({ border: "1px", padding: "8px" });
  expect(menuStyle).toEqual({ display: "grid", border: "0px" });
  expect(menuBox).not.toBeNull();
  expect(editBox).not.toBeNull();
  expect(removeBox).not.toBeNull();
  expect(removeBox!.y).toBeGreaterThan(editBox!.y + editBox!.height);
  expect(editBox!.width).toBeGreaterThanOrEqual(menuBox!.width - 1);
  expect(removeBox!.width).toBeGreaterThanOrEqual(menuBox!.width - 1);
  await expect(menu.locator(".menu-divider")).toHaveCount(1);
  await expect(remove).toHaveClass(/menu-item-danger/);
  await expect(unavailable).toBeDisabled();
  const [editStyle, removeStyle, unavailableStyle] = await Promise.all([
    edit.evaluate((element) => getComputedStyle(element).color),
    remove.evaluate((element) => getComputedStyle(element).color),
    unavailable.evaluate((element) => getComputedStyle(element).color),
  ]);
  expect(removeStyle).not.toBe(editStyle);
  expect(unavailableStyle).not.toBe(editStyle);
  await unavailable.hover({ force: true });
  await expect
    .poll(() =>
      unavailable.evaluate(
        (element) => getComputedStyle(element).backgroundColor,
      ),
    )
    .toBe("rgba(0, 0, 0, 0)");
});

for (const size of ["xs", "sm", "md", "lg"]) {
  for (const wrapped of [false, true]) {
    test(`${size} ${wrapped ? "tooltip-wrapped custom icon" : "ellipsis"} split trigger is square and anchors the native panel`, async ({
      page,
    }) => {
      const icon = wrapped
        ? '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="8" r="4" /><path d="M4 22a8 8 0 0 1 16 0" /></svg>'
        : '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.75" /><circle cx="12" cy="12" r="1.75" /><circle cx="19" cy="12" r="1.75" /></svg>';
      const trigger = `<button class="btn btn-base btn-outline btn-${size}" type="button" aria-label="Open dropdown" popovertarget="dropdown-menu" style="anchor-name: --dropdown-trigger"><span class="btn-content">${icon}</span></button>`;
      await page.setContent(`
        <span class="dropdown-button">
          <button class="btn btn-base btn-outline btn-${size}" type="button"><span class="btn-content">Actions</span></button>
          <span class="dropdown dropdown-block-end">
            ${wrapped ? `<span class="tooltip-wrapper">${trigger}<span role="tooltip" popover="hint" class="tooltip tooltip-top tooltip-md">More actions</span></span>` : trigger}
            <span id="dropdown-menu" popover="auto" class="dropdown-content" style="position-anchor: --dropdown-trigger"><ul class="menu dropdown-menu"><li><button class="menu-item" type="button"><span>Edit</span></button></li></ul></span>
          </span>
        </span>
      `);
      await loadDropdownStyles(page);

      const [primary, triggerBox, group, panel] = await Promise.all([
        page.getByRole("button", { name: "Actions" }).boundingBox(),
        page.getByRole("button", { name: "Open dropdown" }).boundingBox(),
        page.locator(".dropdown-button").boundingBox(),
        page.locator(".dropdown-content[popover]").boundingBox(),
      ]);
      expect(primary).not.toBeNull();
      expect(triggerBox).not.toBeNull();
      expect(group).not.toBeNull();
      expect(panel).not.toBeNull();
      expect(Math.abs(primary!.height - triggerBox!.height)).toBeLessThan(1);
      expect(Math.abs(primary!.y - triggerBox!.y)).toBeLessThan(1);
      expect(Math.abs(triggerBox!.width - triggerBox!.height)).toBeLessThan(1);
      expect(panel!.x - triggerBox!.x).toBeCloseTo(4, 1);
    });
  }
}
