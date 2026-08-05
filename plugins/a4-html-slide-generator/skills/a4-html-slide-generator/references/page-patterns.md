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

Best for thank-you pages, decision requests, and final calls to action.
