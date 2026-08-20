import Link from "next/link"
import { CheckIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  Section,
  SectionContent,
  SectionDescription,
  SectionEyebrow,
  SectionHeader,
  SectionTitle,
} from "@/registry/website/ui/section"

const tiers = [
  {
    name: "スターター",
    price: "¥0",
    cadence: "ずっと無料",
    description: "個人開発や試作のために。",
    features: ["プロジェクト 1 つ", "コミュニティサポート", "レジストリの利用"],
    cta: "無料で始める",
    href: "/signup",
    featured: false,
  },
  {
    name: "チーム",
    price: "¥3,800",
    cadence: "1ユーザー / 月",
    description: "本番環境で運用するチームのために。",
    features: [
      "プロジェクト無制限",
      "プライベートレジストリ",
      "優先サポート",
      "デザインレビュー",
    ],
    cta: "無料トライアル",
    href: "/signup?plan=team",
    featured: true,
  },
  {
    name: "エンタープライズ",
    price: "個別見積",
    cadence: "年間契約",
    description: "統制要件のある組織のために。",
    features: ["SSO・SCIM", "監査ログ", "専任サポート", "SLA"],
    cta: "相談する",
    href: "/contact",
    featured: false,
  },
]

export function PricingTiers() {
  return (
    <Section id="pricing" size="lg" tone="muted" bordered>
      <SectionHeader align="center">
        <SectionEyebrow>料金</SectionEyebrow>
        <SectionTitle>必要な分だけの、シンプルな料金</SectionTitle>
        <SectionDescription>
          どのプランでもすべてのコンポーネントを利用できます。従量課金はありません。
        </SectionDescription>
      </SectionHeader>
      <SectionContent className="grid gap-4 lg:grid-cols-3">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={cn(
              "h-full p-6 [--card-spacing:--spacing(4)]",
              tier.featured && "ring-2 ring-primary"
            )}
          >
            <CardHeader className="p-0">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base font-semibold">
                  {tier.name}
                </CardTitle>
                {tier.featured ? <Badge>人気</Badge> : null}
              </div>
              <CardDescription className="mt-1.5">
                {tier.description}
              </CardDescription>
              <div className="mt-6 flex items-baseline gap-1.5">
                <span className="text-4xl font-bold tracking-tight tabular-nums">
                  {tier.price}
                </span>
                <span className="text-sm text-muted-foreground">
                  {tier.cadence}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="mt-6 flex flex-col gap-2.5">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2.5 text-sm"
                  >
                    <CheckIcon className="size-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <div className="mt-auto pt-8">
              <Button
                nativeButton={false}
                className="h-10 w-full"
                variant={tier.featured ? "default" : "outline"}
                render={<Link href={tier.href} />}
              >
                {tier.cta}
              </Button>
            </div>
          </Card>
        ))}
      </SectionContent>
    </Section>
  )
}
