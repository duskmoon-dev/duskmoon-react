import { describe, expect, test } from "bun:test";
import { getComponentDocs } from "./component-docs";
import { DOC_CATEGORIES } from "./docs-categories";
import {
  categoriesForSection,
  DOC_SECTIONS,
  sectionForCategory,
  UTILITY_TOOLS,
} from "./docs-sections";
import { JSON_FORM_PRESETS } from "./json-form-presets";

describe("documentation sections", () => {
  test("assigns each existing category to one section", () => {
    const assigned = DOC_SECTIONS.flatMap(({ categoryIds }) => categoryIds);
    expect(assigned).toEqual(DOC_CATEGORIES.map(({ id }) => id));
    expect(new Set(assigned).size).toBe(assigned.length);
  });

  test("keeps detail routes while browsing within the owning section", () => {
    const docs = getComponentDocs();
    const form = docs.find(({ id }) => id === "form")!;
    const art = docs.find(({ id }) => id === "art-moon")!;

    expect(sectionForCategory(form.categoryId)).toBe("components");
    expect(sectionForCategory(art.categoryId)).toBe("css-art");
    expect(form.route).toEndWith("/components/form");
    expect(art.route).toEndWith("/components/art-moon");

    for (const section of DOC_SECTIONS) {
      const entries = categoriesForSection(section.id, docs).flatMap(
        ([, items]) => items,
      );
      expect(
        entries.every(
          ({ categoryId }) => sectionForCategory(categoryId) === section.id,
        ),
      ).toBe(true);
    }

    expect(UTILITY_TOOLS).toEqual([
      {
        id: "json-schema-form",
        title: "JSON Schema Form",
        path: "/utilities/form/",
        description: "Generate and submit a form from a JSON Schema.",
      },
      ...JSON_FORM_PRESETS.map(({ id, title, description }) => ({
        id,
        title,
        description,
        path: `/utilities/form/${id}/`,
      })),
    ]);
    expect(UTILITY_TOOLS).toHaveLength(28);
    for (const { id } of JSON_FORM_PRESETS) {
      expect(UTILITY_TOOLS.find((tool) => tool.id === id)?.path).toBe(
        `/utilities/form/${id}/`,
      );
    }
  });
});
