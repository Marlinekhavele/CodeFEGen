"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Code, FileCode } from "lucide-react"
import { cn } from "@/lib/utils"

type MethodType = "GET" | "POST" | "PUT" | "DELETE";

interface MethodBadgeProps {
  method?: MethodType | string;
}

const MethodBadge = ({ method }: MethodBadgeProps) => {
  const getMethodColor = (method?: string) => {
    switch (method?.toLowerCase()) {
      case 'get': return "bg-green-500/20 text-green-400"
      case 'post': return "bg-blue-500/20 text-blue-400"
      case 'put': return "bg-yellow-500/20 text-yellow-400"
      case 'delete': return "bg-red-500/20 text-red-400"
      default: return "bg-zinc-500/20 text-zinc-400"
    }
  }

  return (
    <div className={`text-xs px-1.5 py-0.5 rounded font-medium ${getMethodColor(method)}`}>
      {method?.toUpperCase()}
    </div>
  )
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

interface GeneratedFileType {
  id: string;
  type: "endpoint" | "model" | "schema" | "migration";
  name: string;
  path: string;
  code: string;
  method?: string;
}

interface GeneratedCodeDisplayProps {
  generatedData: GeneratedDataType;
  onSelectFile: (file: GeneratedFileType) => void;
  selectedFileId?: string;
}

export function GeneratedCodeDisplay({ 
  generatedData, 
  onSelectFile,
  selectedFileId
}: GeneratedCodeDisplayProps) {
  const [expandedSections, setExpandedSections] = useState({
    endpoints: true,
    models: false,
    schemas: false,
    migrations: false
  })

  const toggleSection = (section: string) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section as keyof typeof expandedSections]
    })
  }

  const renderEndpoint = () => {
    if (!generatedData?.endpoint || !generatedData.endpoint.generated_code) {
      return <div className="ml-6 text-xs text-zinc-400">No endpoint generated</div>
    }
    const endpoint = {
      id: generatedData.endpoint.endpoint_id || "endpoint-1",
      path: generatedData.endpoint.file_path || generatedData.endpoint.endpoint_path || "/endpoint",
      method: generatedData.endpoint.method || "GET",
      file_path: generatedData.endpoint.file_path || "",
      code: generatedData.endpoint.generated_code || (generatedData.endpoint.content_base64 ? atob(generatedData.endpoint.content_base64) : "")
    }
    return (
      <div className="space-y-1 ml-6">
        <div
          key={endpoint.id}
          onClick={() => onSelectFile({
            id: endpoint.id,
            type: "endpoint",
            name: endpoint.path.split('/').pop() || 'endpoint',
            path: endpoint.path,
            method: endpoint.method,
            code: endpoint.code
          })}
          className={cn(
            "flex items-center justify-between rounded-md px-2 py-1.5 text-sm",
            selectedFileId === endpoint.id
              ? "bg-[#7dff00]/20 text-[#7dff00]"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          )}
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded">{endpoint.method}</span>
            <span>{endpoint.path || endpoint.file_path}</span>
          </div>
        </div>
        <div className="bg-zinc-900 text-zinc-100 rounded p-2 mt-2 overflow-x-auto text-xs">
          <pre>{endpoint.code}</pre>
        </div>
      </div>
    )
  }

  const renderModel = () => {
    if (!generatedData?.model || !generatedData.model.generated_code) {
      return <div className="ml-6 text-xs text-zinc-400">No model generated</div>
    }

    const model = {
      id: `model-${generatedData.model.entity_name || "1"}`,
      name: generatedData.model.entity_name || "Model",
      file_path: generatedData.model.file_path || "",
      code: generatedData.model.generated_code
    }

    return (
      <div className="space-y-1 ml-6">
        <div
          key={model.id}
          onClick={() => onSelectFile({
            id: model.id,
            type: "model",
            name: model.name,
            path: model.file_path || `models/${model.name}`,
            code: model.code
          })}
          className={cn(
            "flex items-center justify-between rounded-md px-2 py-1.5 text-sm",
            selectedFileId === model.id
              ? "bg-[#7dff00]/20 text-[#7dff00]"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          )}
        >
          <div className="flex items-center gap-2">
            <FileCode className="h-4 w-4 text-green-400" />
            <span>{model.name}</span>
          </div>
        </div>
      </div>
    )
  }

  const renderSchema = () => {
    if (!generatedData?.schema || !generatedData.schema.generated_code) {
      return <div className="ml-6 text-xs text-zinc-400">No schema generated</div>
    }

    const schema = {
      id: `schema-${generatedData.schema.entity_name || "1"}`,
      name: generatedData.schema.entity_name || "Schema",
      file_path: generatedData.schema.file_path || "",
      code: generatedData.schema.generated_code
    }

    return (
      <div className="space-y-1 ml-6">
        <div
          key={schema.id}
          onClick={() => onSelectFile({
            id: schema.id,
            type: "schema",
            name: schema.name,
            path: schema.file_path || `schemas/${schema.name}`,
            code: schema.code
          })}
          className={cn(
            "flex items-center justify-between rounded-md px-2 py-1.5 text-sm",
            selectedFileId === schema.id
              ? "bg-[#7dff00]/20 text-[#7dff00]"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          )}
        >
          <div className="flex items-center gap-2">
            <FileCode className="h-4 w-4 text-yellow-400" />
            <span>{schema.name}</span>
          </div>
        </div>
      </div>
    )
  }

  const renderMigration = () => {
    if (!generatedData?.migration || !generatedData.migration.generated_code) {
      return <div className="ml-6 text-xs text-zinc-400">No migration generated</div>
    }

    const migration = {
      id: `migration-${generatedData.migration.entity_name || "1"}`,
      name: generatedData.migration.entity_name || "Migration",
      file_path: generatedData.migration.file_path || "",
      code: generatedData.migration.generated_code
    }

    return (
      <div className="space-y-1 ml-6">
        <div
          key={migration.id}
          onClick={() => onSelectFile({
            id: migration.id,
            type: "migration",
            name: migration.name,
            path: migration.file_path || `migrations/${migration.name}`,
            code: migration.code
          })}
          className={cn(
            "flex items-center justify-between rounded-md px-2 py-1.5 text-sm",
            selectedFileId === migration.id
              ? "bg-[#7dff00]/20 text-[#7dff00]"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          )}
        >
          <div className="flex items-center gap-2">
            <FileCode className="h-4 w-4 text-purple-400" />
            <span>{migration.name}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-2 overflow-auto">
      {/* Endpoints Section */}
      <div className="p-2 rounded-md mb-2">
        <div 
          className="flex items-center gap-2 text-[#7dff00] font-medium text-sm mb-2 cursor-pointer"
          onClick={() => toggleSection("endpoints")}
        >
          {expandedSections.endpoints ? (
            <ChevronDown className="h-4 w-4 text-[#7dff00]" />
          ) : (
            <ChevronRight className="h-4 w-4 text-[#7dff00]" />
          )}
          <span>Endpoints</span>
        </div>
        
        {expandedSections.endpoints && renderEndpoint()}
      </div>

      {/* Models Section */}
      <div className="p-2 rounded-md mb-2">
        <div 
          className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-medium text-sm cursor-pointer"
          onClick={() => toggleSection("models")}
        >
          {expandedSections.models ? (
            <ChevronDown className="h-4 w-4 text-[#7dff00]" />
          ) : (
            <ChevronRight className="h-4 w-4 text-[#7dff00]" />
          )}
          <span>Models</span>
        </div>
        
        {expandedSections.models && (generatedData?.model && generatedData.model.generated_code ? renderModel() : <div className="ml-6 text-xs text-zinc-400">No model generated</div>)}
      </div>

      {/* Schemas Section */}
      <div className="p-2 rounded-md mb-2">
        <div 
          className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-medium text-sm cursor-pointer"
          onClick={() => toggleSection("schemas")}
        >
          {expandedSections.schemas ? (
            <ChevronDown className="h-4 w-4 text-[#7dff00]" />
          ) : (
            <ChevronRight className="h-4 w-4 text-[#7dff00]" />
          )}
          <span>Schemas</span>
        </div>
        
        {expandedSections.schemas && (generatedData?.schema && generatedData.schema.generated_code ? renderSchema() : <div className="ml-6 text-xs text-zinc-400">No schema generated</div>)}
      </div>

      {/* Migrations Section */}
      <div className="p-2 rounded-md mb-2">
        <div 
          className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-medium text-sm cursor-pointer"
          onClick={() => toggleSection("migrations")}
        >
          {expandedSections.migrations ? (
            <ChevronDown className="h-4 w-4 text-[#7dff00]" />
          ) : (
            <ChevronRight className="h-4 w-4 text-[#7dff00]" />
          )}
          <span>Migrations</span>
        </div>
        
        {expandedSections.migrations && (generatedData?.migration && generatedData.migration.generated_code ? renderMigration() : <div className="ml-6 text-xs text-zinc-400">No migration generated</div>)}
      </div>
    </div>
  )
}