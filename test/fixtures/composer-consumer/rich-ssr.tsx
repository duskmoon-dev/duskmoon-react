import React from "react";
import { renderToString } from "react-dom/server";
import { RichChatComposer } from "@duskmoon-dev/components/chat/rich";
import { fixtureProps } from "./strict";
const html = renderToString(<RichChatComposer {...fixtureProps} />);
if (!html.includes("chat-composer"))
  throw new Error("Missing rich SSR loading/preserved markup");
console.log("PASS rich SSR");
