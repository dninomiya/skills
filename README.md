# dninomiya Skills

Personal skills repository. It holds two things:

- **`registry/`** — a shadcn-compatible registry of website assets (blocks, primitives, tokens), served and showcased by a Next.js app at the repository root.
- **`plugins/`** — Codex/Claude Code plugins.

---

## Website Registry

A registry of marketing-site assets built so that any page assembled from them
is consistent by construction: one spacing scale, one type scale, one set of
tokens. Install items with the shadcn CLI; the source lands in the consuming
repository and stays editable.

Copy, UI, and typography are Japanese-first: Noto Sans JP as the base family,
`palt` and `word-break: auto-phrase` on headings, and a 1.8 line-height for
body copy.

### What is in it

| Group      | Items                                                                                                                                                                                                            |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Theme      | `website-theme`                                                                                                                                                                                                  |
| Primitives | `container`, `section`, `placeholder`                                                                                                                                                                            |
| Blocks     | `site-header`, `hero-centered`, `hero-split`, `logo-cloud`, `feature-grid`, `feature-alternating`, `stats-band`, `testimonial-grid`, `pricing-tiers`, `faq-accordion`, `cta-band`, `contact-form`, `site-footer` |
| Pages      | `landing-page` (installs at `app/(marketing)/landing/page.tsx`)                                                                                                                                                  |

### Showcase

```bash
pnpm install
pnpm dev
```

| Route            | Purpose                                                             |
| ---------------- | ------------------------------------------------------------------- |
| `/`              | Overview, install instructions, every item as a card                |
| `/blocks`        | Every item previewed in an isolated frame — resize and switch theme |
| `/blocks/[name]` | Preview, source, and the built registry item for one asset          |
| `/tokens`        | Color tokens and the layout rules every block follows               |
| `/view/[name]`   | Bare preview route used by the iframes                              |

### Consuming the registry

Point a project at the deployed registry once:

```jsonc
// components.json
{
  "registries": {
    "@website": {
      "url": "https://<your-deployment>/r/{name}.json",
    },
  },
}
```

```bash
npx shadcn@latest add @website/landing-page
```

The theme item carries the Japanese font stack. Load Noto Sans JP with
`next/font` in the consuming app so `--font-sans` resolves:

```tsx
import { Noto_Sans_JP } from "next/font/google"

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  display: "swap",
  preload: false, // Japanese glyph files are large
})
```

Or skip the config and pass the URL directly:

```bash
npx shadcn@latest add https://<your-deployment>/r/hero-centered.json
```

Import paths are rewritten by the CLI to the consuming project's aliases:

| Source                                    | Installed as                                |
| ----------------------------------------- | ------------------------------------------- |
| `@/registry/website/ui/section`           | `<aliases.ui>/section`                      |
| `@/registry/website/blocks/<name>/<name>` | `<aliases.components>/blocks/<name>/<name>` |

`landing-page` lands on the `/landing` route rather than the root page, so it
never silently collides with an existing `app/page.tsx`. Move it once the
composition is the one you want.

### Distribution

`pnpm registry:build` writes `registry.json` from `registry/index.ts`, then runs
`shadcn build` to emit one JSON file per item into `public/r/`. Both are
committed so the registry is servable as static files.

Cross-item `registryDependencies` are absolute URLs derived from
`NEXT_PUBLIC_REGISTRY_URL` (default `http://localhost:3000`). Set it before
building for a deployment:

```bash
NEXT_PUBLIC_REGISTRY_URL=https://registry.example.com pnpm registry:build
```

### Adding an asset

1. Write the component under `registry/website/blocks/<name>/<name>.tsx`
   (or `registry/website/ui/<name>.tsx` for a primitive). Import shared pieces
   through `@/registry/website/...` so the CLI can rewrite them.
2. Register it in `registry/index.ts` — name, title, description, dependencies,
   and the `meta` block the showcase uses for previews.
3. Register a preview element in `lib/previews.tsx`.
4. Run `pnpm registry:build`.

### House rules the assets follow

- Sections never set their own vertical padding — `Section` owns the rhythm
  (`sm` / `md` / `lg`).
- Widths come from `Container` (`sm` … `xl`); gutters are always
  `px-4 sm:px-6 lg:px-8`.
- No hard-coded colors. Everything reads from the token layer, so light and
  dark stay in contrast.
- Content lives in a plain array at the top of each block file, so copy can be
  swapped without touching layout.
- Base UI buttons rendered as links need `nativeButton={false}` alongside
  `render={<Link … />}`.
- Japanese typography is owned by `Section`: headings get `palt`,
  `word-break: auto-phrase`, and looser tracking than the Latin default; body
  copy runs at `leading-[1.8]`.
- `--font-sans` resolves to Noto Sans JP with literal family names — never
  `var(--font-…)` inside `@theme inline`, which resolves at parse time.

### Scripts

| Command               | Description                                      |
| --------------------- | ------------------------------------------------ |
| `pnpm dev`            | Run the showcase                                 |
| `pnpm build`          | Build the registry, then the app                 |
| `pnpm registry:build` | Regenerate `registry.json` and `public/r/*.json` |
| `pnpm typecheck`      | `tsc --noEmit`                                   |
| `pnpm lint`           | ESLint                                           |
| `pnpm format`         | Prettier (includes Tailwind class sorting)       |

---

## Plugins

### evidence-record

Records instructed browser operations as evidence videos with step titles, cursor movement, and click highlights. Outputs scripts and videos under `~/Downloads/evidence-record-<timestamp>/` to avoid accidental commits.

### a4-html-slide-generator

Creates deterministic A4 landscape HTML slide decks optimized for PDF export and printing. Decks are generated from `deck-data.json` into fixed page templates, then validated for page size and overflow before PDF output.

### persona-e2e-report

Turns a Playwright E2E suite into a single-file status report that non-engineers can read: a persona × capability matrix, per-step screenshots of every operation, and failures kept visible. Product-specific knowledge lives in one config object, so the same engine serves any project.

### Install Marketplace

```bash
codex plugin marketplace add .
```

### Direct Skill Usage

- `plugins/evidence-record/skills/evidence-record`
- `plugins/a4-html-slide-generator/skills/a4-html-slide-generator`
- `plugins/persona-e2e-report/skills/persona-e2e-report`

## Repository Layout

```text
.
├── app/                     # Showcase (Next.js App Router)
│   ├── (site)/              # Overview, blocks, tokens
│   └── (preview)/view/      # Bare preview routes for iframes
├── components/
│   ├── showcase/            # Showcase-only UI
│   └── ui/                  # shadcn base components
├── registry/
│   ├── index.ts             # Single source of truth for the registry
│   ├── schema.ts            # Registry typings
│   └── website/             # The distributed assets
├── public/r/                # Built registry items (generated)
├── scripts/build-registry.ts
├── .agents/plugins/marketplace.json
└── plugins/
```

## License

MIT
