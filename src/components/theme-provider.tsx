"use client"
import { createContext, useContext, useEffect, useState } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ReactNode } from "react"

interface ThemeProviderProps {
  children: ReactNode
  attribute?: string
  defaultTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
  [key: string]: any
}

// Create a context to track theme changes
const ThemeContext = createContext({ theme: "", setTheme: (theme: string) => {} })

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState(defaultTheme)

  // Force a re-render when the theme changes
  useEffect(() => {
    const htmlElement = document.documentElement
    if (theme === "dark") {
      htmlElement.classList.add("dark")
    } else {
      htmlElement.classList.remove("dark")
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <NextThemesProvider
        attribute={attribute}
        defaultTheme={defaultTheme}
        enableSystem={enableSystem}
        disableTransitionOnChange={disableTransitionOnChange}
        {...props}
      >
        {children}
      </NextThemesProvider>
    </ThemeContext.Provider>
  )
}

// Export the useTheme hook that uses both our context and next-themes
export function useTheme() {
  const context = useContext(ThemeContext)
  const { theme, setTheme } = context

  // Ensure theme changes are applied immediately
  useEffect(() => {
    // Force theme application
    const htmlElement = document.documentElement
    if (theme === "dark") {
      htmlElement.classList.add("dark")
    } else {
      htmlElement.classList.remove("dark")
    }
  }, [theme])

  return { theme, setTheme, resolvedTheme: theme }
}
