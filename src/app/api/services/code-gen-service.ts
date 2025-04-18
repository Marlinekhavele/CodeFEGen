import type { CodeGenData, CodeChatActivationResponse } from "@/types"

class CodeGenService {
  // Direct WebSocket approach, no need for BaseService

  /**
   * Prepares for code generation by creating a response with WebSocket URL
   */
  public async generateCode(codeGenData: CodeGenData): Promise<CodeChatActivationResponse> {
    return {
      success: true,
      message: "WebSocket connection initiated",
      websocket_url: "wss://codebegen.canadacentral.cloudapp.azure.com/api/v1/generate/stream"
    }
  }

  /**
   * Fallback method for non-streaming code generation
   * In this implementation, it just returns the WebSocket URL as we're using direct WebSocket approach
   */
  public async getGeneratedCode(codeGenData: CodeGenData): Promise<CodeChatActivationResponse> {
    return this.generateCode(codeGenData)
  }
}

export default CodeGenService