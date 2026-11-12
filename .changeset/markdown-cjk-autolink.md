---
"@duskmoon-dev/components": patch
---

End bare autolinked URLs in `Markdown` before CJK text and full-width punctuation, so `https://example.com，告诉我` links only `https://example.com`. Explicit `<url>` and `[text](url)` links and percent-encoded paths are unchanged.
