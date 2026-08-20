import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Container, containerVariants } from "@/registry/website/ui/container"

const sectionVariants = cva("w-full", {
  variants: {
    tone: {
      default: "bg-background text-foreground",
      muted: "bg-muted/50 text-foreground",
      card: "bg-card text-card-foreground",
      accent: "bg-primary text-primary-foreground",
    },
    size: {
      sm: "py-12 sm:py-16",
      md: "py-16 sm:py-20 lg:py-24",
      lg: "py-20 sm:py-28 lg:py-32",
      none: "py-0",
    },
    bordered: {
      true: "border-t border-border",
      false: "",
    },
  },
  defaultVariants: {
    tone: "default",
    size: "md",
    bordered: false,
  },
})

type SectionProps = React.ComponentProps<"section"> &
  VariantProps<typeof sectionVariants> & {
    /** Container width. Use `full` to opt out of the default max width. */
    width?: VariantProps<typeof containerVariants>["size"]
    /** Render children without the inner container. */
    bleed?: boolean
  }

function Section({
  className,
  tone,
  size,
  bordered,
  width,
  bleed = false,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      data-slot="section"
      data-tone={tone ?? "default"}
      className={cn(sectionVariants({ tone, size, bordered }), className)}
      {...props}
    >
      {bleed ? children : <Container size={width}>{children}</Container>}
    </section>
  )
}

function SectionHeader({
  className,
  align = "left",
  ...props
}: React.ComponentProps<"div"> & { align?: "left" | "center" }) {
  return (
    <div
      data-slot="section-header"
      data-align={align}
      className={cn(
        "flex flex-col gap-4",
        align === "center"
          ? "mx-auto max-w-2xl items-center text-center"
          : "max-w-2xl items-start text-left",
        className
      )}
      {...props}
    />
  )
}

function SectionEyebrow({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="section-eyebrow"
      className={cn(
        "text-sm font-medium tracking-widest text-muted-foreground uppercase",
        className
      )}
      {...props}
    />
  )
}

function SectionTitle({
  className,
  as: Comp = "h2",
  ...props
}: React.ComponentProps<"h2"> & { as?: "h1" | "h2" | "h3" }) {
  return (
    <Comp
      data-slot="section-title"
      className={cn(
        // Japanese headings: `palt` tightens punctuation, `auto-phrase` breaks
        // lines at phrase boundaries, and tracking stays looser than the Latin
        // default so kana does not collide.
        "text-3xl font-bold tracking-[-0.01em] text-balance sm:text-4xl",
        "[font-feature-settings:'palt'] [word-break:auto-phrase]",
        className
      )}
      {...props}
    />
  )
}

function SectionDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="section-description"
      className={cn(
        // 1.8 line-height keeps Japanese body copy readable at both sizes, and
        // `auto-phrase` breaks lines at phrase boundaries instead of anywhere.
        "text-base leading-[1.8] text-pretty text-muted-foreground sm:text-lg",
        "[word-break:auto-phrase]",
        "[[data-tone=accent]_&]:text-primary-foreground/80",
        className
      )}
      {...props}
    />
  )
}

function SectionContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="section-content"
      className={cn("mt-12 sm:mt-16", className)}
      {...props}
    />
  )
}

function SectionActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="section-actions"
      className={cn(
        "flex flex-col gap-3 sm:flex-row",
        "[[data-align=center]_&]:justify-center",
        "[&_[data-slot=button]]:h-10 [&_[data-slot=button]]:px-5 [&_[data-slot=button]]:text-sm",
        className
      )}
      {...props}
    />
  )
}

export {
  Section,
  SectionActions,
  SectionContent,
  SectionDescription,
  SectionEyebrow,
  SectionHeader,
  SectionTitle,
  sectionVariants,
}
