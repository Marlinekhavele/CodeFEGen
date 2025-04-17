// app/create-backend/backend-editor/BackendEditorClient.tsx
"use client"

import { useState, useEffect } from "react"
import AIChat from "@/components/ai-chat"
import { toast } from "@/components/ui/use-toast"
import CodeGenService from "@/app/api/services/code-gen-service"
import { GeneratedFileType, FileType, GeneratedDataType } from "@/types"
import { sampleCode } from "@/schemas/modal"
import { ProjectHeader } from "@/components/project-header"
import { ProjectFiles } from "@/components/project-files"
import { FileContent } from "@/components/file-content"
import { useTheme } from "@/components/theme-provider"
import { CodeGenData } from "@/types"

interface BackendEditorClientProps {
  projectName: string
  urlFriendlyName?: string
  templateId?: string
}

export default function BackendEditorClient({
  projectName,
  urlFriendlyName = "",
  templateId = "",
}: BackendEditorClientProps) {
  const [files, setFiles] = useState<FileType[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [currentCode, setCurrentCode] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedData, setGeneratedData] = useState<GeneratedDataType | null>(null)
  const { theme } = useTheme()

  useEffect(() => {
    // Initialize with sample files
    const initialFiles: FileType[] = [
      { id: "login", name: "login", path: "/auth/login", type: "endpoint", code: sampleCode.endpoints.login, method: "POST" },
      { id: "users", name: "users", path: "/users", type: "endpoint", code: sampleCode.endpoints.users, method: "GET" },
      {
        id: "user_detail",
        name: "user_detail",
        path: "/users/:id",
        type: "endpoint",
        code: sampleCode.endpoints.user_detail,
        method: "PUT"
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

    // Simulate code generation with template information
    if (templateId) {
      simulateCodeGeneration(templateId)
    }
  }, [templateId])

  // Simulate code generation for a template using your CodeGenService
  const simulateCodeGeneration = async (template: string) => {
    setIsGenerating(true)
    
    try {
      const codeGenService = new CodeGenService()
      const codeGenData: CodeGenData = {
        project_id: urlFriendlyName || "project-123",
        prompt: `Generate code for ${template} template`,
        language: "python",
        method: "POST",
        endpoint_path: `/api/${template}`,
        additional_context: `Template: ${template}`
      }
      
      const response = await codeGenService.generateCode(codeGenData)
      
      // Check if the response indicates an error based on your API structure
      if (!response.success) {
        throw new Error(response.message)
      }
      
      // Process the response - you'll need to adapt this to match your actual API response structure
      // This is a mock structure - adjust according to your actual data format
      const processedData: GeneratedDataType = {
        project_id: urlFriendlyName || "project-123",
        endpoint: {
          generated_code: `@app.route("/api/${template}/auth", methods=["POST"])
def auth_endpoint():
    # Implementation for ${template} authentication
    data = request.json
    
    # Process request...
    
    return jsonify({
        "message": "Authentication successful",
        "data": {}
    }), 200`,
          endpoint_path: `/api/${template}/auth`,
          method: "POST",
          content_base64: "",
          file_path: `routes/api/${template}/auth.py`,
          file_hash: "",
          endpoint_id: `post-${template}-auth`,
        },
        model: {
          generated_code: `class ${template.charAt(0).toUpperCase() + template.slice(1)}User(db.Model):
    __tablename__ = "${template}_users"
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)`,
          content_base64: "",
          entity_name: `${template.charAt(0).toUpperCase() + template.slice(1)}User`,
          file_path: `models/${template}_user.py`,
          file_hash: "",
          exists: true,
        },
        schema: {
          generated_code: `{
  "type": "object",
  "properties": {
    "username": { "type": "string", "minLength": 3 },
    "email": { "type": "string", "format": "email" },
    "password": { "type": "string", "minLength": 8 }
  },
  "required": ["username", "email", "password"]
}`,
          content_base64: "",
          entity_name: `${template.charAt(0).toUpperCase() + template.slice(1)}UserSchema`,
          file_path: `schemas/${template}_user_schema.json`,
          file_hash: "",
          exists: true,
        },
        migration: {
          generated_code: `"""create ${template}_users table
Revision ID: ${Math.random().toString(36).substring(2, 10)}
Creates Date: ${new Date().toISOString()}
"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table('${template}_users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(length=100), nullable=False),
        sa.Column('email', sa.String(length=100), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('username'),
        sa.UniqueConstraint('email')
    )

def downgrade():
    op.drop_table('${template}_users')`,
          content_base64: "",
          entity_name: `create_${template}_users_table`,
          file_path: `migrations/versions/${Math.random().toString(36).substring(2, 10)}_create_${template}_users_table.py`,
          file_hash: "",
          exists: true,
        },
        git_results: {},
      }

      setGeneratedData(processedData)

      // Add the generated endpoint to the files list
      if (processedData.endpoint && processedData.endpoint.generated_code) {
        const newEndpoint: FileType = {
          id: processedData.endpoint.endpoint_id || `endpoint-${Date.now()}`,
          name: processedData.endpoint.endpoint_path?.split('/').pop() || 'endpoint',
          path: processedData.endpoint.endpoint_path || '',
          type: "endpoint",
          method: processedData.endpoint.method as "GET" | "POST" | "PUT" | "DELETE" || "POST",
          code: processedData.endpoint.generated_code,
        }
        
        // Add the model
        const newModel: FileType = {
          id: `model-${processedData.model?.entity_name || Date.now()}`,
          name: processedData.model?.entity_name || 'Model',
          path: processedData.model?.file_path || '',
          type: "model",
          code: processedData.model?.generated_code || '',
        }
        
        // Add the schema
        const newSchema: FileType = {
          id: `schema-${processedData.schema?.entity_name || Date.now()}`,
          name: processedData.schema?.entity_name || 'Schema',
          path: processedData.schema?.file_path || '',
          type: "schema",
          code: processedData.schema?.generated_code || '',
        }
        
        // Add the migration
        const newMigration: FileType = {
          id: `migration-${processedData.migration?.entity_name || Date.now()}`,
          name: processedData.migration?.entity_name || 'Migration',
          path: processedData.migration?.file_path || '',
          type: "migration",
          code: processedData.migration?.generated_code || '',
        }
        
        setFiles(prev => [...prev, newEndpoint, newModel, newSchema, newMigration])
        setSelectedFile(newEndpoint.id)
      }

      toast({
        title: "Code generation complete",
        description: template 
          ? `Your backend code for ${template} template has been successfully generated.`
          : "Your backend code has been successfully generated.",
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

  const handleSaveFile = () => {
    if (!selectedFile) return

    setFiles(files.map((file) => (file.id === selectedFile ? { ...file, code: currentCode } : file)))

    // If this file is part of the generated data, update that too
    if (generatedData) {
      const currentFile = files.find(f => f.id === selectedFile)
      if (currentFile) {
        const updatedGeneratedData = { ...generatedData }
        
        if (currentFile.type === "endpoint" && updatedGeneratedData.endpoint) {
          updatedGeneratedData.endpoint.generated_code = currentCode
        } else if (currentFile.type === "model" && updatedGeneratedData.model) {
          updatedGeneratedData.model.generated_code = currentCode
        } else if (currentFile.type === "schema" && updatedGeneratedData.schema) {
          updatedGeneratedData.schema.generated_code = currentCode
        } else if (currentFile.type === "migration" && updatedGeneratedData.migration) {
          updatedGeneratedData.migration.generated_code = currentCode
        }
        
        setGeneratedData(updatedGeneratedData)
      }
    }

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

  // Handler for selecting a file from the Generated Code Display
  const handleSelectGeneratedFile = (file: GeneratedFileType) => {
    const existingFile = files.find(f => 
      (f.type === file.type && f.id === file.id) || 
      (f.type === file.type && f.path === file.path)
    )
    
    if (existingFile) {
      setSelectedFile(existingFile.id)
    } else {
      // Add file to files list
      const newFile: FileType = {
        id: file.id,
        name: file.name,
        path: file.path,
        type: file.type,
        code: file.code,
        method: file.method as "GET" | "POST" | "PUT" | "DELETE"
      }
      
      setFiles(prev => [...prev, newFile])
      setSelectedFile(newFile.id)
    }
  }

  // Function to generate additional code using your CodeGenService
  const handleGenerateAdditionalCode = async () => {
    setIsGenerating(true)
    toast({
      title: "Generating additional code",
      description: "Please wait while we generate more code for your project.",
    })
    
    try {
      const endpoint = `/api/users/${Math.floor(Math.random() * 1000)}`
      const method = ["GET", "POST", "PUT", "DELETE"][Math.floor(Math.random() * 4)] as "GET" | "POST" | "PUT" | "DELETE"
      
      const codeGenService = new CodeGenService()
      const codeGenData: CodeGenData = {
        project_id: urlFriendlyName || "project-123",
        prompt: `Generate a ${method} endpoint for ${endpoint}`,
        language: "python",
        method: method,
        endpoint_path: endpoint,
        additional_context: ""
      }
      
      const response = await codeGenService.generateCode(codeGenData)
      
      // Check response status based on your API structure
      if (!response.success) {
        throw new Error(response.message)
      }
      
      // Process the response - you'll need to adapt this to match your actual API structure
      // This is a mock response - adjust based on your API
      const additionalResponse: GeneratedDataType = {
        project_id: urlFriendlyName || "project-123",
        endpoint: {
          generated_code: `@app.route("${endpoint}", methods=["${method}"])
def new_endpoint():
    # Auto-generated endpoint
    data = request.json
    
    # Process request...
    
    return jsonify({
        "message": "Operation successful",
        "data": {}
    }), 200`,
          endpoint_path: endpoint,
          method: method,
          content_base64: "",
          file_path: `routes${endpoint}.py`,
          file_hash: "",
          endpoint_id: `${method.toLowerCase()}-${endpoint.replace(/\//g, '-')}`,
        }
      }
      
      // Update generated data with the new endpoint
      if (generatedData) {
        setGeneratedData({
          ...generatedData,
          endpoint: additionalResponse.endpoint
        })
      } else {
        setGeneratedData(additionalResponse)
      }
      
      // Add new endpoint to files
      const newEndpoint: FileType = {
        id: additionalResponse.endpoint?.endpoint_id || `endpoint-${Date.now()}`,
        name: additionalResponse.endpoint?.endpoint_path?.split('/').pop() || 'endpoint',
        path: additionalResponse.endpoint?.endpoint_path || '',
        type: "endpoint",
        method: additionalResponse.endpoint?.method as "GET" | "POST" | "PUT" | "DELETE" || "GET",
        code: additionalResponse.endpoint?.generated_code || '',
      }
      
      setFiles(prev => [...prev, newEndpoint])
      setSelectedFile(newEndpoint.id)
      
      toast({
        title: "Code generated",
        description: `Generated new ${method} endpoint at ${endpoint}`,
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

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <ProjectHeader 
        projectName={projectName}
        urlFriendlyName={urlFriendlyName}
        templateId={templateId}
        isGenerating={isGenerating}
        onCopyCode={handleCopyCode}
        onDeleteFile={handleDeleteFile}
        onSaveFile={handleSaveFile}
      />

      <main className="flex-1">
        <div className="container py-6">
          <div className="grid grid-cols-[280px_1fr_300px] gap-6" style={{ height: "calc(100vh - 200px)" }}>
            {/* Project Files */}
            <ProjectFiles 
              files={files}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              generatedData={generatedData}
              onGenerateAdditionalCode={handleGenerateAdditionalCode}
              onSelectGeneratedFile={handleSelectGeneratedFile}
              isGenerating={isGenerating}
            />

            {/* File Content */}
            <FileContent 
              selectedFile={selectedFile}
              currentCode={currentCode}
              files={files}
              onCodeChange={setCurrentCode}
              theme={theme}
            />

            {/* AI Chat Panel */}
            <div className="h-full">
              <AIChat projectId={urlFriendlyName || projectName} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}