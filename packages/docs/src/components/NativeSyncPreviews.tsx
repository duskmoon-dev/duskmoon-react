import React, { useState } from "react";
import {
  Button,
  ConsolePage,
  Fab,
  Megamenu,
  OtpInput,
  Swap,
} from "@duskmoon-dev/components";

export function OtpInputPreview() {
  const [code, setCode] = useState("");
  return (
    <form onReset={() => setCode("")}>
      <label htmlFor="docs-otp-code">Verification code</label>
      <OtpInput
        id="docs-otp-code"
        name="code"
        length={6}
        required
        aria-describedby="docs-otp-status"
        onChange={(event) => setCode(event.currentTarget.value)}
      />
      <p id="docs-otp-status">Entered {code.length} of 6 digits</p>
      <button type="reset">Reset</button>
    </form>
  );
}

export function SwapPreview() {
  const [dark, setDark] = useState(false);
  return (
    <div>
      <Swap
        aria-label="Use dark appearance"
        checked={dark}
        onChange={(event) => setDark(event.currentTarget.checked)}
        off="☀️"
        on="🌙"
        rotate
      />
      <p>Appearance: {dark ? "Dark" : "Light"}</p>
    </div>
  );
}

export function FabPreview() {
  const [selected, setSelected] = useState("None");
  function selectAction(
    action: string,
    event: React.MouseEvent<HTMLButtonElement>,
  ) {
    setSelected(action);
    (
      event.currentTarget.closest("[popover]") as HTMLElement | null
    )?.hidePopover?.();
  }

  return (
    <div style={{ position: "relative", minHeight: 220, width: "100%" }}>
      <Fab contained speedDial>
        <Fab.Trigger aria-label="Create" shape="square">+</Fab.Trigger>
        <Fab.Actions>
          <Fab.Action>
            <Fab.Label>New message</Fab.Label>
            <Button
              type="button"
              aria-label="New message"
              onClick={(event) => selectAction("Message", event)}
            >
              ✉
            </Button>
          </Fab.Action>
          <Fab.Action>
            <Fab.Label>New note</Fab.Label>
            <Button
              type="button"
              aria-label="New note"
              onClick={(event) => selectAction("Note", event)}
            >
              ✎
            </Button>
          </Fab.Action>
        </Fab.Actions>
      </Fab>
      <p>Selected action: {selected}</p>
    </div>
  );
}

export function MegamenuPreview() {
  const [selection, setSelection] = useState("None");
  function select(event: React.MouseEvent<HTMLAnchorElement>, value: string) {
    setSelection(value);
    (
      event.currentTarget.closest("[popover]") as HTMLElement | null
    )?.hidePopover?.();
  }

  return (
    <div>
      <Megamenu aria-label="Product navigation">
        <Megamenu.Bar>
          <Megamenu.Item>
            <Megamenu.Trigger>Products</Megamenu.Trigger>
            <Megamenu.Panel>
              <Megamenu.Heading>Products</Megamenu.Heading>
              <Megamenu.Grid>
                <Megamenu.Group>
                  <a
                    className="link"
                    href="#components"
                    onClick={(event) => select(event, "Components")}
                  >
                    Components
                  </a>
                  <a
                    className="link"
                    href="#themes"
                    onClick={(event) => select(event, "Themes")}
                  >
                    Themes
                  </a>
                </Megamenu.Group>
              </Megamenu.Grid>
            </Megamenu.Panel>
          </Megamenu.Item>
          <li><a className="link" href="#components">All products</a></li>
        </Megamenu.Bar>
        <Megamenu.Mobile summary="Products">
          <a
            className="link"
            href="#components"
            onClick={(event) => select(event, "Components")}
          >
            Components
          </a>
        </Megamenu.Mobile>
      </Megamenu>
      <p>Selected destination: {selection}</p>
    </div>
  );
}

export function ConsolePagePreview() {
  const [state, setState] = useState<"expanded" | "compact" | "hidden">(
    "expanded",
  );
  const next = {
    expanded: "compact",
    compact: "hidden",
    hidden: "expanded",
  } as const;

  return (
    <div style={{ width: "100%", minHeight: 360, position: "relative" }}>
      <ConsolePage sidebarState={state} style={{ minHeight: 360 }}>
        <ConsolePage.Frame>
          <ConsolePage.Appbar>
            <ConsolePage.SidebarToggle onClick={() => setState(next[state])}>
              ☰
            </ConsolePage.SidebarToggle>
            <ConsolePage.MobileTrigger aria-label="Open navigation">
              ☰
            </ConsolePage.MobileTrigger>
            <ConsolePage.MobileMenu aria-label="Mobile navigation">
              <a className="menu-item" href="#overview">
                Overview
              </a>
            </ConsolePage.MobileMenu>
            <strong>Operations</strong>
          </ConsolePage.Appbar>
          <ConsolePage.Sidebar>
            <ConsolePage.SidebarBody aria-label="Sections">
              <a className="drawer-item" href="#overview">
                Overview
              </a>
            </ConsolePage.SidebarBody>
          </ConsolePage.Sidebar>
          <ConsolePage.Main id="overview">Workspace · {state}</ConsolePage.Main>
        </ConsolePage.Frame>
      </ConsolePage>
    </div>
  );
}
