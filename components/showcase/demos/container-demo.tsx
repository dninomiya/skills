import { Container } from "@/registry/website/ui/container"

const sizes = ["sm", "md", "lg", "xl", "full"] as const

export function ContainerDemo() {
  return (
    <div className="flex flex-col gap-3 py-10">
      {sizes.map((size) => (
        <Container key={size} size={size}>
          <div className="flex h-14 items-center justify-center rounded-lg bg-muted text-sm font-medium ring-1 ring-foreground/10">
            size=&quot;{size}&quot;
          </div>
        </Container>
      ))}
    </div>
  )
}
