import React from "react";
import { renderToString } from "react-dom/server";
import { Chat, ChatSessionComposer } from "@duskmoon-dev/components";
import {
  ChatSessionComposer as SubpathComposer,
  createComposerRecoveryOwner,
} from "@duskmoon-dev/components/chat";

const props = {
  value: {
    revision: 1,
    origin: "restore" as const,
    originId: "host",
    document: {
      schemaVersion: 1 as const,
      content: [{ type: "text" as const, text: "SSR 中文" }],
    },
  },
  onDocumentChange: () => {},
  scope: { contextKey: "repo", conversationId: "chat" },
  draftKey: "draft",
  host: {
    recovery: createComposerRecoveryOwner(),
    capabilities: {
      protocolVersion: 1 as const,
      documentVersions: [1],
      intents: ["send" as const],
      commands: false,
      attachments: false,
      queue: { edit: "none" as const, remove: false, promote: false },
      durableRecovery: false,
    },
    submit: async () => {
      throw new Error("SSR must not submit");
    },
  },
};
for (const node of [
  <Chat.Composer
    value="SSR legacy"
    onValueChange={() => {}}
    onSubmit={() => true}
  />,
  <ChatSessionComposer {...props} />,
  <SubpathComposer {...props} />,
]) {
  const html = renderToString(node);
  if (!html.includes("chat-composer"))
    throw new Error("Missing SSR Composer markup");
}
console.log("PASS root/chat SSR");
