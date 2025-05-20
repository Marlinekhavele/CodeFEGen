"use client"

import { useState, useEffect } from "react"
import AIChat from "@/components/ai-chat"
import type {
  GeneratedFileType,
  FileType,
  GeneratedDataType,
  EndpointListContent,
  MethodType,
  EndpointDetails,
} from "@/types"
declare global {
  interface Window {
    streamingEndpointMethod?: string;
  }
}
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
import { Button } from "@/components/ui/button"

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
  const [isFetchingEndpoints, setIsFetchingEndpoints] = useState(false)
  const [generatedData, setGeneratedData] = useState<GeneratedDataType | null>(null)
  const { theme } = useTheme()
  const isAnyLoading = isGenerating || isPageLoading
  const [streamingCode, setStreamingCode] = useState("")
  const [isEndpointModalOpen, setIsEndpointModalOpen] = useState(false)
  const [endpointDetails, setEndpointDetails] = useState<EndpointDetails | null>(null)
  const [activeTab, setActiveTab] = useState("code")
  const [isRunningMigrations, setIsRunningMigrations] = useState(false)
  const [hasPendingMigrations, setHasPendingMigrations] = useState(false)
  const [isAnimatingFile, setIsAnimatingFile] = useState(false)
  const [codeToAnimate, setCodeToAnimate] = useState("")
  const [migrationLogs, setMigrationLogs] = useState<string[]>([])
  const [showMigrationLogs, setShowMigrationLogs] = useState(false)
  const [migrationStatus, setMigrationStatus] = useState<"idle" | "running" | "success" | "error">("idle")
  const [fileAnimationQueue, setFileAnimationQueue] = useState<FileType[]>([])
  const [activeMobilePanel, setActiveMobilePanel] = useState<"files" | "editor" | "chat">("editor")

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
      setMigrationLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Establishing connection to server...`,
      ])
  
      let closeLogStream: (() => void) | null = null
      
      try {
        closeLogStream = migrationService.streamMigrationLogs(
          urlFriendlyName,
          (logEntry) => {
            // Enhanced log level detection
            const logLevel = logEntry.level ? logEntry.level.toLowerCase() : "";
            
            // Check specifically for table creation events
            const isTableCreationEvent = logEntry.message && 
              (logEntry.message.toLowerCase().includes("creating table") || 
               logEntry.message.toLowerCase().includes("table created") ||
               (logEntry.message.toLowerCase().includes("table") && !logEntry.message.toLowerCase().includes("already exists")));
            
            const prefix = 
              isTableCreationEvent ? "TABLE CREATED: " :
              logLevel === "error" ? "ERROR: " : 
              logLevel === "warning" || logLevel === "warn" ? "WARNING: " : 
              logLevel === "success" ? "SUCCESS: " :
              logLevel === "info" ? "INFO: " :
              logLevel === "debug" ? "DEBUG: " : 
              "";
            
            // Force success level for table creation events to highlight them
            const displayLevel = isTableCreationEvent ? "success" : logLevel;
            
            // Update UI with log entry
            setMigrationLogs(prev => [
              ...prev, 
              `[${logEntry.timestamp || new Date().toLocaleTimeString()}] ${prefix}${logEntry.message}`
            ]);
        
            if (logEntry.completed) {
              // If we had any table creation events but received a generic "no tables" summary,
              // let's provide a more accurate summary
              if (isTableCreationEvent) {
                setMigrationLogs(prev => [
                  ...prev,
                  `[${new Date().toLocaleTimeString()}] SUCCESS: Database tables were updated successfully.`
                ]);
              }
              
              setMigrationStatus(
                logEntry.level === "error" ? "error" : "success"
              );
              setIsRunningMigrations(false);
              
              const isSuccess = logEntry.level === "success" || 
                                logEntry.message.toLowerCase().includes("success") ||
                                !logEntry.message.toLowerCase().includes("fail");
                                
              if (isSuccess) {
                setHasPendingMigrations(false);
                setTimeout(() => fetchEndpoints(), 1000);
              }
            }
          },
          (error) => {
            setMigrationLogs(prev => [
              ...prev,
              `[${new Date().toLocaleTimeString()}] ERROR: ${error}`
            ]);
            setMigrationStatus("error");
            setIsRunningMigrations(false);
          }
        )
        
        setMigrationLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Log streaming connection established`,
        ])
      } catch (error) {
        setMigrationLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] WARNING: Could not establish log streaming connection. Will proceed with migration but detailed logs may not be available.`,
        ])
      }
  
      setMigrationLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Triggering migration process...`,
      ])
      
      const result = await migrationService.runMigrations(urlFriendlyName)
  
      if (!closeLogStream) {
        setMigrationLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Migration process completed`,
          `[${new Date().toLocaleTimeString()}] ${result?.data?.message || "See server logs for details"}`,
        ])
        
        setMigrationStatus(result?.data?.success ? "success" : "error")
        
        if (result?.data?.success) {
          setHasPendingMigrations(false)
          fetchEndpoints()
        }
        
        setIsRunningMigrations(false)
      }
    } catch (error) {
  
      setMigrationLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ERROR: Failed to run migrations.`,
        `[${new Date().toLocaleTimeString()}] ${error instanceof Error ? error.message : String(error)}`,
      ])
      setMigrationStatus("error")
      setIsRunningMigrations(false)
    }
  }

  // Utility function to normalize paths for comparison
  const normalizePath = (path: string): string => {
    return path.trim().replace(/^\/+|\/+$/g, '')
  }

  const fetchEndpoints = async (isPostCreation: boolean = false, newEndpointPath: string = "", newEndpointMethod: string = "") => {
    const endpointService = new EndPointService()
    const axiosInstance = createAxiosInstance('', 'v1')
  
    try {
      if (!isPostCreation) {
        setIsPageLoading(true)
      } else {
        setIsFetchingEndpoints(true)
      }
    
      const endpointResult = await endpointService.getEndpointList(urlFriendlyName)

      const modelResult = await endpointService.getModelList(urlFriendlyName)

      const schemaResult = await endpointService.getSchemaList(urlFriendlyName)

      const helperResult = await endpointService.getHelperList(urlFriendlyName)

      const docsResult = await endpointService.getDocList(urlFriendlyName)

      const migrationResult = await endpointService.getMigrationList(urlFriendlyName)

      let allFiles: FileType[] = []

      try {
        const databaseFiles = await endpointService.getDatabaseFiles(urlFriendlyName)
        
        if (databaseFiles && databaseFiles.length > 0) {
          const dbFiles = databaseFiles.map((db) => ({
            id: `database-${db.name}`,
            name: db.name,
            path: db.path || `/db/${db.name}`,
            type: "database" as const,
            code: ""
          }))
          
          allFiles = [...allFiles, ...dbFiles]
        }
      } catch (error) {
      }

      // Explicitly define the type for newEndpointFile
      let newEndpointFile: FileType | null = null;

      // Normalize the new endpoint path for comparison
      const normalizedNewEndpointPath = newEndpointPath ? normalizePath(newEndpointPath) : ""

      if (endpointResult && endpointResult.length > 0) {
        const endpointFilesPromises = endpointResult.map(async (ep: EndpointListContent) => {
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
              
            let fileName = ep.path.split("/").pop() || ep.path
            fileName = fileName.replace(/^(GET|POST|PUT|DELETE)_/i, "")
            
            const fileId = `endpoint-${ep.path}-${ep.method}`
            
            const endpointFile: FileType = {
              id: fileId,
              name: fileName,
              path: ep.path,
              type: "endpoint" as const,
              code,
              method: ep.method as MethodType,
            }
            
            // Normalize the endpoint path for comparison
            const normalizedEpPath = normalizePath(ep.path)
            
            if (isPostCreation && normalizedNewEndpointPath && newEndpointMethod &&
                normalizedEpPath === normalizedNewEndpointPath && ep.method.toUpperCase() === newEndpointMethod.toUpperCase()) {
              newEndpointFile = endpointFile
            }
            
            return endpointFile
          } catch (error) {
            let fileName = ep.path.split("/").pop() || ep.path
            fileName = fileName.replace(/^(GET|POST|PUT|DELETE)_/i, "")
            
            const fileId = `endpoint-${ep.path}-${ep.method}`
            
            return {
              id: fileId,
              name: fileName,
              path: ep.path,
              type: "endpoint" as const,
              code: "",
              method: ep.method as MethodType,
            }
          }
        });
        
        const endpointFiles = await Promise.all(endpointFilesPromises);
        
        // Group endpoints by path and handle duplicates
        const endpointsByPath = new Map<string, FileType[]>();
        
        endpointFiles.forEach(file => {
          if (!file) return;
          const key = file.path;
          if (!endpointsByPath.has(key)) {
            endpointsByPath.set(key, []);
          }
          endpointsByPath.get(key)!.push(file);
        });
        
        // For each path, handle duplicates with more specific rules
        const filteredEndpointFiles: FileType[] = [];
        
        endpointsByPath.forEach((filesForPath, path) => {
          if (filesForPath.length > 1) {
            // First, check if we have the specific case: POST with code and GET without code
            const postEndpoint = filesForPath.find(f => f.method?.toUpperCase() === 'POST' && f.code && f.code.trim() !== '');
            const emptyGetEndpoint = filesForPath.find(f => f.method?.toUpperCase() === 'GET' && (!f.code || f.code.trim() === ''));
            
            if (postEndpoint && emptyGetEndpoint && filesForPath.length === 2) {
              // If we have exactly a POST with code and a GET without code, only keep the POST
              filteredEndpointFiles.push(postEndpoint);
            } else {
              // Otherwise, use the general rule: keep endpoints with code
              const filesWithCode = filesForPath.filter(f => f.code && f.code.trim() !== '');
              
              if (filesWithCode.length > 0) {
                // If we have endpoints with code, keep only those
                filteredEndpointFiles.push(...filesWithCode);
              } else {
                // If all endpoints are empty, just keep one (preferring non-GET methods)
                const nonGetEndpoint = filesForPath.find(f => f.method?.toUpperCase() !== 'GET');
                if (nonGetEndpoint) {
                  filteredEndpointFiles.push(nonGetEndpoint);
                } else {
                  // If there are only GET endpoints, just keep the first one
                  filteredEndpointFiles.push(filesForPath[0]);
                }
              }
            }
          } else {
            // If there's only one endpoint for this path, keep it regardless
            filteredEndpointFiles.push(...filesForPath);
          }
        });
        
        allFiles = [...allFiles, ...filteredEndpointFiles];
      }

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
    
      setFiles(allFiles)
      
      if (isPostCreation && newEndpointFile) {
        
        setSelectedFile((newEndpointFile as FileType).id)
        setCurrentCode((newEndpointFile as FileType).code)
      } else if (!isPostCreation && allFiles.length > 0) {
        setSelectedFile(allFiles[0].id)
        setCurrentCode(allFiles[0].code)
      }

      if (allFiles.some((file) => file.type === "model" || file.type === "schema")) {
        checkPendingMigrations()
      }
      
      return endpointResult
    } catch (error) {
      return []
    } finally {
      if (!isPostCreation) {
        setIsPageLoading(false)
      }
      setIsFetchingEndpoints(false)
    }
  }

  useEffect(() => {
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

  useEffect(() => {
    if (endpointDetails?.method) {
      // Store the method preference when a new endpoint is created
      window.streamingEndpointMethod = endpointDetails.method;
      
    }
  }, [endpointDetails]);

  useEffect(() => {
    const handleCodeUpdate = (event: any) => {
      const { files, code } = event.detail
  
      if (files) {
        const newFiles: FileType[] = []
  
        const processFile = (
          fileKey: "endpoint" | "model" | "schema" | "migration" | "helpers" | "config",
          fileData: any,
        ) => {
          if (!fileData || !fileData.generated_code) return

          const fileName = fileData.file_path?.split("/").pop() || fileKey
          const filePath = fileData.endpoint_path || fileData.file_path || `/${fileKey}`
          const fileCode = fileData.generated_code || ""
          
          // Extract method from file path for endpoints
          let methodFromPath: string | undefined = undefined;
          if (fileKey === "endpoint" && filePath) {
            const postMatch = filePath.match(/\.post\./i) || filePath.match(/post_/i) || filePath.match(/_post/i);
            const getMatch = filePath.match(/\.get\./i) || filePath.match(/get_/i) || filePath.match(/_get/i);
            const putMatch = filePath.match(/\.put\./i) || filePath.match(/put_/i) || filePath.match(/_put/i);
            const deleteMatch = filePath.match(/\.delete\./i) || filePath.match(/delete_/i) || filePath.match(/_delete/i);
            
            if (postMatch) methodFromPath = "POST";
            else if (getMatch) methodFromPath = "GET";
            else if (putMatch) methodFromPath = "PUT";
            else if (deleteMatch) methodFromPath = "DELETE";
          }
          
          // Determine method using the same priority logic as handleFileGenerated
          let determinedMethod: MethodType | undefined;
          if (fileKey === "endpoint") {
            // Priority 1: Use the current streaming endpoint method (from user context)
            if (window.streamingEndpointMethod) {
              determinedMethod = window.streamingEndpointMethod as MethodType;
            }
            // Priority 2: Use method from fileData if available
            else if (fileData.method) {
              const streamMethod = fileData.method.toUpperCase();
              if (["GET", "POST", "PUT", "DELETE"].includes(streamMethod)) {
                determinedMethod = streamMethod as MethodType;
              }
            }
            // Priority 3: Try to extract method from file path
            else if (methodFromPath) {
              determinedMethod = methodFromPath as MethodType;
            }
            // Last resort: Default to GET
            else {
              determinedMethod = "GET";
              if (fileCode.trim() !== "") {
                // Only warn if we couldn't extract the method from any available sources
                // This warning will now only show when we truly have no method information
                console.warn(`Endpoint at ${filePath} received code via stream without a specified method, and no global streaming method was set. Method could not be extracted from the path. Defaulting to GET.`);
              }
            }
          }

          // Ensure unique ID for endpoints by including path and method
          const fileId = fileKey === "endpoint"
            ? fileData.endpoint_id || `${fileKey}-${filePath}-${determinedMethod}`
            : fileData.endpoint_id || fileData.entity_name || `${fileKey}-${filePath}-${Date.now()}`;

          newFiles.push({
            id: fileId,
            name: fileName,
            path: filePath,
            type: fileKey,
            code: fileCode,
            method: determinedMethod,
          })
        }
  
        if (files.endpoint) processFile("endpoint", files.endpoint)
        if (files.model) processFile("model", files.model)
        if (files.schema) processFile("schema", files.schema)
        if (files.migration) processFile("migration", files.migration)
        if (files.helpers) processFile("helpers", files.helpers)
        if (files.config) processFile("config", files.config)
  
        if (newFiles.length > 0) {
          // Check if we have endpoint files with identical paths but different methods
          const endpointsByPath = new Map<string, FileType[]>();
          
          // Group endpoints by path to identify duplicates
          newFiles.forEach(file => {
            if (file.type === "endpoint") {
              const normalizedPath = normalizePath(file.path);
              if (!endpointsByPath.has(normalizedPath)) {
                endpointsByPath.set(normalizedPath, []);
              }
              endpointsByPath.get(normalizedPath)?.push(file);
            }
          });
          
          // For endpoints with the same path, filter and keep the most appropriate one
          const filteredNewFiles = newFiles.filter(file => {
            // If not an endpoint, keep it
            if (file.type !== "endpoint") return true;
            
            const normalizedPath = normalizePath(file.path);
            const endpointsWithSamePath = endpointsByPath.get(normalizedPath) || [];
            
            // If only one endpoint exists for this path, keep it
            if (endpointsWithSamePath.length <= 1) return true;
            
            // Here's the key logic:
            // If multiple endpoints exist for the same path:
            
            // 1. If a user-specified method (streamingEndpointMethod) exists, prioritize that method
            if (window.streamingEndpointMethod && 
                file.method?.toUpperCase() === window.streamingEndpointMethod.toUpperCase()) {
              return true;
            }
            
            // 2. If no user preference exists, prioritize POST, PUT, DELETE over GET
            if (file.method?.toUpperCase() === "GET") {
              // If there's a POST/PUT/DELETE endpoint with same path, don't include this GET
              const hasNonGetEndpoint = endpointsWithSamePath.some(
                e => e.method && ["POST", "PUT", "DELETE"].includes(e.method.toUpperCase())
              );
              if (hasNonGetEndpoint) {
                return false;
              }
            }
            
            return true;
          });
          
          // Update files state with our filtered list
          setFiles((prev) => {
            const merged = [...prev];
            
            filteredNewFiles.forEach((newFile) => {
              // For endpoints, check both path and method to avoid duplicates
              const existingFileIndex = merged.findIndex(f => {
                if (f.type === "endpoint" && newFile.type === "endpoint") {
                  return f.path === newFile.path && f.method === newFile.method;
                }
                return f.id === newFile.id || (f.type === newFile.type && f.path === newFile.path);
              });
              
              if (existingFileIndex >= 0) {
                merged[existingFileIndex] = newFile;
              } else {
                merged.push(newFile);
              }
            });
            
            return merged;
          });
  
          // Select the most appropriate file to display
          const endpointFile = filteredNewFiles.find(f => 
            f.type === "endpoint" && 
            (!window.streamingEndpointMethod || 
             f.method?.toUpperCase() === window.streamingEndpointMethod.toUpperCase())
          );
          
          if (endpointFile) {
            setSelectedFile(endpointFile.id);
            setCurrentCode(endpointFile.code);
          } else if (filteredNewFiles.length > 0) {
            setSelectedFile(filteredNewFiles[0].id);
            setCurrentCode(filteredNewFiles[0].code);
          }
  
          setStreamingCode("");
        }
  
        const updatedGeneratedData: GeneratedDataType = {}
        if (files.endpoint) updatedGeneratedData.endpoint = files.endpoint
        if (files.model) updatedGeneratedData.model = files.model
        if (files.schema) updatedGeneratedData.schema = files.schema
        if (files.migration) updatedGeneratedData.migration = files.migration
        if (files.helpers) updatedGeneratedData.helpers = files.helpers
        if (files.config) updatedGeneratedData.config = files.config
  
        if (generatedData) {
          if (generatedData.project_id) updatedGeneratedData.project_id = generatedData.project_id
          if (generatedData.git_results) updatedGeneratedData.git_results = generatedData.git_results
        }
  
        setGeneratedData(updatedGeneratedData)
      }
  
      if (code && !files) {
        setStreamingCode(code)
        if (!selectedFile) {
          setCurrentCode(code)
        }
      }
  
      setIsGenerating(false)
    }
  
    // Renamed this handler to avoid conflict
    const handleGlobalFileEvent = (event: any) => {
      const { file } = event.detail
      if (file && file.type) {
        if (["endpoint", "model", "schema", "migration", "helpers", "config"].includes(file.type)) {
          setFiles((prev) => {
            const existingFileIndex = prev.findIndex((f) => f.id === file.id)
            if (existingFileIndex >= 0) {
              return prev.map((f, i) => (i === existingFileIndex ? file : f))
            } else {
              return [...prev, file]
            }
          })
  
          setGeneratedData((prev) => {
            const updated = { ...prev } as GeneratedDataType
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
  
    const handleCodeGenerationStart = () => {
      ("Code generation started")
      setIsGenerating(true)
    }
  
    window.addEventListener("code-update", handleCodeUpdate)
    window.addEventListener("code-generation-start", handleCodeGenerationStart)
    window.addEventListener("file-generated", handleGlobalFileEvent) // Use the renamed handler
  
    return () => {
      window.removeEventListener("code-update", handleCodeUpdate)
      window.removeEventListener("code-generation-start", handleCodeGenerationStart)
      window.removeEventListener("file-generated", handleGlobalFileEvent) // Use the renamed handler
      window.streamingEndpointMethod = undefined;
    }
  }, [selectedFile, generatedData])

  useEffect(() => {
    if (selectedFile) {
      const actualFileId = selectedFile.includes('-GET') || 
                           selectedFile.includes('-POST') || 
                           selectedFile.includes('-PUT') || 
                           selectedFile.includes('-DELETE') ? 
                           selectedFile.split('-').slice(0, -1).join('-') : selectedFile
      
      let file = files.find((f) => f.id === selectedFile)
      
      if (!file) {
        file = files.find((f) => f.id === actualFileId)
      }
      
      if (file) {
        setCurrentCode(file.code)
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

    if (generatedData) {
      const currentFile = files.find((f) => f.id === selectedFile)
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
        } else if (currentFile.type === "helpers" && updatedGeneratedData.helpers) 
        {
          updatedGeneratedData.helpers.generated_code = currentCode
        } else if (currentFile.type === "config" && updatedGeneratedData.config) {
          updatedGeneratedData.config.generated_code = currentCode
        }
        setGeneratedData(updatedGeneratedData)
      }
    }
  }

  const handleCopyCode = () => {
    if (!currentCode) return
    navigator.clipboard.writeText(currentCode)
  }

  const handleDeleteFile = () => {
    if (!selectedFile) return
    if (!window.confirm("Are you sure you want to delete this file?")) return

    const newFiles = files.filter((file) => file.id !== selectedFile)
    setFiles(newFiles)

    if (newFiles.length > 0) {
      setSelectedFile(newFiles[0].id)
      setCurrentCode(newFiles[0].code)
    } else {
      setSelectedFile(null)
      setCurrentCode("")
    }
  }

  const handleSelectGeneratedFile = (file: GeneratedFileType) => {
    const existingFile = files.find(
      (f) => (f.type === file.type && f.id === file.id) || (f.type === file.type && f.path === file.path),
    )

    if (existingFile) {
      setSelectedFile(existingFile.id)
    } else {
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

  const processNextFileInQueue = () => {  
    if (fileAnimationQueue.length === 0) {
      ("BEC: Animation queue is empty (checked by processNextFileInQueue). Ensuring animation is stopped.");
      if (isAnimatingFile) { // If it was somehow still true
        setIsAnimatingFile(false);
      }
      return;
    }
  
    const nextFile = fileAnimationQueue[0]; 
    
    (`BEC: Processing ${nextFile.name} from queue. Has code: ${!!nextFile.code && nextFile.code.trim() !== ""}`);
    
    if (!nextFile.code || nextFile.code.trim() === "") {
        setSelectedFile(nextFile.id);
        setCurrentCode(nextFile.code || ""); 
        

        setFileAnimationQueue(prevQueue => prevQueue.slice(1)); 
        return; 
    }
  
    setSelectedFile(nextFile.id);
    setCodeToAnimate(nextFile.code);
    setIsAnimatingFile(true); 

    setFileAnimationQueue(prevQueue => prevQueue.slice(1));
  };
  
  useEffect(() => {
    (`BEC: useEffect for queue processing. isAnimatingFile: ${isAnimatingFile}, queue length: ${fileAnimationQueue.length}`);
    if (!isAnimatingFile && fileAnimationQueue.length > 0) {
      ("BEC: useEffect triggering processNextFileInQueue.");
      processNextFileInQueue();
    } else if (!isAnimatingFile && fileAnimationQueue.length === 0) {
      ("BEC: useEffect notes queue is empty and not animating. All animations done or queue was empty.");
    } else if (isAnimatingFile) {
      ("BEC: useEffect notes animation is currently in progress for a file.");
    }
  }, [fileAnimationQueue, isAnimatingFile]); // Dependencies: queue and animation status

  // This is the handleFileGenerated function passed to AIChat and responsible for the animation queue.
  const handleFileGenerated = (file: FileType) => { 
    // @ts-ignore
    (`BEC: handleFileGenerated (AIChat prop) received raw file - Name: ${file.name}, Path: ${file.path || file.file_path}, Code present: ${!!file.code}`);

    let fileName = file.name || (file.file_path ? (file.file_path.split('/').pop() || 'unknown_name_from_path') : 'unknown_name');
    // @ts-ignore
    let filePath = file.path || file.file_path || '/unknown';
    
    const fileId = file.id || `${file.type}-${filePath}-${file.method || Date.now()}`;

    // Attempt to extract method from the file path if it's an endpoint
    let methodFromPath = undefined;
    if (file.type === "endpoint" && filePath) {
      const postMatch = filePath.match(/\.post\./i) || filePath.match(/post_/i) || filePath.match(/_post/i);
      const getMatch = filePath.match(/\.get\./i) || filePath.match(/get_/i) || filePath.match(/_get/i);
      const putMatch = filePath.match(/\.put\./i) || filePath.match(/put_/i) || filePath.match(/_put/i);
      const deleteMatch = filePath.match(/\.delete\./i) || filePath.match(/delete_/i) || filePath.match(/_delete/i);
      
      if (postMatch) methodFromPath = "POST";
      else if (getMatch) methodFromPath = "GET";
      else if (putMatch) methodFromPath = "PUT";
      else if (deleteMatch) methodFromPath = "DELETE";
    }

    // More accurate method determination with detailed logging
    const determinedMethod = 
      // Priority 1: Use the current streaming endpoint method (from user context)
      (file.type === "endpoint" && window.streamingEndpointMethod) ? 
        window.streamingEndpointMethod as MethodType :
      // Priority 2: Use method from file if available
      file.method ? 
        file.method as MethodType :
      // Priority 3: Try to extract method from file path
      (file.type === "endpoint" && methodFromPath) ? 
        methodFromPath as MethodType :
      // Last resort: Default to GET only for endpoints that require a method
      file.type === "endpoint" ? 
        "GET" as MethodType : 
        undefined;
    
    // Log the method determination for debugging
    if (file.type === "endpoint") {
      console.log(`Method determination for ${filePath}:
        - window.streamingEndpointMethod: ${window.streamingEndpointMethod || 'undefined'}
        - file.method: ${file.method || 'undefined'}
        - methodFromPath: ${methodFromPath || 'undefined'}
        - Final determined method: ${determinedMethod || 'undefined'}`
      );
    }

    const fileWithCorrectProperties: FileType = {
      ...file,
      id: fileId,
      name: fileName,
      path: filePath,
      code: file.code || "",
      method: determinedMethod,
    };
    // @ts-ignore
    (`BEC: Processed file for queue - ID: ${fileWithCorrectProperties.id}, Name: ${fileWithCorrectProperties.name}, Code length: ${fileWithCorrectProperties.code?.length}`);

    setFiles((prevFiles) => {
      const getFileKey = (f: FileType) => {
        // For endpoints: if we're currently streaming a specific method for this path,
        // ALWAYS use that method for key generation to prevent duplicates
        if (f.type === "endpoint") {
          // If this path matches what we're currently streaming and we know the intended method,
          // use the streaming method in the key instead of whatever method is in the file
          if (window.streamingEndpointMethod && endpointDetails?.endpointPath &&
              normalizePath(f.path) === normalizePath(endpointDetails.endpointPath)) {
            return `${f.type}:${f.path}:${window.streamingEndpointMethod}`;
          }
          // Otherwise use the file's own method if available
          else if (f.method) {
            return `${f.type}:${f.path}:${f.method}`;
          }
        }
        
        // Existing path-based logic
        if (f.path && (f.path.startsWith(`${f.type}/`) || f.path.startsWith(`/${f.type}/`))) {
          return f.path;
        }
        
        return `${f.type}:${f.path || f.name}`;
      };
      
      const newFileKey = getFileKey(fileWithCorrectProperties);
      // rest of your existing code
      const existingIndex = prevFiles.findIndex(pf => getFileKey(pf) === newFileKey);
      // ...
      if (existingIndex >= 0) {
        (`BEC: Updating existing file in setFiles. Key: ${newFileKey}`);
        const existingId = prevFiles[existingIndex].id;
        // Preserve the original ID if updating, but take all other new properties
        return prevFiles.map((pf, idx) =>
          idx === existingIndex ? { ...fileWithCorrectProperties, id: existingId } : pf
        );
      } else {
        (`BEC: Adding new file in setFiles. Key: ${newFileKey}`);
        return [...prevFiles, fileWithCorrectProperties];
      }
    });

    setFileAnimationQueue(prevQueue => {
      if (prevQueue.some(f => f.id === fileWithCorrectProperties.id)) {
          return prevQueue;
      }
      const newQueue = [...prevQueue, fileWithCorrectProperties];
      (`BEC: Added ${fileWithCorrectProperties.name} to animation queue. New queue size: ${newQueue.length}`);
      return newQueue;
    });
  };

  const handleAnimationComplete = () => {
    (`BEC: MonacoEditor animation complete. Code length (from codeToAnimate): ${codeToAnimate.length}.`);
    setCurrentCode(codeToAnimate); 
    setIsAnimatingFile(false); 
  };

  const handleEndpointDetailsSubmit = (details: EndpointDetails) => {
    setIsEndpointCreating(true)
    setIsEndpointModalOpen(true)
    setEndpointDetails(details)
    
    // Save the method of the endpoint being created to use later for filtering
    const createdMethod = details.method;
    const createdPath = details.endpointPath;
  
    const endpointService = new EndPointService()
    endpointService
      .newEndpointCreation(
        urlFriendlyName,
        details.endpointPath,
        details.method,
        details.description,
      )
      .then(() => {
        // Add a slight delay to ensure the backend has updated
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            // Modified to target only the specific endpoint that was created
            fetchEndpoints(true, details.endpointPath, details.method)
              .then((fetchedEndpoints) => {
                // Filter out automatically created empty GET endpoints if we just created a different method
                if (createdMethod !== "GET") {
                  setFiles(prevFiles => {
                    return prevFiles.filter(file => {
                      // Keep the file if:
                      // 1. It's not an endpoint, OR
                      // 2. It doesn't match the path we just created an endpoint for, OR
                      // 3. It matches the method we explicitly created
                      // This filters out the auto-generated empty GET endpoint
                      if (file.type !== "endpoint") return true;
                      if (normalizePath(file.path) !== normalizePath(createdPath)) return true;
                      if (file.method?.toUpperCase() === createdMethod.toUpperCase()) return true;
                      
                      // Extra check: keep non-GET methods or GET methods with actual code
                      if (file.method?.toUpperCase() !== "GET") return true;
                      if (file.method?.toUpperCase() === "GET" && file.code && file.code.trim() !== "") return true;
                      
                      // Otherwise, filter out this file (empty GET with matching path)
                      return false;
                    });
                  });
                }
                resolve();
              });
          }, 1000) // 1-second delay
        })
      })
      .then(() => {
        setTimeout(() => {
          setIsEndpointCreating(false)
          setIsEndpointModalOpen(false)
          setEndpointDetails(null)

          const aiChatInput = document.querySelector(".ai-chat-input") as HTMLTextAreaElement
          if (aiChatInput) {
            aiChatInput.focus()
            aiChatInput.placeholder = `Describe what this ${details.method} endpoint at ${details.endpointPath} should do...`
          }
          
          if (window.innerWidth <= 768) {
            setTimeout(() => setActiveMobilePanel("chat"), 500)
          }
        }, 1000)
      })
      .catch((error) => {
        setIsEndpointCreating(false)
        setIsEndpointModalOpen(false)
        setEndpointDetails(null)
      })
  }

  const handleGenerateAdditionalCode = async () => {
    setIsGenerating(true)
    const aiChatInput = document.querySelector(".ai-chat-input") as HTMLTextAreaElement
    if (aiChatInput) {
      aiChatInput.focus()
    }
    return Promise.resolve()
  }

  const findSelectedFileById = (fileId: string, filesList: FileType[]): FileType | null => {
    let file = filesList.find((f) => f.id === fileId)
    
    if (!file && fileId) {
      const methodMatch = fileId.match(/-(GET|POST|PUT|DELETE)$/i)
      if (methodMatch) {
        const baseId = fileId.split('-').slice(0, -1).join('-')
        file = filesList.find((f) => f.id === baseId)
        if (file && methodMatch[1]) {
          file = {
            ...file,
            method: methodMatch[1] as "GET" | "POST" | "PUT" | "DELETE"
          }
        }
      }
    }
    
    return file || null
  }

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
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
          }
        }}
        onRunMigrations={handleRunMigrations}
        hasPendingMigrations={hasPendingMigrations}
      />

      <main className="flex-1 flex flex-col min-h-0">
        <div className="container py-2 flex-1 flex flex-col min-h-0">
          <div className="mobile-nav mb-2 flex md:hidden">
            <Button 
              variant={activeMobilePanel === "files" ? "default" : "outline"}
              onClick={() => setActiveMobilePanel("files")}
              className={`mobile-nav-item flex-1 rounded-r-none border-r-0 ${
                activeMobilePanel === "files" 
                  ? "bg-[#7dff00] hover:bg-[#7dff00]/90 text-black font-medium" 
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              Files
            </Button>
            <Button 
              variant={activeMobilePanel === "editor" ? "default" : "outline"}
              onClick={() => setActiveMobilePanel("editor")}
              className={`mobile-nav-item flex-1 rounded-none border-x-0 ${
                activeMobilePanel === "editor" 
                  ? "bg-[#7dff00] hover:bg-[#7dff00]/90 text-black font-medium" 
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              Editor
            </Button>
            <Button 
              variant={activeMobilePanel === "chat" ? "default" : "outline"}
              onClick={() => setActiveMobilePanel("chat")}
              className={`mobile-nav-item flex-1 rounded-l-none border-l-0 ${
                activeMobilePanel === "chat" 
                  ? "bg-[#7dff00] hover:bg-[#7dff00]/90 text-black font-medium" 
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              AI Chat
            </Button>
          </div>

          {isAnyLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-[230px_1fr_270px] gap-6 flex-1 min-h-0">
              <div className="space-y-4 animate-[pulse_2s_ease-in-out_infinite]">
                <div className="h-10 bg-zinc-700/60 rounded-md backdrop-blur-sm" />
                <div className="h-6 bg-zinc-700/50 rounded-md backdrop-blur-sm" />
                <div className="h-6 bg-zinc-700/50 rounded-md backdrop-blur-sm" />
                <div className="h-6 bg-zinc-700/50 rounded-md backdrop-blur-sm" />
                <div className="h-6 bg-zinc-700/50 rounded-md backdrop-blur-sm" />
              </div>
              <div className="flex flex-col space-y-4 animate-[pulse_2s_ease-in-out_infinite]">
                <div className="h-10 bg-zinc-700/60 rounded-md backdrop-blur-sm" />
                <div className="flex-1 bg-zinc-800/50 rounded-md backdrop-blur-sm" />
              </div>
              <div className="flex flex-col space-y-4 animate-[pulse_2s_ease-in-out_infinite]">
                <div className="h-10 bg-zinc-700/60 rounded-md backdrop-blur-sm" />
                <div className="flex-1 bg-zinc-800/50 rounded-md backdrop-blur-sm" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-[230px_1fr_270px] gap-4 flex-1 min-h-0 overflow-hidden">
              <div className={`editor-panel h-full overflow-hidden flex flex-col ${activeMobilePanel === "files" ? "active" : ""}`}>
                <ProjectFiles
                  files={files}
                  selectedFile={selectedFile}
                  setSelectedFile={(id) => {
                    setSelectedFile(id)
                    if (window.innerWidth <= 1024) {
                      setActiveMobilePanel("editor")
                    }
                  }}
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
              </div>
              <div className={`editor-panel h-full overflow-auto flex flex-col ${activeMobilePanel === "editor" ? "active" : ""}`}>
                <FileContent
                  selectedFile={selectedFile}
                  currentCode={currentCode}
                  files={files}
                  onCodeChange={setCurrentCode}
                  theme={theme}
                  streamingCode={codeToAnimate}
                  streaming={isAnimatingFile}
                  onStreamComplete={handleAnimationComplete}
                  projectId={urlFriendlyName}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              </div>
              <div className={`editor-panel h-full overflow-auto flex flex-col ${activeMobilePanel === "chat" ? "active" : ""}`}>
                <AIChat
                  projectId={urlFriendlyName || projectName}
                  onFileGenerated={handleFileGenerated}
                  endpointDetails={endpointDetails}
                  projectLanguage={projectLanguage}
                  projectFramework={projectFramework}
                  selectedFile={selectedFile ? findSelectedFileById(selectedFile, files) : null}
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

      <div className="flex-shrink-0 py-1">
        <MigrationButton
          onRunMigrations={handleRunMigrations}
          hasPendingMigrations={hasPendingMigrations}
          isLoading={isRunningMigrations}
        />
      </div>

      <MigrationLog
        logs={migrationLogs}
        isOpen={showMigrationLogs}
        onClose={() => setShowMigrationLogs(false)}
        status={migrationStatus}
        title="Migration Logs"
      />
      
      <style jsx global>{`
        .editor-panel {
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: auto;
          height: calc(100vh - 56px); 
        }
        
        @media (max-width: 768px) {
          .editor-panel {
            display: none;
            height: calc(100vh - 200px);
            overflow: auto;
          }
          
          .editor-panel.active {
            display: flex;
            flex: 1;
            overflow: auto;
          }
        }
      `}</style>
      <style jsx global>{`
        .editor-panel .project-files-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 0;
        }
      `}</style>
      <style jsx global>{`
        /* Mobile specific height adjustments */
        @media (max-width: 768px) {
          .project-files-container {
            height: calc(100vh - 200px) !important;
          }
        }
      `}</style>
    </div>
  )
}