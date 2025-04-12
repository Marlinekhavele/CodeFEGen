import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Database, Server, Code, Zap, Globe, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Create Backend - CodeBEGen",
  description: "Create a new AI-powered backend with CodeBEGen",
}

export default function CreateBackend() {
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
            <Button className="rounded-md bg-[#7dff00] text-black hover:bg-[#9aff33] dark:bg-[#7dff00] dark:text-black dark:hover:bg-[#9aff33]">
              Dashboard
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-[#7dff00] mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold mb-8 text-white">Create a New Backend</h1>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Backend Template Cards */}
            <div className="group rounded-lg border border-zinc-800 bg-zinc-900 p-6 transition-all hover:border-[#7dff00]/50 hover:shadow-[0_0_15px_rgba(125,255,0,0.15)]">
              <div className="mb-4 rounded-full bg-[#7dff00]/10 p-3 w-fit">
                <Database className="h-6 w-6 text-[#7dff00]" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-white group-hover:text-[#7dff00]">REST API</h3>
              <p className="text-zinc-400 mb-4">
                Create a standard REST API with authentication, database models, and CRUD operations.
              </p>
              <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100">Select Template</Button>
            </div>

            <div className="group rounded-lg border border-zinc-800 bg-zinc-900 p-6 transition-all hover:border-[#7dff00]/50 hover:shadow-[0_0_15px_rgba(125,255,0,0.15)]">
              <div className="mb-4 rounded-full bg-[#7dff00]/10 p-3 w-fit">
                <Server className="h-6 w-6 text-[#7dff00]" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-white group-hover:text-[#7dff00]">GraphQL API</h3>
              <p className="text-zinc-400 mb-4">
                Build a GraphQL API with schemas, resolvers, and authentication middleware.
              </p>
              <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100">Select Template</Button>
            </div>

            <div className="group rounded-lg border border-zinc-800 bg-zinc-900 p-6 transition-all hover:border-[#7dff00]/50 hover:shadow-[0_0_15px_rgba(125,255,0,0.15)]">
              <div className="mb-4 rounded-full bg-[#7dff00]/10 p-3 w-fit">
                <Code className="h-6 w-6 text-[#7dff00]" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-white group-hover:text-[#7dff00]">Serverless Functions</h3>
              <p className="text-zinc-400 mb-4">
                Deploy individual serverless functions with event-driven architecture.
              </p>
              <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100">Select Template</Button>
            </div>

            <div className="group rounded-lg border border-zinc-800 bg-zinc-900 p-6 transition-all hover:border-[#7dff00]/50 hover:shadow-[0_0_15px_rgba(125,255,0,0.15)]">
              <div className="mb-4 rounded-full bg-[#7dff00]/10 p-3 w-fit">
                <Zap className="h-6 w-6 text-[#7dff00]" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-white group-hover:text-[#7dff00]">Real-time API</h3>
              <p className="text-zinc-400 mb-4">
                Build a WebSocket-based real-time API for chat, notifications, and live updates.
              </p>
              <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100">Select Template</Button>
            </div>

            <div className="group rounded-lg border border-zinc-800 bg-zinc-900 p-6 transition-all hover:border-[#7dff00]/50 hover:shadow-[0_0_15px_rgba(125,255,0,0.15)]">
              <div className="mb-4 rounded-full bg-[#7dff00]/10 p-3 w-fit">
                <Globe className="h-6 w-6 text-[#7dff00]" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-white group-hover:text-[#7dff00]">E-commerce API</h3>
              <p className="text-zinc-400 mb-4">
                Complete e-commerce backend with products, orders, payments, and user management.
              </p>
              <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100">Select Template</Button>
            </div>

            <div className="group rounded-lg border border-zinc-800 bg-zinc-900 p-6 transition-all hover:border-[#7dff00]/50 hover:shadow-[0_0_15px_rgba(125,255,0,0.15)]">
              <div className="mb-4 rounded-full bg-[#7dff00]/10 p-3 w-fit">
                <Lock className="h-6 w-6 text-[#7dff00]" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-white group-hover:text-[#7dff00]">Auth Service</h3>
              <p className="text-zinc-400 mb-4">
                Authentication and authorization service with OAuth, JWT, and role-based access control.
              </p>
              <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100">Select Template</Button>
            </div>
          </div>

          <div className="mt-12 rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-2xl font-bold mb-4 text-white">Create Custom Backend</h2>
            <p className="text-zinc-400 mb-6">
              Describe your backend requirements in natural language and our AI will generate the perfect backend for
              you.
            </p>
            <div className="mb-6">
              <textarea
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-3 text-zinc-300 placeholder:text-zinc-500 focus:border-[#7dff00] focus:outline-none min-h-[150px]"
                placeholder="Describe your backend requirements... (e.g., 'Create a REST API for a blog with user authentication, posts, comments, and categories')"
              ></textarea>
            </div>
            <Button className="bg-[#7dff00] text-black hover:bg-[#9aff33] dark:bg-[#7dff00] dark:text-black dark:hover:bg-[#9aff33]">
              Generate Backend
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
