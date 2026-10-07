import type { DmMenuSchema } from "@duskmoon-dev/components/dm-menu";

export interface DmLayoutExample {
  title: string;
  description: string;
  initialKey: string;
  controlledCollapse?: boolean;
  menus: DmMenuSchema[];
  pages: Record<string, { title: string; description: string }>;
}

const workspaceMenus: DmMenuSchema[] = [
  { menuName: "Overview", menuUrl: "/workspace", iconStr: "◈" },
  { menuName: "Projects", menuUrl: "/workspace/projects", iconStr: "▦" },
  { menuName: "Reports", menuUrl: "/workspace/reports", iconStr: "▤" },
];
const workspacePages = {
  "/workspace": {
    title: "Workspace overview",
    description: "A shared place to organize the team's current work.",
  },
  "/workspace/projects": {
    title: "Projects",
    description: "Review active projects and plan the next delivery.",
  },
  "/workspace/reports": {
    title: "Reports",
    description: "Track progress across the workspace and recent deliveries.",
  },
};

export const dmLayoutExamples: DmLayoutExample[] = [
  {
    title: "Workspace navigation",
    description:
      "Select a menu item to update the controlled selectedKey, page content, and derived breadcrumb.",
    initialKey: "/workspace",
    menus: workspaceMenus,
    pages: workspacePages,
  },
  {
    title: "Nested navigation and tips",
    description:
      "Nested selection opens its parent menu and derives breadcrumbs and contextual tips from the menu schema.",
    initialKey: "/projects/active",
    menus: [
      {
        menuName: "Projects",
        menuUrl: "/projects",
        iconStr: "▦",
        children: [
          {
            menuName: "Active projects",
            menuUrl: "/projects/active",
            iconStr: "◉",
            tipsEnabled: true,
            tips: "Active projects are ready for the next team review.",
          },
          {
            menuName: "Project archive and completed work",
            menuUrl: "/projects/archive",
            iconStr: "▤",
            tipsEnabled: true,
            tips: "Archived projects stay available for reference.",
          },
        ],
      },
      { menuName: "Members", menuUrl: "/members", iconStr: "◎" },
    ],
    pages: {
      "/projects": {
        title: "Projects",
        description: "Choose active projects or browse completed work.",
      },
      "/projects/active": {
        title: "Active projects",
        description:
          "Keep upcoming milestones and current assignments in view.",
      },
      "/projects/archive": {
        title: "Project archive",
        description:
          "Browse completed work and decisions from earlier deliveries.",
      },
      "/members": {
        title: "Workspace members",
        description: "Review the people contributing to the workspace.",
      },
    },
  },
  {
    title: "Controlled sidebar collapse",
    description:
      "Share collapsed state between the external toggle and onCollapse. Selection and content remain intact when the sidebar changes width.",
    initialKey: "/workspace/projects",
    controlledCollapse: true,
    menus: workspaceMenus,
    pages: workspacePages,
  },
];

export function dmLayoutExampleCode(example: DmLayoutExample) {
  return `import "@duskmoon-dev/components/styles.css";
import { useState } from "react";
import { DmLayout } from "@duskmoon-dev/components/dm-layout";
import type { DmMenuSchema } from "@duskmoon-dev/components/dm-menu";

const menus: DmMenuSchema[] = ${JSON.stringify(example.menus, null, 2)};
const pages: Record<string, { title: string; description: string }> = ${JSON.stringify(example.pages, null, 2)};

export function Example() {
  const [selectedKey, setSelectedKey] = useState(${JSON.stringify(example.initialKey)});${example.controlledCollapse ? "\n  const [collapsed, setCollapsed] = useState(false);" : ""}
  const page = pages[selectedKey];
  return (
    <div style={{ minWidth: 0 }}>${
      example.controlledCollapse
        ? `
      <button type="button" className="btn btn-outline" onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? "Expand sidebar" : "Collapse sidebar"}
      </button>
      <p role="status">Sidebar {collapsed ? "collapsed" : "expanded"}</p>`
        : ""
    }
      <DmLayout
        menus={menus}
        productTitle="Northstar"
        productIcon="◈"
        selectedKey={selectedKey}
        onMenuClick={setSelectedKey}
        onBreadcrumbClick={setSelectedKey}${example.controlledCollapse ? "\n        collapsed={collapsed}\n        onCollapse={setCollapsed}" : ""}
        style={{ minHeight: 320 }}
      >
        <section aria-label="Workspace page" style={{ minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: 20 }}>{page.title}</h3>
          <p style={{ lineHeight: 1.6 }}>{page.description}</p>
          <p style={{ fontSize: 12, overflowWrap: "anywhere" }}>Current page: {selectedKey}</p>
        </section>
      </DmLayout>
    </div>
  );
}`;
}

export const dmLayoutDemoExamples = dmLayoutExamples.map((example) => ({
  title: example.title,
  description: example.description,
  code: dmLayoutExampleCode(example),
  source: "authored" as const,
}));
