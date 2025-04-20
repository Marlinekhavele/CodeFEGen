"use client"

import { FileType, GeneratedDataType, GeneratedFileType } from "@/types"
import { 
  FolderIcon, 
  CircleIcon, 
  FileIcon, 
  PlusIcon, 
  DatabaseIcon,
  CodeIcon,
  TableIcon,
  ArrowUpIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProjectFilesProps {
  files: FileType[]
  selectedFile: string | null
  setSelectedFile: (id: string) => void
  generatedData: GeneratedDataType | null
  onGenerateAdditionalCode: () => void
  onSelectGeneratedFile: (file: GeneratedFileType) => void
  isGenerating: boolean
}

export function ProjectFiles({
  files,
  selectedFile,
  setSelectedFile,
  generatedData,
  onGenerateAdditionalCode,
  onSelectGeneratedFile,
  isGenerating,
}: ProjectFilesProps) {
  // Group files by type
  const endpoints = files.filter((file) => file.type === "endpoint")
  const models = files.filter((file) => file.type === "model")
  const schemas = files.filter((file) => file.type === "schema")
  const migrations = files.filter((file) => file.type === "migration")
  const helpers = files.filter((file) => file.type === "helpers")
  const configFiles = files.filter((file) => file.type === "config")

  // Get method color
  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET":
        return "text-blue-500"
      case "POST":
        return "text-green-500"
      case "PUT":
        return "text-orange-500"
      case "DELETE":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-full flex flex-col">
      <div className="p-2 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="text-sm font-medium flex items-center gap-2">
          <FolderIcon className="h-4 w-4" />
          Project Files
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onGenerateAdditionalCode}
          disabled={isGenerating}
        >
          <PlusIcon className="h-4 w-4" />
          <span className="sr-only">Add File</span>
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-6 px-2 text-center">
            <div className="rounded-full bg-zinc-100 dark:bg-zinc-800 p-2.5 mb-3">
              <FolderIcon className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
            </div>
            <div className="text-sm font-medium mb-1">No files yet</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              Use the AI chat to generate your first endpoint and related files.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Endpoints Section */}
            {endpoints.length > 0 && (
              <div>
                <div className="flex items-center gap-1 px-2 py-1.5">
                  <CodeIcon className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
                  <span className="text-xs font-medium">Endpoints</span>
                </div>
                <div className="mt-1 space-y-1">
                  {endpoints.map((file) => (
                    <button
                      key={file.id}
                      className={cn(
                        "flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded-md",
                        selectedFile === file.id
                          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                      )}
                      onClick={() => setSelectedFile(file.id)}
                    >
                      <CircleIcon className={cn("h-2 w-2", getMethodColor(file.method ?? ""))} />
                      <span className="truncate">{file.name ?? "endpoint"}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Models Section */}
            {models.length > 0 && (
              <div>
                <div className="flex items-center gap-1 px-2 py-1.5">
                  <DatabaseIcon className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
                  <span className="text-xs font-medium">Models</span>
                </div>
                <div className="mt-1 space-y-1">
                  {models.map((file) => (
                    <button
                      key={file.id}
                      className={cn(
                        "flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded-md",
                        selectedFile === file.id
                          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                      )}
                      onClick={() => setSelectedFile(file.id)}
                    >
                      <FileIcon className="h-3 w-3" />
                      <span className="truncate">{file.name ?? "model"}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Schemas Section */}
            {schemas.length > 0 && (
              <div>
                <div className="flex items-center gap-1 px-2 py-1.5">
                  <TableIcon className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
                  <span className="text-xs font-medium">Schemas</span>
                </div>
                <div className="mt-1 space-y-1">
                  {schemas.map((file) => (
                    <button
                      key={file.id}
                      className={cn(
                        "flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded-md",
                        selectedFile === file.id
                          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                      )}
                      onClick={() => setSelectedFile(file.id)}
                    >
                      <FileIcon className="h-3 w-3" />
                      <span className="truncate">{file.name ?? "schema"}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Migrations Section */}
            {migrations.length > 0 && (
              <div>
                <div className="flex items-center gap-1 px-2 py-1.5">
                  <ArrowUpIcon className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
                  <span className="text-xs font-medium">Migrations</span>
                </div>
                <div className="mt-1 space-y-1">
                  {migrations.map((file) => (
                    <button
                      key={file.id}
                      className={cn(
                        "flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded-md",
                        selectedFile === file.id
                          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                      )}
                      onClick={() => setSelectedFile(file.id)}
                    >
                      <FileIcon className="h-3 w-3" />
                      <span className="truncate">{file.name ?? "migration"}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Helpers Section */}
            {helpers.length > 0 && (
              <div>
                <div className="flex items-center gap-1 px-2 py-1.5">
                  <CodeIcon className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
                  <span className="text-xs font-medium">Helpers</span>
                </div>
                <div className="mt-1 space-y-1">
                  {helpers.map((file) => (
                    <button
                      key={file.id}
                      className={cn(
                        "flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded-md",
                        selectedFile === file.id
                          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                      )}
                      onClick={() => setSelectedFile(file.id)}
                    >
                      <FileIcon className="h-3 w-3" />
                      <span className="truncate">{file.name ?? "helper"}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Config Section */}
            {configFiles.length > 0 && (
              <div>
                <div className="flex items-center gap-1 px-2 py-1.5">
                  <FileIcon className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
                  <span className="text-xs font-medium">Config</span>
                </div>
                <div className="mt-1 space-y-1">
                  {configFiles.map((file) => (
                    <button
                      key={file.id}
                      className={cn(
                        "flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded-md",
                        selectedFile === file.id
                          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                      )}
                      onClick={() => setSelectedFile(file.id)}
                    >
                      <FileIcon className="h-3 w-3" />
                      <span className="truncate">{file.name ?? "config"}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {isGenerating && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin h-4 w-4 border-2 border-zinc-500 border-t-transparent rounded-full"></div>
            <span className="ml-2 text-xs">Generating code...</span>
          </div>
        )}
      </div>
    </div>
  )
}