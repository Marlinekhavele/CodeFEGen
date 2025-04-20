"use client"

import { useState, useEffect } from "react"
import AIChat from "@/components/ai-chat"
import { toast } from "@/components/ui/use-toast"
import CodeGenService from "@/app/api/services/code-gen-service"
import { GeneratedFileType, FileType, GeneratedDataType, EndpointListContent, MethodType, EndpointDetails } from "@/types"
import { ProjectHeader } from "@/components/project-header"
import { ProjectFiles } from "@/components/project-files"
import { FileContent } from "@/components/file-content"
import { useTheme } from "@/components/theme-provider"
import EndPointService from "@/app/api/services/endpoint-service"
import axios from "axios"

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
  
  // Add a state to track streaming code
  const [streamingCode, setStreamingCode] = useState("")

  const [endpointDetails, setEndpointDetails] = useState<EndpointDetails | null>(null)

  useEffect(() => {
    const fetchEndpoints = async () => {
      const endpointService = new EndPointService()
      try {
        console.log("Fetching endpoints for project:", urlFriendlyName)
        const result = await endpointService.getEndpointList(urlFriendlyName)
        console.log("Endpoint list response:", result)

        if (result && result.length > 0) {

          const endpointFiles = await Promise.all(
            result.map(async (ep: EndpointListContent) => {
              try {
                const resp = await axios.get(
                  `https://codebegen.canadacentral.cloudapp.azure.com/api/v1/generate/stream`,
                  {
                    params: {
                      project_id: urlFriendlyName,
                      endpoint_path: ep.path,
                      method: ep.method,
                    },
                  }
                )
                const fileResult = resp.data?.data
                const code = fileResult?.content_base64
                  ? atob(fileResult.content_base64)
                  : ""
                  
                // Extract filename without HTTP method prefix
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
                
                // Extract filename without HTTP method prefix
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

          console.log("Processed endpoint files:", endpointFiles)
          setFiles(endpointFiles)
          if (endpointFiles.length > 0) {
            setSelectedFile(endpointFiles[0].id)
            setCurrentCode(endpointFiles[0].code)
          }
        } else {
          console.log("No endpoints found for project")
          toast({
            title: "No endpoints found",
            description: "This project doesn't have any endpoints yet. Try creating one!",
            variant: "default"
          })
        }
      } catch (error) {
        console.error("Error fetching endpoints:", error)
        toast({
          title: "Error fetching endpoints",
          description: error instanceof Error ? error.message : "Failed to fetch endpoints",
          variant: "destructive"
        })
      }
    }
    if (urlFriendlyName) {
      fetchEndpoints()
    }
  }, [urlFriendlyName])

  // Listen for code updates from AIChat component
  useEffect(() => {
    const handleCodeUpdate = (event: any) => {
      console.log("BackendEditorClient received code-update event:", event.detail);
      
      const { files, code } = event.detail;
      
      // If we receive files objects from the AI Chat component
      if (files) {
        console.log("Received files from AI Chat:", files);
        
        // Process each file type (endpoint, model, schema, migration, helpers, config)
        const newFiles: FileType[] = [];
        
        // Helper function to process each file
        const processFile = (fileKey: "endpoint" | "model" | "schema" | "migration" | "helpers" | "config", fileData: any) => {
          if (!fileData || !fileData.generated_code) return;
          
          // Get file details in a consistent way
          const fileName = fileData.file_path?.split('/').pop() || fileKey;
          const filePath = fileData.endpoint_path || fileData.file_path || `/${fileKey}`;
          const fileCode = fileData.generated_code || "";
          const fileMethod = (fileData.method as "GET" | "POST" | "PUT" | "DELETE") || "GET";
          
          // Add file to array
          newFiles.push({
            id: fileData.endpoint_id || fileData.entity_name || `${fileKey}-${Date.now()}`,
            name: fileName,
            path: filePath,
            type: fileKey,
            code: fileCode,
            method: fileMethod,
          });
        };
        
        // Process each possible file type
        if (files.endpoint) processFile("endpoint", files.endpoint);
        if (files.model) processFile("model", files.model);
        if (files.schema) processFile("schema", files.schema);
        if (files.migration) processFile("migration", files.migration);
        if (files.helpers) processFile("helpers", files.helpers);
        if (files.config) processFile("config", files.config);
        
        // Update files state with new files
        if (newFiles.length > 0) {
          setFiles(prev => {
            // Create a merged array
            let merged = [...prev];
            
            // Process each new file
            newFiles.forEach(newFile => {
              // Check if file already exists
              const existingFileIndex = merged.findIndex(f => 
                f.id === newFile.id || 
                (f.type === newFile.type && f.path === newFile.path)
              );
              
              if (existingFileIndex >= 0) {
                // Update existing file
                merged[existingFileIndex] = newFile;
              } else {
                // Add new file
                merged.push(newFile);
              }
            });
            
            return merged;
          });
          
          // Select the first endpoint file if available, otherwise any new file
          const endpointFile = newFiles.find(f => f.type === "endpoint");
          if (endpointFile) {
            setSelectedFile(endpointFile.id);
            setCurrentCode(endpointFile.code);
          } else if (newFiles.length > 0) {
            setSelectedFile(newFiles[0].id);
            setCurrentCode(newFiles[0].code);
          }
          
          // Clear streaming code
          setStreamingCode("");
          
          toast({
            title: "Code generated",
            description: `${newFiles.length} new file(s) have been added to your project.`,
          });
        }
        
        // Update generatedData state
        const updatedGeneratedData: GeneratedDataType = {};
        
        if (files.endpoint) updatedGeneratedData.endpoint = files.endpoint;
        if (files.model) updatedGeneratedData.model = files.model;
        if (files.schema) updatedGeneratedData.schema = files.schema;
        if (files.migration) updatedGeneratedData.migration = files.migration;
        if (files.helpers) updatedGeneratedData.helpers = files.helpers;
        if (files.config) updatedGeneratedData.config = files.config;
        
        // Add any other properties from the original generatedData
        if (generatedData) {
          if (generatedData.project_id) updatedGeneratedData.project_id = generatedData.project_id;
          if (generatedData.git_results) updatedGeneratedData.git_results = generatedData.git_results;
        }
        
        setGeneratedData(updatedGeneratedData);
      }
      
      // If we receive just code (not structured files)
      if (code && !files) {
        setStreamingCode(code);
        
        // If there's no selected file, show the streaming code
        if (!selectedFile) {
          setCurrentCode(code);
        }
      }

      // End the generation state
      setIsGenerating(false);
    };
    
    // Handle direct file generation
    const handleFileGenerated = (event: any) => {
      const { file } = event.detail;
      
      if (file && file.type) {
        console.log("File generated event received:", file);
        
        // Make sure the file type is valid
        if (["endpoint", "model", "schema", "migration", "helpers", "config"].includes(file.type)) {
          setFiles(prev => {
            // Check if file already exists
            const existingFileIndex = prev.findIndex(f => 
              f.id === file.id || (f.type === file.type && f.path === file.path)
            );
            
            if (existingFileIndex >= 0) {
              // Update existing file
              return prev.map((f, i) => i === existingFileIndex ? file : f);
            } else {
              // Add new file
              return [...prev, file];
            }
          });
          
          // Update generatedData state for specific file types
          setGeneratedData(prev => {
            // Create a new object to avoid direct mutation
            const updated = { ...prev } as GeneratedDataType;
            
            // Handle each type correctly
            if (file.type === "endpoint") {
              updated.endpoint = {
                file_path: file.path,
                generated_code: file.code,
                endpoint_path: file.path,
                method: file.method,
                content_base64: "",
                file_hash: "",
                ...(prev?.endpoint || {})
              };
            } else if (file.type === "model") {
              updated.model = {
                file_path: file.path,
                generated_code: file.code,
                content_base64: "",
                file_hash: "",
                entity_name: "",
                ...(prev?.model || {})
              };
            } else if (file.type === "schema") {
              updated.schema = {
                file_path: file.path,
                generated_code: file.code,
                content_base64: "",
                file_hash: "",
                entity_name: "",
                ...(prev?.schema || {})
              };
            } else if (file.type === "migration") {
              updated.migration = {
                file_path: file.path,
                generated_code: file.code,
                content_base64: "",
                file_hash: "",
                entity_name: "",
                ...(prev?.migration || {})
              };
            } else if (file.type === "helpers") {
              updated.helpers = {
                file_path: file.path,
                generated_code: file.code,
                content_base64: "",
                file_hash: "",
                ...(prev?.helpers || {})
              };
            } else if (file.type === "config") {
              updated.config = {
                file_path: file.path,
                generated_code: file.code,
                content_base64: "",
                file_hash: "",
                ...(prev?.config || {})
              };
            }
            
            return updated;
          });
        }
      }
    };
    
    // Handle streaming code chunks
    const handleCodeChunk = (event: any) => {
      console.log("BackendEditorClient received code-chunk event:", event.detail);
      
      const { code } = event.detail;
      
      if (code) {
        setStreamingCode(prev => prev + code);
        
        // If no file is selected, update the current code to show the streaming
        if (!selectedFile) {
          setCurrentCode(prev => prev + code);
        }
      }
    };
    
    // Handle when code generation starts
    const handleCodeGenerationStart = () => {
      console.log("Code generation started");
      setIsGenerating(true);
    };
    
    // Add event listeners
    window.addEventListener("code-update", handleCodeUpdate);
    window.addEventListener("code-chunk", handleCodeChunk);
    window.addEventListener("code-generation-start", handleCodeGenerationStart);
    window.addEventListener("file-generated", handleFileGenerated);
    
    // Clean up
    return () => {
      window.removeEventListener("code-update", handleCodeUpdate);
      window.removeEventListener("code-chunk", handleCodeChunk);
      window.removeEventListener("code-generation-start", handleCodeGenerationStart);
      window.removeEventListener("file-generated", handleFileGenerated);
    };
  }, [selectedFile, generatedData]);

  // Ensure currentCode updates when selectedFile changes
  useEffect(() => {
    if (selectedFile) {
      const file = files.find(f => f.id === selectedFile)
      if (file) setCurrentCode(file.code)
    }
  }, [selectedFile, files])

  const handleSaveFile = () => {
    if (!selectedFile) return

    setFiles(files.map((file) => (file.id === selectedFile ? { ...file, code: currentCode } : file)))

    // If this file is part of the generated data, update that too
    if (generatedData) {
      const currentFile = files.find(f => f.id === selectedFile)
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

  // Function to handle file generation directly from AIChat
  const handleFileGenerated = (file: FileType) => {
    console.log("File generated from AIChat:", file);
    
    setFiles(prev => {
      // Check if file already exists
      const existingFile = prev.find(f => f.id === file.id);
      
      if (existingFile) {
        // Update existing file
        return prev.map(f => f.id === file.id ? { ...f, code: file.code } : f);
      } else {
        // Add new file
        return [...prev, file];
      }
    });
    
    // Select the newly generated file
    setSelectedFile(file.id);
    setCurrentCode(file.code);
    setIsGenerating(false);
  };

  // Handler for endpoint details submission from modal
  const handleEndpointDetailsSubmit = (details: EndpointDetails) => {
    // Set the generation state
    setIsGenerating(true);
    
    // Set endpoint details to trigger the AIChat useEffect
    setEndpointDetails(details);
    
    // Show a toast message
    toast({
      title: "Generating endpoint",
      description: `Creating a ${details.method} endpoint at ${details.endpointPath}`,
    });
  };

  // Function to generate additional code using WebSocket
  const handleGenerateAdditionalCode = async () => {
    // Set state to indicate code generation is starting
    setIsGenerating(true);
    
    // Notify the user
    toast({
      title: "Generating code",
      description: "Please use the AI chat to create a new endpoint.",
    });
    
    // Focus the AI chat input if possible
    const aiChatInput = document.querySelector('.ai-chat-input') as HTMLTextAreaElement;
    if (aiChatInput) {
      aiChatInput.focus();
    }

    // Return a resolved promise to match the expected return type
    return Promise.resolve();
  };

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
        onDownloadFile={() => {
          if (!selectedFile) return;
          const file = files.find(f => f.id === selectedFile);
          if (file) {
            const blob = new Blob([file.code], { type: "text/plain" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = file.name || "file.txt";
            link.click();
            toast({
              title: "File downloaded",
              description: `The file "${file.name}" has been downloaded.`,
            });
          }
        }}
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
              onEndpointDetailsSubmit={handleEndpointDetailsSubmit}
              isGenerating={isGenerating}
              onCreateEndpoint={async ({ endpointPath, httpMethod, description }) => {
                toast({
                  title: "Create Endpoint",
                  description: `Endpoint created with path: ${endpointPath}, method: ${httpMethod}, and description: ${description}.`,
                });
                return Promise.resolve();
              }}
            />

            {/* File Content */}
            <FileContent 
              selectedFile={selectedFile}
              currentCode={currentCode}
              files={files}
              onCodeChange={setCurrentCode}
              theme={theme}
              streamingCode={streamingCode}
            />

            {/* AI Chat Panel */}
            <div className="h-full">
              <AIChat 
                projectId={urlFriendlyName || projectName} 
                onFileGenerated={handleFileGenerated}
                endpointDetails={endpointDetails}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}