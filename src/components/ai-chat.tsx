"use client"

import type React from "react"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { ThumbsUp, ThumbsDown, Copy, CornerUpRight, Paperclip, Maximize2, TriangleAlert, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
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
  endpointDetails?: {
    language: string
    framework: string
    endpointPath: string
    method: string
    description: string
  } | null
  projectLanguage?: string
  projectFramework?: string
}

// Constants for configuration
const GENERATION_TIMEOUT = 120000; // 2 minutes in milliseconds
const HEARTBEAT_INTERVAL = 30000; // 30 seconds in milliseconds

// Helper function to clean filenames
const cleanFileName = (fileName: string): string => {
  // Remove HTTP method from extension pattern (e.g., "login.get.py" to "login.py")
  return fileName.replace(/\.(get|post|put|delete)\./i, ".");
}

export default function AIChat({ projectId, onFileGenerated, endpointDetails, projectLanguage = "python", projectFramework = "fastapi"}: AIChartProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [codeGenStatus, setCodeGenStatus] = useState<CodeGenStatus>("idle")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [lastMessage, setLastMessage] = useState<string | null>(null)
  const [generatedFiles, setGeneratedFiles] = useState<Record<string, any> | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize code store if it exists
  const codeStore = typeof useCodeStore !== "undefined" ? useCodeStore : null

  // Listen for new endpoint details and generate code when they're provided
  useEffect(() => {
    if (endpointDetails && !isLoading && codeGenStatus !== "generating") {
      // Use provided language/framework from endpointDetails
      const { language, framework, endpointPath, method, description } = endpointDetails;
      
      // Create a more detailed prompt that includes language and framework
      const prompt = `Create a ${method} endpoint at ${endpointPath} using ${language} with ${framework} that ${description}`;
      
      // Set input and trigger submission
      setInput(prompt);
      
      // Use setTimeout to allow state to update before submitting
      setTimeout(() => {
        handleSubmitWithDetails(prompt, language, framework, endpointPath, method);
      }, 100);
    }
  }, [endpointDetails]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Clean up WebSocket connection and timeouts on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [])

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
      setIsLoading(false);
      
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

  // Process the response data and update the state
  const processResponseData = (data: any) => {
    console.log("Processing response data:", data)
    
    if (data.success && data.data) {
      const files: Record<string, any> = {}

      if (
        data.data.endpoint &&
        data.data.endpoint.file_path &&
        data.data.endpoint.generated_code &&
        data.data.endpoint.content_base64 &&
        data.data.endpoint.file_hash
      ) {
        files["endpoint"] = {
          file_path: data.data.endpoint.file_path,
          generated_code: data.data.endpoint.generated_code,
          content_base64: data.data.endpoint.content_base64,
          file_hash: data.data.endpoint.file_hash,
          endpoint_path: data.data.endpoint.endpoint_path ?? "",
          method: data.data.endpoint.method ?? "",
          endpoint_id: data.data.endpoint.endpoint_id,
          exists: "exists" in data.data.endpoint && typeof (data.data.endpoint as any).exists === "boolean" ? (data.data.endpoint as any).exists : false,
        }
      }
      if (data.data.model && data.data.model.file_path && data.data.model.generated_code && data.data.model.content_base64 && data.data.model.file_hash) {
        files["model"] = {
          file_path: data.data.model.file_path,
          generated_code: data.data.model.generated_code,
          content_base64: data.data.model.content_base64,
          file_hash: data.data.model.file_hash,
          entity_name: data.data.model.entity_name,
          exists: data.data.model.exists,
        }
      }
      if (data.data.schema && data.data.schema.file_path && data.data.schema.generated_code && data.data.schema.content_base64 && data.data.schema.file_hash) {
        files["schema"] = {
          file_path: data.data.schema.file_path,
          generated_code: data.data.schema.generated_code,
          content_base64: data.data.schema.content_base64,
          file_hash: data.data.schema.file_hash,
          entity_name: data.data.schema.entity_name,
          exists: data.data.schema.exists,
        }
      }
      if (data.data.migration && data.data.migration.file_path && data.data.migration.generated_code && data.data.migration.content_base64 && data.data.migration.file_hash) {
        files["migration"] = {
          file_path: data.data.migration.file_path,
          generated_code: data.data.migration.generated_code,
          content_base64: data.data.migration.content_base64,
          file_hash: data.data.migration.file_hash,
          entity_name: data.data.migration.entity_name,
          exists: data.data.migration.exists,
        }
      }
      if (data.data.helpers && data.data.helpers.file_path && data.data.helpers.generated_code && data.data.helpers.content_base64 && data.data.helpers.file_hash) {
        files["helpers"] = {
          file_path: data.data.helpers.file_path,
          generated_code: data.data.helpers.generated_code,
          content_base64: data.data.helpers.content_base64,
          file_hash: data.data.helpers.file_hash,
          entity_name: data.data.helpers.entity_name,
          exists: data.data.helpers.exists,
        }
      }
      if (data.data.config && data.data.config.file_path && data.data.config.generated_code && data.data.config.content_base64 && data.data.config.file_hash) {
        files["config"] = {
          file_path: data.data.config.file_path,
          generated_code: data.data.config.generated_code,
          content_base64: data.data.config.content_base64,
          file_hash: data.data.config.file_hash,
          entity_name: data.data.config.entity_name,
          exists: data.data.config.exists,
        }
      }

      setGeneratedFiles(files)

      // Dispatch event with generated files - this is crucial for BackendEditorClient to get the files
      window.dispatchEvent(
        new CustomEvent("code-update", {
          detail: { files },
        }),
      )

      // If onFileGenerated callback provided, call it for each file
      if (onFileGenerated) {
        Object.keys(files).forEach(key => {
          const fileData = files[key];
          // Get the filename and clean it
          let fileName = fileData.file_path?.split("/").pop() || key;
          fileName = cleanFileName(fileName);
          
          const file: FileType = {
            id: fileData.endpoint_id || `${key}-${Date.now()}`,
            name: fileName, // Clean filename
            path: fileData.endpoint_path || fileData.file_path || "",
            type: key as "endpoint" | "model" | "schema" | "migration" | "helpers" | "config",
            code: fileData.generated_code,
            method: fileData.method as "GET" | "POST" | "PUT" | "DELETE",
          };
          onFileGenerated(file);
        });
      }

      const fileNames = Object.keys(files)
        .map((key) => {
          const file = files[key]
          const fileName = file.file_path?.split("/").pop() || key;
          return cleanFileName(fileName);
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
    } else if (data.result) {
      // Handle the direct result structure
      const files: Record<string, any> = {}
      
      if (data.result.endpoint) {
        files["endpoint"] = data.result.endpoint;
      }
      if (data.result.model) {
        files["model"] = data.result.model;
      }
      if (data.result.schema) {
        files["schema"] = data.result.schema;
      }
      if (data.result.migration) {
        files["migration"] = data.result.migration;
      }
      if (data.result.helpers) {
        files["helpers"] = data.result.helpers;
      }
      if (data.result.config) {
        files["config"] = data.result.config;
      }
      
      if (Object.keys(files).length > 0) {
        setGeneratedFiles(files);
        
        // Dispatch event with generated files
        window.dispatchEvent(
          new CustomEvent("code-update", {
            detail: { files },
          }),
        );
        
        // If onFileGenerated callback provided, call it for each file
        if (onFileGenerated) {
          Object.keys(files).forEach(key => {
            const fileData = files[key];
            // Get the filename and clean it
            let fileName = fileData.file_path?.split("/").pop() || key;
            fileName = cleanFileName(fileName);
            
            const file: FileType = {
              id: fileData.endpoint_id || `${key}-${Date.now()}`,
              name: fileName, // Clean filename
              path: fileData.endpoint_path || fileData.file_path || "",
              type: key as "endpoint" | "model" | "schema" | "migration" | "helpers" | "config",
              code: fileData.generated_code,
              method: fileData.method as "GET" | "POST" | "PUT" | "DELETE",
            };
            onFileGenerated(file);
          });
        }
        
        const fileNames = Object.keys(files)
          .map((key) => {
            const file = files[key];
            const fileName = file.file_path?.split("/").pop() || key;
            return cleanFileName(fileName);
          })
          .join(", ");
          
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `I've generated the following files: ${fileNames}. You can view them in the editor.`,
          timestamp: new Date(),
        }
        
        setMessages((prev) => [...prev, assistantMessage]);
        setCodeGenStatus("generated");
        setSuccessMessage("Code generated successfully!");
      }
    } else {
      throw new Error(data.message || "Failed to generate code")
    }
  }

  const handleSubmitWithDetails = (
    promptText: string, 
    language: string, 
    framework: string, 
    endpointPath: string, 
    method: string
  ) => {
    if (!promptText.trim() || isLoading) return;

    // Close any existing WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: promptText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLastMessage(promptText.trim());
    setInput("");
    setIsLoading(true);
    setCodeGenStatus("generating");
    setSuccessMessage("Generating code...");
    setGeneratedFiles(null);

    // Start code stream if code store exists
    if (codeStore) {
      codeStore.getState().startStream();
    }

    try {
      // Only use WebSocket for code generation
      const codeGenData = {
        project_id: projectId,
        prompt: promptText.trim(),
        language: language,
        method: method,
        endpoint_path: endpointPath,
        additional_context: `Framework: ${framework}`,
      };

      console.log("Connecting to WebSocket with data:", codeGenData);

      // Direct WebSocket connection
      const ws = new WebSocket("wss://codebegen.canadacentral.cloudapp.azure.com/api/v1/generate/stream");
      wsRef.current = ws;

      // Setup timeout handler
      setupTimeoutHandler();

      let accumulatedData = "";
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
        console.log("WebSocket connected, sending data");
        setSuccessMessage("Connected to code generation service...");
        lastActivityTime = Date.now();
        ws.send(JSON.stringify(codeGenData));
      };

      ws.onmessage = (event) => {
        try {
          lastActivityTime = Date.now();
          messageCount++;
          
          // Log raw message for debugging
          console.log(`WebSocket message #${messageCount} received:`, event.data.substring(0, 100) + (event.data.length > 100 ? "..." : ""));
          
          const data = JSON.parse(event.data);

          // Handle token streaming
          if (data.token) {
            accumulatedData += data.token;
            
            // Reset timeout since we're receiving data
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              setupTimeoutHandler();
            }
            
            // Skip first chunk if needed
            if (!receivedFirstChunk) {
              receivedFirstChunk = true;
              console.log("First chunk received");
            }
            
            // Dispatch code chunk event
            window.dispatchEvent(
              new CustomEvent("code-chunk", {
                detail: { code: data.token },
              }),
            );
            
            // Update code store if it exists
            if (codeStore) {
              codeStore.getState().appendCode(data.token);
            }
          }
          
          // Handle status updates
          if (data.status) {
            if (data.message) {
              setSuccessMessage(data.message);
            }
            
            // Handle progress updates
            if (data.status === "progress" && data.stage) {
              setSuccessMessage(`Generating ${data.stage}...`);
            }
            
            // Handle completed stages
            if (data.status === "completed" && data.stage && data.result) {
              console.log(`${data.stage} generation completed:`, data.result);
              
              // Process completed stage data
              if (data.result && data.result.generated_code) {
                const stageData = data.result;
                const fileType = data.stage as "endpoint" | "model" | "schema" | "migration" | "helpers" | "config";
                
                // Get filename and clean it
                let fileName = stageData.file_path?.split("/").pop() || fileType;
                fileName = cleanFileName(fileName);
                
                // Create standardized file object
                const file: FileType = {
                  id: stageData.endpoint_id || `${fileType}-${Date.now()}`,
                  name: fileName,
                  path: stageData.endpoint_path || stageData.file_path || `/${fileType}`,
                  type: fileType,
                  code: stageData.generated_code,
                  method: (stageData.method as "GET" | "POST" | "PUT" | "DELETE") || "GET",
                };
                
                // Call the callback directly
                if (onFileGenerated) {
                  onFileGenerated(file);
                }
                
                // Also dispatch an event for each completed file
                window.dispatchEvent(
                  new CustomEvent("file-generated", {
                    detail: { file },
                  }),
                );
              }
            }
            
            // Handle overall completion
            if (data.status === "complete") {
              console.log("Code generation complete:", data);
              
              // Clear timeout
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
              
              clearInterval(heartbeatInterval);
              
              if (data.result) {
                // Create a collection of files from the result
                const files: Record<string, any> = {};
                
                // Process all components in the result
                ["endpoint", "model", "schema", "migration", "helpers", "config"].forEach(component => {
                  if (data.result[component]) {
                    files[component] = data.result[component];
                  }
                });
                
                // If we have any files, process them
                if (Object.keys(files).length > 0) {
                  // Dispatch code-update event with all files
                  window.dispatchEvent(
                    new CustomEvent("code-update", {
                      detail: { files },
                    }),
                  );
                  
                  // Store the generated files
                  setGeneratedFiles(files);
                  
                  // Add assistant response
                  const fileNames = Object.keys(files)
                    .map((key) => {
                      const file = files[key];
                      const fileName = file.file_path?.split("/").pop() || key;
                      return cleanFileName(fileName);
                    })
                    .join(", ");
                    
                  const assistantMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: `I've generated the following files: ${fileNames}. You can view them in the editor.`,
                    timestamp: new Date(),
                  };
                  
                  setMessages((prev) => [...prev, assistantMessage]);
                } else {
                  // Handle completion without structured files
                  window.dispatchEvent(
                    new CustomEvent("code-update", {
                      detail: { code: accumulatedData },
                    }),
                  );
                  
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: (Date.now() + 1).toString(),
                      role: "assistant",
                      content: "I've generated code for you. Check the editor.",
                      timestamp: new Date(),
                    },
                  ]);
                }
                
                setCodeGenStatus("generated");
                setSuccessMessage("Code generated successfully!");
              }
              
              setIsLoading(false);
              
              if (codeStore) {
                codeStore.getState().endStream();
              }
              
              // Revalidate paths if needed
              if (typeof window !== "undefined" && typeof window.revalidatePaths === "function") {
                window.revalidatePaths(projectId);
              }
              
              // Close the WebSocket
              ws.close();
            }
          }
        } catch (err) {
          console.error("Error processing WebSocket message:", err);
          setCodeGenStatus("generationFailed");
          setSuccessMessage("Error processing code generation");
          setIsLoading(false);
          
          // Clear timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          
          clearInterval(heartbeatInterval);
          
          if (codeStore) {
            codeStore.getState().endStream();
          }
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setCodeGenStatus("generationFailed");
        setSuccessMessage("Connection error. Try again.");
        setIsLoading(false);
        
        // Clear timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        clearInterval(heartbeatInterval);
        
        if (codeStore) {
          codeStore.getState().endStream();
        }
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed:", event);
        
        // Clear timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        clearInterval(heartbeatInterval);
        
        // Only update status if we're still generating (avoid overriding completed status)
        if (codeGenStatus === "generating") {
          setCodeGenStatus("generationFailed");
          setSuccessMessage("Connection closed unexpectedly. Try again.");
          setIsLoading(false);
          
          if (codeStore) {
            codeStore.getState().endStream();
          }
          
          // Add error message
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "The connection was closed unexpectedly. This could be due to server issues or network problems. Please try again.",
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, errorMessage]);
        }
        
        wsRef.current = null;
      };
    } catch (error) {
      console.error("Error getting AI response:", error);
      setCodeGenStatus("generationFailed");
      setSuccessMessage("Something went wrong. Try again.");
      setIsLoading(false);
      
      if (codeStore) {
        codeStore.getState().endStream();
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error while generating code. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  // Regular submit handler now calls handleSubmitWithDetails with values from endpointDetails if available
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    
    if (endpointDetails) {
      // Use values from endpointDetails
      const { language, framework, endpointPath, method } = endpointDetails;
      handleSubmitWithDetails(input, language, framework, endpointPath, method);
    } else {
      // Extract method and path from input if possible, or use better defaults
      let method = "GET";
      let endpointPath = "user";
      
      // Try to extract method from input (look for common HTTP verbs)
      const methodMatch = input.match(/\b(GET|POST|PUT|DELETE|PATCH)\b/i);
      if (methodMatch) {
        method = methodMatch[0].toUpperCase();
      }
      
      // Try to extract a path-like pattern
      const pathMatch = input.match(/\/[a-zA-Z0-9_\-\/{}]+/);
      if (pathMatch) {
        endpointPath = pathMatch[0];
      } else if (input.toLowerCase().includes("endpoint") || input.toLowerCase().includes("api")) {
        // If input mentions "endpoint" or "api", try to construct a reasonable path
        const words = input.toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .split(/\s+/)
        .filter(word =>
          word.length > 3 &&
          !["that", "with", "this", "from", "what", "when", "where", "which", "endpoint", "create", "build", "make"].includes(word)
        );
        
        if (words.length > 0) {
          // Use the first significant word as the endpoint name
          endpointPath = `/api/${words[0]}`;
        }
      }
      
      // Use the extracted or default values
      handleSubmitWithDetails(
        input,
        projectLanguage,
        projectFramework,
        endpointPath,
        method
      );
    }
  };

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

  // Get display language and framework (from endpointDetails if available, otherwise from props)
  const displayLanguage = endpointDetails?.language || projectLanguage;
  const displayFramework = endpointDetails?.framework || projectFramework;
  
  return (
    <div className="flex flex-col h-full border border-zinc-200 rounded-lg overflow-hidden dark:border-zinc-800">
      <div className="p-3 border-b border-zinc-200 bg-white dark:bg-zinc-900 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Image src="/codeBE-logo.png" alt="CodeBEgen Logo" width={30} height={30} />
          <div className="flex items-center space-x-1">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{displayLanguage}</span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">/</span>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{displayFramework}</span>
          </div>
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
                    ? "ml-auto bg-[#F8F8F8] text-black dark:bg-neutral-900 dark:text-white"
                    : "bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100"
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
              className="ai-chat-input min-h-[44px] max-h-[200px] py-3 pr-10 resize-none bg-zinc-50 border-zinc-200 text-zinc-800 placeholder:text-zinc-500 focus:border-[#7dff00] focus:ring-[#7dff00]/20 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200 dark:placeholder:text-zinc-500"
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
            <ArrowUp className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  )
}