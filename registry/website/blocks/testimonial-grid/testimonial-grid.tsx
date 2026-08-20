import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import {
  Section,
  SectionContent,
  SectionDescription,
  SectionEyebrow,
  SectionHeader,
  SectionTitle,
} from "@/registry/website/ui/section"

const testimonials = [
  {
    quote:
      "作りかけのランディングページ3本を、ひとつの仕組みに置き換えました。次のキャンペーンページは、スプリントではなく1時間で終わりました。",
    name: "田中 美香",
    role: "Northwind グロース責任者",
    initials: "田中",
  },
  {
    quote:
      "余白と文字サイズが決まっているので、レビューが余白の議論ではなく、伝えたいことの議論になりました。",
    name: "佐藤 大輔",
    role: "Cobalt デザインリード",
    initials: "佐藤",
  },
  {
    quote:
      "色をハードコードしていないので、ダークモードが一発で動きました。それだけで移行のコストは回収できています。",
    name: "中村 遥",
    role: "Loop ソフトウェアエンジニア",
    initials: "中村",
  },
]

export function TestimonialGrid() {
  return (
    <Section id="testimonials" size="lg">
      <SectionHeader align="center">
        <SectionEyebrow>導入事例</SectionEyebrow>
        <SectionTitle>同じページを作り直すのをやめたチーム</SectionTitle>
        <SectionDescription>
          一貫した仕組みの効果は、2ページ目から効いてきます。
        </SectionDescription>
      </SectionHeader>
      <SectionContent className="grid gap-4 lg:grid-cols-3">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.name} className="justify-between p-6">
            <CardContent className="p-0">
              <blockquote className="text-base leading-[1.9] text-pretty">
                「{testimonial.quote}」
              </blockquote>
            </CardContent>
            <div className="mt-6 flex items-center gap-3">
              <Avatar className="size-9">
                <AvatarFallback className="text-xs">
                  {testimonial.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{testimonial.name}</span>
                <span className="text-xs text-muted-foreground">
                  {testimonial.role}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </SectionContent>
    </Section>
  )
}
