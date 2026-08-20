import type { Registry, RegistryItem } from "./schema"

/**
 * Public URL the built registry is served from.
 * Set `NEXT_PUBLIC_REGISTRY_URL` before running `pnpm registry:build` so that
 * cross-item `registryDependencies` resolve for consumers.
 */
export const REGISTRY_URL =
  process.env.NEXT_PUBLIC_REGISTRY_URL ?? "http://localhost:3000"

export const REGISTRY_NAME = "website"

/** Reference another item of this registry by name. */
function self(name: string) {
  return `${REGISTRY_URL}/r/${name}.json`
}

function ui(
  name: string,
  title: string,
  description: string,
  extra: Partial<RegistryItem> = {}
): RegistryItem {
  return {
    name,
    type: "registry:ui",
    title,
    description,
    files: [
      {
        path: `registry/website/ui/${name}.tsx`,
        type: "registry:ui",
        target: `components/ui/${name}.tsx`,
      },
    ],
    categories: ["website", "primitive"],
    meta: { group: "primitive", preview: "inline" },
    ...extra,
  }
}

function block(
  name: string,
  title: string,
  description: string,
  extra: Partial<RegistryItem> = {}
): RegistryItem {
  return {
    name,
    type: "registry:block",
    title,
    description,
    files: [
      {
        path: `registry/website/blocks/${name}/${name}.tsx`,
        type: "registry:component",
        target: `components/blocks/${name}/${name}.tsx`,
      },
    ],
    categories: ["website"],
    meta: { group: "block", preview: "iframe", height: 600 },
    ...extra,
  }
}

const items: RegistryItem[] = [
  /* ---------------------------------------------------------------- theme */
  {
    name: "website-theme",
    type: "registry:theme",
    title: "ウェブサイトテーマ",
    description:
      "マーケティングページ向けにトークンを調整したテーマ。アクセントは 1 色、ニュートラルは落ち着いた色味、角丸はやや大きめ。日本語向けのフォントスタックも含みます。",
    categories: ["website", "theme"],
    meta: { group: "theme", preview: "none" },
    docs: [
      "Noto Sans JP を next/font で読み込み、<html> に variable を渡してください。",
      "",
      'import { Noto_Sans_JP } from "next/font/google"',
      "",
      "const notoSansJP = Noto_Sans_JP({",
      '  variable: "--font-noto-sans-jp",',
      '  subsets: ["latin"],',
      '  display: "swap",',
      "  // 日本語グリフは大きいので preload しない",
      "  preload: false,",
      "})",
      "",
      '<html lang="ja" className={notoSansJP.variable}>',
    ].join("\n"),
    css: {
      "@layer base": {
        "p, li, dd, dt, blockquote, figcaption, label": {
          // Japanese lines break at phrase boundaries where supported.
          "word-break": "auto-phrase",
        },
      },
    },
    cssVars: {
      theme: {
        "--radius": "0.75rem",
        "--font-sans":
          '"Noto Sans JP", "Noto Sans JP Fallback", ui-sans-serif, system-ui, "Hiragino Sans", "Yu Gothic UI", sans-serif',
        "--font-mono":
          '"Geist Mono", "Geist Mono Fallback", ui-monospace, SFMono-Regular, monospace',
      },
      light: {
        "--background": "oklch(1 0 0)",
        "--foreground": "oklch(0.17 0.01 258)",
        "--muted": "oklch(0.97 0.005 258)",
        "--muted-foreground": "oklch(0.52 0.015 258)",
        "--card": "oklch(1 0 0)",
        "--card-foreground": "oklch(0.17 0.01 258)",
        "--primary": "oklch(0.55 0.19 258)",
        "--primary-foreground": "oklch(0.99 0 0)",
        "--secondary": "oklch(0.97 0.005 258)",
        "--secondary-foreground": "oklch(0.24 0.015 258)",
        "--accent": "oklch(0.96 0.015 258)",
        "--accent-foreground": "oklch(0.31 0.04 258)",
        "--border": "oklch(0.92 0.005 258)",
        "--input": "oklch(0.92 0.005 258)",
        "--ring": "oklch(0.55 0.19 258)",
      },
      dark: {
        "--background": "oklch(0.16 0.01 258)",
        "--foreground": "oklch(0.97 0.005 258)",
        "--muted": "oklch(0.24 0.015 258)",
        "--muted-foreground": "oklch(0.72 0.015 258)",
        "--card": "oklch(0.2 0.012 258)",
        "--card-foreground": "oklch(0.97 0.005 258)",
        "--primary": "oklch(0.68 0.16 258)",
        "--primary-foreground": "oklch(0.17 0.02 258)",
        "--secondary": "oklch(0.26 0.015 258)",
        "--secondary-foreground": "oklch(0.97 0.005 258)",
        "--accent": "oklch(0.28 0.02 258)",
        "--accent-foreground": "oklch(0.95 0.01 258)",
        "--border": "oklch(1 0 0 / 12%)",
        "--input": "oklch(1 0 0 / 16%)",
        "--ring": "oklch(0.68 0.16 258)",
      },
    },
  },

  /* ----------------------------------------------------------- primitives */
  ui(
    "container",
    "コンテナ",
    "すべてのセクションが共有する、最大幅と左右余白のラッパー。",
    {
      dependencies: ["class-variance-authority"],
      meta: { group: "primitive", preview: "inline", component: "Container" },
    }
  ),
  ui(
    "section",
    "セクション",
    "セクションの縦リズム・トーン・見出し階層。日本語のタイポグラフィ設定を含む、すべてのブロックの土台です。",
    {
      dependencies: ["class-variance-authority"],
      registryDependencies: [self("container")],
      meta: { group: "primitive", preview: "inline", component: "Section" },
    }
  ),
  ui(
    "placeholder",
    "プレースホルダー",
    "画像の差し込み位置をアスペクト比つきで確保します。実素材に差し替えてもレイアウトがずれません。",
    {
      dependencies: ["class-variance-authority"],
      meta: { group: "primitive", preview: "inline", component: "Placeholder" },
    }
  ),

  /* --------------------------------------------------------------- blocks */
  block(
    "site-header",
    "サイトヘッダー",
    "主要ナビゲーション、ログイン導線、モバイル用シートメニューを備えた固定ヘッダー。",
    {
      dependencies: ["lucide-react"],
      registryDependencies: ["button", "sheet", self("container")],
      meta: {
        group: "block",
        preview: "iframe",
        height: 420,
        component: "SiteHeader",
      },
    }
  ),
  block(
    "hero-centered",
    "ヒーロー（中央揃え）",
    "お知らせバッジ、2 つの CTA、プロダクト画面の枠を備えた中央揃えのヒーロー。",
    {
      dependencies: ["lucide-react"],
      registryDependencies: ["button", self("section"), self("placeholder")],
      meta: {
        group: "block",
        preview: "iframe",
        height: 860,
        component: "HeroCentered",
      },
    }
  ),
  block(
    "hero-split",
    "ヒーロー（左右分割）",
    "価値提案と裏づけを、ビジュアルと並べて見せる 2 カラムのヒーロー。",
    {
      dependencies: ["lucide-react"],
      registryDependencies: ["button", self("section"), self("placeholder")],
      meta: {
        group: "block",
        preview: "iframe",
        height: 760,
        component: "HeroSplit",
      },
    }
  ),
  block(
    "logo-cloud",
    "ロゴクラウド",
    "ヒーローの直下に置く、控えめな導入実績の帯。",
    {
      registryDependencies: [self("section")],
      meta: {
        group: "block",
        preview: "iframe",
        height: 320,
        component: "LogoCloud",
      },
    }
  ),
  block(
    "feature-grid",
    "機能グリッド",
    "アイコン付きの機能カード 3 列。1〜6 項目まで、作り直さずに増減できます。",
    {
      dependencies: ["lucide-react"],
      registryDependencies: ["card", self("section")],
      meta: {
        group: "block",
        preview: "iframe",
        height: 900,
        component: "FeatureGrid",
      },
    }
  ),
  block(
    "feature-alternating",
    "機能（交互レイアウト）",
    "テキストとビジュアルを左右交互に並べ、2〜3 個の機能を掘り下げます。",
    {
      dependencies: ["lucide-react"],
      registryDependencies: ["button", self("section"), self("placeholder")],
      meta: {
        group: "block",
        preview: "iframe",
        height: 1100,
        component: "FeatureAlternating",
      },
    }
  ),
  block(
    "stats-band",
    "指標バンド",
    "アクセント色の全幅バンドに、等幅数字で 4 つの指標を並べます。",
    {
      registryDependencies: [self("section")],
      meta: {
        group: "block",
        preview: "iframe",
        height: 480,
        component: "StatsBand",
      },
    }
  ),
  block(
    "testimonial-grid",
    "お客様の声",
    "アバター付きの引用カード 3 枚。文量が違っても高さが揃います。",
    {
      registryDependencies: ["avatar", "card", self("section")],
      meta: {
        group: "block",
        preview: "iframe",
        height: 760,
        component: "TestimonialGrid",
      },
    }
  ),
  block(
    "pricing-tiers",
    "料金プラン",
    "おすすめプランを強調した 3 段階の料金表。プランごとの機能一覧つき。",
    {
      dependencies: ["lucide-react"],
      registryDependencies: ["badge", "button", "card", self("section")],
      meta: {
        group: "block",
        preview: "iframe",
        height: 1000,
        component: "PricingTiers",
      },
    }
  ),
  block(
    "faq-accordion",
    "FAQ アコーディオン",
    "1 つずつ開くアコーディオン。長い回答も読みやすい幅に収めています。",
    {
      registryDependencies: ["accordion", self("section")],
      meta: {
        group: "block",
        preview: "iframe",
        height: 760,
        component: "FaqAccordion",
      },
    }
  ),
  block(
    "cta-band",
    "CTA バンド",
    "ページを締めくくる、主要な導線だけを置いたアクセントバンド。",
    {
      registryDependencies: ["button", self("section")],
      meta: {
        group: "block",
        preview: "iframe",
        height: 420,
        component: "CtaBand",
      },
    }
  ),
  block(
    "contact-form",
    "お問い合わせフォーム",
    "ラベル付きでアクセシブルな 2 カラムのお問い合わせセクション。Server Action にすぐ接続できます。",
    {
      registryDependencies: [
        "button",
        "input",
        "label",
        "textarea",
        self("section"),
      ],
      meta: {
        group: "block",
        preview: "iframe",
        height: 760,
        component: "ContactForm",
      },
    }
  ),
  block(
    "site-footer",
    "サイトフッター",
    "リンクグループ、ブランド説明、規約リンクを備えた 4 カラムのフッター。",
    {
      registryDependencies: [self("container")],
      meta: {
        group: "block",
        preview: "iframe",
        height: 560,
        component: "SiteFooter",
      },
    }
  ),

  /* ----------------------------------------------------------------- page */
  {
    name: "landing-page",
    type: "registry:block",
    title: "ランディングページ",
    description:
      "ヘッダーからフッターまでの完成構成（ヒーロー・実績・機能・料金・FAQ・CTA）。既存のトップページと衝突しないよう /landing に入るので、内容が固まったら好きな場所へ移してください。",
    categories: ["website", "page"],
    files: [
      {
        path: "registry/website/blocks/landing-page/page.tsx",
        type: "registry:page",
        target: "app/(marketing)/landing/page.tsx",
      },
    ],
    registryDependencies: [
      self("site-header"),
      self("hero-centered"),
      self("logo-cloud"),
      self("feature-grid"),
      self("feature-alternating"),
      self("stats-band"),
      self("testimonial-grid"),
      self("pricing-tiers"),
      self("faq-accordion"),
      self("cta-band"),
      self("site-footer"),
    ],
    meta: { group: "page", preview: "iframe", height: 900 },
  },
]

export const registry: Registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: REGISTRY_NAME,
  homepage: REGISTRY_URL,
  items,
}

export const registryItems = items

export function getRegistryItem(name: string) {
  return items.find((item) => item.name === name)
}

export function getItemsByGroup(
  group: NonNullable<RegistryItem["meta"]>["group"]
) {
  return items.filter((item) => item.meta?.group === group)
}
