import React from "react";
import {
  exportComposerText,
  readComposerDocument,
  snapshotComposerJson,
} from "./document";

/** A failed/unsupported editor never replaces the host's semantic draft with text. */
export function PreservedDraft({
  input,
  reason,
  state = "error",
}: {
  input: unknown;
  reason: string;
  state?: "error" | "unknown" | "pending";
}) {
  const document = readComposerDocument(input);
  let json: string | undefined;
  let exportError: string | undefined;
  try {
    json = JSON.stringify(snapshotComposerJson(input), null, 2);
  } catch (cause) {
    exportError = cause instanceof Error ? cause.message : "Unsupported data";
  }
  return (
    <section
      className="chat-composer-status"
      data-state={state}
      aria-label="Preserved draft"
    >
      <p role={state === "error" ? "alert" : "status"}>
        {reason} Your draft is preserved.
      </p>
      <pre>
        {document.status === "compatible"
          ? exportComposerText(document.value)
          : (json ??
            "The application retains the original incompatible input.")}
      </pre>
      {json ? (
        <a
          download="composer-draft.json"
          href={`data:application/json;charset=utf-8,${encodeURIComponent(json)}`}
        >
          Export preserved draft
        </a>
      ) : null}
      {exportError ? (
        <p>
          JSON export unavailable: {exportError}. The application retains the
          original input.
        </p>
      ) : null}
    </section>
  );
}
