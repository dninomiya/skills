"use client"

import * as React from "react"
import { CheckIcon, CopyIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CopyButton({
  value,
  className,
  label = "コピー",
}: {
  value: string
  className?: string
  label?: string
}) {
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])

  return (
    <Button
      variant="outline"
      size="icon-sm"
      className={cn("bg-background/80 backdrop-blur", className)}
      onClick={async () => {
        await navigator.clipboard.writeText(value)
        setCopied(true)
      }}
      aria-label={copied ? "コピーしました" : label}
    >
      {copied ? <CheckIcon className="text-primary" /> : <CopyIcon />}
    </Button>
  )
}
