import type { Metadata } from "next"
import { Geist_Mono, Noto_Sans_JP } from "next/font/google"

import { ShowcaseHeader } from "@/components/showcase/showcase-header"
import { ThemeProvider } from "@/components/showcase/theme-provider"
import "@/app/globals.css"

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  display: "swap",
  // Japanese glyph files are large — load them on demand instead of preloading.
  preload: false,
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "Website Registry",
    template: "%s — Website Registry",
  },
  description:
    "日本語のマーケティングサイトを決定論的に組み立てるための、shadcn 互換ブロック・プリミティブ・トークンのレジストリ。",
}

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      suppressHydrationWarning
      className={`${notoSansJP.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ShowcaseHeader />
          <div className="flex-1">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  )
}
