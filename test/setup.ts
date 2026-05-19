import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterEach } from "bun:test";

GlobalRegistrator.register();

// Import after registration so document exists
const { cleanup } = require("@testing-library/react");

afterEach(() => {
  cleanup();
});
