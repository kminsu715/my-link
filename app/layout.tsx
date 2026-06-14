import { Metadata } from "next"
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://my-link-jet.vercel.app"),
  title: {
    default: "My Link - 나만의 특별한 프로필 링크",
    template: "%s | My Link",
  },
  description: "단 1분 만에 완성하는 세련된 프로필 링크 페이지. 중요한 모든 링크를 모아보세요.",
  keywords: ["프로필링크", "link in bio", "멀티링크", "마이링크", "mylink", "소셜미디어", "SNS링크", "링크모음", "크리에이터"],
  authors: [{ name: "My Link Team" }],
  openGraph: {
    title: "My Link - 나만의 특별한 프로필 링크",
    description: "단 1분 만에 완성하는 세련된 프로필 링크 페이지. 중요한 모든 링크를 모아보세요.",
    type: "website",
    locale: "ko_KR",
    siteName: "My Link",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "My Link - 나만의 특별한 프로필 링크",
    description: "단 1분 만에 완성하는 세련된 프로필 링크 페이지. 중요한 모든 링크를 모아보세요.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

const playfairDisplayHeading = Playfair_Display({subsets:['latin'],variable:'--font-heading'});

const geist = Geist({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable, playfairDisplayHeading.variable)}
    >
      <body>
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
