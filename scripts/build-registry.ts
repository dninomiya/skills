/**
 * Generates `registry.json` from `registry/index.ts`, then runs the shadcn
 * builder to emit one distributable JSON file per item into `public/r`.
 *
 * Run with: pnpm registry:build
 */
import { execFileSync } from "node:child_process"
import { mkdirSync, rmSync, writeFileSync } from "node:fs"
import path from "node:path"

import { REGISTRY_URL, registry } from "../registry/index.ts"

const root = path.resolve(import.meta.dirname, "..")
const registryFile = path.join(root, "registry.json")
const outDir = path.join(root, "public", "r")

writeFileSync(registryFile, `${JSON.stringify(registry, null, 2)}\n`)
console.log(
  `→ registry.json (${registry.items.length} items, base URL ${REGISTRY_URL})`
)

rmSync(outDir, { recursive: true, force: true })
mkdirSync(outDir, { recursive: true })

execFileSync(
  "pnpm",
  ["exec", "shadcn", "build", "registry.json", "-o", "public/r"],
  {
    cwd: root,
    stdio: "inherit",
  }
)
