import type { CodeGenData, CodeChatActivationResponse } from '@/types'
import { BaseService } from './base-service'
class CodeGenService extends BaseService {
  constructor() {
    super('/generate')
  }

  public async generateCode(CodeGenData: CodeGenData) {
    const res = await this.post<CodeChatActivationResponse, CodeGenData>(
      '',
      CodeGenData
    )
    return res.data
  }
}

export default CodeGenService
