import { Section } from "@/registry/website/ui/section"

const logos = ["Vercel", "Linear", "Supabase", "Raycast", "Resend", "Framer"]

export function LogoCloud() {
  return (
    <Section size="sm" tone="muted" bordered>
      <p className="text-center text-sm font-medium text-muted-foreground">
        毎日リリースを続けるチームに選ばれています
      </p>
      <div className="mt-8 grid grid-cols-2 items-center gap-x-8 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
        {logos.map((logo) => (
          <div
            key={logo}
            className="text-center text-lg font-semibold tracking-tight text-muted-foreground/80"
          >
            {logo}
          </div>
        ))}
      </div>
    </Section>
  )
}
