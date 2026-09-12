---
name: Nakhle Rizk Studio
description: An open studio of working software, with citron fields and deep ink.
colors:
  citron: "#e4ed87"
  ink: "#20251e"
  paper: "#f4f5ef"
  background: "hsl(70 23% 95%)"
  foreground: "hsl(103 10% 13%)"
  secondary: "hsl(70 18% 89%)"
  muted-foreground: "hsl(100 5% 35%)"
  border: "hsl(80 9% 77%)"
  spot: "#495c28"
  error: "#b53423"
  dark-background: "hsl(103 10% 10%)"
  dark-foreground: "hsl(70 23% 95%)"
  dark-secondary: "hsl(103 8% 17%)"
  dark-muted-foreground: "hsl(80 10% 72%)"
  dark-border: "hsl(100 7% 30%)"
  dark-error: "#ffac9b"
typography:
  display:
    fontFamily: "Archivo, sans-serif"
    fontSize: "clamp(52px, 6.7vw, 96px)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Archivo, sans-serif"
    fontSize: "clamp(34px, 4.3vw, 62px)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Archivo, sans-serif"
    fontSize: "clamp(24px, 2.7vw, 38px)"
    fontWeight: 600
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "13px"
    lineHeight: 1.5
rounded:
  field: "8px"
  media: "16px"
  chip: "24px"
  case-action: "26px"
  button: "28px"
  circle: "50%"
spacing:
  control-gap: "8px"
  field-inset: "16px"
  content-gap: "24px"
  section-mobile: "65px"
  section-desktop: "100px"
  gutter: "clamp(22px, 4vw, 68px)"
components:
  button-send:
    backgroundColor: "{colors.foreground}"
    textColor: "{colors.background}"
    rounded: "{rounded.button}"
    width: "100%"
  button-case-primary:
    backgroundColor: "{colors.citron}"
    textColor: "{colors.ink}"
    rounded: "{rounded.case-action}"
    padding: "12px 22px"
  button-case-secondary:
    rounded: "{rounded.case-action}"
    padding: "12px 22px"
  input:
    backgroundColor: "{colors.secondary}"
    rounded: "{rounded.field}"
    padding: "{spacing.field-inset}"
    width: "100%"
  navigation-active:
    backgroundColor: "{colors.foreground}"
    textColor: "{colors.background}"
    rounded: "{rounded.chip}"
    padding: "12px 20px"
  filter-selected:
    backgroundColor: "{colors.citron}"
    textColor: "{colors.ink}"
    rounded: "{rounded.chip}"
    padding: "10px 20px"
  project-media:
    backgroundColor: "{colors.secondary}"
    rounded: "{rounded.media}"
  showcase-selector-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.citron}"
    rounded: "{rounded.field}"
    padding: "12px 16px"
---

# Design System: Nakhle Rizk Studio

## Overview

**Creative North Star: "An open studio of working software"**

Citron display fields, deep ink and cool porcelain give the portfolio a clear, confident studio character. Bold Archivo headings introduce the work; quieter Inter copy leaves room for real software screenshots and the owner's story. Rounded image apertures and compact controls sit within generous, flat layouts.

This documents the implemented public Vue portfolio. The selected direction and first-surface composition remain in `.impeccable/surface.md` (seed `5995483a`); durable product commitments remain in `PRODUCT.md`. The visual authority is the direct Vue implementation, with no image comp.

**Key Characteristics:**

- Bold headings with restrained supporting copy.
- Citron display fields and theme-aware porcelain or ink reading surfaces.
- Large image apertures with compact outlined or filled controls.
- Original graphics, deliberate interaction and motion that respects visibility.

## Colors

The palette combines lively citron with green-tinted neutrals; exact primitives above preserve the formats used in `resources/css/portfolio.css`.

### Primary

- **Citron:** large display fields, selected filters, project actions and circular image-opening controls.
- **Olive spot:** small text accents, carets and focus outlines in the light theme. The dark theme uses citron for this role.

### Neutral

- **Deep ink:** text on citron and the dark selected showcase control; remains fixed across themes.
- **Cool porcelain:** the fixed paper primitive, distinct from the semantic background.
- **Background / foreground:** reading surfaces and text; switch to their dark counterparts through the root `.dark` class.
- **Secondary / muted foreground / border:** quiet fields, supporting text and structural rules; each has a dark counterpart.
- **Error:** field validation uses brick red, with a lighter text color in dark mode.

**The Fixed Display Field Rule.** Citron-and-ink display fields retain their identity in both themes; reading surfaces use semantic theme tokens.

## Typography

**Display Font:** Archivo with sans-serif fallback.  
**Body Font:** Inter with system sans-serif fallbacks.

The pairing is direct and compact. Headings use tight tracking and balanced wrapping; body copy keeps a slower reading rhythm.

### Hierarchy

- **Display:** the frontmatter records the standard public heading. The showcase uses a smaller maximum (80px); case titles have a separate long-title treatment.
- **Headline:** section introductions use the responsive headline role.
- **Title:** project archive titles use the title role; smaller showcase captions use a local size.
- **Body:** general copy varies by context (15–18px); biography and case prose use a looser line height (1.85). Long prose is constrained (65–72ch).
- **Label:** navigation, metadata and field labels are compact (12–14px); preserve sentence case. Counters use tabular numerals.

## Layout

The public shell caps at (1680px), with a fluid gutter from the frontmatter. Sections commonly use desktop vertical space (100px), reducing to (65px) on mobile. Asymmetric two-column groups use broad gaps, often (8vw), rather than equal cards for every content type.

At (1100px), the header and showcase become more compact. At (767px) and below, primary content groups stack, the archive becomes one column, sticky secondary content becomes static, and the showcase selector becomes a two-column grid above its 3D stage. Project detail has an additional (1000px) adjustment. The desktop motion condition starts at (768px).

The archive alternates a full-width image with paired projects. Case galleries fit original screenshots without cropping, pairing portrait images and allowing landscape images to span the gallery. These are current surface patterns, not mandatory layouts for every future page.

## Elevation & Depth

The public system is flat. Background changes, fine dividers, image clipping and scale establish separation; contact inputs explicitly remove shadows. Depth comes from preserved Three.js graphics and small interaction responses, not raised card stacks.

**The Flat Surface Rule.** Use tonal separation and structural rules for ordinary containers; preserve the unshadowed public interface.

## Shapes

Fields and desktop showcase selectors have gently rounded corners; media apertures use a larger radius. Pills distinguish filters and actions, while circles carry compact icon controls. Body sections remain open rather than boxed. Display responsive WebP copies inside apertures with `object-fit: contain`, keeping full-size links pointed at the untouched originals; the owner portrait uses a cover crop.

## Components

### Buttons

Filled send buttons use the semantic foreground/background pair, full width and a minimum height (52px). Case actions use compact pills with minimum height (48px): citron for the website action and an outline for the source link. Case action hover switches to the semantic foreground/background pair on fine pointers. General filled buttons respond to press with a slight scale (0.97).

Visible focus uses a spot-colored outline (2px), offset (5px); citron fields use ink instead. Underlined text links retain minimum touch height (44px) and slightly shift their arrow on fine-pointer hover.

### Chips

Archive, timeline and skill filters use outlined pills with minimum height (44px). Selection fills the chip with citron and ink and is exposed through `aria-pressed`. Unselected hover uses the secondary surface.

### Cards / Containers

Project entries are open compositions: rounded media, a title and metadata underneath, then optional summary and tools. Images remain contained; fine-pointer hover scales archive images slightly (1.025). Circular citron controls signal opening. Case image links open the original asset at full size.

Contact form and details use rounded reading-surface containers on desktop, then lose their outer inset and rounding in the stacked mobile layout.

### Inputs / Fields

Fields have a secondary fill, transparent border and generous inset. Labels are explicit. Focus uses an olive/citron outline (2px), offset (3px); invalid fields have a red border and accompanying error text. The success message uses citron and ink. Disabled buttons show wait cursor and reduced opacity.

### Navigation

The sticky header hides after downward travel (12px) and returns after upward travel (6px), while remaining visible near the top, during menu use, when focused and after navigation. Desktop active links are filled pills. Mobile navigation expands below the header, uses larger Archivo links, exposes expanded/current state and supports Escape to close. The skip link becomes visible on focus.

### Interactive showcase

The citron homepage banner has rounded corners (24–44px). Its four discipline buttons select original procedural hard-surface 3D objects: a layered processor, mobile device, modular browser workstation, and game controller. Objects sit directly on the citron field with shared cream, graphite, metal, and copper materials. Each has its own mechanical animation, with horizontal drag controls and an explicit pause button. The work archive remains accessible through “Explore all work.” Mobile controls retain a two-column grid.

The stage dynamically loads after the birds intro and near the viewport, using one transparent renderer. Static parts are merged by material within articulated groups. Only the selected object is retained; geometry, materials, and textures are disposed on switching and unmount. Animation targets 30fps, caps pixel ratio at 1 on mobile and 1.5 on desktop, and pauses when offscreen or the document is hidden. Reduced motion renders a still composition and retains manual dragging. GSAP handles short object entrances. A text fallback keeps category navigation usable without WebGL.

### Graphics and motion

Keep the original birds transition, displacement-sphere shader and colors, DNA and Thinker. Model controls permit horizontal orbit only, with zoom and pan disabled. Model loading begins near the viewport (120px margin); rendering pauses offscreen and in hidden tabs, uses pixel ratio (1), samples the ASCII grid at (0.22), and caps active drawing near (30fps). Reduced motion disables automatic rotation and animation updates. The DNA is a full-section background with camera framing shifted on wide screens and fitted on narrow screens. Its original embedded animation plays while visible, with automatic camera rotation disabled and horizontal dragging retained. Foreground links remain clickable and vertical touch scrolling stays native.

The sphere uses pixel ratio (1), a (30fps) animation cap, viewport/tab visibility gates and a static reduced-motion rendering. The unchanged birds shader runs once per document load with a (1200ms) exit timer; internal Inertia visits skip it, as does reduced motion. Dispose WebGL resources and observers when components unmount.

GSAP handles introductory line reveals, one-time section reveals and the footer's scroll-linked letter lift. Lenis smooth wheel behavior is limited to fine pointers with motion enabled; touch scrolling remains native. Reduced motion removes public CSS transitions and GSAP motion. Do not introduce new continuous animation.

### Footer

The citron footer leads with the large linked invitation, followed by availability and then the ruled contact/social row. Its split-word lift is scroll-linked; the accessible link name remains complete. Keep this hierarchy when editing the existing footer.

## Do's and Don'ts

### Do:

- **Do** use semantic tokens for reading surfaces and fixed citron/ink for display fields.
- **Do** keep full project screenshots legible, with genuine technology marks and real project metadata.
- **Do** preserve visible focus, pressed/current state, reduced-motion behavior and WebGL performance gates.
- **Do** preserve migrated original media byte-for-byte; retain provenance in the external migration snapshot and `public/technology-icons/sources.json`.

### Don't:

- **Don't** replace the original birds, sphere appearance, DNA or Thinker as part of routine styling.
- **Don't** add new continuous animation or turn model controls into unrestricted orbit.
- **Don't** write provenance metadata into preserved media files.
- **Don't** turn the first-surface composition into a requirement for every page or apply this public system to private administration without a separate review.

