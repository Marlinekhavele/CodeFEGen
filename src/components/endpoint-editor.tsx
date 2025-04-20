"use client"

import { MonacoEditor } from "./monaco-editor"
import { detectLanguage } from "@/utils/detect-language"

interface EndpointEditorProps {
  code: string
  onChange: (code: string) => void
  readOnly?: boolean
  streaming?: boolean
  streamingCode?: string
}

export function EndpointEditor({ 
  code, 
  onChange, 
  readOnly = false,
  streaming = false,
  streamingCode = ""
}: EndpointEditorProps) {
  const language = detectLanguage("", code)

  return (
    <MonacoEditor
      code={code}
      language={language}
      onChange={onChange}
      readOnly={readOnly}
      streaming={streaming}
      streamingCode={streamingCode}
    />
  )
}
