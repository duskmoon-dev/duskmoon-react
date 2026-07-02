import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { alertColorClasses } from "./classes/alert";
import { autoCompleteColorClasses } from "./classes/auto-complete";
import { badgeColorClasses } from "./classes/badge";
import { buttonColorClasses } from "./classes/button";
import { checkboxColorClasses } from "./classes/checkbox";
import { dividerColorClasses } from "./classes/divider";
import { progressColorClasses } from "./classes/progress";
import { radioColorClasses } from "./classes/radio";
import { rateColorClasses } from "./classes/rate";
import { sliderColorClasses } from "./classes/slider";
import { switchColorClasses } from "./classes/switch";
import { tagColorClasses } from "./classes/tag";
import { timelineMarkerColorClasses } from "./classes/timeline";

const semanticColors = [
  "primary",
  "secondary",
  "tertiary",
  "accent",
  "neutral",
  "base",
  "info",
  "success",
  "warning",
  "error",
] as const;

const colorClassMaps = [
  { name: "Alert", classes: alertColorClasses },
  { name: "AutoComplete", classes: autoCompleteColorClasses },
  { name: "Badge", classes: badgeColorClasses },
  { name: "Button", classes: buttonColorClasses },
  { name: "Checkbox", classes: checkboxColorClasses },
  { name: "Divider", classes: dividerColorClasses },
  { name: "Progress", classes: progressColorClasses },
  { name: "Radio", classes: radioColorClasses },
  { name: "Rate", classes: rateColorClasses },
  { name: "Slider", classes: sliderColorClasses },
  { name: "Switch", classes: switchColorClasses },
  { name: "Tag", classes: tagColorClasses },
  { name: "Timeline", classes: timelineMarkerColorClasses },
];

function getAvailableCssClasses() {
  const coreCss = readFileSync(
    join(import.meta.dir, "../node_modules/@duskmoon-dev/core/dist/index.css"),
    "utf8",
  );
  const localCss = readFileSync(join(import.meta.dir, "styles.css"), "utf8");
  const classes = new Set<string>();

  for (const match of `${coreCss}\n${localCss}`.matchAll(
    /\.([a-zA-Z0-9_-]+)/g,
  )) {
    classes.add(match[1]);
  }

  return classes;
}

describe("semantic color variants", () => {
  test("direct color APIs expose the full semantic palette", () => {
    for (const { name, classes } of colorClassMaps) {
      expect(Object.keys(classes), name).toEqual([...semanticColors]);
    }
  });

  test("every emitted color class has CSS support", () => {
    const availableClasses = getAvailableCssClasses();

    for (const { name, classes } of colorClassMaps) {
      for (const className of Object.values(classes)) {
        for (const token of className.split(/\s+/).filter(Boolean)) {
          expect(availableClasses.has(token), `${name}: ${token}`).toBe(true);
        }
      }
    }
  });
});
