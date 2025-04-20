// WebSocketManager
export interface WebSocketOptions {
  onStatus?: (status: string, message?: string) => void
  onMessage?: (data: any) => void
  onChunk?: (chunk: string) => void
  onComplete?: (data: any) => void
  onError?: (error: Error) => void
}

export class WebSocketManager {
  private socket: WebSocket | null = null
  private options: WebSocketOptions
  private buffer: string = ""
  
  constructor(options: WebSocketOptions = {}) {
    this.options = options
  }

  public connect(url: string): void {
    try {
      // Close existing connection if any
      if (this.socket) {
        this.close()
      }

      if (this.options.onStatus) {
        this.options.onStatus("connecting", `Connecting to ${url}`)
      }

      // Create a new WebSocket connection
      this.socket = new WebSocket(url)

      // Set up event handlers
      this.socket.onopen = this.handleOpen.bind(this)
      this.socket.onmessage = this.handleMessage.bind(this)
      this.socket.onerror = this.handleError.bind(this)
      this.socket.onclose = this.handleClose.bind(this)
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Unknown error connecting to WebSocket")
      if (this.options.onError) {
        this.options.onError(err)
      }
      if (this.options.onStatus) {
        this.options.onStatus("error", err.message)
      }
      throw err
    }
  }

  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN
  }

  public send(data: any): void {
    if (!this.isConnected()) {
      const error = new Error("Cannot send data: WebSocket is not connected")
      if (this.options.onError) {
        this.options.onError(error)
      }
      throw error
    }

    try {
      // Convert data to JSON string if it's not already a string
      const message = typeof data === "string" ? data : JSON.stringify(data)
      this.socket!.send(message)
      
      if (this.options.onStatus) {
        this.options.onStatus("sent", "Data sent to WebSocket")
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Error sending data to WebSocket")
      if (this.options.onError) {
        this.options.onError(err)
      }
      throw err
    }
  }

  public close(): void {
    if (this.socket) {
      try {
        // Only attempt to close if the socket is not already closed
        if (this.socket.readyState !== WebSocket.CLOSED && this.socket.readyState !== WebSocket.CLOSING) {
          this.socket.close(1000, "Client closed connection")
        }
      } catch (error) {
        console.error("Error closing WebSocket:", error)
      } finally {
        this.socket = null
        this.buffer = ""
        if (this.options.onStatus) {
          this.options.onStatus("closed", "Connection closed by client")
        }
      }
    }
  }

  private handleOpen(event: Event): void {
    if (this.options.onStatus) {
      this.options.onStatus("open", "Connection established")
    }
  }

  private handleMessage(event: MessageEvent): void {
    try {
      // Process each message
      const message = event.data
      
      if (typeof message === "string") {
        // If we have an onChunk handler, call it with the raw chunk
        if (this.options.onChunk) {
          this.options.onChunk(message)
        }
        
        // Add to buffer
        this.buffer += message

        // Try to parse the buffer as JSON
        try {
          const data = JSON.parse(this.buffer)
          
          // Successfully parsed - clear buffer
          this.buffer = ""
          
          // Check if this is the completion message
          if (data.status === "completed" || data.completed || data.finished) {
            if (this.options.onComplete) {
              this.options.onComplete(data)
            }
          } else if (this.options.onMessage) {
            this.options.onMessage(data)
          }
        } catch (parseError) {
          // Not a complete JSON object yet, continue buffering
          // This is normal for streaming responses
        }
      } else if (this.options.onMessage) {
        // If it's not a string (e.g., Blob or ArrayBuffer), pass it to onMessage
        this.options.onMessage(message)
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Error processing WebSocket message")
      if (this.options.onError) {
        this.options.onError(err)
      }
      console.error("WebSocket message handling error:", error)
    }
  }

  private handleError(event: Event): void {
    const error = new Error("WebSocket error occurred")
    if (this.options.onError) {
      this.options.onError(error)
    }
    if (this.options.onStatus) {
      this.options.onStatus("error", "Connection error")
    }
    console.error("WebSocket error:", event)
  }

  private handleClose(event: CloseEvent): void {
    // Process any remaining data in the buffer
    if (this.buffer.length > 0) {
      try {
        const data = JSON.parse(this.buffer)
        if (this.options.onMessage) {
          this.options.onMessage(data)
        }
      } catch (error) {
        // Ignore parse errors on close
      }
      this.buffer = ""
    }

    // Call onStatus with the close information
    if (this.options.onStatus) {
      const reason = event.reason || "Connection closed"
      this.options.onStatus("closed", `${reason} (code: ${event.code})`)
    }

    this.socket = null
  }
}