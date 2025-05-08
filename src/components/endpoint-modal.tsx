"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { languages, frameworks } from "./create-backend/options"
import { Loader2 } from "lucide-react"

type EndpointDetails = {
  language: string
  framework: string
  endpointPath: string
  method: string
  description: string
}

interface EndpointModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (details: EndpointDetails) => void
  projectLanguage?: string
  projectFramework?: string
  isLoading?: boolean
}

export function EndpointModal({
  isOpen,
  onClose,
  onSubmit,
  projectLanguage = "python",
  projectFramework = "FastAPI",
  isLoading = false,
}: EndpointModalProps) {
  const [language, setLanguage] = useState<string>(projectLanguage)
  const [framework, setFramework] = useState<string>(projectFramework)
  const [endpointPath, setEndpointPath] = useState<string>("/api/")
  const [method, setMethod] = useState<string>("GET")
  const [description, setDescription] = useState<string>("")
  const [internalOpen, setInternalOpen] = useState(isOpen)

  // Sync internal state with props
  useEffect(() => {
    setInternalOpen(isOpen || isLoading)
  }, [isOpen, isLoading])

  // Reset fields when modal opens
  useEffect(() => {
    if (isOpen) {
      setLanguage(projectLanguage)
      setFramework(projectFramework)
      setEndpointPath("/api/")
      setMethod("GET")
      setDescription("")
    }
  }, [isOpen, projectLanguage, projectFramework])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setInternalOpen(true)
    onSubmit({
      language,
      framework,
      endpointPath,
      method,
      description,
    })
  }

  const resetForm = () => {
    setLanguage(projectLanguage)
    setFramework(projectFramework)
    setEndpointPath("/api/")
    setMethod("GET")
    setDescription("")
  }

  const handleLanguageChange = (value: string) => {
    setLanguage(value)
    const languageFrameworks = frameworks[value as keyof typeof frameworks]
    if (languageFrameworks && languageFrameworks.length > 0) {
      setFramework(languageFrameworks[0].value)
    }
  }

  return (
    <Dialog
      open={internalOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) {
          setInternalOpen(false)
          onClose()
          resetForm()
        } else {
          setInternalOpen(true)
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px] overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-md">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
              <span className="text-white font-medium">Creating Endpoint...</span>
            </div>
          </div>
        )}
        <DialogHeader>
          <DialogTitle>Create New Endpoint</DialogTitle>
          <DialogDescription>
            Enter the technical details for your new endpoint. You will be able to describe its functionality in the AI
            chat afterwards.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className={isLoading ? "opacity-30 pointer-events-none" : ""}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={handleLanguageChange} disabled={isLoading}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="framework">Framework</Label>
                <Select value={framework} onValueChange={setFramework} disabled={!language || isLoading}>
                  <SelectTrigger id="framework">
                    <SelectValue placeholder="Select framework" />
                  </SelectTrigger>
                  <SelectContent>
                    {language &&
                      frameworks[language as keyof typeof frameworks]?.map((fw) => (
                        <SelectItem key={fw.value} value={fw.value}>
                          {fw.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="method">Method</Label>
                <Select value={method} onValueChange={setMethod} disabled={isLoading}>
                  <SelectTrigger id="method">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endpoint-path">Endpoint Path</Label>
                <Input
                  id="endpoint-path"
                  value={endpointPath}
                  onChange={(e) => setEndpointPath(e.target.value)}
                  placeholder="eg. /api/users"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="A brief description of what this endpoint does"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none h-20"
                disabled={isLoading}
              />
              <p className="text-xs text-zinc-500 mt-1">This is for documentation purposes only.</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!isLoading) {
                  onClose()
                  resetForm()
                }
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#7dff00] text-black hover:bg-[#9aff33]"
              disabled={!endpointPath.trim() || isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 text-black animate-spin" />
                  <span>Creating...</span>
                </div>
              ) : (
                "Create Endpoint"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}