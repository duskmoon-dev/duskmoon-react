import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  chatAvatarClass,
  chatBaseClass,
  chatBubbleBaseClass,
  chatBubbleColorClasses,
  chatBubbleFilledClass,
  chatBubbleSizeClasses,
  chatBubbleStreamingClass,
  chatFooterClass,
  chatHeaderClass,
  chatPlacementClasses,
  chatReasoningClass,
  chatToolBaseClass,
  chatToolCallClass,
  chatToolHeaderClass,
  chatToolResultClass,
  chatToolStateClasses,
  chatToolStatusClass,
  chatTypingClass,
} from "../../classes/chat";

function localCss() {
  return readFileSync(join(import.meta.dir, "../../styles.css"), "utf8");
}

function availableCssClasses() {
  const coreCss = readFileSync(
    join(
      import.meta.dir,
      "../../../node_modules/@duskmoon-dev/core/dist/index.css",
    ),
    "utf8",
  );
  const componentCss = localCss();

  return new Set(
    Array.from(
      `${coreCss}\n${componentCss}`.matchAll(/\.([a-zA-Z0-9_-]+)/g),
      (match) => match[1],
    ),
  );
}

describe("Chat class integration", () => {
  test("every emitted class is available in the bundled styles", () => {
    const classes = [
      chatBaseClass,
      chatAvatarClass,
      chatHeaderClass,
      chatBubbleBaseClass,
      chatFooterClass,
      chatReasoningClass,
      chatToolBaseClass,
      chatToolHeaderClass,
      chatToolStatusClass,
      chatToolCallClass,
      chatToolResultClass,
      chatTypingClass,
      chatBubbleFilledClass,
      chatBubbleStreamingClass,
      ...Object.values(chatPlacementClasses),
      ...Object.values(chatBubbleColorClasses),
      ...Object.values(chatBubbleSizeClasses),
      ...Object.values(chatToolStateClasses),
    ];
    const available = availableCssClasses();

    for (const className of classes) {
      expect(available.has(className), className).toBe(true);
    }
  });

  test("upstream styles use distinct caret and tail pseudo-elements", () => {
    const css = readFileSync(
      join(
        import.meta.dir,
        "../../../node_modules/@duskmoon-dev/core/dist/components/chat.css",
      ),
      "utf8",
    );
    expect(css).toContain(".chat-bubble-streaming::after");
    expect(css).toContain(".chat-start .chat-bubble::before");
    expect(css).toContain(".chat-end .chat-bubble::before");
  });
});
