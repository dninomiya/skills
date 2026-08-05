# Page Patterns

Use only these templates unless the task clearly requires adding a new reusable pattern.

## `cover`

Use for the first page. Fields:

- `kicker`
- `logo`
- `logoAlt`
- `title`
- `subtitle`
- `meta`

Best for deck title, proposal title, report title, or workshop opening.
Use `logo` for a local image path such as `./header-logo.svg`. Keep logo assets bundled with the deck so PDF export does not depend on external network access.

## `toc`

Use for table of contents pages, usually immediately after the cover. Fields:

- `title`
- `logo`
- `logoAlt`
- `items[].number`
- `items[].label`
- `copyright`

Best for company profiles, proposal decks, and multi-section reports.
Keep to 8 items or fewer. Use two-digit numbers such as `01`, `02`, and keep labels short.

## `section`

Use for major dividers. Fields:

- `label`
- `title`
- `subtitle`

Best for chapter breaks or changes in topic.

## `statement`

Use for one clear message. Fields:

- `kicker`
- `title`
- `body`

Best for an executive summary, thesis, recommendation, or key finding.

## `bullets`

Use for a short list. Fields:

- `title`
- `intro`
- `bullets`

Best for requirements, risks, principles, benefits, or next steps.

## `two-column`

Use for balanced contrast. Fields:

- `title`
- `left.heading`
- `left.bullets`
- `right.heading`
- `right.bullets`

Best for before/after, problem/solution, current/future, or pros/cons.

## `comparison`

Use for compact tabular comparison. Fields:

- `title`
- `columns`
- `rows`

Best for options, vendors, approaches, or capability comparisons. Use short phrases, not paragraphs.

## `competitor-comparison`

Use for comparing one highlighted company/product against competitors. Fields:

- `title`
- `intro`
- `companies[].name`
- `companies[].label`
- `companies[].highlight`
- `criteria[].name`
- `criteria[].values`

Best for competitor comparison, vendor positioning, service differentiation, or sales proposal decks. Keep to 4 companies and 4 criteria. Set exactly one company with `highlight: true` when emphasizing the user's company.

## `metrics`

Use for numeric emphasis. Fields:

- `title`
- `metrics[].value`
- `metrics[].label`
- `metrics[].note`

Best for KPI pages, outcomes, projections, or operating snapshots.

## `timeline`

Use for sequence. Fields:

- `title`
- `events[].label`
- `events[].title`
- `events[].body`

Best for rollout plans, milestones, phases, or history.

## `closing`

Use for final page. Fields:

- `title`
- `note`
- `contact`
- `qr`
- `qrLabel`

Best for thank-you pages, decision requests, and final calls to action.
Use `qr` for a local QR image path such as `./deer-qr.png`. Keep QR assets bundled with the deck so PDF export does not depend on external network access.
When `qr` is present, keep the final page split into two equal columns: text on the left, QR on the right.
