---
name: a4-html-slide-generator
description: Create deterministic, print-ready A4 landscape HTML slide decks for PDF export or printing. Use when Codex needs to generate presentation slides, proposal decks, reports, handouts, or document-like slides as HTML with fixed A4 landscape pages, page-break tags, reusable page templates, strict layout limits, overflow validation, and browser/PDF rendering checks.
---

# A4 HTML Slide Generator

## Overview

Generate slide decks as constrained HTML pages optimized for A4 landscape PDF output and printing. Treat each slide as a fixed page component, not as free-form web layout.

## Required Workflow

1. Copy `assets/html-template/` into the output location.
2. Fill `deck-data.json` first, then let the template render pages from the data.
3. Use only the page templates listed in `references/page-patterns.md`.
4. Keep content within the limits in `references/layout-rules.md`.
5. Render and inspect the HTML in a browser viewport.
6. Run `scripts/validate-layout.js` against the HTML.
7. Export PDF with `scripts/render-pdf.js` or an equivalent Playwright PDF flow.
8. If validation fails, split content across pages or choose a lower-density template before reducing font sizes.

## Page Model

Use A4 landscape as the invariant page contract:

- Page size: `297mm x 210mm`
- Print setup: `@page { size: A4 landscape; margin: 0; }`
- Page wrapper: `.page`
- Page break: `.page { break-after: page; page-break-after: always; }`
- Overflow policy: pages must not rely on scroll, clipping, or browser shrink-to-fit.

Do not add arbitrary page sizes, free-form absolute positioning, nested cards, or viewport-scaled typography.

## Content Pipeline

Prefer this pipeline:

```text
user request -> deck outline -> deck-data.json -> fixed templates -> HTML -> layout validation -> PDF
```

Generate `deck-data.json` before editing layout CSS. The JSON schema is intentionally simple:

```json
{
  "meta": {
    "title": "Deck title",
    "subtitle": "Optional subtitle",
    "author": "Optional author"
  },
  "theme": {
    "accent": "#000000"
  },
  "slides": [
    {
      "template": "cover",
      "kicker": "Proposal",
      "title": "Deck title",
      "subtitle": "Short supporting line"
    }
  ]
}
```

## Resources

- Read `references/layout-rules.md` before creating or revising deck content.
- Read `references/page-patterns.md` when choosing slide templates.
- Read `references/print-pdf-rules.md` before PDF export or print-specific changes.
- Use `assets/html-template/` as the starting point for every generated deck.
- Use `scripts/validate-layout.js <html-file-or-url>` before final delivery.
- Use `scripts/render-pdf.js <html-file-or-url> <output.pdf>` for PDF output when Playwright is available.

## Quality Bar

Accept a deck only when:

- Every `.page` has the expected A4 landscape aspect and no scroll overflow.
- No visible content exceeds its assigned region.
- No repeated page content unintentionally overlaps.
- PDF output preserves backgrounds, colors, page size, and page breaks.
- The first page, body pages, and final page all use deliberate templates.

When a page is too dense, create another page. Do not hide overflow.
