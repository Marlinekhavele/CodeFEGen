// app/create-backend/backend-editor/BackendEditorClient.tsx
"use client"

import { useState, useEffect } from "react"
import AIChat from "@/components/ai-chat"
import { toast } from "@/components/ui/use-toast"
import CodeGenService from "@/app/api/services/code-gen-service"
import { GeneratedFileType, FileType, GeneratedDataType, EndpointListContent, MethodType } from "@/types"
import { ProjectHeader } from "@/components/project-header"
import { ProjectFiles } from "@/components/project-files"
import { FileContent } from "@/components/file-content"
import { useTheme } from "@/components/theme-provider"
import { CodeGenData } from "@/types"
import EndPointService from "@/app/api/services/endpoint-service"
import axios from "axios"

interface BackendEditorClientProps {
  projectName: string
  urlFriendlyName?: string
  templateId?: string
}

export default function BackendEditorClient({
  projectName,
  urlFriendlyName = "",
  templateId = "",
}: BackendEditorClientProps) {
  const [files, setFiles] = useState<FileType[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [currentCode, setCurrentCode] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedData, setGeneratedData] = useState<GeneratedDataType | null>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const fetchEndpoints = async () => {
      const endpointService = new EndPointService()
      try {
        console.log("Fetching endpoints for project:", urlFriendlyName)
        const result = await endpointService.getEndpointList(urlFriendlyName)
        console.log("Endpoint list response:", result)

        if (result && result.length > 0) {
          // Always fetch code for each endpoint using the /endpoint API
          const endpointFiles = await Promise.all(
            result.map(async (ep: EndpointListContent) => {
              try {
                // Use the correct /endpoint API
                const resp = await axios.get(
                  `https://codebegen.canadacentral.cloudapp.azure.com/api/v1/endpoint/`,
                  {
                    params: {
                      project_id: urlFriendlyName,
                      endpoint_path: ep.path,
                      method: ep.method,
                    },
                  }
                )
                const fileResult = resp.data?.data
                const code = fileResult?.content_base64
                  ? atob(fileResult.content_base64)
                  : ""
                return {
                  id: `${ep.method}-${ep.path}`,
                  name: ep.path.split("/").pop() || ep.path,
                  path: ep.path,
                  type: "endpoint" as const,
                  code,
                  method: ep.method as MethodType,
                }
              } catch (error) {
                console.error(`Error fetching code for endpoint ${ep.path}:`, error)
                return {
                  id: `${ep.method}-${ep.path}`,
                  name: ep.path.split("/").pop() || ep.path,
                  path: ep.path,
                  type: "endpoint" as const,
                  code: "",
                  method: ep.method as MethodType,
                }
              }
            })
          )

          console.log("Processed endpoint files:", endpointFiles)
          setFiles(endpointFiles)
          if (endpointFiles.length > 0) {
            setSelectedFile(endpointFiles[0].id)
            setCurrentCode(endpointFiles[0].code)
          }
        } else {
          console.log("No endpoints found for project")
          toast({
            title: "No endpoints found",
            description: "This project doesn't have any endpoints yet. Try creating one!",
            variant: "default"
          })
        }
      } catch (error) {
        console.error("Error fetching endpoints:", error)
        toast({
          title: "Error fetching endpoints",
          description: error instanceof Error ? error.message : "Failed to fetch endpoints",
          variant: "destructive"
        })
      }
    }
    if (urlFriendlyName) {
      fetchEndpoints()
    }
  }, [urlFriendlyName])

  // Ensure currentCode updates when selectedFile changes
  useEffect(() => {
    if (selectedFile) {
      const file = files.find(f => f.id === selectedFile)
      if (file) setCurrentCode(file.code)
    }
  }, [selectedFile, files])

  const handleSaveFile = () => {
    if (!selectedFile) return

    setFiles(files.map((file) => (file.id === selectedFile ? { ...file, code: currentCode } : file)))

    // If this file is part of the generated data, update that too
    if (generatedData) {
      const currentFile = files.find(f => f.id === selectedFile)
      if (currentFile) {
        const updatedGeneratedData = { ...generatedData }
        
        if (currentFile.type === "endpoint" && updatedGeneratedData.endpoint) {
          updatedGeneratedData.endpoint.generated_code = currentCode
        } else if (currentFile.type === "model" && updatedGeneratedData.model) {
          updatedGeneratedData.model.generated_code = currentCode
        } else if (currentFile.type === "schema" && updatedGeneratedData.schema) {
          updatedGeneratedData.schema.generated_code = currentCode
        } else if (currentFile.type === "migration" && updatedGeneratedData.migration) {
          updatedGeneratedData.migration.generated_code = currentCode
        }
        
        setGeneratedData(updatedGeneratedData)
      }
    }

    toast({
      title: "File saved",
      description: "Your changes have been saved successfully.",
    })
  }

  const handleCopyCode = () => {
    if (!currentCode) return

    navigator.clipboard.writeText(currentCode)

    toast({
      title: "Code copied",
      description: "The code has been copied to your clipboard.",
    })
  }

  const handleDeleteFile = () => {
    if (!selectedFile) return

    // Ask for confirmation
    if (!window.confirm("Are you sure you want to delete this file?")) return

    const newFiles = files.filter((file) => file.id !== selectedFile)
    setFiles(newFiles)

    // Select another file if available
    if (newFiles.length > 0) {
      setSelectedFile(newFiles[0].id)
      setCurrentCode(newFiles[0].code)
    } else {
      setSelectedFile(null)
      setCurrentCode("")
    }

    toast({
      title: "File deleted",
      description: "The file has been deleted successfully.",
    })
  }

  // Handler for selecting a file from the Generated Code Display
  const handleSelectGeneratedFile = (file: GeneratedFileType) => {
    const existingFile = files.find(f => 
      (f.type === file.type && f.id === file.id) || 
      (f.type === file.type && f.path === file.path)
    )
    
    if (existingFile) {
      setSelectedFile(existingFile.id)
    } else {
      // Add file to files list
      const newFile: FileType = {
        id: file.id,
        name: file.name,
        path: file.path,
        type: file.type,
        code: file.code,
        method: file.method as "GET" | "POST" | "PUT" | "DELETE"
      }
      
      setFiles(prev => [...prev, newFile])
      setSelectedFile(newFile.id)
    }
  }

  // Function to generate additional code using WebSocket only
  const handleGenerateAdditionalCode = async () => {
    setIsGenerating(true)
    toast({
      title: "Generating additional code",
      description: "Please wait while we generate more code for your project.",
    })
    try {
      const endpoint = `/api/users/${Math.floor(Math.random() * 1000)}`
      const method = ["GET", "POST", "PUT", "DELETE"][Math.floor(Math.random() * 4)] as "GET" | "POST" | "PUT" | "DELETE"
      const codeGenData: CodeGenData = {
        project_id: urlFriendlyName || "project-123",
        prompt: `Generate a ${method} endpoint for ${endpoint}`,
        language: "python",
        method: method,
        endpoint_path: endpoint,
        additional_context: ""
      }
      // Use WebSocket for code generation
      const wsHandler = new (require('@/app/api/services/websocket-handler').default)("wss://codebegen.canadacentral.cloudapp.azure.com/api/v1/generate/stream")
      wsHandler.on('connected', () => {
        wsHandler.send(codeGenData)
      })
      wsHandler.on('complete', (data: any) => {
        setIsGenerating(false)
        if (data.result) {
          setGeneratedData(data.result)
          if (data.result.endpoint?.generated_code) {
            const newEndpoint: FileType = {
              id: data.result.endpoint.endpoint_id || `endpoint-${Date.now()}`,
              name: data.result.endpoint.endpoint_path?.split('/').pop() || 'endpoint',
              path: data.result.endpoint.endpoint_path || '',
              type: "endpoint",
              method: data.result.endpoint.method as "GET" | "POST" | "PUT" | "DELETE" || "GET",
              code: data.result.endpoint.generated_code,
            }
            setFiles(prev => [...prev, newEndpoint])
            setSelectedFile(newEndpoint.id)
            setCurrentCode(newEndpoint.code)
          }
        }
        toast({
          title: "Code generated",
          description: `Generated new ${method} endpoint at ${endpoint}`,
        })
      })
      wsHandler.on('error', (error: any) => {
        setIsGenerating(false)
        toast({
          title: "Error generating code",
          description: error instanceof Error ? error.message : "Failed to generate code",
          variant: "destructive"
        })
      })
      wsHandler.connect()
    } catch (error) {
      setIsGenerating(false)
      toast({
        title: "Error generating code",
        description: error instanceof Error ? error.message : "Failed to generate code",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <ProjectHeader 
        projectName={projectName}
        urlFriendlyName={urlFriendlyName}
        templateId={templateId}
        isGenerating={isGenerating}
        onCopyCode={handleCopyCode}
        onDeleteFile={handleDeleteFile}
        onSaveFile={handleSaveFile}
      />

      <main className="flex-1">
        <div className="container py-6">
          <div className="grid grid-cols-[280px_1fr_300px] gap-6" style={{ height: "calc(100vh - 200px)" }}>
            {/* Project Files */}
            <ProjectFiles 
              files={files}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              generatedData={generatedData}
              onGenerateAdditionalCode={handleGenerateAdditionalCode}
              onSelectGeneratedFile={handleSelectGeneratedFile}
              isGenerating={isGenerating}
            />

            {/* File Content */}
            <FileContent 
              selectedFile={selectedFile}
              currentCode={currentCode}
              files={files}
              onCodeChange={setCurrentCode}
              theme={theme}
            />

            {/* AI Chat Panel */}
            <div className="h-full">
              <AIChat projectId={urlFriendlyName || projectName} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}