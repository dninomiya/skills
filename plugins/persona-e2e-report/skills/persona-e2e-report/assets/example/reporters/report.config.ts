import type { ReportConfig } from "./report-kit";

/**
 * 経費精算アプリを題材にした設定サンプル。
 *
 * ペルソナ id とテストタイトルを定数にまとめておくと、spec 側と設定側で
 * 文字列がずれない（レポートはタイトルの完全一致で結果を引き当てるため、
 * ここがずれると「未実行」のまま表に出る）。
 */
const PERSONA = {
  applicant: "sato",
  approver: "tanaka",
} as const;

const TITLES = {
  submit: "申請者が金額を入力して経費を申請できる",
  approve: "承認者が申請を承認できる",
} as const;

export const reportConfig: ReportConfig = {
  title: "経費精算 ペルソナ別動作ステータス",
  subtitle: "人物ごとの操作結果と権限境界を確認するレポート",
  outputFile: "report/index.html",
  // playwright.config.ts の rootDir からの相対パス。読めなければ下のテキストを出す。
  logoPath: ["../web/public/logo.svg"],
  logoFallbackText: "経費精算",
  attachmentPrefix: "step",
  defaultPersonaId: PERSONA.applicant,
  personas: [
    {
      id: PERSONA.applicant,
      name: "佐藤 健太",
      headline: "月末に交通費をまとめて申請する営業担当",
      label: "申請者",
      badges: [{ label: "営業部: 一般", axis: "team" }],
    },
    {
      id: PERSONA.approver,
      name: "田中 美咲",
      headline: "部下の申請を承認する営業部長",
      label: "承認者",
      badges: [{ label: "営業部: 部長", axis: "team" }],
      alwaysVisible: true,
    },
  ],
  matrix: {
    subtitle: "操作・権限観点 × 2ペルソナ",
    rows: [
      {
        id: "submit",
        label: "経費を申請できる",
        summary: "金額を入力して申請でき、結果が画面に残ること",
        titles: {
          [PERSONA.applicant]: [TITLES.submit],
          [PERSONA.approver]: [],
        },
      },
      {
        id: "approve",
        label: "申請を承認できる",
        summary: "承認権限を持つ人だけが承認操作を実行できること",
        titles: {
          [PERSONA.applicant]: [],
          [PERSONA.approver]: [TITLES.approve],
        },
      },
    ],
  },
  journeys: {
    "applicant-day": {
      title: "申請者の1日",
      summary: "経費を入力して申請するまで",
      persona: PERSONA.applicant,
      plannedTitles: [TITLES.submit],
      evidence: {
        [TITLES.submit]: ["入力した金額がそのまま申請結果に反映されること"],
      },
    },
    "approver-day": {
      title: "承認者の1日",
      summary: "部下の申請を確認して承認するまで",
      persona: PERSONA.approver,
      plannedTitles: [TITLES.approve],
    },
  },
  roles: {
    applicant: { label: "申請者", personaId: PERSONA.applicant },
    approver: { label: "承認者", personaId: PERSONA.approver },
  },
  avatar: { enabled: false },
  titleBadge: (title) => {
    const hit = title.match(/^(TC-[0-9.]+):\s*(.*)$/);
    return hit === null ? null : { badge: hit[1], rest: hit[2] };
  },
};
