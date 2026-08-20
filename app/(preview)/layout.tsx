import { Geist_Mono, Noto_Sans_JP } from "next/font/google"

import "@/app/globals.css"

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  display: "swap",
  preload: false,
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

/**
 * Bare root layout for iframe previews: no chrome, no theme provider.
 * The inline script inherits the parent frame theme (or `?theme=dark`) before paint.
 */
export default function PreviewLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      suppressHydrationWarning
      className={`${notoSansJP.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var p=window.parent!==window&&window.parent.document.documentElement.classList.contains("dark");var q=new URLSearchParams(location.search).get("theme")==="dark";if(p||q){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark"}}catch(e){}`,
          }}
        />
      </head>
      <body className="bg-background text-foreground">{children}</body>
    </html>
  )
}
