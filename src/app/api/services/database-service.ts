import { SingeDatabaseResponse } from '@/types'
import { BaseService } from './base-service'

class DatabaseService extends BaseService {
  constructor() {
    super('')
  }

  public async getDatabaseInfo(projectId: string) {
    const res = await this.get<SingeDatabaseResponse>(
      `/database-info?project_id=${projectId}`
    )
    return res.data.payload.analysis
  }
}

export default DatabaseService
