import {
  useEffect,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
} from "react";
import type {
  ComposerAttachmentOptions,
  UseComposerAttachmentsResult,
} from "../ComposerAttachment.types";
import { createComposerAttachmentController } from "./attachments";

/** Mounted ownership only; hosts retain portable draft/recovery snapshots separately. */
export function useComposerAttachments(
  options: ComposerAttachmentOptions,
): UseComposerAttachmentsResult {
  const [controller] = useState(() =>
    createComposerAttachmentController(options),
  );
  const snapshot = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );
  useLayoutEffect(() => {
    controller.configure(options);
  });
  useEffect(
    () => () => {
      // clear aborts/releases every occurrence but permits React StrictMode's
      // effect replay to reuse the same mounted controller without a dead owner.
      controller.clear();
    },
    [controller],
  );
  return { ...snapshot, controller };
}
