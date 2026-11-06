import { useLayoutEffect, useState, useSyncExternalStore } from "react";
import type { ComposerProviderContext } from "../ComposerProvider.types";
import { ComposerProviderController } from "./providers";

/** The adapter supplies semantic selection; this hook never reads editor DOM/history. */
export function useComposerProviders(context: ComposerProviderContext) {
  const [controller] = useState(() => new ComposerProviderController());
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
