import React, { useState } from "react";
import { DmLayout } from "@duskmoon-dev/components/dm-layout";
import {
  dmLayoutExamples,
  type DmLayoutExample,
} from "../lib/dm-layout-demo-examples";

function WorkspacePreview({ example }: { example: DmLayoutExample }) {
  const [selectedKey, setSelectedKey] = useState(example.initialKey);
  const [collapsed, setCollapsed] = useState(false);
  const page = example.pages[selectedKey];

  return (
    <div
      className="dm-layout-demo"
      data-dm-layout-demo={example.title}
      style={{ minWidth: 0, width: "100%" }}
    >
      {example.controlledCollapse ? (
        <>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? "Expand sidebar" : "Collapse sidebar"}
          </button>
          <p role="status">Sidebar {collapsed ? "collapsed" : "expanded"}</p>
        </>
      ) : null}
      <DmLayout
        menus={example.menus}
        productTitle="Northstar"
        productIcon="◈"
        selectedKey={selectedKey}
        onMenuClick={setSelectedKey}
        onBreadcrumbClick={setSelectedKey}
        collapsed={example.controlledCollapse ? collapsed : undefined}
        onCollapse={example.controlledCollapse ? setCollapsed : undefined}
        style={{ minHeight: 320 }}
      >
        <section aria-label="Workspace page" style={{ minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: 20 }}>{page.title}</h3>
          <p style={{ lineHeight: 1.6 }}>{page.description}</p>
          <p style={{ fontSize: 12, overflowWrap: "anywhere" }}>
            Current page: {selectedKey}
          </p>
        </section>
      </DmLayout>
    </div>
  );
}

export function DmLayoutPreview({ demoTitle }: { demoTitle: string }) {
  const example = dmLayoutExamples.find((entry) => entry.title === demoTitle);
  return example ? (
    <WorkspacePreview key={example.title} example={example} />
  ) : null;
}
