import React from "react";
import * as DmComponents from "@duskmoon-dev/components";

function UserIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="8" r="3.25" />
      <path strokeLinecap="round" d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
    </svg>
  );
}

function actionItems() {
  return [
    { key: "overview", label: "Overview", icon: <UserIcon /> },
    { key: "members", label: "Members", icon: <UserIcon /> },
    {
      key: "delete",
      label: "Delete workspace",
      danger: true,
      icon: <UserIcon />,
    },
    {
      key: "invite",
      label: "Invite member",
      disabled: true,
      icon: <UserIcon />,
    },
  ];
}

function PreviewFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="dropdown-button-danger-preview"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 16,
        alignItems: "flex-start",
      }}
    >
      {children}
    </div>
  );
}

function SplitButtonsPreview() {
  return (
    <DmComponents.Dropdown.Button
      appearance="outline"
      color="base"
      menu={{ items: actionItems() }}
    >
      Actions
    </DmComponents.Dropdown.Button>
  );
}

function CustomTriggerIconPreview() {
  return (
    <DmComponents.Dropdown.Button
      appearance="outline"
      color="base"
      buttonsRender={(buttons) => [
        buttons[0],
        React.cloneElement(
          buttons[1] as React.ReactElement<{ children?: React.ReactNode }>,
          { children: <UserIcon /> },
        ),
      ]}
      menu={{ items: actionItems() }}
    >
      Actions
    </DmComponents.Dropdown.Button>
  );
}

function DisabledSplitButtonPreview() {
  return (
    <DmComponents.Dropdown.Button
      appearance="outline"
      color="base"
      disabled
      menu={{ items: actionItems() }}
    >
      Actions
    </DmComponents.Dropdown.Button>
  );
}

function TooltipTriggerPreview() {
  return (
    <DmComponents.Dropdown.Button
      appearance="outline"
      color="base"
      buttonsRender={(buttons) => [
        buttons[0],
        <DmComponents.Tooltip
          key="trigger"
          id="dropdown-trigger-help"
          title="Open workspace actions"
        >
          {buttons[1]}
        </DmComponents.Tooltip>,
      ]}
      menu={{ items: actionItems() }}
    >
      Actions
    </DmComponents.Dropdown.Button>
  );
}

function ButtonAndDangerPreview() {
  return (
    <PreviewFrame>
      <DmComponents.Dropdown
        trigger={["click"]}
        menu={{ items: actionItems() }}
      >
        <DmComponents.Button
          appearance="outline"
          color="base"
          rightIcon={<ChevronDownIcon />}
        >
          Actions
        </DmComponents.Button>
      </DmComponents.Dropdown>
      <DmComponents.Dropdown.Button
        appearance="outline"
        color="error"
        menu={{ items: actionItems() }}
      >
        Delete
      </DmComponents.Dropdown.Button>
    </PreviewFrame>
  );
}

function MenuItemStatesPreview() {
  return (
    <DmComponents.Dropdown.Button
      appearance="outline"
      color="base"
      defaultOpen
      menu={{ items: actionItems() }}
    >
      Actions
    </DmComponents.Dropdown.Button>
  );
}

export function DropdownPreview({ demoTitle }: { demoTitle: string }) {
  switch (demoTitle) {
    case "Split buttons":
      return <SplitButtonsPreview />;
    case "Custom trigger icon":
      return <CustomTriggerIconPreview />;
    case "Disabled split button":
      return <DisabledSplitButtonPreview />;
    case "Tooltip on trigger":
      return <TooltipTriggerPreview />;
    case "Button and danger":
      return <ButtonAndDangerPreview />;
    case "Menu item states":
      return <MenuItemStatesPreview />;
    default:
      return null;
  }
}

export function isDropdownPreviewDemo(demoTitle: string) {
  return [
    "Split buttons",
    "Custom trigger icon",
    "Disabled split button",
    "Tooltip on trigger",
    "Button and danger",
    "Menu item states",
  ].includes(demoTitle);
}
