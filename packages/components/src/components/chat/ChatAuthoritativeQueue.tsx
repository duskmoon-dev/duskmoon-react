import React, { useId, useLayoutEffect, useRef, useState } from "react";
import type {
  ComposerDocument,
  ComposerQueueItem,
  ComposerQueueMutation,
  ComposerQueueProjection,
} from "./Composer.types";
import type {
  ChatAuthoritativeQueueProps,
  ComposerQueueEditorProps,
} from "./ComposerQueue.types";
import { ChatQueue } from "./ChatPrimitives";
import {
  exportComposerText,
  snapshotComposerDocument,
} from "./composer/document";
import { PreservedDraft } from "./composer/PreservedDraft";

function scopeKey(projection: ComposerQueueProjection) {
  return JSON.stringify([
    projection.scope.contextKey,
    projection.scope.conversationId,
  ]);
}

function QueueActionIcon({
  action,
}: {
  action: "edit" | "steer" | "remove" | "save" | "cancel";
}) {
  const paths = {
    edit: "m15 4 5 5-11 11H4v-5ZM13 6l5 5",
    steer: "m15 4 5 5-5 5M20 9h-9a6 6 0 0 0-6 6v4",
    remove: "M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7",
    save: "m5 12 4 4L19 6",
    cancel: "m6 6 12 12M6 18 18 6",
  };
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[action]} />
    </svg>
  );
}
function safeText(item: ComposerQueueItem) {
  return (
    !item.document.command &&
    !item.attachments.length &&
    item.document.content.every((node) => node.type === "text")
  );
}
function canEdit(item: ComposerQueueItem, props: ChatAuthoritativeQueueProps) {
  return Boolean(
    item.capabilities.edit !== "none" &&
    props.capabilities.edit !== "none" &&
    (safeText(item) ||
      (item.capabilities.edit === "document" &&
        props.capabilities.edit === "document" &&
        props.renderDocumentEditor)),
  );
}
interface Edit {
  item: ComposerQueueItem;
  revision: number;
  document: ComposerDocument;
  text: boolean;
}

function DocumentEditorSlot({
  renderEditor,
  ...editor
}: ComposerQueueEditorProps & {
  renderEditor: NonNullable<
    ChatAuthoritativeQueueProps["renderDocumentEditor"]
  >;
}) {
  return <>{renderEditor(editor)}</>;
}

/** Controlled queue projection: a request never changes confirmed membership. */
export function ChatAuthoritativeQueue(props: ChatAuthoritativeQueueProps) {
  return <QueueSession key={scopeKey(props.projection)} {...props} />;
}

function QueueSession(props: ChatAuthoritativeQueueProps) {
  const latest = useRef(props);
  const watermark = useRef(props.projection.revision);
  useLayoutEffect(() => {
    latest.current = props;
    watermark.current = Math.max(watermark.current, props.projection.revision);
  });
  const requests = useRef(new Map<string, AbortController>());
  const counter = useRef(0);
  const instanceId = useId();
  const [pending, setPending] = useState<readonly string[]>([]);
  const [message, setMessage] = useState<{ text: string; error?: boolean }>();
  const [edit, setEdit] = useState<Edit>();
  useLayoutEffect(() => {
    const active = requests.current;
    return () => {
      for (const controller of active.values()) controller.abort();
      active.clear();
    };
  }, []);

  async function mutate(
    operation:
      | { operation: "remove" }
      | { operation: "promote"; targetTurnId: string }
      | { operation: "edit"; document: ComposerDocument },
    itemId: string,
    expectedRevision = latest.current.projection.revision,
  ) {
    if (requests.current.has(itemId)) return;
    const owner = latest.current;
    const requestKey = scopeKey(owner.projection);
    const controller = new AbortController();
    requests.current.set(itemId, controller);
    setPending([...requests.current.keys()]);
    setMessage(undefined);
    const request: ComposerQueueMutation = {
      ...operation,
      ...(operation.operation === "edit"
        ? { document: snapshotComposerDocument(operation.document) }
        : {}),
      requestId: `${instanceId}-queue-${++counter.current}`,
      scope: { ...owner.projection.scope },
      itemId,
      expectedRevision,
    };
    try {
      const result = await owner.onMutation(request, controller.signal);
      if (controller.signal.aborted) return;
      const projection = result.projection;
      if (
        result.requestId !== request.requestId ||
        projection.protocolVersion !== 1 ||
        scopeKey(projection) !== requestKey ||
        !Number.isSafeInteger(projection.revision) ||
        projection.items.some((item) => !item.id) ||
        new Set(projection.items.map((item) => item.id)).size !==
          projection.items.length
      )
        throw new TypeError("Invalid queue acknowledgment identity");
      if (projection.revision < Math.max(expectedRevision, watermark.current)) {
        setMessage({
          text: "Queue changed while the request was pending. Current projection retained.",
        });
        return;
      }
      for (const item of projection.items)
        snapshotComposerDocument(item.document);
      if (result.outcome !== "accepted" && result.outcome !== "rejected")
        throw new TypeError("Invalid queue acknowledgment outcome");
      watermark.current = projection.revision;
      latest.current.onProjection(projection);
      setEdit((current) => {
        if (current?.item.id !== itemId) return current;
        if (result.outcome === "accepted") return undefined;
        const canonical = projection.items.find((item) => item.id === itemId);
        return canonical
          ? { ...current, item: canonical, revision: projection.revision }
          : current;
      });
      setMessage(
        result.outcome === "rejected"
          ? { text: result.error.message, error: true }
          : { text: "Queue update acknowledged" },
      );
    } catch (error) {
      if (!controller.signal.aborted)
        setMessage({
          text: error instanceof Error ? error.message : "Queue update failed",
          error: true,
        });
    } finally {
      if (requests.current.get(itemId) === controller) {
        requests.current.delete(itemId);
        if (!controller.signal.aborted)
          setPending([...requests.current.keys()]);
      }
    }
  }
  const noop = () => {};
  const editAllowed = Boolean(
    edit &&
    props.projection.items.some(
      (item) =>
        item.id === edit.item.id &&
        canEdit(item, props) &&
        (!edit.text || safeText(item)),
    ),
  );
  return (
    <div className={props.className}>
      <ChatQueue
        label={props.label}
        items={props.projection.items.map((item) => ({
          id: item.id,
          text: exportComposerText(item.document),
        }))}
        pendingIds={pending}
        onSteer={noop}
        onRemove={noop}
        renderItemActions={(row, index, busy) => {
          const item = props.projection.items[index];
          const editable = canEdit(item, props);
          return (
            <>
              {editable ? (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-square"
                  disabled={busy}
                  aria-label={`Edit waiting message ${index + 1}`}
                  title={`Edit waiting message ${index + 1}`}
                  onClick={() =>
                    setEdit({
                      item,
                      revision: props.projection.revision,
                      document: snapshotComposerDocument(item.document),
                      text: safeText(item),
                    })
                  }
                >
                  <QueueActionIcon action="edit" />
                </button>
              ) : null}
              {props.capabilities.promote && item.capabilities.promote ? (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-square chat-queue-steer"
                  disabled={busy || !props.targetTurnId}
                  aria-label={`Steer waiting message ${index + 1}`}
                  title={`Steer waiting message ${index + 1}`}
                  onClick={() => {
                    if (props.targetTurnId)
                      void mutate(
                        {
                          operation: "promote",
                          targetTurnId: props.targetTurnId,
                        },
                        row.id,
                      );
                  }}
                >
                  <QueueActionIcon action="steer" />
                </button>
              ) : null}
              {props.capabilities.remove && item.capabilities.remove ? (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-square chat-queue-remove"
                  disabled={busy}
                  aria-label={`Remove waiting message ${index + 1}`}
                  title={`Remove waiting message ${index + 1}`}
                  onClick={() => void mutate({ operation: "remove" }, row.id)}
                >
                  <QueueActionIcon action="remove" />
                </button>
              ) : null}
            </>
          );
        }}
      />
      {edit ? (
        <div
          className="chat-composer"
          role="group"
          aria-label="Edit queued message"
        >
          {edit.text ? (
            <>
              <textarea
                className="chat-composer-input"
                aria-label="Queued message"
                value={exportComposerText(edit.document)}
                disabled={pending.includes(edit.item.id)}
                onChange={(event) =>
                  setEdit({
                    ...edit,
                    document: {
                      schemaVersion: 1,
                      content: [
                        { type: "text", text: event.currentTarget.value },
                      ],
                    },
                  })
                }
              />
              <div className="chat-composer-actions">
                <button
                  className="btn btn-sm btn-square"
                  type="button"
                  aria-label="Save queued message"
                  title="Save queued message"
                  disabled={pending.includes(edit.item.id) || !editAllowed}
                  onClick={() =>
                    void mutate(
                      { operation: "edit", document: edit.document },
                      edit.item.id,
                      edit.revision,
                    )
                  }
                >
                  <QueueActionIcon action="save" />
                </button>
                <button
                  className="btn btn-ghost btn-sm btn-square"
                  type="button"
                  aria-label="Cancel"
                  title="Cancel"
                  disabled={pending.includes(edit.item.id)}
                  onClick={() => setEdit(undefined)}
                >
                  <QueueActionIcon action="cancel" />
                </button>
              </div>
            </>
          ) : props.renderDocumentEditor && editAllowed ? (
            <DocumentEditorSlot
              renderEditor={props.renderDocumentEditor}
              item={edit.item}
              value={edit.document}
              onChange={(document) =>
                setEdit({
                  ...edit,
                  document: snapshotComposerDocument(document),
                })
              }
              onSave={() =>
                void mutate(
                  { operation: "edit", document: edit.document },
                  edit.item.id,
                  edit.revision,
                )
              }
              onCancel={() => setEdit(undefined)}
              pending={pending.includes(edit.item.id)}
            />
          ) : (
            <>
              <PreservedDraft
                input={edit.document}
                reason="This queued message is no longer editable. Your replacement draft is preserved."
                state="pending"
              />
              <button type="button" onClick={() => setEdit(undefined)}>
                Discard queued edit
              </button>
            </>
          )}
        </div>
      ) : null}
      {message ? (
        <p
          className={
            message.error ? "chat-composer-error" : "chat-composer-status"
          }
          role={message.error ? "alert" : "status"}
        >
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
