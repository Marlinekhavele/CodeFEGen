// app/api/services/code-gen-service.ts
import type { CodeGenData, CodeChatActivationResponse } from '@/types'
import { BaseService } from './base-service'

class CodeGenService extends BaseService {
  constructor() {
    super('/generate')
  }

  public async generateCode(codeGenData: CodeGenData): Promise<CodeChatActivationResponse> {
    try {
      const res = await this.post<CodeChatActivationResponse, CodeGenData>(
        '',
        codeGenData
      )
      
      // Make sure there's a fallback if res.data is undefined
      if (!res || !res.data) {
        throw new Error('No response data received from the API')
      }
      
      return res.data
    } catch (error) {
      console.error('Error in generateCode:', error)
      // Return a default error response instead of letting it fail
      return {
        error: 'Failed to generate code',
        message: 'An error occurred during code generation',
        status: 'FAILED'
      }
    }
  }
}

export default CodeGenService