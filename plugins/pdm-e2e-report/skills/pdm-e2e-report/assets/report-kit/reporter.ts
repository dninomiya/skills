import { Buffer } from "node:buffer";
import fs from "node:fs";
import path from "node:path";
import type {
  FullConfig,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";
import type {
  MatrixRow,
  Persona,
  PersonaBadge,
  ReportConfig,
  ReporterOptions,
} from "./types";

/**
 * ペルソナ別 E2E レポーター。
 *
 * spec（ジャーニー）単位で結果をまとめ、スクリーンショットを base64 で埋め込んだ
 * 単一 HTML を書き出す。1 ファイル完結なので、そのまま Slack やメールで共有でき、
 * 開くだけで結果と手順スクショを確認できる。
 *
 * 手順スクショは step-screenshots.ts が操作ごとに撮る。最終画面は Playwright の
 * `use.screenshot` 設定に従う（`only-on-failure` 推奨）。
 *
 * プロダクト固有の知識（ペルソナ・観点・ジャーニー）はすべて ReportConfig 側にあり、
 * このファイルは集計と描画だけを持つ。
 */

/** ペルソナ id。設定側の文字列をそのまま使う。 */
type GroupId = string;

type Verdict = "passed" | "failed" | "skipped";

type Screenshot = {
  /** 手順スクショなら 1 始まりの連番、最終画面なら null */
  step: number | null;
  /** 操作したロール（storageState から判定。不明なら空） */
  role: string;
  text: string;
  dataUri: string;
};

type TestEntry = {
  journeyKey: string;
  title: string;
  /** タイトル先頭から切り出したバッジ表示 */
  badge: string | null;
  verdict: Verdict;
  durationMs: number;
  error: string | null;
  skipReason: string | null;
  /** 操作に使ったロール（出現順・重複なし） */
  roles: string[];
  screenshots: Screenshot[];
};

type ResolvedPersona = {
  readonly id: string;
  readonly name: string;
  readonly headline: string;
  readonly label: string;
  readonly badges: readonly PersonaBadge[];
  readonly avatarSeed: string;
  readonly alwaysVisible?: boolean;
  readonly crossPersona?: boolean;
};

type ResolvedConfig = {
  readonly title: string;
  readonly subtitle: string;
  readonly kindLabel: string;
  readonly outputFile: string;
  readonly locale: string;
  readonly timeZone: string;
  readonly logoPaths: readonly string[];
  readonly logoFallbackText: string;
  readonly projects: { readonly report: string; readonly setup: string };
  readonly attachmentPrefix: string;
  readonly knownIssueAttachment: string;
  readonly personas: readonly ResolvedPersona[];
  readonly personaById: ReadonlyMap<string, ResolvedPersona>;
  readonly personaOrder: readonly string[];
  readonly defaultPersonaId: string;
  readonly matrixPersonaIds: readonly string[];
  readonly matrixRows: readonly MatrixRow[];
  readonly matrixSubtitle: string;
  readonly matrixDescription: string;
  readonly journeys: ReportConfig["journeys"];
  readonly roles: NonNullable<ReportConfig["roles"]>;
  readonly avatarEnabled: boolean;
  readonly avatarStyle: string;
  readonly caption: ReportConfig["caption"];
  readonly titleBadge: ReportConfig["titleBadge"];
};

const ANSI_RE = /\u001b\[[0-9;]*m/g;

function resolvePersona(persona: Persona): ResolvedPersona {
  return {
    id: persona.id,
    name: persona.name,
    headline: persona.headline,
    label: persona.label ?? persona.headline,
    badges: persona.badges ?? [],
    avatarSeed: persona.avatarSeed ?? persona.id,
    alwaysVisible: persona.alwaysVisible,
    crossPersona: persona.crossPersona,
  };
}

function resolveConfig(config: ReportConfig): ResolvedConfig {
  const personas = config.personas.map(resolvePersona);
  const logoPaths =
    config.logoPath === undefined
      ? []
      : typeof config.logoPath === "string"
        ? [config.logoPath]
        : [...config.logoPath];
  return {
    title: config.title,
    subtitle: config.subtitle,
    kindLabel: config.kindLabel ?? "E2E レポート",
    outputFile: config.outputFile ?? "pdm-report/index.html",
    locale: config.locale ?? "ja-JP",
    timeZone: config.timeZone ?? "Asia/Tokyo",
    logoPaths,
    logoFallbackText: config.logoFallbackText ?? config.title,
    projects: {
      report: config.projects?.report ?? "journeys",
      setup: config.projects?.setup ?? "setup",
    },
    attachmentPrefix: config.attachmentPrefix ?? "step",
    knownIssueAttachment: config.knownIssueAttachment ?? "known-issue",
    personas,
    personaById: new Map(personas.map((persona) => [persona.id, persona])),
    personaOrder: personas.map((persona) => persona.id),
    defaultPersonaId: config.defaultPersonaId,
    matrixPersonaIds:
      config.matrix?.personaIds ?? personas.map((persona) => persona.id),
    matrixRows: config.matrix?.rows ?? [],
    matrixSubtitle:
      config.matrix?.subtitle ??
      `操作・権限観点 × ${config.matrix?.personaIds?.length ?? personas.length}ペルソナ`,
    matrixDescription:
      config.matrix?.description ??
      "細かな操作・権限観点ごとに、既存 E2E で確認できている状態を一覧します。",
    journeys: config.journeys,
    roles: config.roles ?? {},
    avatarEnabled: config.avatar?.enabled ?? true,
    avatarStyle: config.avatar?.style ?? "open-peeps",
    caption: config.caption,
    titleBadge: config.titleBadge,
  };
}

class ReportKitReporter implements Reporter {
  private readonly config: ResolvedConfig;
  private outputFile: string;
  private configDir = "";
  private baseUrl = "";
  private startedAt = new Date();
  private entries: TestEntry[] = [];
  private setupFailures: string[] = [];

  constructor(config: ResolvedConfig, options: ReporterOptions = {}) {
    this.config = config;
    this.outputFile = options.outputFile ?? config.outputFile;
  }

  printsToStdio(): boolean {
    return false;
  }

  onBegin(config: FullConfig, _suite: Suite): void {
    this.configDir = config.rootDir;
    this.startedAt = new Date();
    const target = config.projects.find(
      (p) => p.name === this.config.projects.report,
    );
    this.baseUrl = target?.use?.baseURL ?? "";
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const project = test.parent.project()?.name ?? "";

    if (project === this.config.projects.setup) {
      if (result.status === "failed" || result.status === "timedOut") {
        this.setupFailures.push(
          `${test.title}: ${cleanError(result.error?.message)}`,
        );
      }
      return;
    }
    if (project !== this.config.projects.report) {
      return;
    }

    const knownIssueReason = textAttachment(
      result,
      this.config.knownIssueAttachment,
    );
    const isKnownIssue = knownIssueReason !== null;
    const isExpectedFailure =
      test.expectedStatus === "failed" &&
      (result.status === "failed" || result.status === "timedOut");
    const outcome = test.outcome();
    const verdict: Verdict =
      isKnownIssue || isExpectedFailure || outcome === "skipped"
        ? "skipped"
        : outcome === "unexpected"
          ? "failed"
          : "passed";

    const { badge, rest } = this.splitBadge(test.title);

    // 手順スクショ（step-screenshots.ts が `<prefix>:<role>:<label>` 名で
    // body 添付）と、screenshot:"on" の最終画面（path 添付）の両方を拾う
    const screenshots: Screenshot[] = [];
    let stepNo = 0;
    for (const a of result.attachments) {
      if (a.name.startsWith(`${this.config.attachmentPrefix}-meta:`)) {
        continue;
      }
      if (!a.contentType.startsWith("image/")) {
        continue;
      }
      const buf =
        a.body ??
        (a.path && fs.existsSync(a.path) ? fs.readFileSync(a.path) : null);
      if (!buf) {
        continue;
      }
      const dataUri = `data:${a.contentType};base64,${buf.toString("base64")}`;
      if (a.name.startsWith(`${this.config.attachmentPrefix}:`)) {
        const rest2 = a.name.slice(this.config.attachmentPrefix.length + 1);
        const sep = rest2.indexOf(":");
        stepNo += 1;
        screenshots.push({
          step: stepNo,
          role: sep >= 0 ? rest2.slice(0, sep) : "",
          text: sep >= 0 ? rest2.slice(sep + 1) : rest2,
          dataUri,
        });
      } else {
        screenshots.push({
          step: null,
          role: "",
          text: "最終画面（テスト終了時）",
          dataUri,
        });
      }
    }
    const roles = [...new Set(screenshots.map((s) => s.role).filter(Boolean))];

    const skipMarker = test.annotations.find(
      (a) => a.type === "fixme" || a.type === "skip",
    );
    const skipReason =
      verdict === "skipped"
        ? isKnownIssue
          ? knownIssueReason
          : isExpectedFailure
            ? "既知の不具合のため対象外（修正待ち）"
            : skipMarker?.type === "fixme"
              ? `既知の不具合のため対象外（修正待ち）${skipMarker.description ? `: ${skipMarker.description}` : ""}`
              : (skipMarker?.description ?? "スキップ")
        : null;

    this.entries.push({
      journeyKey: path.basename(test.location.file).replace(/\.spec\.ts$/, ""),
      title: rest,
      badge,
      verdict,
      durationMs: result.duration,
      error: verdict === "failed" ? cleanError(result.error?.message) : null,
      skipReason,
      roles,
      screenshots,
    });
  }

  async onEnd(): Promise<void> {
    // 描画前にアバターを data: URI へ畳み込む（保存・転送しても壊れないようにするため）。
    const failedAvatars = await prefetchAvatars(this.config, [
      ...this.config.personas.map((persona) => persona.avatarSeed),
      ...this.entries.flatMap((entry) =>
        entry.roles.map((role) => this.avatarSeedForRole(role)),
      ),
    ]);
    const outPath = path.resolve(this.configDir, this.outputFile);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, this.renderHtml());
    // list レポーターの出力末尾に案内を 1 行だけ足す
    // biome-ignore lint/suspicious/noConsole: レポーターの CLI 出力
    console.log(`\n${this.config.title}: ${outPath}`);
    if (failedAvatars > 0) {
      // biome-ignore lint/suspicious/noConsole: レポーターの CLI 出力
      console.log(
        `アバター ${failedAvatars} 件は取得できず URL 参照のままです（オフラインで開くと表示されません）`,
      );
    }
  }

  private renderHtml(): string {
    const finishedAt = new Date();
    const elapsedSec = Math.round(
      (finishedAt.getTime() - this.startedAt.getTime()) / 1000,
    );
    const counts = {
      passed: this.entries.filter((e) => e.verdict === "passed").length,
      failed: this.entries.filter((e) => e.verdict === "failed").length,
      skipped: this.entries.filter((e) => e.verdict === "skipped").length,
    };
    const ranAt = new Intl.DateTimeFormat(this.config.locale, {
      timeZone: this.config.timeZone,
      dateStyle: "long",
      timeStyle: "short",
    }).format(this.startedAt);
    const productLogo = renderProductLogo(this.config, this.configDir);

    const journeyKeys = [...new Set(this.entries.map((e) => e.journeyKey))];
    const plannedJourneyKeys = [
      ...new Set([...Object.keys(this.config.journeys), ...journeyKeys]),
    ].sort(compareJourneyKeys);

    const setupSection =
      this.setupFailures.length > 0
        ? `<section class="journey"><div class="journey-head"><h2>環境セットアップの失敗</h2></div>${this.setupFailures
            .map((f) => `<pre class="error">${esc(f)}</pre>`)
            .join("")}</section>`
        : "";

    // ジャーニーをグループに束ねる。UJ-24 は 1 journey 内の各テストを人物別に振り分ける。
    const groupOf = (key: string): GroupId => this.personaOfJourney(key);
    const entryGroupOf = (entry: TestEntry): GroupId =>
      this.personaOfEntry(entry);
    const journeyKeysForGroup = (groupId: GroupId): string[] =>
      plannedJourneyKeys.filter((key) =>
        this.personasOfJourney(key).includes(groupId),
      );

    const renderJourney = (key: string, groupId: GroupId): string => {
      const meta = this.config.journeys[key] ?? { title: key, summary: "" };
      const tests = this.entries.filter(
        (e) => e.journeyKey === key && entryGroupOf(e) === groupId,
      );
      const ok = tests.filter((t) => t.verdict === "passed").length;
      const ng = tests.filter((t) => t.verdict === "failed").length;
      const journeyState =
        tests.length === 0 ? "idle" : ng > 0 ? "failed" : "passed";
      const journeyStat =
        tests.length === 0
          ? "未実行"
          : ng > 0
            ? `${ng} 件失敗`
            : `${ok}/${tests.length} 件成功`;
      const context =
        meta.context && meta.context.length > 0
          ? `<div class="journey-context">${meta.context
              .map((item) => `<p>${esc(item)}</p>`)
              .join("")}</div>`
          : "";
      const testItems =
        tests.length === 0
          ? this.renderNotRunJourney(key, meta.title)
          : tests
              .map((t) =>
                this.renderTest(t, `t-${this.entries.indexOf(t)}`, groupId),
              )
              .join("");
      return `
<section class="journey" data-journey>
  <div class="journey-head">
    <h2>${esc(meta.title)}</h2>
    <span class="journey-stat ${journeyState}">${journeyStat}</span>
  </div>
  ${meta.summary ? `<p class="journey-summary">${esc(meta.summary)}</p>` : ""}
  ${context}
  ${testItems}
</section>`;
    };

    // グループごとの成績を集計（タブ本数と概要タブのグループカード両方に使う）。
    type GroupStat = {
      id: GroupId;
      keys: string[];
      passed: number;
      failed: number;
      skipped: number;
    };
    const groupStats: GroupStat[] = this.config.personaOrder.map((id) => {
      const keys = journeyKeysForGroup(id);
      const items = this.entries.filter((e) => entryGroupOf(e) === id);
      return {
        id,
        keys,
        passed: items.filter((e) => e.verdict === "passed").length,
        failed: items.filter((e) => e.verdict === "failed").length,
        skipped: items.filter((e) => e.verdict === "skipped").length,
      };
    }).filter(
      (g) => g.keys.length > 0 || this.persona(g.id)?.alwaysVisible === true,
    );
    // 左カラムのペルソナリスト（概要 + 各グループ）。data-tab で右カラムを切り替える。
    const sidebarNav = `
<nav class="tabs" role="tablist">
  <button class="tab overview-tab active" data-tab="matrix" role="tab" aria-selected="true">
    <span class="overview-main">
      <span class="persona-name">ステータスマトリックス</span>
      <span class="persona-role">${esc(this.config.matrixSubtitle)}</span>
    </span>
    <span class="tab-badge ${counts.failed > 0 ? "failed" : "passed"}">${counts.failed > 0 ? `${counts.failed} 件失敗` : `${counts.passed}/${this.entries.length}`}</span>
  </button>
  ${groupStats
    .map((g) => {
      const meta = this.personaOrFallback(g.id);
      const total = g.passed + g.failed + g.skipped;
      const badgeCls =
        total === 0 ? "idle" : g.failed > 0 ? "failed" : "passed";
      const badgeText =
        total === 0
          ? "未実行"
          : g.failed > 0
            ? `${g.failed} 件失敗`
            : `${g.passed}/${total}`;
      return this.renderPersonaTab(g.id, meta, badgeCls, badgeText);
    })
    .join("")}
</nav>`;

    // マトリックスタブ: 操作・権限観点 × 7ペルソナ
    const matrixPanel = `
<section class="tab-panel active" data-panel="matrix">
  <div class="panel-header overview-panel-header">
    <h2 class="panel-title">ステータスマトリックス</h2>
    <p class="panel-summary">${esc(this.config.matrixDescription)}</p>
  </div>
  ${this.renderStatusMatrix()}
</section>`;

    // 各グループタブ: そのグループに属する journey を並べる
    const groupPanels = groupStats
      .map((g) => {
        const meta = this.personaOrFallback(g.id);
        const sections = g.keys.map((k) => renderJourney(k, g.id)).join("");
        return `
<section class="tab-panel" data-panel="${g.id}">
  ${this.renderSelectedPersonaHeader(meta, g)}
  ${sections}
</section>`;
      })
      .join("");

    const journeySections = `
<div class="report-shell">
  <aside class="persona-sidebar">${sidebarNav}</aside>
  <main class="experience-main">${setupSection}${matrixPanel}${groupPanels}</main>
</div>`;

    return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(this.config.title)} ${esc(ranAt)}</title>
<style>
:root {
  --green: #16a34a; --green-bg: #f0fdf4;
  --red: #dc2626; --red-bg: #fef2f2;
  --gray: #6b7280; --gray-bg: #f3f4f6;
  --border: #e5e7eb; --text: #111827; --sub: #6b7280;
}
* { box-sizing: border-box; }
body {
  margin: 0; color: var(--text); background: #f6f7f9;
  font-family: -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Noto Sans JP", sans-serif;
  line-height: 1.6;
  height: 100vh; overflow: hidden;
}
.wrap {
  width: 100vw; height: 100vh; margin: 0; padding: 0;
  display: flex; flex-direction: column; min-height: 0;
}
.report-header {
  background: #fff; border-bottom: 1px solid var(--border);
  padding: 8px 16px; margin: 0;
  display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 12px;
  align-items: center;
}
.brand-row {
  display: contents;
}
.brand-logo { display: inline-flex; align-items: center; width: 128px; }
.brand-logo svg { display: block; width: 128px; max-width: 100%; height: auto; }
.brand-fallback { color: #111827; font-size: 16px; font-weight: 800; }
.report-kind {
  color: var(--sub); font-size: 12px; font-weight: 700; letter-spacing: 0;
  border: 1px solid var(--border); border-radius: 999px; padding: 2px 8px;
  white-space: nowrap;
}
h1 { font-size: 16px; margin: 0; line-height: 1.3; }
.report-lead { color: var(--sub); font-size: 12px; margin: 1px 0 0; line-height: 1.35; }
.meta { color: var(--sub); font-size: 12px; margin: 0; line-height: 1.35; }
.header-main { min-width: 0; }
.header-meta { display: grid; justify-items: end; gap: 4px; min-width: 220px; }
.journey { background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 18px 20px; margin-bottom: 18px; }
.journey-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.journey-head h2 { font-size: 16px; margin: 0; }
.journey-stat { font-size: 13px; font-weight: 600; white-space: nowrap; }
.journey-stat.passed { color: var(--green); }
.journey-stat.failed { color: var(--red); }
.journey-stat.idle { color: var(--gray); }
.journey-summary { color: var(--sub); font-size: 13px; margin: 2px 0 12px; }
.journey-context {
  background: #f8fafc; border: 1px solid var(--border); border-radius: 8px;
  padding: 10px 12px; margin: 0 0 12px;
}
.journey-context p { color: #374151; font-size: 12px; margin: 0; }
.journey-context p + p { margin-top: 4px; }
details.test { border-top: 1px solid var(--border); }
details.test summary {
  list-style: none; display: flex; align-items: center; gap: 10px;
  padding: 10px 4px; cursor: pointer; font-size: 14px;
}
details.test summary::-webkit-details-marker { display: none; }
.dot { width: 10px; height: 10px; border-radius: 50%; flex: none; }
.dot.passed { background: var(--green); }
.dot.failed { background: var(--red); }
.dot.skipped { background: #d1d5db; }
.dot.idle { background: #d1d5db; }
.badge {
  flex: none; font-size: 12px; font-weight: 700; color: #4b5563;
  background: var(--gray-bg); border-radius: 4px; padding: 1px 6px;
}
.role-avatars {
  flex: none; display: inline-flex; align-items: center; margin-left: 2px;
}
.role-avatar {
  width: 24px; height: 24px; border-radius: 50%; background: #f3f4f6;
  border: 1px solid #fff; box-shadow: 0 0 0 1px var(--border);
}
.role-avatar + .role-avatar { margin-left: -7px; }
.role-avatar:hover { position: relative; z-index: 1; box-shadow: 0 0 0 2px #4338ca; }
.matrix-card {
  background: #fff; border: 1px solid var(--border); border-radius: 12px;
  overflow: auto;
}
.matrix-table { width: 100%; min-width: 1180px; border-collapse: separate; border-spacing: 0; }
.matrix-table th,
.matrix-table td {
  border-bottom: 1px solid var(--border); padding: 10px 12px; vertical-align: middle;
}
.matrix-table tr:last-child td { border-bottom: 0; }
.matrix-table th {
  background: #f9fafb; color: #374151; font-size: 12px; font-weight: 800;
  text-align: left; position: sticky; top: 0; z-index: 1;
}
.matrix-table th:first-child,
.matrix-table td:first-child {
  position: sticky; left: 0; z-index: 2; background: #fff; width: 330px;
}
.matrix-table th:first-child { background: #f9fafb; z-index: 3; }
.matrix-row-title { font-size: 13px; font-weight: 800; color: var(--text); line-height: 1.45; }
.matrix-row-summary { font-size: 12px; color: var(--sub); line-height: 1.45; margin-top: 2px; }
.matrix-persona { display: flex; align-items: center; gap: 8px; min-width: 120px; }
.matrix-persona img {
  width: 28px; height: 28px; border-radius: 50%; background: #f3f4f6;
  border: 1px solid var(--border); flex: none;
}
.matrix-persona-name { display: block; font-size: 12px; font-weight: 800; color: var(--text); line-height: 1.25; }
.matrix-persona-role { display: block; font-size: 12px; color: var(--sub); line-height: 1.25; }
.matrix-cell {
  display: inline-flex; align-items: center; justify-content: center; gap: 4px;
  min-width: 72px; border-radius: 999px; padding: 3px 9px; font-size: 12px;
  font-weight: 800; text-decoration: none; white-space: nowrap;
}
.matrix-cell.passed { background: var(--green-bg); color: var(--green); border: 1px solid #bbf7d0; }
.matrix-cell.failed { background: var(--red-bg); color: var(--red); border: 1px solid #fecaca; }
.matrix-cell.skipped { background: #fef9c3; color: #a16207; border: 1px solid #fde68a; }
.matrix-cell.none { background: #fff; color: #9ca3af; border: 1px dashed var(--border); }
.matrix-legend { display: flex; gap: 14px; font-size: 12px; color: var(--sub); margin: 0 0 10px; flex-wrap: wrap; }
.matrix-legend span { display: inline-flex; align-items: center; gap: 4px; }
.t-title { flex: 1; }
details.test summary .dur { color: var(--sub); font-size: 12px; flex: none; }
details.test.not-run summary { cursor: default; }
.caret { flex: none; color: var(--sub); transition: transform .15s; }
details[open] .caret { transform: rotate(90deg); }
.test-body { padding: 4px 4px 16px 24px; }
.evidence {
  background: #f9fafb; border: 1px solid var(--border); border-radius: 8px;
  padding: 10px 12px; margin: 0 0 10px;
}
.evidence-title { font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 4px; }
.evidence p { color: #4b5563; font-size: 12px; margin: 0; }
.evidence p + p { margin-top: 4px; }
.shots {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px 12px; margin-top: 8px; align-items: start;
}
.shot { text-align: center; min-width: 0; }
.shot-frame {
  position: relative; display: flex; align-items: center; justify-content: center;
  width: 100%; aspect-ratio: 16 / 9; line-height: 0; background: #f8fafc;
  border: 1px solid var(--border); border-radius: 6px; overflow: hidden;
}
.shot img {
  width: 100%; height: 100%; object-fit: contain; cursor: zoom-in; display: block;
}
.shot .cap { font-size: 12px; color: var(--sub); margin-top: 2px; line-height: 1.4; }
.skip-note { background: var(--gray-bg); color: var(--gray); border-radius: 8px; padding: 10px 14px; font-size: 13px; }
.planned-checks {
  list-style: none; margin: 10px 0 0; padding: 0;
  border: 1px solid var(--border); border-radius: 8px; overflow: hidden;
}
.planned-checks li {
  display: flex; align-items: center; gap: 10px; padding: 10px 12px;
  font-size: 13px; color: #374151; background: #fff;
}
.planned-checks li + li { border-top: 1px solid var(--border); }
.planned-checks li .dur { margin-left: auto; color: var(--sub); white-space: nowrap; }
pre.error {
  background: var(--red-bg); border: 1px solid #fecaca; color: #991b1b;
  border-radius: 8px; padding: 12px 14px; font-size: 12px;
  white-space: pre-wrap; word-break: break-word; max-height: 280px; overflow: auto;
}
.error-label { color: var(--red); font-weight: 600; font-size: 13px; margin: 8px 0 4px; }
.lightbox {
  position: fixed; inset: 0; background: rgba(17,24,39,.92); display: none;
  align-items: center; justify-content: center; flex-direction: column; gap: 10px; z-index: 50;
}
.lightbox.open { display: flex; }
.lightbox-figure { position: relative; line-height: 0; }
.lightbox img { max-width: 92vw; max-height: 84vh; border-radius: 6px; background: #fff; display: block; }
.lightbox .lb-cap { color: #e5e7eb; font-size: 13px; }
.lightbox .lb-nav {
  position: absolute; top: 50%; transform: translateY(-50%);
  background: rgba(255,255,255,.12); color: #fff; border: 0; border-radius: 50%;
  width: 44px; height: 44px; font-size: 20px; cursor: pointer;
}
.lb-prev { left: 16px; } .lb-next { right: 16px; }
.lb-close { position: absolute; top: 14px; right: 18px; background: none; border: 0; color: #fff; font-size: 26px; cursor: pointer; }
.hidden { display: none !important; }

.report-shell {
  display: grid; grid-template-columns: 420px minmax(0, 1fr); gap: 0;
  align-items: stretch; min-height: 0; flex: 1; overflow: hidden;
}
.persona-sidebar {
  background: #fff; border-right: 1px solid var(--border);
  min-height: 0; overflow: auto; overscroll-behavior: contain;
}
.experience-main {
  min-height: 0; overflow: auto; overscroll-behavior: contain;
  padding: 14px 16px 20px;
}

/* --- 左カラムのペルソナリスト --- */
.tabs {
  display: grid; gap: 0; margin: 0;
}
.tab {
  background: #fff; border: 0; border-bottom: 1px solid var(--border); border-radius: 0;
  padding: 12px 14px; font-size: 13px; color: var(--sub); cursor: pointer;
  display: flex; align-items: center; gap: 10px;
  font-family: inherit; min-width: 0; width: 100%; text-align: left;
}
.tab:hover { color: var(--text); background: #f9fafb; }
.tab.active { color: var(--text); background: #f8fafc; box-shadow: inset 3px 0 0 var(--text); }
.overview-tab { min-height: 64px; }
.overview-main { display: grid; gap: 2px; min-width: 0; flex: 1; }
.persona-avatar {
  width: 44px; height: 44px; border-radius: 50%; background: #f3f4f6;
  border: 1px solid var(--border); flex: none;
}
.persona-main { display: grid; gap: 1px; min-width: 0; flex: 1; }
.persona-name { font-size: 13px; font-weight: 700; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.persona-role { font-size: 12px; color: var(--sub); line-height: 1.35; }
.persona-badges { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 3px; }
.persona-badge {
  font-size: 12px; font-weight: 700; border-radius: 999px; padding: 1px 6px;
}
.persona-badge.team {
  color: #374151; background: #f3f4f6; border: 1px solid var(--border);
}
.persona-badge.workspace {
  color: #0f766e; background: #ecfeff; border: 1px dashed #14b8a6;
}
.tab-badge {
  font-size: 12px; font-weight: 700; padding: 1px 8px; border-radius: 999px; flex: none;
}
.tab-badge.passed { background: var(--green-bg); color: var(--green); }
.tab-badge.failed { background: var(--red-bg); color: var(--red); }
.tab-badge.idle { background: var(--gray-bg); color: var(--gray); }
.tab-panel { display: none; }
.tab-panel.active { display: block; }

/* --- 各グループパネルのヘッダ --- */
.panel-header {
  background: #fff; border: 1px solid var(--border); border-radius: 12px;
  margin: 0 0 14px; padding: 14px 16px;
}
.overview-panel-header { margin-bottom: 18px; }
.selected-persona-header { display: flex; gap: 14px; align-items: flex-start; }
.selected-persona-avatar {
  width: 72px; height: 72px; border-radius: 50%; background: #f3f4f6;
  border: 1px solid var(--border); flex: none;
}
.selected-persona-body { flex: 1; min-width: 0; }
.selected-persona-head { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
.selected-persona-name { font-size: 18px; font-weight: 800; line-height: 1.3; }
.selected-persona-role { margin-top: 2px; }
.selected-persona-badges { margin-top: 5px; }
.selected-persona-stat { font-size: 14px; font-weight: 800; white-space: nowrap; }
.selected-persona-stat.passed { color: var(--green); }
.selected-persona-stat.failed { color: var(--red); }
.selected-persona-stat.idle { color: var(--gray); }
.panel-title { font-size: 15px; margin: 0 0 4px; }
.panel-summary { color: var(--sub); font-size: 12px; margin: 0; }
.empty-persona-state {
  background: #fff; border: 1px dashed #cbd5e1; border-radius: 12px;
  padding: 18px 20px; color: var(--sub);
}
.empty-persona-state h3 {
  margin: 0 0 6px; color: var(--text); font-size: 15px;
}
.empty-persona-state p { margin: 0; font-size: 13px; }
@media (max-width: 860px) {
  body { height: auto; overflow: auto; }
  .wrap { height: auto; min-height: 100vh; }
  .report-header { grid-template-columns: 1fr; }
  .brand-row { display: flex; align-items: center; justify-content: space-between; }
  .header-meta { justify-items: start; min-width: 0; }
  .report-shell { grid-template-columns: 1fr; }
  .persona-sidebar,
  .experience-main { overflow: visible; }
  .tabs { grid-template-columns: 1fr; }
}
</style>
</head>
<body>
<div class="wrap">
  <header class="report-header">
    <div class="brand-row">${productLogo}</div>
    <div class="header-main">
      <h1>${esc(this.config.title)}</h1>
      <p class="report-lead">${esc(this.config.subtitle)}</p>
    </div>
    <div class="header-meta">
      <span class="report-kind">${esc(this.config.kindLabel)}</span>
      <div class="meta">実行日時: ${esc(ranAt)}（所要 ${elapsedSec} 秒） / 対象環境: ${esc(this.baseUrl)}</div>
    </div>
  </header>
  ${journeySections}
</div>
<div class="lightbox" id="lb">
  <button class="lb-close" aria-label="閉じる">×</button>
  <button class="lb-nav lb-prev" aria-label="前へ">‹</button>
  <div class="lightbox-figure">
    <img alt="">
  </div>
  <div class="lb-cap"></div>
  <button class="lb-nav lb-next" aria-label="次へ">›</button>
</div>
<script>
(function () {
  // タブ切り替え（ロール別分類）
  function activateTab(id) {
    document.querySelectorAll(".tab").forEach(function (t) {
      var on = t.getAttribute("data-tab") === id;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    document.querySelectorAll(".tab-panel").forEach(function (p) {
      p.classList.toggle("active", p.getAttribute("data-panel") === id);
    });
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  document.querySelectorAll(".tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      activateTab(tab.getAttribute("data-tab"));
    });
  });
  // ステータスマトリックスのセル → 該当テストの所属タブへ切替 → details を開いて scroll
  document.querySelectorAll('.matrix-cell[href^="#"]').forEach(function (chip) {
    chip.addEventListener("click", function (e) {
      e.preventDefault();
      var href = chip.getAttribute("href");
      var d = document.querySelector(href);
      if (!d) return;
      var panel = d.closest(".tab-panel");
      if (panel) activateTab(panel.getAttribute("data-panel"));
      if (d.tagName === "DETAILS") d.open = true;
      requestAnimationFrame(function () {
        d.scrollIntoView({ block: "start", behavior: "smooth" });
      });
    });
  });

  // ライトボックス
  var lb = document.getElementById("lb");
  var lbImg = lb.querySelector("img");
  var lbCap = lb.querySelector(".lb-cap");
  var gallery = [];
  var idx = 0;

  function show(i) {
    idx = (i + gallery.length) % gallery.length;
    lbImg.src = gallery[idx].src;
    lbCap.textContent = gallery[idx].getAttribute("data-cap") || "";
  }
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  document.querySelectorAll(".shot img").forEach(function (img) {
    img.addEventListener("click", function () {
      gallery = Array.prototype.slice.call(
        img.closest(".test-body").querySelectorAll(".shot img"));
      lb.classList.add("open");
      show(gallery.indexOf(img));
    });
  });
  lb.querySelector(".lb-prev").addEventListener("click", function (e) { e.stopPropagation(); show(idx - 1); });
  lb.querySelector(".lb-next").addEventListener("click", function (e) { e.stopPropagation(); show(idx + 1); });
  lb.querySelector(".lb-close").addEventListener("click", function () { lb.classList.remove("open"); });
  lb.addEventListener("click", function (e) { if (e.target === lb) lb.classList.remove("open"); });
  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") lb.classList.remove("open");
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
  });
})();
</script>
</body>
</html>`;
  }

  private renderPersonaTab(
    id: GroupId,
    meta: ResolvedPersona,
    badgeCls: string,
    badgeText: string,
  ): string {
    return `
<button class="tab persona-tab" data-tab="${id}" role="tab" aria-selected="false">
  ${this.renderAvatar(meta.avatarSeed, `${meta.name}のアバター`, "persona-avatar")}
  <span class="persona-main">
    <span class="persona-name">${esc(meta.name)}</span>
    <span class="persona-role">${esc(meta.headline)}</span>
    <span class="persona-badges">${renderPersonaBadges(meta.badges)}</span>
  </span>
  <span class="tab-badge ${badgeCls}">${esc(badgeText)}</span>
</button>`;
  }

  private renderSelectedPersonaHeader(
    meta: ResolvedPersona,
    stat: {
      passed: number;
      failed: number;
      skipped: number;
    },
  ): string {
    const total = stat.passed + stat.failed + stat.skipped;
    const state = total === 0 ? "idle" : stat.failed > 0 ? "failed" : "passed";
    const statText =
      total === 0
        ? "未実行"
        : stat.failed > 0
          ? `${stat.failed} 件失敗`
          : `${stat.passed}/${total} 件成功`;
    return `
<div class="panel-header selected-persona-header">
  ${this.renderAvatar(meta.avatarSeed, `${meta.name}のアバター`, "selected-persona-avatar")}
  <div class="selected-persona-body">
    <div class="selected-persona-head">
      <div>
        <div class="selected-persona-name">${esc(meta.name)}</div>
        <div class="persona-role selected-persona-role">${esc(meta.headline)}</div>
        <div class="persona-badges selected-persona-badges">${renderPersonaBadges(meta.badges)}</div>
      </div>
      <span class="selected-persona-stat ${state}">${esc(statText)}</span>
    </div>
  </div>
</div>`;
  }

  private renderNotRunJourney(key: string, title: string): string {
    const plannedTitles = this.config.journeys[key]?.plannedTitles ?? [title];
    const plannedItems = plannedTitles
      .map(
        (plannedTitle) => `
      <li>
        <span class="dot idle" title="未実行"></span>
        <span>${esc(plannedTitle)}</span>
        <span class="dur">未実行</span>
      </li>`,
      )
      .join("");
    return `
<details class="test not-run" data-verdict="not-run" open>
  <summary>
    <span class="dot idle" title="未実行"></span>
    <span class="t-title">${esc(title)}の確認項目はこの実行では未実行</span>
    <span class="dur">未実行</span>
    <span class="caret">›</span>
  </summary>
  <div class="test-body">
    <div class="skip-note">この体験はペルソナの確認対象です。対象の E2E を実行すると、各確認項目に操作ステータスとスクリーンショットが表示されます。</div>
    <ul class="planned-checks">${plannedItems}</ul>
  </div>
</details>`;
  }

  private renderStatusMatrix(): string {
    const headerCells = this.config.matrixPersonaIds
      .map((groupId) => {
        const meta = this.personaOrFallback(groupId);
        return `
<th scope="col">
  <span class="matrix-persona">
    ${this.renderAvatar(meta.avatarSeed, `${meta.name}のアバター`, "")}
    <span>
      <span class="matrix-persona-name">${esc(meta.name)}</span>
      <span class="matrix-persona-role">${esc(meta.label)}</span>
    </span>
  </span>
</th>`;
      })
      .join("");
    const rows = this.config.matrixRows
      .map((row) => {
      const cells = this.config.matrixPersonaIds
        .map((groupId) => this.renderStatusMatrixCell(row, groupId))
        .join("");
      return `
<tr>
  <td>
    <div class="matrix-row-title">${esc(row.label)}</div>
    <div class="matrix-row-summary">${esc(row.summary)}</div>
  </td>
  ${cells}
</tr>`;
      })
      .join("");
    return `
<section class="matrix-card" aria-label="ステータスマトリックス">
  <div class="matrix-legend">
    <span><span class="matrix-cell passed">成功</span> 既存 E2E で確認済み</span>
    <span><span class="matrix-cell failed">失敗</span> 期待と現状が不一致</span>
    <span><span class="matrix-cell skipped">対象外</span> 既知不具合・未修正などで保留</span>
    <span><span class="matrix-cell none">未実行</span> この実行では対応結果なし</span>
  </div>
  <table class="matrix-table">
    <thead>
      <tr>
        <th scope="col">シナリオ / できること</th>
        ${headerCells}
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</section>`;
  }

  private renderStatusMatrixCell(row: MatrixRow, groupId: string): string {
    const matches = this.findMatrixEntries(row, groupId);
    const state = this.resolveMatrixState(matches);
    const label =
      state.verdict === "passed"
        ? state.total > 1
          ? `成功 ${state.passed}/${state.total}`
          : "成功"
        : state.verdict === "failed"
          ? state.total > 1
            ? `失敗 ${state.failed}/${state.total}`
            : "失敗"
          : state.verdict === "skipped"
            ? "対象外"
            : "未実行";
    const title =
      state.verdict === "none"
        ? "この行に紐づく既存 E2E 結果はこの実行にありません"
        : matches.map((entry) => entry.title).join(" / ");
    const anchor = state.anchor === null ? "" : ` href="#t-${state.anchor}"`;
    const tag = state.anchor === null ? "span" : "a";
    return `<td><${tag} class="matrix-cell ${state.verdict}"${anchor} title="${esc(title)}">${esc(label)}</${tag}></td>`;
  }

  private findMatrixEntries(row: MatrixRow, groupId: string): TestEntry[] {
    const titles = this.matrixTitlesFor(row, groupId);
    if (titles.length === 0) {
      return [];
    }
    // 同じタイトルが複数ペルソナに現れる spec（横断 spec）は、
    // その行のペルソナに割り当たったものだけを拾う。
    return this.entries.filter(
      (entry) =>
        titles.includes(entry.title) &&
        this.personaOfEntry(entry) === groupId,
    );
  }

  private matrixTitlesFor(row: MatrixRow, groupId: string): string[] {
    const titles =
      typeof row.titles === "function"
        ? row.titles(groupId)
        : (row.titles[groupId] ?? []);
    return [...titles];
  }

  private resolveMatrixState(entries: TestEntry[]): {
    verdict: Verdict | "none";
    anchor: number | null;
    passed: number;
    failed: number;
    total: number;
  } {
    const failed = entries.filter((entry) => entry.verdict === "failed");
    const passed = entries.filter((entry) => entry.verdict === "passed");
    const skipped = entries.filter((entry) => entry.verdict === "skipped");
    const anchorFor = (entry: TestEntry | undefined): number | null =>
      entry === undefined ? null : this.entries.indexOf(entry);
    if (failed.length > 0) {
      return {
        verdict: "failed",
        anchor: anchorFor(failed[0]),
        passed: passed.length,
        failed: failed.length,
        total: entries.length,
      };
    }
    if (passed.length > 0) {
      return {
        verdict: "passed",
        anchor: anchorFor(passed[0]),
        passed: passed.length,
        failed: 0,
        total: entries.length,
      };
    }
    if (skipped.length > 0) {
      return {
        verdict: "skipped",
        anchor: anchorFor(skipped[0]),
        passed: 0,
        failed: 0,
        total: entries.length,
      };
    }
    return { verdict: "none", anchor: null, passed: 0, failed: 0, total: 0 };
  }

  private renderTest(t: TestEntry, anchorId = "", groupId: GroupId): string {
    const dur =
      t.verdict === "skipped" ? "" : `${(t.durationMs / 1000).toFixed(1)} 秒`;
    // 複数ロールを跨ぐテストだけ、手順キャプションにロール名を付ける
    const multiRole = t.roles.length > 1;
    const shots = t.screenshots
      .map((s) => {
        const roleTag =
          multiRole && s.role ? `［${this.roleLabel(s.role)}］` : "";
        const caption = this.screenshotCaption(t, s);
        const cap = `${s.step !== null ? `${s.step}. ` : ""}${roleTag}${caption}`;
        return `<div class="shot"><span class="shot-frame"><img src="${s.dataUri}" data-cap="${esc(`${t.title} — ${cap}`)}" alt="${esc(cap)}" loading="lazy"></span><div class="cap">${esc(cap)}</div></div>`;
      })
      .join("");
    const roleAvatars =
      this.persona(groupId)?.crossPersona === true
        ? this.renderRoleAvatars(t.roles)
        : "";
    const evidence =
      this.config.journeys[t.journeyKey]?.evidence?.[t.title] ?? [];
    const evidenceBlock =
      evidence.length > 0
        ? `<div class="evidence"><div class="evidence-title">この確認で見ていること</div>${evidence
            .map((item) => `<p>${esc(item)}</p>`)
            .join("")}</div>`
        : "";

    const body =
      t.verdict === "skipped"
        ? `${evidenceBlock}<div class="skip-note">${esc(t.skipReason ?? "スキップ")}</div>${shots ? `<div class="shots">${shots}</div>` : `<div class="skip-note">スクリーンショットなし</div>`}`
        : `${
            t.error
              ? `<div class="error-label">失敗の内容（開発者向け詳細）</div><pre class="error">${esc(t.error)}</pre>`
              : ""
          }${evidenceBlock}${shots ? `<div class="shots">${shots}</div>` : `<div class="skip-note">スクリーンショットなし</div>`}`;

    return `
<details class="test"${anchorId ? ` id="${anchorId}"` : ""} data-verdict="${t.verdict}"${t.verdict === "failed" ? " open" : ""}>
  <summary>
    <span class="dot ${t.verdict}" title="${t.verdict}"></span>
    <span class="t-title">${esc(t.title)}</span>
    ${roleAvatars}
    <span class="dur">${dur}</span>
    <span class="caret">›</span>
  </summary>
  <div class="test-body">${body}</div>
</details>`;
  }

  // ---- 設定の引き当て ----

  private persona(id: string): ResolvedPersona | undefined {
    return this.config.personaById.get(id);
  }

  /** 未知の id でも描画を止めないための保険。 */
  private personaOrFallback(id: string): ResolvedPersona {
    return (
      this.persona(id) ?? {
        id,
        name: id,
        headline: "",
        label: "",
        badges: [],
        avatarSeed: id,
      }
    );
  }

  private personaOfJourney(key: string): string {
    return this.config.journeys[key]?.persona ?? this.config.defaultPersonaId;
  }

  /**
   * その spec が現れるペルソナ。personaByTitle を持つ spec（1 本で複数人物を
   * 横断するもの）は、割り当て先すべてのタブに出す。
   */
  private personasOfJourney(key: string): string[] {
    const byTitle = this.config.journeys[key]?.personaByTitle;
    if (byTitle !== undefined) {
      return [...new Set(Object.values(byTitle))];
    }
    return [this.personaOfJourney(key)];
  }

  private personaOfEntry(entry: TestEntry): string {
    const journey = this.config.journeys[entry.journeyKey];
    if (journey?.personaByTitle !== undefined) {
      return (
        journey.personaByTitle[entry.title] ?? this.config.defaultPersonaId
      );
    }
    return this.personaOfJourney(entry.journeyKey);
  }

  private roleLabel(role: string): string {
    return this.config.roles[role]?.label ?? role;
  }

  /** ロール名から使うアバター seed を引く（描画と prefetch で同じ seed を使う）。 */
  private avatarSeedForRole(role: string): string {
    const personaId = this.config.roles[role]?.personaId;
    const persona =
      personaId === undefined ? undefined : this.persona(personaId);
    return persona?.avatarSeed ?? role;
  }

  private renderAvatar(seed: string, alt: string, className: string): string {
    if (!this.config.avatarEnabled) {
      return "";
    }
    const cls = className === "" ? "" : ` class="${className}"`;
    return `<img${cls} src="${avatarUrl(this.config, seed)}" alt="${esc(alt)}" loading="lazy">`;
  }

  /** 複数ロールを横断するタブで、各テスト行に操作ロールのアバターを並べる。 */
  private renderRoleAvatars(roles: readonly string[]): string {
    if (roles.length === 0 || !this.config.avatarEnabled) {
      return "";
    }
    const avatars = roles
      .map((role) => {
        const personaId = this.config.roles[role]?.personaId;
        const meta =
          personaId === undefined ? undefined : this.persona(personaId);
        const label =
          meta === undefined
            ? this.roleLabel(role)
            : meta.badges.length > 0
              ? `${meta.name}: ${meta.badges.map((badge) => badge.label).join(" / ")}`
              : meta.name;
        return `<img class="role-avatar" src="${avatarUrl(this.config, this.avatarSeedForRole(role))}" alt="${esc(label)}" title="${esc(label)}" loading="lazy">`;
      })
      .join("");
    return `<span class="role-avatars" aria-label="確認対象ペルソナ">${avatars}</span>`;
  }

  private screenshotCaption(test: TestEntry, screenshot: Screenshot): string {
    const custom = this.config.caption?.({
      journeyKey: test.journeyKey,
      testTitle: test.title,
      role: screenshot.role,
      step: screenshot.step,
      text: screenshot.text,
    });
    return custom === undefined || custom === null ? screenshot.text : custom;
  }

  private splitBadge(title: string): { badge: string | null; rest: string } {
    const hit = this.config.titleBadge?.(title);
    return hit === undefined || hit === null
      ? { badge: null, rest: title }
      : { badge: hit.badge, rest: hit.rest };
  }

}



function renderPersonaBadges(badges: readonly PersonaBadge[]): string {
  return badges
    .map(
      (badge) =>
        `<span class="persona-badge ${esc(badge.axis ?? "")}">${esc(badge.label)}</span>`,
    )
    .join("");
}



function cleanError(message: string | undefined): string {
  if (!message) {
    return "（エラー詳細なし）";
  }
  return message.replace(ANSI_RE, "").trim();
}

function textAttachment(result: TestResult, name: string): string | null {
  const attachment = result.attachments.find((item) => item.name === name);
  if (attachment === undefined) {
    return null;
  }
  const body =
    attachment.body ??
    (attachment.path && fs.existsSync(attachment.path)
      ? fs.readFileSync(attachment.path)
      : null);
  if (body === null) {
    return null;
  }
  return body.toString("utf8").trim();
}

/**
 * ジャーニーキー（"uj20-..."）を先頭の数値で比較する。
 * 辞書順だと uj20 が uj3 より前に来るため、番号で並べて uj01 → uj27 の昇順にする。
 */
function compareJourneyKeys(a: string, b: string): number {
  const num = (key: string): number => Number(key.match(/^uj(\d+)/)?.[1] ?? 0);
  return num(a) - num(b);
}

/**
 * ペルソナアバターは dicebear の seed endpoint で生成する。ただし HTML に URL のまま
 * 置くと、レポートを保存・転送・オフラインで開いたときにアバターだけが壊れる
 *（ブラウザの「ページを保存」がローカルコピーへ書き換えるため）。手順スクショは
 * base64 埋め込みで 1 ファイル完結なので、アバターも同じ扱いに揃える。
 *
 * `prefetchAvatars` が生成時に seed ごと 1 回だけ取得して data: URI に畳み込み、
 * `avatarUrl` はそれを引く。取得できなかった seed だけ従来どおり URL 参照に落ちる
 *（オフライン CI でも今より悪くならない）。
 */
const AVATAR_FETCH_TIMEOUT_MS = 5_000;
const avatarDataUris = new Map<string, string>();

function avatarRemoteUrl(config: ResolvedConfig, seed: string): string {
  return `https://api.dicebear.com/10.x/${config.avatarStyle}/svg?seed=${encodeURIComponent(seed)}`;
}

function avatarUrl(config: ResolvedConfig, seed: string): string {
  return avatarDataUris.get(seed) ?? avatarRemoteUrl(config, seed);
}

/** seed ごとに dicebear の SVG を取得して data: URI 化する。戻り値は取得できなかった件数。 */
async function prefetchAvatars(
  config: ResolvedConfig,
  seeds: readonly string[],
): Promise<number> {
  if (!config.avatarEnabled) {
    return 0;
  }
  const pending = [...new Set(seeds)].filter(
    (seed) => !avatarDataUris.has(seed),
  );
  const results = await Promise.all(
    pending.map(async (seed) => {
      try {
        const res = await fetch(avatarRemoteUrl(config, seed), {
          signal: AbortSignal.timeout(AVATAR_FETCH_TIMEOUT_MS),
        });
        if (!res.ok) {
          return false;
        }
        const svg = await res.text();
        // キャプティブポータルや CDN のインタースティシャルは 200 で HTML を返す。
        // それを SVG として埋め込むと全アバターが壊れたうえ URL 参照へも戻れないので、
        // 中身が SVG であることを確認できたものだけ畳み込む。
        if (!svg.trimStart().startsWith("<svg")) {
          return false;
        }
        avatarDataUris.set(
          seed,
          `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`,
        );
        return true;
      } catch {
        // 取得失敗（オフライン・タイムアウト等）は URL 参照のまま描画する
        return false;
      }
    }),
  );
  return results.filter((ok) => ok === false).length;
}

function renderProductLogo(config: ResolvedConfig, configDir: string): string {
  const logoPath = config.logoPaths
    .map((candidate) =>
      path.isAbsolute(candidate)
        ? candidate
        : path.resolve(configDir, candidate),
    )
    .find((candidate) => fs.existsSync(candidate));

  if (logoPath === undefined) {
    return `<span class="brand-fallback">${esc(config.logoFallbackText)}</span>`;
  }

  return `<span class="brand-logo">${fs.readFileSync(logoPath, "utf8")}</span>`;
}

function esc(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/**
 * 設定から Playwright レポーターのクラスを作る。
 *
 * ```ts
 * // reporters/index.ts
 * import { createReporter } from "./report-kit";
 * import { reportConfig } from "./report.config";
 * export default createReporter(reportConfig);
 * ```
 */
export function createReporter(
  config: ReportConfig,
): new (options?: ReporterOptions) => Reporter {
  const resolved = resolveConfig(config);
  return class ConfiguredReportKitReporter extends ReportKitReporter {
    constructor(options: ReporterOptions = {}) {
      super(resolved, options);
    }
  };
}
