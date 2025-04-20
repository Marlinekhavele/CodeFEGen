"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, ChevronRight, Code, Database, Play, Plus, Server } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { EndpointEditor } from "@/components/endpoint-editor"
import { GeneratedCodeDisplay } from "@/components/gen-code-display"
import { toast } from "@/components/ui/use-toast"
import WebSocketHandler, { CodeStreamEventType } from "@/app/api/services/websocket-handler"
import { CodeGenData } from "@/types"
import { MonacoEditor } from "@/components/monaco-editor"
import { detectLanguage } from "@/utils/detect-language"

type MethodType = "GET" | "POST" | "PUT" | "DELETE";

type Endpoint = {
  id: string
  name: string
  method: MethodType
  path: string
  code: string
}

interface GeneratedFileType {
  id: string;
  type: "endpoint" | "model" | "schema" | "migration";
  name: string;
  path: string;
  code: string;
  method?: string;
}

interface EndpointType {
  generated_code?: string;
  endpoint_path?: string;
  method?: string;
  content_base64?: string;
  file_path?: string;
  file_hash?: string;
  endpoint_id?: string;
}

interface ModelType {
  generated_code?: string;
  entity_name?: string;
  file_path?: string;
  file_hash?: string;
  exists?: boolean;
}

interface SchemaType {
  generated_code?: string;
  entity_name?: string;
  file_path?: string;
  file_hash?: string;
  exists?: boolean;
}

interface MigrationType {
  generated_code?: string;
  entity_name?: string;
  file_path?: string;
  file_hash?: string;
  exists?: boolean;
}

interface GeneratedDataType {
  project_id?: string;
  endpoint?: EndpointType;
  model?: ModelType;
  schema?: SchemaType;
  migration?: MigrationType;
  git_results?: Record<string, string>;
}

const DEFAULT_LOGIN_CODE = `@app.route("/api/auth/login", methods=["POST"])
def login():
    # Validate required fields
    data = request.json
    if not "email" or "password" not in data:
        return jsonify({"error": "Email and password are required"}), 400
        
    # Check database for user
    user = User.query.filter_by(email=data["email"]).first()
    if not user or not check_password(user.password, data["password"]):
        return jsonify({"message": "User registered successfully"}), 201
    
    # Generate token
    token = generate_token(user.id)
    
    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": user.to_dict()
    }), 200`

export function BackendGenerator() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([
    {
      id: "login",
      name: "login",
      method: "POST",
      path: "/api/auth/login",
      code: DEFAULT_LOGIN_CODE,
    },
  ])
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("login")
  const [endpointUrl, setEndpointUrl] = useState("https://mybackend.com/login")
  const [generatedData, setGeneratedData] = useState<GeneratedDataType | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [streamedCode, setStreamedCode] = useState("")
  const [statusMessage, setStatusMessage] = useState("Ready to generate code")
  
  // Add WebSocket handler reference
  const wsHandlerRef = useRef<WebSocketHandler | null>(null)
  
  // Cleanup WebSocket connection when component unmounts
  useEffect(() => {
    return () => {
      if (wsHandlerRef.current) {
        wsHandlerRef.current.close()
      }
    }
  }, [])

  // --- WebSocket Streaming Integration ---
  useEffect(() => {
    if (!wsHandlerRef.current) return;

    // Reset streaming state on new generation
    if (isGenerating) {
      setStreamedCode("");
      wsHandlerRef.current.resetAccumulatedTokens();
    }

    // TOKEN: append streamed code
    wsHandlerRef.current.on(CodeStreamEventType.TOKEN, (token: string) => {
      setStreamedCode((prev) => prev + token);
    });

    // INFO/PROGRESS: update status
    wsHandlerRef.current.on(CodeStreamEventType.INFO, (data) => {
      if (data?.message) setStatusMessage(data.message);
    });
    wsHandlerRef.current.on(CodeStreamEventType.PROGRESS, (data) => {
      if (data?.message) setStatusMessage(data.message);
    });

    // COMPLETED/COMPLETE: set final code, stop streaming
    wsHandlerRef.current.on(CodeStreamEventType.COMPLETED, (data) => {
      if (data?.result?.generated_code) {
        setStreamedCode(data.result.generated_code);
        // Optionally update endpoints/generatedData here if needed
      }
      setIsGenerating(false);
      setStatusMessage("Code generation completed");
    });
    wsHandlerRef.current.on(CodeStreamEventType.COMPLETE, (data) => {
      setIsGenerating(false);
      setStatusMessage(data?.message || "Code generation completed");
      console.log("COMPLETE event data:", data);

      // Defensive: check if result and endpoint exist
      if (data?.result && data.result.endpoint && data.result.endpoint.generated_code) {
        const endpointData = data.result.endpoint;
        const newEndpoint = {
          id: endpointData.endpoint_id || `endpoint-${Date.now()}`,
          name: endpointData.entity_name || endpointData.file_path?.split('/').pop() || 'endpoint',
          method: endpointData.method || "GET",
          path: endpointData.file_path || "",
          code: endpointData.generated_code,
        };
        setEndpoints((prev) => [...prev, newEndpoint]);
        setSelectedEndpoint(newEndpoint.id);
      }

      // Always set generatedData, even if some fields are null
      if (data?.result) {
        setGeneratedData(data.result);
      }

      toast({
        title: "Code generated successfully",
        description: data?.message || "Code generation completed",
      });
    });

    // ERROR: show error
    wsHandlerRef.current.on(CodeStreamEventType.ERROR, (err) => {
      setIsGenerating(false);
      setStatusMessage(err?.message || "Error during code generation");
    });

    return () => {
      wsHandlerRef.current?.removeAllListeners();
    };
  }, [isGenerating]);

  // Function to handle code generation
  const handleGenerateCode = async (method: MethodType, path: string) => {
    setIsGenerating(true)
    setStatusMessage("Starting code generation...")
    setStreamedCode("")
    
    // Close any existing WebSocket connection
    if (wsHandlerRef.current) {
      wsHandlerRef.current.close()
      wsHandlerRef.current = null
    }
    
    try {
      const codeGenData: CodeGenData = {
        project_id: "project-123", // Replace with actual project ID if available
        prompt: `Generate a ${method} endpoint for ${path}`,
        language: "python",
        method: method,
        endpoint_path: path,
        additional_context: ""
      }
      
      wsHandlerRef.current = new WebSocketHandler("wss://codebegen.canadacentral.cloudapp.azure.com/api/v1/generate/stream")
      
      wsHandlerRef.current.on(CodeStreamEventType.CONNECTED, () => {
        setStatusMessage("Connected to server. Sending code generation request...")
        wsHandlerRef.current?.send(codeGenData)
      })
      
      wsHandlerRef.current.on(CodeStreamEventType.INFO, (data) => {
        setStatusMessage(data.message)
      })
      wsHandlerRef.current.on(CodeStreamEventType.PROGRESS, (data) => {
        setStatusMessage(`${data.stage || 'Progress'}: ${data.message}`)
      })
      wsHandlerRef.current.on(CodeStreamEventType.TOKEN, (token) => {
        setStreamedCode(prev => prev + token)
      })
      wsHandlerRef.current.on(CodeStreamEventType.COMPLETED, (data) => {
        setStatusMessage(`Generated ${data.stage || 'component'} completed`)
        if (data.stage === "endpoint" && data.result) {
          const endpointData = data.result
          const newEndpoint: Endpoint = {
            id: endpointData.endpoint_id || `endpoint-${Date.now()}`,
            name: path.split('/').pop() || 'endpoint',
            method: method,
            path: path,
            code: endpointData.generated_code,
          }
          setEndpoints(prev => [...prev, newEndpoint])
          setSelectedEndpoint(newEndpoint.id)
        }
      })
      wsHandlerRef.current.on(CodeStreamEventType.COMPLETE, (data) => {
        setIsGenerating(false)
        setStatusMessage(data?.message || "Code generation completed")
        if (data.result) {
          setGeneratedData(data.result)
          if (data.result.endpoint && data.result.endpoint.generated_code) {
            const newEndpoint: Endpoint = {
              id: data.result.endpoint.endpoint_id || `endpoint-${Date.now()}`,
              name: path.split('/').pop() || 'endpoint',
              method: method,
              path: path,
              code: data.result.endpoint.generated_code,
            }
            if (!endpoints.some(e => e.id === newEndpoint.id)) {
              setEndpoints(prev => [...prev, newEndpoint])
              setSelectedEndpoint(newEndpoint.id)
            }
          }
        }
        toast({
          title: "Code generated successfully",
          description: `Generated code for ${method} ${path}`,
        })
      })
      wsHandlerRef.current.on(CodeStreamEventType.ERROR, (error) => {
        setIsGenerating(false)
        setStatusMessage(`Error: ${error.message}`)
        toast({
          title: "Error generating code",
          description: error.message,
          variant: "destructive"
        })
      })
      wsHandlerRef.current.on(CodeStreamEventType.CLOSE, (event) => {
        if (event.code !== 1000) {
          setIsGenerating(false)
          setStatusMessage(`Connection closed unexpectedly. Code: ${event.code}`)
        }
      })
      wsHandlerRef.current.connect()
    } catch (error) {
      console.error("Error generating code:", error)
      setIsGenerating(false)
      setStatusMessage(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
      toast({
        title: "Error generating code",
        description: error instanceof Error ? error.message : "Failed to generate code",
        variant: "destructive"
      })
    }
  }
  
  // Handler for selecting a file from the Generated Code Display
  const handleSelectGeneratedFile = (file: GeneratedFileType) => {
    if (file.type === "endpoint") {
      // Check if this endpoint is already in the list
      const existingEndpoint = endpoints.find(e => e.id === file.id)
      if (!existingEndpoint) {
        // Add it to the endpoints list
        const newEndpoint: Endpoint = {
          id: file.id,
          name: file.path.split('/').pop() || 'endpoint',
          method: file.method as MethodType || "GET",
          path: file.path,
          code: file.code,
        }
        setEndpoints(prev => [...prev, newEndpoint])
      }
      setSelectedEndpoint(file.id)
    } else {
      // For non-endpoint files, we could handle them differently
      // For example, switching to a different tab or view
      toast({
        title: `Selected ${file.type}`,
        description: `Viewing ${file.name || file.path}`,
      })
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-zinc-800 p-4 bg-zinc-900">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-[#7dff00]" />
          <span className="font-medium text-zinc-100">My Backend</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
          >
            <Code className="h-4 w-4 mr-2" />
            Code view
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
          >
            <Play className="h-4 w-4 mr-2" />
            Deploy
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-[300px_1fr] h-[600px] bg-zinc-950">
        <div className="border-r border-zinc-800">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="endpoint-url" className="text-xs font-medium text-zinc-400">
                Endpoint URL
              </Label>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-zinc-800 text-xs px-2 py-1 rounded text-zinc-300">POST</div>
              <Input
                id="endpoint-url"
                value={endpointUrl}
                onChange={(e) => setEndpointUrl(e.target.value)}
                className="h-8 text-xs bg-zinc-900 border-zinc-700 text-zinc-300"
              />
              <Button 
                size="sm" 
                variant="default" 
                className="h-8 text-xs bg-[#7dff00] hover:bg-[#9aff33] text-black"
                onClick={() => handleGenerateCode("POST", "/api/auth/register")}
                disabled={isGenerating}
              >
                {isGenerating ? "Generating..." : "Generate"}
              </Button>
            </div>
            
            {/* Status Message */}
            {statusMessage && (
              <div className="mb-4 text-xs p-2 rounded bg-zinc-800 text-zinc-300">
                {isGenerating && (
                  <div className="animate-spin inline-block mr-2 h-3 w-3 border-[1.5px] border-current border-t-transparent rounded-full" 
                    aria-hidden="true">
                  </div>
                )}
                {statusMessage}
              </div>
            )}
          </div>

          {/* Display Generated Code in Folders */}
          {generatedData ? (
            <GeneratedCodeDisplay 
              generatedData={generatedData}
              onSelectFile={handleSelectGeneratedFile}
              selectedFileId={selectedEndpoint}
            />
          ) : (
            <div className="px-2">
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-1 text-sm font-medium text-zinc-300">
                  <ChevronDown className="h-4 w-4 text-[#7dff00]" />
                  Endpoints
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                  onClick={() => handleGenerateCode("GET", "/api/users")}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {endpoints.map((endpoint) => (
                  <button
                    key={endpoint.id}
                    onClick={() => setSelectedEndpoint(endpoint.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2 py-1 text-sm",
                      selectedEndpoint === endpoint.id
                        ? "bg-[#7dff00]/20 text-[#7dff00]"
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "text-xs px-1.5 py-0.5 rounded font-medium",
                          endpoint.method === "GET"
                            ? "bg-green-500/20 text-green-400"
                            : endpoint.method === "POST"
                              ? "bg-blue-500/20 text-blue-400"
                              : endpoint.method === "PUT"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-red-500/20 text-red-400",
                        )}
                      >
                        {endpoint.method}
                      </div>
                      <span>{endpoint.name}</span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between p-2 mt-4">
                <div className="flex items-center gap-1 text-sm font-medium text-zinc-300">
                  <ChevronRight className="h-4 w-4 text-[#7dff00]" />
                  Code
                </div>
              </div>
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-1 text-sm font-medium text-zinc-300">
                  <ChevronRight className="h-4 w-4 text-[#7dff00]" />
                  Models
                </div>
              </div>
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-1 text-sm font-medium text-zinc-300">
                  <ChevronRight className="h-4 w-4 text-[#7dff00]" />
                  Validators
                </div>
              </div>
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-1 text-sm font-medium text-zinc-300">
                  <ChevronRight className="h-4 w-4 text-[#7dff00]" />
                  Response Helpers
                </div>
              </div>
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-1 text-sm font-medium text-zinc-300">
                  <ChevronRight className="h-4 w-4 text-[#7dff00]" />
                  Dependencies
                </div>
              </div>
              <div className="flex items-center justify-between p-2 mt-4">
                <div className="flex items-center gap-1 text-sm font-medium text-zinc-300">
                  <Database className="h-4 w-4 text-[#7dff00]" />
                  Database
                </div>
              </div>
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-1 text-sm font-medium text-zinc-300">
                  <Server className="h-4 w-4 text-[#7dff00]" />
                  Storage
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <Tabs defaultValue="code" className="flex-1">
            <div className="border-b border-zinc-800 px-4 bg-zinc-900">
              <TabsList className="h-10 bg-zinc-800">
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
            <TabsContent value="code" className="flex-1 p-0 data-[state=active]:flex bg-zinc-950">
              {isGenerating ? (
                // Show streaming code during generation with Monaco editor
                <MonacoEditor
                  code=""
                  language="python"
                  streaming={true}
                  streamingCode={streamedCode}
                  readOnly={true}
                />
              ) : (
                // Show selected endpoint code after generation
                <MonacoEditor
                  code={endpoints.find((e) => e.id === selectedEndpoint)?.code || ""}
                  language={detectLanguage(endpoints.find((e) => e.id === selectedEndpoint)?.path || "", endpoints.find((e) => e.id === selectedEndpoint)?.code || "")}
                  onChange={(code) => {
                    setEndpoints(endpoints.map((e) => 
                      (e.id === selectedEndpoint ? { ...e, code } : e))
                    )
                  }}
                />
              )}
            </TabsContent>
            <TabsContent value="test" className="bg-zinc-950">
              <div className="p-4">
                <h3 className="text-lg font-medium mb-2 text-zinc-100">Test Endpoint</h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Test your endpoint with different parameters and see the response.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="docs" className="bg-zinc-950">
              <div className="p-4">
                <h3 className="text-lg font-medium mb-2 text-zinc-100">API Documentation</h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Automatically generated documentation for your API endpoints.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}