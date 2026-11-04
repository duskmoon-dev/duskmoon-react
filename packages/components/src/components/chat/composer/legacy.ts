import type {
  ChatComposerCompletion,
  ChatComposerProps,
  ChatComposerSubmission,
} from "../Chat.types";

export interface AttachmentEntry {
  file: File;
  id: number;
}

/** Match each occurrence once; removing and reselecting a File creates a new ID. */
export function reconcileAttachments(
  previous: readonly AttachmentEntry[],
  files: readonly File[],
  nextId: number,
) {
  const remaining = [...previous];
  const entries = files.map((file) => {
    const index = remaining.findIndex((entry) => entry.file === file);
    return index < 0 ? { file, id: nextId++ } : remaining.splice(index, 1)[0];
  });
  return { entries, nextId };
}

export function legacyEligibility({
  value,
  attachments = [],
  allowAttachmentOnly = false,
  canSubmit = true,
  disabled = false,
  busy = false,
  submitting,
}: Pick<
  ChatComposerProps,
  | "value"
  | "attachments"
  | "allowAttachmentOnly"
  | "canSubmit"
  | "disabled"
  | "busy"
> & { submitting: boolean }) {
  return (
    canSubmit &&
    !disabled &&
    !busy &&
    !submitting &&
    (value.trim().length > 0 || (allowAttachmentOnly && attachments.length > 0))
  );
}

export function legacyCompletion(
  candidates: readonly ChatComposerCompletion[],
  activeId?: string,
) {
  const enabled = candidates.filter((item) => !item.disabled);
  return {
    enabled,
    active: enabled.find((item) => item.id === activeId) ?? enabled[0],
  };
}

export function moveLegacyCompletion(
  enabled: readonly ChatComposerCompletion[],
  activeId: string | undefined,
  direction: 1 | -1,
) {
  if (enabled.length === 0) return undefined;
  const position = enabled.findIndex((item) => item.id === activeId);
  return enabled[(position + direction + enabled.length) % enabled.length].id;
}

export function legacySnapshot(
  value: string,
  files: readonly File[],
  revision: number,
  entries: readonly AttachmentEntry[],
) {
  const submission: ChatComposerSubmission = { value, files: [...files] };
  return {
    submission,
    revision,
    entryIds: new Set(entries.map((entry) => entry.id)),
  };
}

export function retainUnsubmittedAttachments(
  entries: readonly AttachmentEntry[],
  submittedIds: ReadonlySet<number>,
) {
  return entries.filter((entry) => !submittedIds.has(entry.id));
}
