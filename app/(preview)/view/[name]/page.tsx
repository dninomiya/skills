import { notFound } from "next/navigation"

import { PreviewBridge } from "@/components/showcase/preview-bridge"
import { getPreview, previews } from "@/lib/previews"
import { getRegistryItem } from "@/registry/index"

export function generateStaticParams() {
  return Object.keys(previews).map((name) => ({ name }))
}

export async function generateMetadata({ params }: PageProps<"/view/[name]">) {
  const { name } = await params
  return { title: getRegistryItem(name)?.title ?? name }
}

export default async function ViewPage({
  params,
  searchParams,
}: PageProps<"/view/[name]">) {
  const { name } = await params
  const { theme } = await searchParams
  const preview = getPreview(name)

  if (!preview) {
    notFound()
  }

  return (
    <>
      <PreviewBridge
        name={name}
        initialTheme={theme === "dark" ? "dark" : "light"}
      />
      {preview}
    </>
  )
}
