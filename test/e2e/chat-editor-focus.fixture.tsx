import React, { useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  Chat,
  ChatSessionComposer,
  createComposerRecoveryOwner,
  type ComposerDocumentUpdate,
  type ComposerSessionHost,
} from "../../packages/components/src/components/chat";
import { RichChatComposer } from "../../packages/components/src/components/chat/rich";

let root: Root | undefined;

export function mountComposerFocusFixture() {
  root?.unmount();
  let element = document.getElementById("composer-focus-fixture");
  if (!element) {
    element = document.createElement("section");
    element.id = "composer-focus-fixture";
    element.setAttribute("aria-label", "Composer focus fixture");
    document.body.append(element);
  }
  root = createRoot(element);
  root.render(<Fixture />);
}

function Fixture() {
  const [state, setState] = useState("normal");
  const [text, setText] = useState("A native draft");
  const [value, setValue] = useState<ComposerDocumentUpdate>({
    revision: 0,
    origin: "replace",
    originId: "fixture",
    document: {
      schemaVersion: 1,
      content: [{ type: "text", text: "A semantic draft" }],
    },
  });
  const [host] = useState<ComposerSessionHost>(() => ({
    recovery: createComposerRecoveryOwner(),
    capabilities: {
      protocolVersion: 1,
      documentVersions: [1],
      intents: ["send"],
      commands: false,
      attachments: false,
      queue: { edit: "none", remove: false, promote: false },
      durableRecovery: false,
    },
    submit: async () => {
      throw new Error("Focus checks must never submit");
    },
  }));
  const disabled = state === "disabled";
  const readOnly = state === "read_only";
  const error = state === "error" ? "The host rejected this draft." : undefined;
  return (
    <div
      style={{
        width: "min(48rem, calc(100vw - 2rem))",
        display: "grid",
        gap: "1rem",
      }}
    >
      <select
        aria-label="Composer fixture state"
        value={state}
        onChange={(event) => setState(event.currentTarget.value)}
      >
        {["normal", "error", "read_only", "disabled"].map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <button type="button">Before legacy editor</button>
      <Chat.Composer
        compact
        value={text}
        onValueChange={setText}
        onSubmit={() => false}
        disabled={disabled}
        error={error}
        textareaProps={{ "aria-label": "Legacy focus editor", readOnly }}
      />
      {(
        [
          ["semantic", ChatSessionComposer],
          ["rich", RichChatComposer],
        ] as const
      ).map(([mode, Composer]) => (
        <React.Fragment key={mode}>
          <button type="button">Before {mode} editor</button>
          <Composer
            compact
            value={value}
            onDocumentChange={setValue}
            host={host}
            scope={{ contextKey: "focus", conversationId: mode }}
            draftKey="focus"
            label={`${mode} focus editor`}
            disabled={disabled}
            error={error}
            runtime={readOnly ? { status: "read_only" } : { status: "idle" }}
          />
        </React.Fragment>
      ))}
    </div>
  );
}
