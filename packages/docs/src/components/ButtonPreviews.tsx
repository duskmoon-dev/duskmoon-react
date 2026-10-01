import React from "react";
import * as DmComponents from "@duskmoon-dev/components";

const appearances = ["filled", "outline", "tonal", "ghost", "text"] as const;

function AppearancePreview() {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {appearances.map((appearance) => (
        <DmComponents.Button key={appearance} appearance={appearance}>
          {appearance}
        </DmComponents.Button>
      ))}
    </div>
  );
}

function LoadingPreview() {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {appearances.map((appearance) => (
        <div
          key={appearance}
          style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}
        >
          <span style={{ minWidth: 68 }}>{appearance}</span>
          <DmComponents.Button appearance={appearance} isLoading>
            Saving
          </DmComponents.Button>
          <DmComponents.Button appearance={appearance} size="sm" isLoading>
            Saving
          </DmComponents.Button>
          <DmComponents.Button appearance={appearance} size="lg" isLoading>
            Saving
          </DmComponents.Button>
        </div>
      ))}
    </div>
  );
}

function InteractiveLoadingPreview() {
  const [isLoading, setIsLoading] = React.useState(false);
  const timeoutRef = React.useRef<number | null>(null);

  React.useEffect(() => () => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
  }, []);

  function save() {
    setIsLoading(true);
    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null;
      setIsLoading(false);
    }, 900);
  }

  return (
    <div style={{ display: "grid", gap: 8, justifyItems: "start" }}>
      <DmComponents.Button isLoading={isLoading} onClick={save}>
        Save changes
      </DmComponents.Button>
      <span role="status">{isLoading ? "Saving changes…" : "Ready to save"}</span>
    </div>
  );
}

function DisabledPreview() {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {appearances.map((appearance) => (
        <DmComponents.Button key={appearance} appearance={appearance} disabled>
          {appearance}
        </DmComponents.Button>
      ))}
    </div>
  );
}

function IconPreview() {
  const addIcon = <svg aria-hidden="true" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M12 5v14M5 12h14" /></svg>;
  const downloadIcon = <svg aria-hidden="true" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m-4-4 4 4 4-4M4 17v3h16v-3" /></svg>;
  const closeIcon = <svg aria-hidden="true" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" /></svg>;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <DmComponents.Button leftIcon={addIcon}>
          Add item
        </DmComponents.Button>
        <DmComponents.Button
          appearance="outline"
          rightIcon={downloadIcon}
        >
          Download
        </DmComponents.Button>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <DmComponents.Button shape="circle" aria-label="Close">
          {closeIcon}
        </DmComponents.Button>
        <DmComponents.Button shape="circle" size="sm" appearance="outline" aria-label="Add">
          {addIcon}
        </DmComponents.Button>
        <DmComponents.Button shape="circle" size="lg" appearance="tonal" aria-label="Close">
          {closeIcon}
        </DmComponents.Button>
        <DmComponents.Button shape="square" appearance="outline" aria-label="Add">
          {addIcon}
        </DmComponents.Button>
      </div>
    </div>
  );
}

function TooltipPreview() {
  return (
    <DmComponents.Tooltip id="save-help" title="Save your changes" defaultOpen>
      <DmComponents.Button>Save</DmComponents.Button>
    </DmComponents.Tooltip>
  );
}

function ConfirmationPreview() {
  const [deletedCount, setDeletedCount] = React.useState(0);

  return (
    <div style={{ display: "grid", gap: 8, justifyItems: "start" }}>
      <DmComponents.Button
        color="error"
        confirm={{
          title: "Delete this item?",
          message: "This action cannot be undone.",
          confirmText: "Delete",
          cancelText: "Cancel",
        }}
        onClick={() => setDeletedCount((count) => count + 1)}
      >
        Delete item
      </DmComponents.Button>
      <span role="status">Confirmed deletions: {deletedCount}</span>
    </div>
  );
}

function DeleteConfirmContent() {
  return <p>Delete this draft and discard its unsaved changes?</p>;
}

function CustomConfirmationPreview() {
  const [deletedCount, setDeletedCount] = React.useState(0);

  return (
    <div style={{ display: "grid", gap: 8, justifyItems: "start" }}>
      <DmComponents.Button
        color="error"
        confirm={{ component: <DeleteConfirmContent /> }}
        onClick={() => setDeletedCount((count) => count + 1)}
      >
        Delete draft
      </DmComponents.Button>
      <span role="status">Confirmed draft deletions: {deletedCount}</span>
    </div>
  );
}

export function ButtonPreview({ demoTitle }: { demoTitle: string }) {
  switch (demoTitle) {
    case "Appearances":
      return <AppearancePreview />;
    case "Loading states":
      return <LoadingPreview />;
    case "Interactive loading":
      return <InteractiveLoadingPreview />;
    case "Disabled states":
      return <DisabledPreview />;
    case "Icon buttons":
      return <IconPreview />;
    case "Tooltip composition":
      return <TooltipPreview />;
    case "Confirmation popover form":
      return <ConfirmationPreview />;
    case "Custom confirmation content":
      return <CustomConfirmationPreview />;
    default:
      return null;
  }
}

export function isButtonPreviewDemo(demoTitle: string) {
  return [
    "Appearances",
    "Loading states",
    "Interactive loading",
    "Disabled states",
    "Icon buttons",
    "Tooltip composition",
    "Confirmation popover form",
    "Custom confirmation content",
  ].includes(demoTitle);
}
