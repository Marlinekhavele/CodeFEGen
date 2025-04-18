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

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
                onChange={(e) => setEndpointPath(e.target.value)}
                placeholder="users"
                className="flex-1 p-2 border border-zinc-300 dark:border-zinc-700 rounded-r-md dark:bg-zinc-800 dark:text-zinc-200"
                required
                pattern="[a-zA-Z0-9-/]+"
                title="Only letters, numbers, hyphens and forward slashes allowed"
              />
            </div>
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
              disabled={isSubmitting}
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