---
"@duskmoon-dev/components": patch
"@duskmoon-dev/art-components": patch
---

Update Core and CSS Art to 1.20.7, including readable Markdown in colored Chat bubbles and centered native Circular Gallery previews.

Add Chat agent/content/work, controlled waiting queue and native composer primitives, plus opt-in collapsible user messages. Existing Chat APIs remain available; the new primitives require Core >=1.20.6.

Use native interest invokers for normal Tooltip controls and anchored native Popconfirm surfaces. Rich Popover/Popconfirm content retains caller-owned semantics. The already-deprecated Tooltip arrow option remains usable; the normal hint default is arrowless.

Align Plasma, Cat, Flower, Synthwave and CSSwitch markup with upstream CSS while retaining public art APIs, and add executable interaction examples to the documentation.
