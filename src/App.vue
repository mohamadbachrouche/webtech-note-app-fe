<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isDarkMode = ref(false)

onMounted(() => {
  const saved = localStorage.getItem('darkMode')
  if (saved !== null) {
    isDarkMode.value = saved === 'true'
  } else {
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
})
</script>

<template>
  <div class="app-root" :class="{ 'dark-theme': isDarkMode }">
    <router-view />
  </div>
</template>
