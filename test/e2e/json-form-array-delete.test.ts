import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";

const baseUrl = process.env.DOCS_TEST_URL ?? "http://127.0.0.1:4334";
const hydratedDemo =
  'astro-island[component-export="JsonSchemaFormDemo"]:not([ssr])';
const tagTitle =
  "A descriptive tag name that can wrap across several lines on a narrow screen";
const initial = {
  tags: ["first", "second"],
  contacts: [{ name: "Ada" }, { name: "Grace" }],
  batches: [[1, 2], [3]],
  enabled: [true],
};

for (const viewport of [
  { name: "desktop", width: 1280, height: 900 },
  { name: "phone", width: 390, height: 844 },
]) {
  for (const theme of ["sunshine", "moonlight"]) {
    test(`array delete icons stay beside their items on ${viewport.name} in ${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto(`${baseUrl}/utilities/form/array/`, {
        waitUntil: "domcontentloaded",
      });
      await expect(page.locator(hydratedDemo)).toBeAttached();
      await page.evaluate(
        (theme) => document.documentElement.setAttribute("data-theme", theme),
        theme,
      );
      await page.getByRole("textbox", { name: "JSON Schema" }).fill(
        JSON.stringify({
          type: "object",
          default: initial,
          properties: {
            tags: {
              type: "array",
              title: "Tags",
              items: {
                type: "string",
                title: tagTitle,
                description: "Enter a short name for this tag.",
                minLength: 1,
              },
            },
            contacts: {
              type: "array",
              title: "Contacts",
              items: {
                type: "object",
                properties: { name: { type: "string", title: "Name" } },
              },
            },
            batches: {
              type: "array",
              title: "Batches",
              items: {
                type: "array",
                title: "Scores",
                items: { type: "number", title: "Score" },
              },
            },
            enabled: {
              type: "array",
              title: "Enabled",
              items: {
                type: "boolean",
                description: "Keep this item enabled.",
              },
            },
          },
        }),
      );
      await page.getByRole("button", { name: "Generate form" }).click();
      const preview = page.getByRole("region", {
        name: "Generated form preview",
      });
      const output = page.locator('pre[aria-label="Submitted JSON"]');
      const removeButtons = preview.getByRole("button", { name: /^Remove / });
      await expect(removeButtons).toHaveCount(10);
      for (const button of await removeButtons.all()) {
        await expect(button).toBeVisible();
        await expect(button).toHaveText("");
        await expect(button).toHaveAttribute("type", "button");
        await expect(button).toHaveClass(/btn-ghost/);
        await expect(button).toHaveClass(/btn-error/);
        await expect(button.locator('svg[aria-hidden="true"]')).toBeVisible();
      }

      const checkLayout = async () => {
        const geometry = await preview
          .locator(".schema-array-item")
          .evaluateAll((items) =>
            items.map((item) => {
              const content = item.firstElementChild!;
              const action = item.lastElementChild!;
              const contentRect = content.getBoundingClientRect();
              const actionRect = action.getBoundingClientRect();
              const control = content.querySelector(
                ":scope > .form-item-control",
              );
              const controlRect = control?.getBoundingClientRect();
              const label = content.querySelector(":scope > .form-item-label");
              return {
                contentRight: contentRect.right,
                actionLeft: actionRect.left,
                actionRight: actionRect.right,
                actionCenter: actionRect.top + actionRect.height / 2,
                contentCenter: contentRect.top + contentRect.height / 2,
                controlCenter: controlRect
                  ? controlRect.top + controlRect.height / 2
                  : undefined,
                width: actionRect.width,
                height: actionRect.height,
                labelHeight: label?.getBoundingClientRect().height,
                labelLineHeight: label
                  ? parseFloat(getComputedStyle(label).lineHeight)
                  : undefined,
              };
            }),
          );
        for (const item of geometry) {
          expect(item.actionLeft - item.contentRight).toBeGreaterThanOrEqual(7);
          expect(item.actionRight).toBeLessThanOrEqual(viewport.width);
          expect(item.width).toBeGreaterThanOrEqual(32);
          expect(Math.abs(item.width - item.height)).toBeLessThanOrEqual(1);
          expect(
            Math.abs(
              item.actionCenter - (item.controlCenter ?? item.contentCenter),
            ),
          ).toBeLessThanOrEqual(1);
        }
        if (viewport.name === "phone")
          expect(geometry[0].labelHeight!).toBeGreaterThan(
            geometry[0].labelLineHeight!,
          );
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth),
        ).toBeLessThanOrEqual(viewport.width);
      };
      await checkLayout();
      await preview.getByRole("textbox", { name: tagTitle }).first().fill("");
      await preview.getByRole("button", { name: "Submit" }).click();
      await expect(preview.getByRole("alert")).toBeVisible();
      await checkLayout();
      await preview
        .getByRole("textbox", { name: tagTitle })
        .first()
        .fill("first");
      await mkdir("/tmp/duskmoon-array-delete", { recursive: true });
      await preview.screenshot({
        path: `/tmp/duskmoon-array-delete/${viewport.name}-${theme}.png`,
      });

      await preview.getByRole("button", { name: "Remove Tags 1" }).click();
      await preview.getByRole("button", { name: "Remove Contacts 1" }).click();
      const firstScores = preview
        .getByRole("group", { name: "Scores", exact: true })
        .first();
      await firstScores
        .getByRole("button", { name: "Remove Scores 1" })
        .click();
      await firstScores.getByRole("spinbutton", { name: "Score" }).fill("2.5");
      await preview.getByRole("button", { name: "Remove Batches 2" }).click();
      await expect(output).toContainText("Submit the form");
      await preview.getByRole("button", { name: "Submit" }).click();
      expect(JSON.parse((await output.textContent())!)).toEqual({
        tags: ["second"],
        contacts: [{ name: "Grace" }],
        batches: [[2.5]],
        enabled: [true],
      });
      await preview.getByRole("button", { name: "Reset form" }).click();
      await expect(removeButtons).toHaveCount(10);
      await expect(output).toContainText("Submit the form");
      await preview.getByRole("button", { name: "Submit" }).click();
      expect(JSON.parse((await output.textContent())!)).toEqual(initial);
    });
  }
}
