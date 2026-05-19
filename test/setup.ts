import { GlobalWindow } from "happy-dom";

const window = new GlobalWindow();
// @ts-expect-error - Happy-DOM environment setup
global.window = window;
// @ts-expect-error - Happy-DOM environment setup
global.document = window.document;
// @ts-expect-error - Happy-DOM environment setup
global.navigator = window.navigator;
// @ts-expect-error - Happy-DOM environment setup
global.HTMLElement = window.HTMLElement;
// @ts-expect-error - Happy-DOM environment setup
global.Node = window.Node;
// @ts-expect-error - Happy-DOM environment setup
global.Event = window.Event;
// @ts-expect-error - Happy-DOM environment setup
global.CustomEvent = window.CustomEvent;
// @ts-expect-error - Happy-DOM environment setup
global.CSSStyleSheet = window.CSSStyleSheet;
