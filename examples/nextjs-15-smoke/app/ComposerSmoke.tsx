"use client";

import { useState } from "react";
import {
  ChatSessionComposer,
  createComposerRecoveryOwner,
  type ComposerDocumentUpdate,
  type ComposerSessionHost,
} from "@duskmoon-dev/components/chat";
import { RichChatComposer } from "@duskmoon-dev/components/chat/rich";

function Composer({ rich }: { rich: boolean }) {
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
    submit: async (snapshot) => ({
      protocolVersion: 1,
      clientSubmissionId: snapshot.clientSubmissionId,
      scope: snapshot.scope,
      outcome: "accepted",
      operation: "prompt",
      delivery: "immediate",
      persistence: "volatile",
    }),
  }));
  const [value, setValue] = useState<ComposerDocumentUpdate>({
    document: {
      schemaVersion: 1,
      content: [{ type: "text", text: "Hydrated Composer" }],
    },
    revision: 0,
    origin: "replace",
    originId: "next-smoke",
  });
  const Editor = rich ? RichChatComposer : ChatSessionComposer;
  return (
    <Editor
      value={value}
      onDocumentChange={setValue}
      host={host}
      scope={{ contextKey: "next", conversationId: rich ? "rich" : "plain" }}
      draftKey="smoke"
      label={rich ? "Next rich message" : "Next plain message"}
    />
  );
}

export function ComposerSmoke() {
  return (
    <section aria-label="Composer smoke">
      <h2>Semantic and optional rich composers</h2>
      <Composer rich={false} />
      <Composer rich />
    </section>
  );
}
