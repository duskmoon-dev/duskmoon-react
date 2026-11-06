---
"@duskmoon-dev/components": minor
---

Add a controlled semantic `ChatSessionComposer` and an optional `RichChatComposer` from `/chat/rich`, with shared attachment intake, cancellable completion providers, host-owned draft storage, typed admission and recovery, authoritative queue controls, and acknowledged settings.

Preserve the existing plain `Chat.Composer` API and shortcuts. Keep the pinned optional Lexical runtime outside root and `/chat` import graphs, and preserve structured drafts when the rich editor is unavailable. These features require application adapters for authorization, execution, preparation, persistence, and reconciliation.
