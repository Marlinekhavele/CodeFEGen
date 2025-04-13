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
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCodeChange = (newCode: string) => {
    setCode(newCode)
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="w-full h-screen bg-white dark:bg-zinc-950">
      <MonacoEditor
        code={code}
        language="python"
        onChange={handleCodeChange}
        theme={theme === "dark" ? "vs-dark" : "vs-light"}
      />
    </div>
  )
}
