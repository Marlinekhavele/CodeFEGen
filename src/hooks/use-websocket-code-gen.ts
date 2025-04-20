"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { WebSocketManager, type WebSocketOptions } from "@/lib/websocket-manager"
import CodeGenService from "@/app/api/services/code-gen-service"
import type { CodeGenData, FileType } from "@/types"

interface UseWebSocketCodeGenOptions {
  onStatusChange?: (status: string) => void
  onFileGenerated?: (file: FileType) => void
}

export function useWebSocketCodeGen(options: UseWebSocketCodeGenOptions = {}) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [status, setStatus] = useState("idle")
  const [error, setError] = useState<Error | null>(null)
  const [progress, setProgress] = useState(0)
  const [messages, setMessages] = useState<string[]>([])
  const wsManagerRef = useRef<WebSocketManager | null>(null)

  // Initialize WebSocket manager
  useEffect(() => {
    const wsOptions: WebSocketOptions = {
      onStatus: (status, message) => {
        const statusMessage = `${status}${message ? `: ${message}` : ""}`
        setMessages((prev) => [...prev, statusMessage])

        if (status === "open") {
          setStatus("connected")
        } else if (status === "closed") {
          setStatus("disconnected")
          setIsGenerating(false)
        } else if (status === "error") {
          setStatus("error")
          setIsGenerating(false)
        } else if (status === "connecting") {
          setStatus("connecting")
        }

        if (options.onStatusChange) {
          options.onStatusChange(statusMessage)
        }
      },
      onMessage: (data) => {
        if (data.message) {
          setMessages((prev) => [...prev, data.message])
          setStatus(data.message)
        }

        if (data.progress) {
          setProgress(data.progress)
        }
      },
      onChunk: (chunk) => {
        setMessages((prev) => [...prev, `Received chunk: ${chunk.length} bytes`])
      },
      onComplete: (data) => {
        setStatus("Code generation completed")
        setIsGenerating(false)
        processGeneratedCode(data)
      },
      onError: (err) => {
        setError(err)
        setStatus(`Error: ${err.message}`)
        setIsGenerating(false)
      },
    }

    wsManagerRef.current = new WebSocketManager(wsOptions)

    return () => {
      if (wsManagerRef.current) {
        wsManagerRef.current.close()
      }
    }
  }, [options])

  // Process generated code
  const processGeneratedCode = useCallback(
    (data: any) => {
      if (data.success && data.data) {
        // Process endpoint
        if (data.data.endpoint) {
          const file: FileType = {
            id: data.data.endpoint.endpoint_id || `endpoint-${Date.now()}`,
            name: data.data.endpoint.endpoint_path?.split("/").pop() || "Endpoint",
            path: data.data.endpoint.endpoint_path || "/api/endpoint",
            type: "endpoint",
            code: data.data.endpoint.generated_code,
            method: data.data.endpoint.method as "GET" | "POST" | "PUT" | "DELETE",
          }

          if (options.onFileGenerated) {
            options.onFileGenerated(file)
          }
        }

        // Process model
        if (data.data.model) {
          const file: FileType = {
            id: `model-${Date.now()}`,
            name: data.data.model.entity_name || "Model",
            path: data.data.model.file_path || "/models/model.py",
            type: "model",
            code: data.data.model.generated_code,
          }

          if (options.onFileGenerated) {
            options.onFileGenerated(file)
          }
        }

        // Process schema
        if (data.data.schema) {
          const file: FileType = {
            id: `schema-${Date.now()}`,
            name: data.data.schema.entity_name || "Schema",
            path: data.data.schema.file_path || "/schemas/schema.json",
            type: "schema",
            code: data.data.schema.generated_code,
          }

          if (options.onFileGenerated) {
            options.onFileGenerated(file)
          }
        }

        // Process migration
        if (data.data.migration) {
          const file: FileType = {
            id: `migration-${Date.now()}`,
            name: data.data.migration.entity_name || "Migration",
            path: data.data.migration.file_path || "/migrations/migration.py",
            type: "migration",
            code: data.data.migration.generated_code,
          }

          if (options.onFileGenerated) {
            options.onFileGenerated(file)
          }
        }

        // Process raw data if no structured data is available
        if (data.data.raw) {
          const file: FileType = {
            id: `config-${Date.now()}`,
            name: "Generated Code",
            path: "/generated-code.txt",
            type: "config", 
            code: data.data.raw.generated_code,
          }

          if (options.onFileGenerated) {
            options.onFileGenerated(file)
          }
        }
      } else {
        setError(new Error(data.message || "Unknown error processing generated code"))
      }
    },
    [options],
  )

  // Generate code function with timeout
const generateCode = useCallback(
  async (codeGenData: CodeGenData) => {
    if (isGenerating) {
      return
    }

    setIsGenerating(true)
    setStatus("Initializing code generation...")
    setError(null)
    setProgress(0)
    setMessages([])

    try {
      // Set up WebSocket URL
      const wsUrl = "wss://codebegen.canadacentral.cloudapp.azure.com/api/v1/generate/stream"
      
      setStatus("Preparing to connect...")
      
      // Add a timeout before attempting to connect
      setTimeout(() => {
        if (wsManagerRef.current) {
          try {
            // Connect to the WebSocket with a delay
            setStatus("Connecting to WebSocket...")
            wsManagerRef.current.connect(wsUrl)
            
            // Add another delay before sending data
            setTimeout(() => {
              if (wsManagerRef.current && wsManagerRef.current.isConnected()) {
                setStatus("Connection established, sending data...")
                wsManagerRef.current.send(codeGenData)
                setStatus("Data sent, waiting for response...")
              } else {
                throw new Error("WebSocket connection failed")
              }
            }, 1000) // Wait 1 second after connection before sending data
          } catch (wsError) {
            console.error("Error in WebSocket operation:", wsError)
            setError(wsError instanceof Error ? wsError : new Error("Unknown WebSocket error"))
            setStatus("WebSocket error occurred")
            setIsGenerating(false)
          }
        } else {
          setError(new Error("WebSocket manager not initialized"))
          setStatus("WebSocket manager not initialized")
          setIsGenerating(false)
        }
      }, 500) // Wait 500ms before attempting to connect
    } catch (error) {
      console.error("Error in generate code function:", error)
      setError(error instanceof Error ? error : new Error("Unknown error"))
      setStatus(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
      setIsGenerating(false)
    }
  },
  [isGenerating]
)
  return {
    generateCode,
    isGenerating,
    status,
    error,
    progress,
    messages,
    cancelGeneration: () => {
      if (wsManagerRef.current) {
        wsManagerRef.current.close()
      }
      setIsGenerating(false)
      setStatus("Code generation cancelled")
    },
  }
}