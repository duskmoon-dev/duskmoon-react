import { expect, test } from "@playwright/test";

const baseUrl = process.env.DOCS_TEST_URL ?? "http://127.0.0.1:4334";
const hydratedDemo = 'astro-island[component-export="default"]:not([ssr])';

for (const viewport of [
  { name: "desktop", width: 1280, height: 900 },
  { name: "phone", width: 390, height: 844 },
]) {
  for (const theme of ["sunshine", "moonlight"]) {
    test(`authored layout demos navigate and collapse on ${viewport.name} in ${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto(`${baseUrl}/components/dm-layout/`, {
        waitUntil: "domcontentloaded",
      });
      await expect(page.locator(hydratedDemo)).toHaveCount(3);
      await page.evaluate(
        (theme) => document.documentElement.setAttribute("data-theme", theme),
        theme,
      );
      await expect(page.locator("[data-dm-layout-demo]")).toHaveCount(3);
      await expect(page.locator(".demo-source")).toHaveText([
        "authored",
        "authored",
        "authored",
      ]);

      const basic = page.locator(
        '[data-dm-layout-demo="Workspace navigation"]',
      );
      await basic
        .locator(".dm-menu-content")
        .getByText("Reports", { exact: true })
        .click();
      await expect(
        basic.getByRole("heading", { name: "Reports" }),
      ).toBeVisible();
      await expect(
        basic.getByRole("navigation", { name: "Breadcrumb" }),
      ).toContainText("Reports");
      await expect(
        basic.locator(".dm-menu-content .menu-item-active"),
      ).toContainText("Reports");

      const nested = page.locator(
        '[data-dm-layout-demo="Nested navigation and tips"]',
      );
      await nested
        .locator(".dm-menu-content")
        .getByText("Project archive and completed work", { exact: true })
        .click();
      await expect(
        nested.getByRole("heading", { name: "Project archive" }),
      ).toBeVisible();
      await expect(nested.locator(".dm-layout-auxiliary")).toHaveText(
        "Archived projects stay available for reference.",
      );
      const breadcrumb = nested.getByRole("navigation", { name: "Breadcrumb" });
      await expect(breadcrumb).toContainText("Projects");
      await expect(breadcrumb).toContainText(
        "Project archive and completed work",
      );
      await breadcrumb.getByText("Projects", { exact: true }).click();
      await expect(
        nested.getByRole("heading", { name: "Projects" }),
      ).toBeVisible();

      const controlled = page.locator(
        '[data-dm-layout-demo="Controlled sidebar collapse"]',
      );
      const sider = controlled.locator(".dm-layout-sider");
      const shell = controlled.locator(".dm-layout-shell");
      const checkSider = async (inlineWidth: "60px" | "230px") => {
        expect(
          await sider.evaluate(
            (element) => (element as HTMLElement).style.width,
          ),
        ).toBe(inlineWidth);
        if (viewport.name === "desktop") {
          await expect(sider).toHaveCSS("width", inlineWidth);
          await expect(shell).toHaveCSS("flex-direction", "row");
        } else {
          await expect(shell).toHaveCSS("flex-direction", "column");
          const geometry = await shell.evaluate((element) => {
            const aside = element
              .querySelector(".dm-layout-sider")!
              .getBoundingClientRect();
            const main = element
              .querySelector(".dm-layout-main")!
              .getBoundingClientRect();
            return {
              availableWidth: element.clientWidth,
              siderWidth: aside.width,
              siderBottom: aside.bottom,
              mainTop: main.top,
            };
          });
          expect(
            Math.abs(geometry.siderWidth - geometry.availableWidth),
          ).toBeLessThanOrEqual(1);
          expect(geometry.mainTop).toBeGreaterThanOrEqual(
            geometry.siderBottom - 1,
          );
        }
      };
      await controlled
        .getByRole("button", { name: "Collapse sidebar" })
        .click();
      await expect(controlled.getByRole("status")).toHaveText(
        "Sidebar collapsed",
      );
      await checkSider("60px");
      await expect(controlled.locator(".dm-menu")).toHaveClass(
        /dm-menu-collapsed/,
      );
      const selectedItem = controlled
        .locator(".dm-menu-content")
        .getByRole("menuitem", { name: "Projects", exact: true });
      await expect(selectedItem).toHaveClass(/menu-item-active/);
      await expect(selectedItem).toHaveAccessibleName("Projects");
      await expect(selectedItem.locator(".dm-menu-item-symbol")).toBeVisible();
      const clippedLabel = selectedItem.locator(".dm-menu-item-label");
      await expect(clippedLabel).toHaveCSS("width", "1px");
      await expect(clippedLabel).toHaveCSS("height", "1px");
      await expect(clippedLabel).toHaveCSS("clip-path", "inset(50%)");
      await expect(clippedLabel).toHaveCSS("overflow", "hidden");
      const collapseButton = controlled.getByRole("button", {
        name: "Expand menu",
      });
      await expect(collapseButton).toHaveClass(/btn-square/);
      await expect(collapseButton).toHaveText("");
      await expect(
        collapseButton.locator('svg[aria-hidden="true"]'),
      ).toBeVisible();
      const hitArea = await collapseButton.boundingBox();
      expect(hitArea!.width).toBeGreaterThanOrEqual(32);
      expect(Math.abs(hitArea!.width - hitArea!.height)).toBeLessThanOrEqual(1);
      const collapsedBounds = await sider.evaluate((element) => {
        const boundary = element.getBoundingClientRect();
        return Array.from(
          element.querySelectorAll(
            ".menu, .menu-item, .dm-menu-item-symbol, .dm-menu-footer",
          ),
        ).map((item) => {
          const rect = item.getBoundingClientRect();
          return {
            left: rect.left,
            right: rect.right,
            boundaryLeft: boundary.left,
            boundaryRight: boundary.right,
          };
        });
      });
      for (const item of collapsedBounds) {
        expect(item.left).toBeGreaterThanOrEqual(item.boundaryLeft - 1);
        expect(item.right).toBeLessThanOrEqual(item.boundaryRight + 1);
      }
      await expect(
        controlled.getByRole("heading", { name: "Projects" }),
      ).toBeVisible();
      await controlled.screenshot({
        path: `/tmp/duskmoon-dm-layout-collapsed-${viewport.name}-${theme}.png`,
      });
      await collapseButton.click();
      await expect(controlled.getByRole("status")).toHaveText(
        "Sidebar expanded",
      );
      await checkSider("230px");
      await expect(controlled.locator(".dm-menu")).not.toHaveClass(
        /dm-menu-collapsed/,
      );
      await expect(
        controlled.locator(".dm-menu-content .menu-item-active"),
      ).toContainText("Projects");

      for (const demo of await page.locator("[data-dm-layout-demo]").all()) {
        for (const frame of await demo
          .locator(".dm-layout-shell, .dm-layout-main")
          .all()) {
          for (const side of ["top", "right", "bottom", "left"])
            await expect(frame).toHaveCSS(`border-${side}-width`, "0px");
        }
        const bounds = await demo.boundingBox();
        expect(bounds!.x).toBeGreaterThanOrEqual(0);
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width);
        expect(
          await demo.evaluate(
            (element) => element.scrollWidth <= element.clientWidth,
          ),
        ).toBe(true);
        const children = await demo
          .locator(
            ".dm-layout-shell, .dm-layout-sider, .dm-layout-main, .dm-layout-breadcrumb, .dm-layout-content",
          )
          .evaluateAll((elements) =>
            elements.map((element) => {
              const rect = element.getBoundingClientRect();
              return {
                left: rect.left,
                right: rect.right,
                scrollWidth: element.scrollWidth,
                clientWidth: element.clientWidth,
              };
            }),
          );
        for (const child of children) {
          expect(child.left).toBeGreaterThanOrEqual(bounds!.x - 1);
          expect(child.right).toBeLessThanOrEqual(
            bounds!.x + bounds!.width + 1,
          );
          expect(child.scrollWidth).toBeLessThanOrEqual(child.clientWidth + 1);
        }
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(viewport.width);
      await controlled.screenshot({
        path: `/tmp/duskmoon-dm-layout-${viewport.name}-${theme}.png`,
      });
    });
  }
}
