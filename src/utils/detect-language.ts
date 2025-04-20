export function detectLanguage(filePath?: string, code?: string): string {
  if (filePath) {
    if (filePath.endsWith('.py')) return 'python'
    if (filePath.endsWith('.js')) return 'javascript'
    if (filePath.endsWith('.ts')) return 'typescript'
    if (filePath.endsWith('.java')) return 'java'
    if (filePath.endsWith('.go')) return 'go'
    if (filePath.endsWith('.rb')) return 'ruby'
    if (filePath.endsWith('.php')) return 'php'
    if (filePath.endsWith('.cs')) return 'csharp'
    if (filePath.endsWith('.cpp') || filePath.endsWith('.cc')) return 'cpp'
    if (filePath.endsWith('.json')) return 'json'
    // Add more as needed
  }
  // Fallback: try to guess from code content (very basic)
  if (code) {
    if (code.includes('def ') && code.includes(':')) return 'python'
    if (code.includes('function ') || code.includes('=>')) return 'javascript'
    if (code.includes('class ') && code.includes('{')) return 'typescript'
    if (code.includes('public static void main')) return 'java'
    // Add more heuristics as needed
  }
  return 'python' // Default fallback
}