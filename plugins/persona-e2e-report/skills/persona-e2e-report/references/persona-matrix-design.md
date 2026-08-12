# Designing personas and matrix rows

The engine renders whatever it is given. Whether the report is useful is decided
here, before any code. These rules come from running this format on a real
multi-role SaaS suite.

## Personas are people, not roles

A role is `team_owner`. A persona is "森田さん — プロダクト開発チームではチーム
オーナー、デザインチームではメンバーのテックリード".

Use people because the interesting bugs live in the overlap. A permission matrix
keyed on roles cannot express "the same human sees different things depending on
which team is selected", which is exactly where role-scoped UIs break. If two
personas would have identical rows in every column, they are one persona.

Practical set for a role-based product:

- one persona per pure role (owner / manager / member / restricted)
- one persona per meaningful *combination* actually possible in the data model
- one persona per lifecycle state that renders a different UI (invited but not
  joined, joined but no team, brand-new empty workspace)

The lifecycle ones are the most often forgotten and the most often broken.

## Rows are capabilities in the reader's words

Write the row label as something a PM would say out loud:

- good: 「他人の作業履歴を代理で登録できる」
- bad: 「POST /work-logs with memberId != self returns 200」

`summary` carries the condition that makes it a real check ("承認権限を持つ人だけ
が実行でき、持たない人には導線自体が出ないこと"). If you cannot write that
sentence, the row is not a capability — it is an implementation detail, and it
belongs in a unit test instead.

## Blank cells are content

A blank (未実行) cell says "nobody has verified this for this person". That is
information, and it is the main reason to build the matrix at all. Do not fill
blanks with unrelated tests to make the grid look complete.

Two distinct kinds of "not green":

- **未実行** — no test claims this cell. Coverage gap.
- **対象外** — a test exists but is deliberately parked (known bug, unimplemented
  feature). Use the known-issue attachment so the reason is visible in the report.

Conflating them hides work.

## Titles are the contract

Cells resolve by exact test title match. Two consequences:

1. Test titles must be stable, human-readable sentences. Rename them in the same
   commit as the config, never separately.
2. Keep titles and config in sync via shared constants when the suite is large —
   a typo silently degrades to 未実行, which reads as a coverage gap that is not
   real. Prefer that failure mode over a false green, but do not rely on it.

## Journeys tell a story

One spec = one day in one persona's life, in the order they would actually work:
open the app, look at their dashboard, do their main task, hit their boundary.
The report renders each journey as a section with its tests in order, so a spec
written as a narrative reads as a narrative.

Avoid specs organized by screen ("all tests for /settings"). They produce tabs
that no persona recognizes as their own experience.

## Screenshots carry the argument

The per-step gallery is what makes the report trustworthy to non-engineers: they
can see the app in the state the assertion describes. Two habits keep it useful:

- Put the *check* last in a test, so the final screenshots show the state being
  asserted.
- Use the `caption` hook for flows where raw labels are too mechanical, and
  `capturePoint()` where the reader needs to be told what to look at.

A gallery of twelve near-identical screenshots is worse than four meaningful
ones. If a test produces noise, split it.
