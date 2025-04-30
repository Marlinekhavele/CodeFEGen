"use client"

import { useState, useEffect } from "react"
import AIChat from "@/components/ai-chat"
import { toast } from "@/components/ui/use-toast"
import type {
  GeneratedFileType,
  FileType,
  GeneratedDataType,
  EndpointListContent,
  MethodType,
  EndpointDetails,
} from "@/types"
import { ProjectHeader } from "@/components/project-header"
import { ProjectFiles } from "@/components/project-files"
import { FileContent } from "@/components/file-content"
import { useTheme } from "@/components/theme-provider"
import EndPointService from "@/app/api/services/endpoint-service"
import MigrationService from "@/app/api/services/migration-service"
import createAxiosInstance from "@/app/api/services/axiosInstance"
import { EndpointModal } from "@/components/endpoint-modal"
import { MigrationButton } from "@/components/migration-button"
import { MigrationLog } from "@/components/migration-log"

interface BackendEditorClientProps {
  projectName: string
  urlFriendlyName?: string
  templateId?: string
  projectLanguage?: string
  projectFramework?: string
}

export default function BackendEditorClient({
  projectName,
  urlFriendlyName = "",
  templateId = "",
  projectLanguage = "python",
  projectFramework = "flask",
}: BackendEditorClientProps) {
  const [files, setFiles] = useState<FileType[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [currentCode, setCurrentCode] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEndpointCreating, setIsEndpointCreating] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(false)
  const [generatedData, setGeneratedData] = useState<GeneratedDataType | null>(null)
  const { theme } = useTheme()
  const isAnyLoading = isGenerating || isEndpointCreating || isPageLoading
  // Add a state to track streaming code
  const [streamingCode, setStreamingCode] = useState("")
  const [isEndpointModalOpen, setIsEndpointModalOpen] = useState(false)
  const [endpointDetails, setEndpointDetails] = useState<EndpointDetails | null>(null)
  const [activeTab, setActiveTab] = useState("code")
  const [isRunningMigrations, setIsRunningMigrations] = useState(false)
  const [hasPendingMigrations, setHasPendingMigrations] = useState(false)
  const [migrationLogs, setMigrationLogs] = useState<string[]>([])
  const [showMigrationLogs, setShowMigrationLogs] = useState(false)
  const [migrationStatus, setMigrationStatus] = useState<"idle" | "running" | "success" | "error">("idle")

  const handleOpenEndpointModal = async ({
    endpointPath,
    httpMethod,
    description,
  }: {
    endpointPath: string
    httpMethod: string
    description: string
  }) => {
    setIsEndpointModalOpen(true)
    return Promise.resolve()
  }

  const checkPendingMigrations = async () => {
    if (!urlFriendlyName) return

    try {
      const migrationService = new MigrationService()
      const hasPending = await migrationService.checkPendingMigrations(urlFriendlyName)
      setHasPendingMigrations(hasPending)
    } catch (error) {
      console.error("Error checking pending migrations:", error)
    }
  }

  const handleRunMigrations = async () => {
    if (!urlFriendlyName || isRunningMigrations) return
  
    setIsRunningMigrations(true)
    setMigrationStatus("running")
    setMigrationLogs([`[${new Date().toLocaleTimeString()}] Initiating migration process...`])
    setShowMigrationLogs(true)
  
    try {
      const migrationService = new MigrationService()
  
      // Add initial logs
      setMigrationLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Establishing connection to server...`,
      ])
  
      // Create a variable to track if we need to close the stream
      let closeLogStream: (() => void) | null = null
      
      // Set up the log streaming connection
      try {
        closeLogStream = migrationService.streamMigrationLogs(
          urlFriendlyName,
          (logEntry) => {
            setMigrationLogs(prev => [
              ...prev, 
              `[${logEntry.timestamp}] ${
                logEntry.level === "error" ? "ERROR: " : 
                logEntry.level === "warning" ? "WARNING: " : 
                logEntry.level === "success" ? "SUCCESS: " : 
                ""
              }${logEntry.message}`
            ]);
  
            // Update migration status when complete
            if (logEntry.completed) {
              setMigrationStatus(
                logEntry.level === "error" ? "error" : "success"
              );
              setIsRunningMigrations(false);
              
              // Check for success in final message
              const isSuccess = logEntry.level === "success" || 
                               logEntry.message.toLowerCase().includes("success") ||
                               !logEntry.message.toLowerCase().includes("fail");
                               
              // Refresh endpoint list if successful
              if (isSuccess) {
                setHasPendingMigrations(false);
                // Short delay to ensure backend has finished processing
                setTimeout(() => fetchEndpoints(), 1000);
              }
            }
          },
          (error) => {
            // Handle connection errors
            setMigrationLogs(prev => [
              ...prev,
              `[${new Date().toLocaleTimeString()}] ERROR: ${error}`
            ]);
            setMigrationStatus("error");
            setIsRunningMigrations(false);
            
            toast({
              title: "Migration log stream error",
              description: error,
              variant: "destructive"
            });
          }
        );
        
        setMigrationLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Log streaming connection established`,
        ]);
      } catch (error) {
        console.error("Failed to establish log streaming connection:", error);
        setMigrationLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] WARNING: Could not establish log streaming connection. Will proceed with migration but detailed logs may not be available.`,
        ]);
      }
  
      // Run the actual migration in parallel
      setMigrationLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Triggering migration process...`,
      ]);
      
      const result = await migrationService.runMigrations(urlFriendlyName)
  
      // Add success logs (only if we don't have streaming)
      if (!closeLogStream) {
        // If we don't have streaming logs, add basic information from the result
        setMigrationLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Migration process completed`,
          `[${new Date().toLocaleTimeString()}] ${result?.data?.message || "See server logs for details"}`,
        ]);
        
        setMigrationStatus(result?.data?.success ? "success" : "error");
        
        if (result?.data?.success) {
          setHasPendingMigrations(false);
          toast({
            title: "Migrations completed",
            description: result?.data?.message || "Migration process completed successfully",
            variant: "default",
          });
          
          // Refresh the file list to show new migration files
          fetchEndpoints();
        } else {
          toast({
            title: "Migration issues",
            description: result?.data?.message || "Migration completed with issues",
            variant: "destructive",
          });
        }
        
        // Set the final state
        setIsRunningMigrations(false);
      }
    } catch (error) {
      console.error("Error running migrations:", error)
  
      setMigrationLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ERROR: Failed to run migrations.`,
        `[${new Date().toLocaleTimeString()}] ${error instanceof Error ? error.message : String(error)}`,
      ])
      setMigrationStatus("error")
      setIsRunningMigrations(false)
  
      toast({
        title: "Migration failed",
        description: error instanceof Error ? error.message : "Failed to run migrations",
        variant: "destructive",
      })
    }
  }

  const fetchEndpoints = async () => {
  const endpointService = new EndPointService()
  const axiosInstance = createAxiosInstance('', 'v1')
  
  try {
    setIsPageLoading(true); // 🟢 Start page loading immediately
    console.log("Fetching endpoints for project:", urlFriendlyName)
    
    // Fetch endpoints
    const endpointResult = await endpointService.getEndpointList(urlFriendlyName)
    console.log("Endpoint list response:", endpointResult)

    // Fetch models
    const modelResult = await endpointService.getModelList(urlFriendlyName)
    console.log("Model list response:", modelResult)

    // Fetch schemas
    const schemaResult = await endpointService.getSchemaList(urlFriendlyName)
    console.log("Schema list response:", schemaResult)

    // Fetch helpers
    const helperResult = await endpointService.getHelperList(urlFriendlyName)
    console.log("Helper list response:", helperResult)

    // fetch docs
    const docsResult = await endpointService.getDocList(urlFriendlyName)
    console.log("Docs list response:", docsResult)

    // Fetch migrations
    const migrationResult = await endpointService.getMigrationList(urlFriendlyName)
    console.log("Migration list response:", migrationResult)
    let allFiles: FileType[] = []

    // Fetch database files
    try {
      console.log(`Fetching database files for project: ${urlFriendlyName}`);
      const databaseFiles = await endpointService.getDatabaseFiles(urlFriendlyName);
      console.log("Database files response:", databaseFiles);
      
      if (databaseFiles && databaseFiles.length > 0) {
        const dbFiles = databaseFiles.map((db) => ({
          id: `database-${db.name}`,
          name: db.name,
          path: db.path || `/db/${db.name}`,
          type: "database" as const,
          // Either don't include the code property at all, or set it to empty string
          code: ""
        }));
        
        allFiles = [...allFiles, ...dbFiles];
      }
    } catch (error) {
      console.error("Error fetching database files:", error);
    }

    // Process endpoints
    if (endpointResult && endpointResult.length > 0) {
      const endpointFiles = await Promise.all(
        endpointResult.map(async (ep: EndpointListContent) => {
          try {
            const endpointAxios = createAxiosInstance('/endpoint', 'v1')
            const resp = await endpointAxios.get('', {
              params: {
                project_id: urlFriendlyName,
                endpoint_path: ep.path,
                method: ep.method,
              },
            })
            const fileResult = resp.data?.data
            const code = fileResult?.content_base64
              ? atob(fileResult.content_base64)
              : ""
              
            let fileName = ep.path.split("/").pop() || ep.path;
            fileName = fileName.replace(/^(GET|POST|PUT|DELETE)_/i, "");
            
            return {
              id: `endpoint-${ep.path}`,
              name: fileName,
              path: ep.path,
              type: "endpoint" as const,
              code,
              method: ep.method as MethodType,
            }
          } catch (error) {
            console.error(`Error fetching code for endpoint ${ep.path}:`, error)
            let fileName = ep.path.split("/").pop() || ep.path;
            fileName = fileName.replace(/^(GET|POST|PUT|DELETE)_/i, "");
            return {
              id: `endpoint-${ep.path}`,
              name: fileName,
              path: ep.path,
              type: "endpoint" as const,
              code: "",
              method: ep.method as MethodType,
            }
          }
        })
      )
      allFiles = [...allFiles, ...endpointFiles]
    }

    // Process models
    if (modelResult && modelResult.length > 0) {
      const modelFiles = await Promise.all(
        modelResult.map(async (model: any) => {
          try {
            const modelAxios = createAxiosInstance(`/projects/${urlFriendlyName}/models/${model.name}/content`, 'v1')
            const resp = await modelAxios.get('')
            const fileResult = resp.data?.data
            const code = fileResult?.content_base64
              ? atob(fileResult.content_base64)
              : ""
            
            return {
              id: `model-${model.name}`,
              name: model.name,
              path: model.path || `/models/${model.name}`,
              type: "model" as const,
              code,
            }
          } catch (error) {
            console.error(`Error fetching code for model ${model.name}:`, error)
            return {
              id: `model-${model.name}`,
              name: model.name,
              path: model.path || `/models/${model.name}`,
              type: "model" as const,
              code: "",
            }
          }
        })
      )
      allFiles = [...allFiles, ...modelFiles]
    }

    // Process schemas
    if (schemaResult && schemaResult.length > 0) {
      const schemaFiles = await Promise.all(
        schemaResult.map(async (schema: any) => {
          try {
            const schemaAxios = createAxiosInstance(`/projects/${urlFriendlyName}/schemas/${schema.name}/content`, 'v1')
            const resp = await schemaAxios.get('')
            const fileResult = resp.data?.data
            const code = fileResult?.content_base64
              ? atob(fileResult.content_base64)
              : ""
            
            return {
              id: `schema-${schema.name}`,
              name: schema.name,
              path: schema.path || `/schemas/${schema.name}`,
              type: "schema" as const,
              code,
            }
          } catch (error) {
            console.error(`Error fetching code for schema ${schema.name}:`, error)
            return {
              id: `schema-${schema.name}`,
              name: schema.name,
              path: schema.path || `/schemas/${schema.name}`,
              type: "schema" as const,
              code: "",
            }
          }
        })
      )
      allFiles = [...allFiles, ...schemaFiles]
    }

    // Process helpers
    if (helperResult && helperResult.length > 0) {
      const helperFiles = await Promise.all(
        helperResult.map(async (helper: any) => {
          try {
            const helperAxios = createAxiosInstance(`/projects/${urlFriendlyName}/helpers/${helper.name}/content`, 'v1')
            const resp = await helperAxios.get('')
            const fileResult = resp.data?.data
            const code = fileResult?.content_base64
              ? atob(fileResult.content_base64)
              : ""
            
            return {
              id: `helper-${helper.name}`,
              name: helper.name,
              path: helper.path || `/helpers/${helper.name}`,
              type: "helpers" as const,
              code,
            }
          } catch (error) {
            console.error(`Error fetching code for helper ${helper.name}:`, error)
            return {
              id: `helper-${helper.name}`,
              name: helper.name,
              path: helper.path || `/helpers/${helper.name}`,
              type: "helpers" as const,
              code: "",
            }
          }
        })
      )
      allFiles = [...allFiles, ...helperFiles]
    }
    // Process docs
    if (docsResult && docsResult.length > 0) {
      const docsFiles = await Promise.all(
        docsResult.map(async (doc: any) => {
          try {
            const docsAxios = createAxiosInstance(`/projects/${urlFriendlyName}/docs/${doc.name}/content`, 'v1')
            const resp = await docsAxios.get('')
            const fileResult = resp.data?.data
            const code = fileResult?.content_base64
              ? atob(fileResult.content_base64)
              : ""
            return {
              id: `docs-${doc.name}`,
              name: doc.name, 
              path: doc.path || `/docs/${doc.name}`,
              type: "docs" as const,
              code,
            }
          } catch (error) {
            console.error(`Error fetching code for docs ${doc.name}:`, error)
            return {
              id: `docs-${doc.name}`,
              name: doc.name,
              path: doc.path || `/docs/${doc.name}`,
              type: "docs" as const,
              code: "",
            }
          }
        })
      )
      allFiles = [...allFiles, ...docsFiles]
    }

    // Process migrations
    if (migrationResult && migrationResult.length > 0) {
      const migrationFiles = await Promise.all(
        migrationResult.map(async (migration: any) => {
          try {
            const migrationAxios = createAxiosInstance(`/projects/${urlFriendlyName}/alembic/versions/${migration.name}/content`, 'v1')
            const resp = await migrationAxios.get('')
            const fileResult = resp.data?.data
            const code = fileResult?.content_base64
              ? atob(fileResult.content_base64)
              : ""
            
            return {
              id: `migration-${migration.name}`,
              name: migration.name,
              path: migration.path || `/alembic/versions/${migration.name}`,
              type: "migration" as const,
              code,
            }
          } catch (error) {
            console.error(`Error fetching code for migration ${migration.name}:`, error)
            return {
              id: `migration-${migration.name}`,
              name: migration.name,
              path: migration.path || `/alembic/versions/${migration.name}`,
              type: "migration" as const,
              code: "",
            }
          }
        })
      )
      allFiles = [...allFiles, ...migrationFiles]
    }
    
    


    console.log("All processed files:", allFiles)
    setFiles(allFiles)
    
    if (allFiles.length > 0) {
      setSelectedFile(allFiles[0].id)
      setCurrentCode(allFiles[0].code)
    } else {
      console.log("No files found for project")
      toast({
        title: "No files found",
        description: "This project doesn't have any files yet. Try creating one!",
        variant: "default"
      })
    }

      // Check for pending migrations after loading files
      if (allFiles.some((file) => file.type === "model" || file.type === "schema")) {
        checkPendingMigrations()
      }
    } catch (error) {
      console.error("Error fetching files:", error)
      toast({
        title: "Error fetching files",
        description: error instanceof Error ? error.message : "Failed to fetch files",
        variant: "destructive",
      })
    } finally {
      setIsPageLoading(false) // 🛑 Stop page loading when fetch is done (whether success or error)
    }
  }

  useEffect(() => {
    // Check for pending migrations when files change
    const modelFiles = files.filter((f) => f.type === "model" || f.type === "schema")
    if (modelFiles.length > 0) {
      checkPendingMigrations()
    }
  }, [files, urlFriendlyName])

  useEffect(() => {
    if (urlFriendlyName) {
      fetchEndpoints()
    }
  }, [urlFriendlyName])

  // Listen for code updates from AIChat component
  useEffect(() => {
    const handleCodeUpdate = (event: any) => {
      console.log("BackendEditorClient received code-update event:", event.detail)

      const { files, code } = event.detail

      // If we receive files objects from the AI Chat component
      if (files) {
        console.log("Received files from AI Chat:", files)

        // Process each file type (endpoint, model, schema, migration, helpers, config)
        const newFiles: FileType[] = []

        // Helper function to process each file
        const processFile = (
          fileKey: "endpoint" | "model" | "schema" | "migration" | "helpers" | "config",
          fileData: any,
        ) => {
          if (!fileData || !fileData.generated_code) return

          // Get file details in a consistent way
          const fileName = fileData.file_path?.split("/").pop() || fileKey
          const filePath = fileData.endpoint_path || fileData.file_path || `/${fileKey}`
          const fileCode = fileData.generated_code || ""
          const fileMethod = (fileData.method as "GET" | "POST" | "PUT" | "DELETE") || "GET"

          // Add file to array
          newFiles.push({
            id: fileData.endpoint_id || fileData.entity_name || `${fileKey}-${Date.now()}`,
            name: fileName,
            path: filePath,
            type: fileKey,
            code: fileCode,
            method: fileMethod,
          })
        }

        // Process each possible file type
        if (files.endpoint) processFile("endpoint", files.endpoint)
        if (files.model) processFile("model", files.model)
        if (files.schema) processFile("schema", files.schema)
        if (files.migration) processFile("migration", files.migration)
        if (files.helpers) processFile("helpers", files.helpers)
        if (files.config) processFile("config", files.config)

        // Update files state with new files
        if (newFiles.length > 0) {
          setFiles((prev) => {
            // Create a merged array
            const merged = [...prev]

            // Process each new file
            newFiles.forEach((newFile) => {
              // Check if file already exists
              const existingFileIndex = merged.findIndex(
                (f) => f.id === newFile.id || (f.type === newFile.type && f.path === newFile.path),
              )

              if (existingFileIndex >= 0) {
                // Update existing file
                merged[existingFileIndex] = newFile
              } else {
                // Add new file
                merged.push(newFile)
              }
            })

            return merged
          })

          // Select the first endpoint file if available, otherwise any new file
          const endpointFile = newFiles.find((f) => f.type === "endpoint")
          if (endpointFile) {
            setSelectedFile(endpointFile.id)
            setCurrentCode(endpointFile.code)
          } else if (newFiles.length > 0) {
            setSelectedFile(newFiles[0].id)
            setCurrentCode(newFiles[0].code)
          }

          // Clear streaming code
          setStreamingCode("")

          toast({
            title: "Code generated",
            description: `${newFiles.length} new file(s) have been added to your project.`,
          })
        }

        // Update generatedData state
        const updatedGeneratedData: GeneratedDataType = {}

        if (files.endpoint) updatedGeneratedData.endpoint = files.endpoint
        if (files.model) updatedGeneratedData.model = files.model
        if (files.schema) updatedGeneratedData.schema = files.schema
        if (files.migration) updatedGeneratedData.migration = files.migration
        if (files.helpers) updatedGeneratedData.helpers = files.helpers
        if (files.config) updatedGeneratedData.config = files.config

        // Add any other properties from the original generatedData
        if (generatedData) {
          if (generatedData.project_id) updatedGeneratedData.project_id = generatedData.project_id
          if (generatedData.git_results) updatedGeneratedData.git_results = generatedData.git_results
        }

        setGeneratedData(updatedGeneratedData)
      }

      // If we receive just code (not structured files)
      if (code && !files) {
        setStreamingCode(code)

        // If there's no selected file, show the streaming code
        if (!selectedFile) {
          setCurrentCode(code)
        }
      }

      // End the generation state
      setIsGenerating(false)
    }

    // Handle direct file generation
    const handleFileGenerated = (event: any) => {
      const { file } = event.detail

      if (file && file.type) {
        console.log("File generated event received:", file)

        // Make sure the file type is valid
        if (["endpoint", "model", "schema", "migration", "helpers", "config"].includes(file.type)) {
          setFiles((prev) => {
            // Check if file already exists
            const existingFileIndex = prev.findIndex((f) => f.id === file.id)

            if (existingFileIndex >= 0) {
              // Update existing file
              return prev.map((f, i) => (i === existingFileIndex ? file : f))
            } else {
              // Add new file
              return [...prev, file]
            }
          })

          // Update generatedData state for specific file types
          setGeneratedData((prev) => {
            // Create a new object to avoid direct mutation
            const updated = { ...prev } as GeneratedDataType

            // Handle each type correctly
            if (file.type === "endpoint") {
              updated.endpoint = {
                file_path: file.path,
                generated_code: file.code,
                endpoint_path: file.path,
                method: file.method,
                content_base64: "",
                file_hash: "",
                ...(prev?.endpoint || {}),
              }
            } else if (file.type === "model") {
              updated.model = {
                file_path: file.path,
                generated_code: file.code,
                content_base64: "",
                file_hash: "",
                entity_name: "",
                ...(prev?.model || {}),
              }
            } else if (file.type === "schema") {
              updated.schema = {
                file_path: file.path,
                generated_code: file.code,
                content_base64: "",
                file_hash: "",
                entity_name: "",
                ...(prev?.schema || {}),
              }
            } else if (file.type === "migration") {
              updated.migration = {
                file_path: file.path,
                generated_code: file.code,
                content_base64: "",
                file_hash: "",
                entity_name: "",
                ...(prev?.migration || {}),
              }
            } else if (file.type === "helpers") {
              updated.helpers = {
                file_path: file.path,
                generated_code: file.code,
                content_base64: "",
                file_hash: "",
                ...(prev?.helpers || {}),
              }
            } else if (file.type === "config") {
              updated.config = {
                file_path: file.path,
                generated_code: file.code,
                content_base64: "",
                file_hash: "",
                ...(prev?.config || {}),
              }
            }

            return updated
          })
        }
      }
    }

    // Handle streaming code chunks
    const handleCodeChunk = (event: any) => {
      console.log("BackendEditorClient received code-chunk event:", event.detail)

      const { code } = event.detail

      if (code) {
        setStreamingCode((prev) => prev + code)

        // If no file is selected, update the current code to show the streaming
        if (!selectedFile) {
          setCurrentCode((prev) => prev + code)
        }
      }
    }

    // Handle when code generation starts
    const handleCodeGenerationStart = () => {
      console.log("Code generation started")
      setIsGenerating(true)
    }

    // Add event listeners
    window.addEventListener("code-update", handleCodeUpdate)
    window.addEventListener("code-chunk", handleCodeChunk)
    window.addEventListener("code-generation-start", handleCodeGenerationStart)
    window.addEventListener("file-generated", handleFileGenerated)

    // Clean up
    return () => {
      window.removeEventListener("code-update", handleCodeUpdate)
      window.removeEventListener("code-chunk", handleCodeChunk)
      window.removeEventListener("code-generation-start", handleCodeGenerationStart)
      window.removeEventListener("file-generated", handleFileGenerated)
    }
  }, [selectedFile, generatedData])

  // Ensure currentCode updates when selectedFile changes
  useEffect(() => {
    if (selectedFile) {
      const file = files.find((f) => f.id === selectedFile)
      if (file) {
        // Set current code
        setCurrentCode(file.code)

        // Automatically switch tabs based on file type
        if (file.type === "docs") {
          setActiveTab("docs")
        } else {
          setActiveTab("code")
        }
      }
    }
  }, [selectedFile, files])

  const handleSaveFile = () => {
    if (!selectedFile) return

    setFiles(files.map((file) => (file.id === selectedFile ? { ...file, code: currentCode } : file)))

    // If this file is part of the generated data, update that too
    if (generatedData) {
      const currentFile = files.find((f) => f.id === selectedFile)
      if (currentFile) {
        const updatedGeneratedData = { ...generatedData }

        // Update the appropriate file type in generatedData
        if (currentFile.type === "endpoint" && updatedGeneratedData.endpoint) {
          updatedGeneratedData.endpoint.generated_code = currentCode
        } else if (currentFile.type === "model" && updatedGeneratedData.model) {
          updatedGeneratedData.model.generated_code = currentCode
        } else if (currentFile.type === "schema" && updatedGeneratedData.schema) {
          updatedGeneratedData.schema.generated_code = currentCode
        } else if (currentFile.type === "migration" && updatedGeneratedData.migration) {
          updatedGeneratedData.migration.generated_code = currentCode
        } else if (currentFile.type === "helpers" && updatedGeneratedData.helpers) {
          updatedGeneratedData.helpers.generated_code = currentCode
        } else if (currentFile.type === "config" && updatedGeneratedData.config) {
          updatedGeneratedData.config.generated_code = currentCode
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
    const existingFile = files.find(
      (f) => (f.type === file.type && f.id === file.id) || (f.type === file.type && f.path === file.path),
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
        method: file.method as "GET" | "POST" | "PUT" | "DELETE",
      }

      setFiles((prev) => [...prev, newFile])
      setSelectedFile(newFile.id)
    }
  }

  // Function to handle file generation directly from AIChat
  const handleFileGenerated = (file: FileType) => {
    console.log("File generated from AIChat:", file)

    setFiles((prev) => {
      // Check if file already exists
      const existingFile = prev.find((f) => f.id === file.id)

      if (existingFile) {
        // Update existing file
        return prev.map((f) => (f.id === file.id ? { ...f, code: file.code } : f))
      } else {
        // Add new file
        return [...prev, file]
      }
    })

    // Select the newly generated file
    setSelectedFile(file.id)
    setCurrentCode(file.code)
    setIsGenerating(false)
  }

  // Handler for endpoint details submission from modal
  const handleEndpointDetailsSubmit = (details: EndpointDetails) => {
    // Set the generation state
    setIsEndpointCreating(true)
    console.log("Set isEndpointCreating to true")

    // First, create the endpoint structure using the API service
    const endpointService = new EndPointService()
    endpointService
      .newEndpointCreation(
        urlFriendlyName,
        details.endpointPath,
        details.method,
        details.description, // This is used purely for documentation
      )
      .then(() => {
        // Show a toast notification that endpoint is being created
        toast({
          title: "Creating endpoint...",
          description: `Setting up ${details.method} endpoint at ${details.endpointPath}`,
        })
        // After creating the endpoint structure, refresh the file list
        return endpointService.getEndpointList(urlFriendlyName)
      })
      .then((endpointResult) => {
        // Find the newly created endpoint
        const newEndpoint = endpointResult.find(
          (ep) => ep.path === details.endpointPath && ep.method === details.method,
        )

        if (newEndpoint) {
          // Process the new endpoint for our file list
          const fileName = newEndpoint.path.split("/").pop() || newEndpoint.path

          // Create the file object
          const newFile: FileType = {
            id: `endpoint-${newEndpoint.path}`,
            name: fileName,
            path: newEndpoint.path,
            type: "endpoint" as const,
            code: "",
            method: newEndpoint.method as "GET" | "POST" | "PUT" | "DELETE",
          }

          // Add to files list and select it
          setFiles((prev) => [...prev, newFile])
          setSelectedFile(newFile.id)

          // Show success notification
          toast({
            title: "Endpoint Created",
            description: `${details.method} endpoint at ${details.endpointPath} created successfully. Now describe its functionality in the chat.`,
          })
        } else {
          // Show a warning if the endpoint wasn't found in the response
          toast({
            title: "Endpoint Created",
            description: "Endpoint was created but couldn't be loaded automatically. Please refresh the file list.",
          })
        }

        // Add a deliberate delay to ensure loading state is visible
        setTimeout(() => {
          setIsEndpointCreating(false)
        }, 3000)

        // Focus the AI chat input if possible
        const aiChatInput = document.querySelector(".ai-chat-input") as HTMLTextAreaElement
        if (aiChatInput) {
          aiChatInput.focus()
          aiChatInput.placeholder = `Describe what this ${details.method} endpoint at ${details.endpointPath} should do...`
        }
      })
      .catch((error) => {
        console.error("Error creating endpoint:", error)
        toast({
          title: "Error creating endpoint",
          description: error instanceof Error ? error.message : "Failed to create endpoint",
          variant: "destructive",
        })
        setIsEndpointCreating(false)
      })
  }

  // Function to generate additional code using WebSocket
  const handleGenerateAdditionalCode = async () => {
    // Set state to indicate code generation is starting
    setIsGenerating(true)

    // Notify the user
    toast({
      title: "Generating code",
      description: "Please use the AI chat to create a new endpoint.",
    })

    // Focus the AI chat input if possible
    const aiChatInput = document.querySelector(".ai-chat-input") as HTMLTextAreaElement
    if (aiChatInput) {
      aiChatInput.focus()
    }

    // Return a resolved promise to match the expected return type
    return Promise.resolve()
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 p-2">
      <ProjectHeader
        projectName={projectName}
        urlFriendlyName={urlFriendlyName}
        templateId={templateId}
        isGenerating={isGenerating}
        onCopyCode={handleCopyCode}
        onDeleteFile={handleDeleteFile}
        onSaveFile={handleSaveFile}
        onDownloadFile={() => {
          if (!selectedFile) return
          const file = files.find((f) => f.id === selectedFile)
          if (file) {
            const blob = new Blob([file.code], { type: "text/plain" })
            const link = document.createElement("a")
            link.href = URL.createObjectURL(blob)
            link.download = file.name || "file.txt"
            link.click()
            toast({
              title: "File downloaded",
              description: `The file "${file.name}" has been downloaded.`,
            })
          }
        }}
        onRunMigrations={handleRunMigrations}
        hasPendingMigrations={hasPendingMigrations}
      />

      <main className="flex-1">
        <div className="container py-6">
          {isAnyLoading ? (
            <div className="grid grid-cols-[280px_1fr_300px] gap-6" style={{ height: "calc(100vh - 200px)" }}>
              {/* Left Side (Project Files Skeleton) */}
              <div className="space-y-4 animate-[pulse_2s_ease-in-out_infinite]">
                <div className="h-10 bg-zinc-700/60 rounded-md backdrop-blur-sm" />
                <div className="h-6 bg-zinc-700/50 rounded-md backdrop-blur-sm" />
                <div className="h-6 bg-zinc-700/50 rounded-md backdrop-blur-sm" />
                <div className="h-6 bg-zinc-700/50 rounded-md backdrop-blur-sm" />
                <div className="h-6 bg-zinc-700/50 rounded-md backdrop-blur-sm" />
              </div>

              {/* Center (Code Editor Skeleton) */}
              <div className="flex flex-col space-y-4 animate-[pulse_2s_ease-in-out_infinite]">
                <div className="h-10 bg-zinc-700/60 rounded-md backdrop-blur-sm" />
                <div className="flex-1 bg-zinc-800/50 rounded-md backdrop-blur-sm" />
              </div>

              {/* Right Side (AI Chat Panel Skeleton) */}
              <div className="flex flex-col space-y-4 animate-[pulse_2s_ease-in-out_infinite]">
                <div className="h-10 bg-zinc-700/60 rounded-md backdrop-blur-sm" />
                <div className="flex-1 bg-zinc-800/50 rounded-md backdrop-blur-sm" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-[230px_1fr_270px] gap-6" style={{ height: "calc(100vh - 200px)" }}>
              {/* Project Files */}
              <ProjectFiles
                files={files}
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                generatedData={generatedData}
                onGenerateAdditionalCode={handleGenerateAdditionalCode}
                onSelectGeneratedFile={handleSelectGeneratedFile}
                onEndpointDetailsSubmit={handleEndpointDetailsSubmit}
                isGenerating={isGenerating}
                onCreateEndpoint={handleOpenEndpointModal}
                projectLanguage={projectLanguage}
                projectFramework={projectFramework}
                projectId={urlFriendlyName}
              />

              {/* File Content */}
              <FileContent
                selectedFile={selectedFile}
                currentCode={currentCode}
                files={files}
                onCodeChange={setCurrentCode}
                theme={theme}
                streamingCode={streamingCode}
                projectId={urlFriendlyName}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />

              {/* AI Chat Panel */}
              <div className="h-full">
                <AIChat
                  projectId={urlFriendlyName || projectName}
                  onFileGenerated={handleFileGenerated}
                  endpointDetails={endpointDetails}
                  projectLanguage={projectLanguage}
                  projectFramework={projectFramework}
                  selectedFile={selectedFile ? files.find((f) => f.id === selectedFile) : null}
                />
                <EndpointModal
                  isOpen={isEndpointModalOpen}
                  onClose={() => {
                    if (!isEndpointCreating) {
                      setIsEndpointModalOpen(false)
                    }
                  }}
                  onSubmit={handleEndpointDetailsSubmit}
                  projectLanguage={projectLanguage}
                  projectFramework={projectFramework}
                  isLoading={isEndpointCreating}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Migration Button */}
      <MigrationButton
        onRunMigrations={handleRunMigrations}
        hasPendingMigrations={hasPendingMigrations}
        isLoading={isRunningMigrations}
      />

      {/* Migration Logs */}
      <MigrationLog
        logs={migrationLogs}
        isOpen={showMigrationLogs}
        onClose={() => setShowMigrationLogs(false)}
        status={migrationStatus}
        title="Database Migration Logs"
      />
    </div>
  )
}
