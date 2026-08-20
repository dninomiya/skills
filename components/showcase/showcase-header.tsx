import Link from "next/link"

import { ThemeToggle } from "@/components/showcase/theme-toggle"
import { Button } from "@/components/ui/button"
import { REGISTRY_NAME } from "@/registry/index"

const links = [
  { href: "/", label: "概要" },
  { href: "/blocks", label: "ブロック" },
  { href: "/tokens", label: "トークン" },
]

export function ShowcaseHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold"
        >
          <span
            aria-hidden
            className="inline-flex size-6 items-center justify-center rounded-md bg-foreground text-[11px] font-bold text-background"
          >
            W
          </span>
          <span className="tracking-tight">{REGISTRY_NAME} registry</span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((link) => (
            <Button
              nativeButton={false}
              key={link.href}
              variant="ghost"
              size="sm"
              render={<Link href={link.href} />}
            >
              {link.label}
            </Button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <Button
            nativeButton={false}
            variant="ghost"
            size="sm"
            render={<a href="/r/registry.json" />}
          >
            registry.json
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
