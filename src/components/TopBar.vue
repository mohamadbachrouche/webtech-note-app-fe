<script setup lang="ts">
// Define the event this component can send to its parent
const emit = defineEmits(['toggle-theme']);
</script>

<template>
  <div class="top-bar">
    <div class="app-title">Notes</div>
    <div class="top-bar-actions">
      <button
        @click="emit('toggle-theme')"
        id="theme-toggle"
        class="icon-btn theme-toggle"
        title="Toggle Dark Mode"
      >
        <span class="light-icon"><i class="fas fa-sun"></i></span>
        <span class="dark-icon"><i class="fas fa-moon"></i></span>
      </button>
      <button id="export-btn" class="icon-btn" title="Export Notes">
        <i class="fas fa-download"></i>
      </button>
      <button id="import-btn" class="icon-btn" title="Import Notes">
        <i class="fas fa-upload"></i>
      </button>
    </div>
  </div>
</template>
