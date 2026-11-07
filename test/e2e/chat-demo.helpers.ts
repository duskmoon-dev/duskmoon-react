import { expect, type Locator } from "@playwright/test";

export async function openAdd(root: Locator) {
  const panel = root.getByRole("group", {
    name: "Add files and more",
    exact: true,
    includeHidden: true,
  });
  if (!(await panel.evaluate((element) => element.matches(":popover-open")))) {
    await root
      .getByRole("button", { name: "Add files and more", exact: true })
      .click();
  }
  await expect(panel).toBeVisible();
  return panel;
}

export async function openControls(root: Locator) {
  const panel = root.getByRole("group", {
    name: "Demo controls",
    exact: true,
    includeHidden: true,
  });
  if (!(await panel.evaluate((element) => element.matches(":popover-open")))) {
    await openAdd(root);
    await root
      .getByRole("button", { name: "Demo controls", exact: true })
      .click();
  }
  await expect(panel).toBeVisible();
  return panel;
}

export async function closeMenus(root: Locator) {
  for (
    let count = 0;
    count < 8 && (await root.locator("[popover]:popover-open").count());
    count++
  ) {
    await root.page().keyboard.press("Escape");
  }
  await expect(root.locator("[popover]:visible")).toHaveCount(0);
}

export async function demoAction(root: Locator, name: string) {
  await openControls(root);
  await root.getByRole("button", { name, exact: true }).click();
  await closeMenus(root);
}

export async function openModel(root: Locator) {
  const panel = root.getByRole("group", {
    name: "Composer model settings",
    exact: true,
    includeHidden: true,
  });
  if (!(await panel.evaluate((element) => element.matches(":popover-open")))) {
    await root.getByRole("button", { name: /^Model settings:/ }).click();
  }
  await expect(panel).toBeVisible();
  return panel;
}

export async function chooseModel(root: Locator, name: string) {
  await openModel(root);
  await root.getByRole("button", { name: /^Choose a model:/ }).click();
  await root.getByRole("button", { name, exact: true }).click();
}
