"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Copy, Play, Save, Trash2, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"

interface ProjectHeaderProps {
  projectName: string
  urlFriendlyName: string
  templateId?: string
  isGenerating: boolean
  onCopyCode: () => void
  onDeleteFile: () => void
  onDownloadFile: () => void
  onSaveFile: () => void
  onRunMigrations?: () => void
  hasPendingMigrations?: boolean
}

export function ProjectHeader({
  projectName,
  urlFriendlyName,
  templateId,
  isGenerating,
  onCopyCode,
  onDeleteFile,
  onDownloadFile,
  onSaveFile,
  onRunMigrations,
  hasPendingMigrations,
}: ProjectHeaderProps) {
  // Display template info if available
  const getTemplateInfo = () => {
    if (!templateId) return null

    return (
      <div className="mb-2 flex items-center">
        <span className="text-xs px-2 py-1 rounded font-medium bg-[#7dff00]/20 text-[#7dff00]">
          Template: {templateId}
        </span>
      </div>
    )
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-zinc-100/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/codeBE-logo.png" alt="CodeBEgen Logo" width={30} height={30} />
              <span className="text-xl font-bold text-[#7dff00] dark:text-[#7dff00]">CodeBEGen</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between m-3 gap-3">
        <div className="flex flex-wrap items-center gap-4 mb-2 sm:mb-0">
          <Link
            href="/create-backend"
            className="inline-flex items-center gap-2 text-zinc-600 hover:text-[#7dff00] dark:text-zinc-400 dark:hover:text-[#7dff00]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="text-xl sm:text-2xl font-medium text-zinc-900 dark:text-white truncate max-w-[200px] sm:max-w-full">
            {projectName}
          </h1>
          {isGenerating && (
            <span className="text-xs bg-[#7dff00]/20 text-[#7dff00] px-2 py-1 rounded-full animate-pulse">
              Generating code...
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-zinc-300 bg-white text-zinc-700 hover:bg-[#7dff00] hover:text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-[#7dff00] dark:hover:text-black"
                  onClick={onCopyCode}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Copy</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-white">Copy code to clipboard</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-zinc-300 bg-white text-zinc-700 hover:bg-[#7dff00] hover:text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-[#7dff00] dark:hover:text-black"
                  onClick={onDeleteFile}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-white">Delete current file</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-zinc-300 bg-white text-zinc-700 hover:bg-[#7dff00] hover:text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-[#7dff00] dark:hover:text-black"
                  onClick={onDownloadFile}
                >
                  <Play className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-white">Download your backend files</p>
              </TooltipContent>
            </Tooltip>

            {onRunMigrations && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`border-zinc-300 bg-white text-zinc-700 hover:bg-[#7dff00] hover:text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-[#7dff00] dark:hover:text-black ${
                      hasPendingMigrations ? "border-[#7dff00]/50 animate-pulse" : ""
                    }`}
                    onClick={onRunMigrations}
                  >
                    <Database className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Run Migrations</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-white">Apply database migrations</p>
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  className="border-zinc-300 bg-white text-zinc-700 hover:bg-[#7dff00] hover:text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-[#7dff00] dark:hover:text-black"
                  onClick={onSaveFile}
                >
                  <Save className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Save</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-white">Save changes</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Project URL Display */}
      <div className="mb-4 p-3 bg-white border border-zinc-200 rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between dark:bg-zinc-900 dark:border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center mb-2 sm:mb-0 w-full sm:w-auto">
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mr-2 mb-1 sm:mb-0">Project URL:</span>
          <code className="text-xs sm:text-sm bg-zinc-100 px-2 py-1 rounded text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 w-full sm:w-auto overflow-x-auto">
            https://api.codebegen.com/{urlFriendlyName}
          </code>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-zinc-500 hover:bg-[#7dff00] hover:text-black dark:text-zinc-400 dark:hover:bg-[#7dff00] dark:hover:text-black mt-2 sm:mt-0"
          onClick={() => {
            navigator.clipboard.writeText(`https://api.codebegen.com/${urlFriendlyName}`)
            toast({
              title: "URL copied",
              description: "The project URL has been copied to your clipboard.",
            })
          }}
        >
          Copy
        </Button>
      </div>

      {/* Display template info if available */}
      {getTemplateInfo()}
    </>
  )
}
