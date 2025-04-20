import { create } from 'zustand'

interface CodeState {
  code: string
  isStreaming: boolean
  startStream: () => void
  endStream: () => void
  handleCode: (value: string) => void
  appendCode: (chunk: string) => void
}

export const useCodeStore = create<CodeState>((set) => ({
  code: '',
  isStreaming: false,
  startStream: () => set({ isStreaming: true, code: '' }),
  endStream: () => set({ isStreaming: false }),
  handleCode: (value) => set(() => ({ code: value })),
  appendCode: (chunk) => set((state) => ({ code: state.code + chunk })),
}))
