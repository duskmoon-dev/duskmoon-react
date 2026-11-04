import { describe, expect, test } from "bun:test";
import {
  legacyCompletion,
  legacyEligibility,
  legacySnapshot,
  moveLegacyCompletion,
  reconcileAttachments,
  retainUnsubmittedAttachments,
} from "./legacy";

function file(name: string) {
  return new File([name], name, { type: "text/plain" });
}

describe("legacy composer transitions", () => {
  test("reorders and matches repeated File occurrences independently without mutating input", () => {
    const repeated = file("same.txt");
    const other = file("other.txt");
    const initial = reconcileAttachments([], [repeated, repeated, other], 0);
    const reordered = reconcileAttachments(
      initial.entries,
      [other, repeated, repeated],
      initial.nextId,
    );
    expect(reordered.entries.map((entry) => entry.id)).toEqual([2, 0, 1]);
    expect(initial.entries.map((entry) => entry.id)).toEqual([0, 1, 2]);
    expect(reordered.nextId).toBe(3);
  });

  test("removed and reselected files get new identity and survive an old snapshot", () => {
    const selected = file("same.txt");
    const initial = reconcileAttachments([], [selected], 0);
    const snapshot = legacySnapshot(
      "Old draft",
      [selected],
      4,
      initial.entries,
    );
    const removed = reconcileAttachments(initial.entries, [], initial.nextId);
    const reselected = reconcileAttachments(
      removed.entries,
      [selected],
      removed.nextId,
    );
    expect(reselected.entries[0].id).not.toBe(initial.entries[0].id);
    expect(
      retainUnsubmittedAttachments(reselected.entries, snapshot.entryIds),
    ).toEqual(reselected.entries);
    expect(
      retainUnsubmittedAttachments(initial.entries, snapshot.entryIds),
    ).toEqual([]);
  });

  test("snapshots copy the file list and retain revision and occurrence membership", () => {
    const selected = file("submitted.txt");
    const later = file("later.txt");
    const files = [selected];
    const initial = reconcileAttachments([], files, 0);
    const snapshot = legacySnapshot("文本 👩🏽‍💻", files, 7, initial.entries);
    files.push(later);
    initial.entries.push({ file: later, id: initial.nextId });
    expect(snapshot.submission).toEqual({
      value: "文本 👩🏽‍💻",
      files: [selected],
    });
    expect(snapshot.revision).toBe(7);
    expect([...snapshot.entryIds]).toEqual([0]);
    expect(
      retainUnsubmittedAttachments(initial.entries, snapshot.entryIds).map(
        (entry) => entry.file,
      ),
    ).toEqual([later]);
  });

  test("eligibility keeps attachment-only opt-in separate from admission and editing", () => {
    const attachments = [file("only.txt")];
    expect(
      legacyEligibility({ value: " \n", attachments, submitting: false }),
    ).toBe(false);
    expect(
      legacyEligibility({
        value: " \n",
        attachments,
        allowAttachmentOnly: true,
        submitting: false,
      }),
    ).toBe(true);
    expect(legacyEligibility({ value: "text", submitting: false })).toBe(true);
    for (const condition of [
      { disabled: true },
      { busy: true },
      { canSubmit: false },
      { submitting: true },
    ]) {
      expect(
        legacyEligibility({ value: "text", submitting: false, ...condition }),
      ).toBe(false);
    }
  });

  test("completion wraps enabled items and falls back when active identity is replaced", () => {
    const first = { id: "first", label: "First" };
    const disabled = { id: "disabled", label: "Disabled", disabled: true };
    const last = { id: "last", label: "Last" };
    const candidates = [first, disabled, last];
    const state = legacyCompletion(candidates, "missing");
    expect(state.active).toBe(first);
    expect(state.enabled).toEqual([first, last]);
    expect(moveLegacyCompletion(state.enabled, "first", -1)).toBe("last");
    expect(moveLegacyCompletion(state.enabled, "last", 1)).toBe("first");
    expect(legacyCompletion([disabled]).active).toBeUndefined();
    expect(moveLegacyCompletion([], undefined, 1)).toBeUndefined();
    expect(candidates).toEqual([first, disabled, last]);
  });
});
