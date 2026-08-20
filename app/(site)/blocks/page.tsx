import Link from "next/link"
import type { Metadata } from "next"

import { CommandBlock } from "@/components/showcase/command-block"
import { PreviewFrame } from "@/components/showcase/preview-frame"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getInstallCommand } from "@/lib/registry-source"
import { registryItems } from "@/registry/index"

export const metadata: Metadata = {
  title: "ブロック",
  description: "レジストリのすべてのアイテムを 1 ページでプレビューします。",
}

const previewable = registryItems.filter(
  (item) => item.meta?.preview === "iframe" || item.meta?.preview === "inline"
)

export default function BlocksPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:px-8">
      <aside className="hidden w-56 shrink-0 lg:block">
        <nav className="sticky top-20 flex flex-col gap-1">
          <p className="mb-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
            このページの内容
          </p>
          {previewable.map((item) => (
            <a
              key={item.name}
              href={`#${item.name}`}
              className="rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.title}
            </a>
          ))}
        </nav>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col gap-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-[-0.01em]">ブロック</h1>
          <p className="leading-[1.8] text-muted-foreground">
            すべてのアイテムを独立したフレームで表示しています。幅とテーマを切り替えながら、このページのままインストールコマンドをコピーできます。
          </p>
        </div>

        {previewable.map((item) => (
          <section
            key={item.name}
            id={item.name}
            className="flex scroll-mt-20 flex-col gap-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold tracking-[-0.01em]">
                    {item.title}
                  </h2>
                  <Badge variant="outline" className="font-mono text-[11px]">
                    {item.name}
                  </Badge>
                </div>
                <p className="max-w-2xl text-sm leading-[1.8] text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href={`/blocks/${item.name}`} />}
              >
                ソース
              </Button>
            </div>
            <CommandBlock
              command={getInstallCommand(item.name)}
              className="max-w-xl"
            />
            <PreviewFrame name={item.name} height={item.meta?.height ?? 600} />
          </section>
        ))}
      </main>
    </div>
  )
}
