"use client"

import type React from "react"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { Send, ThumbsUp, ThumbsDown, Copy, CornerUpRight, Paperclip, Maximize2, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useWebSocketCodeGen } from "@/hooks/use-websocket-code-gen"
import type { FileType } from "@/types"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

type AIChartProps = {
  projectId: string
  onFileGenerated?: (file: FileType) => void
}

export default function AIChat({ projectId, onFileGenerated }: AIChartProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [lastMessage, setLastMessage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Add these state variables inside the AIChat component
  const [language, setLanguage] = useState<string>("python")
  const [framework, setFramework] = useState<string>("flask")
  const [endpointPath, setEndpointPath] = useState<string>("/api/example")
  const [method, setMethod] = useState<string>("GET")

  // Use our custom WebSocket hook
  const {
    generateCode,
    isGenerating,
    status,
    error,
    messages: wsMessages,
    cancelGeneration,
  } = useWebSocketCodeGen({
    onStatusChange: (statusMsg) => {
      console.log("Status changed:", statusMsg)
    },
    onFileGenerated: (file) => {
      if (onFileGenerated) {
        onFileGenerated(file)
      }

      // Update the Monaco editor with the generated code
      window.dispatchEvent(
        new CustomEvent("code-update", {
          detail: {
            files: {
              [file.type]: {
                generated_code: file.code,
                file_path: file.path,
                entity_name: file.name,
                method: file.method,
              },
            },
          },
        }),
      )
    },
  })

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isGenerating) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setLastMessage(input.trim())
    setInput("")

    // Focus the input after sending
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)

    // Use our generateCode function from the hook
    await generateCode({
      project_id: projectId,
      prompt: userMessage.content,
      language: language,
      method: method,
      endpoint_path: endpointPath,
      additional_context: `Framework: ${framework}`,
    })

    // Add assistant response after code generation
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "I've generated code based on your request. You can view it in the editor.",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, assistantMessage])
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

      generateCode({
        project_id: projectId,
        prompt: lastMessage,
        language: language,
        method: method,
        endpoint_path: endpointPath,
        additional_context: `Framework: ${framework}`,
      })
    }
  }

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
            {isGenerating && (
              <div className="flex items-center gap-2 text-sm">
                <div className="animate-spin h-4 w-4 border-2 border-zinc-500 border-t-transparent rounded-full"></div>
                <span>{status}</span>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 text-sm">
                <TriangleAlert className="h-4 w-4 text-red-500" />
                <span>{error.message || "Failed to generate code."}</span>
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
              disabled={isGenerating}
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
            disabled={!input.trim() || isGenerating}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
