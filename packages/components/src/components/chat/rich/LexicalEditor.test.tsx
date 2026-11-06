import React, { StrictMode } from "react";
import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import type { ComposerDocumentUpdate } from "../Composer.types";
import LexicalEditor from "./LexicalEditor";

test("mounting a nonempty controlled rich draft never emits an initial empty edit", () => {
  const changes: ComposerDocumentUpdate[] = [];
  const initial: ComposerDocumentUpdate = {
    revision: 7,
    origin: "restore",
    originId: "host",
    document: {
      schemaVersion: 1,
      content: [
        { type: "text", text: "你好 Draft " },
        {
          type: "reference",
          nodeId: "reference",
          providerId: "files",
          refId: "readme",
          label: "README",
          plainText: "@README",
        },
      ],
    },
  };
  render(
    <StrictMode>
      <LexicalEditor
        value={initial}
        instanceGeneration={0}
        onChange={(update) => changes.push(update)}
        onSelectionChange={() => {}}
        id="restored-rich"
        label="Restored rich draft"
        disabled={false}
      />
    </StrictMode>,
  );
  expect(changes).toEqual([]);
  expect(screen.getByRole("textbox").textContent).toBe("你好 Draft README");
});
