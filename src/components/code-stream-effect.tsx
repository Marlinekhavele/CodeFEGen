"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
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
  speed = 50, 
  onComplete,
}) => {
  const [displayedCode, setDisplayedCode] = useState("")
  const [isCompleteInternal, setIsCompleteInternal] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const currentIndexRef = useRef(0)
  const currentIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Memoize the onComplete callback to prevent unnecessary re-renders
  const onCompleteCallback = useCallback(() => {
    setIsCompleteInternal(true)
    onComplete?.()
  }, [onComplete])

  useEffect(() => {
    // Cleanup previous interval
    if (currentIntervalRef.current) {
      clearInterval(currentIntervalRef.current)
      currentIntervalRef.current = null
    }

    // Reset if no code
    if (!code) {
      setDisplayedCode("")
      currentIndexRef.current = 0
      setIsCompleteInternal(true)
      onCompleteCallback()
      return
    }

    // Reset if code has changed or shortened
    if (code.length < currentIndexRef.current || 
        (currentIndexRef.current > 0 && !code.startsWith(displayedCode.substring(0, currentIndexRef.current)))) {
      setDisplayedCode("")
      currentIndexRef.current = 0
      setIsCompleteInternal(false)
    }

    // If animation is already complete
    if (currentIndexRef.current >= code.length) {
      setDisplayedCode(code)
      if (!isCompleteInternal) {
        onCompleteCallback()
      }
      return
    }

    // Start the animation
    currentIntervalRef.current = setInterval(() => {
      if (currentIndexRef.current < code.length) {
        setDisplayedCode(code.substring(0, currentIndexRef.current + 1))
        currentIndexRef.current++

        // Scroll to bottom
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight
        }
      } else {
        if (currentIntervalRef.current) {
          clearInterval(currentIntervalRef.current)
          currentIntervalRef.current = null
        }
        if (!isCompleteInternal) {
          onCompleteCallback()
        }
      }
    }, speed)

    return () => {
      if (currentIntervalRef.current) {
        clearInterval(currentIntervalRef.current)
        currentIntervalRef.current = null
      }
    }
  }, [code, speed, onCompleteCallback])

  return (
    <div ref={containerRef} className={cn("code-stream-container relative font-mono overflow-auto", className)}>
      <pre className={`language-${language} overflow-x-auto p-4 rounded-md bg-gray-900 text-gray-100`}>
        <code>{displayedCode}</code>
        {!isCompleteInternal && code && <span className="code-cursor animate-blink"></span>}
      </pre>
    </div>
  )
}

export default CodeStreamEffect