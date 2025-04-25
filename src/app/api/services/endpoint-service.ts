import { 
  type EndpointListData,
  type GetModelsResponse,
  type GetSchemasResponse,
  type SingleModelResponse,
  type SingleSchemaResponse,
  type GetHelpersResponse,
  type SingleHelperResponse,
  type SingleDocResponse,
  type GetDocsResponse
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
      const axiosInstance = createAxiosInstance('/projects', 'v1');
      const res = await axiosInstance.post('', {
        project_id: projectId,
        endpoint_path: endpointPath,
        method: httpMethod,
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
  
  

  // Doc management method
  public async getDocList(projectId: string) {
    try {
      console.log(`Fetching doc list for project: ${projectId}`);
      const res = await this.get<GetDocsResponse>(`/${projectId}/docs/`)
      console.log('Doc list response:', res);
      return res.data;
    } catch (error) {
      console.error('Error fetching doc list:', error);
      throw error;
    }
  }
  public async getDoc(projectId: string, docName: string) {
    try {
      console.log(`Fetching doc ${docName} for project: ${projectId}`);
      const res = await this.get<SingleDocResponse>(
        `/${projectId}/docs/${docName}/content`
      )
      console.log('Doc content response:', res);
      return res.data;
    } catch (error) {
      console.error('Error fetching doc:', error);
      throw error;
    }
  }
}

export default EndpointService