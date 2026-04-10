import { reactive, readonly } from 'vue'

export type ToastVariant = 'info' | 'success' | 'error'

export interface Toast {
  id: number
  message: string
  variant: ToastVariant
}

interface ToastState {
  toasts: Toast[]
}

const state = reactive<ToastState>({ toasts: [] })

let nextId = 1
const DEFAULT_DURATION_MS = 4000

function push(message: string, variant: ToastVariant, durationMs: number) {
  const id = nextId++
  state.toasts.push({ id, message, variant })
  if (durationMs > 0) {
    window.setTimeout(() => dismiss(id), durationMs)
  }
  return id
}

function dismiss(id: number) {
  const index = state.toasts.findIndex((t) => t.id === id)
  if (index !== -1) {
    state.toasts.splice(index, 1)
  }
}

/**
 * Shared toast state + helpers. Any component can call these without
 * passing an event up the tree.
 */
export function useToast() {
  return {
    toasts: readonly(state.toasts) as readonly Toast[],
    info: (message: string, durationMs = DEFAULT_DURATION_MS) =>
      push(message, 'info', durationMs),
    success: (message: string, durationMs = DEFAULT_DURATION_MS) =>
      push(message, 'success', durationMs),
    error: (message: string, durationMs = DEFAULT_DURATION_MS) =>
      push(message, 'error', durationMs),
    dismiss,
  }
}
