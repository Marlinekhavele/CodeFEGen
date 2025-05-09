"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Copy, RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface MigrationLogProps {
  logs: string[]
  isOpen: boolean
  onClose: () => void
  status: "idle" | "running" | "success" | "error"
  title?: string
}

export function MigrationLog({ logs, isOpen, onClose, status, title = "Migration Logs" }: MigrationLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  const colorizeLog = (log: string) => {
    // Specially highlight table creation events
    if ((log.toLowerCase().includes("table") && 
        !log.toLowerCase().includes("already exists") && 
        !log.toLowerCase().includes("no new tables")) || 
        log.toLowerCase().includes("table created")) {
      return "text-green-600 dark:text-green-400 font-bold"
    }
    
    // Regular colorization
    if (log.toLowerCase().includes("error") || log.toLowerCase().includes("failed")) {
      return "text-red-500 dark:text-red-400"
    }
    if (log.toLowerCase().includes("success") || log.toLowerCase().includes("completed")) {
      return "text-green-500 dark:text-green-400"
    }
    if (log.toLowerCase().includes("warning") || log.toLowerCase().includes("warn")) {
      return "text-yellow-500 dark:text-yellow-400"
    }
    if (log.toLowerCase().includes("info")) {
      return "text-blue-500 dark:text-blue-400"
    }
    
    // Highlight table-related messages in a subtle way
    if (log.toLowerCase().includes("table")) {
      return "text-purple-500 dark:text-purple-400"
    }
    
    return "text-zinc-700 dark:text-zinc-300"
  }

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs, isOpen])

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(timeout)
    }
  }, [copied])

  if (!isOpen) return null

  const copyLogs = () => {
    navigator.clipboard.writeText(logs.join("\n"))
    setCopied(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-scroll">
      <Card className="w-full max-w-3xl max-h-[80vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <CardTitle>{title}</CardTitle>
            <Badge
              variant="outline"
              className={cn(
                "ml-2",
                status === "running" && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
                status === "success" && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
                status === "error" && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
              )}
            >
              {status === "running" && (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Running
                </>
              )}
              {status === "success" && (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Success
                </>
              )}
              {status === "error" && (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Failed
                </>
              )}
              {status === "idle" && (
                <>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Idle
                </>
              )}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          <div
            ref={scrollRef}
            className="bg-zinc-100 dark:bg-zinc-900 rounded-md p-4 h-[400px] overflow-hidden font-mono text-sm"
          >
            {logs.length === 0 ? (
              <div className="text-zinc-500 dark:text-zinc-400 italic">No logs available yet...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className={`whitespace-pre-wrap break-words ${colorizeLog(log)}`}>
                  {log}
                </div>
              ))
            )}

            {/* Blinking cursor */}
            {status === "running" && (
              <div className="h-4 w-2 bg-zinc-800 dark:bg-zinc-300 animate-blink inline-block mt-1" />
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            {logs.length} {logs.length === 1 ? "line" : "lines"}
          </div>
          <Button variant="outline" size="sm" onClick={copyLogs} disabled={logs.length === 0}>
            {copied ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Logs
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
