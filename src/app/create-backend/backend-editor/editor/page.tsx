"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { MonacoEditor } from "@/components/monaco-editor"
import { cn } from "@/lib/utils"
import EndpointService from "@/app/api/services/endpoint-service"

// Tab button component
function TabButton({
  isActive,
  onClick,
  children,
}: {
  isActive: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      className={cn(
        "px-4 py-2 text-sm font-medium border-b-2 transition-colors focus:outline-none",
        isActive
          ? "border-[#7dff00] text-[#7dff00] bg-[#7dff00]/10"
          : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300",
      )}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default function EditorPage() {
  const [code, setCode] = useState("")
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [editorTheme, setEditorTheme] = useState("vs-dark")
  const [parentTheme, setParentTheme] = useState<string | null>(null)

  // State to track active tab
  const [activeTab, setActiveTab] = useState<"code" | "test" | "docs">("code")

  // State for documentation content
  const [docs, setDocs] = useState<string>("# Loading documentation...")

  // Optional state for filename if needed
  const [fileName, setFileName] = useState<string>("Untitled")

  // Project ID and endpoint service
  const [projectId, setProjectId] = useState<string>("")
  const endpointService = new EndpointService()

  // Listen for messages from parent window to update code and theme
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "UPDATE_CODE") {
        console.log("Received code update:", event.data.code)
        setCode(event.data.code || "")
      }
      if (event.data && event.data.type === "THEME_CHANGED") {
        // Update theme from parent window
        setParentTheme(event.data.theme)
      }
      // Add handler for file name
      if (event.data && event.data.type === "UPDATE_FILENAME") {
        setFileName(event.data.fileName || "Untitled")
      }
      // Add handler for project ID
      if (event.data && event.data.type === "PROJECT_ID") {
        setProjectId(event.data.projectId || "")
      }
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  // Update editor theme based on the current theme or parent theme
  useEffect(() => {
    if (mounted) {
      // Use parent theme if available, otherwise use local theme
      const currentTheme = parentTheme || (theme === "system" ? resolvedTheme : theme)
      setEditorTheme(currentTheme === "dark" ? "vs-dark" : "vs-light")
      // Apply theme to document
      if (currentTheme === "dark") {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }
  }, [theme, resolvedTheme, mounted, parentTheme])

  useEffect(() => {
    setMounted(true)
    // Send message to parent when code changes
    const sendCodeToParent = () => {
      if (window.parent) {
        window.parent.postMessage({ type: "CODE_CHANGED", code }, "*")
      }
    }
    // Request theme from parent on load
    if (window.parent) {
      window.parent.postMessage({ type: "REQUEST_THEME" }, "*")
      window.parent.postMessage({ type: "REQUEST_PROJECT_ID" }, "*")
    }
    // Set up interval to check for code changes
    const interval = setInterval(sendCodeToParent, 1000)
    return () => clearInterval(interval)
  }, [code])

  // Fetch documentation when tab changes to docs
  useEffect(() => {
    if (activeTab === "docs" && projectId && fileName) {
      setDocs("# Loading documentation...")

      // Fetch documentation using the endpoint service
      const fetchDocs = async () => {
        try {
          const docContent = await endpointService.getDocumentation(projectId, fileName)
          setDocs(docContent)
        } catch (error) {
          console.error("Error fetching documentation:", error)
          setDocs(
            `# Documentation Error\n\nUnable to load documentation for ${fileName}.\n\nPlease check your connection and try again.`,
          )
        }
      }

      fetchDocs()
    }
  }, [activeTab, projectId, fileName])

  const handleCodeChange = (newCode: string) => {
    setCode(newCode)
    // Send code to parent window
    if (window.parent) {
      window.parent.postMessage({ type: "CODE_CHANGED", code: newCode }, "*")
    }
  }

  // Inform parent when tab changes
  const handleTabChange = (tab: "code" | "test" | "docs") => {
    setActiveTab(tab)
    if (window.parent) {
      window.parent.postMessage({ type: "TAB_CHANGED", tab }, "*")
    }
  }

  if (!mounted) {
    return null
  }

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "code":
        return <MonacoEditor code={code} language="python" onChange={handleCodeChange} theme={editorTheme} />
      case "test":
        return (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Test content will be displayed here</p>
          </div>
        )
      case "docs":
        return (
          <MonacoEditor
            code={docs}
            language="markdown"
            onChange={() => {}} // Make docs read-only
            theme={editorTheme}
            readOnly={true}
          />
        )
    }
  }

  return (
    <div className="w-full h-screen bg-white dark:bg-zinc-950 flex flex-col">
      {/* File name header - optional */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 p-3 flex items-center">
        <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{fileName}</div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <TabButton isActive={activeTab === "code"} onClick={() => handleTabChange("code")}>
          Code
        </TabButton>
        <TabButton isActive={activeTab === "test"} onClick={() => handleTabChange("test")}>
          Test
        </TabButton>
        <TabButton isActive={activeTab === "docs"} onClick={() => handleTabChange("docs")}>
          Docs
        </TabButton>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden">{renderContent()}</div>
    </div>
  )
}
