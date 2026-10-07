---
"@duskmoon-dev/components": minor
---

Use a native dialog for Modal so opening it enters the browser top layer and provides focus containment, background inertness, Escape dismissal, and focus return. Keep the existing content div ref and props. `maskClassName` now applies to the dialog, where it can style the native `::backdrop`; the physical `.modal-backdrop` element is no longer rendered by Modal.
