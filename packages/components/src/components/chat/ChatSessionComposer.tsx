import React, { forwardRef } from "react";
import type {
  ChatSessionComposerHandle,
  ChatSessionComposerProps,
} from "./ChatSessionComposer.types";
import { SemanticComposer } from "./composer/SemanticComposer";
import { PlainSemanticEditor } from "./composer/PlainSemanticEditor";

/** Native textarea sessions with typed admission/recovery; legacy Chat.Composer remains compatible. */
export const ChatSessionComposer = forwardRef<
  ChatSessionComposerHandle,
  ChatSessionComposerProps
>((props, ref) => (
  <SemanticComposer
    {...props}
    ref={ref}
    Editor={PlainSemanticEditor}
    structured={false}
  />
));
ChatSessionComposer.displayName = "ChatSessionComposer";
