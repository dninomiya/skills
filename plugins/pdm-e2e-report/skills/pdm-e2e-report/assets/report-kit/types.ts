/**
 * report-kit の設定型。
 *
 * レポートの見た目・集計ロジックはこのパッケージが持ち、
 * 「誰が（ペルソナ）」「何を確認できるか（観点）」「どの spec が何の体験か（ジャーニー）」
 * というプロダクト固有の知識はすべてこの設定として外から渡す。
 */

/** ペルソナカードに並べる属性チップ（所属チーム・ワークスペース・契約形態など）。 */
export type PersonaBadge = {
  readonly label: string;
  /** チップの色分けに使う軸名。既定のスタイルは "team" / "workspace" を持つ。 */
  readonly axis?: string;
};

/**
 * レポートの縦串になる人物。左カラムのタブ 1 枚 = ペルソナ 1 人。
 *
 * 「ロール」ではなく「人物」を単位にするのは、同じ人が文脈によって別ロールを持つ
 * （チーム A ではオーナー、チーム B ではメンバー）ケースを 1 枚のタブで語るため。
 */
export type Persona = {
  readonly id: string;
  /** 表示名（例: "相馬 悠真"）。 */
  readonly name: string;
  /** 一言で何をする人かの説明（例: "受託案件全体の稼働と粗利を見る事業責任者"）。 */
  readonly headline: string;
  /** マトリクス列で名前の下に出る短いラベル（例: "WSオーナー"）。省略時は headline。 */
  readonly label?: string;
  readonly badges?: readonly PersonaBadge[];
  /** アバター画像の seed。省略時は id を使う。 */
  readonly avatarSeed?: string;
  /** 対象テストが 1 件も無い実行でもタブを出す（未実行であることを見せたい人物）。 */
  readonly alwaysVisible?: boolean;
  /**
   * 複数ロールを横断する束（「4 ロール共通」など人物ではないタブ）。
   * true にすると各テスト行に、操作したロールのアバターを並べる。
   */
  readonly crossPersona?: boolean;
};

/**
 * マトリクスの 1 行 = ひとつの操作・権限観点。
 *
 * `titles` がこの観点を担保するテストタイトルで、ペルソナごとに異なる。
 * タイトルは spec のテスト名と完全一致させる（レポートはタイトルで突き合わせる）。
 */
export type MatrixRow = {
  readonly id: string;
  readonly label: string;
  readonly summary: string;
  readonly titles:
    | Readonly<Record<string, readonly string[]>>
    | ((personaId: string) => readonly string[]);
};

/** spec ファイル 1 本 = ひとつの体験。キーは spec のベース名（`uj01-ws-owner-day` 等）。 */
export type Journey = {
  readonly title: string;
  readonly summary?: string;
  /** 前提条件など、テスト一覧の前に出す補足。 */
  readonly context?: readonly string[];
  /** この spec 全体が属するペルソナ。 */
  readonly persona?: string;
  /**
   * テスト単位でペルソナへ振り分ける（1 spec で複数人物を横断する場合）。
   * 指定した spec は、ここに現れるすべてのペルソナのタブに出る。
   */
  readonly personaByTitle?: Readonly<Record<string, string>>;
  /** 未実行時に「本来ここで確認する項目」として並べるテストタイトル。 */
  readonly plannedTitles?: readonly string[];
  /** テストタイトル → その確認で見ている観点の説明。 */
  readonly evidence?: Readonly<Record<string, readonly string[]>>;
};

/** storageState などから引いたロールキーの表示定義。 */
export type RoleDef = {
  readonly label: string;
  /** このロールで操作したとき、どの人物として見せるか。 */
  readonly personaId?: string;
};

/** キャプション整形フックに渡す文脈。 */
export type CaptionContext = {
  readonly journeyKey: string;
  readonly testTitle: string;
  /** 操作したロールキー（storageState 由来）。不明なら空文字。 */
  readonly role: string;
  /** 手順スクショなら 1 始まりの連番、最終画面なら null。 */
  readonly step: number | null;
  /** step-screenshots が付けた生ラベル（例: "クリック: 「保存」ボタン"）。 */
  readonly text: string;
};

export type ReportConfig = {
  /** ヘッダの見出し。 */
  readonly title: string;
  /** 見出しの下に出る 1 行説明。 */
  readonly subtitle: string;
  /** ヘッダ右のピル表記。既定 "E2E レポート"。 */
  readonly kindLabel?: string;
  /** 出力先（playwright.config.ts の rootDir からの相対）。既定 "pdm-report/index.html"。 */
  readonly outputFile?: string;
  /** 実行日時の表記に使う。既定 "ja-JP" / "Asia/Tokyo"。 */
  readonly locale?: string;
  readonly timeZone?: string;
  /**
   * ヘッダに埋め込むロゴ SVG のパス（rootDir からの相対、または絶対）。
   * 複数指定すると最初に見つかったものを使う。読めなければ `logoFallbackText` を出す。
   */
  readonly logoPath?: string | readonly string[];
  readonly logoFallbackText?: string;
  /** 集計対象の Playwright プロジェクト名。既定 report="journeys" / setup="setup"。 */
  readonly projects?: {
    readonly report?: string;
    readonly setup?: string;
  };
  /**
   * 手順スクショ attachment の名前プレフィックス。既定 "step"。
   * step-screenshots 側の設定と必ず揃える。
   */
  readonly attachmentPrefix?: string;
  /** 「既知の不具合として対象外にする」理由を載せる attachment 名。既定 "known-issue"。 */
  readonly knownIssueAttachment?: string;
  /** 左カラムに並べる順で書く。 */
  readonly personas: readonly Persona[];
  /** どのペルソナにも紐づかない spec の受け皿。 */
  readonly defaultPersonaId: string;
  readonly matrix?: {
    /** マトリクスの列に出すペルソナ（省略時は personas 全件）。 */
    readonly personaIds?: readonly string[];
    readonly rows: readonly MatrixRow[];
    /** 左カラムのマトリクスタブに出す補助ラベル。既定 "操作・権限観点 × ペルソナ"。 */
    readonly subtitle?: string;
    /** マトリクスパネル冒頭の説明文。 */
    readonly description?: string;
  };
  readonly journeys: Readonly<Record<string, Journey>>;
  readonly roles?: Readonly<Record<string, RoleDef>>;
  readonly avatar?: {
    /** false にするとアバターを一切描かない（オフライン専用にしたいとき）。 */
    readonly enabled?: boolean;
    /** dicebear のスタイル名。既定 "open-peeps"。 */
    readonly style?: string;
  };
  /**
   * 手順スクショのキャプションを読み手向けに言い換える。
   * null を返すと生ラベルをそのまま使う。
   */
  readonly caption?: (context: CaptionContext) => string | null;
  /**
   * テストタイトル先頭の識別子（"TC-1.2:" など）をバッジへ切り出す。
   * null を返すとタイトル全体をそのまま見出しにする。
   */
  readonly titleBadge?: (
    title: string,
  ) => { readonly badge: string; readonly rest: string } | null;
};

export type ReporterOptions = {
  /** 設定の outputFile より優先する。 */
  readonly outputFile?: string;
};
