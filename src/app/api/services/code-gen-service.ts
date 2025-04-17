import type { CodeGenData, CodeChatActivationResponse } from '@/types'
import { BaseService } from './base-service'

class CodeGenService extends BaseService {
  constructor() {
    super('/generate/stream')
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
     
      return {
        status: res.data.status || 'SUCCESS',
        status_code: res.data.status_code || 200,
        success: res.data.success !== undefined ? res.data.success : true,
        message: res.data.message || 'Operation completed successfully',
        data: {
          project_id: res.data.project_id,
          status: res.data.status,
          websocket_url: res.data.websocket_url,
          code: res.data.code,
        }
      } as CodeChatActivationResponse
    } catch (error) {
      console.error('Error in generateCode:', error)
      
      // Return a properly typed error response
      return {
        status: 'FAILED',
        status_code: 500,
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred during code generation',
        data: {
          project_id: codeGenData.project_id,
          status: 'FAILED',
          websocket_url: '',
        }
      } as CodeChatActivationResponse
    }
  }
}

export default CodeGenService