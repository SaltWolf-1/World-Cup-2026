---
name: FIFA WC 2026 design system
description: Color scheme, flag sizing, layout conventions for the World Cup 2026 tracker app.
---

# FIFA WC 2026 Design

## Primary Color
- Dark mode: `--primary: 354 84% 58%` (FIFA Crimson Red, ~#F01A36)
- Light mode: `--primary: 354 84% 46%`
- Foreground: always white `0 0% 100%`
- Glow shadows: `rgba(232,25,60,X)` — replace any old `rgba(204,255,0,X)` lime references

## Accent Colors
- Blue (USA): `216 98% 62%` dark / `216 98% 46%` light
- Green (Mexico): `145 84% 44%` dark / `145 84% 30%` light

## Flag Sizing Convention
- Inline/small: `w-6 h-4 object-cover rounded-sm`
- Team sidebar following: `w-5 h-3.5 object-cover rounded-sm`
- Match card flags: `w-10 h-7 object-cover rounded-sm`
- Team grid cards: `w-16 h-11 object-cover rounded`
- Match detail hero: `w-16 md:w-24 h-10 md:h-16 object-cover rounded-md`
- `object-cover` is REQUIRED to fix the Swiss flag (square aspect ratio)

## Layout Notes
- Use `h-dvh` (not `h-screen`) for outer container — handles mobile browser chrome
- Add `overscroll-contain` to the scrollable content area
- Sheet/Drawer: built-in X removed from SheetContent — each drawer manages its own close button
- Bottom tab bar is `fixed bottom-0`, content has `pb-24` on mobile

## Branding
- Logo: "W" block in primary red, bold italic skew
- Header: "WORLD CUP 26" + "USA · Canada · Mexico" tagline
- Highlights page/nav/route: REMOVED entirely

**Why:** FIFA WC 2026 is co-hosted by USA, Canada, Mexico; tricolor red/blue/green reflects host nations. Red is dominant.
