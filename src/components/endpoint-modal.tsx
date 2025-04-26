"use client"

import React, { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { languages, frameworks } from "./create-backend/options"

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
}

export function EndpointModal({ isOpen, onClose, onSubmit, projectLanguage = "python", projectFramework = "FastAPI" }: EndpointModalProps) {
  const [language, setLanguage] = useState<string>(projectLanguage)
  const [framework, setFramework] = useState<string>(projectFramework)
  const [endpointPath, setEndpointPath] = useState<string>("/api/")
  const [method, setMethod] = useState<string>("GET")
  const [description, setDescription] = useState<string>("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      language,
      framework,
      endpointPath,
      method,
      description
    })
    resetForm()
  }

  const resetForm = () => {
    setLanguage(projectLanguage)
    setFramework(projectFramework)
    setEndpointPath("users")
    setMethod("POST")
    setDescription("")
  }

  const handleLanguageChange = (value: string) => {
    setLanguage(value)
    // Reset framework to the first option of the new language
    const languageFrameworks = frameworks[value as keyof typeof frameworks]
    if (languageFrameworks && languageFrameworks.length > 0) {
      setFramework(languageFrameworks[0].value)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose()
        resetForm()
      }
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Endpoint</DialogTitle>
          <DialogDescription>
            Enter the details for your new endpoint. The AI will generate code based on these specifications.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={handleLanguageChange}>
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
                <Select 
                  value={framework} 
                  onValueChange={setFramework}
                  disabled={!language}
                >
                  <SelectTrigger id="framework">
                    <SelectValue placeholder="Select framework" />
                  </SelectTrigger>
                  <SelectContent>
                    {language && frameworks[language as keyof typeof frameworks]?.map((fw) => (
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
                <Select value={method} onValueChange={setMethod}>
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
                  placeholder="eg. login"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this endpoint should do..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none h-20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                onClose()
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-[#7dff00] text-black hover:bg-[#9aff33]"
              disabled={!endpointPath.trim() || !description.trim()}
            >
              Generate
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}