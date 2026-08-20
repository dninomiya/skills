import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { CodeBlock } from "@/components/showcase/code-block"
import { CommandBlock } from "@/components/showcase/command-block"
import { ItemCard } from "@/components/showcase/item-card"
import { Button } from "@/components/ui/button"
import { getInstallCommand } from "@/lib/registry-source"
import { getItemsByGroup, REGISTRY_URL, registryItems } from "@/registry/index"

const groups = [
  {
    id: "page",
    title: "ページ",
    description:
      "組み上がった状態のページ。まずこれを入れて、不要なセクションを削るのが最短です。",
  },
  {
    id: "block",
    title: "ブロック",
    description: "セクション単位の部品。どの順番で並べても成立します。",
  },
  {
    id: "primitive",
    title: "プリミティブ",
    description:
      "余白・幅・タイポグラフィの規約。すべてのブロックがこの上に乗っています。",
  },
  {
    id: "theme",
    title: "テーマ",
    description:
      "トークンを差し替えて、すべてのブロックの見た目を一度に変えます。",
  },
] as const

const componentsJson = `{
  "$schema": "https://ui.shadcn.com/schema.json",
  "registries": {
    "@website": {
      "url": "${REGISTRY_URL}/r/{name}.json"
    }
  }
}`

export default function OverviewPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <section className="flex flex-col gap-6 border-b border-border py-16 sm:py-24">
        <div className="flex max-w-2xl flex-col gap-4">
          <span className="text-sm font-medium tracking-wide text-muted-foreground">
            shadcn registry
          </span>
          <h1 className="[font-feature-settings:'palt'] text-4xl font-bold tracking-[-0.01em] text-balance [word-break:auto-phrase] sm:text-5xl">
            いつも揃っている、日本語サイトのためのブロック集
          </h1>
          <p className="text-lg leading-[1.9] text-pretty text-muted-foreground">
            ページ・ブロック・プリミティブ・テーマを合わせて{" "}
            {registryItems.length}{" "}
            アイテム。ひとつの余白スケールとひとつのトークンの上に組まれています。shadcn
            CLI でインストールすると、ソースがそのままリポジトリに入ります。
          </p>
        </div>
        <div className="flex max-w-xl flex-col gap-3">
          <CommandBlock command={getInstallCommand("landing-page")} />
          <div className="flex gap-2">
            <Button
              nativeButton={false}
              className="h-10 px-5"
              render={<Link href="/blocks" />}
            >
              すべて見る
              <ArrowRightIcon />
            </Button>
            <Button
              nativeButton={false}
              variant="outline"
              className="h-10 px-5"
              render={<a href="/r/registry.json" />}
            >
              registry.json
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-10 border-b border-border py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-16">
        <div className="flex max-w-md flex-col gap-4">
          <h2 className="text-2xl font-bold tracking-[-0.01em]">
            プロジェクトをこのレジストリに向ける
          </h2>
          <p className="leading-[1.9] text-muted-foreground">
            <code className="font-mono text-sm">components.json</code>{" "}
            に名前空間を一度だけ追加すれば、短い名前でインストールできます（
            <code className="font-mono text-sm">@website/hero-centered</code>
            ）。設定せずに JSON の URL を直接渡す方法でも構いません。
          </p>
          <CommandBlock command="npx shadcn@latest add @website/landing-page" />
        </div>
        <CodeBlock code={componentsJson} language="json" maxHeight={false} />
      </section>

      {groups.map((group) => {
        const items = getItemsByGroup(group.id)
        if (!items.length) return null

        return (
          <section key={group.id} className="flex flex-col gap-6 py-16">
            <div className="flex flex-col gap-1.5">
              <h2 className="text-2xl font-bold tracking-[-0.01em]">
                {group.title}
                <span className="ml-2 text-base font-normal text-muted-foreground tabular-nums">
                  {items.length}
                </span>
              </h2>
              <p className="text-muted-foreground">{group.description}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <ItemCard key={item.name} item={item} />
              ))}
            </div>
          </section>
        )
      })}
    </main>
  )
}
