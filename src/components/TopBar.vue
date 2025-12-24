<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

// Define the event this component can send to its parent
const emit = defineEmits(['toggle-theme', 'change-background']);

defineProps<{
  currentTheme: string
}>();

const showColorMenu = ref(false);
const menuWrapper = ref<HTMLElement | null>(null);

function selectColor(color: string) {
  emit('change-background', color);
  showColorMenu.value = false;
}

function handleClickOutside(event: MouseEvent) {
  if (menuWrapper.value && !menuWrapper.value.contains(event.target as Node)) {
    showColorMenu.value = false;
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="top-bar">
    <div class="app-title">Notes</div>
    <div class="top-bar-actions">
      <div class="theme-menu-wrapper" ref="menuWrapper">
        <button
          class="icon-btn"
          title="Change Background"
          @click="showColorMenu = !showColorMenu"
        >
          <i class="fas fa-palette"></i>
        </button>
        <div v-if="showColorMenu" class="color-menu-dropdown">
          <div
            class="color-swatch"
            :class="{ active: currentTheme === 'blue' }"
            style="background-color: #0070f5"
            @click="selectColor('blue')"
          ></div>
          <div
            class="color-swatch"
            :class="{ active: currentTheme === 'yellow' }"
            style="background-color: #ffcc00"
            @click="selectColor('yellow')"
          ></div>
          <div
            class="color-swatch"
            :class="{ active: currentTheme === 'green' }"
            style="background-color: #34c759"
            @click="selectColor('green')"
          ></div>
        </div>
      </div>
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
