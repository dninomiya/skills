import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/registry/website/ui/section"

const stats = [
  { value: "12,000+", label: "公開されたサイト" },
  { value: "99.99%", label: "昨年の稼働率" },
  { value: "40ms", label: "レスポンス中央値" },
  { value: "4.9/5", label: "顧客満足度" },
]

export function StatsBand() {
  return (
    <Section size="md" tone="accent">
      <SectionHeader align="center">
        <SectionTitle className="text-2xl sm:text-3xl">
          本番環境で裏づけられた数字
        </SectionTitle>
        <SectionDescription>
          プラットフォーム上で稼働するすべてのプロジェクトから計測しています。
        </SectionDescription>
      </SectionHeader>
      <dl className="mt-12 grid grid-cols-2 gap-8 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-1.5">
            <dt className="sr-only">{stat.label}</dt>
            <dd className="text-3xl font-bold tracking-tight tabular-nums sm:text-4xl">
              {stat.value}
            </dd>
            <p className="text-center text-sm text-primary-foreground/70">
              {stat.label}
            </p>
          </div>
        ))}
      </dl>
    </Section>
  )
}
