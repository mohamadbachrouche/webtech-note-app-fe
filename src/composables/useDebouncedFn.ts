/**
 * Debounce a function by `wait` ms. The returned wrapper has two extra helpers:
 *   - flush(): invoke the pending call immediately (useful on blur/unmount)
 *   - cancel(): drop the pending call without invoking it
 *
 * The most recent arguments win, matching standard debounce semantics.
 */
export interface DebouncedFn<Args extends unknown[]> {
  (...args: Args): void
  flush: () => void
  cancel: () => void
}

export function useDebouncedFn<Args extends unknown[]>(
  fn: (...args: Args) => void,
  wait: number,
): DebouncedFn<Args> {
  let timer: ReturnType<typeof setTimeout> | null = null
  let pendingArgs: Args | null = null

  const debounced = ((...args: Args) => {
    pendingArgs = args
    if (timer !== null) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      const toCall = pendingArgs
      pendingArgs = null
      if (toCall) fn(...toCall)
    }, wait)
  }) as DebouncedFn<Args>

  debounced.flush = () => {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
    if (pendingArgs) {
      const toCall = pendingArgs
      pendingArgs = null
      fn(...toCall)
    }
  }

  debounced.cancel = () => {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
    pendingArgs = null
  }

  return debounced
}
