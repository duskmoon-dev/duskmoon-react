import React from "react";
import {
  dmMessageLineClass,
  dmMessageScrollbarClass,
  getDmMessageContentClasses,
} from "../../classes/dm-message";
import { MessageHolder, message } from "../message";
import type {
  DmMessageApi,
  DmMessageContentProps,
  DmMessageHolderProps,
  DmMessageType,
} from "./DmMessage.types";

function decodeHtmlEntities(content: string) {
  return content
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function ensureDmMessageConfig() {
  message.config({ duration: 3, maxCount: 3 });
}

export function DmMessageContent({
  content,
  className,
}: DmMessageContentProps) {
  const lines = decodeHtmlEntities(content || "").split("<br/>");

  return (
    <span className={getDmMessageContentClasses({ className })}>
      <span className={dmMessageScrollbarClass}>
        {lines.map((line, index) => (
          <span key={`${index}-${line}`} className={dmMessageLineClass}>
            {line}
          </span>
        ))}
      </span>
    </span>
  );
}

function typedOpen(type: DmMessageType) {
  return (content: string, key?: string) => {
    ensureDmMessageConfig();

    return message.open({
      content: <DmMessageContent content={content} />,
      key,
      type,
    });
  };
}

function open(content: string, key?: string, type: DmMessageType = "info") {
  ensureDmMessageConfig();

  return message.open({
    content: <DmMessageContent content={content} />,
    key,
    type,
  });
}

function destroy(key?: string) {
  message.destroy(key);
}

message.config({ duration: 3, maxCount: 3 });

export function DmMessageHolder({ className }: DmMessageHolderProps) {
  return <MessageHolder className={className} />;
}

export const DmMessage = {
  error: typedOpen("error"),
  success: typedOpen("success"),
  warning: typedOpen("warning"),
  info: typedOpen("info"),
  loading: typedOpen("loading"),
  open,
  destroy,
} satisfies DmMessageApi;

export default DmMessage;
