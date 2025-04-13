"use client"

import { useEffect, useState } from "react"
import Editor from "@monaco-editor/react"

interface MonacoEditorProps {
  code: string
  language?: string
  onChange?: (code: string) => void
  readOnly?: boolean
  theme?: string
}

export function MonacoEditor({
  code,
  language = "python",
  onChange,
  readOnly = false,
  theme = "vs-dark",
}: MonacoEditorProps) {
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
    <div className="h-full w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-md overflow-hidden">
      {mounted ? (
        <Editor
          height="100%"
          defaultLanguage={language}
          defaultValue={code}
          value={code}
          onChange={handleEditorChange}
          theme={theme}
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
            automaticLayout: true,
          }}
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-white dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400">
          Loading editor...
        </div>
      )}
    </div>
  )
}
