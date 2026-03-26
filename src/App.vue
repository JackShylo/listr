<script setup>
import { computed } from 'vue';
import Navbar from './components/Navbar.vue';
import ListManager from './components/ListManager.vue';
import Pinboard from './components/Pinboard.vue';
import SettingsPage from './components/SettingsPage.vue';
import { listStore } from './stores/listStore';

const currentPage = computed(() => listStore.currentPage);
</script>

<template>
  <Navbar />
  <ListManager v-if="currentPage === 'lists'" />
  <SettingsPage v-else-if="currentPage === 'settings'" />
  <Pinboard />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Source Sans Pro',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  height: 100vh;
  display: flex;
  background: #1a1a1a;
}
</style>
