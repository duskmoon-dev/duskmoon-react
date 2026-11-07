import { expect, test, type Locator } from "@playwright/test";

const base = process.env.DOCS_TEST_URL ?? "http://127.0.0.1:4334";
const fixturePath = new URL("./chat-editor-focus.fixture.tsx", import.meta.url)
  .pathname;

async function surface(editor: Locator) {
  return editor.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      background: style.backgroundColor,
      color: style.color,
      outline: style.outlineStyle,
      shadow: style.boxShadow,
      border: style.borderWidth,
    };
  });
}

for (const theme of ["sunshine", "moonlight"]) {
  test(`${theme} editors retain one focus surface across native, semantic and rich states`, async ({
    page,
  }) => {
    await page.goto(`${base}/components/chat/`);
    await page.evaluate(
      async ({ path, theme }) => {
        document.documentElement.dataset.theme = theme;
        const fixture = await import(/* @vite-ignore */ path);
        fixture.mountComposerFocusFixture();
      },
      { path: `/@fs${fixturePath}`, theme },
    );
    const fixture = page.getByRole("region", {
      name: "Composer focus fixture",
    });
    for (const state of ["normal", "error", "read_only", "disabled"]) {
      await fixture.getByLabel("Composer fixture state").selectOption(state);
      for (const mode of ["legacy", "semantic", "rich"]) {
        const editor = fixture.getByRole("textbox", {
          name: `${mode === "legacy" ? "Legacy" : mode} focus editor`,
          exact: true,
        });
        await expect(editor).toBeVisible();
        const unfocused = await surface(editor);
        expect(unfocused).toMatchObject({
          background: "rgba(0, 0, 0, 0)",
          outline: "none",
          shadow: "none",
          border: "0px",
        });
        if (
          state === "disabled" ||
          (state === "read_only" && mode !== "legacy")
        ) {
          if (mode === "rich")
            await expect(editor).toHaveAttribute("contenteditable", "false");
          else {
            await expect(editor).toBeDisabled();
            continue;
          }
        }
        await editor.hover();
        expect(await surface(editor)).toEqual(unfocused);
        // aria-disabled rich surfaces remain focusable; use the real pointer.
        const bounds = (await editor.boundingBox())!;
        await page.mouse.click(
          bounds.x + bounds.width / 2,
          bounds.y + bounds.height / 2,
        );
        await expect(editor).toBeFocused();
        expect(await surface(editor)).toEqual(unfocused);
        await fixture
          .getByRole("button", { name: `Before ${mode} editor`, exact: true })
          .focus();
        await page.keyboard.press("Tab");
        await expect(editor).toBeFocused();
        expect(await surface(editor)).toEqual(unfocused);
        expect(
          await editor.evaluate(
            (element) =>
              getComputedStyle(element.closest(".chat-composer")!).boxShadow,
          ),
        ).not.toBe("none");
      }
    }
  });
}
