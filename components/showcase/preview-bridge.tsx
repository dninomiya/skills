"use client"

import * as React from "react"

/**
 * Runs inside the preview iframe: reports its content height to the parent and
 * follows the parent's theme without a reload.
 */
export function PreviewBridge({
  name,
  initialTheme,
}: {
  name: string
  initialTheme: "light" | "dark"
}) {
  const [theme, setTheme] = React.useState(initialTheme)

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    document.documentElement.style.colorScheme = theme
  }, [theme])

  React.useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return
      const data = event.data as { type?: string; theme?: string }
      if (
        data?.type === "preview-theme" &&
        (data.theme === "dark" || data.theme === "light")
      ) {
        setTheme(data.theme)
      }
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [])

  React.useEffect(() => {
    if (window.parent === window) return

    function report() {
      const height = document.documentElement.scrollHeight
      window.parent.postMessage(
        { type: "preview-height", name, height },
        window.location.origin
      )
    }

    const observer = new ResizeObserver(report)
    observer.observe(document.documentElement)
    report()
    return () => observer.disconnect()
  }, [name])

  return null
}
