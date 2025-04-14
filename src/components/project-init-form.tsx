"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import InitializationService from "@/services/initialization-service"

// Define available programming languages
const PROGRAMMING_LANGUAGES = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "go", label: "Go" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "ruby", label: "Ruby" },
  { value: "php", label: "PHP" },
]

export function ProjectInitForm() {
  const [projectName, setProjectName] = useState("")
  const [language, setLanguage] = useState("python")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const initService = new InitializationService()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!projectName.trim()) {
      setError("Project name is required")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Mock API call for testing without a real backend
      // In a real environment, this would call the actual API
      // await initService.endpointInitialization(projectName)

      // Store project name and language in localStorage for use across pages
      localStorage.setItem("currentProjectName", projectName)
      localStorage.setItem("currentProjectLanguage", language)

      // Create a URL-friendly version of the project name
      const urlFriendlyName = projectName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Navigate to the create-backend page
      router.push("/create-backend")
    } catch (err) {
      console.error("Failed to initialize project:", err)
      setError("Failed to initialize project. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="project-name" className="text-zinc-200 dark:text-zinc-200">
          Project Name
        </Label>
        <Input
          id="project-name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="My Awesome Backend"
          className="bg-zinc-800 border-zinc-700 text-zinc-200 focus:border-[#7dff00] focus:ring-[#7dff00]/20 dark:bg-zinc-800 dark:border-zinc-700"
          disabled={isLoading}
        />
        <p className="text-xs text-zinc-400">This will be the name of your backend project</p>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="language" className="text-zinc-200 dark:text-zinc-200">
          Programming Language
        </Label>
        <Select value={language} onValueChange={setLanguage} disabled={isLoading}>
          <SelectTrigger
            id="language"
            className="bg-zinc-800 border-zinc-700 text-zinc-200 focus:border-[#7dff00] focus:ring-[#7dff00]/20 dark:bg-zinc-800 dark:border-zinc-700"
          >
            <SelectValue placeholder="Select a language" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
            {PROGRAMMING_LANGUAGES.map((lang) => (
              <SelectItem key={lang.value} value={lang.value} className="focus:bg-zinc-700 focus:text-zinc-100">
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-zinc-400">Choose the programming language for your backend</p>
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          className="w-full bg-[#7dff00] text-black hover:bg-[#9aff33] dark:bg-[#7dff00] dark:text-black dark:hover:bg-[#9aff33] group"
          disabled={isLoading}
        >
          {isLoading ? "Initializing..." : "Continue to Select Template"}
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </form>
  )
}
