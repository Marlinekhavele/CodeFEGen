"use client"

import type React from "react"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { ThumbsUp, ThumbsDown, Copy, CornerUpRight, Paperclip, Maximize2, TriangleAlert, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import CodeGenService from "@/app/api/services/code-gen-service"
import type { FileType } from "@/types"
import { useCodeStore } from "@/stores/code-store"

// Add this near the top of the file, after the imports
declare global {
  interface Window {
    revalidatePaths?: (projectId: string) => void
  }
}

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

type CodeGenStatus = "idle" | "generating" | "generated" | "generationFailed"

type AIChartProps = {
  projectId: string
  onFileGenerated?: (file: FileType) => void
}

// Constants for configuration
const GENERATION_TIMEOUT = 120000; // 2 minutes in milliseconds
const HEARTBEAT_INTERVAL = 30000; // 30 seconds in milliseconds

export default function AIChat({ projectId, onFileGenerated }: AIChartProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [lastMessage, setLastMessage] = useState<string | null>(null)
  const [codeGenStatus, setCodeGenStatus] = useState<CodeGenStatus>("idle")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // Add these state variables inside the AIChat component
  const [language, setLanguage] = useState<string>("python")
  const [framework, setFramework] = useState<string>("flask")
  const [endpointPath, setEndpointPath] = useState<string>("/api/example")
  const [method, setMethod] = useState<string>("GET")

  // Initialize code store if it exists
  const codeStore = typeof useCodeStore !== "undefined" ? useCodeStore : null

  // Add this near the top of the component
  const logLevel = process.env.NEXT_PUBLIC_LOG_LEVEL || "info"
  const shouldLog = logLevel === "debug" || logLevel === "trace"

  // Clean up WebSocket and timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const setupTimeoutHandler = () => {
    // Clear existing timeout if any
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      console.log("Code generation timed out after", GENERATION_TIMEOUT/1000, "seconds");
      
      if (wsRef.current) {
        wsRef.current.close();
      }
      
      setCodeGenStatus("generationFailed");
      setSuccessMessage("Code generation timed out. Please try again.");
      
      if (codeStore) {
        codeStore.getState().endStream();
      }
      
      // Add error message to chat
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Sorry, code generation timed out. This could be due to high server load or a complex request. Please try again with a simpler request or try later.",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    }, GENERATION_TIMEOUT);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || codeGenStatus === "generating") return

    // Close any existing WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setLastMessage(input.trim())
    setInput("")
    setCodeGenStatus("generating")
    setSuccessMessage("Preparing to generate code...")

    // Start code stream if code store exists
    if (codeStore) {
      codeStore.getState().startStream()
    }

    // Focus the input after sending
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)

    try {
      const codeGenService = new CodeGenService()

      console.log("Sending request to code generation service with:", {
        project_id: projectId,
        prompt: userMessage.content,
        language,
        method,
        endpoint_path: endpointPath,
        framework
      });

      // Use the correct interface format
      const response = await codeGenService.generateCode({
        project_id: projectId,
        prompt: userMessage.content,
        language: language,
        method: method,
        endpoint_path: endpointPath,
        additional_context: `Framework: ${framework}`,
      })

      // Check if response is defined
      if (!response) {
        throw new Error("No response received from code generation service")
      }

      // Get the WebSocket URL from the response
      const wsUrl = response.websocket_url

      if (!wsUrl) {
        throw new Error("WebSocket URL not provided")
      }

      console.log("Connecting to WebSocket:", wsUrl)
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws;
      
      // Setup timeout handler for code generation
      setupTimeoutHandler();

      let receivedFirstChunk = false;
      let messageCount = 0;
      let lastActivityTime = Date.now();

      // Setup heartbeat check to detect stalled connections
      const heartbeatInterval = setInterval(() => {
        const inactiveTime = Date.now() - lastActivityTime;
        if (inactiveTime > HEARTBEAT_INTERVAL) {
          console.warn(`No activity for ${inactiveTime/1000} seconds. Connection might be stalled.`);
          setSuccessMessage(`Waiting for server response... (${Math.floor(inactiveTime/1000)}s)`);
        }
      }, 10000); // Check every 10 seconds

      ws.onopen = () => {
        console.log("WebSocket connection established")
        setSuccessMessage("Connected to code generation service...")
        lastActivityTime = Date.now();
      }

      ws.onmessage = (event) => {
        lastActivityTime = Date.now();
        messageCount++;
        
        // Log raw message for debugging
        console.log(`WebSocket message #${messageCount} received:`, event.data.substring(0, 100) + (event.data.length > 100 ? "..." : ""));
        
        try {
          const messageData = JSON.parse(event.data)
          
          if (messageData.message && messageData.status) {
            setSuccessMessage(messageData.message)
          }

          if (messageData.is_chunk) {
            const chunk = atob(messageData.base64_encoded)
            console.log("Decoded chunk:", chunk.substring(0, 100) + (chunk.length > 100 ? "..." : ""));

            // Reset timeout since we're receiving data
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              setupTimeoutHandler();
            }

            // Skip first chunk if needed (as in RightPanelClient)
            if (!receivedFirstChunk) {
              receivedFirstChunk = true;
              console.log("First chunk received and skipped");
            } else if (codeStore) {
              // Append chunk to code store if it exists
              codeStore.getState().appendCode(chunk)
              console.log("Chunk appended to code store");
            }

            // Process chunk for file generation
            try {
              // Try to parse the chunk as JSON
              const chunkData = JSON.parse(chunk)

              if (chunkData.data) {
                // Process endpoint
                if (chunkData.data.endpoint) {
                  console.log("Processing endpoint data:", chunkData.data.endpoint);
                  
                  const file: FileType = {
                    id: chunkData.data.endpoint.endpoint_id || `endpoint-${Date.now()}`,
                    name: chunkData.data.endpoint.endpoint_path?.split("/").pop() || "Endpoint",
                    path: chunkData.data.endpoint.endpoint_path || "/api/endpoint",
                    type: "endpoint",
                    code: chunkData.data.endpoint.generated_code,
                    method: chunkData.data.endpoint.method as "GET" | "POST" | "PUT" | "DELETE",
                  }

                  if (onFileGenerated) {
                    onFileGenerated(file)
                    console.log("File generated and callback triggered");
                  }
                }

                // Process other file types similarly
                // ...
              }
            } catch (parseError) {
              // Not JSON or not in expected format, just continue
              console.log("Chunk is not JSON or not in expected format:", parseError)
            }
          } else if (messageData.status === "COMPLETED") {
            console.log("Code generation completed");
            
            // Clear timeout
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
            
            clearInterval(heartbeatInterval);
            
            if (codeStore) {
              codeStore.getState().endStream()
            }

            setCodeGenStatus("generated")
            setSuccessMessage("Code generation completed")

            // Add assistant response
            const assistantMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: "I've generated code based on your request. You can view it in the editor.",
              timestamp: new Date(),
            }

            setMessages((prev) => [...prev, assistantMessage])

            ws.close()
            wsRef.current = null;

            // Revalidate paths if needed
            if (typeof window !== "undefined" && typeof window.revalidatePaths === "function") {
              window.revalidatePaths(projectId)
            }
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error)
          setSuccessMessage("Error processing code generation")
          setCodeGenStatus("generationFailed")

          if (codeStore) {
            codeStore.getState().endStream()
          }
          
          clearInterval(heartbeatInterval);
          
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        }
      }

      ws.onerror = (error) => {
        console.error("WebSocket error:", error)
        setSuccessMessage("Connection error. Try again.")
        setCodeGenStatus("generationFailed")

        if (codeStore) {
          codeStore.getState().endStream()
        }
        
        clearInterval(heartbeatInterval);
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }

      ws.onclose = () => {
        console.log("WebSocket connection closed")
        wsRef.current = null;
        
        clearInterval(heartbeatInterval);
        
        // Only update status if we're still generating (avoid overriding completed status)
        const currentStatus = codeGenStatus;
        if (currentStatus === "generating") {
          setCodeGenStatus("generationFailed")
          setSuccessMessage("Connection closed unexpectedly. Try again.")

          if (codeStore) {
            codeStore.getState().endStream()
          }
          
          // Add error message
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "The connection was closed unexpectedly. This could be due to server issues or network problems. Please try again.",
            timestamp: new Date(),
          }

          setMessages((prev) => [...prev, errorMessage])
        }
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    } catch (error) {
      console.error("Error generating code:", error)
      setSuccessMessage("Something went wrong. Try again.")
      setCodeGenStatus("generationFailed")

      if (codeStore) {
        codeStore.getState().endStream()
      }

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error while generating code. Please try again.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
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
      setInput(lastMessage);
      handleSubmit();
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
                    ? "ml-auto bg-[#F8F8F8] text-black dark:bg-neutral-900 dark:text-white"
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
              <div className="animate-fade mt-3 flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-zinc-500 border-t-transparent rounded-full"></div>
                <span className="text-sm font-medium">{successMessage}</span>
              </div>
            )}
            {codeGenStatus === "generated" && (
              <div className="animate-fade mt-3 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-secondary-400"></div>
                  <span className="text-sm font-medium">{successMessage}</span>
                </div>
                <p className="text-sm text-neutral-500 dark:text-white">
                  Your backend is ready to go! You can now review, edit and save your code.
                </p>
              </div>
            )}
            {codeGenStatus === "generationFailed" && (
              <div className="animate-fade mt-2 flex items-center gap-2">
                <TriangleAlert className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium text-neutral-500 dark:text-white">
                  {successMessage || "Failed to generate code."}
                </span>
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
              placeholder="Describe the next API you want to build."
              className="min-h-[44px] max-h-[200px] py-3 pr-10 resize-none bg-zinc-50 border-zinc-200 text-zinc-800 placeholder:text-zinc-500 focus:border-[#7dff00] focus:ring-[#7dff00]/20 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200 dark:placeholder:text-zinc-500"
              disabled={codeGenStatus === "generating"}
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
            disabled={!input.trim() || codeGenStatus === "generating"}
          >
            <ArrowUp className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  )
}