<script setup lang="ts">
// Define the 'props' this component expects to receive
defineProps<{
  note: {
    id: number
    title: string
  }
}>()
</script>

<template>
  <div class="note-item">
    <h3>{{ note.title }}</h3>
    <small>ID: {{ note.id }}</small>
  </div>
</template>

<style scoped>
/* Styles only apply to this component */
.note-item {
  padding: 10px 15px;
  border: 1px solid #ddd;
  margin-bottom: 8px;
  border-radius: 6px;
  background-color: #f9f9f9;
}
h3 {
  margin: 0 0 5px 0;
  font-size: 1.1em;
}
small {
  color: #777;
}
</style>
