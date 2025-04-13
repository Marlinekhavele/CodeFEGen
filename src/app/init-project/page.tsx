import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Footer } from "@/components/footer"
import { ProjectInitForm } from "@/components/project-init-form"

export const metadata: Metadata = {
  title: "Initialize Project - CodeBEGen",
  description: "Set up your new backend project",
}

export default function InitProject() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-zinc-100/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/codeBE-logo-28i3MSrg38VV5t71KZaV9P29xWpbJf.png"
                alt="CodeBEGen Logo"
                width={36}
                height={36}
              />
              <span className="text-xl font-bold text-[#7dff00] dark:text-[#7dff00]">CodeBEGen</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container max-w-md py-16">
          <div className="mb-8 flex items-center justify-center">
            <div className="relative h-20 w-20">
              <div className="absolute inset-0 rounded-full bg-[#7dff00]/20 blur-xl"></div>
              <div className="relative flex h-full w-full items-center justify-center rounded-full bg-white border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
                <span className="text-3xl font-bold text-[#7dff00]">1</span>
              </div>
            </div>
            <div className="h-1 w-12 bg-zinc-300 dark:bg-zinc-800"></div>
            <div className="relative h-16 w-16">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-zinc-100 border border-zinc-300 dark:bg-zinc-900 dark:border-zinc-800">
                <span className="text-xl font-bold text-zinc-400">2</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-lg dark:bg-zinc-950 dark:border-zinc-800">
            <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white">Initialize Your Project</h1>
            <ProjectInitForm />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
