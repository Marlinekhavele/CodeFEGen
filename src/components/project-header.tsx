"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Copy, Play, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip"
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
}

export function ProjectHeader({
  projectName,
  urlFriendlyName,
  templateId,
  isGenerating,
  onCopyCode,
  onDeleteFile,
  onDownloadFile,
  onSaveFile
}: ProjectHeaderProps) {
  // Display template info if available
  const getTemplateInfo = () => {
    if (!templateId) return null;
    
    return (
      <div className="mb-2 flex items-center">
        <span className="text-xs px-2 py-1 rounded font-medium bg-[#7dff00]/20 text-[#7dff00]">
          Template: {templateId}
        </span>
      </div>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-zinc-100/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/codeBE-logo.png"
                alt="CodeBEgen Logo"
                width={30}
                height={30}
              />
              <span className="text-xl font-bold text-[#7dff00] dark:text-[#7dff00]">CodeBEGen</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/create-backend"
            className="inline-flex items-center gap-2 text-zinc-600 hover:text-[#7dff00] dark:text-zinc-400 dark:hover:text-[#7dff00]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="text-2xl font-medium text-zinc-900 dark:text-white">{projectName}</h1>
          {isGenerating && (
            <span className="text-xs bg-[#7dff00]/20 text-[#7dff00] px-2 py-1 rounded-full animate-pulse">
              Generating code...
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  onClick={onCopyCode}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy code to clipboard</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  onClick={onDeleteFile}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete current file</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  onClick={onDownloadFile}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download your backend files</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  className="bg-[#7dff00] text-black hover:bg-[#9aff33] dark:bg-[#7dff00] dark:text-black dark:hover:bg-[#9aff33]"
                  onClick={onSaveFile}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save changes</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Project URL Display */}
      <div className="mb-4 p-3 bg-white border border-zinc-200 rounded-md flex items-center justify-between dark:bg-zinc-900 dark:border-zinc-800">
        <div className="flex items-center">
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mr-2">Project URL:</span>
          <code className="text-sm bg-zinc-100 px-2 py-1 rounded text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
            https://api.codebegen.com/{urlFriendlyName}
          </code>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
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