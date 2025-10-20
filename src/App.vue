<script setup lang="ts">
import { ref } from 'vue'
import NoteItem from './components/NoteItem.vue' // Import your new component
import { RouterView } from 'vue-router' // Keep RouterView

// Define the structure of a Note object using TypeScript
interface Note {
  id: number;
  title: string;
}

// Create a reactive array to hold the notes
// 'ref' makes it reactive, so Vue updates the page if it changes
const notes = ref<Note[]>([
  { id: 101, title: 'My First Note' },
  { id: 102, title: 'Shopping List Ideas' },
  { id: 103, title: 'Webtech M2 - v-for Loop' }
])
</script>

<template>
  <header class="app-header">
    <h1>My Awesome Note App</h1>
    <nav>
    </nav>
  </header>

  <main class="main-content">
    <h2>Notes List (M2 Demo)</h2>

    <NoteItem
      v-for="note in notes"
      :key="note.id"
      :note="note"
    />

    <RouterView />
  </main>
</template>

<style scoped>
.app-header {
  line-height: 1.5;
  border-bottom: 1px solid var(--color-border);
  padding: 1rem 0;
  margin-bottom: 1rem;
}

.main-content {
  padding: 0 1rem; /* Adjust padding as needed */
}

h1 {
  font-weight: 500;
  font-size: 2rem;
}

h2 {
  margin-bottom: 1rem;
  color: var(--color-heading);
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 1rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

/* Basic layout styles, adjust as needed */
@media (min-width: 1024px) {
  .app-header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }
  .main-content {
    padding-left: calc(var(--section-gap) / 2);
  }
  h1 {
    /* Adjust positioning if needed */
  }
  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;
    padding: 1rem 0;
    margin-top: 0; /* Adjust margin for desktop */
  }
}
</style>
