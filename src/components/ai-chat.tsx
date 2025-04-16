"use client"

import type React from "react"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { Send, ThumbsUp, ThumbsDown, Copy, CornerUpRight, Paperclip, Maximize2, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import CodeGenService from "@/app/api/services/code-gen-service"

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

export function AIChat({ projectId }: AIChartProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [codeGenStatus, setCodeGenStatus] = useState<CodeGenStatus>("idle")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [lastMessage, setLastMessage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

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

    // Focus the input after sending
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)

    try {
      // Use the CodeGenService to generate code
      const codeGenService = new CodeGenService()
      const response = await codeGenService.generateCode({
        project_id: projectId,
        prompt: userMessage.content,
        language: "typescript", // You can make this dynamic based on user input or context
        method: "GET", // Default method, can be made dynamic
        endpoint_path: "/api/example", // Default path, can be made dynamic
        additional_context: "", // Optional additional context
      })

      // If the service returns a WebSocket URL for streaming
      if (response.websocket_url) {
        const ws = new WebSocket(response.websocket_url)

        ws.onopen = () => {
          console.log("WebSocket connection established")
        }

        ws.onmessage = (event) => {
          try {
            const messageData = JSON.parse(event.data)

            if (messageData.message && messageData.status) {
              setSuccessMessage(messageData.message)
            }

            if (messageData.is_chunk) {
              const chunk = atob(messageData.base64_encoded)
              // Update your Monaco editor with the chunk
              window.dispatchEvent(
                new CustomEvent("code-chunk", {
                  detail: { code: chunk },
                }),
              )
            } else if (messageData.status === "COMPLETED") {
              setCodeGenStatus("generated")
              ws.close()
            }
          } catch (error) {
            console.error("Error processing message:", error)
            setSuccessMessage("Error processing code generation")
            setCodeGenStatus("generationFailed")
          }
        }

        ws.onerror = (error) => {
          console.error("WebSocket error:", error)
          setSuccessMessage("Connection error. Try again.")
          setCodeGenStatus("generationFailed")
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
