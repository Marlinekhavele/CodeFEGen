// "use client"

// import { useState, useEffect, useRef, useCallback } from "react"
// import type { CodeGenData, FileType } from "@/types"

// // Configuration
// const WEBSOCKET_URL = "wss://codebegen.canadacentral.cloudapp.azure.com/api/v1/generate/stream"
// const WS_CONNECTION_TIMEOUT = 5000 // 5 seconds to establish connection

// export function useWebSocketCodeGen(options: {
//   onStatusChange?: (status: string) => void
//   onFileGenerated?: (file: FileType) => void
// } = {}) {
//   const [isGenerating, setIsGenerating] = useState(false)
//   const [status, setStatus] = useState("idle")
//   const [error, setError] = useState<Error | null>(null)
//   const [progress, setProgress] = useState(0)
//   const [messages, setMessages] = useState<string[]>([])
  
//   // Keep track of timeouts
//   const wsConnectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
//   const socketRef = useRef<WebSocket | null>(null)

//   // Update status with notification to UI
//   const updateStatus = useCallback((newStatus: string) => {
//     console.log("Status:", newStatus)
//     setStatus(newStatus)
//     if (options.onStatusChange) {
//       options.onStatusChange(newStatus)
//     }
//   }, [options])

//   // Process generated code
//   const processGeneratedCode = useCallback(
//     (data: any) => {
//       if (data.success && data.data) {
//         // Process endpoint
//         if (data.data.endpoint) {
//           const file: FileType = {
//             id: data.data.endpoint.endpoint_id || `endpoint-${Date.now()}`,
//             name: data.data.endpoint.endpoint_path?.split("/").pop() || "Endpoint",
//             path: data.data.endpoint.endpoint_path || "/api/endpoint",
//             type: "endpoint",
//             code: data.data.endpoint.generated_code,
//             method: data.data.endpoint.method as "GET" | "POST" | "PUT" | "DELETE",
//           }

//           if (options.onFileGenerated) {
//             options.onFileGenerated(file)
//           }
//         }

//         // Process model
//         if (data.data.model) {
//           const file: FileType = {
//             id: `model-${Date.now()}`,
//             name: data.data.model.entity_name || "Model",
//             path: data.data.model.file_path || "/models/model.py",
//             type: "model",
//             code: data.data.model.generated_code,
//           }

//           if (options.onFileGenerated) {
//             options.onFileGenerated(file)
//           }
//         }

//         // Process schema
//         if (data.data.schema) {
//           const file: FileType = {
//             id: `schema-${Date.now()}`,
//             name: data.data.schema.entity_name || "Schema",
//             path: data.data.schema.file_path || "/schemas/schema.json",
//             type: "schema",
//             code: data.data.schema.generated_code,
//           }

//           if (options.onFileGenerated) {
//             options.onFileGenerated(file)
//           }
//         }

//         // Process migration
//         if (data.data.migration) {
//           const file: FileType = {
//             id: `migration-${Date.now()}`,
//             name: data.data.migration.entity_name || "Migration",
//             path: data.data.migration.file_path || "/migrations/migration.py",
//             type: "migration",
//             code: data.data.migration.generated_code,
//           }

//           if (options.onFileGenerated) {
//             options.onFileGenerated(file)
//           }
//         }

//         // Process raw data if no structured data is available
//         if (data.data.raw) {
//           const file: FileType = {
//             id: `config-${Date.now()}`,
//             name: "Generated Code",
//             path: "/generated-code.txt",
//             type: "config", 
//             code: data.data.raw.generated_code,
//           }

//           if (options.onFileGenerated) {
//             options.onFileGenerated(file)
//           }
//         }
//       } else {
//         setError(new Error(data.message || "Unknown error processing generated code"))
//       }
//     },
//     [options],
//   )

//   // Clean up any active connections
//   const cleanup = useCallback(() => {
//     // Clear any WebSocket connection timeout
//     if (wsConnectionTimeoutRef.current) {
//       clearTimeout(wsConnectionTimeoutRef.current)
//       wsConnectionTimeoutRef.current = null
//     }
    
//     // Close WebSocket if open
//     if (socketRef.current) {
//       try {
//         if (socketRef.current.readyState !== WebSocket.CLOSED && 
//             socketRef.current.readyState !== WebSocket.CLOSING) {
//           socketRef.current.close()
//         }
//       } catch (e) {
//         console.error("Error closing WebSocket:", e)
//       }
//       socketRef.current = null
//     }
//   }, [])

//   // Generate a mock response as fallback
//   const generateMockResponse = useCallback((codeGenData: CodeGenData) => {
//     updateStatus("Generating mock response...")
    
//     // Create a simple progress simulation
//     let progressValue = 0
//     const progressInterval = setInterval(() => {
//       progressValue += 10
//       setProgress(Math.min(progressValue, 100))
      
//       if (progressValue >= 100) {
//         clearInterval(progressInterval)
//       }
//     }, 300)
    
//     // Simulate network delay for more realistic experience
//     setTimeout(() => {
//       clearInterval(progressInterval)
      
//       // Create a mock response based on request details
//       const mockEndpointPath = codeGenData.endpoint_path || "/api/mock"
//       const mockMethod = codeGenData.method || "GET"
//       const prompt = codeGenData.prompt || "Generated API endpoint"
      
//       const mockCode = `"""
// ${prompt}
// Method: ${mockMethod}
// Path: ${mockEndpointPath}
// Generated as a mock response when WebSocket connection failed.
// """

// from fastapi import APIRouter, Depends, HTTPException
// from typing import List, Optional
// from ..models.user import User
// from ..dependencies.auth import get_current_user

// router = APIRouter()

// @router.${mockMethod.toLowerCase()}("${mockEndpointPath}")
// async def ${mockMethod.toLowerCase()}_endpoint(
//     ${mockMethod === "GET" ? "" : "data: dict, "}current_user: User = Depends(get_current_user)
// ):
//     """
//     ${prompt}
//     """
//     return {
//         "message": "This is a mock response generated locally",
//         "status": "success",
//         "data": ${mockMethod === "GET" ? '[{"id": 1, "name": "Sample item"}]' : "data"}
//     }`
      
//       const mockResponse = {
//         success: true,
//         data: {
//           endpoint: {
//             endpoint_id: `endpoint-${Date.now()}`,
//             endpoint_path: mockEndpointPath,
//             method: mockMethod,
//             generated_code: mockCode
//           }
//         }
//       }
      
//       // Process the mock response
//       processGeneratedCode(mockResponse)
//       updateStatus("Generated mock response (WebSocket unavailable)")
//       setIsGenerating(false)
//     }, 2000)
//   }, [processGeneratedCode, updateStatus])

//   // Generate code function - main entry point
//   const generateCode = useCallback(
//     async (codeGenData: CodeGenData) => {
//       if (isGenerating) {
//         return
//       }

//       // Clean up any previous connections
//       cleanup()
      
//       // Start new generation
//       setIsGenerating(true)
//       updateStatus("Initializing code generation...")
//       setError(null)
//       setProgress(0)
//       setMessages([])
      
//       try {
//         // WebSocket approach
//         updateStatus("Attempting WebSocket connection...")
        
//         // Set a timeout for WebSocket connection
//         wsConnectionTimeoutRef.current = setTimeout(() => {
//           updateStatus("WebSocket connection timeout, using mock response...")
//           generateMockResponse(codeGenData)
//         }, WS_CONNECTION_TIMEOUT)
        
//         // Create WebSocket
//         const socket = new WebSocket(WEBSOCKET_URL)
//         socketRef.current = socket
//         let isConnectionSuccessful = false
        
//         // Socket open handler
//         socket.onopen = () => {
//           // Clear the connection timeout
//           if (wsConnectionTimeoutRef.current) {
//             clearTimeout(wsConnectionTimeoutRef.current)
//             wsConnectionTimeoutRef.current = null
//           }
          
//           isConnectionSuccessful = true
//           updateStatus("WebSocket connected, sending data...")
          
//           // Send the data
//           try {
//             socket.send(JSON.stringify(codeGenData))
//             updateStatus("Data sent, waiting for response...")
//           } catch (error) {
//             console.error("Error sending data via WebSocket:", error)
//             socket.close()
//             generateMockResponse(codeGenData)
//           }
//         }
        
//         // Message handler
//         let buffer = ""
//         socket.onmessage = (event) => {
//           try {
//             const message = event.data
            
//             if (typeof message === "string") {
//               // Add to buffer
//               buffer += message
              
//               // Try to parse as JSON
//               try {
//                 const data = JSON.parse(buffer)
//                 buffer = "" // Clear buffer on successful parse
                
//                 // Check if this is the completion message
//                 if (data.status === "completed" || data.completed || data.finished) {
//                   processGeneratedCode(data)
//                   updateStatus("Generation completed")
//                   setIsGenerating(false)
//                   socket.close()
//                 } else {
//                   // Regular status update
//                   if (data.message) {
//                     updateStatus(data.message)
//                   }
//                   if (data.progress) {
//                     setProgress(data.progress)
//                   }
//                 }
//               } catch (e) {
//                 // Not a complete JSON object yet, continue buffering
//               }
//             }
//           } catch (error) {
//             console.error("Error processing message:", error)
//           }
//         }
        
//         // Error handler
//         socket.onerror = (event) => {
//           console.error("WebSocket error:", event)
          
//           // Only fall back if we haven't already successfully connected
//           if (!isConnectionSuccessful) {
//             if (wsConnectionTimeoutRef.current) {
//               clearTimeout(wsConnectionTimeoutRef.current)
//               wsConnectionTimeoutRef.current = null
//             }
//             generateMockResponse(codeGenData)
//           }
//         }
        
//         // Close handler
//         socket.onclose = (event) => {
//           console.log(`WebSocket closed with code ${event.code}${event.reason ? `: ${event.reason}` : ""}`)
          
//           // If the socket closes before we've received a completion message,
//           // and we've successfully connected, generate a mock response
//           if (isGenerating && isConnectionSuccessful) {
//             updateStatus(`WebSocket closed unexpectedly (${event.code}), using mock response...`)
//             generateMockResponse(codeGenData)
//           }
//         }
//       } catch (error) {
//         console.error("Error setting up WebSocket:", error)
//         generateMockResponse(codeGenData)
//       }
//     },
//     [cleanup, generateMockResponse, isGenerating, processGeneratedCode, updateStatus]
//   )

//   // Clean up on unmount
//   useEffect(() => {
//     return () => {
//       cleanup()
//     }
//   }, [cleanup])

//   return {
//     generateCode,
//     isGenerating,
//     status,
//     error,
//     progress,
//     messages,
//     cancelGeneration: () => {
//       cleanup()
//       setIsGenerating(false)
//       updateStatus("Code generation cancelled")
//     },
//   }
// }

"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { CodeGenData, FileType } from "@/types"

// Configuration
const WEBSOCKET_URL = "wss://codebegen.canadacentral.cloudapp.azure.com/api/v1/generate/stream"
const HTTP_FALLBACK_URL = "https://codebegen.canadacentral.cloudapp.azure.com/api/v1/generate/code"
const WS_CONNECTION_TIMEOUT = 3000 // 3 seconds to establish connection

export function useWebSocketCodeGen(options: {
  onStatusChange?: (status: string) => void
  onFileGenerated?: (file: FileType) => void
} = {}) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [status, setStatus] = useState("idle")
  const [error, setError] = useState<Error | null>(null)
  const [progress, setProgress] = useState(0)
  const [messages, setMessages] = useState<string[]>([])
  
  // Keep track of the current generation request
  const requestIdRef = useRef<string>("")
  const abortControllerRef = useRef<AbortController | null>(null)
  const wsConnectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

  // Update status with notification to UI
  const updateStatus = useCallback((newStatus: string) => {
    setStatus(newStatus)
    if (options.onStatusChange) {
      options.onStatusChange(newStatus)
    }
  }, [options])

  // Clean up any active requests
  const cleanup = useCallback(() => {
    // Clear any WebSocket connection timeout
    if (wsConnectionTimeoutRef.current) {
      clearTimeout(wsConnectionTimeoutRef.current)
      wsConnectionTimeoutRef.current = null
    }
    
    // Abort any in-progress fetch requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  // Use HTTP fallback method
  const useHttpFallback = useCallback(async (codeGenData: CodeGenData) => {
    updateStatus("WebSocket unavailable, using HTTP fallback...")
    
    try {
      // Create a new abort controller for this request
      abortControllerRef.current = new AbortController()
      
      // Make the HTTP request
      const response = await fetch(HTTP_FALLBACK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(codeGenData),
        signal: abortControllerRef.current.signal
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Process the response
      updateStatus("Code generation completed via HTTP")
      processGeneratedCode(data)
      setIsGenerating(false)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // This is an expected abort, do nothing
        return
      }
      
      console.error("HTTP fallback error:", error)
      updateStatus(`HTTP fallback error: ${error instanceof Error ? error.message : "Unknown error"}`)
      
      // If even HTTP fails, use mock response as last resort
      generateMockResponse(codeGenData)
    }
  }, [processGeneratedCode, updateStatus])

  // Generate a mock response as last resort
  const generateMockResponse = useCallback((codeGenData: CodeGenData) => {
    updateStatus("Generating mock response...")
    
    setTimeout(() => {
      // Create a simple mock response based on the request
      const mockEndpointPath = codeGenData.endpoint_path || "/api/mock"
      const mockMethod = codeGenData.method || "GET"
      
      const mockResponse = {
        success: true,
        data: {
          endpoint: {
            endpoint_id: `endpoint-${Date.now()}`,
            endpoint_path: mockEndpointPath,
            method: mockMethod,
            generated_code: `"""
Mock endpoint created as fallback when code generation services were unavailable.
Method: ${mockMethod}
Path: ${mockEndpointPath}
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from ..models.user import User
from ..dependencies.auth import get_current_user

router = APIRouter()

@router.${mockMethod.toLowerCase()}("${mockEndpointPath}")
async def ${mockMethod.toLowerCase()}_endpoint(
    ${mockMethod === "GET" ? "" : "data: dict, "}current_user: User = Depends(get_current_user)
):
    """
    ${codeGenData.prompt || "Mock endpoint handler"}
    """
    return {
        "message": "Mock response - code generation service unavailable",
        "status": "success",
        "data": ${mockMethod === "GET" ? '[{"id": 1, "name": "Mock item"}]' : "data"}
    }`
          }
        }
      }
      
      // Process the mock response
      processGeneratedCode(mockResponse)
      updateStatus("Generated mock response (fallback)")
      setIsGenerating(false)
    }, 1000)
  }, [processGeneratedCode, updateStatus])

  // Generate code function - main entry point
  const generateCode = useCallback(
    async (codeGenData: CodeGenData) => {
      if (isGenerating) {
        return
      }

      // Clean up any previous requests
      cleanup()
      
      // Start new generation
      setIsGenerating(true)
      updateStatus("Initializing code generation...")
      setError(null)
      setProgress(0)
      setMessages([])
      
      // Generate a unique ID for this request
      requestIdRef.current = `req-${Date.now()}`
      
      try {
        // Try WebSocket first
        updateStatus("Attempting WebSocket connection...")
        
        // Set a timeout for WebSocket connection
        wsConnectionTimeoutRef.current = setTimeout(() => {
          updateStatus("WebSocket connection timeout, falling back to HTTP...")
          useHttpFallback(codeGenData)
        }, WS_CONNECTION_TIMEOUT)
        
        // Create WebSocket
        const socket = new WebSocket(WEBSOCKET_URL)
        let isConnectionSuccessful = false
        
        // Socket open handler
        socket.onopen = () => {
          // Clear the connection timeout
          if (wsConnectionTimeoutRef.current) {
            clearTimeout(wsConnectionTimeoutRef.current)
            wsConnectionTimeoutRef.current = null
          }
          
          isConnectionSuccessful = true
          updateStatus("WebSocket connected, sending data...")
          
          // Send the data
          try {
            socket.send(JSON.stringify(codeGenData))
            updateStatus("Data sent, waiting for response...")
          } catch (error) {
            console.error("Error sending data via WebSocket:", error)
            socket.close()
            useHttpFallback(codeGenData)
          }
        }
        
        // Message handler
        let buffer = ""
        socket.onmessage = (event) => {
          try {
            const message = event.data
            
            if (typeof message === "string") {
              // Add to buffer
              buffer += message
              
              // Try to parse as JSON
              try {
                const data = JSON.parse(buffer)
                buffer = "" // Clear buffer on successful parse
                
                // Check if this is the completion message
                if (data.status === "completed" || data.completed || data.finished) {
                  processGeneratedCode(data)
                  updateStatus("Generation completed")
                  setIsGenerating(false)
                  socket.close()
                } else {
                  // Regular status update
                  if (data.message) {
                    updateStatus(data.message)
                  }
                  if (data.progress) {
                    setProgress(data.progress)
                  }
                }
              } catch (e) {
                // Not a complete JSON object yet, continue buffering
              }
            }
          } catch (error) {
            console.error("Error processing message:", error)
          }
        }
        
        // Error handler
        socket.onerror = (event) => {
          console.error("WebSocket error:", event)
          
          // Only fall back if we haven't already successfully connected
          if (!isConnectionSuccessful) {
            if (wsConnectionTimeoutRef.current) {
              clearTimeout(wsConnectionTimeoutRef.current)
              wsConnectionTimeoutRef.current = null
            }
            useHttpFallback(codeGenData)
          }
        }
        
        // Close handler
        socket.onclose = (event) => {
          console.log(`WebSocket closed with code ${event.code}${event.reason ? `: ${event.reason}` : ""}`)
          
          // If the socket closes before we've received a completion message,
          // and we've successfully connected, fall back to HTTP
          if (isGenerating && isConnectionSuccessful) {
            updateStatus(`WebSocket closed unexpectedly (${event.code}), using HTTP fallback...`)
            useHttpFallback(codeGenData)
          }
        }
      } catch (error) {
        console.error("Error setting up WebSocket:", error)
        useHttpFallback(codeGenData)
      }
    },
    [cleanup, generateMockResponse, isGenerating, processGeneratedCode, updateStatus, useHttpFallback],
  )

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  return {
    generateCode,
    isGenerating,
    status,
    error,
    progress,
    messages,
    cancelGeneration: () => {
      cleanup()
      setIsGenerating(false)
      updateStatus("Code generation cancelled")
    },
  }
}