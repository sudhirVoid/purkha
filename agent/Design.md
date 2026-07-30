---
name: Purkha
colors:
  surface: '#fff8f1'
  surface-dim: '#e2d9cb'
  surface-bright: '#fff8f1'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fcf2e4'
  surface-container: '#f6eddf'
  surface-container-high: '#f0e7d9'
  surface-container-highest: '#eae1d3'
  on-surface: '#1f1b13'
  on-surface-variant: '#44474b'
  inverse-surface: '#343027'
  inverse-on-surface: '#f9f0e1'
  outline: '#74777c'
  outline-variant: '#c4c6cc'
  surface-tint: '#53606d'
  primary: '#182430'
  on-primary: '#ffffff'
  primary-container: '#2e3a46'
  on-primary-container: '#97a4b2'
  inverse-primary: '#bbc8d7'
  secondary: '#4c6451'
  on-secondary: '#ffffff'
  secondary-container: '#ceead2'
  on-secondary-container: '#516a57'
  tertiary: '#411600'
  on-tertiary: '#ffffff'
  tertiary-container: '#5f2908'
  on-tertiary-container: '#df8f67'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d7e4f3'
  primary-fixed-dim: '#bbc8d7'
  on-primary-fixed: '#101d28'
  on-primary-fixed-variant: '#3c4854'
  secondary-fixed: '#ceead2'
  secondary-fixed-dim: '#b2cdb6'
  on-secondary-fixed: '#092011'
  on-secondary-fixed-variant: '#344c3b'
  tertiary-fixed: '#ffdbcb'
  tertiary-fixed-dim: '#ffb692'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#713615'
  background: '#fff8f1'
  on-background: '#1f1b13'
  surface-variant: '#eae1d3'
typography:
  headline-xl:
    fontFamily: Literata
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Literata
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Literata
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Literata
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Fira Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Fira Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Space Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-xs:
    fontFamily: Space Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  terrace-padding: 40px
---

## Brand & Style
The design system is rooted in the "Purkha" theme, a contemporary digital interpretation of Himalayan heritage and ancestral lineage. It prioritizes a sense of timelessness, craftsmanship, and organic connection. The target audience seeks a contemplative, high-quality experience for documenting history or lineage.

The design style is **Tactile & Editorial**. It avoids the sterile coldness of modern SaaS in favor of a "Digital Lokta" aesthetic—warm, textured, and grounded. The interface utilizes structural motifs inspired by Newari architecture and the rhythmic flow of terraced landscapes to organize complex information. The emotional response is one of reverence, stability, and warmth.

## Colors
The palette is derived from natural pigments and traditional materials. 
- **Lokta Paper (#EFE6D8)** serves as the universal background, providing a warm, non-reflective surface that reduces eye strain.
- **Slate Dusk (#2E3A46)** provides the structural backbone, used for primary text and heavy navigation elements.
- **Terracotta Wood (#A15C38)** acts as the primary accent for interactive elements and primary actions.
- **Marigold Saffron (#D9963A)** is used sparingly for highlights, warnings, or active states that require attention.
- **Pine Deep Green (#3C5442)** provides a secondary accent for success states and biological/growth-related markers.
- **Dhaka Maroon (#7A2E2E)** is reserved for "signature moments"—significant milestones, hero icons, or high-impact buttons.

Apply a subtle 5% opacity noise texture over all `#EFE6D8` surfaces to emulate the organic grain of handmade paper.

## Typography
The typography system balances the literary authority of a serif with the functional clarity of a humanist sans.

- **Headlines:** Literata is used for all major headings. Its "carved" serif quality evokes historical texts and inscriptions. 
- **Body:** Fira Sans provides a legible, friendly, and open counterpoint to the serif, ensuring long-form content is easy to digest.
- **Utility:** Space Mono is used for dates, metadata, and technical labels. Its condensed, monospaced nature mimics typewriter annotations or ledger entries, adding to the archival feel.

## Layout & Spacing
The layout philosophy is based on **Terraced Fields**. Content is organized in stacked, horizontal tiers with varying vertical depths. 

- **Grid:** Use a 12-column grid for desktop with wide 24px gutters.
- **Margins:** Large outer margins (64px+) on desktop create an editorial, "book-like" feel.
- **Terracing:** Sections should use asymmetric padding (e.g., more padding on the top than the bottom) to create a visual "step" effect, mimicking the hillsides of the Himalayas.
- **Connection Lines:** Relationship lines in tree views should be slightly "slack" rather than perfectly straight, colored in muted variations of the five primary palette colors to resemble *Lungta* (prayer flag) strings.

## Elevation & Depth
This design system avoids traditional shadows. Depth is achieved through **Tonal Stacking** and **Lattice Overlays**.

- **Surfaces:** Use `#F5F0E6` (a lighter tint of Lokta) for raised containers.
- **Borders:** Instead of shadows, use 1px solid `#D1C7B7` borders. 
- **Newari Lattice:** For primary dividers or header footers, use a subtle SVG pattern stroke (wood-carved lattice) in Slate Dusk at 10% opacity. 
- **Signature Depth:** Significant "hero" cards use a double border—a thin inner line of Dhaka Maroon and a thicker outer line of Slate Dusk—to create a "framed" effect.

## Shapes
Shapes are primarily **Soft and Rectilinear**.
- **Cards & Inputs:** Use a small `0.25rem` radius. This maintains a structured, architectural feel while softening the edges for a modern digital interface.
- **Avatars:** Should be hexagonal or "clipped corner" rectangles rather than circles, referencing traditional window frames.
- **Signature Buttons:** May use a unique "notch" on the top right corner to reinforce the hand-crafted, wood-carved aesthetic.

## Components
- **Buttons:** Primary buttons are solid Terracotta Wood with Slate Dusk text. Secondary buttons are outlined in Slate Dusk. All buttons use Space Mono for text.
- **Chips:** Small, Slate Dusk backgrounds with Pine Green or Marigold accents. They should look like small fabric tags.
- **Lists:** Separated by thin 1px horizontal lines with a small "knot" icon at the intersection, resembling the tie-points of prayer flags.
- **Input Fields:** Bottom-bordered only by default, using Slate Dusk. On focus, the border thickens and changes to Terracotta Wood.
- **Cards:** Background color is the "Light Lokta" tint. Cards should feature the Newari lattice motif as a subtle header or footer decoration.
- **Ancestry Node:** A specific card component with a Dhaka Maroon left-accent border and Literata headline text.