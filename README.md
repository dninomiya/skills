# dninomiya Skills

Codex plugin repository for personal skills.

## Plugins

### evidence-record

Records instructed browser operations as evidence videos with step titles, cursor movement, and click highlights. Outputs scripts and videos under `~/Downloads/evidence-record-<timestamp>/` to avoid accidental commits.

### a4-html-slide-generator

Creates deterministic A4 landscape HTML slide decks optimized for PDF export and printing. Decks are generated from `deck-data.json` into fixed page templates, then validated for page size and overflow before PDF output.

### persona-e2e-report

Turns a Playwright E2E suite into a single-file status report that non-engineers can read: a persona × capability matrix, per-step screenshots of every operation, and failures kept visible. Product-specific knowledge lives in one config object, so the same engine serves any project.

## Repository Layout

```text
.
├── .agents/plugins/marketplace.json
└── plugins/
    ├── evidence-record/
    │   ├── .codex-plugin/plugin.json
    │   └── skills/evidence-record/
    ├── a4-html-slide-generator/
    │   ├── .codex-plugin/plugin.json
    │   └── skills/a4-html-slide-generator/
    └── persona-e2e-report/
        ├── .codex-plugin/plugin.json
        └── skills/persona-e2e-report/
```

## Install Marketplace

Add this repository marketplace to Codex:

```bash
codex plugin marketplace add .
```

Then install either plugin from the Codex plugin UI.

## Direct Skill Usage

Each plugin contains a standard skill directory under `skills/`.

- `plugins/evidence-record/skills/evidence-record`
- `plugins/a4-html-slide-generator/skills/a4-html-slide-generator`
- `plugins/persona-e2e-report/skills/persona-e2e-report`

## License

MIT
