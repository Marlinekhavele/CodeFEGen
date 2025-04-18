"use client"

import { useState } from "react"
import { Plus, Server, Database, FileJson, FileCode, FolderTree, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GeneratedCodeDisplay } from "@/components/gen-code-display"
import { getFileIcon, getMethodBadge } from "@/schemas/modal"
import { FileType, GeneratedDataType, GeneratedFileType } from "@/types"
import { CreateEndpointModal } from "@/components/endpoint-modal"

interface ProjectFilesProps {
  files: FileType[]
  selectedFile: string | null
  setSelectedFile: (fileId: string) => void
  generatedData: GeneratedDataType | null
  onCreateEndpoint: (data: {
    endpointPath: string
    httpMethod: string
    description: string
  }) => Promise<void>
  onSelectGeneratedFile: (file: GeneratedFileType) => void
  isGenerating: boolean
  onGenerateAdditionalCode: () => Promise<void>
}

export function ProjectFiles({
  files,
  selectedFile,
  setSelectedFile,
  generatedData,
  onCreateEndpoint,
  onSelectGeneratedFile,
  onGenerateAdditionalCode,
  isGenerating,
}: ProjectFilesProps) {
  const [activeSection, setActiveSection] = useState<string>("endpoints")
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <FolderTree className="h-5 w-5 text-[#7dff00]" />
          <span className="font-medium text-zinc-900 dark:text-zinc-100">Project Files</span>
        </div>
      </div>

      <CreateEndpointModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={onCreateEndpoint}
      />

      <div className="p-2 overflow-auto" style={{ height: "calc(100vh - 300px)" }}>
        {/* Endpoints Section */}
        <div className="mb-4">
          <div
            className={`p-2 ${activeSection === "endpoints" ? "bg-zinc-100/50 dark:bg-zinc-800/50" : ""} rounded-md cursor-pointer`}
            onClick={() => setActiveSection("endpoints")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#7dff00] font-medium text-sm">
                <Server className="h-4 w-4" />
                <span>Endpoints</span>
                {isGenerating && (
                  <Loader2 className="h-3 w-3 animate-spin text-zinc-400" />
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 text-zinc-600 hover:text-[#7dff00] dark:text-zinc-400 dark:hover:text-[#7dff00] p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsModalOpen(true)
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {activeSection === "endpoints" && (
              <div className="space-y-1 ml-6 mt-2">
                {files
                  .filter((file) => file.type === "endpoint")
                  .map((file) => (
                    <div
                      key={file.id}
                      className={`flex items-center justify-between rounded-md px-2 py-1.5 text-sm ${
                        selectedFile === file.id
                          ? "bg-[#7dff00]/20 text-[#7dff00]"
                          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                      } cursor-pointer`}
                      onClick={() => setSelectedFile(file.id)}
                    >
                      <div className="flex items-center gap-2">
                        {getMethodBadge(file.method || "")}
                        <span>{file.path}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Models Section */}
        <div className="mb-4">
          <div
            className={`p-2 ${activeSection === "models" ? "bg-zinc-100/50 dark:bg-zinc-800/50" : ""} rounded-md cursor-pointer`}
            onClick={() => setActiveSection("models")}
          >
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-medium text-sm">
              <Database className="h-4 w-4 text-[#7dff00]" />
              <span>Models</span>
            </div>

            {activeSection === "models" && (
              <div className="space-y-1 ml-6 mt-2">
                {files
                  .filter((file) => file.type === "model")
                  .map((file) => (
                    <div
                      key={file.id}
                      className={`flex items-center justify-between rounded-md px-2 py-1.5 text-sm ${
                        selectedFile === file.id
                          ? "bg-[#7dff00]/20 text-[#7dff00]"
                          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                      } cursor-pointer`}
                      onClick={() => setSelectedFile(file.id)}
                    >
                      <div className="flex items-center gap-2">
                        {getFileIcon("model")}
                        <span>{file.name}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Schemas Section */}
        <div className="mb-4">
          <div
            className={`p-2 ${activeSection === "schemas" ? "bg-zinc-100/50 dark:bg-zinc-800/50" : ""} rounded-md cursor-pointer`}
            onClick={() => setActiveSection("schemas")}
          >
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-medium text-sm">
              <FileJson className="h-4 w-4 text-[#7dff00]" />
              <span>Schemas</span>
            </div>

            {activeSection === "schemas" && (
              <div className="space-y-1 ml-6 mt-2">
                {files
                  .filter((file) => file.type === "schema")
                  .map((file) => (
                    <div
                      key={file.id}
                      className={`flex items-center justify-between rounded-md px-2 py-1.5 text-sm ${
                        selectedFile === file.id
                          ? "bg-[#7dff00]/20 text-[#7dff00]"
                          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                      } cursor-pointer`}
                      onClick={() => setSelectedFile(file.id)}
                    >
                      <div className="flex items-center gap-2">
                        {getFileIcon("schema")}
                        <span>{file.name}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Configuration Section */}
        <div className="mb-4">
          <div
            className={`p-2 ${activeSection === "config" ? "bg-zinc-100/50 dark:bg-zinc-800/50" : ""} rounded-md cursor-pointer`}
            onClick={() => setActiveSection("config")}
          >
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-medium text-sm">
              <FileCode className="h-4 w-4 text-[#7dff00]" />
              <span>Configuration</span>
            </div>

            {activeSection === "config" && (
              <div className="space-y-1 ml-6 mt-2">
                {files
                  .filter((file) => file.type === "config")
                  .map((file) => (
                    <div
                      key={file.id}
                      className={`flex items-center justify-between rounded-md px-2 py-1.5 text-sm ${
                        selectedFile === file.id
                          ? "bg-[#7dff00]/20 text-[#7dff00]"
                          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                      } cursor-pointer`}
                      onClick={() => setSelectedFile(file.id)}
                    >
                      <div className="flex items-center gap-2">
                        {getFileIcon("config")}
                        <span>{file.name}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Generated Code Display */}
        {generatedData && (
          <div className="mt-4">
            <GeneratedCodeDisplay 
              generatedData={generatedData}
              onSelectFile={onSelectGeneratedFile}
              selectedFileId={selectedFile || undefined}
            />
          </div>
        )}
      </div>
    </div>
  )
}