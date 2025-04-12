"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Code, Database, ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function AnimatedPhones() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* First Phone - Left */}
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={isMounted ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={cn(
          "absolute phone-frame phone-left z-10 border-[#7dff00]/30 shadow-[0_0_15px_rgba(125,255,0,0.2)]",
          isMounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-20"
        )}
      >
        <div className="phone-notch"></div>
        <div className="phone-screen bg-zinc-950">
          <div className="phone-header bg-zinc-900 border-b border-zinc-800 p-2 flex items-center">
            <Database className="h-3 w-3 text-[#7dff00] mr-1" />
            <span className="text-[10px] font-medium text-zinc-100">My Backend</span>
          </div>
          <div className="phone-content">
            <div className="p-2 border-b border-zinc-800">
              <div className="flex items-center mb-1">
                <div className="bg-zinc-800 text-[8px] px-1 py-0.5 rounded text-zinc-300 mr-1">POST</div>
                <div className="bg-zinc-900 border border-zinc-800 text-[8px] px-1 py-0.5 rounded text-zinc-300 flex-1">
                  /api/auth/login
                </div>
              </div>
            </div>
            <div className="p-1">
              <div className="flex items-center justify-between p-1">
                <div className="flex items-center gap-1 text-[9px] font-medium text-zinc-300">
                  <ChevronDown className="h-2 w-2 text-[#7dff00]" />
                  <span>Endpoints</span>
                </div>
              </div>
              <div className="ml-2 mb-1">
                <div className="flex items-center text-[8px] bg-[#7dff00]/20 text-[#7dff00] rounded px-1 py-0.5 mb-1">
                  <div className="bg-blue-500/20 text-blue-400 rounded px-0.5 mr-1 text-[7px]">POST</div>
                  <span>login</span>
                </div>
                <div className="flex items-center text-[8px] text-zinc-400 px-1 py-0.5">
                  <div className="bg-green-500/20 text-green-400 rounded px-0.5 mr-1 text-[7px]">GET</div>
                  <span>users</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-1 mt-1">
                <div className="flex items-center gap-1 text-[9px] font-medium text-zinc-300">
                  <ChevronRight className="h-2 w-2 text-[#7dff00]" />
                  <span>Models</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-1">
                <div className="flex items-center gap-1 text-[9px] font-medium text-zinc-300">
                  <ChevronRight className="h-2 w-2 text-[#7dff00]" />
                  <span>Database</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Second Phone - Right */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={isMounted ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
        className={cn(
          "absolute phone-frame phone-right border-[#7dff00]/30 shadow-[0_0_15px_rgba(125,255,0,0.2)]",
          isMounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-20"
        )}
      >
        <div className="phone-notch"></div>
        <div className="phone-screen bg-zinc-950">
          <div className="phone-header bg-zinc-900 border-b border-zinc-800 p-2 flex items-center justify-between">
            <div className="flex items-center">
              <Code className="h-3 w-3 text-[#7dff00] mr-1" />
              <span className="text-[10px] font-medium text-zinc-100">Code Editor</span>
            </div>
            <div className="flex space-x-1">
              <div className="bg-zinc-800 rounded text-[8px] px-1 text-zinc-300">Python</div>
            </div>
          </div>
          <div className="phone-content p-2 text-[8px] font-mono text-left overflow-hidden">
            <div className="text-[#7dff00]">@app.route("/api/auth/login", methods=["POST"])</div>
            <div className="text-blue-400">def <span className="text-green-400">login</span>():</div>
            <div className="ml-2 text-zinc-400"># Validate required fields</div>
            <div className="ml-2 text-zinc-300">data = request.json</div>
            <div className="ml-2 text-[#7dff00]">if <span className="text-zinc-300">not "email" or "password" not in data:</span></div>
            <div className="ml-4 text-zinc-300">return jsonify({"error\": \"Required fields"}), 400</div>
            <div className="ml-2 text-zinc-300">user = User.query.filter_by(email=data["email"]).first()</div>
            <div className="ml-2 text-[#7dff00]">if <span className="text-zinc-300">not user or not check_password(...):</span></div>
            <div className="ml-4 text-zinc-300">return jsonify({"{\"message\": \"Success\""}), 201</div>
            <div className="ml-2 text-zinc-300">token = generate_token(user.id)</div>
            <div className="ml-2 text-zinc-300">return jsonify({"{\"message\": \"Login successful\", \"token\": token, \"user\": user.to_dict()"}), 200</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
