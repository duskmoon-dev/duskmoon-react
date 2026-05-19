import { expect, test, describe } from "bun:test";
import { css } from "@duskmoon-dev/core/components/button";
import { 
  buttonBaseClass, 
  buttonColorClasses, 
  buttonAppearanceClasses, 
  buttonShapeClasses, 
  buttonSizeClasses, 
  buttonBlockClass,
  buttonIsLoadingClass,
  getButtonClasses
} from "../../classes/button";
import type { 
  ButtonColor, 
  ButtonAppearance, 
  ButtonShape, 
  ButtonSize 
} from "./Button.types";

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
    expect(coreClasses.has(buttonIsLoadingClass)).toBe(true);
  });

  test("all color classes exist in core CSS", () => {
    for (const color of Object.keys(buttonColorClasses) as ButtonColor[]) {
      const className = buttonColorClasses[color];
      if (className) expect(coreClasses.has(className)).toBe(true);
    }
  });

  test("all appearance classes exist in core CSS", () => {
    for (const appearance of Object.keys(buttonAppearanceClasses) as ButtonAppearance[]) {
      const className = buttonAppearanceClasses[appearance];
      if (className) expect(coreClasses.has(className)).toBe(true);
    }
  });

  test("all shape classes exist in core CSS", () => {
    for (const shape of Object.keys(buttonShapeClasses) as ButtonShape[]) {
      const className = buttonShapeClasses[shape];
      if (className) expect(coreClasses.has(className)).toBe(true);
    }
  });

  test("all size classes exist in core CSS", () => {
    for (const size of Object.keys(buttonSizeClasses) as ButtonSize[]) {
      const className = buttonSizeClasses[size];
      if (className) expect(coreClasses.has(className)).toBe(true);
    }
  });

  test("block class exists in core CSS", () => {
    expect(coreClasses.has(buttonBlockClass)).toBe(true);
  });

  test("getButtonClasses generates valid classes", () => {
    const classes = getButtonClasses({ 
      color: "primary", 
      appearance: "outline", 
      shape: "square", 
      size: "lg", 
      block: true, 
      isLoading: true 
    });
    const classList = classes.split(" ");
    for (const cls of classList) {
      if (cls.trim() !== "") {
        expect(coreClasses.has(cls)).toBe(true);
      }
    }
  });
});

