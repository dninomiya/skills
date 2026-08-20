import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Section,
  SectionActions,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/registry/website/ui/section"

export function CtaBand() {
  return (
    <Section size="lg" tone="accent">
      <SectionHeader align="center">
        <SectionTitle>次のページを公開する準備はできましたか？</SectionTitle>
        <SectionDescription>
          レジストリを入れて、ページを組み立てて、今日のうちに公開する。
        </SectionDescription>
        <SectionActions className="mt-4">
          <Button
            nativeButton={false}
            variant="secondary"
            render={<Link href="/signup" />}
          >
            無料で始める
          </Button>
          <Button
            nativeButton={false}
            variant="outline"
            className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground dark:bg-transparent"
            render={<Link href="/contact" />}
          >
            相談する
          </Button>
        </SectionActions>
      </SectionHeader>
    </Section>
  )
}
