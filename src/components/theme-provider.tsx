'use client'
import { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react'

type Theme = 'light' | 'dark' | null

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(null)

  // Run only once on mount to set the initial theme
  useLayoutEffect(() => {
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark'
    if (storedTheme) {
      // Apply stored theme
      setTheme(storedTheme)
    } else {
      // Default to dark if no theme stored
      setTheme('dark')
    }
  }, [])

  useEffect(() => {
    // If theme has been set, update the class and localStorage
    if (theme !== null) {
      // Toggle the class on the document element based on theme
      document.documentElement.classList.toggle('dark', theme === 'dark')
      localStorage.setItem('theme', theme)
    }
  }, [theme])  // Only run when theme state changes

  const toggleTheme = () => {
    // Toggle between 'dark' and 'light' themes
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'))
  }

  // If theme is still null (initial state), do not render anything
  if (theme === null) {
    return null
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
