---
name: frontend-design
description: Design-quality-focused frontend work in this Nuxt 4 + Vue project — landing pages, marketing pages, visual redesigns, and any UI where aesthetics is the main goal. Avoids generic AI aesthetics. For standard admin/CRUD screens built from components, use the nuxt-ui skill instead; for compliance audits of existing UI, use web-design-guidelines.
license: Complete terms in LICENSE.txt
---

# frontend-design — anti-slop design for rental-system

Distinctive, production-grade frontend design. This project is **Nuxt 4 + Vue 3 + @nuxt/ui v4 + Tailwind CSS** — all guidance below assumes that stack. Never introduce React, Next.js, shadcn/ui, or `motion/react` here.

## 1. Design Read (before any code)

Infer what the user actually wants before touching code:

1. **Page kind** — landing / marketing, redesign (preserve vs overhaul), editorial, product UI.
2. **Vibe words** they used — "minimal", "premium", "playful", "trust-first", "Linear-style", etc.
3. **References** — URLs, screenshots, competitor brands.
4. **Audience** — who is this for? The audience picks the aesthetic, not your taste.
5. **Existing brand assets** — for redesigns, current logo/colors/type are starting material, not optional input. Audit the existing page before touching it.

State a one-line design read before generating: *"Reading this as: 〈page kind〉 for 〈audience〉, with a 〈vibe〉 language."* If the read genuinely diverges, ask exactly **one** clarifying question — never a multi-question dump. If you can infer confidently, don't ask.

## 2. Anti-default discipline

Never default to the LLM house style: AI-purple gradients, centered hero over dark mesh, three equal feature cards, glassmorphism on everything, Inter/Roboto/Arial + slate-900, cookie-cutter layouts, em-dash-riddled copy, "Jane Doe" placeholder content. Reach past these deliberately based on the design read. No design should be the same across generations — vary theme, fonts, and aesthetic direction.

## 3. Craft guidelines

- **Typography**: distinctive display font paired with a refined body font. Self-host via `@font-face` with `font-display: swap` (or `@nuxt/fonts`); no Google Fonts `<link>` in production.
- **Color & theme**: commit to a cohesive direction. Dominant colors with sharp accents beat timid, evenly-distributed palettes. Wire custom colors through @nuxt/ui semantic tokens (`app.config.ts` → `ui.colors`) so components follow the brand — see the nuxt-ui skill's theming reference.
- **Motion**: prioritize CSS-only (transitions, `animation-delay` staggers, scroll-driven animations). For physics/orchestration use the Vue Motion library (`motion-v`). One well-orchestrated page-load reveal beats scattered micro-interactions. Never track continuous input (scroll/pointer) in `ref()` state — use CSS or motion values.
- **Spatial composition**: asymmetry, overlap, grid-breaking elements, generous negative space OR controlled density — chosen intentionally, not by default.
- **Backgrounds & detail**: atmosphere over flat fills — gradients, noise, patterns, layered transparencies — matched to the aesthetic, not stacked indiscriminately.
- **Icons**: one family per project, consistent stroke width. This project uses Iconify via @nuxt/ui (`i-lucide-*` is the existing default here — stay consistent with it). Never hand-roll SVG icon paths.

## 4. Guardrails (mandatory)

- `prefers-reduced-motion`: all non-essential animation must respect it.
- Dark/light: pick the page's mode deliberately and keep it consistent; if the surrounding app supports both, test both before finishing.
- Real content only: no lorem ipsum, no "John Doe", no fake logos of real companies.
- Accessibility floor: semantic HTML, visible focus states, WCAG AA contrast. Trust-first or regulated audiences override aesthetic preference.
- Performance: avoid DOM bloat and unbounded `z-index`; animate `transform`/`opacity`, not layout properties.

## 5. Pre-flight check

Before declaring done: design read honored? No anti-default violations? Fonts loaded correctly? Motion respects reduced-motion? Both color modes checked (if applicable)? Works at mobile width without horizontal scroll?

Match implementation complexity to the vision: maximalist directions need elaborate execution; minimal directions need restraint and precision in spacing and type. Elegance comes from executing the chosen direction well.
