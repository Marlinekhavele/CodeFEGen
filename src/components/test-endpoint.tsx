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
import createAxiosInstance from "@/app/api/services/axiosInstance"

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

// New interface for structured error responses
type ErrorDetails = {
  status_code?: number
  status?: boolean
  message?: string
  detail?: string
  [key: string]: any 
}

export function TestEndpoint({ method, endpoint, projectId, theme }: TestEndpointProps) {
  const [endpointUrl, setEndpointUrl] = useState(`http://${projectId}${endpoint}`)
  const [httpMethod, setHttpMethod] = useState(method)
  const [headers, setHeaders] = useState<RequestHeader[]>([{ key: "", value: "" }])
  const [queryParams, setQueryParams] = useState<QueryParam[]>([{ key: "", value: "" }])
  const [requestBody, setRequestBody] = useState("")
  const [activeTab, setActiveTab] = useState<"params" | "headers" | "body">("params")
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<TestResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<ErrorDetails | null>(null)
  const [bodyFormat, setBodyFormat] = useState<"json" | "text">("json")
  // New state for terminal mode
  const [terminalMode, setTerminalMode] = useState(true) 

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
    setErrorDetails(null) // Reset error details

    try {
      // Create axios instance
      const axios = createAxiosInstance('/test-endpoint');

      // Build headers object from array
      const headersObj: Record<string, string> = {}
      headers.forEach((header) => {
        if (header.key) {
          headersObj[header.key] = header.value
        }
      })

      // Add content-type header if not present
      if (!headersObj["Content-Type"] && requestBody) {
        headersObj["Content-Type"] = bodyFormat === "json" ? "application/json" : "text/plain"
      }

      // Build query parameters
      const queryParamsObj: Record<string, string> = {}
      queryParams.forEach((param) => {
        if (param.key) {
          queryParamsObj[param.key] = param.value
        }
      })

      // Parse request body based on format
      let parsedBody = requestBody
      if (bodyFormat === "json" && requestBody) {
        try {
          // Validate JSON
          JSON.parse(requestBody)
          parsedBody = requestBody
        } catch (e) {
          setError("Invalid JSON in request body")
          setIsLoading(false)
          return
        }
      }

      // Prepare request payload
      const payload = {
        endpointUrl,
        httpMethod,
        headers: headersObj,
        queryParams: queryParamsObj,
        requestBody: parsedBody ? JSON.parse(parsedBody) : undefined,
      }

      // Send request to the new API endpoint
      const result = await axios.post(`project/${projectId}`, payload);

      // Process response
      if (result.data && result.data.success) {
        const responseData = result.data.data

        // Create response object
        const testResponse: TestResponse = {
          request_id: responseData.request_id || Math.random().toString(36).substring(2, 15),
          success: responseData.success,
          statusCode: responseData.statusCode,
          responseBody:
            typeof responseData.responseBody === "object"
              ? JSON.stringify(responseData.responseBody, null, 2)
              : responseData.responseBody,
          responseHeaders: responseData.responseHeaders || {},
          elapsedTime: responseData.timeTaken * 1000 || 0, // Convert to ms
          size: responseData.size || 0,
          contentType: responseData.contentType || "unknown",
          cookies: responseData.cookies,
          redirects: responseData.redirects,
          timestamp: responseData.timestamp || new Date().toISOString(),
        }

        setResponse(testResponse)
      } else {
        // Extract structured error details if available
        if (result.data) {
          setErrorDetails({
            status_code: result.data.status_code,
            status: result.data.status,
            message: result.data.message,
            detail: result.data.detail
          });
        }
        throw new Error(result.data?.message || "Failed to test endpoint")
      }
    } catch (err: any) {
      console.error("Error testing endpoint:", err)
      
      // Try to extract error details from the response if available
      if (err.response?.data) {
        setErrorDetails({
          status_code: err.response.data.status_code || err.response.status,
          status: err.response.data.status !== undefined ? err.response.data.status : false,
          message: err.response.data.message || err.message,
          detail: err.response.data.detail || null
        });
      }
      
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
    <div className={`flex flex-col h-full overflow-hidden ${terminalMode ? 'font-mono' : ''}`}>
      <div className={`flex flex-col p-4 space-y-4 overflow-auto scrollable ${
        terminalMode ? 'bg-zinc-900 text-green-400 dark:bg-black' : ''
      }`}>
        {/* Terminal header with toggle */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className={`h-3 w-3 rounded-full ${terminalMode ? 'bg-red-500' : 'bg-red-200'} mr-2`}></div>
            <div className={`h-3 w-3 rounded-full ${terminalMode ? 'bg-yellow-500' : 'bg-yellow-200'} mr-2`}></div>
            <div className={`h-3 w-3 rounded-full ${terminalMode ? 'bg-green-500' : 'bg-green-200'} mr-2`}></div>
            <span className={terminalMode ? 'text-white text-sm ml-2' : 'text-sm ml-2'}>API-Terminal</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setTerminalMode(!terminalMode)}
            className={terminalMode ? 'text-gray-400 hover:text-white' : ''}
          >
            {terminalMode ? "Standard View" : "Terminal View"}
          </Button>
        </div>

        <Card className={terminalMode ? 'border-green-500/30 bg-zinc-800 shadow-lg shadow-green-500/10' : ''}>
          <CardHeader className={terminalMode ? 'pb-2 border-b border-green-500/30 bg-zinc-900' : 'pb-2'}>
            <CardTitle className={terminalMode ? 'text-lg text-green-400' : 'text-lg'}>
              {terminalMode && '> '}Test Endpoint
            </CardTitle>
            <CardDescription className={terminalMode ? 'text-gray-400 text-sm' : ''}>
              {terminalMode && '$ '}Test an API endpoint by sending an HTTP request to the specified URL.
            </CardDescription>
          </CardHeader>
          <CardContent className={terminalMode ? 'pt-4 text-green-300' : ''}>
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="endpoint-url" className={terminalMode ? 'text-gray-400' : ''}>
                  {terminalMode && '$ '}Endpoint URL
                </Label>
                <div className="flex space-x-2">
                  <div className="w-24">
                    <select
                      className={`w-full h-10 px-3 py-2 text-sm border rounded-md ${
                        terminalMode 
                          ? 'bg-black border-green-500/50 text-green-400 focus:border-green-400 focus:ring-green-500/30' 
                          : 'border-input bg-background'
                      }`}
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
                    className={`flex-1 ${
                      terminalMode 
                        ? 'bg-black border-green-500/50 text-green-400 focus:border-green-400 placeholder:text-green-700'
                        : ''
                    }`}
                  />
                  <Button 
                    onClick={handleSendRequest} 
                    disabled={isLoading} 
                    className={`w-24 ${
                      terminalMode 
                        ? 'bg-green-700 hover:bg-green-600 text-black border border-green-500'
                        : 'text-white'
                    }`}
                  >
                    {isLoading ? (
                      <Loader2 className={`h-4 w-4 animate-spin ${terminalMode ? 'text-black' : ''}`} />
                    ) : (
                      <Send className={`h-4 w-4 mr-2 ${terminalMode ? 'text-black' : ''}`} />
                    )}
                    {isLoading ? "Sending" : "Send"}
                  </Button>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                <TabsList className={`grid w-full grid-cols-3 ${
                  terminalMode ? 'bg-zinc-800 border border-green-500/30' : ''
                }`}>
                  <TabsTrigger 
                    value="params" 
                    className={terminalMode ? 'data-[state=active]:bg-green-600 data-[state=active]:text-black' : 'tab-accent'}
                  >
                    Query Params
                  </TabsTrigger>
                  <TabsTrigger 
                    value="headers" 
                    className={terminalMode ? 'data-[state=active]:bg-green-600 data-[state=active]:text-black' : 'tab-accent'}
                  >
                    Headers
                  </TabsTrigger>
                  <TabsTrigger 
                    value="body" 
                    className={terminalMode ? 'data-[state=active]:bg-green-600 data-[state=active]:text-black' : 'tab-accent'}
                  >
                    Body
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="params" className="p-4 border rounded-md mt-2">
                  <div className="space-y-2">
                    {queryParams.map((param, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={param.key}
                          onChange={(e) => updateQueryParam(index, "key", e.target.value)}
                          placeholder="Parameter name"
                          className={`flex-1 ${
                            terminalMode 
                              ? 'bg-black border-green-500/50 text-green-400 focus:border-green-400 placeholder:text-green-700'
                              : ''
                          }`}
                        />
                        <Input
                          value={param.value}
                          onChange={(e) => updateQueryParam(index, "value", e.target.value)}
                          placeholder="Value"
                          className={`flex-1 ${
                            terminalMode 
                              ? 'bg-black border-green-500/50 text-green-400 focus:border-green-400 placeholder:text-green-700'
                              : ''
                          }`}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeQueryParam(index)}
                          className={`h-10 w-10 ${terminalMode ? 'text-green-400 hover:text-white' : ''}`}
                        >
                          <X className={`h-4 w-4 ${terminalMode ? 'text-green-400' : ''}`} />
                        </Button>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={addQueryParam} 
                      className={`mt-2 ${terminalMode ? 'border-green-500 text-green-400 hover:bg-green-600 hover:text-black' : ''}`}
                    >
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
                          className={`flex-1 ${
                            terminalMode 
                              ? 'bg-black border-green-500/50 text-green-400 focus:border-green-400 placeholder:text-green-700'
                              : ''
                          }`}
                        />
                        <Input
                          value={header.value}
                          onChange={(e) => updateHeader(index, "value", e.target.value)}
                          placeholder="Value"
                          className={`flex-1 ${
                            terminalMode 
                              ? 'bg-black border-green-500/50 text-green-400 focus:border-green-400 placeholder:text-green-700'
                              : ''
                          }`}
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeHeader(index)} 
                          className={`h-10 w-10 ${terminalMode ? 'text-green-400 hover:text-white' : ''}`}
                        >
                          <X className={`h-4 w-4 ${terminalMode ? 'text-green-400' : ''}`} />
                        </Button>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={addHeader} 
                      className={`mt-2 ${terminalMode ? 'border-green-500 text-green-400 hover:bg-green-600 hover:text-black' : ''}`}
                    >
                      Add Header
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="body" className="p-4 border rounded-md mt-2">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Label className={terminalMode ? 'text-gray-400' : ''}>Format:</Label>
                      <div className={`flex rounded-md overflow-hidden border ${
                        terminalMode ? 'border-green-500/30' : 'border-zinc-200 dark:border-zinc-700'
                      }`}>
                        <Button
                          variant={bodyFormat === "json" ? "secondary" : "ghost"}
                          size="sm"
                          onClick={() => setBodyFormat("json")}
                          className={`rounded-none border-r ${
                            terminalMode 
                              ? 'border-green-500/30 h-8 text-green-400 data-[state=active]:bg-green-600 data-[state=active]:text-black' 
                              : 'border-zinc-200 dark:border-zinc-700 h-8'
                          }`}
                        >
                          <span className="text-xs">JSON</span>
                        </Button>
                        <Button
                          variant={bodyFormat === "text" ? "secondary" : "ghost"}
                          size="sm"
                          onClick={() => setBodyFormat("text")}
                          className={`rounded-none ${
                            terminalMode 
                              ? 'h-8 text-green-400 data-[state=active]:bg-green-600 data-[state=active]:text-black' 
                              : 'h-8'
                          }`}
                        >
                          <span className="text-xs">Text</span>
                        </Button>
                      </div>
                    </div>
                    <div className={`h-64 border rounded-md ${terminalMode ? 'border-green-500/30' : ''}`}>
                      <Editor
                        language={bodyFormat === "json" ? "json" : "plaintext"}
                        value={requestBody}
                        onChange={(value) => value !== undefined && setRequestBody(value)}
                        theme={theme === "dark" ? "vs-dark" : "light"}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 12,
                          lineNumbers: "on",
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          tabSize: 2,
                          wordWrap: "on",
                        }}
                        className={terminalMode ? 'bg-black text-green-400' : ''}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Updated error card to display structured error details */}
        {error && (
          <Card className={terminalMode 
            ? 'border-red-500/30 bg-zinc-800 shadow-lg shadow-red-500/20' 
            : 'border-red-300 dark:border-red-800'
          }>
            <CardHeader className={terminalMode 
              ? 'pb-2 bg-zinc-900/80 border-b border-red-500/30' 
              : 'pb-2 bg-red-50 dark:bg-red-900/20'
            }>
              <div className="flex items-center justify-between">
                <CardTitle className={terminalMode 
                  ? 'text-lg text-red-400' 
                  : 'text-lg text-red-700 dark:text-red-300'
                }>
                  {terminalMode && '! '}Error
                </CardTitle>
                {errorDetails?.status_code && (
                  <Badge className={terminalMode 
                    ? 'bg-red-900/50 text-red-300 border border-red-500/50' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }>
                    Status {errorDetails.status_code}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className={terminalMode ? 'pt-4 text-red-300' : 'pt-4'}>
              {/* Display error message */}
              <p className={terminalMode 
                ? 'font-medium mb-2 text-red-400' 
                : 'text-red-700 dark:text-red-300 font-medium mb-2'
              }>
                {terminalMode && '$ '}{error}
              </p>
              
              {/* Display structured error details */}
              {errorDetails && (
                <div className={`mt-4 space-y-2 pt-4 text-sm ${
                  terminalMode ? 'border-t border-red-500/30' : 'border-t'
                }`}>
                  {errorDetails.message && errorDetails.message !== error && (
                    <div className="mb-2">
                      <span className={terminalMode ? 'font-medium text-gray-400' : 'font-medium'}>Message: </span>
                      <span className={terminalMode ? 'text-red-300' : ''}>{errorDetails.message}</span>
                    </div>
                  )}
                  
                  {errorDetails.detail && (
                    <div>
                      <span className={terminalMode ? 'font-medium text-gray-400' : 'font-medium'}>Details: </span>
                      <span className={`whitespace-pre-wrap font-mono ${
                        terminalMode ? 'text-red-200 text-xs bg-zinc-900/50 p-1 block mt-1 rounded border-l-2 border-red-500' : 'text-xs'
                      }`}>
                        {errorDetails.detail}
                      </span>
                    </div>
                  )}
                  
                  {/* Display any other error properties */}
                  {Object.entries(errorDetails).map(([key, value]) => {
                    // Skip already displayed fields and null/undefined values
                    if (
                      ['status_code', 'status', 'message', 'detail'].includes(key) || 
                      value === null || 
                      value === undefined
                    ) {
                      return null;
                    }
                    return (
                      <div key={key}>
                        <span className={terminalMode ? 'font-medium text-gray-400' : 'font-medium'}>
                          {key.charAt(0).toUpperCase() + key.slice(1)}:
                        </span>
                        <span className={terminalMode ? 'text-red-300 ml-2' : 'ml-2'}>
                          {typeof value === 'object' ? JSON.stringify(value) : value.toString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {response && (
          <Card className={terminalMode ? 'border-cyan-500/30 bg-zinc-800 shadow-lg shadow-cyan-500/10' : ''}>
            <CardHeader className={terminalMode ? 'pb-2 border-b border-cyan-500/30 bg-zinc-900/80' : 'pb-2'}>
              <div className="flex items-center justify-between">
                <CardTitle className={terminalMode ? 'text-lg text-cyan-400' : 'text-lg'}>
                  {terminalMode && '> '}Response
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={terminalMode 
                    ? `${response.statusCode < 400 ? 'bg-green-900/50 text-green-300 border border-green-500/50' : 'bg-red-900/50 text-red-300 border border-red-500/50'}`
                    : getStatusColor(response.statusCode)
                  }>
                    {response.statusCode}
                  </Badge>
                  <Badge variant={terminalMode ? 'outline' : 'outline'} className={terminalMode 
                    ? 'text-cyan-300 border-cyan-500/50' : ''
                  }>
                    {Math.round(response.elapsedTime)}ms
                  </Badge>
                  <Badge variant={terminalMode ? 'outline' : 'outline'} className={terminalMode 
                    ? 'text-cyan-300 border-cyan-500/50' : ''
                  }>
                    {(response.size / 1024).toFixed(2)} KB
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className={terminalMode ? 'pt-4 text-cyan-300' : 'pt-4'}>
              <Accordion type="single" collapsible defaultValue="body" className={terminalMode ? 'border-cyan-500/30' : ''}>
                <AccordionItem value="body" className={terminalMode ? 'border-cyan-500/20' : ''}>
                  <AccordionTrigger className={terminalMode ? 'text-cyan-300 hover:text-cyan-100' : ''}>
                    {terminalMode && '$ '}Response Body
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className={`mt-2 overflow-hidden ${
                      terminalMode ? 'border border-cyan-500/30 rounded-md' : 'border rounded-md'
                    }`}>
                      {response.contentType.includes("application/json") ? (
                        <SyntaxHighlighter
                          language="json"
                          style={theme === "dark" || terminalMode ? vscDarkPlus : vs}
                          customStyle={{ 
                            margin: 0, 
                            borderRadius: 0,
                            fontSize: terminalMode ? '13px' : undefined,
                            backgroundColor: terminalMode ? 'rgb(15, 15, 15)' : undefined
                          }}
                        >
                          {response.responseBody}
                        </SyntaxHighlighter>
                      ) : (
                        <div className={`p-4 whitespace-pre-wrap font-mono ${
                          terminalMode ? 'text-sm bg-zinc-900/70 text-cyan-200' : 'text-sm'
                        }`}>
                          {response.responseBody}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="headers" className={terminalMode ? 'border-cyan-500/20' : ''}>
                  <AccordionTrigger className={terminalMode ? 'text-cyan-300 hover:text-cyan-100' : ''}>
                    {terminalMode && '$ '}Response Headers
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className={`mt-2 overflow-hidden scrollable ${
                      terminalMode ? 'border border-cyan-500/30 rounded-md' : 'border rounded-md'
                    }`}>
                      <div className={terminalMode ? 'divide-y divide-cyan-900/30' : 'divide-y'}>
                        {Object.entries(response.responseHeaders).map(([key, value]) => (
                          <div key={key} className="flex py-2 px-4">
                            <div className={terminalMode ? 'font-medium w-1/3 text-gray-400' : 'font-medium w-1/3'}>
                              {key}
                            </div>
                            <div className={terminalMode ? 'text-cyan-300' : 'text-zinc-600 dark:text-zinc-400'}>
                              {value}
                            </div>
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
