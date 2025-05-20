import { 
  type EndpointListData,
  type GetModelsResponse,
  type GetSchemasResponse,
  type SingleModelResponse,
  type SingleSchemaResponse,
  type GetHelpersResponse,
  type SingleHelperResponse,
  type SingleDocResponse,
  type GetDocsResponse,
  type GetMigrationsResponse,
  type SingleMigrationResponse,
  type DatabaseResponse
} from '@/types'
import { BaseService } from './base-service'
import createAxiosInstance from './axiosInstance'

// Define interfaces for database responses
export interface DBFileListSuccessResponse {
  status_code: number;
  success: boolean;
  message: string;
  data: DBFileResponse[];
}

export interface DBFileResponse {
  name: string;
  path: string;
}

export interface DBTableListSuccessResponse {
  status_code: number;
  success: boolean;
  message: string;
  data: DBTableResponse[];
}

export interface DBTableResponse {
  name: string;
  columns?: Column[];
  row_count?: number;
}

export interface Column {
  name: string;
  type: string;
  nullable: boolean;
  primary_key: boolean;
  default?: string;
}

export interface TableRowsSuccessResponse {
  status_code: number;
  success: boolean;
  message: string;
  data: Record<string, any>[];
}

class EndpointService extends BaseService {
  constructor() {
    super('/projects')
  }

  // Endpoint management methods
  public async newEndpointCreation(
    projectId: string,
    endpointPath: string,
    httpMethod: string,
    description: string 
  ): Promise<any> {
    try {
      // Use the axios instance for endpoint creation
      const axiosInstance = createAxiosInstance('/endpoint', 'v1');
      const res = await axiosInstance.post('', {
        project_id: projectId,
        endpoint_path: endpointPath,
        method: httpMethod,
        description: description
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  }

  public async getEndpointList(projectId: string) {
    try {
      const res = await this.get<EndpointListData>(`/${projectId}/endpoints`);
      
      // Return the full response data including potential content_base64
      if (res.success && res.data) {
        const endpoints = res.data.map(endpoint => ({
          ...endpoint,
          code: endpoint.content_base64 ? atob(endpoint.content_base64) : ''
        }));
        return endpoints;
      }
      return [];
    } catch (error) {
      throw error;
    }
  }

  // Model management methods
  public async getModelList(projectId: string) {
    try {
      const res = await this.get<GetModelsResponse>(`/${projectId}/models/`)
      return res.data;
    } catch (error) {
      console.error('Error fetching model list:', error);
      throw error;
    }
  }

  public async getModel(projectId: string, modelName: string) {
    try {
      const res = await this.get<SingleModelResponse>(
        `/${projectId}/models/${modelName}/content`
      )
      return res.data;
    } catch (error) {
      console.error('Error fetching model:', error);
      throw error;
    }
  }

  // Schema management methods
  public async getSchemaList(projectId: string) {
    try {
      const res = await this.get<GetSchemasResponse>(`/${projectId}/schemas/`)
      return res.data;
    } catch (error) {
      console.error('Error fetching schema list:', error);
      throw error;
    }
  }

  public async getSchema(projectId: string, schemaName: string) {
    try {
      const res = await this.get<SingleSchemaResponse>(
        `/${projectId}/schemas/${schemaName}/content`
      )
      return res.data;
    } catch (error) {
      throw error;
    }
  }

  // Helper management methods
  public async getHelperList(projectId: string) {
    try {
      const res = await this.get<GetHelpersResponse>(`/${projectId}/helpers/`)
      return res.data;
    } catch (error) {
      throw error;
    }
  }

  public async getHelper(projectId: string, helperName: string) {
    try {
      const res = await this.get<SingleHelperResponse>(
        `/${projectId}/helpers/${helperName}/content`
      )
      return res.data;
    } catch (error) {
      throw error;
    }
  }
  
  public async getDoc(projectId: string, docName: string): Promise<string> {
    try {
      if (!projectId) {
        return "# Error\n\nMissing required project ID to fetch documentation."
      }

      // First try to fetch the specific documentation
      try {
        const res = await this.get<SingleDocResponse>(`/${projectId}/docs/${docName}/content`)

        if (res.status_code === 200 && res.data?.content) {
          return res.data.content
        }
      } catch (error) {
        throw error
      }

      // If that fails, try to fetch the api.md file directly
      try {
        const apiDocRes = await this.get<SingleDocResponse>(`/${projectId}/docs/api.md/content`)

        if (apiDocRes.status_code === 200 && apiDocRes.data?.content) {
          return apiDocRes.data.content
        }
      } catch (error) {
        console.error("Error fetching api.md:", error)
      }

      // If that fails too, try to get all docs and find the first one
      try {
        const allDocs = await this.getDocList(projectId)

        if (allDocs && allDocs.length > 0) {
          // Try to get the first available doc
          const firstDoc = allDocs[0]
          const firstDocRes = await this.get<SingleDocResponse>(`/${projectId}/docs/${firstDoc.name}/content`)

          if (firstDocRes.status_code === 200 && firstDocRes.data?.content) {
            return firstDocRes.data.content
          }
        }
      } catch (error) {
        console.error("Error fetching all docs:", error)
      }

      return `# Documentation Not Found\n\nNo documentation was found for this project.\n\nThe documentation may not have been generated yet or might be using a different naming convention.`
    } catch (error) {
      console.error("Documentation fetch failed:", error)
      throw error
    }
  }

  // Method to get all available docs
  public async getDocList(projectId: string): Promise<{ name: string; type: string }[]> {
    try {
      const res = await this.get<GetDocsResponse>(`/${projectId}/docs/`)

      if (res.status_code === 200 && Array.isArray(res.data)) {
        return res.data
      }

      return []
    } catch (error) {
      console.error("Failed to fetch all docs:", error)
      return []
    }
  }

  // Migration management methods
  public async getMigrationList(projectId: string) {
    try {
      const res = await this.get<GetMigrationsResponse>(`/${projectId}/alembic/versions/`)
      return res.data;
    } catch (error) {
      throw error;
    }
  }

  public async getMigration(projectId: string, version_name: string) {
    try {
      const res = await this.get<SingleMigrationResponse>(
        `/${projectId}/alembic/versions/${version_name}/content`
      )
      return res.data;
    } catch (error) {
      console.error('Error fetching migration:', error);
      throw error;
    }
  }

  // Method to test an endpoint
  public async testEndpoint(url: string, method: string, headers: Record<string, string>, body?: string): Promise<any> {
    try {
      const options: RequestInit = {
        method,
        headers,
      }
      
      if (["POST", "PUT", "PATCH"].includes(method) && body) {
        options.body = body
      }
      
      const response = await fetch(url, options)
      const contentType = response.headers.get("content-type") || ""
      
      if (contentType.includes("application/json")) {
        return await response.json()
      }
      
      return await response.text()
    } catch (error) {
      console.error("Error testing endpoint:", error)
      throw error
    }
  }

  // Database methods
  public async getDatabaseFiles(projectId: string): Promise<any[]> {
    try {
      (`Fetching database files for project: ${projectId}`);
      const res = await this.get<DBFileListSuccessResponse>(`/${projectId}/db/files`);
      
      if (res.status_code === 200 && Array.isArray(res.data)) {
        return res.data;
      }
      
      return [];
    } catch (error) {
      console.error("Error fetching database files:", error);
      throw error;
    }
  }

  public async getDatabaseTables(projectId: string, dbFilename: string): Promise<any[]> {
    try {
      (`Fetching database tables for ${dbFilename} in project: ${projectId}`);
      
      // Get the full database view for complete information
      const fullViewRes = await this.getFullDatabaseView(projectId);
      
      if (fullViewRes && Array.isArray(fullViewRes)) {
        // Find the current database in the full view
        const dbInfo = fullViewRes.find((db: any) => db.db_file === dbFilename);
        
        if (dbInfo && dbInfo.tables) {
          // Process each table from the full view
          const tablesWithDetails = dbInfo.tables.map((table: any) => {
            
            // Extract column information from rows
            const columns = this.extractColumnsFromRows(table.rows);
            
            return {
              name: table.name,
              rowCount: table.rows.length,
              columns: columns
            };
          });
          
          return tablesWithDetails;
        }
      }
      
      // Fallback to the basic tables endpoint if full view fails
      const res = await this.get<DBTableListSuccessResponse>(`/${projectId}/db/${dbFilename}/tables`);
      
      if (res.status_code === 200 && Array.isArray(res.data)) {
        // Process each table with minimal information
        const tablesWithBasicInfo = await Promise.all(
          res.data.map(async (table) => {
            try {
              // Fetch rows to get count and infer columns
              const rows = await this.getTableRows(projectId, dbFilename, table.name);
              
              return {
                name: table.name,
                rowCount: rows.length,
                columns: this.extractColumnsFromRows(rows)
              };
            } catch (error) {
              console.error(`Error processing table ${table.name}:`, error);
              return {
                name: table.name,
                rowCount: 0,
                columns: []
              };
            }
          })
        );
        
        return tablesWithBasicInfo;
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching tables for database ${dbFilename}:`, error);
      // Return empty array to prevent UI disruption
      return [];
    }
  }
  
  // Helper to extract column information from row data
  private extractColumnsFromRows(rows: any[]): any[] {
    if (!rows || rows.length === 0) return [];
    
    // Get sample row to extract columns
    const sampleRow = rows[0];
    const columnNames = Object.keys(sampleRow);
    
    return columnNames.map(name => {
      // Collect values for this column to help determine type and nullability
      const values = rows.map(row => row[name]);
      const nonNullValues = values.filter(v => v !== null && v !== undefined);
      
      return {
        name: name,
        type: this.inferColumnType(nonNullValues[0]),
        nullable: values.some(v => v === null || v === undefined),
        primaryKey: name.toLowerCase() === 'id' || name.toLowerCase().endsWith('_id')
      };
    });
  }
  
  // Method to infer column type from a value
  private inferColumnType(value: any): string {
    if (value === null || value === undefined) return "unknown";
    
    const type = typeof value;
    
    switch (type) {
      case "number":
        return Number.isInteger(value) ? "integer" : "float";
      case "string":
        // Try to detect if it's a date
        if (!isNaN(Date.parse(value))) return "datetime";
        // Try to detect if it's a UUID
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) 
          return "uuid";
        return "text";
      case "boolean":
        return "boolean";
      case "object":
        if (Array.isArray(value)) return "array";
        return "json";
      default:
        return type;
    }
  }
  
  // Update getFullDatabaseView to return directly the data array
  public async getFullDatabaseView(projectId: string, rowLimit: number = 10): Promise<any[]> {
    try {
      (`Fetching full database view for project: ${projectId}`);
      const res = await this.get<any>(`/${projectId}/db/full-view?row_limit=${rowLimit}`);
      
      if (res.status_code === 200 && Array.isArray(res.data)) {
        return res.data;
      }
      
      return [];
    } catch (error) {
      console.error("Error fetching full database view:", error);
      return [];
    }
  }

  public async getTableRows(projectId: string, dbFilename: string, tableName: string, limit: number = 50): Promise<any[]> {
    try {
      (`Fetching rows for table ${tableName} in database ${dbFilename}`);
      const res = await this.get<TableRowsSuccessResponse>
        (`/${projectId}/db/${dbFilename}/tables/${tableName}/rows?limit=${limit}`);

      if (res.status_code === 200 && Array.isArray(res.data)) {
        return res.data;
      }

      return [];
    } catch (error) {
      console.error(`Error fetching rows for table ${tableName}:`, error);
      throw error;
    }
  }

}

export default EndpointService;