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

  const handleEditorWillMount = (monaco: any) => {
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

  // Map theme to custom theme
  const getTheme = () => {
    if (theme === "vs-dark") return "custom-dark"
    if (theme === "vs-light" || theme === "vs") return "custom-light"
    return theme
  }

  return (
    <div className="h-full w-full border-0 bg-transparent overflow-hidden">
      {mounted ? (
        <Editor
          height="100vh"
          width="100%"
          defaultLanguage={language}
          defaultValue={code}
          value={code}
          onChange={handleEditorChange}
          theme={getTheme()}
          beforeMount={handleEditorWillMount}
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
