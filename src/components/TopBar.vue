<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { logout, getEmail } from '@/services/AuthService';

const router = useRouter();

// Define the event this component can send to its parent
const emit = defineEmits(['toggle-theme', 'change-background']);

const userEmail = getEmail();

function handleLogout() {
  logout();
  router.push('/login');
}

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
          title="Change background"
          aria-label="Change background"
          :aria-expanded="showColorMenu"
          aria-haspopup="menu"
          @click="showColorMenu = !showColorMenu"
        >
          <i class="fas fa-palette" aria-hidden="true"></i>
        </button>
        <div v-if="showColorMenu" class="color-menu-dropdown" role="menu">
          <button
            type="button"
            class="color-swatch"
            role="menuitemradio"
            :aria-checked="currentTheme === 'blue'"
            :class="{ active: currentTheme === 'blue' }"
            style="background-color: #0070f5"
            aria-label="Blue background"
            @click="selectColor('blue')"
          ></button>
          <button
            type="button"
            class="color-swatch"
            role="menuitemradio"
            :aria-checked="currentTheme === 'yellow'"
            :class="{ active: currentTheme === 'yellow' }"
            style="background-color: #ffcc00"
            aria-label="Yellow background"
            @click="selectColor('yellow')"
          ></button>
          <button
            type="button"
            class="color-swatch"
            role="menuitemradio"
            :aria-checked="currentTheme === 'green'"
            :class="{ active: currentTheme === 'green' }"
            style="background-color: #34c759"
            aria-label="Green background"
            @click="selectColor('green')"
          ></button>
        </div>
      </div>
      <button
        @click="emit('toggle-theme')"
        id="theme-toggle"
        class="icon-btn theme-toggle"
        title="Toggle dark mode"
        aria-label="Toggle dark mode"
      >
        <span class="light-icon" aria-hidden="true"><i class="fas fa-sun"></i></span>
        <span class="dark-icon" aria-hidden="true"><i class="fas fa-moon"></i></span>
      </button>
      <span class="user-email">{{ userEmail }}</span>
      <button
        @click="handleLogout"
        class="icon-btn logout-btn"
        title="Sign out"
        aria-label="Sign out"
      >
        <i class="fas fa-sign-out-alt" aria-hidden="true"></i>
      </button>
    </div>
  </div>
</template>
