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
  chatStreamingCaretClass,
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
      chatStreamingCaretClass,
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

  test("keeps the streaming caret separate from directional tails", () => {
    const css = localCss();

    expect(css).toMatch(
      /\.chat-bubble-streaming::after\s*\{[^}]*content:\s*none/s,
    );
    expect(css).toMatch(
      /\.chat-start \.chat-bubble-streaming::after\s*\{[^}]*content:\s*""[^}]*animation:\s*none/s,
    );
    expect(css).toMatch(
      /\.chat-end \.chat-bubble-streaming::after\s*\{[^}]*content:\s*""[^}]*animation:\s*none/s,
    );
    expect(css).toMatch(
      /\.chat-streaming-caret\s*\{[^}]*animation:\s*chat-stream-caret/s,
    );
  });
});
