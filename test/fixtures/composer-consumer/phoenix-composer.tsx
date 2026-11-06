import React, { useMemo, useState } from "react";
import {
  ChatSessionComposer,
  snapshotComposerReceipt,
  type ChatSessionComposerProps,
  type ComposerCapabilities,
  type ComposerDocumentUpdate,
  type ComposerRecoveryOwner,
  type ComposerSessionHost,
  type ComposerSubmission,
} from "@duskmoon-dev/components/chat";
import type {
  PhoenixBridge,
  PhoenixComposerContext,
} from "phoenix_duskmoon/react-chat";

/** The application explicitly returns composer_receipt; a transport ack is insufficient. */
export async function submitThroughPhoenix(
  bridge: PhoenixBridge,
  snapshot: ComposerSubmission,
) {
  let reply: unknown;
  try {
    reply = await bridge.send("send", {
      request_id: snapshot.clientSubmissionId,
      composer_submission: snapshot,
    });
  } catch (error) {
    reply =
      error && typeof error === "object" && "response" in error
        ? error.response
        : undefined;
    if (!reply || typeof reply !== "object" || !("composer_receipt" in reply))
      throw error;
  }
  if (!reply || typeof reply !== "object" || !("composer_receipt" in reply))
    throw new Error(
      "Transport acknowledged without a definitive Composer receipt",
    );
  return snapshotComposerReceipt(reply.composer_receipt, snapshot);
}

/** Application glue only; editing and admission lifecycle come from the package. */
export function createPhoenixComposer(options: {
  contextKey: string;
  recovery: ComposerRecoveryOwner;
  capabilities: ComposerCapabilities;
  Editor?: React.ComponentType<ChatSessionComposerProps>;
  initialText?: string;
}) {
  const Editor = options.Editor ?? ChatSessionComposer;
  return function PhoenixComposer(context: PhoenixComposerContext) {
    const [value, setValue] = useState<ComposerDocumentUpdate>({
      revision: 1,
      origin: "restore",
      originId: "application",
      document: {
        schemaVersion: 1,
        content: [
          { type: "text", text: options.initialText ?? "Phoenix draft 中文" },
        ],
      },
    });
    const host = useMemo<ComposerSessionHost>(
      () => ({
        recovery: options.recovery,
        capabilities: options.capabilities,
        submit: (snapshot) => submitThroughPhoenix(context.bridge, snapshot),
      }),
      [context.bridge],
    );
    return (
      <Editor
        value={value}
        onDocumentChange={setValue}
        host={host}
        scope={{
          contextKey: options.contextKey,
          conversationId: context.state.conversationId,
        }}
        draftKey={`composer:${context.state.conversationId}`}
        canSubmit={context.canSubmit}
        runtime={{
          status: !context.connected
            ? "disconnected"
            : context.active
              ? "running"
              : "idle",
          activeTurnId: context.runtime.activeTurnId,
        }}
      />
    );
  };
}
