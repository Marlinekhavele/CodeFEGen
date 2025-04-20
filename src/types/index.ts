import { Config } from "tailwindcss"

export interface EditorFileData {
    project_id: string
    endpoint_path: string
    content_base64: string
    method: string
    description: string
  }
  
  export interface EditorGetFileData {
    status_code: number
    success: boolean
    message: string
    data: {
      project_id: string
      endpoint_path: string
      file_path: string
      content_base64: string
      commit_hash: string
      file_hash: string
      message: string
      method: string
      description: string
    }
  }

  export interface InitializationResponse {
    status_code: number
    success: boolean
    message: string
    data: {
      project_id: string
      project_url: string
    }
  }
  
  export interface NewEndpointResponse {
    endpointUrl: string
    httpMethod: 'GET' | 'POST'
  }
  
  export interface EndpointListData {
    status_code: number
    success: boolean
    message: string
    data: EndpointListContent[]
  }
  
  export interface EndpointListContent {
    path: string
    method: string
    content_base64?: string
  }
  export interface ProjectListContent {
    id: string
    name: string
    description: string
    slug: string
    language: string
    framework: string
  }

  export interface GetUserProjects {
    data: ProjectListContent[]
  }
  
  export interface CodeGenApiResponse {
    status_code: number
    success: boolean
    message: string
    data: {
      project_id: string
      endpoint: {
        generated_code: string
        endpoint_path: string
        method: string
        content_base64: string
        file_path: string
        file_hash: string
        endpoint_id: string
      }
      model: {
        generated_code: string
        content_base64: string
        entity_name: string
        file_path: string
        file_hash: string
        exists: false
      }
      schema: {
        generated_code: string
        content_base64: string
        entity_name: string
        file_path: string
        file_hash: string
        exists: false
      }
      migration: {
        generated_code: string
        content_base64: string
        entity_name: string
        file_path: string
        file_hash: string
        exists: false
      }
      git_results: {
        additionalProp1: string
        additionalProp2: string
        additionalProp3: string
      }
    }
  }
  
  // 
  export interface CodeChatActivationResponse {
    status: string;
    status_code: number;
    success: boolean;
    message: string;
    project_id: string;
    websocket_url?: string;
    code?: string;
    data?: {
      project_id: string;
      status: string;
      websocket_url: string;
      code?: string;
      endpoint?: EndpointType;
      model?: ModelType;
      schema?: SchemaType;
      migration?: MigrationType;
    };
  }
  
  export interface CodeGenData {
    project_id: string
    prompt: string
    language: string
    method: string
    endpoint_path: string
    additional_context?: string
  }
  
  export interface CodeReGenResponse {
    status_code: number
    success: boolean
    message: string
    data: {
      updated_code: string
      content_base64: string
      codeId: string
    }
  }
  
  export interface CodeReGenData {
    codeId: string
    currentCode: string
    editPrompt: string
  }
  
  export interface UpdateCodeResponse {
    status_code: number
    data: unknown
    success: boolean
    message: string
  }

  export interface ChatHistoryContent {
    id: string
    prompt: string
    response: string
    response_text: string
    endpoint_id: string
    created_at: string
  }
  
  export interface ChatHistoryByEndpoints {
    items: ChatHistoryContent[]
  }
  
  export interface GetModelsResponse {
    status_code: number
    message: string
    data: ModelListContent[]
  }
  
  export interface GetSchemasResponse {
    status_code: boolean
    message: string
    data: SchemaListContent[]
  }
  
  export interface GetHelpersResponse {
    status_code: boolean
    message: string
    data: HelperListContent[]
  }
  
  export interface ModelListContent {
    name: string
  }
  
  export interface SchemaListContent {
    name: string
    description: string
  }
  
  export interface HelperListContent {
    name: string
    description: string
    type: string
  }
  
  export interface SingleModelResponse {
    status_code: number
    success: boolean
    message: string
    data: {
      name: string
      format: string
      content: string
      content_base64: string
    }
  }
  
  export interface SingleSchemaResponse {
    status_code: number
    success: boolean
    message: string
    data: {
      name: string
      format: string
      content: string
      content_base64: string
    }
  }
  
  export interface SingleHelperResponse {
    status_code: number
    success: boolean
    message: string
    data: {
      name: string
      format: string
      content: string
      content_base64: string
      type: string
    }
  }
  
  interface Column {
    default: string
    name: string
    nullable: boolean
    primary_key: boolean
    type: string
  }
  
  export interface DTable {
    columns: Column[]
    row_count: number
    schema: string
    table_name: string
  }
  
  export interface SingeDatabaseResponse {
    status_code: number
    success: boolean
    message: string
    data: {
      type: string
      status: 'error' | 'success'
      payload: {
        analysis: {
          schema_version: string
          tables: DTable[]
        }
        project_id: string
      }
    }
  }
   
 // Define method types 
export type MethodType = "GET" | "POST" | "PUT" | "DELETE";

// File types in the editor
export type FileType = {
  id: string
  name: string
  path: string
  type: "endpoint" | "model" | "schema" | "config" | "migration" | "helpers"
  code: string
  method?: MethodType
}

// Generated data structure types
export interface EndpointType {
  generated_code?: string;
  endpoint_path?: string;
  method?: string;
  content_base64?: string;
  file_path?: string;
  file_hash?: string;
  endpoint_id?: string;
}

export interface ModelType {
  generated_code?: string;
  entity_name?: string;
  file_path?: string;
  file_hash?: string;
  exists?: boolean;
  content_base64?: string;
}

export interface SchemaType {
  generated_code?: string;
  entity_name?: string;
  file_path?: string;
  file_hash?: string;
  exists?: boolean;
  content_base64?: string;
}

export interface MigrationType {
  generated_code?: string;
  entity_name?: string;
  file_path?: string;
  file_hash?: string;
  exists?: boolean;
  content_base64?: string;
}

export type HelpersType = {
  file_path: string
  generated_code: string
  content_base64: string
  file_hash: string
  entity_name?: string
  exists?: boolean
}

export type ConfigType = {
  file_path: string
  generated_code: string
  content_base64: string
  file_hash: string
  entity_name?: string
  exists?: boolean
}

export interface GeneratedDataType {
  project_id?: string;
  endpoint?: EndpointType;
  model?: ModelType;
  schema?: SchemaType;
  migration?: MigrationType;
  helpers?: HelpersType;
  config?: ConfigType;
  git_results?: Record<string, string>;
}

export interface GeneratedFileType {
  id: string;
  type: "endpoint" | "model" | "schema" | "migration";
  name: string;
  path: string;
  code: string;
  method?: string;
}

export interface FileObject {
  file_path: string
  generated_code: string
  content_base64: string
  file_hash: string
  endpoint_path?: string
  method?: string
  entity_name?: string
  endpoint_id?: string
  exists?: boolean
}
