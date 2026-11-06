import { useId, useLayoutEffect, useState, useSyncExternalStore } from "react";
import type { ComposerSessionContext } from "../ComposerSession.types";
import { createComposerSessionController } from "./session";

/** Editing stays controlled; only admission and recovery are stored here. */
export function useComposerSession(context: ComposerSessionContext) {
  const instanceId = useId();
  const [controller] = useState(() =>
    createComposerSessionController(context, { instanceId }),
  );
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
