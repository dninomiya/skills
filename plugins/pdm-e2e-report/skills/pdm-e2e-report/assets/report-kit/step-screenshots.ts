import path from "node:path";
import type {
  Browser,
  BrowserContext,
  Locator,
  Page,
  TestInfo,
} from "@playwright/test";

/**
 * 手順スクリーンショットの自動収集。
 *
 * Page / Locator の操作系メソッド（goto / click / fill など）をプロトタイプ単位で
 * フックし、操作が成功するたびに `<prefix>:<ロール>:<ラベル>` という名前の
 * スクリーンショット attachment を残す。spec 側の変更は不要で、reporter がこの
 * attachment を手順ギャラリーとして描画する。
 *
 * ロールは Browser.newContext の storageState パスから逆引きするため、
 * 独自フィクスチャ経由でも spec 内の手動 newContext でも判定できる。
 *
 * 手順スクショは JPEG（既定 quality 60）で撮る。全操作分を base64 で単一 HTML に
 * 埋め込むため、PNG だとレポートが数十 MB に膨らむ。
 */

type AnyFn = (...args: never[]) => unknown;
type Proto = Record<string, AnyFn>;

export type StepScreenshotConfig = {
  /** 撮影対象の Playwright プロジェクト名。既定 "journeys"。 */
  readonly projectName?: string;
  /** attachment 名のプレフィックス。reporter 側の設定と必ず揃える。既定 "step"。 */
  readonly attachmentPrefix?: string;
  /**
   * storageState のパス → ロールキー。
   * パスは絶対・相対どちらでもよい（解決してから突き合わせる）。
   */
  readonly roleByStorageState?: Readonly<Record<string, string>>;
  /**
   * その spec を自動撮影の対象にするか。既定はすべて対象。
   * 例: `(info) => path.basename(info.file).startsWith("uj")`
   */
  readonly shouldCapture?: (info: TestInfo) => boolean;
  /** フルページで撮りたい操作の条件。既定は常にビューポートのみ。 */
  readonly fullPage?: (context: {
    readonly role: string;
    readonly label: string;
  }) => boolean;
  /** JPEG 品質。既定 60。 */
  readonly quality?: number;
  /**
   * フルページ撮影時に差し込む CSS。
   * 画面全体を縦スクロールさせないレイアウト（`h-screen` + 内側スクロール）だと
   * fullPage 指定だけでは下部が写らないため、高さ制限を外すために使う。
   */
  readonly fullPageStyle?: string;
  /** 操作ラベルの文言を差し替える。 */
  readonly actionLabels?: Partial<ActionLabels>;
};

export type ActionLabels = {
  goto: (url: string) => string;
  click: (target: string) => string;
  dblclick: (target: string) => string;
  fill: (target: string, value: string) => string;
  selectOption: (target: string, value: string) => string;
  check: (target: string) => string;
  uncheck: (target: string) => string;
  setChecked: (target: string, checked: boolean) => string;
  press: (target: string, key: string) => string;
  setInputFiles: (target: string) => string;
  /** capturePoint() のキャプション。 */
  checkpoint: (caption: string) => string;
};

const DEFAULT_ACTION_LABELS: ActionLabels = {
  goto: (url) => `ページ移動: ${url}`,
  click: (t) => `クリック: ${t}`,
  dblclick: (t) => `ダブルクリック: ${t}`,
  fill: (t, v) => `入力: ${t} ← ${short(v, 40)}`,
  selectOption: (t, v) => `選択: ${t} ← ${short(v, 40)}`,
  check: (t) => `チェック ON: ${t}`,
  uncheck: (t) => `チェック OFF: ${t}`,
  setChecked: (t, checked) => `チェック ${checked ? "ON" : "OFF"}: ${t}`,
  press: (t, key) => `キー入力 ${key}: ${t}`,
  setInputFiles: (t) => `ファイル選択: ${t}`,
  checkpoint: (caption) => `確認: ${caption}`,
};

const DEFAULT_FULL_PAGE_STYLE = `
  .h-screen { height: auto !important; min-height: 100vh !important; }
  .min-h-0 { min-height: auto !important; }
  .overflow-hidden, .overflow-auto, .overflow-y-auto { overflow: visible !important; }
`;

export type StepScreenshots = {
  /** auto フィクスチャからテスト開始/終了時に呼ぶ。 */
  setCurrentTest: (info: TestInfo | null) => void;
  /** worker ごとに一度だけプロトタイプへフックを仕込む。 */
  install: (browser: Browser) => Promise<void>;
  /**
   * 「ここが確認ポイント」であることを明示して撮る。
   * `note` はレポートの読み手が読む説明文なので、キャプションへ必ず載せる。
   */
  capturePoint: (
    info: TestInfo,
    page: Page,
    label: string,
    locator: Locator,
    note: string,
  ) => Promise<void>;
};

export function createStepScreenshots(
  config: StepScreenshotConfig = {},
): StepScreenshots {
  const projectName = config.projectName ?? "journeys";
  const prefix = config.attachmentPrefix ?? "step";
  const quality = config.quality ?? 60;
  const labels: ActionLabels = { ...DEFAULT_ACTION_LABELS, ...config.actionLabels };
  const fullPageStyle = config.fullPageStyle ?? DEFAULT_FULL_PAGE_STYLE;
  const roleByPath = new Map<string, string>(
    Object.entries(config.roleByStorageState ?? {}).map(([statePath, role]) => [
      path.resolve(statePath),
      role,
    ]),
  );

  let currentTest: TestInfo | null = null;
  let patched = false;
  const contextRoles = new WeakMap<BrowserContext, string>();

  const captureForTest = async (
    info: TestInfo,
    page: Page,
    label: string,
    locator?: Locator,
    target?: string,
    options?: {
      waitForNetworkIdle?: boolean;
      fullPage?: boolean;
      screenshotTimeout?: number;
      swallowErrors?: boolean;
    },
  ): Promise<void> => {
    if (info.project.name !== projectName) {
      return;
    }
    try {
      // goto / クリック / 選択など全操作で、SPA の hydrate（API 取得）後の実画面を撮る。
      // ネットワーク安定を短く待ってから撮影する（idle にならなくても続行）。
      if (options?.waitForNetworkIdle !== false) {
        await page
          .waitForLoadState("networkidle", { timeout: 2000 })
          .catch(() => {});
      }
      if (locator !== undefined && target !== undefined) {
        await locator.scrollIntoViewIfNeeded({ timeout: 1000 }).catch(() => {});
      }
      const role = contextRoles.get(page.context()) ?? "";
      const shouldCaptureFullPage =
        options?.fullPage === true ||
        config.fullPage?.({ role, label }) === true;
      const styleHandle = shouldCaptureFullPage
        ? await page.addStyleTag({ content: fullPageStyle }).then(async (h) => {
            await page.waitForTimeout(50);
            return h;
          })
        : null;
      const body = await (async () => {
        try {
          return await page.screenshot({
            type: "jpeg",
            quality,
            timeout: options?.screenshotTimeout ?? 2000,
            animations: "disabled",
            fullPage: shouldCaptureFullPage,
          });
        } finally {
          await styleHandle
            ?.evaluate((element) => element.parentNode?.removeChild(element))
            .catch(() => {});
        }
      })();
      await info.attach(`${prefix}:${role}:${label}`, {
        body,
        contentType: "image/jpeg",
      });
    } catch (error) {
      if (options?.swallowErrors === false) {
        throw error;
      }
      // 画面遷移直後などで撮影できないことがある。手順スクショは欠けても続行する。
    }
  };

  const capture = async (
    page: Page,
    label: string,
    locator?: Locator,
    target?: string,
  ): Promise<void> => {
    const info = currentTest;
    if (!info || info.project.name !== projectName) {
      return;
    }
    if (config.shouldCapture !== undefined && !config.shouldCapture(info)) {
      return;
    }
    await captureForTest(info, page, label, locator, target);
  };

  /** newContext の storageState パスから context → ロールを対応付ける。 */
  const patchBrowser = (browser: Browser): void => {
    const proto = Object.getPrototypeOf(browser) as Proto;
    const original = proto.newContext as Browser["newContext"];
    proto.newContext = async function (
      this: Browser,
      options?: Parameters<Browser["newContext"]>[0],
    ) {
      const context = await original.call(this, options);
      const state = options?.storageState;
      if (typeof state === "string") {
        const role = roleByPath.get(path.resolve(state));
        if (role !== undefined) {
          contextRoles.set(context, role);
        }
      }
      return context;
    } as AnyFn;
  };

  const patchPage = (page: Page): void => {
    const proto = Object.getPrototypeOf(page) as Proto;
    const original = proto.goto as Page["goto"];
    proto.goto = async function (this: Page, ...args: Parameters<Page["goto"]>) {
      const result = await original.apply(this, args);
      await capture(this, labels.goto(String(args[0])));
      return result;
    } as AnyFn;
  };

  const locatorActions: Record<string, (t: string, a: unknown[]) => string> = {
    click: (t) => labels.click(t),
    dblclick: (t) => labels.dblclick(t),
    fill: (t, a) => labels.fill(t, String(a[0])),
    selectOption: (t, a) => labels.selectOption(t, formatOption(a[0])),
    check: (t) => labels.check(t),
    uncheck: (t) => labels.uncheck(t),
    setChecked: (t, a) => labels.setChecked(t, a[0] === true),
    press: (t, a) => labels.press(t, String(a[0])),
    setInputFiles: (t) => labels.setInputFiles(t),
  };

  const patchLocator = (locator: Locator): void => {
    const proto = Object.getPrototypeOf(locator) as Proto;
    for (const [method, makeLabel] of Object.entries(locatorActions)) {
      const original = proto[method];
      if (typeof original !== "function") {
        continue;
      }
      proto[method] = async function (this: Locator, ...args: unknown[]) {
        const result = await (original as AnyFn).apply(this, args as never[]);
        const target = describeLocator(String(this));
        await capture(this.page(), makeLabel(target, args), this, target);
        return result;
      } as AnyFn;
    }
  };

  return {
    setCurrentTest(info) {
      currentTest = info;
    },
    /**
     * プロトタイプのフックを一度だけ仕込む（worker プロセスごと）。
     * Page / Locator の実体クラスへは公開 API で辿れないため、使い捨ての
     * context からインスタンスを作ってプロトタイプを得る。
     */
    async install(browser) {
      if (patched) {
        return;
      }
      patched = true;
      const context = await browser.newContext();
      try {
        const page = await context.newPage();
        patchBrowser(browser);
        patchPage(page);
        patchLocator(page.locator("html"));
      } finally {
        await context.close();
      }
    },
    async capturePoint(info, page, label, locator, note) {
      const caption = note.trim() === "" ? label : `${label} — ${note}`;
      await captureForTest(info, page, labels.checkpoint(caption), locator, label, {
        fullPage: false,
        waitForNetworkIdle: false,
        screenshotTimeout: 3000,
        swallowErrors: false,
      });
    },
  };
}

const ROLE_JA: Record<string, string> = {
  button: "ボタン",
  link: "リンク",
  row: "行",
  cell: "セル",
  textbox: "入力欄",
  checkbox: "チェックボックス",
  radio: "ラジオボタン",
  combobox: "選択欄",
  listbox: "選択リスト",
  option: "選択肢",
  dialog: "ダイアログ",
  heading: "見出し",
  tab: "タブ",
  switch: "スイッチ",
  menuitem: "メニュー項目",
};

/**
 * Locator のチェーン文字列から操作対象のラベルを組み立てる（ベストエフォート）。
 * チェーン末尾（= 実際の操作対象）に最も近いマッチを採用する。
 * 例:
 * - getByRole('button', { name: '招待リンクを送信' }) → 「招待リンクを送信」ボタン
 * - locator('div:has(> label:text-is("標準単価"))').locator('input...') → 「標準単価」欄
 */
export function describeLocator(chain: string): string {
  const hits: { index: number; label: string }[] = [];
  for (const m of chain.matchAll(
    /getByRole\('([^']+)'(?:,\s*\{[^}]*name:\s*['"]([^'"]*)['"][^}]*\})?\)/g,
  )) {
    const kind = ROLE_JA[m[1]] ?? m[1];
    hits.push({
      index: m.index ?? 0,
      label: m[2] ? `「${m[2]}」${kind}` : kind,
    });
  }
  for (const m of chain.matchAll(/getBy(?:Label|Placeholder)\('([^']+)'\)/g)) {
    hits.push({ index: m.index ?? 0, label: `「${m[1]}」欄` });
  }
  for (const m of chain.matchAll(/getByText\('([^']+)'\)/g)) {
    hits.push({ index: m.index ?? 0, label: `「${m[1]}」` });
  }
  for (const m of chain.matchAll(/text-is\("([^"]+)"\)/g)) {
    hits.push({ index: m.index ?? 0, label: `「${m[1]}」欄` });
  }
  if (hits.length === 0) {
    return short(chain, 60);
  }
  hits.sort((a, b) => a.index - b.index);
  return hits[hits.length - 1].label;
}

function formatOption(v: unknown): string {
  if (typeof v === "string") {
    return v;
  }
  if (Array.isArray(v)) {
    return v.map(formatOption).join(", ");
  }
  if (v && typeof v === "object") {
    const o = v as { label?: string; value?: string };
    return o.label ?? o.value ?? JSON.stringify(v);
  }
  return String(v);
}

function short(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max)}…` : s;
}
