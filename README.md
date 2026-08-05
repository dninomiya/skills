# dninomiya Skills

Codex plugin repository for personal skills.

## Plugins

### evidence-record

Records instructed browser operations as evidence videos with step titles, cursor movement, and click highlights. Outputs scripts and videos under `~/Downloads/evidence-record-<timestamp>/` to avoid accidental commits.

### a4-html-slide-generator

Creates deterministic A4 landscape HTML slide decks optimized for PDF export and printing. Decks are generated from `deck-data.json` into fixed page templates, then validated for page size and overflow before PDF output.

## Repository Layout

```text
.
├── .agents/plugins/marketplace.json
└── plugins/
    ├── evidence-record/
    │   ├── .codex-plugin/plugin.json
    │   └── skills/evidence-record/
    └── a4-html-slide-generator/
        ├── .codex-plugin/plugin.json
        └── skills/a4-html-slide-generator/
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

## License

MIT
