"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, ThumbsUp, ThumbsDown, Copy, CornerUpRight, Paperclip, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

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
    setInput("")
    setIsLoading(true)

    // Focus the input after sending
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)

    try {
      // Simulate AI response
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I've analyzed your code and found a potential optimization in the login endpoint. The current implementation might have an issue with the password validation logic. Would you like me to suggest a fix?",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error getting AI response:", error)
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

  return (
    <div className="flex flex-col h-full border border-zinc-200 rounded-lg overflow-hidden dark:border-zinc-800">
      <div className="p-3 border-b border-zinc-200 bg-white dark:bg-zinc-900 dark:border-zinc-800 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">AI Assistant</h3>
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
