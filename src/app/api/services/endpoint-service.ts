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
  type SingleMigrationResponse
} from '@/types'
import { BaseService } from './base-service'
import createAxiosInstance from './axiosInstance'

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
      console.log('Creating new endpoint:', {
        projectId,
        endpointPath,
        httpMethod,
        description
      });
      // Use the axios instance for endpoint creation
      const axiosInstance = createAxiosInstance('/endpoint', 'v1');
      const res = await axiosInstance.post('', {
        project_id: projectId,
        endpoint_path: endpointPath,
        method: httpMethod,
        description: description
      });
      console.log('Endpoint creation response:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error creating endpoint:', error);
      throw error;
    }
  }

  public async getEndpointList(projectId: string) {
    try {
      console.log('Fetching endpoints for project:', projectId);
      const res = await this.get<EndpointListData>(`/${projectId}/endpoints`);
      console.log('Endpoint list response:', res);
      
      // Return the full response data including potential content_base64
      if (res.success && res.data) {
        const endpoints = res.data.map(endpoint => ({
          ...endpoint,
          code: endpoint.content_base64 ? atob(endpoint.content_base64) : ''
        }));
        console.log('Processed endpoints:', endpoints);
        return endpoints;
      }
      console.log('No endpoints found or unsuccessful response');
      return [];
    } catch (error) {
      console.error('Error fetching endpoint list:', error);
      throw error;
    }
  }

  // Model management methods
  public async getModelList(projectId: string) {
    try {
      console.log(`Fetching model list for project: ${projectId}`);
      const res = await this.get<GetModelsResponse>(`/${projectId}/models/`)
      console.log('Model list response:', res);
      return res.data;
    } catch (error) {
      console.error('Error fetching model list:', error);
      throw error;
    }
  }

  public async getModel(projectId: string, modelName: string) {
    try {
      console.log(`Fetching model ${modelName} for project: ${projectId}`);
      const res = await this.get<SingleModelResponse>(
        `/${projectId}/models/${modelName}/content`
      )
      console.log('Model content response:', res);
      return res.data;
    } catch (error) {
      console.error('Error fetching model:', error);
      throw error;
    }
  }

  // Schema management methods
  public async getSchemaList(projectId: string) {
    try {
      console.log(`Fetching schema list for project: ${projectId}`);
      const res = await this.get<GetSchemasResponse>(`/${projectId}/schemas/`)
      console.log('Schema list response:', res);
      return res.data;
    } catch (error) {
      console.error('Error fetching schema list:', error);
      throw error;
    }
  }

  public async getSchema(projectId: string, schemaName: string) {
    try {
      console.log(`Fetching schema ${schemaName} for project: ${projectId}`);
      const res = await this.get<SingleSchemaResponse>(
        `/${projectId}/schemas/${schemaName}/content`
      )
      console.log('Schema content response:', res);
      return res.data;
    } catch (error) {
      console.error('Error fetching schema:', error);
      throw error;
    }
  }

  // Helper management methods
  public async getHelperList(projectId: string) {
    try {
      console.log(`Fetching helper list for project: ${projectId}`);
      const res = await this.get<GetHelpersResponse>(`/${projectId}/helpers/`)
      console.log('Helper list response:', res);
      return res.data;
    } catch (error) {
      console.error('Error fetching helper list:', error);
      throw error;
    }
  }

  public async getHelper(projectId: string, helperName: string) {
    try {
      console.log(`Fetching helper ${helperName} for project: ${projectId}`);
      const res = await this.get<SingleHelperResponse>(
        `/${projectId}/helpers/${helperName}/content`
      )
      console.log('Helper content response:', res);
      return res.data;
    } catch (error) {
      console.error('Error fetching helper:', error);
      throw error;
    }
  }
  
  

  public async getDoc(projectId: string, docName: string): Promise<string> {
    try {
      if (!projectId) {
        console.error("Missing required parameter: projectId")
        return "# Error\n\nMissing required project ID to fetch documentation."
      }

      console.log(`Fetching doc ${docName} for project: ${projectId}`)

      // First try to fetch the specific documentation
      try {
        const res = await this.get<SingleDocResponse>(`/${projectId}/docs/${docName}/content`)

        if (res.status_code === 200 && res.data?.content) {
          return res.data.content
        }
      } catch (error) {
        console.error(`Error fetching specific doc '${docName}':`, error)
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
      console.log(`Fetching migration list for project: ${projectId}`);
      const res = await this.get<GetMigrationsResponse>(`/${projectId}/alembic/versions/`)
      console.log('migration list response:', res);
      return res.data;
    } catch (error) {
      console.error('Error fetching migration list:', error);
      throw error;
    }
  }

  public async getMigration(projectId: string, version_name: string) {
    try {
      console.log(`Fetching migration ${version_name} for project: ${projectId}`);
      const res = await this.get<SingleMigrationResponse>(
        `/${projectId}/alembic/versions/${version_name}/content`
      )
      console.log('Migration content response:', res);
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
}



export default EndpointService