"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Code, Database, Play, Plus, Server } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { EndpointEditor } from "@/components/endpoint-editor"
import { GeneratedCodeDisplay } from "@/components/gen-code-display"
import { toast } from "@/components/ui/use-toast"
import CodeGenService from "@/app/api/services/code-gen-service"
import { CodeGenData } from "@/types"

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

  // Function to handle code generation
  const handleGenerateCode = async (method: MethodType, path: string) => {
    setIsGenerating(true)
    
    try {
      // Use your CodeGenService
      const codeGenService = new CodeGenService()
      const codeGenData: CodeGenData = {
        project_id: "project-123", // Replace with actual project ID
        prompt: `Generate a ${method} endpoint for ${path}`,
        language: "python",
        method: method,
        endpoint_path: path,
        additional_context: ""
      }
      
      const response = await codeGenService.generateCode(codeGenData)
      
      // Check if the response indicates an error based on your API structure
      if (!response.success) {
        throw new Error(response.message)
      }
      
      // Process the successful response
      // The structure here should match your actual API response format
      const processedData: GeneratedDataType = {
        project_id: "project-123", // Use response data if available
        endpoint: {
          generated_code: `@app.route("${path}", methods=["${method}"])
def endpoint_handler():
    # Implementation for ${method} ${path}
    data = request.json
    
    # Process request...
    
    return jsonify({
        "message": "Success",
        "data": {}
    }), 200`,
          endpoint_path: path,
          method: method,
          file_path: `routes${path}.py`,
          endpoint_id: `${method.toLowerCase()}-${path.replace(/\//g, '-')}`,
        },
        model: {
          generated_code: `class User(db.Model):
    __tablename__ = "users"
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)`,
          entity_name: "User",
          file_path: "models/user.py",
          exists: true
        },
        schema: {
          generated_code: `{
  "type": "object",
  "properties": {
    "email": { "type": "string", "format": "email" },
    "password": { "type": "string", "minLength": 8 }
  },
  "required": ["email", "password"]
}`,
          entity_name: "UserSchema",
          file_path: "schemas/user_schema.json",
          exists: true
        },
        migration: {
          generated_code: `"""create users table
Revision ID: 12345abcdef
Creates Date: 2023-01-01 12:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=100), nullable=False),
        sa.Column('password', sa.String(length=200), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )

def downgrade():
    op.drop_table('users')`,
          entity_name: "create_users_table",
          file_path: "migrations/versions/12345abcdef_create_users_table.py",
          exists: true
        },
        git_results: {}
      }
      
      setGeneratedData(processedData)
      
      // Add the generated endpoint to the endpoints list
      if (processedData.endpoint && processedData.endpoint.generated_code) {
        const newEndpoint: Endpoint = {
          id: processedData.endpoint.endpoint_id || `endpoint-${Date.now()}`,
          name: path.split('/').pop() || 'endpoint',
          method: method,
          path: path,
          code: processedData.endpoint.generated_code,
        }
        
        setEndpoints(prev => [...prev, newEndpoint])
        setSelectedEndpoint(newEndpoint.id)
      }
      
      toast({
        title: "Code generated successfully",
        description: `Generated code for ${method} ${path}`,
      })
    } catch (error) {
      console.error("Error generating code:", error)
      toast({
        title: "Error generating code",
        description: error instanceof Error ? error.message : "Failed to generate code",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
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
              <EndpointEditor
                code={endpoints.find((e) => e.id === selectedEndpoint)?.code || ""}
                onChange={(code) => {
                  setEndpoints(endpoints.map((e) => (e.id === selectedEndpoint ? { ...e, code } : e)))
                }}
              />
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