import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BackendGenerator } from "@/components/backend-generator"
import { ThemeToggle } from "@/components/theme-toggle"
import { Footer } from "@/components/footer"
import { AnimatedPhones } from "@/components/mobile-phones"

export const metadata: Metadata = {
  title: "CodeBEGen - AI Backend Generator",
  description: "Generate backend code, APIs, and database schemas using AI",
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-900 text-zinc-100 dark:bg-zinc-950">
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm dark:bg-zinc-950/80">
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
            <Link href="/create-backend">
              <Button className="rounded-md bg-[#7dff00] text-black hover:bg-[#9aff33] dark:bg-[#7dff00] dark:text-black dark:hover:bg-[#9aff33]">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container py-12 md:py-24 lg:py-32">
          <div className="grid gap-6 lg:grid-cols-[1fr_600px] lg:gap-12 xl:grid-cols-[1fr_800px]">
            <div className="flex flex-col justify-center space-y-6">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-white">
              🚀 Ready for Launch — 
              <br />
              All-in-One AI Backend 
              <br />
              Platform
              </h1>
              <p className="text-zinc-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Generate powerful backend code with AI. Seamlessly deploy and test it inside 
              <br />
              CodeBEGen — no need to jump between tools!
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/create-backend">
                  <Button
                    size="lg"
                    className="bg-[#7dff00] text-black hover:bg-[#9aff33] dark:bg-[#7dff00] dark:text-black dark:hover:bg-[#9aff33]"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative h-[700px] flex flex-col items-center justify-center space-y-8 overflow-visible mt-[-20px]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[500px] h-[500px] rounded-full bg-[#7dff00]/5 blur-3xl absolute"></div>
              </div>

              <AnimatedPhones />
              
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 shadow-lg overflow-hidden w-full h-[200px] lg:block">
              <div className="h-full w-full backdrop-blur-sm flex items-center justify-center">
                <p className="text-center text-zinc-400 max-w-md px-6">
                  <span className="text-[#7dff00] font-semibold">Mobile-friendly</span> endpoint management and code 
                  editing. Take your backend development anywhere.
                  </p>
              </div>
            </div>
          </div>
        </div>
        </section>

        <section className="container py-12 md:py-24 border-t border-zinc-800">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white mb-4">
              Generate Backend Code with AI
            </h2>
            <p className="text-zinc-400 md:text-xl/relaxed max-w-3xl mx-auto">
              From simple REST APIs to complex microservices, CodeBEGen handles it all with a simple prompt.
            </p>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-950 shadow-lg overflow-hidden">
            <BackendGenerator />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
