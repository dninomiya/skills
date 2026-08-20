import { Container } from "@/registry/website/ui/container"
import { Placeholder } from "@/registry/website/ui/placeholder"

const ratios = ["video", "square", "portrait", "wide"] as const

export function PlaceholderDemo() {
  return (
    <Container size="lg" className="py-10">
      <div className="grid gap-4 sm:grid-cols-2">
        {ratios.map((ratio) => (
          <Placeholder key={ratio} ratio={ratio} label={ratio} />
        ))}
      </div>
    </Container>
  )
}
