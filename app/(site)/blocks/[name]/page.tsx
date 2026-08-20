import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"

import { CodeBlock } from "@/components/showcase/code-block"
import { CommandBlock } from "@/components/showcase/command-block"
import { PreviewFrame } from "@/components/showcase/preview-frame"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getInstallCommand,
  getItemJsonUrl,
  getItemSources,
} from "@/lib/registry-source"
import { getRegistryItem, registryItems } from "@/registry/index"

export function generateStaticParams() {
  return registryItems.map((item) => ({ name: item.name }))
}

export async function generateMetadata({
  params,
}: PageProps<"/blocks/[name]">) {
  const { name } = await params
  const item = getRegistryItem(name)
  if (!item) return {}
  return { title: item.title, description: item.description }
}

export default async function ItemPage({
  params,
}: PageProps<"/blocks/[name]">) {
  const { name } = await params
  const item = getRegistryItem(name)

  if (!item) {
    notFound()
  }

  const sources = await getItemSources(item)
  const dependencies = [
    ...(item.dependencies ?? []),
    ...(item.registryDependencies ?? []).map((dependency) =>
      dependency.startsWith("http")
        ? `@website/${dependency.split("/").pop()?.replace(".json", "")}`
        : `@shadcn/${dependency}`
    ),
  ]

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit px-2"
          nativeButton={false}
          render={<Link href="/blocks" />}
        >
          <ArrowLeftIcon />
          すべてのブロック
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-bold tracking-[-0.01em]">
            {item.title}
          </h1>
          <Badge variant="outline" className="font-mono text-[11px]">
            {item.type}
          </Badge>
        </div>
        <p className="max-w-2xl leading-[1.8] text-muted-foreground">
          {item.description}
        </p>
        <CommandBlock
          command={getInstallCommand(item.name)}
          className="max-w-xl"
        />
        {dependencies.length ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              依存
            </span>
            {dependencies.map((dependency) => (
              <Badge
                key={dependency}
                variant="secondary"
                className="font-mono text-[11px]"
              >
                {dependency}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      <Tabs defaultValue={item.meta?.preview === "none" ? "code" : "preview"}>
        <TabsList>
          {item.meta?.preview !== "none" ? (
            <TabsTrigger value="preview">プレビュー</TabsTrigger>
          ) : null}
          <TabsTrigger value="code">コード</TabsTrigger>
          <TabsTrigger value="json">レジストリアイテム</TabsTrigger>
        </TabsList>

        {item.meta?.preview !== "none" ? (
          <TabsContent value="preview" className="pt-4">
            <PreviewFrame name={item.name} height={item.meta?.height ?? 600} />
          </TabsContent>
        ) : null}

        <TabsContent value="code" className="flex flex-col gap-6 pt-4">
          {sources.length ? (
            sources.map((source) => (
              <div key={source.path} className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <code className="font-mono text-muted-foreground">
                    {source.path}
                  </code>
                  {source.target ? (
                    <>
                      <span className="text-muted-foreground/60">→</span>
                      <code className="font-mono text-foreground">
                        {source.target}
                      </code>
                    </>
                  ) : null}
                </div>
                <CodeBlock
                  code={source.code}
                  language={source.language}
                  maxHeight="40rem"
                />
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              このアイテムは CSS 変数だけを配布します（ファイルはありません）。
            </p>
          )}
        </TabsContent>

        <TabsContent value="json" className="flex flex-col gap-3 pt-4">
          <p className="text-sm text-muted-foreground">
            配信先:{" "}
            <a
              href={`/r/${item.name}.json`}
              className="font-mono text-foreground underline underline-offset-4"
            >
              /r/{item.name}.json
            </a>
          </p>
          <CodeBlock
            code={JSON.stringify(
              {
                ...item,
                files: item.files?.map(({ path, type, target }) => ({
                  path,
                  type,
                  target,
                })),
                homepage: getItemJsonUrl(item.name),
              },
              null,
              2
            )}
            language="json"
            maxHeight="40rem"
          />
        </TabsContent>
      </Tabs>
    </main>
  )
}
