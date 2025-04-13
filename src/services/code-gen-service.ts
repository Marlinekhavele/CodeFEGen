import type { CodeGenData, CodeChatActivationResponse } from '~/types'
import { BaseService } from './base-service'
class CodeGenService extends BaseService {
  constructor() {
    super('/', 'v2')
  }

  public async generateCode(CodeGenData: CodeGenData) {
    const res = await this.post<CodeChatActivationResponse, CodeGenData>(
      'code-generation',
      CodeGenData
    )
    return res.data
  }
}

export default CodeGenService
