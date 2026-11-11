import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const baseUrl = process.env.DOCS_TEST_URL ?? "http://127.0.0.1:4334";
const fixtureUrl = new URL("./chat-additions.fixture.tsx", import.meta.url)
  .pathname;

async function fixture(page: Page, theme = "sunshine") {
  await page.goto(`${baseUrl}/components/chat/`, {
    waitUntil: "domcontentloaded",
  });
  await page.evaluate(
    async ({ url, theme }) => {
      document.documentElement.setAttribute("data-theme", theme);
      const fixture = await import(/* @vite-ignore */ url);
      fixture.mountChatAdditionsFixture();
    },
    { url: `/@fs${fixtureUrl}`, theme },
  );
  const root = page.getByRole("region", { name: "Chat additions fixture" });
  await expect(
    root.getByRole("button", { name: /^Access settings:/ }),
  ).toBeVisible();
  return root;
}

test("settings menus preserve host state, native keyboard navigation and warning appearance", async ({
  page,
}) => {
  const root = await fixture(page);
  const access = root.getByRole("button", {
    name: /^Access settings:/,
  });
  await access.focus();
  await page.keyboard.press("Enter");
  const choices = root.getByRole("group", {
    name: "Access settings",
    exact: true,
  });
  await expect(choices).toBeVisible();
  await expect(
    choices.getByRole("button", { name: /Full access/ }),
  ).toHaveClass(/chat-composer-menu-option-warning/);
  await choices.getByRole("button", { name: /Full access/ }).focus();
  await page.keyboard.press("Enter");
  await expect(choices).not.toBeVisible();
  await expect(access).toBeEnabled();
  await expect(access).toHaveAttribute("aria-busy", "true");
  await expect(access).toBeFocused();
  await expect(access).toContainText("Ask for approval");
  await expect(
    root.getByRole("status").filter({ hasText: "Change pending" }),
  ).toHaveCount(1);
  const pendingRequests = await root
    .getByLabel("Settings requests")
    .textContent();
  await page.keyboard.press("Enter");
  await expect(choices).toBeVisible();
  await expect(
    choices.getByRole("button", { name: /Ask for approval/ }),
  ).toBeDisabled();
  await expect(
    choices.getByRole("button", { name: /Full access/ }),
  ).toBeDisabled();
  await expect(root.getByLabel("Settings requests")).toHaveText(
    pendingRequests!,
  );
  await page.keyboard.press("Escape");
  await expect(choices).not.toBeVisible();
  await expect(access).toBeFocused();
  await root.getByRole("button", { name: "Accept settings" }).click();
  await expect(access).toContainText("Full access");
  await expect(access).toHaveAttribute("data-active", "true");
  await access.click();
  await expect(
    choices.getByRole("button", { name: /Full access/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Escape");

  await root.getByRole("button", { name: /^Model settings:/ }).click();
  await root.getByRole("button", { name: /^Choose a model:/ }).focus();
  await page.keyboard.press("Enter");
  const models = root.getByRole("group", {
    name: /^Choose a model(?::|$)/,
  });
  await expect(models).toBeVisible();
  await models.getByRole("button", { name: /Fast/ }).click();
  await expect(models).not.toBeVisible();
  await expect(
    root.getByRole("button", { name: /^Model settings:/ }),
  ).toContainText("Standard");
  await root.getByRole("button", { name: "Reject settings" }).click();
  await expect(
    root.getByRole("status").filter({ hasText: "Host rejected this choice" }),
  ).toHaveCount(1);
  await expect(
    root.getByRole("button", { name: /^Model settings:/ }),
  ).toContainText("Standard");
});

test("ordered settings commit on pointer/key release and reject stale receipts", async ({
  page,
}) => {
  const root = await fixture(page);
  const trigger = root.getByRole("button", {
    name: /^Model settings:/,
  });
  const requests = root.getByLabel("Settings requests");
  await trigger.click();
  const slider = root.getByRole("slider", { name: "Effort" });
  await slider.focus();
  await page.keyboard.down("ArrowRight");
  await expect(slider).toHaveAttribute("aria-valuetext", "Medium");
  await expect(requests).toHaveText("[]");
  await page.keyboard.up("ArrowRight");
  await expect(requests).toContainText('"value":"medium"');
  await expect(trigger).toContainText("Low");
  await root.getByRole("button", { name: "Advance settings revision" }).click();
  await root.getByRole("button", { name: "Accept settings" }).click();
  await expect(
    root
      .getByRole("status")
      .filter({ hasText: "Settings changed while the request was pending" }),
  ).toHaveCount(1);
  await expect(trigger).toContainText("Low");

  await trigger.click();
  const box = (await slider.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.94, box.y + box.height / 2);
  await page.mouse.down();
  await expect(slider).toHaveAttribute("aria-valuetext", "High");
  expect(JSON.parse((await requests.textContent())!)).toHaveLength(1);
  await page.mouse.up();
  await expect(requests).toContainText('"value":"high"');
  await root.getByRole("button", { name: "Accept settings" }).click();
  await expect(trigger).toContainText("High");
  await trigger.click();
  await root.getByRole("button", { name: "Reset effort" }).click();
  await expect(requests).toContainText('"value":"medium"');
  await root.getByRole("button", { name: "Accept settings" }).click();
  await expect(trigger).toContainText("Medium");
});

for (const theme of ["sunshine", "moonlight"]) {
  test(`context bars join both composers at narrow widths in ${theme}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    const root = await fixture(page, theme);
    for (const mode of ["legacy", "session"]) {
      for (const variant of ["default", "compact", "ghost", "compact-ghost"]) {
        const context = root.getByRole("group", {
          name: `${mode} ${variant} context`,
        });
        await context.scrollIntoViewIfNeeded();
        const geometry = await context.evaluate((element) => {
          const composer = element.parentElement!;
          const bar = element.getBoundingClientRect();
          const parent = composer.getBoundingClientRect();
          const css = getComputedStyle(element);
          const parentCss = getComputedStyle(composer);
          return {
            first: composer.firstElementChild === element,
            x: bar.x - parent.x,
            y: bar.y - parent.y,
            width: bar.width - parent.width,
            background: css.backgroundColor,
            parentBackground: parentCss.backgroundColor,
            radius: css.borderTopLeftRadius,
            parentRadius: parentCss.borderTopLeftRadius,
            overflow: composer.scrollWidth - composer.clientWidth,
            labelOverflow:
              element.querySelector(".chat-composer-context-label")!
                .scrollWidth >
              element.querySelector(".chat-composer-context-label")!
                .clientWidth,
          };
        });
        expect(geometry.first).toBe(true);
        expect(Math.abs(geometry.x)).toBeLessThanOrEqual(2);
        expect(Math.abs(geometry.y)).toBeLessThanOrEqual(2);
        expect(Math.abs(geometry.width)).toBeLessThanOrEqual(4);
        expect(geometry.background).toBe(geometry.parentBackground);
        expect(geometry.radius).toBe(geometry.parentRadius);
        expect(geometry.overflow).toBeLessThanOrEqual(1);
        expect(geometry.labelOverflow).toBe(true);
      }
    }
    const clear = root.getByRole("button", {
      name: "Clear legacy compact goal",
      exact: true,
    });
    await clear.focus();
    await page.keyboard.press("Enter");
    await expect(clear).toHaveCount(0);
    const results = await new AxeBuilder({ page })
      .include('[aria-label="Chat additions fixture"]')
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test("timeline approval remains host-owned and preserves keyboard focus when resolved", async ({
  page,
}) => {
  const root = await fixture(page);
  const request = root.getByRole("group", { name: "Run npm test?" });
  const editor = root.getByLabel("Settings message", { exact: true });
  await editor.focus();
  await root
    .getByRole("button", { name: "Reset approval" })
    .evaluate((element) => (element as HTMLButtonElement).click());
  await expect(editor).toBeFocused();
  await expect(request.getByRole("button")).toHaveText([
    "Approve",
    "Approve for session",
    "Decline",
  ]);
  const approve = request.getByRole("button", { name: "Approve", exact: true });
  await approve.focus();
  await page.keyboard.press("Enter");
  await expect(request).toHaveAttribute("data-state", "pending");
  await expect(request.getByRole("status")).toHaveText("Decision pending");
  await expect(approve).toBeDisabled();
  await expect(
    request.getByRole("button", { name: "Decline", exact: true }),
  ).toBeDisabled();
  await root
    .getByRole("button", { name: "Resolve approval" })
    .evaluate((element) => (element as HTMLButtonElement).click());
  await expect(request).toHaveAttribute("data-state", "approved");
  await expect(request).toBeFocused();
  await expect(request.getByRole("button")).toHaveCount(0);
  for (const [state, text] of [
    ["approved-for-session", "Approved for this session"],
    ["declined", "Declined"],
    ["expired", "Expired"],
    ["answer-elsewhere", "Answer elsewhere"],
  ]) {
    await root
      .getByLabel("Approval state", { exact: true })
      .selectOption(state);
    await expect(request.getByRole("status")).toHaveText(text);
    await expect(request.getByRole("button")).toHaveCount(0);
  }
  await expect(request).toContainText("Answer in the connected terminal");
  await expect(request.getByRole("status")).toHaveAttribute(
    "aria-live",
    "polite",
  );
});
