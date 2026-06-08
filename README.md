# evidence-record

ブラウザ操作のエビデンス動画を撮る [Claude Code](https://claude.com/claude-code) スキル。

指示した操作を [`playwright-cli`](https://www.npmjs.com/package/@playwright/cli) の `page.screencast` で録画し、**ステップタイトル付き・疑似カーソル/クリック強調つき**の動画にします。出力（スクリプトと動画）は `~/Downloads/evidence-record-<timestamp>/` にまとめて置くので、リポジトリに誤ってコミットされません。

## 導入

```bash
# プロジェクト単位で導入
npx skills add dninomiya/evidence-record

# 全エージェント・グローバルに導入
npx skills add dninomiya/evidence-record --global --all
```

インストールせずに使う場合:

```bash
npx skills use dninomiya/evidence-record@evidence-record
```

## 前提

- [`playwright-cli`](https://www.npmjs.com/package/@playwright/cli) … 録画に必須。無ければ `npm install -g @playwright/cli@latest`。
- `ffmpeg` … webm → mp4 変換に使用。無ければ webm のみ出力。

## 使い方

Claude Code で次のように起動します。

```
/evidence-record <録画したい操作の自由記述>
```

例:

```
/evidence-record ログインしてダッシュボードで新規プロジェクトを作成する様子を撮って
```

スキルは操作を「セットアップ（録画しない前準備）」と「録画するテストステップ」に仕分け、ステップ一覧を提示してから録画します。

## テストに関係ないフローを動画に含めない

ログイン・Cookie 同意・初期ナビなど、テスト本体に関係ない前準備は **録画開始前に実行**するため動画には映りません。`page.screencast` に pause/resume は無いので、映したくない操作は `screencast.start()` の前に `setup()` で済ませる方式を採っています（操作自体は実行されるのでアプリは正しい状態になります）。

## 構成

```
evidence-record/
├── SKILL.md                      # スキル本体（手順・規約）
└── scripts/
    ├── recorder-helpers.md       # 生成スクリプトに inline する正典ヘルパー
    └── example-evidence.mjs      # 生成結果の完成例（TodoMVC 題材）
```

## ライセンス

MIT
