import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Database, Server, Play, Download, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Backend Editor - CodeBEGen",
  description: "Edit and manage your generated backend code",
}

export default function BackendEditor() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-900 text-zinc-100 dark:bg-zinc-950">
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm dark:bg-zinc-950/80">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/codeBE-logo-28i3MSrg38VV5t71KZaV9P29xWpbJf.png"
                alt="CodeBEGen Logo"
                width={36}
                height={36}
              />
              <span className="text-xl font-bold text-[#7dff00] dark:text-[#7dff00]">CodeBEGen</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button className="rounded-md bg-[#7dff00] text-black hover:bg-[#9aff33] dark:bg-[#7dff00] dark:text-black dark:hover:bg-[#9aff33]">
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link
                href="/create-backend"
                className="inline-flex items-center gap-2 text-zinc-400 hover:text-[#7dff00]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
              <h1 className="text-2xl font-bold text-white">My Awesome Backend</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Deploy
              </Button>
              <Button size="sm" className="bg-[#7dff00] text-black hover:bg-[#9aff33]">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-[280px_1fr] gap-6 h-[calc(100vh-220px)]">
            {/* Sidebar */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 dark:bg-zinc-950 overflow-hidden">
              <div className="p-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-[#7dff00]" />
                  <span className="font-medium text-zinc-100">Project Files</span>
                </div>
              </div>

              <div className="p-2">
                <div className="p-2 bg-zinc-800/50 rounded-md mb-2">
                  <div className="flex items-center gap-2 text-[#7dff00] font-medium text-sm mb-2">
                    <Server className="h-4 w-4" />
                    Endpoints
                  </div>

                  <div className="space-y-1 ml-6">
                    <div className="flex items-center justify-between rounded-md bg-[#7dff00]/20 px-2 py-1.5 text-sm text-[#7dff00]">
                      <div className="flex items-center gap-2">
                        <div className="text-xs px-1.5 py-0.5 rounded font-medium bg-blue-500/20 text-blue-400">
                          POST
                        </div>
                        <span>/auth/login</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800">
                      <div className="flex items-center gap-2">
                        <div className="text-xs px-1.5 py-0.5 rounded font-medium bg-green-500/20 text-green-400">
                          GET
                        </div>
                        <span>/users</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800">
                      <div className="flex items-center gap-2">
                        <div className="text-xs px-1.5 py-0.5 rounded font-medium bg-yellow-500/20 text-yellow-400">
                          PUT
                        </div>
                        <span>/users/:id</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-2 hover:bg-zinc-800/50 rounded-md">
                  <div className="flex items-center gap-2 text-zinc-300 font-medium text-sm">
                    <Database className="h-4 w-4 text-[#7dff00]" />
                    Models
                  </div>
                </div>

                <div className="p-2 hover:bg-zinc-800/50 rounded-md">
                  <div className="flex items-center gap-2 text-zinc-300 font-medium text-sm">
                    <Server className="h-4 w-4 text-[#7dff00]" />
                    Database
                  </div>
                </div>

                <div className="p-2 hover:bg-zinc-800/50 rounded-md">
                  <div className="flex items-center gap-2 text-zinc-300 font-medium text-sm">
                    <Server className="h-4 w-4 text-[#7dff00]" />
                    Configuration
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col rounded-lg border border-zinc-800 overflow-hidden">
              <Tabs defaultValue="code" className="flex-1">
                <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2 bg-zinc-900 dark:bg-zinc-950">
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-medium px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">POST</div>
                    <span className="text-sm font-medium text-zinc-200">/auth/login</span>
                  </div>

                  <TabsList className="h-9 bg-zinc-800">
                    <TabsTrigger
                      value="code"
                      className="text-xs data-[state=active]:bg-[#7dff00] data-[state=active]:text-black"
                    >
                      Code
                    </TabsTrigger>
                    <TabsTrigger
                      value="test"
                      className="text-xs data-[state=active]:bg-[#7dff00] data-[state=active]:text-black"
                    >
                      Test
                    </TabsTrigger>
                    <TabsTrigger
                      value="docs"
                      className="text-xs data-[state=active]:bg-[#7dff00] data-[state=active]:text-black"
                    >
                      Docs
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="code" className="flex-1 p-0 data-[state=active]:flex bg-zinc-950">
                  <div className="w-full h-full" id="monaco-editor-container">
                    {/* Monaco Editor will be mounted here via client component */}
                    <iframe
                      src="/create-backend/backend-editor/editor"
                      className="w-full h-full border-0"
                      title="Code Editor"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="test" className="bg-zinc-950 p-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-zinc-100">Test Endpoint</h3>
                    <p className="text-sm text-zinc-400">
                      Test your endpoint with different parameters and see the response.
                    </p>

                    <div className="rounded-md border border-zinc-800 bg-zinc-900 p-4">
                      <h4 className="text-sm font-medium text-zinc-200 mb-2">Request Body</h4>
                      <div className="bg-zinc-950 rounded-md p-4 font-mono text-sm text-zinc-300">
                        {`{
  "email": "user@example.com",
  "password": "securepassword123"
}`}
                      </div>

                      <div className="mt-4 flex justify-end">
                        <Button size="sm" className="bg-[#7dff00] text-black hover:bg-[#9aff33]">
                          Send Request
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="docs" className="bg-zinc-950 p-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-zinc-100">API Documentation</h3>
                    <p className="text-sm text-zinc-400">Automatically generated documentation for this endpoint.</p>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-zinc-200 mb-1">Endpoint</h4>
                        <p className="text-sm text-zinc-400">
                          <span className="text-blue-400 font-medium">POST</span> /auth/login
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-zinc-200 mb-1">Description</h4>
                        <p className="text-sm text-zinc-400">
                          Authenticates a user and returns a JWT token if credentials are valid.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-zinc-200 mb-1">Request Body</h4>
                        <div className="bg-zinc-900 rounded-md p-3 font-mono text-xs text-zinc-300">
                          {`{
  "email": "string", // Required. User's email address
  "password": "string" // Required. User's password
}`}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-zinc-200 mb-1">Responses</h4>
                        <div className="space-y-2">
                          <div className="bg-green-500/10 border border-green-500/20 rounded-md p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-green-400">200 OK</span>
                            </div>
                            <div className="font-mono text-xs text-zinc-300">
                              {`{
  "message": "Login successful",
  "token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string"
  }
}`}
                            </div>
                          </div>

                          <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-red-400">400 Bad Request</span>
                            </div>
                            <div className="font-mono text-xs text-zinc-300">
                              {`{
  "error": "Email and password are required"
}`}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
