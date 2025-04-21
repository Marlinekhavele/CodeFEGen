"use client"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import BackendEditorClient from "./backend-editor-client"
import { ProjectInitForm } from "@/components/create-backend/project-init-form"
import { Loader2 } from "lucide-react"

export default function CreateBackendPage() {
  const [projectName, setProjectName] = useState("")
  const [urlFriendlyName, setUrlFriendlyName] = useState("")
  const [loading, setLoading] = useState(true)
  const [showInitForm, setShowInitForm] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if we have all necessary parameters
    const nameFromUrl = searchParams.get("name")
    const urlFromUrl = searchParams.get("url")
    const templateFromUrl = searchParams.get("template")
    const languageFromUrl = searchParams.get("language")
    const frameworkFromUrl = searchParams.get("framework")
    
    if (nameFromUrl && urlFromUrl && templateFromUrl) {
      setProjectName(nameFromUrl)
      setUrlFriendlyName(urlFromUrl)
      setLoading(false)
      setShowInitForm(false)
    } else if (nameFromUrl && urlFromUrl) {
      // Preserve language and framework in the redirect
      router.push(`/create-backend?name=${nameFromUrl}&url=${urlFromUrl}&language=${languageFromUrl || "python"}&framework=${frameworkFromUrl || "flask"}`)
      return
    } else {
      setLoading(false)
      setShowInitForm(true)
    }
  }, [searchParams, router])
  
  // Handle successful project initialization
  const handleProjectInitialized = (name: string, url: string, language: string, framework: string) => {
    // After project initialization, redirect to template selection with language and framework
    router.push(`/create-backend?name=${name}&url=${url}&language=${language}&framework=${framework}`)
  }
  
  // If still loading, show loading indicator
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-[#7dff00] animate-spin" />
          <p className="text-zinc-400">Loading project...</p>
        </div>
      </div>
    )
  }
  
  // Show the initialization form if needed
  if (showInitForm) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-900 p-4">
        <div className="w-full max-w-md">
          <ProjectInitForm onProjectInitialized={handleProjectInitialized} />
        </div>
      </div>
    )
  }
  
  // Show the editor with the project and template details
  return <BackendEditorClient 
    projectName={projectName} 
    urlFriendlyName={urlFriendlyName} 
    templateId={searchParams.get("template") || ""} 
  />
}