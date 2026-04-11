<script setup lang="ts">
defineProps<{
  editableTitle: string
  titleError: string
  formattedCreatedAt: string
  formattedLastModified: string
}>()

const emit = defineEmits<{
  (e: 'update:editableTitle', value: string): void
  (e: 'title-input'): void
  (e: 'back'): void
}>()

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:editableTitle', target.value)
  emit('title-input')
}
</script>

<template>
  <div>
    <div class="editor-header">
      <button
        class="icon-btn back-btn"
        title="Back to list"
        aria-label="Back to list"
        @click="emit('back')"
      >
        <i class="fas fa-arrow-left" aria-hidden="true"></i>
      </button>
      <input
        :value="editableTitle"
        type="text"
        :class="['note-title-input', { 'input-error': titleError }]"
        placeholder="Note title"
        aria-label="Note title"
        :aria-invalid="!!titleError"
        :aria-describedby="titleError ? 'note-title-error' : undefined"
        @input="onInput"
      />
      <span v-if="titleError" id="note-title-error" class="error-message" role="alert">
        {{ titleError }}
      </span>
    </div>

    <div class="note-meta">
      <span>Created: {{ formattedCreatedAt }}</span>
      <span>Last modified: {{ formattedLastModified }}</span>
    </div>
  </div>
</template>
