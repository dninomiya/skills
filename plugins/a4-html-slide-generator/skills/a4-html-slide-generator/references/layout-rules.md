# Layout Rules

Use these rules before writing deck content or changing CSS.

## Hard Constraints

- Keep the page size at `297mm x 210mm`.
- Use `box-sizing: border-box` globally.
- Use fixed page padding from the template; do not override per slide.
- Use `overflow: hidden` only as a guard, never as the way content fits.
- Use `rem`, `px`, or `mm`; do not scale font size with viewport width.
- Keep letter spacing at `0` unless a specific brand asset requires otherwise.
- Avoid decorative gradients, floating cards, nested cards, and background blobs.
- Use black as the only intentional color for text, rules, emphasis, and accents.

## Content Limits

Use these default maximums unless the user explicitly asks for a denser document:

| Template | Title | Body |
| --- | --- | --- |
| `cover` | 56 characters | subtitle up to 90 characters |
| `toc` | 12 characters | up to 8 items, 18 characters each |
| `section` | 64 characters | label up to 32 characters |
| `statement` | 90 characters | support up to 180 characters |
| `bullets` | 64 characters | up to 5 bullets, 68 characters each |
| `two-column` | 64 characters | 2 columns, up to 4 bullets per column |
| `comparison` | 56 characters | up to 4 rows x 3 columns |
| `competitor-comparison` | 56 characters | up to 4 companies x 4 criteria |
| `metrics` | 56 characters | up to 4 metrics |
| `timeline` | 56 characters | up to 5 events |
| `closing` | 56 characters | note up to 120 characters |

## Fitting Strategy

Apply fitting in this order:

1. Shorten verbose text.
2. Split content into multiple pages.
3. Choose a lower-density template.
4. Reduce nonessential labels.
5. Reduce font size only within the template's existing CSS scale.

Never solve overflow by changing page size, shrinking the whole page, hiding content, or relying on print scaling.

## Typography

- Use one sans-serif stack for the whole deck.
- Keep body line height between `1.25` and `1.45`.
- Keep headings compact but readable.
- Avoid all-caps paragraphs.
- Use tabular figures for metrics.

## Visual Rhythm

- Anchor pages on a consistent grid.
- Prefer generous negative space over dense decoration.
- Make the page title easy to scan from the top-left or center, depending on the template.
- Keep repeated elements such as footers, page numbers, and section labels in stable positions.
