import { expect, test } from "@playwright/test";

const baseUrl = process.env.DOCS_TEST_URL ?? "http://127.0.0.1:4334";
const fixturePath = new URL("./core-surface.fixture.tsx", import.meta.url)
  .pathname;

for (const theme of ["sunshine", "moonlight"]) {
  test(`${theme}: React Radio styles preserve Core native radios`, async ({
    page,
  }) => {
    await page.goto(`${baseUrl}/components/chat/`);
    await page.evaluate(
      async ({ path, theme }) => {
        document.documentElement.dataset.theme = theme;
        const fixture = await import(/* @vite-ignore */ path);
        fixture.mountRadioFixture();
      },
      { path: `/@fs${fixturePath}`, theme },
    );
    const root = page.getByRole("region", {
      name: "Radio compatibility fixture",
    });
    const native = root.getByRole("radio", {
      name: "Native primary",
      exact: true,
    });
    const nativeSecond = root.getByRole("radio", {
      name: "Native secondary",
      exact: true,
    });
    const react = root.getByRole("radio", {
      name: "React primary",
      exact: true,
    });
    const reactSecond = root.getByRole("radio", {
      name: "React secondary",
      exact: true,
    });
    await expect(native).toHaveCSS("border-top-width", "2px");
    await expect(native).toHaveCSS("width", "16px");
    await expect(nativeSecond).toHaveCSS("width", "24px");
    expect(
      await native.evaluate(
        (element) => getComputedStyle(element, "::before").content,
      ),
    ).not.toBe("none");
    await expect
      .poll(() =>
        native.evaluate(
          (element) => getComputedStyle(element, "::before").transform,
        ),
      )
      .toBe("matrix(1, 0, 0, 1, 0, 0)");
    const wrapper = react.locator("..");
    await expect(wrapper).toHaveCSS("border-top-width", "0px");
    await expect(wrapper.locator(".radio-circle")).toHaveCSS("width", "16px");
    await expect(wrapper.locator(".radio-dot")).toHaveCSS("opacity", "1");
    await nativeSecond.check();
    await root.getByText("React secondary", { exact: true }).click();
    await expect(native).not.toBeChecked();
    await expect(nativeSecond).toBeChecked();
    await expect(reactSecond).toBeChecked();
    await expect
      .poll(() =>
        nativeSecond.evaluate(
          (element) => getComputedStyle(element, "::before").transform,
        ),
      )
      .toBe("matrix(1, 0, 0, 1, 0, 0)");
    await expect(
      root.getByRole("radio", { name: "Native disabled" }),
    ).toBeDisabled();
    await expect(
      root.getByRole("radio", { name: "React disabled" }),
    ).toBeDisabled();
    expect(
      await root
        .getByRole("form", { name: "Radio values" })
        .evaluate((form) =>
          Object.fromEntries(new FormData(form as HTMLFormElement)),
        ),
    ).toEqual({ native: "second", react: "second" });
    await root.getByRole("button", { name: "Reset radios" }).click();
    await expect(native).toBeChecked();
    await expect(react).toBeChecked();
  });

  test(`${theme}: repaired semantic, accent and base surface labels meet AA`, async ({
    page,
  }) => {
    await page.goto(`${baseUrl}/components/chat/`);
    await page.evaluate(
      async ({ path, theme }) => {
        document.documentElement.dataset.theme = theme;
        const fixture = await import(/* @vite-ignore */ path);
        fixture.mountSurfaceFixture();
      },
      { path: `/@fs${fixturePath}`, theme },
    );
    const root = page.getByRole("region", { name: "Surface contract fixture" });
    // TODO(upstream): duskmoon-dev/duskmoonui#78 blocks adding neutral to this AA gate.
    // The broader neutral audit reproduces the failure using published Core alone.
    await expect(root.locator("[data-contrast]")).toHaveCount(72);
    await page.mouse.move(0, 0);
    const measurements = await root.evaluate((root) => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const context = canvas.getContext("2d", { willReadFrequently: true })!;
      function rgba(color: string) {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
        return [...context.getImageData(0, 0, 1, 1).data];
      }
      function luminance(rgb: number[]) {
        const [r, g, b] = rgb.map((v) => {
          const channel = v / 255;
          return channel <= 0.04045
            ? channel / 12.92
            : ((channel + 0.055) / 1.055) ** 2.4;
        });
        return r * 0.2126 + g * 0.7152 + b * 0.0722;
      }
      const surface = rgba(getComputedStyle(root).backgroundColor);
      return [...root.querySelectorAll<HTMLElement>("[data-contrast]")].map(
        (element) => {
          const style = getComputedStyle(element);
          const foreground = rgba(style.color);
          const background = rgba(style.backgroundColor);
          const alpha = background[3] / 255;
          const composite = background
            .slice(0, 3)
            .map(
              (value, index) => value * alpha + surface[index] * (1 - alpha),
            );
          const a = luminance(foreground.slice(0, 3));
          const b = luminance(composite);
          return {
            name: element.dataset.contrast,
            contrast: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
            color: style.color,
            background: style.backgroundColor,
          };
        },
      );
    });
    expect(measurements.filter((item) => item.contrast < 4.5)).toEqual([]);
    for (const family of ["badge", "tag"]) {
      const height = await root
        .locator(`[data-nowrap="${family}"]`)
        .evaluate((element) => element.getBoundingClientRect().height);
      expect(height).toBeLessThanOrEqual(36);
    }
    const activeTab = root.getByRole("tab", { name: "Selected tab" });
    const colors = await activeTab.evaluate((element) => {
      const expected = document.createElement("span");
      expected.style.color = "var(--color-on-primary-container)";
      element.append(expected);
      const actual = getComputedStyle(element).color;
      const target = getComputedStyle(expected).color;
      expected.remove();
      return { actual, target };
    });
    expect(colors.actual).toBe(colors.target);
  });
}
