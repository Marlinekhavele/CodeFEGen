import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { project_id, prompt, language, method, endpoint_path } = body
    console.log("Generate code request:", { project_id, prompt, language, method, endpoint_path })

    // Generate WebSocket URL with timestamp to make it unique
    const protocol = request.headers.get("x-forwarded-proto") === "https" ? "wss" : "ws"
    const host = request.headers.get("host") || "localhost:3000"
    const websocketPath = `/api/v1/generate/stream/${Date.now()}`
    const fullWebsocketUrl = `${protocol}://${host}${websocketPath}`

    console.log("Generated WebSocket URL:", fullWebsocketUrl)

    // Return the WebSocket URL in the response
    return NextResponse.json({
      websocket_url: websocketPath, // Return the relative path, not the full URL
      message: "Code generation started",
      status: "STARTED",
      project_id,
    })
  } catch (error) {
    console.error("Error generating code:", error)
    return NextResponse.json(
      {
        error: "Failed to generate code",
        message: "An error occurred during code generation",
        status: "FAILED",
      },
      { status: 500 },
    )
  }
}
