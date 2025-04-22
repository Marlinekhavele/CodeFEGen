"use client"

import { Editor } from "@monaco-editor/react"
import { FileType } from "@/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type FileContentProps = {
  selectedFile: string | null
  currentCode: string
  files: FileType[]
  onCodeChange: (value: string) => void
  theme?: string
  streamingCode?: string
}

export function FileContent({ 
  selectedFile,
  currentCode,
  files,
  onCodeChange,
  theme,
  streamingCode = ""
}: FileContentProps) {
  // Find the selected file
  const file = files.find(f => f.id === selectedFile)
  
  // Get clean file name from path - more aggressive cleaning
  const getCleanFileName = (file: FileType | undefined) => {
    if (!file) return "Untitled";
    
    // Start with the name or path
    let fileName = file.name || "";
    
    if (!fileName && file.path) {
      // Extract just the filename from the path
      fileName = file.path.split('/').pop() || file.path;
    }
    
    // More aggressive method pattern removal
    fileName = fileName.replace(/\.(get|post|put|delete)\./i, ".");
    
    // For endpoints, create a clean name
    if (file.type === "endpoint") {
      // Extract the base name without extension
      const baseName = fileName.replace(/\.[^/.]+$/, "");
      
      // Get just the base name (also remove HTTP method if it's a prefix)
      const cleanBase = baseName.replace(/^(get|post|put|delete)[-_]?/i, "");
      
      // Add the .py extension for Python files
      return cleanBase + ".py";
    }
    
    return fileName;
  };
  
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
    if (!file || !file.method) return null;
    
    const method = file.method.toUpperCase();
    
    let badgeClass = "text-xs px-1.5 py-0.5 rounded-sm ";
    
    switch (method) {
      case "GET":
        badgeClass += "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
        break;
      case "POST":
        badgeClass += "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
        break;
      case "PUT":
        badgeClass += "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
        break;
      case "DELETE":
        badgeClass += "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
        break;
      default:
        badgeClass += "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
    }
    
    return (
      <span className={badgeClass}>
        {method}
      </span>
    );
  };
  
  // For diagnostic purposes, let's print the file information to help debug
  console.log("Selected file:", file);
  console.log("Clean file name:", getCleanFileName(file));

  return (
    <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-full flex flex-col">
      <Tabs defaultValue="code" className="flex-1 h-full">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-2">
            {selectedFile && (
              <>
                {file?.type === "endpoint" && getMethodBadge(file.path || "")}
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {getCleanFileName(file)}
                </span>
              </>
            )}
            {!selectedFile && streamingCode && (
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                AI Generated Code (Preview)
              </span>
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
          {(selectedFile || streamingCode) ? (
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
                readOnly: !selectedFile && !!streamingCode // Read-only for streaming preview
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
          <div className="flex items-center justify-center h-full p-4 text-zinc-500 dark:text-zinc-400">
            <p>Documentation will be displayed here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}