import { useLayoutEffect, useState, useSyncExternalStore } from "react";
import type {
  ComposerDraftContext,
  UseComposerDraftResult,
} from "../ComposerDraft.types";
import { createComposerDraftController } from "./drafts";

/** Storage policy stays with the host; this hook does not impose an autosave cadence. */
export function useComposerDraft(
  context: ComposerDraftContext,
): UseComposerDraftResult {
  const [controller] = useState(() => createComposerDraftController(context));
  const snapshot = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );
  useLayoutEffect(() => {
    controller.activate();
    return () => controller.dispose();
  }, [controller]);
  useLayoutEffect(() => {
    controller.update(context);
  });
  return { controller, snapshot };
}
