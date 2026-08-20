"use client"

import * as React from "react"
import Link from "next/link"
import { MenuIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Container } from "@/registry/website/ui/container"

const navigation = [
  { label: "製品", href: "#features" },
  { label: "料金", href: "#pricing" },
  { label: "導入事例", href: "#testimonials" },
  { label: "よくある質問", href: "#faq" },
]

export function SiteHeader() {
  const [open, setOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container
        size="xl"
        className="flex h-16 items-center justify-between gap-6"
      >
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

        <nav className="hidden items-center gap-1 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button
            nativeButton={false}
            variant="ghost"
            size="sm"
            render={<Link href="/login" />}
          >
            ログイン
          </Button>
          <Button
            nativeButton={false}
            size="sm"
            render={<Link href="/signup" />}
          >
            無料で始める
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="md:hidden">
                <MenuIcon />
                <span className="sr-only">メニューを開く</span>
              </Button>
            }
          />
          <SheetContent side="right" className="w-full sm:max-w-sm">
            <SheetHeader>
              <SheetTitle>メニュー</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2.5 text-base font-medium transition-colors hover:bg-muted"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-2 p-4">
              <Button
                nativeButton={false}
                variant="outline"
                className="h-10"
                render={<Link href="/login" />}
              >
                ログイン
              </Button>
              <Button
                nativeButton={false}
                className="h-10"
                render={<Link href="/signup" />}
              >
                無料で始める
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </Container>
    </header>
  )
}
