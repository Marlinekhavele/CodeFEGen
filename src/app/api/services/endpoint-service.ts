import { type EndpointListData, type NewEndpointResponse } from '@/types'
import { BaseService } from './base-service'

class EndPointService extends BaseService {
  constructor() {
    super('/projects')
  }

  public async newEndpointCreation(
    endpoint_Url: string,
    httpMethod: string
  ): Promise<NewEndpointResponse> {
    const res = await this.post<
      NewEndpointResponse,
      { name: string; method: string }
    >('', {
      name: endpoint_Url,
      method: httpMethod,
    })
    return res
  }

  public async getEndpointList(projectId: string) {
    const res = await this.get<EndpointListData>(`/${projectId}/endpoints`)
    return res.data
  }
}

export default EndPointService
