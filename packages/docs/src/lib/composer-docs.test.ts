import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { getComponentDoc } from "./component-docs";

describe("Composer catalog contracts", () => {
  test.each([
    [
      "chat-session-composer",
      "ChatSessionComposerProps",
      "ChatSessionComposer.types.ts",
      "ChatSessionComposer.test.tsx",
      "@duskmoon-dev/components/chat",
      "Semantic Composer and Recovery",
    ],
    [
      "rich-chat-composer",
      "ChatSessionComposerProps",
      "ChatSessionComposer.types.ts",
      "rich/nodes.test.ts",
      "@duskmoon-dev/components/chat/rich",
      "Rich Composer and Authoritative Queue",
    ],
    [
      "chat-authoritative-queue",
      "ChatAuthoritativeQueueProps",
      "ComposerQueue.types.ts",
      "ChatAuthoritativeQueue.test.tsx",
      "@duskmoon-dev/components/chat",
      "Rich Composer and Authoritative Queue",
    ],
    [
      "composer-settings",
      "ComposerSettingsProps",
      "ComposerQueue.types.ts",
      "ComposerSettings.test.tsx",
      "@duskmoon-dev/components/chat",
      "Rich Composer and Authoritative Queue",
    ],
  ])(
    "%s documents its actual API and live host preview",
    (id, propsName, types, tests, importPath, demoTitle) => {
      const doc = getComponentDoc(id)!;
      expect(
        existsSync(new URL(`../pages/components/${id}.astro`, import.meta.url)),
      ).toBe(true);
      expect(doc.apiSource).toEndWith(`chat/${types}`);
      expect(doc.testSource).toEndWith(`chat/${tests}`);
      expect(doc.importPath).toBe(importPath);
      expect(
        doc.api.find(({ name }) => name === propsName)?.props.length,
      ).toBeGreaterThan(0);
      expect(doc.demos).toHaveLength(1);
      expect(doc.demos[0]).toMatchObject({
        title: demoTitle,
        source: "authored",
      });
      expect(doc.demos[0].code).toContain("function createDemoHost()");
      expect(
        doc.pageContent.usageNotes
          .map(({ description }) => description)
          .join(" "),
      ).not.toContain("Start with default props");
    },
  );

  test("readonly and multiline callbacks remain complete in the public reference", () => {
    const doc = getComponentDoc("chat-session-composer")!;
    const props = doc.api.find(
      ({ name }) => name === "ChatSessionComposerProps",
    )!.props;
    expect(props.find(({ name }) => name === "value")).toMatchObject({
      required: true,
      type: "ComposerDocumentUpdate",
    });
    expect(props.find(({ name }) => name === "onProviderInvoke")).toMatchObject(
      {
        required: false,
        type: "( effect: ComposerProviderSelectionEffect, ) => void | Promise<void>",
      },
    );
    expect(props.find(({ name }) => name === "options")?.description).toContain(
      "Captured immutably",
    );
    const queue = getComponentDoc("chat-authoritative-queue")!;
    expect(
      queue.api
        .find(({ name }) => name === "ChatAuthoritativeQueueProps")
        ?.props.find(({ name }) => name === "onMutation")?.type,
    ).toContain("Promise<ComposerQueueMutationResult>");
  });

  test("shared rich props and queue/settings support types stay explicit", () => {
    const rich = getComponentDoc("rich-chat-composer")!;
    expect(
      rich.api.find(({ name }) => name === "RichChatComposerProps"),
    ).toMatchObject({ kind: "type", definition: "ChatSessionComposerProps" });
    expect(
      rich.pageContent.usageNotes.find(
        ({ title }) => title === "Optional entry and peers",
      )?.description,
    ).toContain("/chat/rich");
    expect(
      getComponentDoc("composer-settings")!.api.map(({ name }) => name),
    ).toContain("ComposerSettingResult");
    expect(
      getComponentDoc("composer-settings")!.api.map(({ name }) => name),
    ).not.toContain("ComposerQueueEditorProps");
    expect(
      getComponentDoc("chat-authoritative-queue")!.api.map(({ name }) => name),
    ).not.toContain("ComposerSettingsProps");
  });
});
