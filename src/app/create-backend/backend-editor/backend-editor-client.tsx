"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Database,
  Server,
  Play,
  Save,
  Trash2,
  Copy,
  FolderTree,
  Code,
  FileCode,
  FileJson,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { Footer } from "@/components/footer"
import { AIChat } from "@/components/ai-chat"
import { toast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Sample generated code for different sections
const sampleCode = {
  endpoints: {
    login: `@app.route("/api/auth/login", methods=["POST"])
def login():
    # Validate required fields
    data = request.json
    if not "email" or "password" not in data:
        return jsonify({"error": "Email and password are required"}), 400
        
    # Check database for user
    user = User.query.filter_by(email=data["email"]).first()
    if not user or not check_password(user.password, data["password"]):
        return jsonify({"error": "Invalid credentials"}), 401
    
    # Generate token
    token = generate_token(user.id)
    
    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": user.to_dict()
    }), 200`,
    users: `@app.route("/api/users", methods=["GET"])
def get_users():
    # Get query parameters
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    
    # Fetch users with pagination
    users = User.query.paginate(page=page, per_page=per_page)
    
    return jsonify({
        "users": [user.to_dict() for user in users.items],
        "total": users.total,
        "pages": users.pages,
        "current_page": users.page
    }), 200`,
    user_detail: `@app.route("/api/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    # Validate user exists
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    # Update user data
    data = request.json
    if "name" in data:
        user.name = data["name"]
    if "email" in data:
        user.email = data["email"]
        
    db.session.commit()
    
    return jsonify({
        "message": "User updated successfully",
        "user": user.to_dict()
    }), 200`,
  },
  models: {
    user: `class User(db.Model):
    __tablename__ = "users"
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "created_at": self.created_at.isoformat()
        }`,
  },
  schemas: {
    user: `{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer",
      "description": "The user's unique identifier"
    },
    "name": {
      "type": "string",
      "description": "The user's full name"
    },
    "email": {
      "type": "string",
      "format": "email",
      "description": "The user's email address"
    },
    "created_at": {
      "type": "string",
      "format": "date-time",
      "description": "The timestamp when the user was created"
    }
  },
  "required": ["id", "name", "email", "created_at"]
}`,
  },
  config: {
    database: `# Database configuration
DB_CONFIG = {
    "development": {
        "SQLALCHEMY_DATABASE_URI": "sqlite:///dev.db",
        "SQLALCHEMY_TRACK_MODIFICATIONS": False
    },
    "testing": {
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "SQLALCHEMY_TRACK_MODIFICATIONS": False
    },
    "production": {
        "SQLALCHEMY_DATABASE_URI": os.environ.get("DATABASE_URL"),
        "SQLALCHEMY_TRACK_MODIFICATIONS": False
    }
}

# Initialize database
db = SQLAlchemy(app)
`,
  },
}

type FileType = {
  id: string
  name: string
  path: string
  type: "endpoint" | "model" | "schema" | "config"
  code: string
}

export default function BackendEditorClient() {
  const [projectName, setProjectName] = useState("My Awesome Backend")
  const [urlFriendlyName, setUrlFriendlyName] = useState("my-awesome-backend")
  const [files, setFiles] = useState<FileType[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [currentCode, setCurrentCode] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeSection, setActiveSection] = useState<string>("endpoints")

  useEffect(() => {
    // Get project name from localStorage if available
    const storedProjectName = localStorage.getItem("currentProjectName")
    if (storedProjectName) {
      setProjectName(storedProjectName)
      setUrlFriendlyName(
        storedProjectName
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
      )
    }

    // Initialize with sample files
    const initialFiles: FileType[] = [
      { id: "login", name: "login", path: "/auth/login", type: "endpoint", code: sampleCode.endpoints.login },
      { id: "users", name: "users", path: "/users", type: "endpoint", code: sampleCode.endpoints.users },
      {
        id: "user_detail",
        name: "user_detail",
        path: "/users/:id",
        type: "endpoint",
        code: sampleCode.endpoints.user_detail,
      },
      { id: "user_model", name: "User", path: "/models/user.py", type: "model", code: sampleCode.models.user },
      {
        id: "user_schema",
        name: "User Schema",
        path: "/schemas/user.json",
        type: "schema",
        code: sampleCode.schemas.user,
      },
      {
        id: "db_config",
        name: "Database Config",
        path: "/config/database.py",
        type: "config",
        code: sampleCode.config.database,
      },
    ]

    setFiles(initialFiles)

    // Select the first file by default
    if (initialFiles.length > 0) {
      setSelectedFile(initialFiles[0].id)
      setCurrentCode(initialFiles[0].code)
    }

    // Simulate code generation
    simulateCodeGeneration()
  }, [])

  // Update current code when selected file changes
  useEffect(() => {
    if (selectedFile) {
      const file = files.find((f) => f.id === selectedFile)
      if (file) {
        setCurrentCode(file.code)
      }
    }
  }, [selectedFile, files])

  const simulateCodeGeneration = () => {
    setIsGenerating(true)

    // Simulate code generation with a delay
    const timer = setTimeout(() => {
      setIsGenerating(false)
      toast({
        title: "Code generation complete",
        description: "Your backend code has been successfully generated.",
      })
    }, 3000)

    return () => clearTimeout(timer)
  }

  const handleSaveFile = () => {
    if (!selectedFile) return

    setFiles(files.map((file) => (file.id === selectedFile ? { ...file, code: currentCode } : file)))

    toast({
      title: "File saved",
      description: "Your changes have been saved successfully.",
    })
  }

  const handleCopyCode = () => {
    if (!currentCode) return

    navigator.clipboard.writeText(currentCode)

    toast({
      title: "Code copied",
      description: "The code has been copied to your clipboard.",
    })
  }

  const handleDeleteFile = () => {
    if (!selectedFile) return

    // Ask for confirmation
    if (!window.confirm("Are you sure you want to delete this file?")) return

    const newFiles = files.filter((file) => file.id !== selectedFile)
    setFiles(newFiles)

    // Select another file if available
    if (newFiles.length > 0) {
      setSelectedFile(newFiles[0].id)
      setCurrentCode(newFiles[0].code)
    } else {
      setSelectedFile(null)
      setCurrentCode("")
    }

    toast({
      title: "File deleted",
      description: "The file has been deleted successfully.",
    })
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "endpoint":
        return <Code className="h-4 w-4 text-blue-400" />
      case "model":
        return <Database className="h-4 w-4 text-green-400" />
      case "schema":
        return <FileJson className="h-4 w-4 text-yellow-400" />
      case "config":
        return <FileCode className="h-4 w-4 text-purple-400" />
      default:
        return <FileCode className="h-4 w-4 text-zinc-400" />
    }
  }

  const getMethodBadge = (path: string) => {
    if (path.includes("login")) {
      return <div className="text-xs px-1.5 py-0.5 rounded font-medium bg-blue-500/20 text-blue-400">POST</div>
    } else if (path === "/users") {
      return <div className="text-xs px-1.5 py-0.5 rounded font-medium bg-green-500/20 text-green-400">GET</div>
    } else if (path.includes(":id")) {
      return <div className="text-xs px-1.5 py-0.5 rounded font-medium bg-yellow-500/20 text-yellow-400">PUT</div>
    }
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-zinc-100/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/codeBE-logo-28i3MSrg38VV5t71KZaV9P29xWpbJf.png"
                alt="CodeBEGen Logo"
                width={36}
                height={36}
              />
              <span className="text-xl font-bold text-[#7dff00] dark:text-[#7dff00]">CodeBEGen</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button className="rounded-md bg-[#7dff00] text-black hover:bg-[#9aff33] dark:bg-[#7dff00] dark:text-black dark:hover:bg-[#9aff33]">
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link
                href="/create-backend"
                className="inline-flex items-center gap-2 text-zinc-600 hover:text-[#7dff00] dark:text-zinc-400 dark:hover:text-[#7dff00]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
              <h1 className="text-2xl font-medium text-zinc-900 dark:text-white">{projectName}</h1>
              {isGenerating && (
                <span className="text-xs bg-[#7dff00]/20 text-[#7dff00] px-2 py-1 rounded-full animate-pulse">
                  Generating code...
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                      onClick={handleCopyCode}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy code to clipboard</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                      onClick={handleDeleteFile}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete current file</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Deploy
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Deploy your backend</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-[#7dff00] text-black hover:bg-[#9aff33] dark:bg-[#7dff00] dark:text-black dark:hover:bg-[#9aff33]"
                      onClick={handleSaveFile}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Save changes</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Project URL Display */}
          <div className="mb-4 p-3 bg-white border border-zinc-200 rounded-md flex items-center justify-between dark:bg-zinc-900 dark:border-zinc-800">
            <div className="flex items-center">
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mr-2">Project URL:</span>
              <code className="text-sm bg-zinc-100 px-2 py-1 rounded text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                https://api.codebegen.com/{urlFriendlyName}
              </code>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
              onClick={() => {
                navigator.clipboard.writeText(`https://api.codebegen.com/${urlFriendlyName}`)
                toast({
                  title: "URL copied",
                  description: "The project URL has been copied to your clipboard.",
                })
              }}
            >
              Copy
            </Button>
          </div>

          <div className="grid grid-cols-[280px_1fr_300px] gap-6 h-[calc(100vh-240px)]">
            {/* Sidebar */}
            <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <FolderTree className="h-5 w-5 text-[#7dff00]" />
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">Project Files</span>
                </div>
              </div>

              <div className="p-2 overflow-auto" style={{ maxHeight: "calc(100vh - 300px)" }}>
                {/* Endpoints Section */}
                <div
                  className={`p-2 ${activeSection === "endpoints" ? "bg-zinc-100/50 dark:bg-zinc-800/50" : ""} rounded-md mb-2 cursor-pointer`}
                  onClick={() => setActiveSection("endpoints")}
                >
                  <div className="flex items-center gap-2 text-[#7dff00] font-medium text-sm mb-2">
                    <Server className="h-4 w-4" />
                    <span>Endpoints</span>
                  </div>

                  {activeSection === "endpoints" && (
                    <div className="space-y-1 ml-6">
                      {files
                        .filter((file) => file.type === "endpoint")
                        .map((file) => (
                          <div
                            key={file.id}
                            className={`flex items-center justify-between rounded-md px-2 py-1.5 text-sm ${
                              selectedFile === file.id
                                ? "bg-[#7dff00]/20 text-[#7dff00]"
                                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                            } cursor-pointer`}
                            onClick={() => setSelectedFile(file.id)}
                          >
                            <div className="flex items-center gap-2">
                              {getMethodBadge(file.path)}
                              <span>{file.path}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Models Section */}
                <div
                  className={`p-2 ${activeSection === "models" ? "bg-zinc-100/50 dark:bg-zinc-800/50" : ""} rounded-md mb-2 cursor-pointer`}
                  onClick={() => setActiveSection("models")}
                >
                  <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-medium text-sm">
                    <Database className="h-4 w-4 text-[#7dff00]" />
                    <span>Models</span>
                  </div>

                  {activeSection === "models" && (
                    <div className="space-y-1 ml-6 mt-2">
                      {files
                        .filter((file) => file.type === "model")
                        .map((file) => (
                          <div
                            key={file.id}
                            className={`flex items-center justify-between rounded-md px-2 py-1.5 text-sm ${
                              selectedFile === file.id
                                ? "bg-[#7dff00]/20 text-[#7dff00]"
                                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                            } cursor-pointer`}
                            onClick={() => setSelectedFile(file.id)}
                          >
                            <div className="flex items-center gap-2">
                              {getFileIcon("model")}
                              <span>{file.name}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Schemas Section */}
                <div
                  className={`p-2 ${activeSection === "schemas" ? "bg-zinc-100/50 dark:bg-zinc-800/50" : ""} rounded-md mb-2 cursor-pointer`}
                  onClick={() => setActiveSection("schemas")}
                >
                  <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-medium text-sm">
                    <FileJson className="h-4 w-4 text-[#7dff00]" />
                    <span>Schemas</span>
                  </div>

                  {activeSection === "schemas" && (
                    <div className="space-y-1 ml-6 mt-2">
                      {files
                        .filter((file) => file.type === "schema")
                        .map((file) => (
                          <div
                            key={file.id}
                            className={`flex items-center justify-between rounded-md px-2 py-1.5 text-sm ${
                              selectedFile === file.id
                                ? "bg-[#7dff00]/20 text-[#7dff00]"
                                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                            } cursor-pointer`}
                            onClick={() => setSelectedFile(file.id)}
                          >
                            <div className="flex items-center gap-2">
                              {getFileIcon("schema")}
                              <span>{file.name}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Configuration Section */}
                <div
                  className={`p-2 ${activeSection === "config" ? "bg-zinc-100/50 dark:bg-zinc-800/50" : ""} rounded-md mb-2 cursor-pointer`}
                  onClick={() => setActiveSection("config")}
                >
                  <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-medium text-sm">
                    <FileCode className="h-4 w-4 text-[#7dff00]" />
                    <span>Configuration</span>
                  </div>

                  {activeSection === "config" && (
                    <div className="space-y-1 ml-6 mt-2">
                      {files
                        .filter((file) => file.type === "config")
                        .map((file) => (
                          <div
                            key={file.id}
                            className={`flex items-center justify-between rounded-md px-2 py-1.5 text-sm ${
                              selectedFile === file.id
                                ? "bg-[#7dff00]/20 text-[#7dff00]"
                                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                            } cursor-pointer`}
                            onClick={() => setSelectedFile(file.id)}
                          >
                            <div className="flex items-center gap-2">
                              {getFileIcon("config")}
                              <span>{file.name}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <Tabs defaultValue="code" className="flex-1">
                <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="flex items-center gap-2">
                    {selectedFile && (
                      <>
                        {files.find((f) => f.id === selectedFile)?.type === "endpoint" &&
                          getMethodBadge(files.find((f) => f.id === selectedFile)?.path || "")}
                        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                          {files.find((f) => f.id === selectedFile)?.path ||
                            files.find((f) => f.id === selectedFile)?.name}
                        </span>
                      </>
                    )}
                  </div>

                  <TabsList className="h-9 bg-zinc-100 dark:bg-zinc-800">
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

                <TabsContent value="code" className="flex-1 p-0 data-[state=active]:flex">
                  <div className="w-full h-full" id="monaco-editor-container">
                    {/* Monaco Editor will be mounted here via client component */}
                    <iframe
                      src="/create-backend/backend-editor/editor"
                      className="w-full h-full border-0"
                      title="Code Editor"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="test" className="bg-white dark:bg-zinc-950 p-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Test Endpoint</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Test your endpoint with different parameters and see the response.
                    </p>

                    <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                      <h4 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-2">Request Body</h4>
                      <div className="bg-white rounded-md p-4 font-mono text-sm text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
                        {`{
  "email": "user@example.com",
  "password": "securepassword123"
}`}
                      </div>

                      <div className="mt-4 flex justify-end">
                        <Button size="sm" className="bg-[#7dff00] text-black hover:bg-[#9aff33]">
                          Send Request
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="docs" className="bg-white dark:bg-zinc-950 p-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">API Documentation</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Automatically generated documentation for this endpoint.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1">Endpoint</h4>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          <span className="text-blue-400 font-medium">POST</span> /auth/login
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1">Description</h4>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          Authenticates a user and returns a JWT token if credentials are valid.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1">Request Body</h4>
                        <div className="bg-zinc-50 rounded-md p-3 font-mono text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
                          {`{
  "email": "string", // Required. User's email address
  "password": "string" // Required. User's password
}`}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1">Responses</h4>
                        <div className="space-y-2">
                          <div className="bg-green-500/10 border border-green-500/20 rounded-md p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-green-400">200 OK</span>
                            </div>
                            <div className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
                              {`{
  "message": "Login successful",
  "token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string"
  }
}`}
                            </div>
                          </div>

                          <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-red-400">400 Bad Request</span>
                            </div>
                            <div className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
                              {`{
  "error": "Email and password are required"
}`}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* AI Chat Panel */}
            <div className="h-full">
              <AIChat />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
