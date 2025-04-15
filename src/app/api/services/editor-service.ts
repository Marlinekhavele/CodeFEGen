import type { EditorFileData, EditorGetFileData } from '@/types'
import { BaseService } from './base-service'

class EditorServices extends BaseService {
  constructor() {
    super('/editor')
  }

  public async getEndpointFile(
    projectId: string,
    endpointPath: string,
    method: string
  ) {
    const res = await this.get<EditorGetFileData>('', {
      project_id: projectId,
      endpoint_path: endpointPath,
      method: method,
    })
    return res.data
  }

  public async createEndpointFile(data: EditorFileData) {
    const res = await this.post<EditorGetFileData, EditorFileData>('', data)
    return res.data
  }

  public async saveEndpointFile(fileData: EditorFileData) {
    const res = await this.put<EditorGetFileData, EditorFileData>('', fileData)
    return res
  }

  public async deleteEndpointFile(
    projectId: string,
    endpointPath: string,
    method: string
  ) {
    return this.delete<EditorGetFileData>('', {
      project_id: projectId,
      endpoint_path: endpointPath,
      method: method,
    })
  }
}

export default EditorServices
