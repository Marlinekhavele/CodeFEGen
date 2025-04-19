import type { CodeGenData, CodeChatActivationResponse } from "@/types"
import { BaseService } from "./base-service"
import WebSocketHandler from "@/lib/websocket-handler"

class CodeGenService extends BaseService {
  constructor() {
    super("/", "v1")
  }

  // Replace the entire generateCode method with this optimized version
  public async generateCode(codeGenData: CodeGenData): Promise<CodeChatActivationResponse> {
    try {
      // If we have a direct WebSocket URL in the environment, use it directly
      const directWsUrl = process.env.NEXT_PUBLIC_DEPLOYMENT_BASE_WS_URL

      if (directWsUrl) {
        console.log("Using direct WebSocket URL from environment variables")
        return {
          success: true,
          websocket_url: directWsUrl,
        }
      }

      // Otherwise, fall back to getting the URL from the backend
      console.log("No direct WebSocket URL found, requesting from backend")
      const res = await this.post<CodeChatActivationResponse, CodeGenData>("generate/stream", codeGenData)

      // Get the WebSocket URL from the response
      let websocketUrl = res.data?.websocket_url || ""

      // If the WebSocket URL doesn't start with ws:// or wss://, use the environment variable
      if (!websocketUrl.startsWith("ws")) {
        const baseWsUrl =
          process.env.NEXT_PUBLIC_DEPLOYMENT_BASE_WS_URL ||
          "wss://codebegen.canadacentral.cloudapp.azure.com/api/v1/generate/stream"

        // If the websocketUrl starts with a slash, remove it to avoid double slashes
        if (websocketUrl.startsWith("/")) {
          websocketUrl = websocketUrl.substring(1)
        }

        // If baseWsUrl ends with a slash and websocketUrl doesn't start with one, we're good
        // If baseWsUrl doesn't end with a slash, make sure we add one if needed
        const separator = baseWsUrl.endsWith("/") ? "" : "/"

        // Combine the base URL with the WebSocket path
        websocketUrl = `${baseWsUrl}${separator}${websocketUrl}`
      }

      // Update the WebSocket URL in the response
      if (res.data) {
        res.data.websocket_url = websocketUrl
      }

      return res.data || { websocket_url: websocketUrl }
    } catch (error) {
      console.error("Error generating code:", error)
      throw error
    }
  }

  // New method to create a WebSocketHandler directly
  public createWebSocketHandler(codeGenData: CodeGenData): Promise<WebSocketHandler> {
    return new Promise(async (resolve, reject) => {
      try {
        // Get the WebSocket URL
        const response = await this.generateCode(codeGenData)

        if (!response || !response.websocket_url) {
          throw new Error("No WebSocket URL provided")
        }

        // Create the WebSocketHandler
        const wsHandler = new WebSocketHandler(response.websocket_url)

        // Resolve with the handler
        resolve(wsHandler)
      } catch (error) {
        reject(error)
      }
    })
  }

  // Add a new method that creates a WebSocketHandler without an API call
  public createDirectWebSocketHandler(codeGenData: CodeGenData): WebSocketHandler {
    const wsUrl = process.env.NEXT_PUBLIC_DEPLOYMENT_BASE_WS_URL

    if (!wsUrl) {
      throw new Error("NEXT_PUBLIC_DEPLOYMENT_BASE_WS_URL environment variable is not set")
    }

    // Create and return the WebSocketHandler
    return new WebSocketHandler(wsUrl)
  }
}

export default CodeGenService
