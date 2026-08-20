import Link from "next/link"
import { ArrowRightIcon, CheckIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Placeholder } from "@/registry/website/ui/placeholder"
import {
  Section,
  SectionDescription,
  SectionEyebrow,
  SectionTitle,
} from "@/registry/website/ui/section"

const rows = [
  {
    eyebrow: "進め方",
    title: "白紙の状態から、公開できる状態まで",
    description:
      "まずランディングページ一式を入れて、要らないセクションを削るだけ。リズムも幅も階層も、最初から揃っています。",
    bullets: ["ページ構成のテンプレート", "崩れない縦のリズム"],
    href: "/docs/workflow",
  },
  {
    eyebrow: "一貫性",
    title: "ひとつのトークンで、すべての面を",
    description:
      "ライトとダークは同じ変数から導かれます。コントラストを後から調整し直す必要はありません。",
    bullets: ["ダークモードに自動対応", "色のハードコードなし"],
    href: "/docs/theming",
  },
]

export function FeatureAlternating() {
  return (
    <Section size="lg" width="xl" tone="muted" bordered>
      <div className="flex flex-col gap-20 lg:gap-28">
        {rows.map((row, index) => (
          <div
            key={row.title}
            className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
          >
            <div
              className={cn(
                "flex max-w-xl flex-col gap-4",
                index % 2 === 1 && "lg:order-2 lg:ml-auto"
              )}
            >
              <SectionEyebrow>{row.eyebrow}</SectionEyebrow>
              <SectionTitle className="text-2xl sm:text-3xl">
                {row.title}
              </SectionTitle>
              <SectionDescription>{row.description}</SectionDescription>
              <ul className="mt-1 flex flex-col gap-2">
                {row.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-center gap-2.5 text-sm"
                  >
                    <CheckIcon className="size-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{bullet}</span>
                  </li>
                ))}
              </ul>
              <Button
                nativeButton={false}
                variant="link"
                size="sm"
                className="mt-2 h-auto self-start px-0"
                render={<Link href={row.href} />}
              >
                詳しく見る
                <ArrowRightIcon />
              </Button>
            </div>
            <Placeholder
              ratio="video"
              label="機能のビジュアル"
              className={cn(index % 2 === 1 && "lg:order-1")}
            />
          </div>
        ))}
      </div>
    </Section>
  )
}
