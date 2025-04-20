"use client"

import { useState } from "react"
import { FileType, GeneratedDataType, GeneratedFileType } from "@/types"
import { 
  Plus, 
  Server, 
  Database, 
  FileJson, 
  FileCode,
  TableIcon, 
  FolderTree,
  CodeIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProjectFilesProps {
  files: FileType[]
  selectedFile: string | null
  setSelectedFile: (id: string) => void
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
  // State to track expanded sections
  const [expandedSections, setExpandedSections] = useState({
    endpoints: true,
    models: true,
    schemas: true,
    config: true,
    migrations: true,
    helpers: true
  });

  // Toggle section expanded state
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Group files by type
  const endpoints = files.filter((file) => file.type === "endpoint")
  const models = files.filter((file) => file.type === "model")
  const schemas = files.filter((file) => file.type === "schema")
  const migrations = files.filter((file) => file.type === "migration")
  const helpers = files.filter((file) => file.type === "helpers")
  const configFiles = files.filter((file) => file.type === "config")

  // Get method color and badge
  const getMethodBadge = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET":
        return <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-1.5 py-0.5 rounded-sm">GET</span>
      case "POST":
        return <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-1.5 py-0.5 rounded-sm">POST</span>
      case "PUT":
        return <span className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 px-1.5 py-0.5 rounded-sm">PUT</span>
      case "DELETE":
        return <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 px-1.5 py-0.5 rounded-sm">DELETE</span>
      default:
        return <span className="text-xs bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 px-1.5 py-0.5 rounded-sm">{method}</span>
    }
  }

  return (
    <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 h-full flex flex-col">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FolderTree className="h-5 w-5 text-[#7dff00]" />
          <span className="font-medium text-zinc-900 dark:text-zinc-100">Project Files</span>
        </div>
      </div>
      
      <div className="p-2 overflow-auto" style={{ height: "calc(100vh - 300px)" }}>
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-6 px-2 text-center">
            <div className="rounded-full bg-zinc-100 dark:bg-zinc-800 p-2.5 mb-3">
              <FolderTree className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
            </div>
            <div className="text-sm font-medium mb-1">No files yet</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              Use the AI chat to generate your first endpoint and related files.
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Endpoints Section with Plus Button */}
            <div
              className={`p-2 ${expandedSections.endpoints ? "bg-zinc-100/50 dark:bg-zinc-800/50" : ""} rounded-md mb-2`}
            >
              <div className="flex items-center gap-2 text-[#7dff00] font-medium text-sm mb-2">
                <div 
                  className="flex items-center gap-2 flex-1 cursor-pointer"
                  onClick={() => toggleSection("endpoints")}
                >
                  <Server className="h-4 w-4" />
                  <span>Endpoints</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 text-zinc-600 hover:text-[#7dff00] dark:text-zinc-400 dark:hover:text-[#7dff00] p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onGenerateAdditionalCode();
                  }}
                  disabled={isGenerating}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {expandedSections.endpoints && (
                <div className="space-y-1 ml-6">
                  {endpoints.map((file) => (
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
                        {getMethodBadge(file.method || "UNKNOWN")}
                        <span>{file.path ?? "/endpoint"}</span>
                      </div>
                    </div>
                  ))}
                  {endpoints.length === 0 && (
                    <div className="text-xs text-zinc-500 italic">No endpoints yet</div>
                  )}
                </div>
              )}
            </div>

            {/* Models Section */}
            {models.length > 0 && (
              <div
                className={`p-2 ${expandedSections.models ? "bg-zinc-100/50 dark:bg-zinc-800/50" : ""} rounded-md mb-2 cursor-pointer`}
                onClick={() => toggleSection("models")}
              >
                <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-medium text-sm">
                  <Database className="h-4 w-4 text-[#7dff00]" />
                  <span>Models</span>
                </div>

                {expandedSections.models && (
                  <div className="space-y-1 ml-6 mt-2">
                    {models.map((file) => (
                      <div
                        key={file.id}
                        className={`flex items-center justify-between rounded-md px-2 py-1.5 text-sm ${
                          selectedFile === file.id
                            ? "bg-[#7dff00]/20 text-[#7dff00]"
                            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                        } cursor-pointer`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(file.id);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Database className="h-3 w-3" />
                          <span>{file.name ?? "model"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Schemas Section */}
            {schemas.length > 0 && (
              <div
                className={`p-2 ${expandedSections.schemas ? "bg-zinc-100/50 dark:bg-zinc-800/50" : ""} rounded-md mb-2 cursor-pointer`}
                onClick={() => toggleSection("schemas")}
              >
                <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-medium text-sm">
                  <TableIcon className="h-4 w-4 text-[#7dff00]" />
                  <span>Schemas</span>
                </div>

                {expandedSections.schemas && (
                  <div className="space-y-1 ml-6 mt-2">
                    {schemas.map((file) => (
                      <div
                        key={file.id}
                        className={`flex items-center justify-between rounded-md px-2 py-1.5 text-sm ${
                          selectedFile === file.id
                            ? "bg-[#7dff00]/20 text-[#7dff00]"
                            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                        } cursor-pointer`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(file.id);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <FileJson className="h-3 w-3" />
                          <span>{file.name ?? "schema"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Configuration Section */}
            {configFiles.length > 0 && (
              <div
                className={`p-2 ${expandedSections.config ? "bg-zinc-100/50 dark:bg-zinc-800/50" : ""} rounded-md mb-2 cursor-pointer`}
                onClick={() => toggleSection("config")}
              >
                <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-medium text-sm">
                  <FileCode className="h-4 w-4 text-[#7dff00]" />
                  <span>Configuration</span>
                </div>

                {expandedSections.config && (
                  <div className="space-y-1 ml-6 mt-2">
                    {configFiles.map((file) => (
                      <div
                        key={file.id}
                        className={`flex items-center justify-between rounded-md px-2 py-1.5 text-sm ${
                          selectedFile === file.id
                            ? "bg-[#7dff00]/20 text-[#7dff00]"
                            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                        } cursor-pointer`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(file.id);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <FileCode className="h-3 w-3" />
                          <span>{file.name ?? "config"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Migrations Section */}
            {migrations.length > 0 && (
              <div
                className={`p-2 ${expandedSections.migrations ? "bg-zinc-100/50 dark:bg-zinc-800/50" : ""} rounded-md mb-2 cursor-pointer`}
                onClick={() => toggleSection("migrations")}
              >
                <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-medium text-sm">
                  <CodeIcon className="h-4 w-4 text-[#7dff00]" />
                  <span>Migrations</span>
                </div>

                {expandedSections.migrations && (
                  <div className="space-y-1 ml-6 mt-2">
                    {migrations.map((file) => (
                      <div
                        key={file.id}
                        className={`flex items-center justify-between rounded-md px-2 py-1.5 text-sm ${
                          selectedFile === file.id
                            ? "bg-[#7dff00]/20 text-[#7dff00]"
                            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                        } cursor-pointer`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(file.id);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <FileCode className="h-3 w-3" />
                          <span>{file.name ?? "migration"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Helpers Section */}
            {helpers.length > 0 && (
              <div
                className={`p-2 ${expandedSections.helpers ? "bg-zinc-100/50 dark:bg-zinc-800/50" : ""} rounded-md mb-2 cursor-pointer`}
                onClick={() => toggleSection("helpers")}
              >
                <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-medium text-sm">
                  <FileCode className="h-4 w-4 text-[#7dff00]" />
                  <span>Helpers</span>
                </div>

                {expandedSections.helpers && (
                  <div className="space-y-1 ml-6 mt-2">
                    {helpers.map((file) => (
                      <div
                        key={file.id}
                        className={`flex items-center justify-between rounded-md px-2 py-1.5 text-sm ${
                          selectedFile === file.id
                            ? "bg-[#7dff00]/20 text-[#7dff00]"
                            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                        } cursor-pointer`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(file.id);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <FileCode className="h-3 w-3" />
                          <span>{file.name ?? "helper"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
  )
}