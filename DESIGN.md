---
name: Erlebnisly
description: A sophisticated, enterprise-grade design system for a high-fidelity activity booking platform. It balances professional B2B utility with modern, futuristic aesthetics, characterized by deep slate surfaces, emerald accents, and crisp glassmorphic effects.
version: 1.1.0

colors:
  primary:
    base: "#615fff" # Emerald 500 - Main action color
    light: "#7c86ff" # Emerald 400 - Hover states
    dark: "#432dd7" # Emerald 600 - Pressed states
    container: "#e0e7ff" # Emerald 100 - Success backgrounds
    on-primary: "#FFFFFF"

  surface:
    main: "#F7F9FB" # Light mode background
    dim: "#D8DADC" # Neutral borders/dividers
    bright: "#FFFFFF" # Card surfaces
    container-lowest: "#FFFFFF"
    container-low: "#F2F4F6"
    container: "#E2E8F0"
    container-high: "#CBD5E1"
    container-highest: "#94A3B8"

  dark-surface:
    main: "#0F172A" # Slate 900 - Dark mode/Onboarding background
    elevated: "#1E293B" # Slate 800 - Cards on dark
    border: "#334155" # Slate 700 - Borders on dark

  text:
    primary: "#0F172A" # Slate 900 - Headings and primary copy
    secondary: "#475569" # Slate 600 - Subtext and descriptions
    tertiary: "#94A3B8" # Slate 400 - Captions and disabled text
    on-surface: "#0F172A"
    on-dark: "#F8FAFC"

  status:
    success: "#10B981"
    warning: "#F59E0B"
    error: "#EF4444"
    info: "#3B82F6"

typography:
  font-family:
    primary: "'Inter', system-ui, -apple-system, sans-serif"
  weights:
    regular: 400
    medium: 500
    semibold: 600
    bold: 700
    black: 900
  scale:
    display: { size: "48px", weight: 900, tracking: "-0.02em", leading: "1.1" }
    h1: { size: "32px", weight: 700, tracking: "-0.02em", leading: "1.2" }
    h2: { size: "24px", weight: 700, tracking: "-0.01em", leading: "1.3" }
    h3: { size: "20px", weight: 600, tracking: "0", leading: "1.4" }
    base: { size: "16px", weight: 400, tracking: "0", leading: "1.5" }
    sm: { size: "14px", weight: 400, tracking: "0", leading: "1.5" } # Primary body size
    xs: { size: "12px", weight: 500, tracking: "0.01em", leading: "1.5" }

spacing:
  base: 4px
  scale:
    1: 4px
    2: 8px
    3: 12px
    4: 16px
    6: 24px
    8: 32px
    12: 48px
    16: 64px

geometry:
  radius:
    none: 0px
    sm: 2px
    default: 4px # Standard roundness (Round Four)
    md: 8px
    lg: 12px
    full: 9999px
  border-width:
    thin: 1px
    thick: 2px

layout:
  sidebar-width: 240px
  header-height: 64px
  container-max-width: 1440px
  grid:
    columns: 12
    gutter: 24px
    margin: 32px

components:
  navigation:
    sidebar:
      width: 240px
      background: "Surface Low or Dark Surface"
      active-state: "Emerald 500 left-border (4px), Emerald 50/Slate 800 background"
    topbar:
      height: 64px
      effect: "Glassmorphic, 12px blur, 80% opacity"

  buttons:
    primary:
      bg: "Emerald 500"
      text: "White"
      radius: "4px"
      font-weight: 500
    secondary:
      bg: "Slate 100"
      text: "Slate 900"
      radius: "4px"
    ghost:
      text: "Slate 600"
      hover: "Slate 100"

  cards:
    default:
      bg: "White"
      border: "Slate 200"
      radius: "4px"
      shadow: "shadow-sm"
    glass:
      bg: "rgba(255, 255, 255, 0.1)"
      blur: "12px"
      border: "rgba(255, 255, 255, 0.2)"

effects:
  shadows:
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
  blurs:
    sm: "4px"
    md: "12px"
    lg: "24px"
---
