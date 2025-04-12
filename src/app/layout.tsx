import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { cn } from "@/utils"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, 'mx-auto antialiased')}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
