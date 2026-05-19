import { expect, test, describe } from "bun:test";
import { css } from "@duskmoon-dev/core/components/button";
import { getButtonClasses } from "./Button.classes";
import { buttonVariantClasses, buttonSizeClasses, buttonBaseClass, buttonLoadingClass } from "../../classes/button";
import type { ButtonVariant, ButtonSize } from "./Button.types";

describe("Button classes integration with @duskmoon-dev/core", () => {
  // Extract all class names from the raw CSS string
  // A simple regex to find all class definitions (e.g. .btn-primary)
  const classRegex = /\.([a-zA-Z0-9_-]+)/g;
  const coreClasses = new Set<string>();
  let match;
  while ((match = classRegex.exec(css)) !== null) {
    coreClasses.add(match[1]);
  }

  test("base class exists in core CSS", () => {
    expect(coreClasses.has(buttonBaseClass)).toBe(true);
  });

  test("loading class exists in core CSS", () => {
    expect(coreClasses.has(buttonLoadingClass)).toBe(true);
  });

  test("all variant classes exist in core CSS", () => {
    for (const variant of Object.keys(buttonVariantClasses) as ButtonVariant[]) {
      const className = buttonVariantClasses[variant];
      expect(coreClasses.has(className)).toBe(true);
    }
  });

  test("all size classes exist in core CSS", () => {
    for (const size of Object.keys(buttonSizeClasses) as ButtonSize[]) {
      const className = buttonSizeClasses[size];
      expect(coreClasses.has(className)).toBe(true);
    }
  });

  test("getButtonClasses generates valid classes", () => {
    const classes = getButtonClasses({ variant: "primary", size: "md", isLoading: true });
    // Classes will be "btn btn-primary btn-md btn-loading"
    const classList = classes.split(" ");
    for (const cls of classList) {
      if (cls.trim() !== "") {
        expect(coreClasses.has(cls)).toBe(true);
      }
    }
  });
});
