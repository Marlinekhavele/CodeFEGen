"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Loader2 } from "lucide-react"

interface CreateEndpointModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    endpointPath: string
    httpMethod: string
    description: string
  }) => Promise<void> | void
}

export function CreateEndpointModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateEndpointModalProps) {
  const [endpointPath, setEndpointPath] = useState("")
  const [httpMethod, setHttpMethod] = useState("GET")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pathError, setPathError] = useState("")

  if (!isOpen) return null

  // Custom validation function for endpoint path
  const validateEndpointPath = (path: string) => {
    // Allow letters, numbers, hyphens, underscores, and forward slashes
    const validPathRegex = /^[a-zA-Z0-9\-_\/]+$/
    if (!validPathRegex.test(path)) {
      setPathError("Only letters, numbers, hyphens, underscores, and forward slashes allowed")
      return false
    }
    
    // Additional validation rules if needed
    // For example, no consecutive slashes
    if (path.includes("//")) {
      setPathError("Consecutive forward slashes are not allowed")
      return false
    }
    
    // Path looks good
    setPathError("")
    return true
  }

  const handleEndpointPathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPath = e.target.value
    setEndpointPath(newPath)
    
    // Validate as user types, but don't show error until they've typed something
    if (newPath) {
      validateEndpointPath(newPath)
    } else {
      setPathError("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate before submission
    if (!validateEndpointPath(endpointPath)) {
      return
    }
    
    setIsSubmitting(true)
    try {
      await onSubmit({
        endpointPath,
        httpMethod,
        description,
      })
      // Reset form on success
      setEndpointPath("")
      setHttpMethod("GET")
      setDescription("")
      setPathError("")
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-zinc-950 rounded-lg p-6 w-[400px]">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">
          Create New Endpoint
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Endpoint Path
            </label>
            <div className="flex items-center mt-1">
              <span className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-l-md border border-r-0 border-zinc-300 dark:border-zinc-700 text-sm">
                /api/
              </span>
              <input
                type="text"
                value={endpointPath}
                onChange={handleEndpointPathChange}
                placeholder="users"
                className={`flex-1 p-2 border ${pathError ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'} rounded-r-md dark:bg-zinc-800 dark:text-zinc-200`}
                required
              />
            </div>
            {pathError && (
              <p className="mt-1 text-sm text-red-500">{pathError}</p>
            )}
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Example: users/profile or products/{"{id}"}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              HTTP Method
            </label>
            <select
              value={httpMethod}
              onChange={(e) => setHttpMethod(e.target.value)}
              className="w-full mt-1 p-2 border border-zinc-300 rounded-md dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this endpoint do?"
              className="w-full mt-1 p-2 border border-zinc-300 rounded-md dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#7dff00] hover:bg-[#9aff33] text-black dark:bg-[#7dff00] dark:hover:bg-[#9aff33] dark:text-black"
              disabled={isSubmitting || !!pathError}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Endpoint"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}