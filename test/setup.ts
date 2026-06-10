import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterEach } from "bun:test";

GlobalRegistrator.register();

// Import after registration so document exists
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { cleanup } = require("@testing-library/react");

afterEach(() => {
  cleanup();
});
