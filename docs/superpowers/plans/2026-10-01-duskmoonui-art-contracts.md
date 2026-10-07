# DuskMoonUI CSS Art 1.20.0 contract report — 2026-10-01

> Historical target: this report remains the pinned 1.20.0 source review. The [current 1.20.3 report](2026-10-01-duskmoonui-1203-contracts.md) records the byte-identical published Art CSS and links each carried-forward audit. The original runtime tasks below remain `NOT_RUN`.

Status: **PARTIAL** source review; runtime **NOT_RUN**. Baseline `main` at `139fb7861d028dcb9ef117da5725f516ff4e6ccf`. Target `@duskmoon-dev/css-art@1.20.0` published stylesheet and pinned `v1.20.0` source/docs at `d8cc0223d76a3923d5923264f0595f76587adad8`; registry `gitHead` is `86b7ec15de00ff195a423dabb47ad0972980e165`. The published CSS determines shipped selectors; versioned MDX describes examples and intended composition. Source example agreement never proves browser appearance or interaction.

All **15 art families** are public wrappers in `packages/art-components/src/index.tsx`; `ArtCSSwitch` aliases `ArtCsswitch`. `src/styles.css` imports `@duskmoon-dev/css-art`; package exports expose the wrapper root and stylesheet. The six approved markup/default changes (Mountain, Flower, CircularGallery, ColorSpin, Snowball, Gemini) and the CSSwitch/Gemini accessibility edits are visible in current source and **implemented but unverified**. Other descendant selector comparisons remain UNKNOWN where stated. The current wrapper `README.md` documents gallery, CSSwitch and Gemini accessibility. No art API removal, deprecation, dependency change, or release is proposed.

`ALIGNED_SOURCE` below is limited to a named piece of local source and upstream CSS/docs. `UNKNOWN` is an unresolved source comparison and does not mean `NOT_RUN`; every future browser/unit task is `NOT_RUN` because verification is paused. `N/A` appears only for art with no user input/event contract. CSS animation still needs visual audit. Interactive Plasma Ball, Circular Gallery, CSSwitch, and Gemini Input have interaction/accessibility checks.

## Difference mapping and dispositions

| Target | Category | Old/new contract and evidence | Affected local surfaces | Action | Compatibility or migration reason | Verification/evidence status |
| --- | --- | --- | --- | --- | --- | --- |
| Mountain | design | `mountain.mdx:203-230`, published `art/mountain.css` grouped nth-of-type; prior local ungrouped tree indexing | `src/index.tsx` | adapt | Group scene layers; retain API/ref | Source implemented; runtime NOT_RUN |
| Flower Animation | design | `flower-animation.mdx:26-42` places light particles in `.flower__leafs` | `src/index.tsx` | adapt | Preserve scene structure and API | Source implemented; runtime NOT_RUN |
| Circular Gallery | behavior | `circular-gallery.mdx:14,134-156` linked hash cards and heading after cards | `src/index.tsx`, `README.md` | adapt | Accessible by default; retain caller aria/decorative control | Source implemented; runtime NOT_RUN |
| Color Spin | design | `color-spin.mdx:87-100` ring indices 1..4 | `src/index.tsx` | adapt | Correct offsets without public API change | Source implemented; runtime NOT_RUN |
| Snowball Preloader | design | `snowball-preloader.mdx:262-278` shadow paint order | `src/index.tsx` | adapt | Preserve loader API | Source implemented; runtime NOT_RUN |
| Gemini Input row count | behavior | `gemini-input.mdx:208-221` textarea rows=1 and CSS growth | `src/index.tsx` | adapt | Default to one row; explicit rows still work | Source implemented; runtime NOT_RUN |
| CSSwitch buttons | behavior | `csswitch.mdx:8-15`, published `art/csswitch.css:25,510` supports press/focus; baseline hidden buttons were unreachable | `src/index.tsx`, `README.md` | adapt | Current source defaults to named native buttons in tab order; effective explicit `aria-hidden` or decorative opt-in removes them; alias/ref preserved | Narrow source implemented; runtime NOT_RUN |
| Gemini Input button names | gap | `gemini-input.mdx:18-29` named icon actions; baseline `+`/`>` glyphs lacked descriptive names | `src/index.tsx`, `README.md` | adapt | Current source falls back to Add/Send only for default glyphs without caller label/labelledby; custom content and caller labels remain authoritative | Narrow source implemented; runtime NOT_RUN |
| Gemini Input disabled precedence | behavior | Baseline child prop spread followed parent `disabled`, so child `disabled=false` could re-enable action buttons (`src/index.tsx`) | `src/index.tsx`, `README.md` | adapt | Current source applies `disabled={disabled || childProps.disabled}` after spreading child props for both actions; caller labels/custom content remain intact | Narrow source implemented; runtime NOT_RUN |
| Synthwave side order | design | `synthwave-starfield.mdx:18-24` example orders topbot/lefrig; local reverses siblings | `src/index.tsx` | retain | CSS selector/paint impact unverified; compare before change | Source UNKNOWN; runtime NOT_RUN |

## Five checks and future audits


### ART-MOON — `ArtMoon`

Disposition: `retain`. Evidence: pinned `packages/docs/src/content/docs/en/css-art/moon.mdx`, published `packages/css-art/src/art/moon.css`, local `packages/art-components/src/index.tsx` and `src/styles.css`.

| Check | Result | Source finding and limit |
| --- | --- | --- |
| Design principles | ALIGNED_SOURCE | Crescent and glow are visual variants. This documented purpose is represented by the named wrapper; detailed selector and visual comparison is recorded separately. |
| Markup/styling | ALIGNED_SOURCE | Single `.art-moon` root; optional `-crescent`, `-glow` and size classes. Agreement is limited to the named structure; full selector/style comparison and browser rendering are NOT_RUN. |
| Interaction | N/A | N/A: published art has CSS animation only; no control, state transition, or event contract. |
| Accessibility | ALIGNED_SOURCE | Decorative by default; caller may provide a name or override `aria-hidden`. The source-level default/override is visible; browser/AT result is NOT_RUN. |
| Local compatibility | ALIGNED_SOURCE | Retain `crescent`, `glow`, sizes, root ref and div props. Named wrapper/ref/prop wiring is present in `src/index.tsx`; full package build/export validation is NOT_RUN. |

**Future audit `ART-MOON` — NOT_RUN.** Setup: import `@duskmoon-dev/art-components/styles.css` with published CSS Art 1.20.0 and render `ArtMoon`. Action: Render base, crescent, and glow variants at each size; inspect their classes and computed visual differences. Expected: Each documented variant visibly differs and caller title/name/ref remain on the root. Planned validation: scoped wrapper tests plus browser DOM/computed-style/keyboard observation where applicable.


### ART-SUN — `ArtSun`

Disposition: `retain`. Evidence: pinned `packages/docs/src/content/docs/en/css-art/sun.mdx`, published `packages/css-art/src/art/sun.css`, local `packages/art-components/src/index.tsx` and `src/styles.css`.

| Check | Result | Source finding and limit |
| --- | --- | --- |
| Design principles | ALIGNED_SOURCE | Rays, sunset and pulse are CSS visual variants. This documented purpose is represented by the named wrapper; detailed selector and visual comparison is recorded separately. |
| Markup/styling | ALIGNED_SOURCE | Single `.art-sun` root with documented modifier classes. Agreement is limited to the named structure; full selector/style comparison and browser rendering are NOT_RUN. |
| Interaction | N/A | N/A: no native input or activation in the published art contract. |
| Accessibility | ALIGNED_SOURCE | Decorative root is hidden by default unless caller supplies naming semantics. The source-level default/override is visible; browser/AT result is NOT_RUN. |
| Local compatibility | ALIGNED_SOURCE | Retain existing variant booleans, sizes through xl, root ref and props. Named wrapper/ref/prop wiring is present in `src/index.tsx`; full package build/export validation is NOT_RUN. |

**Future audit `ART-SUN` — NOT_RUN.** Setup: import `@duskmoon-dev/art-components/styles.css` with published CSS Art 1.20.0 and render `ArtSun`. Action: Render rays, sunset and pulse separately and together; inspect animation and color classes. Expected: Each modifier drives its documented visual state; root attributes and ref survive. Planned validation: scoped wrapper tests plus browser DOM/computed-style/keyboard observation where applicable.


### ART-ATOM — `ArtAtom`

Disposition: `retain`. Evidence: pinned `packages/docs/src/content/docs/en/css-art/atom.mdx`, published `packages/css-art/src/art/atom.css`, local `packages/art-components/src/index.tsx` and `src/styles.css`.

| Check | Result | Source finding and limit |
| --- | --- | --- |
| Design principles | ALIGNED_SOURCE | Three CSS electron orbits and a nucleus pseudo-element. This documented purpose is represented by the named wrapper; detailed selector and visual comparison is recorded separately. |
| Markup/styling | ALIGNED_SOURCE | Root has `.electron`, `.electron-alpha`, `.electron-omega` children; local source emits those three. Agreement is limited to the named structure; full selector/style comparison and browser rendering are NOT_RUN. |
| Interaction | N/A | N/A: animation is CSS-only and source defines no user trigger. |
| Accessibility | ALIGNED_SOURCE | Decorative wrapper uses `aria-hidden` by default; an explicit name overrides it. The source-level default/override is visible; browser/AT result is NOT_RUN. |
| Local compatibility | ALIGNED_SOURCE | Retain size and root-prop API. Named wrapper/ref/prop wiring is present in `src/index.tsx`; full package build/export validation is NOT_RUN. |

**Future audit `ART-ATOM` — NOT_RUN.** Setup: import `@duskmoon-dev/art-components/styles.css` with published CSS Art 1.20.0 and render `ArtAtom`. Action: Render Atom, inspect three orbit children, then compare animated geometry with pinned example. Expected: All three orbital selectors match; caller class/style/ref are preserved. Planned validation: scoped wrapper tests plus browser DOM/computed-style/keyboard observation where applicable.


### ART-ECLIPSE — `ArtEclipse`

Disposition: `retain`. Evidence: pinned `packages/docs/src/content/docs/en/css-art/eclipse.mdx`, published `packages/css-art/src/art/eclipse.css`, local `packages/art-components/src/index.tsx` and `src/styles.css`.

| Check | Result | Source finding and limit |
| --- | --- | --- |
| Design principles | ALIGNED_SOURCE | Six rotating corona layers. This documented purpose is represented by the named wrapper; detailed selector and visual comparison is recorded separately. |
| Markup/styling | ALIGNED_SOURCE | Six `.layer.layer-1` through `.layer.layer-6` children in local source and pinned example. Agreement is limited to the named structure; full selector/style comparison and browser rendering are NOT_RUN. |
| Interaction | N/A | N/A: CSS animation has no published input/control contract. |
| Accessibility | ALIGNED_SOURCE | Default decorative semantics apply to the root. The source-level default/override is visible; browser/AT result is NOT_RUN. |
| Local compatibility | ALIGNED_SOURCE | Retain size and forwarded root div API. Named wrapper/ref/prop wiring is present in `src/index.tsx`; full package build/export validation is NOT_RUN. |

**Future audit `ART-ECLIPSE` — NOT_RUN.** Setup: import `@duskmoon-dev/art-components/styles.css` with published CSS Art 1.20.0 and render `ArtEclipse`. Action: Render Eclipse and inspect six distinct layer classes and their animation. Expected: All six layers are styled and root ref/attributes are forwarded. Planned validation: scoped wrapper tests plus browser DOM/computed-style/keyboard observation where applicable.


### ART-MOUNTAIN — `ArtMountain`

Disposition: `adapt`. Evidence: pinned `packages/docs/src/content/docs/en/css-art/mountain.mdx`, published `packages/css-art/src/art/mountain.css`, local `packages/art-components/src/index.tsx` and `src/styles.css`.

| Check | Result | Source finding and limit |
| --- | --- | --- |
| Design principles | ALIGNED_SOURCE | Night scene has four mountains, three trees and nine aurora columns. This documented purpose is represented by the named wrapper; detailed selector and visual comparison is recorded separately. |
| Markup/styling | ALIGNED_SOURCE | Pinned grouped `.mountains`, `.trees`, `.lights`; published CSS uses per-group nth-of-type selectors. Current local source groups children accordingly. Agreement is limited to the named structure; full selector/style comparison and browser rendering are NOT_RUN. |
| Interaction | N/A | N/A: scene animation is CSS-only; no published control. |
| Accessibility | ALIGNED_SOURCE | Decorative default can be overridden with caller name. The source-level default/override is visible; browser/AT result is NOT_RUN. |
| Local compatibility | ALIGNED_SOURCE | Source adaptation implemented; preserve size, root props and ref. Named wrapper/ref/prop wiring is present in `src/index.tsx`; full package build/export validation is NOT_RUN. |

**Future audit `ART-MOUNTAIN` — NOT_RUN.** Setup: import `@duskmoon-dev/art-components/styles.css` with published CSS Art 1.20.0 and render `ArtMountain`. Action: Render Mountain and inspect the direct children of each group and computed tree positions. Expected: Four mountain, three tree and nine light selectors match the published CSS; trees render in intended positions. Planned validation: scoped wrapper tests plus browser DOM/computed-style/keyboard observation where applicable.


### ART-SNOW — `ArtSnowflake`

Disposition: `retain`. Evidence: pinned `packages/docs/src/content/docs/en/css-art/snow.mdx`, published `packages/css-art/src/art/snow.css`, local `packages/art-components/src/index.tsx` and `src/styles.css`.

| Check | Result | Source finding and limit |
| --- | --- | --- |
| Design principles | ALIGNED_SOURCE | Snowflake supports dot/unicode and falling modifiers; a scene composes multiple flakes. This documented purpose is represented by the named wrapper; detailed selector and visual comparison is recorded separately. |
| Markup/styling | ALIGNED_SOURCE | Single root with optional `-unicode` and `-fall`; local booleans map to these classes. Agreement is limited to the named structure; full selector/style comparison and browser rendering are NOT_RUN. |
| Interaction | N/A | N/A: fall animation is CSS-only and has no activation API. |
| Accessibility | ALIGNED_SOURCE | One flake is decorative by default; enclosing scene can be labelled by caller. The source-level default/override is visible; browser/AT result is NOT_RUN. |
| Local compatibility | ALIGNED_SOURCE | Retain unicode/fall, root ref and style props. Named wrapper/ref/prop wiring is present in `src/index.tsx`; full package build/export validation is NOT_RUN. |

**Future audit `ART-SNOW` — NOT_RUN.** Setup: import `@duskmoon-dev/art-components/styles.css` with published CSS Art 1.20.0 and render `ArtSnowflake`. Action: Render dot and unicode flakes, toggle fall prop, and inspect animation class/computed motion. Expected: Each documented variant resolves its selector without changing forwarded props. Planned validation: scoped wrapper tests plus browser DOM/computed-style/keyboard observation where applicable.


### ART-PLASMA_BALL — `ArtPlasmaBall`

Disposition: `retain`. Evidence: pinned `packages/docs/src/content/docs/en/css-art/plasma-ball.mdx`, published `packages/css-art/src/art/plasma-ball.css`, local `packages/art-components/src/index.tsx` and `src/styles.css`.

| Check | Result | Source finding and limit |
| --- | --- | --- |
| Design principles | ALIGNED_SOURCE | Interactive CSS plasma ball uses a checkbox and hover-attracted rays. This documented purpose is represented by the named wrapper; detailed selector and visual comparison is recorded separately. |
| Markup/styling | UNKNOWN | Hidden `.switcher` checkbox precedes glassball/rays/base/switch; local source supplies it and six ray groups. Agreement is limited to the named structure; full selector/style comparison and browser rendering are NOT_RUN. |
| Interaction | UNKNOWN | Checkbox checked state and hover activate visual rays; local checked/defaultChecked/onCheckedChange map state, but full CSS state/disabled handling needs audit. |
| Accessibility | ALIGNED_SOURCE | Checkbox has fallback accessible label; inputProps can supply name; root is not hidden by decorative helper. The source-level default/override is visible; browser/AT result is NOT_RUN. |
| Local compatibility | ALIGNED_SOURCE | Retain controlled/uncontrolled props, callback, inputProps and root ref; source breadth remains UNKNOWN. Named wrapper/ref/prop wiring is present in `src/index.tsx`; full package build/export validation is NOT_RUN. |

**Future audit `ART-PLASMA_BALL` — NOT_RUN.** Setup: import `@duskmoon-dev/art-components/styles.css` with published CSS Art 1.20.0 and render `ArtPlasmaBall`. Action: Render unchecked then activate switch by keyboard; hover ball; repeat with controlled checked and callback. Expected: Checkbox changes or controlled callback fires once per activation; CSS rays respond to checked/hover and label remains announced. Planned validation: scoped wrapper tests plus browser DOM/computed-style/keyboard observation where applicable.


### ART-CIRCULAR_GALLERY — `ArtCircularGallery`

Disposition: `adapt`. Evidence: pinned `packages/docs/src/content/docs/en/css-art/circular-gallery.mdx`, published `packages/css-art/src/art/circular-gallery.css`, local `packages/art-components/src/index.tsx` and `src/styles.css`.

| Check | Result | Source finding and limit |
| --- | --- | --- |
| Design principles | ALIGNED_SOURCE | Cards use motion path, hover neighboring effects and hash-target preview; docs require Chrome 116+ Anchor Positioning. This documented purpose is represented by the named wrapper; detailed selector and visual comparison is recorded separately. |
| Markup/styling | ALIGNED_SOURCE | Pinned cards followed by heading; local source now maps linked cards before heading, uses unique generated IDs and --i/--bg-img. Agreement is limited to the named structure; full selector/style comparison and browser rendering are NOT_RUN. |
| Interaction | ALIGNED_SOURCE | Local anchors target each generated card ID and published CSS uses `:target` for preview; decorative opt-in removes links from tab order. Actual hash navigation and presentation are NOT_RUN. |
| Accessibility | ALIGNED_SOURCE | Local default exposes linked cards; explicit aria-hidden/decorative hides links from tab order; image alt derives from item title unless provided. The source-level default/override is visible; browser/AT result is NOT_RUN. |
| Local compatibility | ALIGNED_SOURCE | Source adaptation implemented; retain items/title, href/target/rel, decorative override and root ref. Named wrapper/ref/prop wiring is present in `src/index.tsx`; full package build/export validation is NOT_RUN. |

**Future audit `ART-CIRCULAR_GALLERY` — NOT_RUN.** Setup: import `@duskmoon-dev/art-components/styles.css` with published CSS Art 1.20.0 and render `ArtCircularGallery`. Action: Render two cards; tab and activate first link, inspect hash and preview; rerender decorative and explicit aria-hidden. Expected: Default links are keyboard reachable and target the correct unique card; decorative hidden links leave tab order, while caller overrides govern root semantics. Planned validation: scoped wrapper tests plus browser DOM/computed-style/keyboard observation where applicable.


### ART-CAT_STARGAZER — `ArtCatStargazer`

Disposition: `retain`. Evidence: pinned `packages/docs/src/content/docs/en/css-art/cat-stargazer.mdx`, published `packages/css-art/src/art/cat-stargazer.css`, local `packages/art-components/src/index.tsx` and `src/styles.css`.

| Check | Result | Source finding and limit |
| --- | --- | --- |
| Design principles | ALIGNED_SOURCE | Animated cat, helmet and moon scene. This documented purpose is represented by the named wrapper; detailed selector and visual comparison is recorded separately. |
| Markup/styling | UNKNOWN | Local emits moon/cat and named nested anatomy; full descendant order versus pinned example remains unverified. Agreement is limited to the named structure; full selector/style comparison and browser rendering are NOT_RUN. |
| Interaction | N/A | N/A: published art is animation without input or event contract. |
| Accessibility | ALIGNED_SOURCE | Decorative by default; caller can provide description/name. The source-level default/override is visible; browser/AT result is NOT_RUN. |
| Local compatibility | ALIGNED_SOURCE | Retain size and root ref; audit descendant selector coverage before source alignment claim. Named wrapper/ref/prop wiring is present in `src/index.tsx`; full package build/export validation is NOT_RUN. |

**Future audit `ART-CAT_STARGAZER` — NOT_RUN.** Setup: import `@duskmoon-dev/art-components/styles.css` with published CSS Art 1.20.0 and render `ArtCatStargazer`. Action: Render cat and compare computed positions of moon, helmet, body, whiskers and eyes with pinned scene. Expected: Every named CSS child resolves and no essential anatomy disappears at supported sizes. Planned validation: scoped wrapper tests plus browser DOM/computed-style/keyboard observation where applicable.


### ART-FLOWER_ANIMATION — `ArtFlowerAnimation`

Disposition: `adapt`. Evidence: pinned `packages/docs/src/content/docs/en/css-art/flower-animation.mdx`, published `packages/css-art/src/art/flower-animation.css`, local `packages/art-components/src/index.tsx` and `src/styles.css`.

| Check | Result | Source finding and limit |
| --- | --- | --- |
| Design principles | ALIGNED_SOURCE | Four flowers, grasses, glow particles and floating heart bubbles animate through CSS. This documented purpose is represented by the named wrapper; detailed selector and visual comparison is recorded separately. |
| Markup/styling | ALIGNED_SOURCE | Pinned particles live inside `.flower__leafs`; current Flower source nests the eight lights there. Other dense descendant selectors still need audit. Agreement is limited to the named structure; full selector/style comparison and browser rendering are NOT_RUN. |
| Interaction | N/A | N/A: animations have no published user trigger. |
| Accessibility | ALIGNED_SOURCE | Decorative root by default; nested heart SVG is aria-hidden. The source-level default/override is visible; browser/AT result is NOT_RUN. |
| Local compatibility | ALIGNED_SOURCE | Source adaptation implemented for particle placement; preserve root API and size. Named wrapper/ref/prop wiring is present in `src/index.tsx`; full package build/export validation is NOT_RUN. |

**Future audit `ART-FLOWER_ANIMATION` — NOT_RUN.** Setup: import `@duskmoon-dev/art-components/styles.css` with published CSS Art 1.20.0 and render `ArtFlowerAnimation`. Action: Render all four flowers; inspect eight lights within each leaf container, grass, bubbles and computed particle origins. Expected: Particle origin follows each bloom; documented grass and bubble layers render at supported sizes. Planned validation: scoped wrapper tests plus browser DOM/computed-style/keyboard observation where applicable.


### ART-COLOR_SPIN — `ArtColorSpin`

Disposition: `adapt`. Evidence: pinned `packages/docs/src/content/docs/en/css-art/color-spin.mdx`, published `packages/css-art/src/art/color-spin.css`, local `packages/art-components/src/index.tsx` and `src/styles.css`.

| Check | Result | Source finding and limit |
| --- | --- | --- |
| Design principles | ALIGNED_SOURCE | Four translucent rotating rings use CSS custom index and blend effects. This documented purpose is represented by the named wrapper; detailed selector and visual comparison is recorded separately. |
| Markup/styling | ALIGNED_SOURCE | Published example sets --i to 1..4; local four li nodes now use those indices. Agreement is limited to the named structure; full selector/style comparison and browser rendering are NOT_RUN. |
| Interaction | N/A | N/A: CSS rotation has no documented input/control. |
| Accessibility | ALIGNED_SOURCE | Decorative by default. The source-level default/override is visible; browser/AT result is NOT_RUN. |
| Local compatibility | ALIGNED_SOURCE | Source adaptation implemented; retain size, custom style, root ref. Named wrapper/ref/prop wiring is present in `src/index.tsx`; full package build/export validation is NOT_RUN. |

**Future audit `ART-COLOR_SPIN` — NOT_RUN.** Setup: import `@duskmoon-dev/art-components/styles.css` with published CSS Art 1.20.0 and render `ArtColorSpin`. Action: Render ColorSpin; inspect all four li --i values and computed rotation offsets. Expected: Values are 1,2,3,4 and each ring occupies its documented quarter turn. Planned validation: scoped wrapper tests plus browser DOM/computed-style/keyboard observation where applicable.


### ART-SYNTHWAVE_STARFIELD — `ArtSynthwaveStarfield`

Disposition: `retain`. Evidence: pinned `packages/docs/src/content/docs/en/css-art/synthwave-starfield.mdx`, published `packages/css-art/src/art/synthwave-starfield.css`, local `packages/art-components/src/index.tsx` and `src/styles.css`.

| Check | Result | Source finding and limit |
| --- | --- | --- |
| Design principles | ALIGNED_SOURCE | Four 3D grid planes and two star layers; paused modifier freezes CSS animation. This documented purpose is represented by the named wrapper; detailed selector and visual comparison is recorded separately. |
| Markup/styling | UNKNOWN | Root emits side pairs and two star children; pinned example orders topbot before lefrig, local reverses them; selector impact is unresolved. Agreement is limited to the named structure; full selector/style comparison and browser rendering are NOT_RUN. |
| Interaction | ALIGNED_SOURCE | Local paused prop adds `.art-synthwave-starfield-paused`; pinned CSS lines 224-226 set descendant pseudo-element `animation-play-state: paused`. Actual motion pause/resume is NOT_RUN. |
| Accessibility | ALIGNED_SOURCE | Decorative default; caller naming override available. The source-level default/override is visible; browser/AT result is NOT_RUN. |
| Local compatibility | ALIGNED_SOURCE | Retain paused/size/ref; check whether side order changes painting or selector behavior. Named wrapper/ref/prop wiring is present in `src/index.tsx`; full package build/export validation is NOT_RUN. |

**Future audit `ART-SYNTHWAVE_STARFIELD` — NOT_RUN.** Setup: import `@duskmoon-dev/art-components/styles.css` with published CSS Art 1.20.0 and render `ArtSynthwaveStarfield`. Action: Render running scene, set paused=true, inspect all four planes/two star layers and computed animation-play-state. Expected: Motion stops when paused and resumes when false; documented layers remain visible. Planned validation: scoped wrapper tests plus browser DOM/computed-style/keyboard observation where applicable.


### ART-CSSWITCH — `ArtCsswitch / ArtCSSwitch`

Disposition: `adapt`. Evidence: pinned `packages/docs/src/content/docs/en/css-art/csswitch.mdx`, published `packages/css-art/src/art/csswitch.css`, local `packages/art-components/src/index.tsx` and `src/styles.css`.

| Check | Result | Source finding and limit |
| --- | --- | --- |
| Design principles | ALIGNED_SOURCE | Responsive console has button press highlights in published docs and CSS. This documented purpose is represented by the named wrapper; detailed selector and visual comparison is recorded separately. |
| Markup/styling | UNKNOWN | Local source emits body/grip/controllers and native button nodes; full breakpoint and descendant selector order comparison remains unresolved. |
| Interaction | ALIGNED_SOURCE | Published CSS highlights `button:active`; current native buttons are in tab order by default. Their pressed visual response still needs browser inspection. |
| Accessibility | ALIGNED_SOURCE | Current controls have explicit names and default keyboard reachability. `decorative` or effective root `aria-hidden=true`/`"true"` sets button tabIndex=-1; explicit root accessibility attributes take precedence. Browser/AT remains NOT_RUN. |
| Local compatibility | ALIGNED_SOURCE | Retain alias and root API; current source exposes named controls by default and preserves decorative opt-in. Named wrapper/ref/prop wiring is present in `src/index.tsx`; full package build/export validation is NOT_RUN. |

**Future audit `ART-CSSWITCH` — NOT_RUN.** Setup: import `@duskmoon-dev/art-components/styles.css` with published CSS Art 1.20.0 and render `ArtCsswitch / ArtCSSwitch`. Action: At each responsive breakpoint, tab to controller buttons, press Space/Enter, and inspect active highlight plus accessible names. Expected: Default controls are named and keyboard reachable with visible press feedback; decorative or explicit root hidden mode removes controls from the tab order while preserving caller attributes. Planned validation: scoped wrapper tests plus browser DOM/computed-style/keyboard observation where applicable.


### ART-SNOWBALL_PRELOADER — `ArtSnowballPreloader`

Disposition: `adapt`. Evidence: pinned `packages/docs/src/content/docs/en/css-art/snowball-preloader.mdx`, published `packages/css-art/src/art/snowball-preloader.css`, local `packages/art-components/src/index.tsx` and `src/styles.css`.

| Check | Result | Source finding and limit |
| --- | --- | --- |
| Design principles | ALIGNED_SOURCE | Animated ball orbits ring with masking and textured shadows. This documented purpose is represented by the named wrapper; detailed selector and visual comparison is recorded separately. |
| Markup/styling | ALIGNED_SOURCE | Pinned ball child paint order is texture, outer shadow, inner shadow, side shadows; local now follows this order. Agreement is limited to the named structure; full selector/style comparison and browser rendering are NOT_RUN. |
| Interaction | N/A | N/A: loader is CSS motion, no input or activation contract. |
| Accessibility | ALIGNED_SOURCE | Decorative default means status announcement belongs to consuming app. The source-level default/override is visible; browser/AT result is NOT_RUN. |
| Local compatibility | ALIGNED_SOURCE | Source adaptation implemented; retain size and root ref. Named wrapper/ref/prop wiring is present in `src/index.tsx`; full package build/export validation is NOT_RUN. |

**Future audit `ART-SNOWBALL_PRELOADER` — NOT_RUN.** Setup: import `@duskmoon-dev/art-components/styles.css` with published CSS Art 1.20.0 and render `ArtSnowballPreloader`. Action: Render loader and inspect ball child order, mask and computed ring/ball animation. Expected: Four named ball layers have pinned order and orbit/occlusion is visible. Planned validation: scoped wrapper tests plus browser DOM/computed-style/keyboard observation where applicable.


### ART-GEMINI_INPUT — `ArtGeminiInput`

Disposition: `adapt`. Evidence: pinned `packages/docs/src/content/docs/en/css-art/gemini-input.mdx`, published `packages/css-art/src/art/gemini-input.css`, local `packages/art-components/src/index.tsx` and `src/styles.css`.

| Check | Result | Source finding and limit |
| --- | --- | --- |
| Design principles | ALIGNED_SOURCE | Multiline textarea uses `field-sizing: content` and animated gradient border. This documented purpose is represented by the named wrapper; detailed selector and visual comparison is recorded separately. |
| Markup/styling | ALIGNED_SOURCE | Pinned single-row textarea; current source defaults rows=1 and forwards explicit rows/textareaProps. Full computed growth remains NOT_RUN. |
| Interaction | ALIGNED_SOURCE | Native textarea forwards value/defaultValue/onChange/readOnly/required. Both action buttons now spread child props before `disabled={disabled || childProps.disabled}`, so a disabled parent wins over child `disabled=false`; actual submission and growth remain NOT_RUN. |
| Accessibility | ALIGNED_SOURCE | Current `+` and `>` defaults receive Add and Send only when caller label/labelledby is absent; custom content keeps caller naming responsibility. Browser/AT remains NOT_RUN. |
| Local compatibility | ALIGNED_SOURCE | Retain value/defaultValue/onChange, button slots/props and root ref; default glyph labels are implemented in source without replacing custom caller labels. Named wrapper/ref/prop wiring is present in `src/index.tsx`; full package build/export validation is NOT_RUN. |

**Future audit `ART-GEMINI_INPUT` — NOT_RUN.** Setup: import `@duskmoon-dev/art-components/styles.css` with published CSS Art 1.20.0 and render `ArtGeminiInput`. Action: Render default GeminiInput and inspect accessibility names; type several lines, submit via a form button, then render parent disabled with child `disabled=false` and explicit rows=3. Expected: Textarea grows and preserves value/callback/form semantics; both default buttons have meaningful names, parent disabled consistently disables both buttons, and explicit rows overrides default. Planned validation: scoped wrapper tests plus browser DOM/computed-style/keyboard observation where applicable.
