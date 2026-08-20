import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Placeholder } from "@/registry/website/ui/placeholder"
import {
  Section,
  SectionActions,
  SectionContent,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/registry/website/ui/section"

export function HeroCentered() {
  return (
    <Section size="lg" className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(60%_100%_at_50%_0%,color-mix(in_oklch,var(--color-primary)_10%,transparent),transparent)]"
      />
      <SectionHeader align="center" className="max-w-3xl">
        <Link
          href="#changelog"
          className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground ring-1 ring-foreground/10 transition-colors hover:text-foreground"
        >
          <span className="size-1.5 rounded-full bg-primary" />
          v2.0 をリリースしました
          <ArrowRightIcon className="size-3.5" />
        </Link>
        <SectionTitle
          as="h1"
          className="text-4xl sm:text-5xl lg:text-6xl lg:leading-[1.15]"
        >
          洗練されたサイトを、半日で公開する
        </SectionTitle>
        <SectionDescription className="text-lg sm:text-xl">
          組み合わせられるセクション、一貫した余白、ずれないデザイントークン。公開に必要なものは揃っていて、後から作り直す必要はありません。
        </SectionDescription>
        <SectionActions className="mt-2">
          <Button nativeButton={false} render={<Link href="/signup" />}>
            無料で始める
          </Button>
          <Button
            nativeButton={false}
            variant="outline"
            render={<Link href="/demo" />}
          >
            デモを見る
          </Button>
        </SectionActions>
      </SectionHeader>
      <SectionContent>
        <Placeholder ratio="wide" label="プロダクト画面" />
      </SectionContent>
    </Section>
  )
}
