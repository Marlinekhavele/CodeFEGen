"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted before rendering to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle theme toggle with immediate effect
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)

    // Force immediate application of theme
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 hover:text-white dark:border-zinc-700 dark:bg-white dark:text-zinc-800 dark:hover:bg-zinc-100"
      onClick={toggleTheme}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
