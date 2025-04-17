"use client"

import type React from "react"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { Send, ThumbsUp, ThumbsDown, Copy, CornerUpRight, Paperclip, Maximize2, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import CodeGenService from "@/app/api/services/code-gen-service"
import type { FileObject, CodeGenApiResponse } from "@/types"

// Add language and framework selection dropdowns
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

type CodeGenStatus = "idle" | "generating" | "generated" | "generationFailed"

// Update the component props to accept projectId
type AIChartProps = {
  projectId: string
}

export default function AIChat({ projectId }: AIChartProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [codeGenStatus, setCodeGenStatus] = useState<CodeGenStatus>("idle")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [lastMessage, setLastMessage] = useState<string | null>(null)
  const [generatedFiles, setGeneratedFiles] = useState<Record<string, FileObject> | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Add these state variables inside the AIChat component
  const [language, setLanguage] = useState<string>("python")
  const [framework, setFramework] = useState<string>("flask")
  const [endpointPath, setEndpointPath] = useState<string>("/api/example")
  const [method, setMethod] = useState<string>("GET")

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Process the response data and update the state
  const processResponseData = (data: CodeGenApiResponse) => {
    if (data.success && data.data) {
      // Create a map of file types to file objects
      const files: Record<string, FileObject> = {}

      // Add each file type to the map
      if (data.data.endpoint) files["endpoint"] = data.data.endpoint
      if (data.data.model) files["model"] = data.data.model
      if (data.data.schema) files["schema"] = data.data.schema
      if (data.data.migration) files["migration"] = data.data.migration

      setGeneratedFiles(files)

      // Update the Monaco editor with the files
      window.dispatchEvent(
        new CustomEvent("code-update", {
          detail: { files },
        }),
      )

      // Create a summary message for the chat
      const fileNames = Object.keys(files)
        .map((key) => {
          const file = files[key]
          return file.file_path.split("/").pop() || key
        })
        .join(", ")

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I've generated the following files: ${fileNames}. You can view them in the editor.`,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setCodeGenStatus("generated")
      setSuccessMessage("Code generated successfully!")
    } else {
      throw new Error(data.message || "Failed to generate code")
    }
  }

  // Update the handleSubmit function to use the projectId from props
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setLastMessage(input.trim())
    setInput("")
    setIsLoading(true)
    setCodeGenStatus("generating")
    setSuccessMessage("Generating code...")
    setGeneratedFiles(null)

    // Focus the input after sending
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)

    try {
      // Use the CodeGenService to generate code
      const codeGenService = new CodeGenService()

      // Try to get the structured response directly
      try {
        // Update the handleSubmit function to use the selected language, framework, method, and endpoint path
        // Replace the codeGenData object in both API calls with this:
        const codeGenData = {
          project_id: projectId,
          prompt: userMessage.content,
          language: language,
          method: method,
          endpoint_path: endpointPath,
          additional_context: `Framework: ${framework}`,
        }

        const structuredResponse = await codeGenService.getGeneratedCode(codeGenData)

        // If we got a successful structured response, process it
        if (structuredResponse.success) {
          processResponseData(structuredResponse)
          return
        }
      } catch (structuredError) {
        console.error("Error getting structured response:", structuredError)
        // Fall back to the WebSocket approach if direct API call fails
      }

      // Fall back to the WebSocket approach
      const codeGenData = {
        project_id: projectId,
        prompt: userMessage.content,
        language: language,
        method: method,
        endpoint_path: endpointPath,
        additional_context: `Framework: ${framework}`,
      }
      const response = await codeGenService.generateCode(codeGenData)

      // If the service returns a WebSocket URL for streaming
      if (response.websocket_url || (response.data && response.data.websocket_url)) {
        const wsUrl = response.websocket_url || (response.data && response.data.websocket_url) || ""
        console.log("WebSocket URL:", wsUrl)

        let accumulatedData = ""

        // Create WebSocket connection
        const ws = new WebSocket(wsUrl.startsWith("ws") ? wsUrl : `ws://${window.location.host}${wsUrl}`)

        ws.onopen = () => {
          console.log("WebSocket connection established")
          setSuccessMessage("Connected to code generation service...")
        }

        ws.onmessage = (event) => {
          try {
            const messageData = JSON.parse(event.data)
            console.log("WebSocket message received:", messageData)

            if (messageData.message && messageData.status) {
              setSuccessMessage(messageData.message)
            }

            if (messageData.is_chunk) {
              const chunk = atob(messageData.base64_encoded)
              accumulatedData += chunk

              // Update the Monaco editor with the chunk
              window.dispatchEvent(
                new CustomEvent("code-chunk", {
                  detail: { code: chunk },
                }),
              )
            } else if (messageData.status === "COMPLETED") {
              // Try to parse the accumulated data as a CodeGenApiResponse
              try {
                const parsedData = JSON.parse(accumulatedData)
                if (parsedData.status_code !== undefined && parsedData.data) {
                  processResponseData(parsedData)
                } else {
                  // If parsing fails, just show the raw data
                  window.dispatchEvent(
                    new CustomEvent("code-update", {
                      detail: { code: accumulatedData },
                    }),
                  )

                  const assistantMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: "I've generated code for you. Check the editor.",
                    timestamp: new Date(),
                  }

                  setMessages((prev) => [...prev, assistantMessage])
                  setCodeGenStatus("generated")
                }
              } catch (parseError) {
                console.error("Error parsing accumulated data:", parseError)
                // If JSON parsing fails, just show the raw data
                window.dispatchEvent(
                  new CustomEvent("code-update", {
                    detail: { code: accumulatedData },
                  }),
                )

                const assistantMessage: Message = {
                  id: (Date.now() + 1).toString(),
                  role: "assistant",
                  content: "I've generated code for you. Check the editor.",
                  timestamp: new Date(),
                }

                setMessages((prev) => [...prev, assistantMessage])
                setCodeGenStatus("generated")
              }

              ws.close()
            }
          } catch (error) {
            console.error("Error processing WebSocket message:", error)
            setSuccessMessage("Error processing code generation")
            setCodeGenStatus("generationFailed")
          }
        }

        ws.onerror = (error) => {
          console.error("WebSocket error:", error)
          setSuccessMessage("Connection error. Try again.")
          setCodeGenStatus("generationFailed")
        }

        ws.onclose = () => {
          console.log("WebSocket connection closed")
          if (codeGenStatus === "generating") {
            setCodeGenStatus("generationFailed")
            setSuccessMessage("Connection closed unexpectedly. Try again.")
          }
        }
      } else {
        // If not using WebSockets, handle the response directly
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "I've generated the code for you. Check the editor.",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])
        setCodeGenStatus("generated")

        // Update your Monaco editor with the generated code if available
        if (response.code) {
          window.dispatchEvent(
            new CustomEvent("code-update", {
              detail: { code: response.code },
            }),
          )
        }
      }
    } catch (error) {
      console.error("Error getting AI response:", error)
      setCodeGenStatus("generationFailed")
      setSuccessMessage("Something went wrong. Try again.")

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error while generating code. Please try again.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleRetry = () => {
    if (lastMessage) {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: lastMessage,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      handleSubmit()
    }
  }

  // Replace the return statement with this improved version
  return (
    <div className="flex flex-col h-full border border-zinc-200 rounded-lg overflow-hidden dark:border-zinc-800">
      <div className="p-3 border-b border-zinc-200 bg-white dark:bg-zinc-900 dark:border-zinc-800 flex items-center justify-between">
        <div>
          <Image src="/codeBE-logo.png" alt="CodeBEgen Logo" width={30} height={30} />
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
            <Maximize2 className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
            <span className="sr-only">Expand</span>
          </Button>
        </div>
      </div>

      {/* Add this form above the chat input */}
      <div className="p-3 border-b border-zinc-200 bg-white dark:bg-zinc-900 dark:border-zinc-800">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="language" className="text-xs">
              Language
            </Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language" className="h-8">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="go">Go</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="framework" className="text-xs">
              Framework
            </Label>
            <Select value={framework} onValueChange={setFramework}>
              <SelectTrigger id="framework" className="h-8">
                <SelectValue placeholder="Select framework" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flask">Flask</SelectItem>
                <SelectItem value="fastapi">FastAPI</SelectItem>
                <SelectItem value="django">Django</SelectItem>
                <SelectItem value="express">Express</SelectItem>
                <SelectItem value="nextjs">Next.js</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="method" className="text-xs">
              Method
            </Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger id="method" className="h-8">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="endpoint" className="text-xs">
              Endpoint Path
            </Label>
            <input
              id="endpoint"
              type="text"
              value={endpointPath}
              onChange={(e) => setEndpointPath(e.target.value)}
              className="w-full h-8 px-3 rounded-md border border-zinc-200 bg-zinc-50 text-sm dark:bg-zinc-800 dark:border-zinc-700"
              placeholder="/api/example"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-zinc-50 dark:bg-zinc-950">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-zinc-500 dark:text-zinc-400 text-sm">
            Ask the AI assistant about your code or for help with your backend.
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex flex-col max-w-[80%] rounded-lg p-3",
                  message.role === "user"
                    ? "ml-auto bg-[#7dff00] text-black"
                    : "bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100",
                )}
              >
                <div className="text-sm">{message.content}</div>
                {message.role === "assistant" && (
                  <div className="flex items-center gap-1 mt-2">
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                      <ThumbsUp className="h-3 w-3 text-zinc-500 dark:text-zinc-400" />
                      <span className="sr-only">Like</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                      <ThumbsDown className="h-3 w-3 text-zinc-500 dark:text-zinc-400" />
                      <span className="sr-only">Dislike</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                      <Copy className="h-3 w-3 text-zinc-500 dark:text-zinc-400" />
                      <span className="sr-only">Copy</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                      <CornerUpRight className="h-3 w-3 text-zinc-500 dark:text-zinc-400" />
                      <span className="sr-only">Share</span>
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {codeGenStatus === "generating" && (
              <div className="flex items-center gap-2 text-sm">
                <div className="animate-spin h-4 w-4 border-2 border-zinc-500 border-t-transparent rounded-full"></div>
                <span>{successMessage}</span>
              </div>
            )}
            {codeGenStatus === "generated" && (
              <div className="flex items-center gap-2 text-sm">
                <div className="h-4 w-4 rounded-full border-2 border-[#7dff00]"></div>
                <span>{successMessage || "Code generated successfully!"}</span>
              </div>
            )}
            {codeGenStatus === "generationFailed" && (
              <div className="flex items-center gap-2 text-sm">
                <TriangleAlert className="h-4 w-4 text-red-500" />
                <span>{successMessage || "Failed to generate code."}</span>
                <Button variant="outline" size="sm" className="ml-2 py-1 text-xs" onClick={handleRetry}>
                  Try again
                </Button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="p-3 border-t border-zinc-200 bg-white dark:bg-zinc-900 dark:border-zinc-800">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="relative flex-1">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a follow up..."
              className="min-h-[44px] max-h-[200px] py-3 pr-10 resize-none bg-zinc-50 border-zinc-200 text-zinc-800 placeholder:text-zinc-500 focus:border-[#7dff00] focus:ring-[#7dff00]/20 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200 dark:placeholder:text-zinc-500"
              disabled={isLoading}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <Button type="button" variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                <Paperclip className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                <span className="sr-only">Attach</span>
              </Button>
            </div>
          </div>
          <Button
            type="submit"
            size="icon"
            className="h-9 w-9 rounded-full bg-[#7dff00] text-black hover:bg-[#9aff33]"
            disabled={!input.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
