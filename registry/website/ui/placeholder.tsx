import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const placeholderVariants = cva(
  "relative isolate flex w-full items-center justify-center overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/10",
  {
    variants: {
      ratio: {
        video: "aspect-video",
        square: "aspect-square",
        portrait: "aspect-[3/4]",
        wide: "aspect-[2/1]",
        ultrawide: "aspect-[21/9]",
      },
    },
    defaultVariants: {
      ratio: "video",
    },
  }
)

/**
 * Swap this out for a real `next/image` once the asset exists.
 * Keeping a typed placeholder means layout never shifts when the image lands.
 */
function Placeholder({
  className,
  ratio,
  label,
  children,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof placeholderVariants> & { label?: string }) {
  return (
    <div
      data-slot="placeholder"
      className={cn(placeholderVariants({ ratio }), className)}
      {...props}
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(var(--color-foreground)_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.08]"
      />
      {children ??
        (label ? (
          <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            {label}
          </span>
        ) : null)}
    </div>
  )
}

export { Placeholder, placeholderVariants }
