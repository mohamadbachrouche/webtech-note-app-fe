<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, dismiss } = useToast()
</script>

<template>
  <div class="toast-host" role="status" aria-live="polite" aria-atomic="false">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="toast"
      :class="`toast-${toast.variant}`"
      :role="toast.variant === 'error' ? 'alert' : 'status'"
    >
      <span class="toast-message">{{ toast.message }}</span>
      <button
        type="button"
        class="toast-close"
        aria-label="Dismiss notification"
        @click="dismiss(toast.id)"
      >
        &times;
      </button>
    </div>
  </div>
</template>

<style scoped>
.toast-host {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: min(90vw, 360px);
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  background: var(--sidebar-bg, #222);
  color: var(--text-color, #fff);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  pointer-events: auto;
}

.toast-error {
  border-color: #dc3545;
}

.toast-success {
  border-color: #22c55e;
}

.toast-message {
  flex: 1;
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
}

.toast-close {
  background: none;
  border: none;
  color: inherit;
  font-size: 20px;
  line-height: 1;
  padding: 0 4px;
  cursor: pointer;
  opacity: 0.7;
}

.toast-close:hover {
  opacity: 1;
}
</style>
