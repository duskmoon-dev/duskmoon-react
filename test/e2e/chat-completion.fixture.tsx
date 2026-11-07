import React, { useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ChatComposer } from "../../packages/components/src/components/chat/ChatComposer";

let root: Root | undefined;
export function mountCompletionFixture() {
  root?.unmount();
  let container = document.getElementById("chat-completion-fixture");
  if (!container) {
    container = document.createElement("section");
    container.id = "chat-completion-fixture";
    container.setAttribute("aria-label", "Completion overflow fixture");
    document.body.append(container);
  }
  root = createRoot(container);
  root.render(<Fixture />);
}
function Fixture() {
  const [value, setValue] = useState("");
  const [selected, setSelected] = useState("none");
  const [submissions, setSubmissions] = useState(0);
  return (
    <div
      style={{
        position: "fixed",
        insetInlineStart: "1rem",
        top: "45vh",
        inlineSize: "min(30rem, calc(100vw - 2rem))",
        blockSize: 150,
        overflow: "hidden",
      }}
    >
      <ChatComposer
        compact
        style={{ anchorName: "--caller-composer" } as React.CSSProperties}
        value={value}
        onValueChange={setValue}
        textareaProps={{ "aria-label": "Completion fixture message" }}
        onSubmit={() => {
          setSubmissions((current) => current + 1);
          return false;
        }}
        completion={{
          label: "Available skills",
          items: value.startsWith("/")
            ? Array.from({ length: 30 }, (_, index) => ({
                id: `skill-${index}`,
                label: `/skill-${index}`,
                description: `Editable instructions ${index}`,
                group: "Skills",
                sourceLabel: "Workspace",
              }))
            : [],
          onSelect: (item) => {
            setSelected(item.id);
            setValue(`${item.label} `);
          },
        }}
      />
      <p role="status">
        Selected {selected}; submissions {submissions}
      </p>
    </div>
  );
}
