# Print And PDF Rules

## Browser Setup

Use Chromium or Chrome through Playwright when possible. Export with:

- `format: "A4"`
- `landscape: true`
- `printBackground: true`
- `preferCSSPageSize: true`
- zero margins

## CSS Requirements

The generated deck must include:

```css
@page {
  size: A4 landscape;
  margin: 0;
}

.page {
  width: 297mm;
  height: 210mm;
  break-after: page;
  page-break-after: always;
}
```

Print-specific CSS must preserve background colors:

```css
* {
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
```

## Verification

Before final delivery:

1. Open the HTML in a browser.
2. Confirm all pages render, including the closing page.
3. Run layout validation.
4. Export the PDF.
5. Reopen the PDF or render a screenshot if the environment supports it.

If PDF pages are clipped, first verify CSS page size and Playwright PDF options. Do not change the A4 page dimensions.
