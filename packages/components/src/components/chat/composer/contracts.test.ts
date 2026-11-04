import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import type {
  ComposerCapabilities,
  ComposerDocument,
  ComposerDraft,
  ComposerProviderCandidate,
  ComposerProviderRequest,
  ComposerQueueMutation,
  ComposerQueueMutationResult,
  ComposerQueueProjection,
  ComposerReceipt,
  ComposerScope,
  ComposerSubmission,
} from "../Composer.types";
import {
  exportComposerMarkdown,
  exportComposerText,
  readComposerDocument,
  readComposerDraft,
  snapshotComposerSubmission,
} from "./document";

const fixtures = JSON.parse(
  readFileSync(new URL("./contracts.v1.json", import.meta.url), "utf8"),
) as {
  fixtureVersion: number;
  scope: ComposerScope;
  documents: Record<string, ComposerDocument>;
  missingProviderIds: string[];
  exports: Record<string, string>;
  drafts: { legacy: string; semantic: ComposerDraft; unsupported: unknown };
  submissions: Record<string, ComposerSubmission>;
  receipts: ComposerReceipt[];
  capabilities: ComposerCapabilities;
  providers: {
    request: ComposerProviderRequest;
    candidates: ComposerProviderCandidate[];
  };
  queue: {
    initial: ComposerQueueProjection;
    authoritative: ComposerQueueProjection;
    staleMutation: ComposerQueueMutation;
    staleResult: ComposerQueueMutationResult;
  };
};

describe("cross-language composer v1 fixtures", () => {
  test("documents are portable, ordered, non-lossy, and deterministic to export", () => {
    expect(fixtures.fixtureVersion).toBe(1);
    for (const document of Object.values(fixtures.documents)) {
      const result = readComposerDocument(document);
      expect(result).toMatchObject({
        status: "compatible",
        value: document,
        migrated: false,
      });
    }
    expect(exportComposerText(fixtures.documents.mixed)).toBe(
      fixtures.exports.mixed,
    );
    expect(exportComposerMarkdown(fixtures.documents.mixed)).toBe(
      fixtures.exports.mixed,
    );
    expect(exportComposerText(fixtures.documents.claimedCommand)).toBe(
      fixtures.exports.claimedCommand,
    );
    const references = fixtures.documents.mixed.content.filter(
      (node) => node.type === "reference",
    );
    expect(references[0].refId).toBe(references[1].refId);
    expect(references[0].nodeId).not.toBe(references[1].nodeId);
    expect(
      references.some((node) =>
        fixtures.missingProviderIds.includes(node.providerId),
      ),
    ).toBe(true);
    expect(fixtures.documents.emptyCommandArguments.command).toEqual(
      fixtures.documents.claimedCommand.command,
    );
  });

  test("legacy and semantic drafts preserve reattachment and approved handles", () => {
    const legacy = { scope: fixtures.scope, draftKey: "draft-1" };
    expect(readComposerDraft(fixtures.drafts.legacy, legacy)).toMatchObject({
      status: "compatible",
      migrated: true,
    });
    expect(readComposerDraft(fixtures.drafts.semantic, legacy)).toMatchObject({
      status: "compatible",
      value: fixtures.drafts.semantic,
    });
    expect(
      readComposerDraft(fixtures.drafts.unsupported, legacy),
    ).toMatchObject({
      status: "incompatible",
      input: fixtures.drafts.unsupported,
    });
    const [local, uploaded] = fixtures.drafts.semantic.attachments;
    expect(local.status).toBe("reattach");
    expect(uploaded.status).toBe("ready");
    expect(local.metadata).toEqual(uploaded.metadata);
    expect(local.entryId).not.toBe(uploaded.entryId);
    expect(local).not.toHaveProperty("handle");
  });

  test("all submission operations snapshot independently with portable approved attachments", () => {
    for (const submission of Object.values(fixtures.submissions)) {
      const snapshot = snapshotComposerSubmission(submission);
      expect(snapshot).toEqual(submission);
      expect(snapshot).not.toBe(submission);
      expect(snapshot.protocolVersion).toBe(1);
      expect(snapshot.scope).toEqual(fixtures.scope);
    }
    expect(fixtures.submissions.steer).toMatchObject({
      operation: "prompt",
      intent: "steer",
      targetTurnId: "turn-active-1",
    });
    expect(fixtures.submissions.command).not.toHaveProperty("intent");
  });

  test("prompt and command results cover accepted, rejected and unknown truthfully", () => {
    for (const operation of ["prompt", "command"] as const) {
      const receipts = fixtures.receipts.filter(
        (receipt) => receipt.operation === operation,
      );
      expect(receipts.map((receipt) => receipt.outcome).sort()).toEqual([
        "accepted",
        "rejected",
        "unknown",
      ]);
      for (const receipt of receipts) {
        expect(receipt.protocolVersion).toBe(1);
        expect(receipt.scope).toEqual(fixtures.scope);
        expect(receipt.clientSubmissionId).toBeTruthy();
        if (receipt.outcome !== "accepted") {
          expect(receipt.error.code).toBeTruthy();
          expect(receipt).not.toHaveProperty("delivery");
          expect(receipt).not.toHaveProperty("persistence");
        } else if (receipt.operation === "prompt") {
          expect(receipt.delivery).toBe("follow_up");
          expect(receipt.persistence).toBe("volatile");
          expect(receipt.queueRevision).toBe(9);
        } else {
          expect(receipt.result).toEqual({
            action: "reload-tools",
            reloaded: 3,
          });
          for (const field of [
            "delivery",
            "persistence",
            "messageId",
            "turnId",
            "queueItemId",
          ])
            expect(receipt).not.toHaveProperty(field);
        }
      }
    }
  });

  test("provider requests carry scope/revision/generation and distinct selection semantics", () => {
    const { request, candidates } = fixtures.providers;
    expect(request.scope).toEqual(fixtures.scope);
    expect(request.documentRevision).toBe(fixtures.drafts.semantic.revision);
    expect(request.instanceGeneration).toBeGreaterThan(0);
    expect(new Set(candidates.map((candidate) => candidate.id)).size).toBe(
      candidates.length,
    );
    expect(candidates.map((candidate) => candidate.action.type)).toEqual([
      "insert",
      "drill",
      "invoke",
    ]);
    expect(request).not.toHaveProperty("signal");
  });

  test("stale queue mutation carries expected revision and canonical authoritative projection", () => {
    const { initial, authoritative, staleMutation, staleResult } =
      fixtures.queue;
    expect(staleMutation.expectedRevision).toBeLessThan(initial.revision);
    expect(staleMutation).toMatchObject({
      operation: "promote",
      targetTurnId: "turn-active-1",
    });
    expect(staleResult).toMatchObject({
      outcome: "rejected",
      error: { code: "stale_revision" },
      projection: authoritative,
    });
    expect(authoritative.revision).toBeGreaterThan(initial.revision);
    expect(initial.items.map((item) => item.id)).toEqual(["queue-1"]);
    expect(authoritative.items).toEqual([]);
    expect(initial.items[0].capabilities.edit).toBe("text");
    expect(fixtures.capabilities.queue).toEqual(initial.items[0].capabilities);
    expect(fixtures.capabilities.durableRecovery).toBe(false);
  });
});
