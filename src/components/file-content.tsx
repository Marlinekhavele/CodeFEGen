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
  activeTab?: string  // Prop for current active tab
  setActiveTab?: (tab: string) => void  // Prop for setting active tab
}

export function FileContent({
  selectedFile,
  currentCode,
  files,
  onCodeChange,
  theme,
  streamingCode = "",
  projectId,
  activeTab = "code",  // Default to code tab
  setActiveTab = () => {},  // Default empty function
}: FileContentProps) {
  // Find the selected file
  const file = files.find((f) => f.id === selectedFile)

  // State for documentation content
  const [documentation, setDocumentation] = useState<string>("# Select a file to view its documentation")
  const [isLoadingDocs, setIsLoadingDocs] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0) // Used to force refresh documentation
  const [docFetchError, setDocFetchError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"rendered" | "source">("rendered")
  
  // Get entity name from the file
  const getEntityName = (file: FileType | undefined) => {
    if (!file) return null
    
    // Try to extract entity name from file path or name
    const fileName = file.name || file.path?.split("/").pop() || ""
    
    // For endpoints, try to extract entity name from the path or filename
    if (file.type === "endpoint") {
      // Handle different file naming patterns:
      // 1. order.get.py -> order
      // 2. get_order.py -> order
      // 3. order.py -> order
      
      // First, remove the extension
      const withoutExtension = fileName.replace(/\.[^/.]+$/, "")
      
      // Check if it follows pattern "resource.method.py" (like order.get.py)
      const resourceMethodPattern = withoutExtension.match(/^(.+)\.(get|post|put|delete)$/i)
      if (resourceMethodPattern) {
        return resourceMethodPattern[1] // Return the resource name part
      }
      
      // Check if it follows pattern "method_resource.py" (like get_order.py)
      const methodResourcePattern = withoutExtension.match(/^(get|post|put|delete)[_-](.+)$/i)
      if (methodResourcePattern) {
        return methodResourcePattern[2] // Return the resource name part
      }
      
      // If no special pattern, just return the name without extension
      // Remove any HTTP method prefix if it exists
      return withoutExtension.replace(/^(get|post|put|delete)[_-]?/i, "")
    }
    
    return null
  }
  
  // Find relevant documentation file for the selected file
  const findDocumentationForFile = () => {
    if (!file) return null
    
    const entityName = getEntityName(file)
    
    if (entityName) {
      // Look for different possible documentation file naming patterns
      const possibleDocFiles = files.filter(f => 
        f.type === "api_docs" && (
          // Check for exact entity name match
          f.path?.includes(`${entityName}.md`) || 
          // Check for HTTP method + entity name
          (file.method && f.path?.includes(`${entityName}.${file.method?.toLowerCase()}.md`)) ||
          // Check for full filename match (without extension)
          (file.name && f.path?.includes(`${file.name.replace(/\.[^/.]+$/, "")}.md`))
        )
      )
      
      // If we found any matching doc files, use the first one
      if (possibleDocFiles.length > 0) {
        console.log(`Found documentation file for ${entityName}:`, possibleDocFiles[0].path)
        return possibleDocFiles[0]
      }
      
      // Log when we can't find a matching doc file
      console.log(`No documentation file found for entity: ${entityName}, looking for generic API docs`)
    }
    
    // If no entity-specific doc found and this is an endpoint, try using api.md as fallback
    if (file.type === "endpoint") {
      const apiDoc = files.find(f => f.type === "api_docs" && f.path?.includes("api.md"))
      if (apiDoc) {
        console.log("Using api.md as fallback documentation")
        return apiDoc
      }
    }
    
    return null
  }

  // Debug logs to help identify issues
  useEffect(() => {
    // Add debug logging for code tab too
    if (selectedFile) {
      console.log("FileContent component - selected file:", {
        selectedFile,
        fileExists: !!file,
        fileName: file?.name,
        filePath: file?.path,
        fileType: file?.type,
        codeLength: currentCode?.length,
        hasCode: !!currentCode,
        activeTab
      })
    }
  }, [selectedFile, file, currentCode, activeTab])

  // Fetch documentation when tab changes to docs or selected file changes
  useEffect(() => {
    if (activeTab === "docs") {
      setIsLoadingDocs(true)
      setDocumentation("# Loading documentation...")
      setDocFetchError(null)

      const docFile = findDocumentationForFile()
      const entityName = getEntityName(file)

      // First try to use the specific doc file if it exists in the files array
      if (docFile && docFile.code) {
        console.log(`Using documentation for ${entityName || 'API'}:`, docFile.name || docFile.path)
        setDocumentation(docFile.code)
        setIsLoadingDocs(false)
        return
      }

      // If no specific doc file exists, try to fetch from backend
      const fetchDocumentation = async () => {
        try {
          // Try to fetch documentation using the endpoint service
          const endpointService = new EndPointService()
          
          // First try to fetch entity-specific doc
          let docContent = ""
          if (entityName) {
            try {
              // Try with original entity name
              docContent = await endpointService.getDoc(projectId || "", `${entityName}.md`)
              console.log(`Found ${entityName}.md on server`)
            } catch (entityError) {
              console.log(`No doc for ${entityName}.md, trying other variations`)
              
              // If HTTP method is available, try with method suffix
              if (file?.method) {
                try {
                  docContent = await endpointService.getDoc(projectId || "", `${entityName}.${file.method.toLowerCase()}.md`)
                  console.log(`Found ${entityName}.${file.method.toLowerCase()}.md on server`)
                } catch (methodError) {
                  console.log(`No doc with method suffix found, falling back to api.md`)
                }
              }
            }
          }
          
          // If no entity-specific doc, fall back to api.md
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

          // If we have any API docs file in the files array, use it as fallback
          const anyApiDoc = files.find((f) => f.type === "api_docs")
          if (anyApiDoc && anyApiDoc.code) {
            console.log("Using fallback API docs:", anyApiDoc.name || anyApiDoc.path)
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

    // Add debug logging for language detection
    console.log("Detecting language for:", {
      fileName: file.name,
      filePath: file.path,
      fileType: file.type
    })

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

  // Get documentation title based on selected file
  const getDocumentationTitle = () => {
    if (!file) return "API Documentation"
    
    const entityName = getEntityName(file)
    if (entityName) {
      return `${entityName} Documentation`
    }
    
    return file.type === "endpoint" ? "Endpoint Documentation" : "API Documentation"
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
            <>
              {console.log("Rendering editor with:", { 
                language: getLanguage(),
                codeLength: selectedFile ? currentCode?.length : streamingCode?.length,
                isSelectedFile: !!selectedFile,
                selectedFileId: selectedFile
              })}
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
            </>
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
      </Tabs>
    </div>
  )
}