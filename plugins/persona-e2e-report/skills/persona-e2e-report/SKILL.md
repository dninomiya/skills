---
name: persona-e2e-report
description: Turn a Playwright E2E suite into a single-file, non-engineer readable status report organized by persona. Use when Codex needs to give product managers, designers, or QA a shareable view of what each user type can actually do — a persona × capability status matrix, per-step screenshots of every operation, and failures kept visible instead of hidden in CI logs.
---

# Persona E2E Report

## Overview

Add a reporting layer on top of an existing Playwright suite. The output is one
self-contained HTML file that answers "which user can do what, right now" — not
"which assertions passed".

Two parts:

- **`createReporter(config)`** — a Playwright reporter that aggregates results by
  persona and writes the HTML.
- **`createStepScreenshots(config)`** — a fixture helper that patches Page/Locator
  so every `goto` / `click` / `fill` leaves a captioned screenshot. Specs need no
  changes.

Everything product-specific (who the personas are, which capabilities matter,
which spec tells which story) lives in a config object. The kit itself holds no
domain knowledge.

## Required Workflow

1. Copy `assets/report-kit/` into the E2E package (e.g. `reporters/report-kit/`).
2. Write `reporters/report.config.ts` — start from `assets/example/reporters/report.config.ts`.
3. Add `reporters/index.ts` that exports `createReporter(reportConfig)` as default.
4. Register it in `playwright.config.ts`: `reporter: [["list"], ["./reporters/index.ts"]]`.
5. Wire `createStepScreenshots` into an auto fixture (see `assets/example/fixtures/`).
6. Run the suite, open the generated HTML, and check the matrix reads correctly.
7. Iterate on `matrix.rows` until every cell is either a real result or a deliberate blank.

Read `references/config-reference.md` while writing the config, and
`references/persona-matrix-design.md` before deciding what the personas and rows
should be — that decision determines whether the report is useful.

## Model

```text
spec file            = one journey  = "a day in the life of <persona>"
test title           = one capability check
persona              = one tab in the left column
matrix row           = one capability, resolved per persona
```

The matrix is the product: rows are capabilities in the reader's language
("can submit an expense"), columns are people, and each cell resolves to the
status of named tests. Cells are matched **by exact test title**, so titles are
the contract between spec and config. A cell with no matching titles renders as
"未実行" (not run) rather than silently passing.

## Wiring

`reporters/index.ts`:

```ts
import { createReporter } from "./report-kit";
import { reportConfig } from "./report.config";

export default createReporter(reportConfig);
```

Fixture (auto, so specs stay untouched):

```ts
export const steps = createStepScreenshots({
  projectName: "journeys",
  attachmentPrefix: "step",
  roleByStorageState: { [STORAGE_STATE.applicant]: "applicant" },
});

// in test.extend
autoSteps: [async ({ browser }, use, testInfo) => {
  await steps.install(browser);
  steps.setCurrentTest(testInfo);
  await use();
  steps.setCurrentTest(null);
}, { auto: true }],
```

`attachmentPrefix` must match on both sides, and the reporter only reads the
project named by `projects.report` (default `"journeys"`).

## Constraints

- Step screenshots are JPEG (quality 60) and embedded as base64. A suite of ~70
  tests lands around 25 MB — acceptable for a single shareable file. Do not switch
  to PNG.
- Avatars are fetched from dicebear at report time and inlined as data URIs. Set
  `avatar.enabled: false` for offline or air-gapped runs.
- The reporter never fails a run. A broken config shows up as empty cells, not as
  an exception — so verify the rendered HTML, not just the exit code.
- Keep failures in the report. Red cells are the point; do not filter them out to
  make the report look clean.

## Resources

- `assets/report-kit/` — the engine. Copy as-is; edit only the config.
- `assets/example/` — a runnable expense-approval setup: config, fixtures, two
  specs, playwright config, a static demo app under `app/`, and dummy
  storageState files under `.auth/`. Copy the directory, drop `report-kit/` into
  `reporters/`, and `playwright test` produces a report with no other setup.
  Its imports assume `report-kit/` sits next to the config.
- `references/config-reference.md` — every `ReportConfig` field.
- `references/persona-matrix-design.md` — how to choose personas and rows.

## Quality Bar

Accept the report only when:

- Every persona tab shows either results or an explicit "not run" list.
- Every matrix cell is explainable: green/red because a named test ran, blank
  because that capability genuinely does not apply to that persona.
- Step captions read as product behavior, not as selectors. Use the `caption`
  hook when raw labels ("クリック: 「保存」ボタン") are too mechanical.
- The file opens correctly after being copied elsewhere — no external assets
  beyond the avatar fallback.
