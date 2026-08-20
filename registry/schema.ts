/**
 * Minimal typings for the shadcn registry format.
 * @see https://ui.shadcn.com/docs/registry/registry-json
 */

export type RegistryItemType =
  | "registry:ui"
  | "registry:component"
  | "registry:block"
  | "registry:page"
  | "registry:lib"
  | "registry:hook"
  | "registry:theme"
  | "registry:style"
  | "registry:file"

export type RegistryFile = {
  /** Path to the source file, relative to the repository root. */
  path: string
  type: RegistryItemType
  /** Where the file lands in the consuming project. */
  target?: string
}

export type CssVars = {
  theme?: Record<string, string>
  light?: Record<string, string>
  dark?: Record<string, string>
}

/** Showcase-only metadata. Passed through `meta`, ignored by the CLI. */
export type ItemMeta = {
  /** Grouping used by the showcase navigation. */
  group: "primitive" | "block" | "page" | "theme"
  /** How the showcase renders the preview. */
  preview?: "iframe" | "inline" | "none"
  /** Preview viewport height in pixels (iframe previews only). */
  height?: number
  /** Named export rendered by the showcase. */
  component?: string
}

export type RegistryItem = {
  name: string
  type: RegistryItemType
  title: string
  description: string
  files?: RegistryFile[]
  dependencies?: string[]
  devDependencies?: string[]
  registryDependencies?: string[]
  cssVars?: CssVars
  css?: Record<string, unknown>
  categories?: string[]
  docs?: string
  meta?: ItemMeta
}

export type Registry = {
  $schema?: string
  name: string
  homepage: string
  items: RegistryItem[]
}
