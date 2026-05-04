---
name: Erlebnisly
description: >
  B2B activity-booking platform. Light-mode default, slate dark mode.
  Surfaces are cool-white/slate. Accent is Emerald green. Primary actions
  use black. Token prefix is `ds-` to avoid clashing with shadcn.
version: 2.0.0

# ─── COLOR TOKENS  (CSS: --color-ds-*)  ──────────────────────────────
#  Light-mode values (dark-mode overrides live in body.dark in globals.css)
colors:
  # Surfaces — light mode
  surface:                   "#F7F9FB"   # page background
  surface-dim:               "#D8DADC"
  surface-bright:            "#F7F9FB"
  surface-container-lowest:  "#FFFFFF"   # card bg
  surface-container-low:     "#F2F4F6"
  surface-container:         "#E2E8F0"
  surface-container-high:    "#CBD5E1"
  surface-container-highest: "#E2E8F0"

  # On-surface
  on-surface:         "#0F172A"   # Slate 900 — headings, body copy
  on-surface-variant: "#475569"   # Slate 600 — subtext
  inverse-surface:    "#1E293B"   # Slate 800
  inverse-on-surface: "#F1F5F9"

  # Outlines
  outline:         "#94A3B8"   # Slate 400 — borders, dividers
  outline-variant: "#E2E8F0"   # Slate 200 — subtle dividers

  # Primary — Black (CTA buttons, strong emphasis)
  primary:              "#000000"
  on-primary:           "#FFFFFF"
  primary-container:    "#131B2E"
  on-primary-container: "#7C839B"

  # Secondary — Emerald (brand accent, success, links)
  secondary:              "#10B981"   # Emerald 500
  on-secondary:           "#FFFFFF"
  secondary-container:    "#D1FAE5"   # Emerald 100
  on-secondary-container: "#065F46"   # Emerald 900

  # Error
  error:              "#BA1A1A"
  on-error:           "#FFFFFF"
  error-container:    "#FFDAD6"
  on-error-container: "#93000A"

  # Background
  background:    "#F7F9FB"
  on-background: "#0F172A"

  # ── Dark-mode overrides (applied via body.dark in globals.css) ──
  dark:
    background:                "#0F172A"   # Slate 900
    on-background:             "#F1F5F9"
    surface:                   "#0F172A"
    surface-container-lowest:  "#1E293B"   # Slate 800
    surface-container-low:     "#1E293B"
    surface-container:         "#1E293B"
    surface-container-high:    "#334155"   # Slate 700
    surface-container-highest: "#334155"
    on-surface:                "#F1F5F9"
    on-surface-variant:        "#94A3B8"
    outline:                   "#475569"
    outline-variant:           "#1E293B"
    secondary-container:       "#064E3B"   # Emerald 900
    on-secondary-container:    "#34D399"   # Emerald 400

  # Status (non-token, used inline)
  status:
    success:  "#10B981"   # same as secondary
    warning:  "#F59E0B"   # Amber 500
    error:    "#EF4444"   # Red 500
    info:     "#3B82F6"   # Blue 500

# ─── TYPOGRAPHY  ─────────────────────────────────────────────────────
typography:
  font-family: "'Inter', system-ui, -apple-system, sans-serif"

  # Utility classes: .type-display-lg, .type-headline-md, etc.
  scale:
    display-lg:   { size: "36px", line-height: "44px",  weight: 700, tracking: "-0.02em" }
    headline-md:  { size: "24px", line-height: "32px",  weight: 600, tracking: "-0.01em" }
    title-sm:     { size: "18px", line-height: "28px",  weight: 600 }
    body-md:      { size: "16px", line-height: "24px",  weight: 400 }
    body-sm:      { size: "14px", line-height: "20px",  weight: 400 }   # primary body size
    label-caps:   { size: "12px", line-height: "16px",  weight: 700, tracking: "0.05em", transform: "uppercase" }
    data-tabular: { size: "14px", line-height: "20px",  weight: 500, variant-numeric: "tabular-nums" }

# ─── SPACING  ────────────────────────────────────────────────────────
spacing:
  base: 4px   # Tailwind default
  scale:
    xs:          "4px"    # --spacing-stack-xs
    sm:          "8px"
    md:          "16px"   # --spacing-stack-md
    lg:          "32px"   # --spacing-stack-lg
    gutter:      "24px"   # column gutter  --spacing-gutter
    margin-page: "32px"   # outer page margin

# ─── BORDER RADIUS  (CSS: --radius-ds-*)  ────────────────────────────
radius:
  sm:  "2px"    # 0.125rem — inputs, chips
  default: "4px"  # 0.25rem  — buttons, form fields
  md:  "6px"    # 0.375rem — cards
  lg:  "8px"    # 0.5rem   — panels, drawers
  xl:  "12px"   # 0.75rem  — modals, dialogs
  full: "9999px"

# ─── LAYOUT  ─────────────────────────────────────────────────────────
layout:
  sidebar-width:      "240px"
  header-height:      "64px"
  container-max-width: "1440px"
  grid:
    columns: 12
    gutter:  "24px"
    margin:  "32px"

# ─── SHADOWS  ────────────────────────────────────────────────────────
shadows:
  sm: "0 1px 2px 0 rgba(0,0,0,0.05)"
  md: "0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -1px rgba(0,0,0,0.06)"

# ─── EFFECTS  ────────────────────────────────────────────────────────
effects:
  glassmorphic:
    background: "rgba(255,255,255,0.03)"
    blur:       "12px"
    border:     "rgba(255,255,255,0.1)"
    # hover: bg→0.07, border→rgba(16,185,129,0.4), translateY(-4px)
  topbar:
    background: "rgba(17,24,39,0.94)"   # dark mode
    blur:       "12px"

# ─── COMPONENT PATTERNS  ─────────────────────────────────────────────
components:
  navigation:
    sidebar:
      bg-light: "bg-ds-surface-container-low"
      bg-dark:  "#111827"
      active: "left border 4px ds-secondary, bg ds-secondary-container/10"
      CSS-class: "aside"
    topbar:
      height: "64px"
      CSS-class: "dash-topbar"

  buttons:
    primary:
      bg: "ds-primary (#000000)"
      text: "ds-on-primary (#FFFFFF)"
      radius: "4px (radius-ds)"
      weight: 500
    secondary:
      bg: "ds-surface-container-low"
      text: "ds-on-surface"
      radius: "4px"
    ghost:
      text: "ds-on-surface-variant"
      hover-bg: "ds-surface-container-low"
    accent:
      bg: "ds-secondary (#10B981)"
      text: "ds-on-secondary (#FFFFFF)"

  cards:
    default:
      bg-light: "#FFFFFF"
      bg-dark:  "#1E293B"
      border: "ds-outline-variant"
      radius: "6px (radius-ds-md)"
      shadow: "shadow-sm"
      CSS-class: "dash-card-white"
    glass:
      bg:     "rgba(255,255,255,0.03)"
      blur:   "12px"
      border: "rgba(255,255,255,0.1)"
      CSS-class: "onboarding-glass-card"

  theme-toggle:
    width: "64px"
    height: "32px"
    CSS-class: "dash-theme-toggle / dash-theme-dot"
    light-bg:  "#E2E8F0"
    dark-bg:   "#1E3A5F"

# ─── TOKEN USAGE GUIDE  ──────────────────────────────────────────────
#  Tailwind utilities generated from @theme in globals.css:
#    bg-ds-background          text-ds-on-surface
#    bg-ds-surface-container   text-ds-on-surface-variant
#    bg-ds-secondary           text-ds-secondary
#    rounded-ds  rounded-ds-md  rounded-ds-lg  rounded-ds-xl
#
#  Dark mode: toggled via body.dark class (not .dark media query).
#  Always test both modes when adding new surfaces or text colors.
---
