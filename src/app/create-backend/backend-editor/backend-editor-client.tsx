"use client"

import { useState, useEffect } from "react"
import AIChat from "@/components/ai-chat"
import { toast } from "@/components/ui/use-toast"
import type { GeneratedFileType, FileType, GeneratedDataType } from "@/types"
import { sampleCode } from "@/schemas/modal"
import { ProjectHeader } from "@/components/project-header"
import { ProjectFiles } from "@/components/project-files"
import { FileContent } from "@/components/file-content"
import { useTheme } from "@/components/theme-provider"
import { useWebSocketCodeGen } from "@/hooks/use-websocket-code-gen"

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
  const [generatedData, setGeneratedData] = useState<GeneratedDataType | null>(null)
  const { theme } = useTheme()

  // Use our custom WebSocket hook for template code generation
  const { generateCode, isGenerating, status, error } = useWebSocketCodeGen({
    onFileGenerated: (file) => {
      // Add the generated file to our files list
      setFiles((prev) => {
        // Check if file already exists
        const existingFileIndex = prev.findIndex((f) => f.id === file.id)
        if (existingFileIndex >= 0) {
          // Update existing file
          const updatedFiles = [...prev]
          updatedFiles[existingFileIndex] = file
          return updatedFiles
        } else {
          // Add new file
          return [...prev, file]
        }
      })

      // Select the newly generated file
      setSelectedFile(file.id)
      setCurrentCode(file.code)

      // Update generated data structure
      if (file.type === "endpoint") {
        setGeneratedData((prev) => ({
          ...prev,
          project_id: urlFriendlyName || "project-123",
          endpoint: {
            generated_code: file.code,
            endpoint_path: file.path,
            method: file.method || "GET",
            content_base64: "",
            file_path: file.path,
            file_hash: "",
            endpoint_id: file.id,
          },
        }))
      } else if (file.type === "model") {
        setGeneratedData((prev) => ({
          ...prev,
          project_id: urlFriendlyName || "project-123",
          model: {
            generated_code: file.code,
            content_base64: "",
            entity_name: file.name,
            file_path: file.path,
            file_hash: "",
            exists: true,
          },
        }))
      } else if (file.type === "schema") {
        setGeneratedData((prev) => ({
          ...prev,
          project_id: urlFriendlyName || "project-123",
          schema: {
            generated_code: file.code,
            content_base64: "",
            entity_name: file.name,
            file_path: file.path,
            file_hash: "",
            exists: true,
          },
        }))
      } else if (file.type === "migration") {
        setGeneratedData((prev) => ({
          ...prev,
          project_id: urlFriendlyName || "project-123",
          migration: {
            generated_code: file.code,
            content_base64: "",
            entity_name: file.name,
            file_path: file.path,
            file_hash: "",
            exists: true,
          },
        }))
      }

      toast({
        title: "File generated",
        description: `Generated ${file.name} successfully.`,
      })
    },
  })

  useEffect(() => {
    // Initialize with sample files
    const initialFiles: FileType[] = [
      {
        id: "login",
        name: "login",
        path: "/auth/login",
        type: "endpoint",
        code: sampleCode.endpoints.login,
        method: "POST",
      },
      { id: "users", name: "users", path: "/users", type: "endpoint", code: sampleCode.endpoints.users, method: "GET" },
      {
        id: "user_detail",
        name: "user_detail",
        path: "/users/:id",
        type: "endpoint",
        code: sampleCode.endpoints.user_detail,
        method: "PUT",
      },
      { id: "user_model", name: "User", path: "/models/user.py", type: "model", code: sampleCode.models.user },
      {
        id: "user_schema",
        name: "User Schema",
        path: "/schemas/user.json",
        type: "schema",
        code: sampleCode.schemas.user,
      },
      {
        id: "db_config",
        name: "Database Config",
        path: "/config/database.py",
        type: "config",
        code: sampleCode.config.database,
      },
    ]

    setFiles(initialFiles)

    // Select the first file by default
    if (initialFiles.length > 0) {
      setSelectedFile(initialFiles[0].id)
      setCurrentCode(initialFiles[0].code)
    }

    // Generate code with template information
    if (templateId) {
      generateTemplateCode(templateId)
    }
  }, [templateId])

  // Generate code for a template using our WebSocket integration
  const generateTemplateCode = async (template: string) => {
    await generateCode({
      project_id: urlFriendlyName || "project-123",
      prompt: `Generate code for ${template} template with authentication, models, and database schema`,
      language: "python",
      method: "POST",
      endpoint_path: `/api/${template}`,
      additional_context: `Template: ${template}, Include: authentication, database models, API endpoints`,
    })

    toast({
      title: "Template code generation initiated",
      description: `Generating code for ${template} template...`,
    })
  }

  const handleSaveFile = () => {
    if (!selectedFile) return

    setFiles(files.map((file) => (file.id === selectedFile ? { ...file, code: currentCode } : file)))

    // If this file is part of the generated data, update that too
    if (generatedData) {
      const currentFile = files.find((f) => f.id === selectedFile)
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
    const existingFile = files.find(
      (f) => (f.type === file.type && f.id === file.id) || (f.type === file.type && f.path === file.path),
    )

    if (existingFile) {
      setSelectedFile(existingFile.id)
      setCurrentCode(existingFile.code)
    } else {
      // Add file to files list
      const newFile: FileType = {
        id: file.id,
        name: file.name,
        path: file.path,
        type: file.type,
        code: file.code,
        method: file.method as "GET" | "POST" | "PUT" | "DELETE",
      }

      setFiles((prev) => [...prev, newFile])
      setSelectedFile(newFile.id)
      setCurrentCode(newFile.code)
    }
  }

  // Function to generate additional code using our WebSocket integration
  const handleGenerateAdditionalCode = async () => {
    const endpoint = `/api/users/${Math.floor(Math.random() * 1000)}`
    const method = ["GET", "POST", "PUT", "DELETE"][Math.floor(Math.random() * 4)] as "GET" | "POST" | "PUT" | "DELETE"

    toast({
      title: "Generating additional code",
      description: `Generating a ${method} endpoint for ${endpoint}...`,
    })

    await generateCode({
      project_id: urlFriendlyName || "project-123",
      prompt: `Generate a ${method} endpoint for ${endpoint} with proper error handling and validation`,
      language: "python",
      method: method,
      endpoint_path: endpoint,
      additional_context: "Include proper error handling, input validation, and database interaction",
    })
  }

  // Handle file generated from AI Chat
  const handleFileGenerated = (file: FileType) => {
    // Add the file to our files list if it doesn't exist
    setFiles((prev) => {
      const existingFileIndex = prev.findIndex((f) => f.id === file.id)
      if (existingFileIndex >= 0) {
        // Update existing file
        const updatedFiles = [...prev]
        updatedFiles[existingFileIndex] = file
        return updatedFiles
      } else {
        // Add new file
        return [...prev, file]
      }
    })

    // Select the newly generated file
    setSelectedFile(file.id)
    setCurrentCode(file.code)
  }

  const handleCreateEndpoint = async (data: { endpointPath: string; httpMethod: string; description: string }) => {
    // Implement your endpoint creation logic here
    toast({
      title: "Create Endpoint",
      description: `Creating a new endpoint at ${data.endpointPath} with method ${data.httpMethod}...`,
    })

    // Call your additional code generation function or implement specific endpoint creation logic
    await generateCode({
      project_id: urlFriendlyName || "project-123",
      prompt: `Generate a ${data.httpMethod} endpoint for ${data.endpointPath} with description: ${data.description}`,
      language: "python",
      method: data.httpMethod as "GET" | "POST" | "PUT" | "DELETE",
      endpoint_path: data.endpointPath,
      additional_context: data.description,
    })
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
              setSelectedFile={(fileId) => {
                setSelectedFile(fileId)
                const file = files.find((f) => f.id === fileId)
                if (file) {
                  setCurrentCode(file.code)
                }
              }}
              generatedData={generatedData}
              onGenerateAdditionalCode={handleGenerateAdditionalCode}
              onSelectGeneratedFile={handleSelectGeneratedFile}
              isGenerating={isGenerating}
              onCreateEndpoint={handleCreateEndpoint}
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
              <AIChat projectId={urlFriendlyName || projectName} onFileGenerated={handleFileGenerated} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
