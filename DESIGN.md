---
name: Erlebnisly
description: A sophisticated, enterprise-grade design system for a high-fidelity activity booking platform. It balances professional B2B utility with modern, futuristic aesthetics.
version: 1.0.0

colors:
  primary:
    base: "#10B981" # Emerald 500
    light: "#34D399" # Emerald 400
    dark: "#059669" # Emerald 600
    container: "#D1FAE5" # Emerald 100
  surface:
    main: "#F7F9FB"
    dim: "#D8DADC"
    bright: "#F7F9FB"
    container-lowest: "#FFFFFF"
    container-low: "#F2F4F6"
    container: "#E2E8F0"
    container-high: "#CBD5E1"
    container-highest: "#94A3B8"
  text:
    primary: "#0F172A" # Slate 900
    secondary: "#475569" # Slate 600
    tertiary: "#94A3B8" # Slate 400
    on-primary: "#FFFFFF"
  border:
    subtle: "#E2E8F0" # Slate 200
    default: "#CBD5E1" # Slate 300
  status:
    success: "#10B981"
    warning: "#F59E0B"
    error: "#EF4444"
    info: "#3B82F6"
  special:
    futuristic-bg: "#0F172A" # Slate 900 for dark mode/onboarding
    glass: "rgba(255, 255, 255, 0.8)"
    glass-dark: "rgba(15, 23, 42, 0.8)"

typography:
  font-family:
    primary: "'Inter', sans-serif"
  weights:
    regular: 400
    medium: 500
    semibold: 600
    bold: 700
    black: 900
  scale:
    xs: "12px"
    sm: "14px" # Base body size
    base: "16px"
    lg: "18px"
    xl: "20px"
    xxl: "24px"
    xxxl: "32px"
    display: "48px"
  tracking:
    tight: "-0.02em" # Used for headings
    normal: "0"

spacing:
  unit: 4px
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
    md: 6px
    lg: 8px
    full: 9999px

layout:
  sidebar-width: 240px
  header-height: 64px
  max-width-desktop: 1440px
  grid-columns: 12

components:
  navigation:
    sidebar:
      type: "Permanent"
      width: "240px"
      style: "Border-right, high legibility"
    topbar:
      type: "Sticky"
      height: "64px"
      style: "Glassmorphic, backdrop-blur-md"
  cards:
    style: "Flat or subtly elevated, 4px radius"
    padding: "24px"
  buttons:
    style: "4px radius, medium weight text"
    primary: "Emerald 500 background, white text"
    secondary: "Slate 100 background, slate 900 text"

effects:
  shadow:
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
    default: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
  blur:
    md: "backdrop-filter: blur(12px)"
---
