import { EventEmitter } from "events"
import type { CodeGenData } from "@/types"

// Define event types to match backend status messages
export enum CodeStreamEventType {
  CONNECTED = "connected",
  INFO = "info",
  PROGRESS = "progress",
  TOKEN = "token",
  TOKEN_STREAM_START = "token_stream_start",
  COMPLETED = "completed",
  COMPLETE = "complete",
  ERROR = "error",
  CLOSE = "close",
}

// WebSocket client for code generation streaming
export class WebSocketHandler extends EventEmitter {
  private ws: WebSocket | null = null
  private url: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 3
  private reconnectDelay = 1000
  private accumulatedTokens = ""

  constructor(websocketUrl: string) {
    super()
    this.url = websocketUrl
  }

  public connect(): void {
    if (this.ws) {
      this.close()
    }

    try {
      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        this.reconnectAttempts = 0
        this.emit(CodeStreamEventType.CONNECTED)
      }

      this.ws.onmessage = (event) => {
        try {
          // Try to parse as JSON first
          const data = JSON.parse(event.data)

          // Handle different message types based on the status field
          if (data.status === "connected") {
            this.emit(CodeStreamEventType.CONNECTED)
          } else if (data.status === "info") {
            this.emit(CodeStreamEventType.INFO, data)
          } else if (data.status === "progress") {
            this.emit(CodeStreamEventType.PROGRESS, data)
          } else if (data.status === "token_stream_start") {
            this.emit(CodeStreamEventType.TOKEN_STREAM_START, data)
          } else if (data.status === "completed") {
            this.emit(CodeStreamEventType.COMPLETED, data)
          } else if (data.status === "complete") {
            this.emit(CodeStreamEventType.COMPLETE, data)
          } else if (data.status === "error") {
            this.emit(CodeStreamEventType.ERROR, new Error(data.message))
          } else {
            // Unknown JSON message type
            this.emit("message", data)
          }
        } catch (e) {
          // Not JSON, must be a streaming token
          this.accumulatedTokens += event.data
          this.emit(CodeStreamEventType.TOKEN, event.data)
        }
      }

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error)
        this.emit(CodeStreamEventType.ERROR, error)
      }

      this.ws.onclose = (event) => {
        this.emit(CodeStreamEventType.CLOSE, event)

        // Attempt reconnection if not closed normally
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.reconnectAttempts++
            this.connect()
          }, this.reconnectDelay)
        }
      }
    } catch (error) {
      console.error("Failed to create WebSocket:", error)
      this.emit(CodeStreamEventType.ERROR, error instanceof Error ? error : new Error("Failed to create WebSocket"))
    }
  }

  public send(data: CodeGenData): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error("Cannot send: WebSocket is not open")
      this.emit(CodeStreamEventType.ERROR, new Error("WebSocket is not open"))
      return
    }

    try {
      this.ws.send(JSON.stringify(data))
    } catch (error) {
      console.error("Error sending data:", error)
      this.emit(CodeStreamEventType.ERROR, error instanceof Error ? error : new Error("Failed to send data"))
    }
  }

  public close(): void {
    if (this.ws) {
      this.ws.close(1000, "Client initiated close")
      this.ws = null
    }
    this.accumulatedTokens = ""
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }

  public resetAccumulatedTokens(): void {
    this.accumulatedTokens = ""
  }

  public getAccumulatedTokens(): string {
    return this.accumulatedTokens
  }
}

export default WebSocketHandler
