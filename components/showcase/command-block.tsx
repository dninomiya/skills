import { CopyButton } from "@/components/showcase/copy-button"
import { cn } from "@/lib/utils"

export function CommandBlock({
  command,
  className,
}: {
  command: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg bg-muted/60 py-2 pr-2 pl-3 ring-1 ring-foreground/10",
        className
      )}
    >
      <code className="flex-1 overflow-x-auto font-mono text-[13px] whitespace-nowrap text-muted-foreground">
        <span className="text-foreground/40 select-none">$ </span>
        {command}
      </code>
      <CopyButton value={command} label="コマンドをコピー" />
    </div>
  )
}
