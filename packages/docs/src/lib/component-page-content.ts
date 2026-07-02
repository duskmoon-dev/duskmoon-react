export type ComponentPageFeature = {
  title: string;
  description: string;
};

export type ComponentUsageNote = {
  title: string;
  description: string;
};

export type ComponentPageContent = {
  summary: string;
  whenToUse: string[];
  featureHighlights: ComponentPageFeature[];
  usageNotes: ComponentUsageNote[];
  demoIntro: string;
  apiIntro: string;
};

type ComponentPageContentInput = {
  id: string;
  name: string;
  kind: string;
  category: string;
  source: string;
  scenarios: string[];
  keyProps: string[];
};

type ComponentFamily =
  | "art"
  | "data"
  | "display"
  | "feedback"
  | "form"
  | "infrastructure"
  | "layout"
  | "navigation"
  | "overlay"
  | "workflow";

const dataIds = new Set([
  "calendar",
  "descriptions",
  "list",
  "statistic",
  "table",
  "timeline",
  "transfer",
  "tree",
  "watermark",
  "dm-table",
  "dm-pro-table",
  "dm-tree",
  "dm-status",
  "dm-infinite-scroll",
]);

const displayIds = new Set([
  "avatar",
  "badge",
  "card",
  "collapse",
  "divider",
  "empty",
  "image",
  "progress",
  "qr-code",
  "result",
  "skeleton",
  "spin",
  "tag",
  "typography",
]);

const feedbackIds = new Set([
  "alert",
  "app",
  "message",
  "modal",
  "notification",
  "popconfirm",
  "tour",
  "dm-message",
]);

const formIds = new Set([
  "auto-complete",
  "button",
  "cascader",
  "checkbox",
  "color-picker",
  "date-picker",
  "form",
  "input",
  "input-number",
  "mentions",
  "radio",
  "rate",
  "segmented",
  "select",
  "slider",
  "switch",
  "time-picker",
  "tree-select",
  "upload",
  "dm-date-picker",
  "dm-query",
  "dm-search",
]);

const layoutIds = new Set([
  "col",
  "flex",
  "grid",
  "layout",
  "row",
  "space",
  "splitter",
  "dm-layout",
  "dm-splitter",
  "dm-truncate",
]);

const navigationIds = new Set([
  "anchor",
  "affix",
  "back-top",
  "breadcrumb",
  "carousel",
  "dropdown",
  "float-button",
  "menu",
  "pagination",
  "steps",
  "tabs",
  "dm-breadcrumb",
  "dm-menu",
  "dm-pagination",
  "dm-tabs",
  "dm-page-header",
  "dm-toolbar",
]);

const overlayIds = new Set(["drawer", "popover", "tooltip", "dm-drawer"]);

const purposeById: Record<string, string> = {
  affix:
    "pins supporting actions or navigation to the viewport while the surrounding document continues to scroll.",
  alert:
    "communicates important inline status, validation, or operational messages without interrupting the current workflow.",
  anchor:
    "builds in-page navigation for long documentation or settings screens.",
  app: "provides application-level holders for message and notification APIs.",
  "auto-complete":
    "pairs text entry with suggested options for searchable pickers and command inputs.",
  avatar:
    "represents a person, team, object, or entity in compact UI surfaces.",
  "back-top": "gives long pages a persistent return-to-top affordance.",
  badge:
    "adds short status, count, or classification markers around nearby content.",
  breadcrumb:
    "shows the current location in a nested route or information hierarchy.",
  button: "triggers primary, secondary, destructive, or icon-only actions.",
  calendar:
    "renders date-oriented browsing and selection with month and year modes.",
  card: "groups related content and actions into a small self-contained surface.",
  carousel:
    "cycles through a limited set of panels while keeping one panel in focus.",
  cascader:
    "selects a value from a nested hierarchy without exposing the whole tree at once.",
  checkbox: "captures independent boolean or multi-select choices.",
  col: "defines responsive grid columns inside row-based layouts.",
  collapse:
    "hides and reveals optional sections without leaving the current page.",
  "color-picker":
    "captures theme colors, brand swatches, or user-selected color values.",
  "config-provider": "passes component configuration through a subtree.",
  "date-picker":
    "captures single dates and related date-picker states with typed callbacks.",
  descriptions:
    "presents labeled record fields for summaries, details, and review screens.",
  divider: "separates dense content while preserving visual rhythm.",
  drawer: "opens side-panel workflows without replacing the underlying screen.",
  dropdown: "attaches contextual action menus to a compact trigger.",
  empty: "explains an empty content state and gives the user a next step.",
  flex: "arranges inline or wrapping content with a small layout API.",
  "float-button":
    "keeps a high-priority shortcut available over the page content.",
  form: "coordinates form state, validation, field layout, and submit handling.",
  grid: "exposes responsive breakpoint information for adaptive layouts.",
  image: "renders images with preview and placeholder behavior.",
  input: "captures short text, search, password, and textarea input.",
  "input-number": "captures bounded numeric values with step controls.",
  layout:
    "composes application shells with header, sider, content, and footer regions.",
  list: "renders repeated records with item metadata and secondary actions.",
  mentions: "captures text input with mention suggestions.",
  menu: "renders structured navigation or action lists.",
  message: "shows transient global feedback after user actions.",
  modal: "blocks for confirmation, focused forms, and critical decisions.",
  notification: "shows global notices that need more context than a message.",
  pagination: "moves through large result sets with page and size controls.",
  popconfirm: "asks for confirmation around a risky inline action.",
  popover: "shows rich contextual content attached to a trigger.",
  progress: "visualizes completion, loading, or capacity state.",
  "qr-code": "encodes a URL or payload for handoff to another device.",
  radio: "captures one choice from a mutually exclusive set.",
  rate: "captures or displays simple rating values.",
  result: "summarizes the outcome of a completed workflow.",
  row: "creates guttered horizontal grid layouts.",
  segmented: "switches between a small number of sibling modes.",
  select: "chooses one or more values from a bounded option set.",
  skeleton:
    "shows a stable loading placeholder that matches the future content shape.",
  slider: "captures a value or range on a continuous scale.",
  space: "applies consistent spacing between neighboring elements.",
  spin: "shows local loading state for a pending operation.",
  splitter: "creates resizable panels for workspace-style layouts.",
  statistic: "emphasizes a metric, count, or countdown.",
  steps: "shows progress through an ordered workflow.",
  switch: "toggles an immediate on/off setting.",
  table:
    "renders structured data with columns, sorting, filters, selection, and pagination.",
  tabs: "switches between related content panels in the same context.",
  tag: "labels records with compact metadata or removable filters.",
  "time-picker": "captures time values with typed parsing and status state.",
  timeline: "shows ordered events, milestones, or audit history.",
  tooltip: "adds short explanatory text to compact controls.",
  tour: "walks users through key areas of an interface.",
  transfer: "moves records between available and selected lists.",
  tree: "renders hierarchical data with selection, expansion, and checking.",
  "tree-select": "combines tree selection with compact form input behavior.",
  typography:
    "standardizes text, title, paragraph, link, copy, edit, and ellipsis behavior.",
  upload:
    "collects files with validation, file-list management, and custom request hooks.",
  watermark: "adds repeated ownership or confidentiality marks behind content.",
};

function familyFor(input: ComponentPageContentInput): ComponentFamily {
  if (input.kind === "art-component") return "art";
  if (input.kind === "infrastructure-export") return "infrastructure";
  if (input.kind === "dm-workflow-component") return "workflow";
  if (dataIds.has(input.id)) return "data";
  if (displayIds.has(input.id)) return "display";
  if (feedbackIds.has(input.id)) return "feedback";
  if (formIds.has(input.id)) return "form";
  if (layoutIds.has(input.id)) return "layout";
  if (navigationIds.has(input.id)) return "navigation";
  if (overlayIds.has(input.id)) return "overlay";
  return "display";
}

function featureHighlightsFor(
  input: ComponentPageContentInput,
  family: ComponentFamily,
): ComponentPageFeature[] {
  const scenarioFeature = input.scenarios[0]
    ? {
        title: "Covered behavior",
        description: input.scenarios[0],
      }
    : null;

  const keyApiFeature =
    input.keyProps.length > 0
      ? {
          title: "Primary API surface",
          description: `${input.name} is most often configured through ${input.keyProps
            .slice(0, 4)
            .map((prop) => `\`${prop}\``)
            .join(", ")}.`,
        }
      : null;

  const familyFeatures: Record<ComponentFamily, ComponentPageFeature[]> = {
    art: [
      {
        title: "CSS-art wrapper",
        description:
          "Renders the matching @duskmoon-dev/css-art scene through a typed React component.",
      },
      {
        title: "Accessible decoration",
        description:
          "Defaults to decorative output while allowing aria labels and roles when the scene carries meaning.",
      },
    ],
    data: [
      {
        title: "Structured records",
        description:
          "Designed for repeated or hierarchical content where users scan, compare, and inspect details.",
      },
      {
        title: "Stateful interactions",
        description:
          "Documents the props that control sorting, selection, expansion, pagination, or value changes where available.",
      },
    ],
    display: [
      {
        title: "Visual hierarchy",
        description:
          "Focuses on status, metadata, empty/loading states, or content grouping without owning application state.",
      },
      {
        title: "Theme integration",
        description:
          "Uses DuskMoon tokens so the component follows the active docs theme.",
      },
    ],
    feedback: [
      {
        title: "User feedback",
        description:
          "Covers transient, inline, or blocking feedback patterns for user actions and system status.",
      },
      {
        title: "Action recovery",
        description:
          "Shows how the component keeps next actions visible after success, warning, or failure states.",
      },
    ],
    form: [
      {
        title: "Controlled and uncontrolled usage",
        description:
          "Documents default values, value props, and change callbacks for form integration.",
      },
      {
        title: "Validation state",
        description:
          "Surfaces status, size, disabled, and option data patterns where the component supports them.",
      },
    ],
    infrastructure: [
      {
        title: "Package helper",
        description:
          "Explains the exported helper, hook, or type and where it fits in app setup code.",
      },
      {
        title: "Non-visual API",
        description:
          "Provides typed usage examples even when there is no rendered component preview.",
      },
    ],
    layout: [
      {
        title: "Composition primitive",
        description:
          "Documents spacing, responsive behavior, and nested regions used to build larger screens.",
      },
      {
        title: "Stable geometry",
        description:
          "Examples keep predictable dimensions so the surrounding UI does not jump while content changes.",
      },
    ],
    navigation: [
      {
        title: "Wayfinding",
        description:
          "Covers the route, section, step, or action-list patterns that help users move through an interface.",
      },
      {
        title: "Current state",
        description:
          "Shows selected, active, open, or current props where the component exposes them.",
      },
    ],
    overlay: [
      {
        title: "Contextual surface",
        description:
          "Documents trigger, placement, and open-state patterns for content rendered above the page.",
      },
      {
        title: "Dismissal behavior",
        description:
          "Highlights controlled state and close callbacks where overlays expose them.",
      },
    ],
    workflow: [
      {
        title: "DuskMoon workflow wrapper",
        description:
          "Wraps lower-level primitives into a higher-level DuskMoon-prefixed workflow API.",
      },
      {
        title: "Application defaults",
        description:
          "Examples show the defaults and composition points expected by internal DuskMoon app screens.",
      },
    ],
  };

  return [
    ...familyFeatures[family],
    ...(keyApiFeature ? [keyApiFeature] : []),
    ...(scenarioFeature ? [scenarioFeature] : []),
  ].slice(0, 4);
}

function whenToUseFor(
  input: ComponentPageContentInput,
  family: ComponentFamily,
): string[] {
  const useCases: Record<ComponentFamily, string[]> = {
    art: [
      "Use it when a page needs a reusable DuskMoon visual asset rendered from CSS rather than an image.",
      "Keep it decorative unless the illustration carries information that must be announced.",
    ],
    data: [
      "Use it when users need to scan structured content and act on individual records.",
      "Prefer it over ad hoc markup when the content has repeatable fields, hierarchy, or navigation state.",
    ],
    display: [
      "Use it to clarify state, metadata, content hierarchy, or loading without creating a new workflow.",
      "Pair it with semantic content so visual treatment never becomes the only source of meaning.",
    ],
    feedback: [
      "Use it immediately after user actions or system checks that need visible confirmation.",
      "Choose the least interruptive feedback surface that still makes the state clear.",
    ],
    form: [
      "Use it inside forms, filters, settings, and any workflow that captures user input.",
      "Prefer controlled props when the value must stay synchronized with application state.",
    ],
    infrastructure: [
      "Use it in setup, integration, or type-level code rather than as visible page content.",
      "Keep usage close to the application boundary so global configuration remains easy to audit.",
    ],
    layout: [
      "Use it to build predictable page, toolbar, panel, or grid structure.",
      "Keep layout primitives responsible for geometry and let child components own behavior.",
    ],
    navigation: [
      "Use it when users need to move between sections, pages, steps, or contextual actions.",
      "Expose current and disabled state so navigation remains clear to keyboard and screen-reader users.",
    ],
    overlay: [
      "Use it when supporting content should stay attached to a trigger or task context.",
      "Prefer controlled open state when the surrounding workflow needs to react to dismissal.",
    ],
    workflow: [
      "Use it in DuskMoon application screens that need a packaged, opinionated workflow component.",
      "Reach for the lower-level standard component when the screen needs custom composition.",
    ],
  };

  return useCases[family];
}

function usageNotesFor(
  input: ComponentPageContentInput,
  family: ComponentFamily,
): ComponentUsageNote[] {
  const importNote =
    input.kind === "art-component"
      ? {
          title: "Stylesheet",
          description:
            "Import @duskmoon-dev/art-components/styles.css once before rendering art components.",
        }
      : {
          title: "Stylesheet",
          description:
            "Import @duskmoon-dev/components/styles.css once in the app or docs shell.",
        };
  const stateNote: ComponentUsageNote =
    family === "infrastructure"
      ? {
          title: "Runtime placement",
          description:
            "Use helper exports at application setup boundaries or in typed utility modules.",
        }
      : {
          title: "State",
          description:
            "Start with default props for static examples, then switch to controlled props when state must be shared.",
        };
  const themeNote: ComponentUsageNote =
    family === "art"
      ? {
          title: "Sizing",
          description:
            "Use the size prop and CSS custom properties to adapt the scene without replacing markup.",
        }
      : {
          title: "Theme",
          description:
            "The preview inherits the active DuskMoon data-theme value from the docs layout.",
        };

  return [importNote, stateNote, themeNote];
}

export function componentPageContentFor(
  input: ComponentPageContentInput,
): ComponentPageContent {
  const family = familyFor(input);
  const purpose =
    purposeById[input.id] ??
    (input.kind === "art-component"
      ? `renders the ${input.name} CSS-art scene as a reusable React component.`
      : `documents the ${input.name} export from ${input.source}.`);

  return {
    summary: `${input.name} ${purpose}`,
    whenToUse: whenToUseFor(input, family),
    featureHighlights: featureHighlightsFor(input, family),
    usageNotes: usageNotesFor(input, family),
    demoIntro:
      family === "infrastructure"
        ? "These examples focus on typed integration because the export does not render a component preview."
        : "Feature demos are authored for the component page, then supplemented with behavior scenarios from the component test coverage.",
    apiIntro:
      input.keyProps.length > 0
        ? `The API reference below lists every parsed exported type or interface for ${input.name}. Start with ${input.keyProps
            .slice(0, 4)
            .map((prop) => `\`${prop}\``)
            .join(", ")} for common usage.`
        : `The API reference below lists every parsed exported type or interface for ${input.name}.`,
  };
}
