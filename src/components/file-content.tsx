"use client"

import { useRef, useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { getMethodBadge } from "@/schemas/modal"
import { FileType } from "@/types"

interface FileContentProps {
  selectedFile: string | null
  currentCode: string
  files: FileType[]
  onCodeChange: (code: string) => void
  theme: string
}

export function FileContent({
  selectedFile,
  currentCode,
  files,
  onCodeChange,
  theme
}: FileContentProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [iframeLoaded, setIframeLoaded] = useState(false)

  // Update iframe when theme changes
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow && iframeLoaded) {
      iframeRef.current.contentWindow.postMessage({ type: "THEME_CHANGED", theme }, "*")
    }
  }, [theme, iframeLoaded])

  const handleIframeLoad = () => {
    setIframeLoaded(true)

    // Send initial theme and code to iframe
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: "THEME_CHANGED", theme }, "*")

      if (selectedFile) {
        const file = files.find((f) => f.id === selectedFile)
        if (file) {
          iframeRef.current.contentWindow.postMessage({ type: "UPDATE_CODE", code: file.code }, "*")
        }
      }
    }
  }

  // Update current code when selected file changes
  useEffect(() => {
    if (selectedFile && iframeLoaded) {
      const file = files.find((f) => f.id === selectedFile)
      if (file) {
        // Send code to iframe
        if (iframeRef.current && iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.postMessage({ type: "UPDATE_CODE", code: file.code }, "*")
        }
      }
    }
  }, [selectedFile, files, iframeLoaded])

  // Listen for messages from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "CODE_CHANGED") {
        onCodeChange(event.data.code)
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [onCodeChange])

  return (
    <div className="flex flex-col rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden h-full">
      <Tabs defaultValue="code" className="flex-1 h-full">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-2">
            {selectedFile && (
              <>
                {files.find((f) => f.id === selectedFile)?.type === "endpoint" &&
                  getMethodBadge(
                    files.find((f) => f.id === selectedFile)?.path || "", 
                    files.find((f) => f.id === selectedFile)?.method
                  )}
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {files.find((f) => f.id === selectedFile)?.path ||
                    files.find((f) => f.id === selectedFile)?.name}
                </span>
              </>
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

        <TabsContent value="code" className="flex-1 p-0 data-[state=active]:flex bg-transparent h-full">
          <div className="w-full h-full" id="monaco-editor-container">
            <iframe
              ref={iframeRef}
              src="/create-backend/backend-editor/editor"
              className="w-full h-full border-0 bg-transparent"
              title="Code Editor"
              style={{ height: "calc(100vh - 300px)" }}
              onLoad={handleIframeLoad}
            />
          </div>
        </TabsContent>

        <TabsContent value="test" className="bg-white dark:bg-zinc-950 p-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Test Endpoint</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Test your endpoint with different parameters and see the response.
            </p>

            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <h4 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-2">Request Body</h4>
              <div className="bg-white rounded-md p-4 font-mono text-sm text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
                {`{
  "email": "user@example.com",
  "password": "securepassword123"
}`}
              </div>

              <div className="mt-4 flex justify-end">
                <Button size="sm" className="bg-[#7dff00] text-black hover:bg-[#9aff33]">
                  Send Request
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="docs" className="bg-white dark:bg-zinc-950 p-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">API Documentation</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Automatically generated documentation for this endpoint.
            </p>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1">Endpoint</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="text-blue-400 font-medium">
                    {files.find((f) => f.id === selectedFile)?.method || "POST"}
                  </span> {files.find((f) => f.id === selectedFile)?.path || "/endpoint"}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1">Description</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {files.find((f) => f.id === selectedFile)?.type === "endpoint" 
                    ? "Handles API requests for this endpoint."
                    : files.find((f) => f.id === selectedFile)?.type === "model"
                    ? "Database model definition."
                    : files.find((f) => f.id === selectedFile)?.type === "schema"
                    ? "JSON schema for validation."
                    : "Configuration file."}
                </p>
              </div>

              {files.find((f) => f.id === selectedFile)?.type === "endpoint" && (
                <>
                  <div>
                    <h4 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1">Request Body</h4>
                    <div className="bg-zinc-50 rounded-md p-3 font-mono text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
                      {`{
  "email": "string", // Required. User's email address
  "password": "string" // Required. User's password
}`}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1">Responses</h4>
                    <div className="space-y-2">
                      <div className="bg-green-500/10 border border-green-500/20 rounded-md p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-green-400">200 OK</span>
                        </div>
                        <div className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
                          {`{
  "message": "Success",
  "data": {}
}`}
                        </div>
                      </div>

                      <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-red-400">400 Bad Request</span>
                        </div>
                        <div className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
                          {`{
  "error": "Invalid request parameters"
}`}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}