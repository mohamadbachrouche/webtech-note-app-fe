<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title?: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    destructive?: boolean
  }>(),
  {
    title: 'Are you sure?',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    destructive: false,
  },
)

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const confirmBtn = ref<HTMLButtonElement | null>(null)

function onKeydown(event: KeyboardEvent) {
  if (!props.open) return
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('cancel')
  }
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      await nextTick()
      confirmBtn.value?.focus()
    }
  },
)

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div
    v-if="open"
    class="confirm-dialog-backdrop"
    role="dialog"
    aria-modal="true"
    aria-labelledby="confirm-dialog-title"
    aria-describedby="confirm-dialog-message"
    @click.self="emit('cancel')"
  >
    <div class="confirm-dialog">
      <h2 id="confirm-dialog-title" class="confirm-dialog-title">{{ title }}</h2>
      <p id="confirm-dialog-message" class="confirm-dialog-message">{{ message }}</p>
      <div class="confirm-dialog-actions">
        <button type="button" class="btn btn-secondary" @click="emit('cancel')">
          {{ cancelLabel }}
        </button>
        <button
          ref="confirmBtn"
          type="button"
          class="btn"
          :class="destructive ? 'btn-danger' : 'btn-primary'"
          @click="emit('confirm')"
        >
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.confirm-dialog-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 16px;
}

.confirm-dialog {
  background: var(--sidebar-bg, #222);
  color: var(--text-color, #fff);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
  border-radius: 12px;
  padding: 24px;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.confirm-dialog-title {
  margin: 0 0 12px;
  font-size: 1.1rem;
}

.confirm-dialog-message {
  margin: 0 0 20px;
  line-height: 1.5;
  color: var(--secondary-text, rgba(255, 255, 255, 0.8));
}

.confirm-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid transparent;
  font-size: 0.9rem;
  cursor: pointer;
  font-family: inherit;
}

.btn-secondary {
  background: transparent;
  border-color: var(--border-color, rgba(255, 255, 255, 0.2));
  color: inherit;
}

.btn-primary {
  background: #3b82f6;
  color: #fff;
}

.btn-danger {
  background: #dc3545;
  color: #fff;
}
</style>
