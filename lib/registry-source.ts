import fs from "node:fs/promises"
import path from "node:path"

import { REGISTRY_URL } from "@/registry/index"
import type { RegistryItem } from "@/registry/schema"

export type ItemSource = {
  /** Source path inside this repository. */
  path: string
  /** Where the file lands in a consuming project. */
  target?: string
  code: string
  language: "tsx" | "ts" | "css" | "json"
}

function languageFor(filePath: string): ItemSource["language"] {
  if (filePath.endsWith(".tsx")) return "tsx"
  if (filePath.endsWith(".css")) return "css"
  if (filePath.endsWith(".json")) return "json"
  return "ts"
}

/** Every registry file lives under this directory — keep the read scoped to it. */
const REGISTRY_DIR = "registry"

export async function getItemSources(
  item: RegistryItem
): Promise<ItemSource[]> {
  if (!item.files?.length) return []

  return Promise.all(
    item.files.map(async (file) => {
      const relativePath = file.path.replace(/^registry\//, "")

      return {
        path: file.path,
        target: file.target,
        language: languageFor(file.path),
        code: await fs.readFile(
          path.join(process.cwd(), REGISTRY_DIR, relativePath),
          "utf8"
        ),
      }
    })
  )
}

export function getInstallCommand(
  name: string,
  baseUrl: string = REGISTRY_URL
) {
  return `npx shadcn@latest add ${baseUrl}/r/${name}.json`
}

export function getItemJsonUrl(name: string, baseUrl: string = REGISTRY_URL) {
  return `${baseUrl}/r/${name}.json`
}
