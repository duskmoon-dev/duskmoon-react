import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterEach } from "bun:test";

GlobalRegistrator.register();

// Happy DOM lacks the Popover API; model its state. Tests dispatch toggle events
// explicitly because browsers deliver and coalesce those notifications later.
if (typeof HTMLElement.prototype.showPopover !== "function") {
  const openPopovers = new WeakSet<HTMLElement>();
  const nativeMatches = HTMLElement.prototype.matches;

  HTMLElement.prototype.matches = function (selector: string) {
    return selector === ":popover-open"
      ? openPopovers.has(this)
      : nativeMatches.call(this, selector);
  };

  HTMLElement.prototype.showPopover = function () {
    openPopovers.add(this);
  };

  HTMLElement.prototype.hidePopover = function () {
    openPopovers.delete(this);
  };
}

// Import after registration so document exists
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { cleanup } = require("@testing-library/react");

afterEach(() => {
  cleanup();
});
