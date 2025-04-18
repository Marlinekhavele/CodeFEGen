import AIChat from "@/components/ai-chat"
import { MonacoEditor } from "@/components/monaco-editor"

export default function ProjectPage({ params }: { params: { projectId: string } }) {
  return (
    <main className="flex min-h-screen flex-col p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6">CodeBEgen</h1>

      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-120px)]">
        <div className="w-full lg:w-1/3 h-full">
          <AIChat projectId={params.projectId} />
        </div>

        <div className="w-full lg:w-2/3 h-full border border-zinc-200 rounded-lg overflow-hidden dark:border-zinc-800">
          <div className="p-3 border-b border-zinc-200 bg-white dark:bg-zinc-900 dark:border-zinc-800">
            <h2 className="text-sm font-medium">Generated Code</h2>
          </div>
          <div className="h-[calc(100%-48px)]">
            <MonacoEditor code="" language="typescript" theme="vs-dark" />
          </div>
        </div>
      </div>
    </main>
  )
}
