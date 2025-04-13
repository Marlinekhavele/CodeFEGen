"use client"

import { useEffect, useState } from "react"
import Editor from "@monaco-editor/react"

interface MonacoEditorProps {
  code: string
  language?: string
  onChange?: (code: string) => void
  readOnly?: boolean
}

export function MonacoEditor({ code, language = "python", onChange, readOnly = false }: MonacoEditorProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleEditorChange = (value: string | undefined) => {
    if (onChange && value !== undefined) {
      onChange(value)
    }
  }

  return (
    <div className="h-full w-full border border-zinc-800 bg-zinc-950 rounded-md overflow-hidden">
      {mounted ? (
        <Editor
          height="100%"
          defaultLanguage={language}
          defaultValue={code}
          value={code}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            readOnly,
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
          }}
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-zinc-950 text-zinc-400">
          Loading editor...
        </div>
      )}
    </div>
  )
}
