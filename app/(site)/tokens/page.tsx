import type { Metadata } from "next"

import { CommandBlock } from "@/components/showcase/command-block"
import { getInstallCommand } from "@/lib/registry-source"
import { getRegistryItem } from "@/registry/index"

export const metadata: Metadata = {
  title: "トークン",
  description:
    "このレジストリのすべてのブロックが従う、デザイントークンとレイアウト規約。",
}

const rules = [
  {
    name: "セクションのリズム",
    value: "py-16 · py-20 · py-24 / py-28 / py-32",
    detail:
      "サイズは sm / md / lg の 3 つだけ。セクションが自前で縦の余白を持つことはありません。",
  },
  {
    name: "コンテナ幅",
    value: "3xl · 5xl · 6xl · 7xl",
    detail:
      "左右の余白は常に px-4 sm:px-6 lg:px-8。どのセクションも同じ位置で揃います。",
  },
  {
    name: "見出しのスケール",
    value: "text-3xl sm:text-4xl · text-4xl sm:text-5xl lg:text-6xl",
    detail:
      "セクション見出しは前者、ヒーロー見出しは後者。どちらも text-balance と word-break: auto-phrase 付きです。",
  },
  {
    name: "本文",
    value: "text-base sm:text-lg / leading-[1.8] / text-pretty",
    detail:
      "行間は日本語に合わせて 1.8。説明文は max-w-2xl までに抑え、1 行の文字数を読みやすく保ちます。",
  },
  {
    name: "Surfaces",
    value: "bg-card + ring-1 ring-foreground/10",
    detail:
      "Cards use a ring instead of a border so they stay crisp in dark mode.",
  },
]

function Swatch({ value }: { value: string }) {
  return (
    <span
      className="inline-block size-4 shrink-0 rounded-sm ring-1 ring-foreground/15"
      style={{ background: value }}
    />
  )
}

export default function TokensPage() {
  const theme = getRegistryItem("website-theme")
  const light = theme?.cssVars?.light ?? {}
  const dark = theme?.cssVars?.dark ?? {}
  const names = Object.keys(light)

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-[-0.01em]">
          トークンと規約
        </h1>
        <p className="max-w-2xl leading-[1.9] text-muted-foreground">
          ブロックは色・角丸・余白をハードコードしません。テーマをインストールすれば、すべてのブロックの見た目が一度に変わります。独自のセクションを足すときは、下のレイアウト規約に合わせてください。
        </p>
        <CommandBlock
          command={getInstallCommand("website-theme")}
          className="max-w-xl"
        />
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold tracking-[-0.01em]">カラートークン</h2>
        <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left">
              <tr>
                <th className="px-4 py-2.5 font-medium">トークン</th>
                <th className="px-4 py-2.5 font-medium">ライト</th>
                <th className="px-4 py-2.5 font-medium">ダーク</th>
              </tr>
            </thead>
            <tbody>
              {names.map((name) => (
                <tr key={name} className="border-t border-border">
                  <td className="px-4 py-2.5 font-mono text-[13px]">{name}</td>
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-2 font-mono text-[13px] text-muted-foreground">
                      <Swatch value={light[name]} />
                      {light[name]}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-2 font-mono text-[13px] text-muted-foreground">
                      <Swatch value={dark[name]} />
                      {dark[name]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold tracking-[-0.01em]">レイアウト規約</h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          {rules.map((rule) => (
            <div
              key={rule.name}
              className="flex flex-col gap-1.5 rounded-xl bg-card p-5 ring-1 ring-foreground/10"
            >
              <dt className="text-sm font-semibold">{rule.name}</dt>
              <dd className="font-mono text-[13px] text-primary">
                {rule.value}
              </dd>
              <dd className="text-sm leading-[1.8] text-muted-foreground">
                {rule.detail}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  )
}
