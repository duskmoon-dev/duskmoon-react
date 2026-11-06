import { Window } from "happy-dom";
import { afterEach } from "bun:test";
const window = new Window({ url: "http://localhost/" });
for (const key of [
  "window",
  "document",
  "navigator",
  "HTMLElement",
  "HTMLInputElement",
  "HTMLTextAreaElement",
  "Element",
  "Node",
  "Event",
  "MouseEvent",
  "KeyboardEvent",
  "MutationObserver",
  "getComputedStyle",
  "requestAnimationFrame",
  "cancelAnimationFrame",
]) {
  const value =
    key === "window"
      ? window
      : (window as unknown as Record<string, unknown>)[key];
  Object.defineProperty(globalThis, key, {
    configurable: true,
    writable: true,
    value:
      typeof value === "function" &&
      [
        "getComputedStyle",
        "requestAnimationFrame",
        "cancelAnimationFrame",
      ].includes(key)
        ? value.bind(window)
        : value,
  });
}
Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", {
  configurable: true,
  writable: true,
  value: true,
});
const { cleanup } = await import("@testing-library/react");
afterEach(cleanup);
