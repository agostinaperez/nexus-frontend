<script setup lang="ts">
import SidebarAdmin from '../components/Sidebar.vue'
</script>
<template>
  <v-layout class="rounded rounded-md layout">
    <SidebarAdmin />
    <v-main class="main">
      <div class="main-content">
        <slot />
      </div>
    </v-main>
  </v-layout>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: row;
  min-height: 100vh;
}
.main {
  flex-grow: 1;
  overflow-y: auto;
  background-color: transparent;
}

.main-content {
  padding: 24px;
}
</style>
