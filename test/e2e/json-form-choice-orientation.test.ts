import { expect, test } from "@playwright/test";

const baseUrl = process.env.DOCS_TEST_URL ?? "http://127.0.0.1:4334";
const hydratedDemo =
  'astro-island[component-export="JsonSchemaFormDemo"]:not([ssr])';

for (const viewport of [
  { name: "desktop", width: 1280, height: 900 },
  { name: "phone", width: 390, height: 844 },
]) {
  for (const theme of ["sunshine", "moonlight"]) {
    test(`choice group demos preserve row/column layouts and typed reset on ${viewport.name} in ${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      for (const preset of ["radio-group", "checkbox-group"] as const) {
        await page.goto(`${baseUrl}/utilities/form/${preset}/`, {
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
        const horizontal = preview.getByRole(
          preset === "radio-group" ? "radiogroup" : "group",
          {
            name: preset === "radio-group" ? "*Delivery" : "*Topics",
            exact: true,
          },
        );
        const vertical = preview.getByRole(
          preset === "radio-group" ? "radiogroup" : "group",
          {
            name: preset === "radio-group" ? "*Ratio" : "*Ratios",
            exact: true,
          },
        );
        const defaultGroup = preview.getByRole(
          preset === "radio-group" ? "radiogroup" : "group",
          {
            name: preset === "radio-group" ? "*Priority" : "*Flags",
            exact: true,
          },
        );
        await expect(horizontal).toHaveClass(/schema-choice-horizontal/);
        await expect(vertical).toHaveClass(/schema-choice-vertical/);
        await expect(defaultGroup).toHaveClass(/schema-choice-vertical/);
        if (preset === "radio-group") {
          await expect(horizontal).toHaveAttribute(
            "aria-orientation",
            "horizontal",
          );
          await expect(vertical).toHaveAttribute(
            "aria-orientation",
            "vertical",
          );
        } else {
          await expect(horizontal).not.toHaveAttribute("aria-orientation");
        }
        for (const [group, direction] of [
          [horizontal, "horizontal"],
          [vertical, "vertical"],
        ] as const) {
          const geometry = await group
            .locator(".schema-choice-options")
            .evaluate((element) => {
              const labels = Array.from(element.children).map((label) => {
                const rect = label.getBoundingClientRect();
                return {
                  left: rect.left,
                  right: rect.right,
                  top: rect.top,
                  bottom: rect.bottom,
                };
              });
              const style = getComputedStyle(element);
              return {
                labels,
                display: style.display,
                wrap: style.flexWrap,
                direction: style.flexDirection,
                width: element.getBoundingClientRect().width,
              };
            });
          if (direction === "horizontal") {
            expect(geometry.display).toBe("flex");
            expect(geometry.direction).toBe("row");
            expect(geometry.wrap).toBe("wrap");
            if (viewport.name === "desktop") {
              expect(
                Math.abs(geometry.labels[0].top - geometry.labels[1].top),
              ).toBeLessThanOrEqual(2);
              expect(geometry.labels[1].left).toBeGreaterThanOrEqual(
                geometry.labels[0].right + 8,
              );
            }
          } else {
            expect(geometry.display).toBe("grid");
            expect(geometry.labels[1].top).toBeGreaterThanOrEqual(
              geometry.labels[0].bottom + 8,
            );
          }
        }
        if (preset === "radio-group") {
          const option = horizontal.getByRole("radio", {
            name: "monthly",
            exact: true,
          });
          await option.focus();
          await option.press("Space");
          await expect(option).toBeChecked();
          const verticalOption = vertical.getByRole("radio", {
            name: "1.5",
            exact: true,
          });
          await verticalOption.focus();
          await verticalOption.press("Space");
          await expect(verticalOption).toBeChecked();
        } else {
          const option = horizontal.getByRole("checkbox", {
            name: "events",
            exact: true,
          });
          await option.focus();
          await option.press("Space");
          await expect(option).toBeChecked();
          const verticalOption = vertical.getByRole("checkbox", {
            name: "1.5",
            exact: true,
          });
          await verticalOption.focus();
          await verticalOption.press("Space");
          await expect(verticalOption).toBeChecked();
        }
        await preview
          .getByRole("button", { name: "Submit", exact: true })
          .click();
        const output = page.getByLabel("Submitted JSON", { exact: true });
        expect(JSON.parse((await output.textContent())!)).toEqual(
          preset === "radio-group"
            ? { delivery: "monthly", ratio: 1.5, priority: 1, enabled: false }
            : {
                topics: ["updates", "events"],
                ratios: [0.5, 1.5],
                flags: [true],
              },
        );
        await preview
          .getByRole("button", { name: "Reset form", exact: true })
          .click();
        await preview
          .getByRole("button", { name: "Submit", exact: true })
          .click();
        expect(JSON.parse((await output.textContent())!)).toEqual(
          preset === "radio-group"
            ? { delivery: "weekly", ratio: 0.5, priority: 1, enabled: false }
            : { topics: ["updates"], ratios: [0.5], flags: [true] },
        );
        await expect
          .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
          .toBeLessThanOrEqual(viewport.width);
      }
    });
  }
}

test("horizontal long labels wrap into rows on phones in both themes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/utilities/form/`, {
    waitUntil: "domcontentloaded",
  });
  await expect(page.locator(hydratedDemo)).toBeAttached();
  const labels = [
    "Product announcements and release notes",
    "Service notices and planned maintenance",
    "Community events and workshops",
  ];
  const properties = {
    delivery: {
      type: "string",
      title: "Delivery",
      "x-widget": "radio-group",
      "x-widget-options": { orientation: "horizontal" },
      enum: labels,
      default: labels[0],
    },
    topics: {
      type: "array",
      title: "Topics",
      "x-widget": "checkbox-group",
      "x-widget-options": { orientation: "horizontal" },
      uniqueItems: true,
      items: { type: "string", enum: labels },
      default: [labels[0]],
    },
  };
  await page
    .getByRole("textbox", { name: "JSON Schema", exact: true })
    .fill(JSON.stringify({ type: "object", properties }));
  await page
    .getByRole("button", { name: "Generate form", exact: true })
    .click();
  const preview = page.getByRole("region", { name: "Generated form preview" });
  for (const theme of ["sunshine", "moonlight"]) {
    await page.evaluate(
      (theme) => document.documentElement.setAttribute("data-theme", theme),
      theme,
    );
    const geometry = await preview
      .locator(".schema-choice-options")
      .evaluateAll((groups) =>
        groups.map((group) => {
          const rect = group.getBoundingClientRect();
          const labels = Array.from(group.children).map((label) => {
            const item = label.getBoundingClientRect();
            return {
              left: item.left,
              right: item.right,
              top: item.top,
              bottom: item.bottom,
            };
          });
          return { left: rect.left, right: rect.right, labels };
        }),
      );
    for (const group of geometry) {
      expect(group.labels[1].top).toBeGreaterThanOrEqual(
        group.labels[0].bottom + 8,
      );
      for (const label of group.labels) {
        expect(label.left).toBeGreaterThanOrEqual(group.left - 1);
        expect(label.right).toBeLessThanOrEqual(group.right + 1);
      }
    }
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(390);
  }
});
