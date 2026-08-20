"use client"

import * as React from "react"
import {
  ExternalLinkIcon,
  MonitorIcon,
  SmartphoneIcon,
  TabletIcon,
} from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

type Viewport = "desktop" | "tablet" | "mobile"

const viewports: Record<
  Viewport,
  { width: string; label: string; icon: typeof MonitorIcon }
> = {
  desktop: { width: "100%", label: "デスクトップ", icon: MonitorIcon },
  tablet: { width: "768px", label: "タブレット", icon: TabletIcon },
  mobile: { width: "390px", label: "モバイル", icon: SmartphoneIcon },
}

export function PreviewFrame({
  name,
  height = 600,
  className,
  toolbar = true,
}: {
  name: string
  height?: number
  className?: string
  toolbar?: boolean
}) {
  const { resolvedTheme } = useTheme()
  const frameRef = React.useRef<HTMLIFrameElement>(null)
  const [frameHeight, setFrameHeight] = React.useState(height)
  const [viewport, setViewport] = React.useState<Viewport>("desktop")

  React.useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return
      const data = event.data as {
        type?: string
        name?: string
        height?: number
      }
      if (
        data?.type === "preview-height" &&
        data.name === name &&
        data.height
      ) {
        setFrameHeight(Math.ceil(data.height))
      }
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [name])

  const postTheme = React.useCallback(() => {
    if (!resolvedTheme) return
    frameRef.current?.contentWindow?.postMessage(
      { type: "preview-theme", theme: resolvedTheme },
      window.location.origin
    )
  }, [resolvedTheme])

  React.useEffect(postTheme, [postTheme])

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {toolbar ? (
        <div className="flex items-center justify-between gap-2">
          <ToggleGroup
            value={[viewport]}
            onValueChange={(value) => {
              const next = value[0] as Viewport | undefined
              if (next) setViewport(next)
            }}
            className="w-fit"
          >
            {(Object.keys(viewports) as Viewport[]).map((key) => {
              const Icon = viewports[key].icon
              return (
                <ToggleGroupItem
                  key={key}
                  value={key}
                  aria-label={viewports[key].label}
                  size="sm"
                >
                  <Icon />
                </ToggleGroupItem>
              )
            })}
          </ToggleGroup>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={
              <a href={`/view/${name}`} target="_blank" rel="noreferrer" />
            }
          >
            新しいタブで開く
            <ExternalLinkIcon />
          </Button>
        </div>
      ) : null}
      <div className="flex justify-center overflow-hidden rounded-xl bg-muted/40 ring-1 ring-foreground/10">
        <iframe
          ref={frameRef}
          src={`/view/${name}`}
          title={`${name} のプレビュー`}
          loading="lazy"
          onLoad={postTheme}
          style={{ height: frameHeight, width: viewports[viewport].width }}
          className="max-w-full bg-background transition-[width] duration-200"
        />
      </div>
    </div>
  )
}
