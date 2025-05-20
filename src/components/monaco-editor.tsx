"use client"

import { useEffect, useState, useRef } from "react"
import Editor, { type Monaco } from "@monaco-editor/react"
import type { editor } from "monaco-editor"
import { CodeStreamEffect } from "@/components/code-stream-effect"

interface MonacoEditorProps {
  code: string
  language?: string
  onChange?: (code: string) => void
  readOnly?: boolean
  theme?: string
  streaming?: boolean
  streamingCode?: string
  docs?: string
  onStreamComplete?: () => void // Callback to BackendEditorClient (handleAnimationComplete)
}

export function MonacoEditor({
  code,
  language = "python",
  onChange,
  readOnly = false,
  theme = "vs-dark",
  streaming = false, // Should be true when BEC.isAnimatingFile is true
  streamingCode = "", // Should be the code from BEC.codeToAnimate
  onStreamComplete,
}: MonacoEditorProps) {
  const [mounted, setMounted] = useState(false);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [showStreamEffect, setShowStreamEffect] = useState(false);


  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    
    if (streaming && streamingCode && streamingCode.length > 0) {
      setShowStreamEffect(true);
    } else {
      setShowStreamEffect(false);
    }
  }, [streaming, streamingCode]);

  const handleEditorChange = (value: string | undefined) => {
    // Only allow editor changes if not in streaming mode (overlay active)
    if (onChange && value !== undefined && !showStreamEffect) {
      onChange(value);
    }
  };

  const handleEditorWillMount = (monaco: Monaco) => {
    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#18181b",
      },
    });
    monaco.editor.defineTheme("custom-light", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#ffffff",
      },
    });
  };

  const handleEditorDidMount = (mountedEditor: editor.IStandaloneCodeEditor) => {
    editorRef.current = mountedEditor;
  };

  const getTheme = () => {
    if (theme === "vs-dark") return "custom-dark";
    if (theme === "vs-light" || theme === "vs") return "custom-light";
    return theme;
  };

  // This is called by CodeStreamEffect when its animation of `streamingCode` is done
  const handleStreamAnimationComplete = () => {
    if (onChange && streamingCode) {
      onChange(streamingCode);
    }
    if (onStreamComplete) {
      onStreamComplete();
    }
  };

  
  const displayCodeInMainEditor = code;

  return (
    <div className="h-full w-full border-0 bg-transparent overflow-hidden p-1 relative">
      {mounted ? (
        <>
          <div className={`h-full w-full ${showStreamEffect ? "hidden" : "block"}`}>
            <Editor
              height="100%"
              width="100%"
              language={language}
              value={displayCodeInMainEditor} 
              onChange={handleEditorChange}
              theme={getTheme()}
              beforeMount={handleEditorWillMount}
              onMount={handleEditorDidMount}
              options={{
                readOnly: showStreamEffect || readOnly, 
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 12.5,
                fontFamily: "'Fira Code', monospace",
                cursorBlinking: "smooth",
                renderLineHighlight: "all",
                scrollbar: {
                  verticalScrollbarSize: 10,
                  horizontalScrollbarSize: 10,
                },
                padding: { bottom: 20 },
                automaticLayout: true,
                lineNumbers: "off",
              }}
              className="h-full w-full"
            />
          </div>

          {/* CodeStreamEffect overlay */}
          {(() => {
            const shouldRenderStreamEffect = showStreamEffect && streamingCode && streamingCode.length > 0;
            if (shouldRenderStreamEffect) {
              return (
                <div className="absolute inset-0 bg-zinc-900 dark:bg-zinc-950 overflow-auto z-10">
                  <CodeStreamEffect
                  code={streamingCode}
                  language={language}
                  className="h-full w-full text-sm"
                  speed={0.1}
                  onComplete={handleStreamAnimationComplete}
                  />
                </div>
              );
            }
            return null;
          })()}
        </>
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-zinc-900 text-zinc-500 dark:text-zinc-400">
          Loading editor...
        </div>
      )}
    </div>
  );
}
