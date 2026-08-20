import Link from "next/link"

import { Container } from "@/registry/website/ui/container"

const groups = [
  {
    title: "プロダクト",
    links: [
      { label: "機能", href: "#features" },
      { label: "料金", href: "#pricing" },
      { label: "更新履歴", href: "/changelog" },
      { label: "ドキュメント", href: "/docs" },
    ],
  },
  {
    title: "会社",
    links: [
      { label: "会社概要", href: "/about" },
      { label: "ブログ", href: "/blog" },
      { label: "採用情報", href: "/careers" },
      { label: "お問い合わせ", href: "/contact" },
    ],
  },
  {
    title: "規約",
    links: [
      { label: "プライバシーポリシー", href: "/privacy" },
      { label: "利用規約", href: "/terms" },
      { label: "セキュリティ", href: "/security" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <Container size="xl" className="py-16">
        <div className="grid gap-12 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div className="flex max-w-xs flex-col gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold tracking-tight"
            >
              <span
                aria-hidden
                className="inline-flex size-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground"
              >
                A
              </span>
              Acme
            </Link>
            <p className="text-sm leading-[1.8] text-muted-foreground">
              ページが増えても一貫性が保たれる、マーケティングサイトのためのコンポーネントレジストリ。
            </p>
          </div>
          {groups.map((group) => (
            <div key={group.title} className="flex flex-col gap-3">
              <h3 className="text-sm font-medium">{group.title}</h3>
              <ul className="flex flex-col gap-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Acme Inc.
          </p>
          <div className="flex gap-4">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              プライバシーポリシー
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              利用規約
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  )
}
