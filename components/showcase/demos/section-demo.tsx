import { Button } from "@/components/ui/button"
import { Placeholder } from "@/registry/website/ui/placeholder"
import {
  Section,
  SectionActions,
  SectionContent,
  SectionDescription,
  SectionEyebrow,
  SectionHeader,
  SectionTitle,
} from "@/registry/website/ui/section"

export function SectionDemo() {
  return (
    <div className="flex flex-col">
      <Section size="md">
        <SectionHeader>
          <SectionEyebrow>アイブロウ</SectionEyebrow>
          <SectionTitle>左揃えのセクションヘッダー</SectionTitle>
          <SectionDescription>
            既定の配置です。見出し、説明、アクションが同じ余白スケールを共有するので、セクションを重ねても崩れません。
          </SectionDescription>
          <SectionActions>
            <Button>主要なアクション</Button>
            <Button variant="outline">副次的なアクション</Button>
          </SectionActions>
        </SectionHeader>
        <SectionContent>
          <Placeholder ratio="ultrawide" label="セクションの中身" />
        </SectionContent>
      </Section>
      <Section size="md" tone="muted" bordered>
        <SectionHeader align="center">
          <SectionEyebrow>tone=&quot;muted&quot;</SectionEyebrow>
          <SectionTitle>中央揃え + 背景を落としたセクション</SectionTitle>
          <SectionDescription>
            トーンを交互に置くと、区切り線を足さなくても長いページにリズムが生まれます。
          </SectionDescription>
        </SectionHeader>
      </Section>
      <Section size="sm" tone="accent">
        <SectionHeader align="center">
          <SectionTitle className="text-2xl sm:text-3xl">
            締めくくりには tone=&quot;accent&quot;
          </SectionTitle>
          <SectionDescription>前景色は自動で反転します。</SectionDescription>
        </SectionHeader>
      </Section>
    </div>
  )
}
