import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { CommandBlock } from "@/components/showcase/command-block"
import { Badge } from "@/components/ui/badge"
import { getInstallCommand } from "@/lib/registry-source"
import type { RegistryItem } from "@/registry/schema"

export function ItemCard({ item }: { item: RegistryItem }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10 transition-shadow hover:shadow-sm">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/blocks/${item.name}`}
            className="text-sm font-semibold tracking-[-0.01em] hover:underline"
          >
            {item.title}
          </Link>
          <Badge variant="outline" className="font-mono text-[11px]">
            {item.name}
          </Badge>
        </div>
        <p className="text-sm leading-[1.8] text-muted-foreground">
          {item.description}
        </p>
      </div>
      <div className="mt-auto flex flex-col gap-3">
        <CommandBlock command={getInstallCommand(item.name)} />
        <Link
          href={`/blocks/${item.name}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          プレビューとソース
          <ArrowRightIcon className="size-3.5" />
        </Link>
      </div>
    </div>
  )
}
