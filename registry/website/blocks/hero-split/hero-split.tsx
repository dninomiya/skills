import Link from "next/link"
import { CheckIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Placeholder } from "@/registry/website/ui/placeholder"
import {
  Section,
  SectionActions,
  SectionDescription,
  SectionEyebrow,
  SectionHeader,
  SectionTitle,
} from "@/registry/website/ui/section"

const highlights = [
  "クレジットカード不要",
  "SOC 2 Type II 準拠",
  "1時間以内に移行完了",
]

export function HeroSplit() {
  return (
    <Section size="lg" width="xl">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <SectionHeader className="max-w-xl">
          <SectionEyebrow>プラットフォーム</SectionEyebrow>
          <SectionTitle as="h1" className="text-4xl sm:text-5xl">
            サイト制作に足りなかったデザインシステム
          </SectionTitle>
          <SectionDescription>
            すべてのブロックが同じトークンと余白スケールでできているので、新しいページもデザインレビューなしで形になります。
          </SectionDescription>
          <ul className="mt-2 flex flex-col gap-2">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm">
                <CheckIcon className="size-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
          <SectionActions className="mt-2">
            <Button nativeButton={false} render={<Link href="/signup" />}>
              使ってみる
            </Button>
            <Button
              nativeButton={false}
              variant="outline"
              render={<Link href="/docs" />}
            >
              ドキュメントを読む
            </Button>
          </SectionActions>
        </SectionHeader>
        <Placeholder
          ratio="square"
          label="プロダクトビジュアル"
          className="lg:ml-auto"
        />
      </div>
    </Section>
  )
}
