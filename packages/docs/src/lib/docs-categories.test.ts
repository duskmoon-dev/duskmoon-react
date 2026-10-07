import { describe, expect, test } from "bun:test";
import { getComponentDocs, getDocsByCategory } from "./component-docs";
import { categoryForTarget, DOC_CATEGORIES } from "./docs-categories";

describe("documentation categories", () => {
  test("defines categories in the approved order", () => {
    expect(DOC_CATEGORIES.map(({ id, title }) => [id, title])).toEqual([
      ["actions", "Actions"],
      ["layout", "Layout"],
      ["navigation", "Navigation"],
      ["data-entry", "Data Entry"],
      ["data-display", "Data Display"],
      ["feedback", "Feedback"],
      ["surfaces", "Surfaces"],
      ["css-art", "CSS Art"],
      ["theming", "Theming & Configuration"],
      ["utilities", "Utilities & Types"],
    ]);
    expect(
      DOC_CATEGORIES.every(({ description }) => description.length > 0),
    ).toBe(true);
  });

  test("groups standard and Dm counterparts by purpose", () => {
    const groups = getDocsByCategory();

    expect(groups.get("Actions")?.map(({ id }) => id)).toContain("button");
    expect(groups.get("Actions")?.map(({ id }) => id)).toContain("dm-toolbar");
    expect(groups.get("Data Display")?.map(({ id }) => id)).toContain("table");
    expect(groups.get("Data Display")?.map(({ id }) => id)).toContain(
      "dm-table",
    );
    expect(groups.get("Data Entry")?.map(({ id }) => id)).toContain(
      "date-picker",
    );
    expect(groups.get("Data Entry")?.map(({ id }) => id)).toContain(
      "dm-date-picker",
    );
    expect(groups.get("Layout")?.map(({ id }) => id)).toContain("layout");
    expect(groups.get("Layout")?.map(({ id }) => id)).toContain("dm-layout");
    expect(groups.get("Navigation")?.map(({ id }) => id)).toContain(
      "breadcrumb",
    );
    expect(groups.get("Navigation")?.map(({ id }) => id)).toContain(
      "dm-breadcrumb",
    );
    expect(groups.get("Feedback")?.map(({ id }) => id)).toContain("message");
    expect(groups.get("Feedback")?.map(({ id }) => id)).toContain("dm-message");
    expect(groups.get("Surfaces")?.map(({ id }) => id)).toContain("drawer");
    expect(groups.get("Surfaces")?.map(({ id }) => id)).toContain("dm-drawer");
  });

  test("classifies all current documents exactly once and preserves routes", () => {
    const docs = getComponentDocs();
    const categoryIds = new Set(DOC_CATEGORIES.map(({ id }) => id));

    expect(docs).toHaveLength(128);
    expect(new Set(docs.map(({ id }) => id)).size).toBe(docs.length);
    expect(new Set(docs.map(({ route }) => route)).size).toBe(docs.length);
    expect(docs.every(({ categoryId }) => categoryIds.has(categoryId))).toBe(
      true,
    );
    expect(
      docs.every(
        ({ categoryId, category }) =>
          DOC_CATEGORIES.find(({ id }) => id === categoryId)?.title ===
          category,
      ),
    ).toBe(true);

    const groups = getDocsByCategory();
    expect([...groups.keys()]).toEqual(
      DOC_CATEGORIES.map(({ title }) => title).filter((title) =>
        groups.has(title),
      ),
    );
    expect([...groups.values()].every((group) => group.length > 0)).toBe(true);
    expect([...groups.values()].flat()).toHaveLength(docs.length);
  });

  test("links the published JSON Schema renderer to its existing guide", () => {
    const doc = getComponentDocs().find(({ id }) => id === "json-schema-form");
    expect(doc?.categoryId).toBe("data-entry");
    expect(doc?.route).toBe("/utilities/form/");
    expect(doc?.importPath).toBe("@duskmoon-dev/components/json-schema-form");
  });

  test("keeps API references, art, and unknown targets explicit", () => {
    expect(
      categoryForTarget({ id: "dm-table", kind: "dm-workflow-component" }),
    ).toBe("data-display");
    expect(categoryForTarget({ id: "art-moon", kind: "art-component" })).toBe(
      "css-art",
    );
    expect(
      categoryForTarget({ id: "theme", kind: "infrastructure-export" }),
    ).toBe("theming");
    expect(
      categoryForTarget({
        id: "use-persisted-page-size",
        kind: "infrastructure-export",
      }),
    ).toBe("utilities");
    expect(() =>
      categoryForTarget({ id: "future-target", kind: "standard-component" }),
    ).toThrow(
      'Unknown documentation classification for target "future-target"',
    );
  });

  test.each(["toString", "constructor", "__proto__"])(
    "rejects inherited property name %s as an unknown target",
    (id) => {
      expect(() =>
        categoryForTarget({ id, kind: "standard-component" }),
      ).toThrow(`Unknown documentation classification for target "${id}"`);
    },
  );
});
