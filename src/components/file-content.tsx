"use client"

import { useEffect, useState, useCallback } from "react"
import { Editor } from "@monaco-editor/react"
import { MonacoEditor as CustomMonacoEditor } from "@/components/monaco-editor"; 
import type { FileType } from "@/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import EndPointService from "@/app/api/services/endpoint-service"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, Code, FileText } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism"
import { DatabaseViewer } from "@/components/database-viewer"
import { TestEndpoint } from "./test-endpoint"

type FileContentProps = {
  selectedFile: string | null
  currentCode: string
  files: FileType[]
  onCodeChange: (value: string) => void
  theme?: string
  streamingCode?: string
  streaming?: boolean
  onStreamComplete?: () => void
  projectId?: string
  activeTab?: string 
  setActiveTab?: (tab: string) => void  
}

export function FileContent({
  selectedFile,
  currentCode,
  files,
  onCodeChange,
  theme,
  streamingCode = "",
  streaming = false,
  onStreamComplete,
  projectId,
  activeTab = "code", 
  setActiveTab = () => {},  
}: FileContentProps) {
  
  // State for documentation content
  const [documentation, setDocumentation] = useState<string>("# Select a file to view its documentation")
  const [isLoadingDocs, setIsLoadingDocs] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [docFetchError, setDocFetchError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"rendered" | "source">("rendered")
  const [isDatabaseFile, setIsDatabaseFile] = useState(false)
  const [currentFileForEditor, setCurrentFileForEditor] = useState<FileType | null>(null)
  const [language, setLanguage] = useState("python") 
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEndpointCreating, setIsEndpointCreating] = useState(false)

  // Memoize onStreamComplete to prevent re-renders in CodeStreamEffect
  const handleStreamComplete = useCallback(() => {
    onStreamComplete?.()
  }, [onStreamComplete])
  
  const findSelectedFile = () => {
    let foundFile = files.find((f) => f.id === selectedFile)
    if (!foundFile && selectedFile) {
      const methodMatch = selectedFile.match(/-(GET|POST|PUT|DELETE)$/i)
      if (methodMatch) {
        const baseId = selectedFile.split('-').slice(0, -1).join('-')
        foundFile = files.find((f) => f.id === baseId)
      }
    }
    return foundFile
  }
  
  const getEntityName = (file: FileType | undefined) => {
    if (!file) return null
    const fileName = file.name || file.path?.split("/").pop() || ""
    if (file.type === "endpoint") {
      const withoutExtension = fileName.replace(/\.[^/.]+$/, "")
      const resourceMethodPattern = withoutExtension.match(/^(.+)\.(get|post|put|delete)$/i)
      if (resourceMethodPattern) {
        return resourceMethodPattern[1]
      }
      const methodResourcePattern = withoutExtension.match(/^(get|post|put|delete)[_-](.+)$/i)
      if (methodResourcePattern) {
        return methodResourcePattern[2] 
      }
      return withoutExtension.replace(/^(get|post|put|delete)[_-]?/i, "")
    }
    return null
  }
  
  const findDocumentationForFile = () => {
    if (!file) return null
    const entityName = getEntityName(file)
    if (entityName) {
      const possibleDocFiles = files.filter(f => 
        f.type === "api_docs" && (
          f.path?.includes(`${entityName}.md`) || 
          (file.method && f.path?.includes(`${entityName}.${file.method?.toLowerCase()}.md`)) ||
          (file.name && f.path?.includes(`${file.name.replace(/\.[^/.]+$/, "")}.md`))
        )
      )
      if (possibleDocFiles.length > 0) {
        return possibleDocFiles[0]
      }
    }
    if (file.type === "endpoint") {
      const apiDoc = files.find(f => f.type === "api_docs" && f.path?.includes("api.md"))
      if (apiDoc) {
        ("Using api.md as fallback documentation")
        return apiDoc
      }
    }
    return null
  }

  const file = findSelectedFile()

  useEffect(() => {
    if (selectedFile) {
    }
  }, [selectedFile, file, currentCode, activeTab])

  useEffect(() => {
    if (selectedFile) {
      const selectedFileObj = files.find(f => f.id === selectedFile)
      setIsDatabaseFile(selectedFileObj?.type === "database")
    } else {
      setIsDatabaseFile(false)
    }
  }, [selectedFile, files])

  useEffect(() => {
    if (selectedFile) {
      const foundFile = files.find((f) => f.id === selectedFile)
      setCurrentFileForEditor(foundFile || null)
    } else {
      setCurrentFileForEditor(null)
    }
  }, [selectedFile, files])

  useEffect(() => {
    if (activeTab === "docs") {
      setIsLoadingDocs(true)
      setDocumentation("# Loading documentation...")
      setDocFetchError(null)

      const docFile = findDocumentationForFile()
      const entityName = getEntityName(file)

      if (docFile && docFile.code) {
        setDocumentation(docFile.code)
        setIsLoadingDocs(false)
        return
      }

      const fetchDocumentation = async () => {
        try {
          const endpointService = new EndPointService()
          let docContent = ""
          if (entityName) {
            try {
              docContent = await endpointService.getDoc(projectId || "", `${entityName}.md`)
            } catch (entityError) {
              if (file?.method) {
                try {
                  docContent = await endpointService.getDoc(projectId || "", `${entityName}.${file.method.toLowerCase()}.md`)
                } catch (methodError) {
                }
              }
            }
          }
          
          if (!docContent || !docContent.trim()) {
            docContent = await endpointService.getDoc(projectId || "", "api.md")
          }

          if (docContent && docContent.trim()) {
            setDocumentation(docContent)
          } else {
            setDocumentation(
              `# Documentation Not Found\n\nNo documentation was found for this ${file?.type || 'file'}.\n\n` +
                `The documentation may not have been generated yet.`,
            )
          }
        } catch (error) {
          console.error("Documentation fetch failed:", error)
          setDocFetchError(error instanceof Error ? error.message : String(error))

          const anyApiDoc = files.find((f) => f.type === "api_docs")
          if (anyApiDoc && anyApiDoc.code) {
            setDocumentation(anyApiDoc.code)
          } else {
            setDocumentation(
              `# Error Loading Documentation\n\nFailed to load documentation.\n\n` +
                `Error: ${error instanceof Error ? error.message : String(error)}`,
            )
          }
        } finally {
          setIsLoadingDocs(false)
        }
      }

      fetchDocumentation()
    }
  }, [activeTab, projectId, files, refreshKey, selectedFile, file])

  const getCleanFileName = (file: FileType | undefined) => {
    if (!file) return "Untitled"
    let fileName = file.name || ""
    if (!fileName && file.path) {
      fileName = file.path.split("/").pop() || file.path
    }
    fileName = fileName.replace(/\.(get|post|put|delete)\./i, ".")
    if (file.type === "endpoint") {
      const baseName = fileName.replace(/\.[^/.]+$/, "")
      const cleanBase = baseName.replace(/^(get|post|put|delete)[-_]?/i, "")
      return cleanBase + ".py"
    }
    return fileName
  }

  const getLanguage = () => {
    if (!file) {
      if (streamingCode) {
        if (streamingCode.includes("def ") && streamingCode.includes(":")) return "python"
        if (streamingCode.includes("import React") || streamingCode.includes("export default")) return "javascript"
        if (streamingCode.includes("func ") && streamingCode.includes("package ")) return "go"
        if (streamingCode.includes("interface ") || streamingCode.includes("class ")) return "typescript"
        return "python"
      }
      return "python"
    }

    const filePath = file.path || ""
    if (filePath.endsWith(".py")) return "python"
    if (filePath.endsWith(".js")) return "javascript"
    if (filePath.endsWith(".ts")) return "typescript"
    if (filePath.endsWith(".go")) return "go"
    if (filePath.endsWith(".sql")) return "sql"
    if (filePath.endsWith(".json")) return "json"
    if (filePath.endsWith(".md")) return "markdown"
    if (file.type === "model" || file.type === "schema" || file.type === "endpoint") {
      return "python"
    }
    return "python"
  }

  const getMethodBadge = (path: string) => {
    if (!file || !file.method) return null
    const method = file.method.toUpperCase()
    let badgeClass = "text-xs px-1.5 py-0.5 rounded-sm "
    switch (method) {
      case "GET":
        badgeClass += "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
        break
      case "POST":
        badgeClass += "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
        break
      case "PUT":
        badgeClass += "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
        break
      case "DELETE":
        badgeClass += "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
        break
      default:
        badgeClass += "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
    }
    return <span className={badgeClass}>{method}</span>
  }

  const getEndpointPath = () => {
    if (!file || file.type !== "endpoint") return ""
    const filePath = file.path || file.name || ""
    const fileName = filePath.split("/").pop() || ""
    const methodMatch = fileName.match(/\.(get|post|put|delete)\.py$/i)
    const method = methodMatch ? methodMatch[1].toUpperCase() : file.method?.toUpperCase() || "GET"
    const basePath = fileName.replace(/\.(get|post|put|delete)\.py$/i, "")
    return `/${basePath}`
  }

  const getDocumentationTitle = () => {
    if (!file) return "API Documentation"
    const entityName = getEntityName(file)
    if (entityName) {
      return `${entityName} Documentation`
    }
    return file.type === "endpoint" ? "Endpoint Documentation" : "API Documentation"
  }

  if (isDatabaseFile && selectedFile) {
    return (
      <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-full flex flex-col">
        <DatabaseViewer 
          projectId={projectId || ""} 
          dbFilename={files.find(f => f.id === selectedFile)?.name || ""} 
          theme={theme} 
        />
      </div>
    )
  }

  const getLanguageFromFile = (selectedFile: string | null, files: FileType[]) => {
    const file = files.find((f) => f.id === selectedFile)
    if (!file) {
      if (streamingCode) {
        if (streamingCode.includes("def ") && streamingCode.includes(":")) return "python"
        if (streamingCode.includes("import React") || streamingCode.includes("export default")) return "javascript"
        if (streamingCode.includes("func ") && streamingCode.includes("package ")) return "go"
        if (streamingCode.includes("interface ") || streamingCode.includes("class ")) return "typescript"
        return "python"
      }
      return "python"
    }
    const filePath = file.path || ""
    if (filePath.endsWith(".py")) return "python"
    if (filePath.endsWith(".js")) return "javascript"
    if (filePath.endsWith(".ts")) return "typescript"
    if (filePath.endsWith(".go")) return "go"
    if (filePath.endsWith(".sql")) return "sql"
    if (filePath.endsWith(".json")) return "json"
    if (filePath.endsWith(".md")) return "markdown"
    if (file.type === "model" || file.type === "schema" || file.type === "endpoint") {
      return "python"
    }
    return "python"
  }

  const handleCodeChangeInternal = (newCode: string) => {
    if (onCodeChange) {
      onCodeChange(newCode)
    }
  }
  
  return (
    <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-full flex flex-col">
      <Tabs
        defaultValue="code"
        value={activeTab}
        className="flex-1 h-full flex flex-col"
        onValueChange={(value) => setActiveTab(value)}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-2">
            {selectedFile && (
              <>
                {file?.type === "endpoint" && getMethodBadge(file.path || "")}
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{getCleanFileName(file)}</span>
              </>
            )}
            {!selectedFile && streamingCode && (
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">AI Generated Code (Preview)</span>
            )}
            {!selectedFile && !streamingCode && (
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Select a file to view or edit
              </span>
            )}
          </div>
          <TabsList className="h-9 bg-zinc-100 dark:bg-zinc-800">
            <TabsTrigger
              value="code"
              className="text-xs data-[state=active]:bg-[#7dff00] data-[state=active]:text-black"
            >
              Code
            </TabsTrigger>
            <TabsTrigger
              value="test"
              className="text-xs data-[state=active]:bg-[#7dff00] data-[state=active]:text-black"
            >
              Test
            </TabsTrigger>
            <TabsTrigger
              value="docs"
              className="text-xs data-[state=active]:bg-[#7dff00] data-[state=active]:text-black"
            >
              Docs
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="flex-1 overflow-hidden">
          <TabsContent 
            value="code" 
            className="flex-1 h-[calc(100%-48px)] data-[state=active]:h-[calc(100%-48px)] overflow-auto"
          >
            {selectedFile || streamingCode ? (
              <CustomMonacoEditor
                code={currentCode || ""} 
                language={getLanguageFromFile(selectedFile, files)}
                onChange={handleCodeChangeInternal}
                theme={theme === "dark" ? "vs-dark" : "vs-light"}
                streaming={streaming}
                streamingCode={streamingCode}
                onStreamComplete={handleStreamComplete}
                readOnly={isGenerating || isEndpointCreating} 
              />
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-500 dark:text-zinc-400">
                <p>Select a file to view or edit its content, or use the AI chat to generate code</p>
              </div>
            )}
          </TabsContent>
          <TabsContent 
            value="test" 
            className="flex-1 h-[calc(100%-48px)] overflow-auto"
          >
            {file?.type === "endpoint" ? (
                <TestEndpoint
                  method={file.method?.toUpperCase() || "GET"}
                  endpoint={getEndpointPath()}
                  projectId={projectId || ""}
                  theme={theme}
                />
              ) : (
                <div className="flex items-center justify-center h-full p-4 text-zinc-500 dark:text-zinc-400">
                  <p>Select an endpoint file to test it</p>
                </div>
              )}
          </TabsContent>
          <TabsContent 
            value="docs" 
            className="flex-1 h-[calc(100%-48px)] overflow-auto"
          >
            <div className="flex flex-col h-full">
              <div className="flex justify-between p-2 border-b border-zinc-200 dark:border-zinc-800">
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  {docFetchError ? (
                    <span className="text-amber-500">Using locally generated documentation</span>
                  ) : (
                    <span>{getDocumentationTitle()}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-700">
                    <Button
                      variant={viewMode === "rendered" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("rendered")}
                      className="rounded-none border-r border-zinc-200 dark:border-zinc-700 h-8"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      <span className="text-xs">Rendered</span>
                    </Button>
                    <Button
                      variant={viewMode === "source" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("source")}
                      className="rounded-none h-8"
                    >
                      <Code className="h-4 w-4 mr-1" />
                      <span className="text-xs">Source</span>
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRefreshKey((prev) => prev + 1)}
                    disabled={isLoadingDocs}
                  >
                    {isLoadingDocs ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    <span className="ml-2 text-xs">Refresh</span>
                  </Button>
                </div>
              </div>
              {isLoadingDocs ? (
                <div className="flex items-center justify-center h-full p-4">
                  <Loader2 className="h-8 w-8 animate-spin text-[#7dff00]" />
                </div>
              ) : viewMode === "source" ? (
                <Editor
                  language="markdown"
                  value={documentation}
                  theme={theme === "dark" ? "vs-dark" : "light"}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "off",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: "on",
                    readOnly: true,
                    domReadOnly: true,
                    contextmenu: false,
                  }}
                />
              ) : (
                <div className="overflow-auto h-full p-6 bg-white dark:bg-zinc-900">
                  <div className="max-w-3xl mx-auto prose dark:prose-invert prose-headings:border-b prose-headings:border-zinc-200 dark:prose-headings:border-zinc-800 prose-headings:pb-2 prose-headings:mb-4">
                    <ReactMarkdown
                      components={{
                        code({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) {
                          const match = /language-(\w+)/.exec(className ?? "")
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={theme === "dark" ? vscDarkPlus : vs}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          )
                        },
                      }}
                    >
                      {documentation}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}