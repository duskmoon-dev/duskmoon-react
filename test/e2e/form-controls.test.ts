import { expect, test, type Page } from "@playwright/test";

const baseUrl = process.env.DOCS_TEST_URL ?? "http://127.0.0.1:4334";
const fixtureUrl = new URL("./form-controls.fixture.tsx", import.meta.url)
  .pathname;
const builtStyles = new URL(
  "../../packages/components/dist/styles.css",
  import.meta.url,
).pathname;

async function fixture(page: Page) {
  await page.goto(`${baseUrl}/components/select/`);
  await expect(page.locator("astro-island:not([ssr])").first()).toBeAttached();
  await page.addStyleTag({ path: builtStyles });
  await page.evaluate(async (url) => {
    const fixture = await import(/* @vite-ignore */ url);
    fixture.mountFormControlsFixture();
  }, `/@fs${fixtureUrl}`);
  const root = page.getByRole("region", {
    name: "Form controls browser fixture",
  });
  await expect(root.getByLabel("Read-only number")).toBeVisible();
  return root;
}

test("read-only number keeps focus and value while editable stepping retains bounds", async ({
  page,
}) => {
  const root = await fixture(page);
  const readonly = root.getByLabel("Read-only number");
  await readonly.focus();
  await expect(readonly).toBeFocused();
  await readonly.press("ArrowUp");
  await readonly.press("ArrowDown");
  await readonly.press("3");
  await expect(readonly).toHaveValue("2");
  const controls = readonly.locator("..");
  await expect(
    controls.getByRole("button", { name: "Increase value" }),
  ).toBeDisabled();
  await expect(
    controls.getByRole("button", { name: "Decrease value" }),
  ).toBeDisabled();
  await expect(root.getByLabel("Read-only events")).toHaveText("0/0");

  const editable = root.getByLabel("Editable number");
  await editable.press("ArrowUp");
  await expect(editable).toHaveValue("2.5");
  await editable
    .locator("..")
    .getByRole("button", { name: "Increase value" })
    .click();
  await expect(editable).toHaveValue("3");
  await expect(
    editable.locator("..").getByRole("button", { name: "Increase value" }),
  ).toBeDisabled();
  await editable.press("ArrowDown");
  await expect(editable).toHaveValue("2.5");
});

test("built Select styles show one graphical caret and reserve clear space at every size", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const root = await fixture(page);
  for (const size of ["sm", "md", "lg"]) {
    for (const mode of ["single", "multiple"]) {
      const trigger = root.getByRole("button", {
        name: `${size} ${mode} transport`,
        exact: true,
      });
      const wrapper = trigger.locator("..");
      await expect(trigger).toHaveAttribute("aria-required", "true");
      await expect(wrapper).not.toHaveAttribute("aria-required");
      await expect(trigger.locator(".select-icon svg")).toHaveCount(1);
      const clear = wrapper.getByRole("button", { name: "Clear selection" });
      await expect(clear.locator('svg[aria-hidden="true"]')).toHaveCount(1);
      expect(await trigger.locator(".select-icon").textContent()).toBe("");
      expect(await clear.textContent()).toBe("");
      expect(
        await trigger.evaluate(
          (element) => getComputedStyle(element).backgroundImage,
        ),
      ).toBe("none");
      const selectionBox = (await trigger
        .locator(".select-selection")
        .boundingBox())!;
      const clearBox = (await clear.boundingBox())!;
      const caretBox = (await trigger.locator(".select-icon").boundingBox())!;
      expect(selectionBox.x + selectionBox.width).toBeLessThanOrEqual(
        clearBox.x,
      );
      expect(clearBox.x + clearBox.width).toBeLessThanOrEqual(caretBox.x);
    }
  }
});

test("Select graphical controls preserve search, selection and clearing in both modes", async ({
  page,
}) => {
  const root = await fixture(page);
  for (const mode of ["single", "multiple"]) {
    const name = `md ${mode} transport`;
    const trigger = root.getByRole("button", { name, exact: true });
    const wrapper = trigger.locator("..");
    await trigger.click();
    await wrapper.getByPlaceholder("Transport").fill("http");
    await expect(wrapper.getByRole("option")).toHaveCount(1);
    await wrapper.getByRole("option", { name: "HTTP", exact: true }).click();
    await expect(root.getByLabel(`${name} value`)).toHaveText(
      mode === "single" ? '"http"' : '["stdio","http"]',
    );
    if (mode === "multiple") await trigger.click();
    await wrapper.getByRole("button", { name: "Clear selection" }).click();
    await expect(root.getByLabel(`${name} value`)).toHaveText(
      mode === "single" ? "empty" : "[]",
    );
    await expect(trigger).toHaveText("Transport");
    await expect(
      wrapper.getByRole("button", { name: "Clear selection" }),
    ).toHaveCount(0);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  }
});

test("native schema form classes survive validation, submission and reset", async ({
  page,
}) => {
  const root = await fixture(page);
  const form = root.locator("form.custom-native-form");
  await expect(form).toHaveClass(
    "form form-vertical schema-form custom-native-form",
  );
  await expect(form.locator("..")).toHaveClass("schema-form-container");
  await form.getByLabel("Name").fill("A");
  await form.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(form.getByRole("alert")).toBeVisible();
  await expect(root.getByLabel("Submitted form")).toHaveText("empty");
  await form.getByLabel("Name").fill("Moon");
  await form.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(root.getByLabel("Submitted form")).toHaveText('{"name":"Moon"}');
  await form.getByRole("button", { name: "Reset form" }).click();
  await expect(form.getByLabel("Name")).toHaveValue("Ada");
  await expect(root.getByLabel("Submitted form")).toHaveText("empty");
  await expect(form).toHaveClass(
    "form form-vertical schema-form custom-native-form",
  );
});
