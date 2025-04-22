import { Suspense } from "react"
import CreateBackend from "./page"

export default function CreateBackendWrapper() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-zinc-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-[#7dff00] border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400">Loading editor...</p>
        </div>
      </div>
    }>
    
      <CreateBackend />
    </Suspense>
  )
}