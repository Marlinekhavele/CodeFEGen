import type { CodeGenData, CodeChatActivationResponse, CodeGenApiResponse } from "@/types"
import { BaseService } from "./base-service"

class CodeGenService extends BaseService {
  constructor() {
    super("/")
  }

  public async generateCode(codeGenData: CodeGenData): Promise<CodeChatActivationResponse> {
    try {
      console.log("Sending code generation request:", codeGenData);

      // Ensure the payload matches the expected structure
      const payload = {
        project_id: codeGenData.project_id,
        prompt: codeGenData.prompt,
        language: codeGenData.language || "python", // Default to Python if not provided
        method: codeGenData.method,
        endpoint_path: codeGenData.endpoint_path,
        additional_context: codeGenData.additional_context || "", // Optional field
      };

      const response = await fetch("generate/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("API response status:", response.status);

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API response:", data);

      return {
        status: data.status || "SUCCESS",
        status_code: 200,
        success: true,
        message: data.message || "Operation completed successfully",
        websocket_url: data.websocket_url,
        data: {
          project_id: codeGenData.project_id,
          status: data.status,
          websocket_url: data.websocket_url,
        },
      } as CodeChatActivationResponse;
    } catch (error) {
      console.error("Error in generateCode:", error);

      return {
        status: "FAILED",
        status_code: 500,
        success: false,
        message: error instanceof Error ? error.message : "An error occurred during code generation",
        data: {
          project_id: codeGenData.project_id,
          status: "FAILED",
          websocket_url: "",
        },
      } as CodeChatActivationResponse;
    }
  }

  public async getGeneratedCode(codeGenData: CodeGenData): Promise<CodeGenApiResponse> {
    try {
      const res = await this.post<CodeGenApiResponse, CodeGenData>("generate/stream", codeGenData)

      if (!res || !res.data) {
        throw new Error("No response data received from the API")
      }

      return {
        status_code: 200,
        success: true,
        message: "Data retrieved successfully",
        data: res.data,
      }
    } catch (error) {
      console.error("Error in getGeneratedCode:", error)
      // Return a default error response with the expected structure
      return {
        status_code: 500,
        success: false,
        message: error instanceof Error ? error.message : "An error occurred during code generation",
        data: {
          project_id: codeGenData.project_id,
          endpoint: {
            generated_code: "",
            endpoint_path: "",
            method: "",
            content_base64: "",
            file_path: "",
            file_hash: "",
            endpoint_id: "",
          },
          model: {
            generated_code: "",
            content_base64: "",
            entity_name: "",
            file_path: "",
            file_hash: "",
            exists: false,
          },
          schema: {
            generated_code: "",
            content_base64: "",
            entity_name: "",
            file_path: "",
            file_hash: "",
            exists: false,
          },
          migration: {
            generated_code: "",
            content_base64: "",
            entity_name: "",
            file_path: "",
            file_hash: "",
            exists: false,
          },
          git_results: {
            additionalProp1: "",
            additionalProp2: "",
            additionalProp3: "",
          },
        },
      }
    }
  }

  // Process WebSocket data into the structured format
  public processWebSocketData(data: string): CodeGenApiResponse | null {
    try {
      // Try to parse the data as a CodeGenApiResponse
      const parsedData = JSON.parse(data) as CodeGenApiResponse

      // Validate that it has the expected structure
      if (parsedData.status_code !== undefined && parsedData.data) {
        return parsedData
      }

      return null
    } catch (error) {
      console.error("Error parsing WebSocket data:", error)
      return null
    }
  }

  // Connect to WebSocket and return the WebSocket instance
  public connectWebSocket(url: string): WebSocket {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
    let wsUrl = `${protocol}//${window.location.host}${url}`

    // Ensure the URL starts with a leading slash
    if (!url.startsWith("/")) {
      wsUrl = `${protocol}//${window.location.host}/${url}`
    }

    console.log(`Connecting to WebSocket: ${wsUrl}`)

    return new WebSocket(wsUrl)
  }

  // Helper method to handle WebSocket connection with callbacks
  public setupWebSocketConnection(
    url: string,
    onOpen?: () => void,
    onMessage?: (data: any) => void,
    onError?: (error: Event) => void,
    onClose?: () => void,
  ): WebSocket {
    const ws = this.connectWebSocket(url)

    ws.onopen = () => {
      console.log("WebSocket connection established")
      if (onOpen) onOpen()
    }

    ws.onmessage = (event) => {
      try {
        const messageData = JSON.parse(event.data)
        console.log("Received WebSocket message:", messageData)
        if (onMessage) onMessage(messageData)
      } catch (error) {
        console.error("Error processing WebSocket message:", error)
        if (onError) onError(new ErrorEvent("error", { error }))
      }
    }

    ws.onerror = (error) => {
      console.error("WebSocket error:", error)
      if (onError) onError(error)
    }

    ws.onclose = () => {
      console.log("WebSocket connection closed")
      if (onClose) onClose()
    }

    return ws
  }
}

export default CodeGenService
