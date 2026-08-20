import { codeToHtml } from "shiki"

import { cn } from "@/lib/utils"
import { CopyButton } from "@/components/showcase/copy-button"

export async function CodeBlock({
  code,
  language = "tsx",
  className,
  maxHeight = "32rem",
}: {
  code: string
  language?: string
  className?: string
  maxHeight?: string | false
}) {
  const html = await codeToHtml(code, {
    lang: language,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  })

  return (
    <div
      className={cn(
        "group/code relative overflow-hidden rounded-xl bg-muted/50 ring-1 ring-foreground/10",
        className
      )}
    >
      <CopyButton
        value={code}
        className="absolute top-3 right-3 z-10 opacity-0 transition-opacity group-hover/code:opacity-100 focus-visible:opacity-100"
      />
      <div
        className="shiki-block overflow-auto p-4 text-[13px] leading-relaxed"
        style={maxHeight ? { maxHeight } : undefined}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
