import {
  GaugeIcon,
  LayersIcon,
  LockIcon,
  PaletteIcon,
  PlugIcon,
  SparklesIcon,
} from "lucide-react"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Section,
  SectionContent,
  SectionDescription,
  SectionEyebrow,
  SectionHeader,
  SectionTitle,
} from "@/registry/website/ui/section"

const features = [
  {
    icon: LayersIcon,
    title: "組み合わせられるセクション",
    description:
      "すべてのブロックが同じ余白スケールを共有します。ページが増えても見た目が揃ったままです。",
  },
  {
    icon: PaletteIcon,
    title: "トークン駆動のテーマ",
    description:
      "色・角丸・書体は CSS 変数から。マークアップを触らずにブランドを差し替えられます。",
  },
  {
    icon: GaugeIcon,
    title: "初期表示が速い",
    description:
      "サーバーコンポーネント前提。静的なセクションにクライアント JS はなく、レイアウトのずれも起きません。",
  },
  {
    icon: LockIcon,
    title: "アクセシビリティを内蔵",
    description:
      "フォーカス、ランドマーク、コントラスト比は、文言を書き始める前から担保されています。",
  },
  {
    icon: PlugIcon,
    title: "コマンド一つで導入",
    description:
      "shadcn CLI でインストール。ソースは自分のリポジトリに入り、そのまま編集できます。",
  },
  {
    icon: SparklesIcon,
    title: "編集しやすい構造",
    description:
      "文言はファイル冒頭の配列にまとまっています。デザインを崩さずに差し替えられます。",
  },
]

export function FeatureGrid() {
  return (
    <Section id="features" size="lg">
      <SectionHeader align="center">
        <SectionEyebrow>機能</SectionEyebrow>
        <SectionTitle>
          マーケティングサイトに必要なものが揃っています
        </SectionTitle>
        <SectionDescription>
          決めるべきところは決め打ちで、変えたいところは自由に。
        </SectionDescription>
      </SectionHeader>
      <SectionContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className="p-6 [--card-spacing:--spacing(3)]"
          >
            <CardHeader className="p-0">
              <feature.icon className="size-5 text-primary" />
              <CardTitle className="mt-4 text-base font-semibold">
                {feature.title}
              </CardTitle>
              <CardDescription className="mt-1.5 leading-[1.8]">
                {feature.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </SectionContent>
    </Section>
  )
}
