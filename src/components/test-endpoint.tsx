"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Loader2, Send, X } from "lucide-react"
import { Editor } from "@monaco-editor/react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism"

type TestEndpointProps = {
  method: string
  endpoint: string
  projectId: string
  theme?: string
}

type RequestHeader = {
  key: string
  value: string
}

type QueryParam = {
  key: string
  value: string
}

type TestResponse = {
  request_id: string
  success: boolean
  statusCode: number
  responseBody: string
  responseHeaders: Record<string, string>
  elapsedTime: number
  size: number
  contentType: string
  cookies?: Record<string, string>
  redirects?: string[]
  timestamp: string
}

export function TestEndpoint({ method, endpoint, projectId, theme }: TestEndpointProps) {
  const [endpointUrl, setEndpointUrl] = useState(`http://localhost:8000${endpoint}`)
  const [httpMethod, setHttpMethod] = useState(method)
  const [headers, setHeaders] = useState<RequestHeader[]>([{ key: "", value: "" }])
  const [queryParams, setQueryParams] = useState<QueryParam[]>([{ key: "", value: "" }])
  const [requestBody, setRequestBody] = useState("")
  const [activeTab, setActiveTab] = useState<"params" | "headers" | "body">("params")
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<TestResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [bodyFormat, setBodyFormat] = useState<"json" | "text">("json")

  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "" }])
  }

  const updateHeader = (index: number, field: "key" | "value", value: string) => {
    const newHeaders = [...headers]
    newHeaders[index][field] = value
    setHeaders(newHeaders)
  }

  const removeHeader = (index: number) => {
    const newHeaders = [...headers]
    newHeaders.splice(index, 1)
    setHeaders(newHeaders)
  }

  const addQueryParam = () => {
    setQueryParams([...queryParams, { key: "", value: "" }])
  }

  const updateQueryParam = (index: number, field: "key" | "value", value: string) => {
    const newParams = [...queryParams]
    newParams[index][field] = value
    setQueryParams(newParams)
  }

  const removeQueryParam = (index: number) => {
    const newParams = [...queryParams]
    newParams.splice(index, 1)
    setQueryParams(newParams)
  }

  const handleSendRequest = async () => {
    setIsLoading(true)
    setError(null)
    setResponse(null)

    try {
      // Build URL with query parameters
      const url = new URL(endpointUrl)
      queryParams.forEach((param) => {
        if (param.key) {
          url.searchParams.append(param.key, param.value)
        }
      })

      // Build headers
      const requestHeaders: Record<string, string> = {}
      headers.forEach((header) => {
        if (header.key) {
          requestHeaders[header.key] = header.value
        }
      })

      // Add content-type header if not present
      if (!requestHeaders["Content-Type"] && requestBody) {
        requestHeaders["Content-Type"] = bodyFormat === "json" ? "application/json" : "text/plain"
      }

      // Prepare request options
      const requestOptions: RequestInit = {
        method: httpMethod,
        headers: requestHeaders,
      }

      // Add body if needed
      if (["POST", "PUT", "PATCH"].includes(httpMethod) && requestBody) {
        requestOptions.body = bodyFormat === "json" ? requestBody : requestBody
      }

      // Record start time
      const startTime = performance.now()

      // Send request
      const response = await fetch(url.toString(), requestOptions)

      // Record end time
      const endTime = performance.now()
      const elapsedTime = endTime - startTime

      // Parse response headers
      const responseHeaders: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      // Get response body
      let responseBody = ""
      const contentType = response.headers.get("content-type") || ""

      if (contentType.includes("application/json")) {
        const jsonBody = await response.json()
        responseBody = JSON.stringify(jsonBody, null, 2)
      } else {
        responseBody = await response.text()
      }

      // Create response object
      const testResponse: TestResponse = {
        request_id: Math.random().toString(36).substring(2, 15),
        success: response.ok,
        statusCode: response.status,
        responseBody,
        responseHeaders,
        elapsedTime,
        size: new Blob([responseBody]).size,
        contentType: contentType || "unknown",
        timestamp: new Date().toISOString(),
      }

      setResponse(testResponse)
    } catch (err) {
      console.error("Error sending request:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    if (status >= 300 && status < 400) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    if (status >= 400 && status < 500) return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "POST":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "PUT":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
      case "DELETE":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex flex-col p-4 space-y-4 overflow-auto">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Test Endpoint</CardTitle>
            <CardDescription>Test an API endpoint by sending an HTTP request to the specified URL.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="endpoint-url">Endpoint URL</Label>
                <div className="flex space-x-2">
                  <div className="w-24">
                    <select
                      className="w-full h-10 px-3 py-2 text-sm border rounded-md border-input bg-background"
                      value={httpMethod}
                      onChange={(e) => setHttpMethod(e.target.value)}
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                      <option value="PATCH">PATCH</option>
                      <option value="HEAD">HEAD</option>
                      <option value="OPTIONS">OPTIONS</option>
                    </select>
                  </div>
                  <Input
                    id="endpoint-url"
                    value={endpointUrl}
                    onChange={(e) => setEndpointUrl(e.target.value)}
                    placeholder="https://api.example.com/endpoint"
                    className="flex-1"
                  />
                  <Button onClick={handleSendRequest} disabled={isLoading} className="w-24 text-white">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                    {isLoading ? "Sending" : "Send"}
                  </Button>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="params">Query Params</TabsTrigger>
                  <TabsTrigger value="headers">Headers</TabsTrigger>
                  <TabsTrigger value="body">Body</TabsTrigger>
                </TabsList>
                <TabsContent value="params" className="p-4 border rounded-md mt-2">
                  <div className="space-y-2">
                    {queryParams.map((param, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={param.key}
                          onChange={(e) => updateQueryParam(index, "key", e.target.value)}
                          placeholder="Parameter name"
                          className="flex-1"
                        />
                        <Input
                          value={param.value}
                          onChange={(e) => updateQueryParam(index, "value", e.target.value)}
                          placeholder="Value"
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeQueryParam(index)}
                          className="h-10 w-10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addQueryParam} className="mt-2">
                      Add Parameter
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="headers" className="p-4 border rounded-md mt-2">
                  <div className="space-y-2">
                    {headers.map((header, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={header.key}
                          onChange={(e) => updateHeader(index, "key", e.target.value)}
                          placeholder="Header name"
                          className="flex-1"
                        />
                        <Input
                          value={header.value}
                          onChange={(e) => updateHeader(index, "value", e.target.value)}
                          placeholder="Value"
                          className="flex-1"
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeHeader(index)} className="h-10 w-10">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addHeader} className="mt-2">
                      Add Header
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="body" className="p-4 border rounded-md mt-2">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Label>Format:</Label>
                      <div className="flex rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-700">
                        <Button
                          variant={bodyFormat === "json" ? "secondary" : "ghost"}
                          size="sm"
                          onClick={() => setBodyFormat("json")}
                          className="rounded-none border-r border-zinc-200 dark:border-zinc-700 h-8"
                        >
                          <span className="text-xs">JSON</span>
                        </Button>
                        <Button
                          variant={bodyFormat === "text" ? "secondary" : "ghost"}
                          size="sm"
                          onClick={() => setBodyFormat("text")}
                          className="rounded-none h-8"
                        >
                          <span className="text-xs">Text</span>
                        </Button>
                      </div>
                    </div>
                    <div className="h-64 border rounded-md">
                      <Editor
                        language={bodyFormat === "json" ? "json" : "plaintext"}
                        value={requestBody}
                        onChange={(value) => value !== undefined && setRequestBody(value)}
                        theme={theme === "dark" ? "vs-dark" : "light"}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          lineNumbers: "on",
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          tabSize: 2,
                          wordWrap: "on",
                        }}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-300 dark:border-red-800">
            <CardHeader className="pb-2 bg-red-50 dark:bg-red-900/20">
              <CardTitle className="text-lg text-red-700 dark:text-red-300">Error</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </CardContent>
          </Card>
        )}

        {response && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Response</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(response.statusCode)}>{response.statusCode}</Badge>
                  <Badge variant="outline">{Math.round(response.elapsedTime)}ms</Badge>
                  <Badge variant="outline">{(response.size / 1024).toFixed(2)} KB</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <Accordion type="single" collapsible defaultValue="body">
                <AccordionItem value="body">
                  <AccordionTrigger>Response Body</AccordionTrigger>
                  <AccordionContent>
                    <div className="mt-2 border rounded-md overflow-hidden">
                      {response.contentType.includes("application/json") ? (
                        <SyntaxHighlighter
                          language="json"
                          style={theme === "dark" ? vscDarkPlus : vs}
                          customStyle={{ margin: 0, borderRadius: 0 }}
                        >
                          {response.responseBody}
                        </SyntaxHighlighter>
                      ) : (
                        <div className="p-4 whitespace-pre-wrap font-mono text-sm">{response.responseBody}</div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="headers">
                  <AccordionTrigger>Response Headers</AccordionTrigger>
                  <AccordionContent>
                    <div className="mt-2 border rounded-md overflow-hidden">
                      <div className="divide-y">
                        {Object.entries(response.responseHeaders).map(([key, value]) => (
                          <div key={key} className="flex py-2 px-4">
                            <div className="font-medium w-1/3">{key}</div>
                            <div className="text-zinc-600 dark:text-zinc-400">{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}