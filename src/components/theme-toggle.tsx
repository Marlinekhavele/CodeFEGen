'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/theme-provider' // adjust path if needed
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { toggleTheme, theme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative rounded-full border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 hover:text-white dark:border-zinc-300 dark:bg-zinc-200 dark:text-zinc-800 dark:hover:bg-zinc-100"
      onClick={toggleTheme}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
