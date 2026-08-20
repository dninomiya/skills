"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="テーマを切り替える"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <MoonIcon className="block dark:hidden" />
      <SunIcon className="hidden dark:block" />
    </Button>
  )
}
