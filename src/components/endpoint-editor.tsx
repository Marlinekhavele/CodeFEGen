"use client"

import { useEffect, useRef } from "react"

interface EndpointEditorProps {
  code: string
  onChange: (code: string) => void
}

export function EndpointEditor({ code, onChange }: EndpointEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!editorRef.current) return

    const pre = document.createElement("pre")
    pre.className = "language-python line-numbers"
    pre.style.margin = "0"
    pre.style.borderRadius = "0"
    pre.style.height = "100%"
    pre.style.backgroundColor = "#09090b" // zinc-950
    pre.style.fontSize = "14px"
    pre.style.padding = "1rem"
    pre.style.overflow = "auto"
    pre.style.color = "#e4e4e7" // zinc-200

    const code = document.createElement("code")
    code.className = "language-python"
    code.textContent = formatPythonCode(editorRef.current.getAttribute("data-code") || "")

    pre.appendChild(code)
    editorRef.current.innerHTML = ""
    editorRef.current.appendChild(pre)

    // Add line numbers
    const lines = (editorRef.current.getAttribute("data-code") || "").split("\n").length
    const lineNumbers = document.createElement("div")
    lineNumbers.className = "line-numbers-rows"
    lineNumbers.style.position = "absolute"
    lineNumbers.style.top = "1rem"
    lineNumbers.style.left = "0"
    lineNumbers.style.width = "2.5rem"
    lineNumbers.style.textAlign = "right"
    lineNumbers.style.paddingRight = "0.5rem"
    lineNumbers.style.color = "#52525b" // zinc-600
    lineNumbers.style.pointerEvents = "none"
    lineNumbers.style.fontSize = "14px"
    lineNumbers.style.fontFamily = "monospace"

    for (let i = 1; i <= lines; i++) {
      const span = document.createElement("span")
      span.textContent = i.toString()
      span.style.display = "block"
      lineNumbers.appendChild(span)
    }

    pre.style.paddingLeft = "3rem"
    pre.style.position = "relative"
    pre.appendChild(lineNumbers)

    // Syntax highlighting
    highlightSyntax(code)
  }, [code])

  function formatPythonCode(code: string) {
    return code
  }

  function highlightSyntax(codeElement: HTMLElement) {
    const keywords = [
      "def",
      "return",
      "if",
      "not",
      "or",
      "and",
      "in",
      "for",
      "while",
      "import",
      "from",
      "as",
      "class",
      "try",
      "except",
      "finally",
      "with",
      "lambda",
      "None",
      "True",
      "False",
      "pass",
      "break",
      "continue",
      "yield",
      "async",
      "await",
    ]

    const functions = [
      "jsonify",
      "request",
      "query",
      "filter_by",
      "first",
      "check_password",
      "generate_token",
      "to_dict",
    ]

    let html = codeElement.textContent || ""

    // Highlight keywords
    keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "g")
      html = html.replace(regex, `<span style="color: #4ade80;">${keyword}</span>`) // green-400
    })

    // Highlight functions
    functions.forEach((func) => {
      const regex = new RegExp(`\\b${func}\\b`, "g")
      html = html.replace(regex, `<span style="color: #60a5fa;">${func}</span>`) // blue-400
    })

    // Highlight strings
    html = html.replace(/"([^"]*)"/g, '<span style="color: #fbbf24;">"$1"</span>') // amber-400
    html = html.replace(/'([^']*)'/g, "<span style=\"color: #fbbf24;\">'$1'</span>") // amber-400

    // Highlight comments
    html = html.replace(/(#.*)$/gm, '<span style="color: #a1a1aa;">$1</span>') // zinc-400

    // Highlight decorators
    html = html.replace(/(@\w+)/g, '<span style="color: #c084fc;">$1</span>') // purple-400

    // Highlight numbers
    html = html.replace(/\b(\d+)\b/g, '<span style="color: #fb7185;">$1</span>') // rose-400

    codeElement.innerHTML = html
  }

  return <div ref={editorRef} data-code={code} className="w-full h-full overflow-auto" />
}
