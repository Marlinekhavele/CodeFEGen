import { type EndpointListData } from '@/types'
import { BaseService } from './base-service'
import axios from "axios"

class EndPointService extends BaseService {
  constructor() {
    super('/projects')
  }

  public async newEndpointCreation(
    projectId: string,
    endpointPath: string,
    httpMethod: string,
    description: string 
  ): Promise<any> {
    // Use the correct backend API for endpoint creation
    const res = await axios.post(
      "https://codebegen.canadacentral.cloudapp.azure.com/api/v1/projects/",
      {
        project_id: projectId,
        endpoint_path: endpointPath,
        method: httpMethod,
      }
    )
    return res.data
  }

  public async getEndpointList(projectId: string) {
    const res = await this.get<EndpointListData>(`/${projectId}/endpoints`)
    // Return the full response data including potential content_base64
    if (res.success && res.data) {
      return res.data.map(endpoint => ({
        ...endpoint,
        code: endpoint.content_base64 ? atob(endpoint.content_base64) : ''
      }))
    }
    return []
  }
}

export default EndPointService
