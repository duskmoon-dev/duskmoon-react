import type { ComponentDoc } from "./component-docs";
import { DOC_CATEGORIES, type DocCategoryId } from "./docs-categories";
import { JSON_FORM_PRESETS } from "./json-form-presets";

export const DOC_SECTIONS = [
  {
    id: "components",
    title: "Components",
    path: "/",
    categoryIds: [
      "actions",
      "layout",
      "navigation",
      "data-entry",
      "data-display",
      "feedback",
      "surfaces",
    ],
  },
  {
    id: "css-art",
    title: "CSS Art",
    path: "/css-art/",
    categoryIds: ["css-art"],
  },
  {
    id: "theming",
    title: "Theming",
    path: "/theming/",
    categoryIds: ["theming"],
  },
  {
    id: "utilities",
    title: "Utilities",
    path: "/utilities/",
    categoryIds: ["utilities"],
  },
] as const satisfies readonly {
  id: string;
  title: string;
  path: string;
  categoryIds: readonly DocCategoryId[];
}[];

export type DocSectionId = (typeof DOC_SECTIONS)[number]["id"];
export type CatalogSectionId = DocSectionId;

export const UTILITY_TOOLS = [
  {
    id: "json-schema-form",
    title: "JSON Schema Form",
    path: "/utilities/form/",
    description: "Generate and submit a form from a JSON Schema.",
  },
  ...JSON_FORM_PRESETS.map((preset) => ({
    id: preset.id,
    title: preset.title,
    path: `/utilities/form/${preset.id}/`,
    description: preset.description,
  })),
] as const;

export type UtilityToolId = (typeof UTILITY_TOOLS)[number]["id"];

export function sectionForCategory(
  categoryId: DocCategoryId,
): CatalogSectionId {
  const section = DOC_SECTIONS.find(({ categoryIds }) =>
    (categoryIds as readonly DocCategoryId[]).includes(categoryId),
  );
  if (!section)
    throw new Error(`No documentation section for category "${categoryId}"`);
  return section.id as CatalogSectionId;
}

export function sectionById(id: DocSectionId) {
  return DOC_SECTIONS.find((section) => section.id === id)!;
}

export function categoriesForSection(
  sectionId: DocSectionId,
  docs: ComponentDoc[],
) {
  const section = sectionById(sectionId);
  return DOC_CATEGORIES.filter(({ id }) =>
    (section.categoryIds as readonly DocCategoryId[]).includes(id),
  )
    .map(
      (category) =>
        [
          category.title,
          docs.filter((doc) => doc.categoryId === category.id),
        ] as [string, ComponentDoc[]],
    )
    .filter(([, items]) => items.length > 0);
}
