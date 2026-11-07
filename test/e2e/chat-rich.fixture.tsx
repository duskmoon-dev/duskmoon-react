import React, { useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  createComposerRecoveryOwner,
  type ComposerDocumentUpdate,
} from "../../packages/components/src/components/chat";
import { RichChatComposer } from "../../packages/components/src/components/chat/rich";

let root: Root | undefined;
/** Failure fixture begins with semantic data, before the optional editor is loaded. */
export function mountRichFailureFixture(rows?: {
  minRows: number;
  maxRows: number;
}) {
  root?.unmount();
  let element = document.getElementById("rich-failure-fixture");
  if (!element) {
    element = document.createElement("section");
    element.id = "rich-failure-fixture";
    element.setAttribute("aria-label", "Rich editor failure fixture");
    document.body.append(element);
  }
  root = createRoot(element);
  root.render(<Fixture {...rows} />);
}
function Fixture(rows: { minRows?: number; maxRows?: number }) {
  const [recovery] = useState(createComposerRecoveryOwner);
  const [value, setValue] = useState<ComposerDocumentUpdate>({
    revision: 4,
    origin: "restore",
    originId: "fixture",
    document: {
      schemaVersion: 1,
      content: [
        { type: "text", text: "Review " },
        {
          type: "reference",
          nodeId: "original-reference",
          providerId: "files",
          refId: "README.md",
          label: "README.md",
          plainText: "@README.md",
        },
        {
          type: "quote",
          nodeId: "original-quote",
          text: "Keep this quote",
          source: { messageId: "message", label: "Original author" },
        },
      ],
    },
  });
  return (
    <RichChatComposer
      {...rows}
      value={value}
      onDocumentChange={setValue}
      scope={{ contextKey: "fixture", conversationId: "failure" }}
      draftKey="fixture"
      host={{
        recovery,
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
          throw new Error("The unavailable editor must never send");
        },
      }}
    />
  );
}
