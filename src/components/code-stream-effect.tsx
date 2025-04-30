"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { cn } from "@/utils"

interface CodeStreamEffectProps {
  code: string
  language?: string
  className?: string
  speed?: number
  onComplete?: () => void
}

export const CodeStreamEffect: React.FC<CodeStreamEffectProps> = ({
  code,
  language = "typescript",
  className,
  speed = 10,
  onComplete,
}) => {
  const [displayedCode, setDisplayedCode] = useState("")
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (!code) return

    let currentIndex = 0
    setDisplayedCode("")
    setIsComplete(false)

    const interval = setInterval(() => {
      if (currentIndex < code.length) {
        setDisplayedCode((prev) => prev + code[currentIndex])
        currentIndex++
      } else {
        clearInterval(interval)
        setIsComplete(true)
        onComplete?.()
      }
    }, speed)

    return () => clearInterval(interval)
  }, [code, speed, onComplete])

  return (
    <div className={cn("code-stream-container relative font-mono", className)}>
      <pre className={`language-${language} overflow-x-auto p-4 rounded-md bg-gray-900 text-gray-100`}>
        <code>{displayedCode}</code>
        {!isComplete && <span className="cursor inline-block w-2 h-4 bg-white ml-1 animate-blink"></span>}
      </pre>
    </div>
  )
}

export default CodeStreamEffect
