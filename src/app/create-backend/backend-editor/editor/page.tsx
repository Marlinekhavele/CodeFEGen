"use client"

import { useState } from "react"
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

  const handleCodeChange = (newCode: string) => {
    setCode(newCode)
  }

  return (
    <div className="w-full h-screen bg-zinc-950">
      <MonacoEditor code={code} language="python" onChange={handleCodeChange} />
    </div>
  )
}
