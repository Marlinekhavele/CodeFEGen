import type { CodeGenData, CodeChatActivationResponse } from '@/types'
import { BaseService } from './base-service'

class CodeGenService extends BaseService {
  constructor() {
    // Since your BaseService already adds /api/v1, use the path without that prefix
    super('/generate/stream')
  }

  public async generateCode(codeGenData: CodeGenData): Promise<CodeChatActivationResponse> {
    try {
      const res = await this.post<CodeChatActivationResponse, CodeGenData>(
        '',
        codeGenData
      )
      
      if (!res) {
        throw new Error('No response data received from the API')
      }
      
      // If we have a websocket_url already, use it
      if (res.websocket_url) {
        // Protocol (ws:// or wss://)
        const protocol = typeof window !== 'undefined' ? 
          (window.location.protocol === 'https:' ? 'wss:' : 'ws:') : 'ws:';
        const host = typeof window !== 'undefined' ? window.location.host : '';
        
        // If the URL is already absolute, use it as is
        // Otherwise, construct the full URL
        const fullWsUrl = res.websocket_url.startsWith('ws') 
          ? res.websocket_url 
          : `${protocol}//${host}${res.websocket_url}`;
        
        return {
          status: res.status || 'SUCCESS',
          status_code: res.status_code || 200,
          success: res.success !== undefined ? res.success : true,
          message: res.message || 'Operation completed successfully',
          project_id: res.project_id || codeGenData.project_id,
          websocket_url: fullWsUrl,
          code: res.code || '',
          data: res.data
        }
      } else {
        // No websocket_url provided, construct a default one
        const protocol = typeof window !== 'undefined' ? 
          (window.location.protocol === 'https:' ? 'wss:' : 'ws:') : 'ws:';
        const host = typeof window !== 'undefined' ? window.location.host : '';
        const wsPath = '/api/v1/generate/stream';
        
        return {
          status: res.status || 'SUCCESS',
          status_code: res.status_code || 200,
          success: res.success !== undefined ? res.success : true,
          message: res.message || 'Operation completed successfully',
          project_id: res.project_id || codeGenData.project_id,
          websocket_url: `${protocol}//${host}${wsPath}`,
          code: res.code || ''
        }
      }
    } catch (error) {
      console.error('Error in generateCode:', error)
      
      // Return a properly typed error response
      return {
        status: 'FAILED',
        status_code: 500,
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred during code generation',
        project_id: codeGenData.project_id,
        websocket_url: '',
        code: ''
      }
    }
  }

  // Add this method to handle direct API calls for code generation
  public async getGeneratedCode(codeGenData: CodeGenData): Promise<CodeChatActivationResponse> {
    try {
      // This endpoint would be a non-WebSocket endpoint that returns the full code response
      const res = await this.post<CodeChatActivationResponse, CodeGenData>(
        '/generate', // Different endpoint for direct generation
        codeGenData
      )
      
      if (!res) {
        throw new Error('No response data received from the API')
      }
      
      return {
        status: res.status || 'SUCCESS',
        status_code: res.status_code || 200,
        success: res.success !== undefined ? res.success : true,
        message: res.message || 'Operation completed successfully',
        project_id: res.project_id || codeGenData.project_id,
        websocket_url: '',
        code: res.code || '',
        data: res.data
      }
    } catch (error) {
      console.error('Error in getGeneratedCode:', error)
      
      return {
        status: 'FAILED',
        status_code: 500,
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred during code generation',
        project_id: codeGenData.project_id,
        websocket_url: '',
        code: ''
      }
    }
  }
}

export default new CodeGenService()