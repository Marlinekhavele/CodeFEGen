"use client"

import { useEffect, useState, useRef } from "react"
import Editor, { Monaco } from "@monaco-editor/react"
import type { editor } from "monaco-editor"

interface MonacoEditorProps {
  code: string
  language?: string
  onChange?: (code: string) => void
  readOnly?: boolean
  theme?: string
  streaming?: boolean
  streamingCode?: string
}

export function MonacoEditor({
  code,
  language = "python",
  onChange,
  readOnly = false,
  theme = "vs-dark",
  streaming = false,
  streamingCode = "",
}: MonacoEditorProps) {
  const [mounted, setMounted] = useState(false)
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const [initialContent] = useState(code) // Use initial code as base, only update in streaming mode
  
  // Previous streaming code length to determine what to append
  const prevStreamingCodeLength = useRef(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Effect for handling streaming updates
  useEffect(() => {
    if (streaming && editorRef.current && streamingCode) {
      // Get what was added since last update
      const newText = streamingCode.substring(prevStreamingCodeLength.current)
      if (newText) {
        // Get current editor model
        const model = editorRef.current.getModel()
        if (model) {
          // Get position at the end of content
          const lastLine = model.getLineCount()
          const lastColumn = model.getLineMaxColumn(lastLine)
          const position = { lineNumber: lastLine, column: lastColumn }
          
          // Insert the new text at the end
          editorRef.current.executeEdits('', [{
            range: {
              startLineNumber: position.lineNumber,
              startColumn: position.column,
              endLineNumber: position.lineNumber,
              endColumn: position.column
            },
            text: newText
          }])
          
          // Auto-scroll to the end
          editorRef.current.revealPositionInCenter(position)
        }
        
        // Update the previous length for next comparison
        prevStreamingCodeLength.current = streamingCode.length
      }
    }
  }, [streaming, streamingCode])

  const handleEditorChange = (value: string | undefined) => {
    if (onChange && value !== undefined) {
      onChange(value)
    }
  }

  // Reset streaming state when code changes (non-streaming update)
  useEffect(() => {
    if (!streaming) {
      prevStreamingCodeLength.current = 0
    }
  }, [code, streaming])

  const handleEditorWillMount = (monaco: Monaco) => {
    // Configure editor options
    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#18181b", // zinc-900
      },
    })

    monaco.editor.defineTheme("custom-light", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#ffffff", // white
      },
    })
  }

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor
  }

  // Map theme to custom theme
  const getTheme = () => {
    if (theme === "vs-dark") return "custom-dark"
    if (theme === "vs-light" || theme === "vs") return "custom-light"
    return theme
  }

  // Use streaming code in streaming mode, otherwise use regular code
  const displayCode = streaming ? initialContent : code

  return (
    <div className="h-full w-full border-0 bg-transparent overflow-hidden">
      {mounted ? (
        <Editor
          height="100vh"
          width="100%"
          defaultLanguage={language}
          defaultValue={displayCode}
          value={displayCode}
          onChange={handleEditorChange}
          theme={getTheme()}
          beforeMount={handleEditorWillMount}
          onMount={handleEditorDidMount}
          options={{
            readOnly: streaming || readOnly, // Lock editing during streaming
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            fontSize: 14,
            fontFamily: "'Fira Code', monospace",
            cursorBlinking: "smooth",
            renderLineHighlight: "all",
            scrollbar: {
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
            padding: { top: 10 },
            automaticLayout: true,
          }}
          className="h-full w-full"
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-zinc-900 text-zinc-500 dark:text-zinc-400">
          Loading editor...
        </div>
      )}
    </div>
  )
}