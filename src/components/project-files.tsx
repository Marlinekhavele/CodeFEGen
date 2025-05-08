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
  CodeIcon,
  HardDrive,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { EndpointModal } from "@/components/endpoint-modal"

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
  onEndpointDetailsSubmit: (details: any) => void
  projectLanguage: string
  projectFramework: string
  onViewDatabase?: () => void
  projectId: string

}

export function ProjectFiles({
  files,
  selectedFile,
  setSelectedFile,
  generatedData,
  onCreateEndpoint,
  onSelectGeneratedFile,
  onGenerateAdditionalCode,
  onEndpointDetailsSubmit,
  isGenerating,
  projectLanguage,
  projectFramework,
  onViewDatabase
}: ProjectFilesProps) {
  // State to track expanded sections
  const [expandedSections, setExpandedSections] = useState({
    endpoints: true,
    models: true,
    schemas: true,
    config: true,
    migrations: true,
    helpers: true,
    Database: true,
  });

  // Added state for modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Toggle section expanded state
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Helper to get file extension based on type
  const getFileExtension = (fileType: string, code: string | undefined): string => {
    // Default extensions by file type
    const typeExtensions: Record<string, string> = {
      "endpoint": ".py",
      "model": ".py",
      "schema": ".py", 
      "migration": ".py",
      "helpers": ".py",
      "config": ".py"
    };
    
    // Detect language from code if available
    if (code) {
      if (code.includes("import React") || code.includes("from 'react'") || code.includes('from "react"')) {
        return ".jsx";
      } else if (code.includes("const ") || code.includes("function ") || code.includes("=>")) {
        return ".js";
      } else if (code.includes("import ") && code.includes("from ") && code.includes("def ")) {
        return ".py";
      }
    }
    
    return typeExtensions[fileType] || ".txt";
  };

  // Function to normalize/clean filename
  const normalizeFileName = (file: FileType): string => {
    // Extract base name (without path or method)
    if (file.type === "database") {
      return file.name;
    }
    let baseName = "";
    
    if (file.name) {
      // Remove any path components
      baseName = file.name.split('/').pop() || file.name;
      // Remove HTTP method from filename (e.g., "login.get.py" → "login")
      baseName = baseName.replace(/\.(get|post|put|delete)\./i, ".");
      // Strip extension if present
      baseName = baseName.replace(/\.[^/.]+$/, "");
    } else if (file.path) {
      // Extract filename from path
      baseName = file.path.split('/').pop() || "";
      // Remove HTTP method and extension
      baseName = baseName.replace(/\.(get|post|put|delete)\./i, ".");
      baseName = baseName.replace(/\.[^/.]+$/, "");
    } else {
      // Fallback to generic name based on type
      baseName = file.type || "file";
    }
    
    // Remove any special characters, spaces, etc.
    baseName = baseName.replace(/[^a-zA-Z0-9_-]/g, "_");
    
    // Add appropriate extension based on file type and content
    const extension = getFileExtension(file.type, file.code);
    
    return baseName + extension;
  };

  // Enhanced deduplication function that also handles naming
  const getUniqueFilesByName = (files: FileType[]): FileType[] => {
    const uniqueFiles = new Map<string, FileType>();
    const normalizedFiles: FileType[] = [];
    
    // First pass: normalize filenames
    for (const file of files) {
      const normalizedName = normalizeFileName(file);
      
      // Create a new file object with the normalized name
      const normalizedFile = {
        ...file,
        name: normalizedName,
        // Ensure endpoint files have unique IDs by including the method in the ID
        // This format should match the format in backend-editor-client.tsx: `endpoint-${path}-${method}`
        id: file.type === "endpoint" && file.method && !file.id.includes(`-${file.method}`)
          ? `endpoint-${file.path}-${file.method}`
          : file.id,
        displayName: normalizedName // Optional: add a displayName property
      };
      
      normalizedFiles.push(normalizedFile);
    }
    
    // Second pass: deduplicate files
    for (const file of normalizedFiles) {
      // Include the method in the key if it's an endpoint, otherwise use just type+name
      const key = file.type === "endpoint" && file.method 
        ? `${file.type}:${file.name}:${file.method}`
        : `${file.type}:${file.name}`;
      
      if (!uniqueFiles.has(key)) {
        uniqueFiles.set(key, file);
      }
    }
    
    return Array.from(uniqueFiles.values());
  };

  // Group files by type
  const endpoints = getUniqueFilesByName(files.filter((file) => file.type === "endpoint"))
  const models = getUniqueFilesByName(files.filter((file) => file.type === "model"))
  const schemas = getUniqueFilesByName(files.filter((file) => file.type === "schema"))
  const migrations = getUniqueFilesByName(files.filter((file) => file.type === "migration"))
  const helpers = getUniqueFilesByName(files.filter((file) => file.type === "helpers"))
  const configFiles = getUniqueFilesByName(files.filter((file) => file.type === "config"))
  const databaseFiles = getUniqueFilesByName(files.filter((file) => file.type === "database"))

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

  // Added modal submit handler
  const handleModalSubmit = (details: any) => {
    setIsModalOpen(false);
    onEndpointDetailsSubmit(details);
  };

  return (
    <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 h-full flex flex-col">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FolderTree className="h-5 w-5 text-[#7dff00]" />
          <span className="font-medium text-zinc-900 dark:text-zinc-100">Project Files</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 text-zinc-600 hover:text-[#7dff00] dark:text-zinc-400 dark:hover:text-[#7dff00] p-0"
          onClick={() => setIsModalOpen(true)}
          disabled={isGenerating}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="p-2 overflow-auto" style={{ height: "calc(100vh)", width: "100%" }}>
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-6 px-2 text-center space-y-4 animate-pulse">
            <div className="rounded-full bg-zinc-800/50 backdrop-blur-sm p-4">
              <FolderTree className="h-8 w-8 text-zinc-400" />
            </div>
            <div className="flex flex-col items-center space-y-1">
              <div className="h-4 w-32 bg-zinc-700/60 rounded" />
              <div className="h-3 w-48 bg-zinc-700/50 rounded" />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Endpoints Section without Plus Button */}
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
                        <span>{file.name}</span>
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
                          <span>{file.name}</span>
                        </div>
                      </div>
                    ))}
                    {models.length === 0 && (
                      <div className="text-xs text-zinc-500 italic">No models yet</div>
                    )}
                  </div>
                )}
              </div>

            {/* Schemas Section */}
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
                          <span>{file.name}</span>
                        </div>
                      </div>
                    ))}
                    {schemas.length === 0 && (
                      <div className="text-xs text-zinc-500 italic">No schemas yet</div>
                    )}
                  </div>
                )}
              </div>

            {/* Configuration Section */}
            {projectLanguage === "javascript" && (
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
                          <span>{file.name}</span>
                        </div>
                      </div>
                    ))}
                    {configFiles.length === 0 && (
                      <div className="text-xs text-zinc-500 italic">No configuration files yet</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Migrations Section */}
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
                          <span>{file.name}</span>
                        </div>
                      </div>
                    ))}
                    {migrations.length === 0 && (
                      <div className="text-xs text-zinc-500 italic">No migrations yet</div>
                    )}
                  </div>
                )}
              </div>
              
             {/* Database Section */}
             <div
              className={`p-2 ${expandedSections.Database ? "bg-zinc-100/50 dark:bg-zinc-800/50" : ""} rounded-md mb-2 cursor-pointer`}
              onClick={() => toggleSection("Database")}
            >
              <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-medium text-sm">
                <HardDrive className="h-4 w-4 text-[#7dff00]" />
                <span>Database</span>
              </div>

              {expandedSections.Database && (
                <div className="space-y-1 ml-6 mt-2">
                  {databaseFiles.map((file) => (
                    <div
                      key={file.id}
                      className={`flex items-center justify-between rounded-md px-2 py-1.5 text-sm ${
                        selectedFile === file.id
                          ? "bg-[#7dff00]/20 text-[#7dff00]"
                          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                      } cursor-pointer`}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedFile(file.id)
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-3 w-3" />
                        <span>{file.name}</span>
                      </div>
                    </div>
                  ))}
                  {databaseFiles.length === 0 && (
                    <div className="flex flex-col space-y-2">
                      <div className="text-xs text-zinc-500 italic">No database files yet</div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (onViewDatabase) onViewDatabase()
                        }}
                      >
                        View Database
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>


            {/* Helpers Section */}
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
                          <span>{file.name}</span>
                        </div>
                      </div>
                    ))}
                    {helpers.length === 0 && (
                      <div className="text-xs text-zinc-500 italic">No helpers yet</div>
                    )}
                  </div>
                )}
              </div>
          </div>
        )}

        {isGenerating && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin h-4 w-4 border-2 border-zinc-500 border-t-transparent rounded-full"></div>
            <span className="ml-2 text-xs">Generating code...</span>
          </div>
        )}
      </div>

      {/* Endpoint creation modal */}
      <EndpointModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        projectLanguage={projectLanguage}
        projectFramework={projectFramework}  
      />
    </div>
  )
}