"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { MonacoEditor } from "@/components/monaco-editor"

const DEFAULT_LOGIN_CODE = `@app.route("/api/auth/login", methods=["POST"])
def login():
    # Validate required fields
    data = request.json
    if not "email" or "password" not in data:
        return jsonify({"error": "Email and password are required"}), 400
        
    # Check database for user
    user = User.query.filter_by(email=data["email"]).first()
    if not user or not check_password(user.password, data["password"]):
        return jsonify({"error": "Invalid credentials"}), 401
    
    # Generate token
    token = generate_token(user.id)
    
    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": user.to_dict()
    }), 200`

export default function EditorPage() {
  const [code, setCode] = useState(DEFAULT_LOGIN_CODE)
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [editorTheme, setEditorTheme] = useState("vs-dark")
  const [parentTheme, setParentTheme] = useState<string | null>(null)

  // Listen for messages from parent window to update code and theme
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "UPDATE_CODE") {
        setCode(event.data.code)
      }
      if (event.data && event.data.type === "THEME_CHANGED") {
        // Update theme from parent window
        setParentTheme(event.data.theme)
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  // Update editor theme based on the current theme or parent theme
  useEffect(() => {
    if (mounted) {
      // Use parent theme if available, otherwise use local theme
      const currentTheme = parentTheme || (theme === "system" ? resolvedTheme : theme)
      setEditorTheme(currentTheme === "dark" ? "vs-dark" : "vs-light")

      // Apply theme to document
      if (currentTheme === "dark") {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }
  }, [theme, resolvedTheme, mounted, parentTheme])

  useEffect(() => {
    setMounted(true)

    // Send message to parent when code changes
    const sendCodeToParent = () => {
      if (window.parent) {
        window.parent.postMessage({ type: "CODE_CHANGED", code }, "*")
      }
    }

    // Request theme from parent on load
    if (window.parent) {
      window.parent.postMessage({ type: "REQUEST_THEME" }, "*")
    }

    // Set up interval to check for code changes
    const interval = setInterval(sendCodeToParent, 1000)
    return () => clearInterval(interval)
  }, [code])

  const handleCodeChange = (newCode: string) => {
    setCode(newCode)

    // Send code to parent window
    if (window.parent) {
      window.parent.postMessage({ type: "CODE_CHANGED", code: newCode }, "*")
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="w-full h-screen bg-transparent">
      <MonacoEditor code={code} language="python" onChange={handleCodeChange} theme={editorTheme} />
    </div>
  )
}
