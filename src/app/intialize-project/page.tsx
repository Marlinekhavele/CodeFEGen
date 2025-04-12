"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Check } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { Footer } from "@/components/footer"

export default function InitializeProject() {
  const router = useRouter()
  const [projectName, setProjectName] = useState("")
  const [projectUrl, setProjectUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({ projectName: "", projectUrl: "" })

  const validateForm = () => {
    const newErrors = { projectName: "", projectUrl: "" }
    let isValid = true

    if (!projectName.trim()) {
      newErrors.projectName = "Project name is required"
      isValid = false
    } else if (projectName.length < 3) {
      newErrors.projectName = "Project name must be at least 3 characters"
      isValid = false
    }

    if (!projectUrl.trim()) {
      newErrors.projectUrl = "Project URL is required"
      isValid = false
    } else if (!/^[a-z0-9-]+$/.test(projectUrl)) {
      newErrors.projectUrl = "URL can only contain lowercase letters, numbers, and hyphens"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      // Store project info in localStorage for demo purposes
      localStorage.setItem("codebegen_project", JSON.stringify({
        name: projectName,
        url: projectUrl,
        createdAt: new Date().toISOString()
      }))
      
      router.push("/create-backend")
    }, 1000)
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
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
        <div className="container py-8">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-[#7dff00] mb-6 dark:text-zinc-400">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          
          <div className="max-w-md mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold mb-2 text-zinc-900 dark:text-white">Initialize Your Project</h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Let's set up your backend project with a name and URL.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  placeholder="My Awesome API"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="bg-white border-zinc-300 dark:bg-zinc-900 dark:border-zinc-700"
                />
                {errors.projectName && (
                  <p className="text-red-500 text-sm mt-1">{errors.projectName}</p>
                )}
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  This will be displayed in your dashboard and documentation.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="project-url">Project URL</Label>
                <div className="flex items-center">
                  <span className="bg-zinc-100 text-zinc-500 px-3 py-2 border border-r-0 border-zinc-300 rounded-l-md dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700">
                    codebegen.com/
                  </span>
                  <Input
                    id="project-url"
                    placeholder="my-api"
                    value={projectUrl}
                    onChange={(e) => setProjectUrl(e.target.value)}
                    className="rounded-l-none bg-white border-zinc-300 dark:bg-zinc-900 dark:border-zinc-700"
                  />
                </div>
                {errors.projectUrl && (
                  <p className="text-red-500 text-sm mt-1">{errors.projectUrl}</p>
                )}
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  This will be the URL for accessing your API. Use lowercase letters, numbers, and hyphens only.
                </p>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-[#7dff00] text-black hover:bg-[#9aff33] dark:bg-[#7dff00] dark:text-black dark:hover:bg-[#9aff33]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Initializing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Continue to Backend Setup
                    <Check className="ml-2 h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
