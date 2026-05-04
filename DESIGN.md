---
name: Erlebnisly
colors:
  light:
    surface: "#f8f9fa"
    surface-dim: "#d9dadb"
    surface-bright: "#f8f9fa"
    surface-container-lowest: "#ffffff"
    surface-container-low: "#f3f4f5"
    surface-container: "#edeeef"
    surface-container-high: "#e7e8e9"
    surface-container-highest: "#e1e3e4"
    on-surface: "#191c1d"
    on-surface-variant: "#5c4037"
    inverse-surface: "#2e3132"
    inverse-on-surface: "#f0f1f2"
    outline: "#916f65"
    outline-variant: "#e6beb2"
    surface-tint: "#FF4D00"
    primary: "#FF4D00"
    on-primary: "#ffffff"
    primary-container: "#ffdbd0"
    on-primary-container: "#3b0900"
    inverse-primary: "#ffb59e"
    secondary: "#00686f"
    on-secondary: "#ffffff"
    secondary-container: "#9ef9ff"
    on-secondary-container: "#002022"
    tertiary: "#4d5d73"
    on-tertiary: "#ffffff"
    tertiary-container: "#d4e4fa"
    on-tertiary-container: "#0a1929"
    error: "#ba1a1a"
    on-error: "#ffffff"
    error-container: "#ffdad6"
    on-error-container: "#93000a"
    background: "#f8f9fa"
    on-background: "#191c1d"
    surface-variant: "#e1e3e4"
  dark:
    surface: "#051424"
    surface-dim: "#051424"
    surface-bright: "#2c3a4c"
    surface-container-lowest: "#010f1f"
    surface-container-low: "#0d1c2d"
    surface-container: "#122131"
    surface-container-high: "#1c2b3c"
    surface-container-highest: "#273647"
    on-surface: "#d4e4fa"
    on-surface-variant: "#e6beb2"
    inverse-surface: "#d4e4fa"
    inverse-on-surface: "#233143"
    outline: "#ad897e"
    outline-variant: "#5c4037"
    surface-tint: "#ffb59e"
    primary: "#FF4D00"
    on-primary: "#ffffff"
    primary-container: "#8a1e00"
    on-primary-container: "#ffdbd0"
    inverse-primary: "#ffb59e"
    secondary: "#d3fbff"
    on-secondary: "#00363a"
    secondary-container: "#00eefc"
    on-secondary-container: "#00686f"
    tertiary: "#c8c6c5"
    on-tertiary: "#313030"
    tertiary-container: "#929090"
    on-tertiary-container: "#2a2a2a"
    error: "#ffb4ab"
    on-error: "#690005"
    error-container: "#93000a"
    on-error-container: "#ffdad6"
    primary-fixed: "#ffdbd0"
    primary-fixed-dim: "#ffb59e"
    on-primary-fixed: "#3a0b00"
    on-primary-fixed-variant: "#852400"
    secondary-fixed: "#7df4ff"
    secondary-fixed-dim: "#00dbe9"
    on-secondary-fixed: "#002022"
    on-secondary-fixed-variant: "#004f54"
    tertiary-fixed: "#e5e2e1"
    tertiary-fixed-dim: "#c8c6c5"
    on-tertiary-fixed: "#1c1b1b"
    on-tertiary-fixed-variant: "#474746"
    background: "#051424"
    on-background: "#d4e4fa"
    surface-variant: "#273647"
typography:
  h1:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: "700"
    lineHeight: "1.1"
    letterSpacing: -0.02em
  h2:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: "600"
    lineHeight: "1.2"
    letterSpacing: -0.01em
  h3:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: "600"
    lineHeight: "1.3"
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: "400"
    lineHeight: "1.6"
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: "400"
    lineHeight: "1.6"
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: "700"
    lineHeight: "1"
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

The brand personality is **Adventurous, Precise, and Sophisticated**. This design system targets the "Modern Explorer"—individuals who value seamless technology as much as the adrenaline of a new experience. The aesthetic is a blend of **Minimalism** and **Glassmorphism**, designed to let high-octane photography take center stage while providing a high-tech interface that feels like a premium concierge service.

The UI should evoke a sense of anticipation and confidence. By utilizing deep obsidian surfaces contrasted with razor-sharp typography and tactical translucent layers, we create a "cockpit" feel for booking adventures. Every interaction must feel intentional, fast, and high-end.

## Colors

The color palette is anchored in a deep **Midnight Slate** for the primary background to ensure high-quality imagery "pops." The primary accent is **Ignite Orange** (#FF4D00), reserved exclusively for high-conversion actions like 'Book Now' and 'Confirm.' This creates a clear visual scent for the user's primary goal.

A secondary **Electric Cyan** is used sparingly for technical details, icons, or status indicators (e.g., "Verified Guide" or "Instant Confirmation"). The neutral scale favors cool greys to maintain the sleek, tech-forward aesthetic. Backgrounds should use subtle gradients or layered neutrals rather than pure black (#000000) to maintain depth and prevent OLED smearing.

## Typography

This design system utilizes a dual-font strategy to balance character with readability. **Space Grotesk** is used for headings and labels to provide a technical, geometric edge that fits the adventurous theme. For long-form descriptions and UI instructions, **Plus Jakarta Sans** provides a welcoming and highly legible experience, ensuring the premium details are easy to digest.

Emphasis is placed on a clear hierarchy. Use `label-caps` for metadata like category tags or "Difficulty Levels" to distinguish them from actionable text. Tight letter-spacing on headlines ensures a modern, impactful look, while generous line-height on body text maintains the premium, breathable feel.

## Layout & Spacing

The layout follows a **Fixed Grid** model for desktop to maintain the premium, editorial feel, while transitioning to a fluid model for mobile. We use a 12-column system with a 24px gutter. The spacing rhythm is strictly based on an 8px scale to ensure mathematical harmony across all components.

Large vertical sections should be separated by `xl` spacing to give the high-quality imagery room to breathe. For forms and technical details, use `sm` and `md` spacing to create tight, logical groupings that aid in clarity and cognitive load reduction.

## Elevation & Depth

Hierarchy is established through **Backdrop Blurs** and **Tonal Layers**. Instead of traditional drop shadows which can look muddy in dark mode, this design system uses inner borders (1px) with low opacity to define edges.

Surface tiers are defined as follows:

- **Level 0 (Background):** Deepest shade, used for the main page canvas.
- **Level 1 (Cards/Containers):** Slightly lighter neutral, used to group content.
- **Level 2 (Overlays/Modals):** Glassmorphic surfaces with a 20px blur and a subtle 10% white border. This is used for "Book Now" sidebars and floating headers to keep the adventure imagery visible beneath the UI.

## Shapes

The shape language is **Rounded**, utilizing a 0.5rem (8px) base radius. This strikes a balance between the precision of a technical platform and the approachability of a travel service.

- **Standard Components:** 8px (Buttons, Input fields, Small cards).
- **Featured Cards:** 16px (Large experience cards to feel more inviting).
- **Badges/Tags:** Fully rounded (Pill) to distinguish them from interactive buttons.
- **Form Inputs:** Strict 8px corners to maintain a "stable" and "secure" feel for transactional data.

## Components

### Buttons

- **Primary ('Book Now'):** High-saturation Ignite Orange background with white Space Grotesk Bold text. No shadow, 1px top-highlight for a subtle 3D feel.
- **Secondary:** Transparent with an Electric Cyan 1.5px border.
- **Glass Action:** Backdrop-blur (20px) with 20% white opacity, used for "Wishlist" or "Share" buttons overlaid on images.

### Cards

Experience cards must lead with a 16:9 or 4:5 image ratio. Text is overlaid using a bottom-to-top dark gradient scrim. Use the `label-caps` style for the location tag and a prominent price call-out in the bottom right using Space Grotesk.

### Forms & Inputs

Inputs should use a dark background (#1A1A1A) with a subtle 1px border. On focus, the border transitions to Electric Cyan with a soft outer glow. Labels must always be visible (no floating labels) to ensure maximum clarity during the booking process.

### Additional Components

- **Adventure Meter:** A custom progress-bar style component indicating the "Intensity Level" of an activity.
- **Sticky Booking Bar:** A mobile-bottom/desktop-sidebar glassmorphic container that keeps the price and 'Book Now' button visible at all times while scrolling experience details.
