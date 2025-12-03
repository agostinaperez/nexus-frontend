<script setup lang="ts">
import SidebarAdmin from '../components/Sidebar.vue'
</script>
<template>
  <v-layout class="rounded rounded-md layout">
    <SidebarAdmin />
    <v-main class="main" app>
      <slot />
    </v-main>
  </v-layout>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.main {
  flex-grow: 1;
  overflow-y: auto;
  background-color: inherit;
}
</style>
