import React from "react";
import {
  Chat,
  ChatSessionComposer,
  type ComposerDocumentUpdate,
} from "@duskmoon-dev/components";
import {
  ChatSessionComposer as SubpathComposer,
  createComposerRecoveryOwner,
  type ComposerSessionHost,
} from "@duskmoon-dev/components/chat";
import { RichChatComposer } from "@duskmoon-dev/components/chat/rich";

const value: ComposerDocumentUpdate = {
  revision: 1,
  origin: "restore",
  originId: "host",
  document: {
    schemaVersion: 1,
    content: [{ type: "text", text: "Strict consumer" }],
  },
};
const host: ComposerSessionHost = {
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
    operation: snapshot.operation,
    outcome: "unknown",
    error: { code: "fixture", message: "No live server" },
  }),
};
export const fixtureProps = {
  value,
  onDocumentChange: () => {},
  host,
  scope: { contextKey: "repo", conversationId: "chat" },
  draftKey: "draft",
};
export const typeProof = (
  <>
    <Chat.Composer
      value="Legacy"
      onValueChange={() => {}}
      onSubmit={() => true}
    />
    <ChatSessionComposer {...fixtureProps} />
    <SubpathComposer {...fixtureProps} />
    <RichChatComposer {...fixtureProps} />
  </>
);
