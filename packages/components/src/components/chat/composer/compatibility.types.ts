/** Compile-only compatibility fixtures: this module contains no runtime imports. */
import type { ComponentProps, KeyboardEvent, Ref } from "react";
import type {
  ChatComponent,
  ChatComposerProps,
  ChatComposerSubmission,
} from "../Chat.types";
import type {
  ComposerAcceptedCommandReceipt,
  ComposerCommandSubmission,
  ComposerPromptSubmission,
} from "../Composer.types";

type Assert<T extends true> = T;

type LegacyPlainConsumer = {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: (snapshot: ChatComposerSubmission) => Promise<boolean | void>;
  attachments: File[];
  onAttachmentsChange: (files: File[]) => void;
  textareaProps: {
    name: string;
    "aria-label": string;
    onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  };
};

/** A current consumer needs no new rich props and retains textarea forwarding. */
export type PlainComposerCompatibility = Assert<
  LegacyPlainConsumer extends ChatComposerProps ? true : false
>;
export type PlainComposerRefCompatibility = Assert<
  Ref<HTMLDivElement> extends ComponentProps<ChatComponent["Composer"]>["ref"]
    ? true
    : false
>;

type SteeringWithoutTarget = Omit<
  Extract<ComposerPromptSubmission, { intent: "steer" }>,
  "targetTurnId"
>;
export type SteeringRequiresTarget = Assert<
  SteeringWithoutTarget extends ComposerPromptSubmission ? false : true
>;

type CommandWithoutClaim = Omit<ComposerCommandSubmission, "document"> & {
  document: { schemaVersion: 1; content: [] };
};
export type CommandRequiresClaim = Assert<
  CommandWithoutClaim extends ComposerCommandSubmission ? false : true
>;

export type CommandCannotInventPromptIdentity = Assert<
  ComposerAcceptedCommandReceipt & { turnId: string } extends never
    ? true
    : false
>;
export type CommandCannotInventPromptDelivery = Assert<
  ComposerAcceptedCommandReceipt & { delivery: "immediate" } extends never
    ? true
    : false
>;
