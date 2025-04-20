// @/components/file-content.tsx
"use client"

import { Editor } from "@monaco-editor/react"
import { FileType } from "@/types"

type FileContentProps = {
  selectedFile: string | null
  currentCode: string
  files: FileType[]
  onCodeChange: (value: string) => void
  theme: string | undefined
  streamingCode?: string // Add support for streaming code
}

export function FileContent({ 
  selectedFile,
  currentCode,
  files,
  onCodeChange,
  theme,
  streamingCode = ""
}: FileContentProps) {
  // Find the selected file to determine language
  const file = files.find(f => f.id === selectedFile)
  
  // Determine what language to use for the editor
  const getLanguage = () => {
    if (!file) {
      // If no file is selected but we have streaming code, try to determine language
      if (streamingCode) {
        // Logic to detect language from streaming code
        if (streamingCode.includes("def ") && streamingCode.includes(":")) return "python"
        if (streamingCode.includes("import React") || streamingCode.includes("export default")) return "javascript"
        if (streamingCode.includes("func ") && streamingCode.includes("package ")) return "go"
        if (streamingCode.includes("interface ") || streamingCode.includes("class ")) return "typescript"
        
        // Default to Python for API generation
        return "python"
      }
      return "python" // Default
    }
    
    const filePath = file.path || ""
    
    if (filePath.endsWith(".py")) return "python"
    if (filePath.endsWith(".js")) return "javascript"
    if (filePath.endsWith(".ts")) return "typescript"
    if (filePath.endsWith(".go")) return "go"
    if (filePath.endsWith(".sql")) return "sql"
    if (filePath.endsWith(".json")) return "json"
    if (filePath.endsWith(".md")) return "markdown"
    
    // Default based on common language patterns
    if (file.code.includes("func ") && file.code.includes("package ")) return "go"
    if (file.code.includes("import React") || file.code.includes("export default")) return "javascript"
    if (file.code.includes("def ") && file.code.includes(":")) return "python"
    
    return "python" // Default to Python if unable to determine
  }
  
  // Decide what code to display
  // If a file is selected, show its content
  // If no file is selected but we have streaming code, show the streaming preview
  const displayCode = selectedFile 
    ? currentCode 
    : streamingCode 
      ? streamingCode 
      : currentCode;
  
  // Get title for the editor
  const getEditorTitle = () => {
    if (selectedFile && file) {
      return file.path || file.name || "Code Editor";
    } else if (streamingCode) {
      return "AI Generated Code (Preview)";
    } else {
      return "Select a file or generate code";
    }
  };

  return (
    <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-full flex flex-col">
      <div className="p-2 border-b border-zinc-200 dark:border-zinc-800">
        <div className="text-sm font-medium">
          {getEditorTitle()}
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {(selectedFile || streamingCode) ? (
          <Editor
            language={getLanguage()}
            value={displayCode}
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
              readOnly: !selectedFile && !!streamingCode // Make read-only if showing streaming code
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-500 dark:text-zinc-400">
            <p>Select a file to view or edit its content, or use the AI chat to generate code</p>
          </div>
        )}
      </div>
    </div>
  )
}