import {
  type GetModelsResponse,
  type GetSchemasResponse,
  type SingleModelResponse,
  type SingleSchemaResponse,
  type GetHelpersResponse,
  type SingleHelperResponse,
} from '@/types'
import { BaseService } from './base-service'

class EndPointServiceV2 extends BaseService {
  constructor() {
    super('/endpoint')
  }

  public async getModelList(projectId: string) {
    const res = await this.get<GetModelsResponse>(`/${projectId}/models/`)
    return res.data
  }

  public async getSchemaList(projectId: string) {
    const res = await this.get<GetSchemasResponse>(`/${projectId}/schemas/`)
    return res.data
  }

  public async getHelperList(projectId: string) {
    const res = await this.get<GetHelpersResponse>(`/${projectId}/helpers/`)
    return res.data
  }

  public async getModel(projectId: string, modelName: string) {
    const res = await this.get<SingleModelResponse>(
      `/${projectId}/models/${modelName}/content`
    )
    return res.data
  }

  public async getSchema(projectId: string, schemaName: string) {
    const res = await this.get<SingleSchemaResponse>(
      `/${projectId}/schemas/${schemaName}/content`
    )
    return res.data
  }
  public async getHelper(projectId: string, helperName: string) {
    const res = await this.get<SingleHelperResponse>(
      `/${projectId}/helpers/${helperName}/content`
    )
    return res.data
  }
}

export default EndPointServiceV2
