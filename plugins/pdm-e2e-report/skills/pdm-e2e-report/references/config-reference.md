# ReportConfig reference

Every field of the object passed to `createReporter()`. Types live in
`assets/report-kit/types.ts`.

## Header

| Field | Default | Notes |
| --- | --- | --- |
| `title` | required | Report heading and `<title>`. |
| `subtitle` | required | One line under the heading. |
| `kindLabel` | `"E2E レポート"` | Pill on the right of the header. |
| `logoPath` | none | String or array of paths, relative to the Playwright `rootDir` or absolute. The **first existing** file is inlined as SVG. |
| `logoFallbackText` | `title` | Shown when no logo file resolves. |
| `locale` / `timeZone` | `ja-JP` / `Asia/Tokyo` | Used for the run timestamp. |
| `outputFile` | `pdm-report/index.html` | Relative to `rootDir`. Reporter options (`["./reporters/index.ts", { outputFile }]`) win over this. |

## Wiring

| Field | Default | Notes |
| --- | --- | --- |
| `projects.report` | `"journeys"` | Only this Playwright project is aggregated. |
| `projects.setup` | `"setup"` | Failures here surface as an "environment setup failed" section instead of polluting persona tabs. |
| `attachmentPrefix` | `"step"` | Must equal the `attachmentPrefix` given to `createStepScreenshots`. |
| `knownIssueAttachment` | `"known-issue"` | A test that attaches text under this name is rendered as 対象外 (out of scope) with that text as the reason, instead of failed. |

## Personas

`personas` is an ordered array; the order is the left column order.

```ts
{
  id: "sato",
  name: "佐藤 健太",
  headline: "月末に交通費をまとめて申請する営業担当",
  label: "申請者",                       // matrix column subtitle; defaults to headline
  badges: [{ label: "営業部: 一般", axis: "team" }],
  avatarSeed: "sato",                    // defaults to id
  alwaysVisible: true,                   // keep the tab even with zero results
  crossPersona: false,                   // true = a bundle of roles, not a person
}
```

- `axis` only drives badge styling; `"team"` and `"workspace"` have built-in colors.
- `alwaysVisible` is how you show that a persona is *planned but unverified* —
  pair it with `journeys[].plannedTitles`.
- `crossPersona: true` marks a tab that is not one human (e.g. "all four roles").
  Tests in it render an avatar strip of every role that operated.
- `defaultPersonaId` catches journeys with no explicit persona.

## Matrix

```ts
matrix: {
  personaIds: ["sato", "tanaka"],   // defaults to all personas
  subtitle: "操作・権限観点 × 2ペルソナ",
  description: "…",                  // paragraph above the table
  rows: [
    {
      id: "submit",
      label: "経費を申請できる",
      summary: "金額を入力して申請でき、結果が画面に残ること",
      titles: {
        sato: ["申請者が金額を入力して経費を申請できる"],
        tanaka: [],                    // deliberately blank -> 未実行
      },
    },
  ],
}
```

`titles` may also be a function `(personaId) => string[]`, which is the practical
form once several rows share one lookup table:

```ts
const BASIC_NAV: Record<string, string> = { sato: "…", tanaka: "…" };
titles: (personaId) => [BASIC_NAV[personaId]].filter(Boolean),
```

Cell resolution: any failure → 失敗, else any pass → 成功, else any skip → 対象外,
else 未実行. Multiple matches show `成功 2/3`. Clicking a cell jumps to the test.

## Journeys

Keyed by spec basename without `.spec.ts` (`journeys/applicant-day.spec.ts` →
`"applicant-day"`).

```ts
"applicant-day": {
  title: "申請者の1日",
  summary: "経費を入力して申請するまで",
  context: ["前提: 承認ルートは 1 段"],       // rendered as a note block
  persona: "sato",
  plannedTitles: ["申請者が金額を入力して経費を申請できる"],
  evidence: { "申請者が金額を入力して経費を申請できる": ["入力した金額がそのまま申請結果に反映されること"] },
}
```

For a spec that walks several people through the same flow, replace `persona`
with `personaByTitle`:

```ts
personaByTitle: {
  "佐藤さんが打刻できる": "sato",
  "田中さんが打刻できる": "tanaka",
}
```

That spec then appears under every persona it mentions, and each test lands in
the right tab. This is the mechanism that used to be a hard-coded special case.

## Roles

`roles` maps the role key recorded by `createStepScreenshots` (derived from the
storageState path) to a display label and, optionally, a persona:

```ts
roles: { applicant: { label: "申請者", personaId: "sato" } }
```

Used for the `［申請者］` prefix on captions in multi-role tests and for avatar
lookup in `crossPersona` tabs.

## Hooks

```ts
caption: (ctx) => ctx.text.startsWith("確認:") ? ctx.text.replace(/^確認:\s*/, "") : null,
titleBadge: (title) => {
  const hit = title.match(/^(TC-[0-9.]+):\s*(.*)$/);
  return hit === null ? null : { badge: hit[1], rest: hit[2] };
},
```

- `caption` receives `{ journeyKey, testTitle, role, step, text }` and rewrites a
  step caption. Return `null` to keep the raw label. This is where you turn
  `"ページ移動: /team"` into `"チーム画面で他メンバーの稼働が見えること"`.
- `titleBadge` splits an id prefix out of the test title into a badge chip.

## Step screenshots

```ts
createStepScreenshots({
  projectName: "journeys",
  attachmentPrefix: "step",
  roleByStorageState: { "playwright/.auth/applicant.json": "applicant" },
  shouldCapture: (info) => path.basename(info.file).startsWith("uj"),
  fullPage: ({ role, label }) => role === "newOwner" && label === "ページ移動: /",
  quality: 60,
  actionLabels: { click: (t) => `タップ: ${t}` },
});
```

`capturePoint(info, page, label, locator, note)` adds an explicit checkpoint shot
whose caption carries `note` — use it where the automatic label would not explain
what the reader should look at.
