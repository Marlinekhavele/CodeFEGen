"use client"

import { useEffect, useState } from "react"
import { Editor } from "@monaco-editor/react"
import type { FileType } from "@/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import EndPointService from "@/app/api/services/endpoint-service"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, Code, FileText } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism"

type FileContentProps = {
  selectedFile: string | null
  currentCode: string
  files: FileType[]
  onCodeChange: (value: string) => void
  theme?: string
  streamingCode?: string
  projectId?: string
}

export function FileContent({
  selectedFile,
  currentCode,
  files,
  onCodeChange,
  theme,
  streamingCode = "",
  projectId,
}: FileContentProps) {
  // Find the selected file
  const file = files.find((f) => f.id === selectedFile)

  // State for documentation content
  const [documentation, setDocumentation] = useState<string>("# Select a file to view its documentation")
  const [isLoadingDocs, setIsLoadingDocs] = useState(false)
  const [activeTab, setActiveTab] = useState("code")
  const [refreshKey, setRefreshKey] = useState(0) // Used to force refresh documentation
  const [docFetchError, setDocFetchError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"rendered" | "source">("rendered")

  // Find API documentation file in the files array
  const apiDocFile = files.find((f) => f.type === "api_docs" && f.path?.includes("docs/api.md"))

  // Debug logs to help identify issues
  useEffect(() => {
    if (activeTab === "docs") {
      console.log("FileContent component props:", {
        selectedFile,
        projectId,
        activeTab,
        fileExists: !!file,
        fileName: file?.name,
        filePath: file?.path,
        apiDocExists: !!apiDocFile,
      })
    }
  }, [selectedFile, projectId, activeTab, file, apiDocFile])

  // Fetch documentation when tab changes to docs
  useEffect(() => {
    if (activeTab === "docs") {
      setIsLoadingDocs(true)
      setDocumentation("# Loading documentation...")
      setDocFetchError(null)

      // First try to use the API docs file if it exists in the files array
      if (apiDocFile && apiDocFile.code) {
        console.log("Using API docs from files array:", apiDocFile.name)
        setDocumentation(apiDocFile.code)
        setIsLoadingDocs(false)
        return
      }

      // If no API docs file exists, try to fetch from backend
      const fetchDocumentation = async () => {
        try {
          // Try to fetch documentation using the endpoint service
          const endpointService = new EndPointService()
          const docContent = await endpointService.getDoc(projectId || "", "api.md")

          if (docContent && docContent.trim()) {
            setDocumentation(docContent)
          } else {
            setDocumentation(
              `# Documentation Not Found\n\nNo documentation was found for this project.\n\n` +
                `The documentation may not have been generated yet.`,
            )
          }
        } catch (error) {
          console.error("Documentation fetch failed:", error)
          setDocFetchError(error instanceof Error ? error.message : String(error))

          // If we have any API docs file in the files array, use it as fallback
          const anyApiDoc = files.find((f) => f.type === "api_docs")
          if (anyApiDoc && anyApiDoc.code) {
            console.log("Using fallback API docs:", anyApiDoc.name)
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
  }, [activeTab, projectId, apiDocFile, files, refreshKey])

  const getCleanFileName = (file: FileType | undefined) => {
    if (!file) return "Untitled"

    // Start with the name or path
    let fileName = file.name || ""

    if (!fileName && file.path) {
      // Extract just the filename from the path
      fileName = file.path.split("/").pop() || file.path
    }

    fileName = fileName.replace(/\.(get|post|put|delete)\./i, ".")

    // For endpoints, create a clean name
    if (file.type === "endpoint") {
      // Extract the base name without extension
      const baseName = fileName.replace(/\.[^/.]+$/, "")

      // Get just the base name (also remove HTTP method if it's a prefix)
      const cleanBase = baseName.replace(/^(get|post|put|delete)[-_]?/i, "")

      // Add the .py extension for Python files
      return cleanBase + ".py"
    }

    return fileName
  }

  // Determine what language to use for syntax highlighting
  const getLanguage = () => {
    if (!file) {
      // If no file is selected but we have streaming code, try to detect language
      if (streamingCode) {
        if (streamingCode.includes("def ") && streamingCode.includes(":")) return "python"
        if (streamingCode.includes("import React") || streamingCode.includes("export default")) return "javascript"
        if (streamingCode.includes("func ") && streamingCode.includes("package ")) return "go"
        if (streamingCode.includes("interface ") || streamingCode.includes("class ")) return "typescript"
        return "python"
      }
      return "python" // Default
    }

    const filePath = file.path || ""

    // Determine by extension
    if (filePath.endsWith(".py")) return "python"
    if (filePath.endsWith(".js")) return "javascript"
    if (filePath.endsWith(".ts")) return "typescript"
    if (filePath.endsWith(".go")) return "go"
    if (filePath.endsWith(".sql")) return "sql"
    if (filePath.endsWith(".json")) return "json"
    if (filePath.endsWith(".md")) return "markdown"

    // Determine by type
    if (file.type === "model" || file.type === "schema" || file.type === "endpoint") {
      return "python"
    }
    return "python" // Default
  }

  // Get method badge for endpoint
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

  return (
    <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-full flex flex-col">
      <Tabs
        defaultValue="code"
        value={activeTab}
        className="flex-1 h-full"
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

        <TabsContent value="code" className="flex-1 h-[calc(100%-48px)] data-[state=active]:h-[calc(100%-48px)]">
          {selectedFile || streamingCode ? (
            <Editor
              language={getLanguage()}
              value={selectedFile ? currentCode : streamingCode}
              onChange={(value) => value !== undefined && onCodeChange(value)}
              theme={theme === "dark" ? "vs-dark" : "light"}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: "on",
                readOnly: !selectedFile && !!streamingCode,
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-500 dark:text-zinc-400">
              <p>Select a file to view or edit its content, or use the AI chat to generate code</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="test" className="flex-1 h-[calc(100%-48px)]">
          <div className="flex items-center justify-center h-full p-4 text-zinc-500 dark:text-zinc-400">
            <p>Test content will be displayed here</p>
          </div>
        </TabsContent>

        <TabsContent value="docs" className="flex-1 h-[calc(100%-48px)]">
          <div className="flex flex-col h-full">
            <div className="flex justify-between p-2 border-b border-zinc-200 dark:border-zinc-800">
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                {docFetchError ? (
                  <span className="text-amber-500">Using locally generated documentation</span>
                ) : (
                  <span>API Documentation</span>
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
      </Tabs>
    </div>
  )
}
