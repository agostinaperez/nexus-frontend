<script setup lang="ts">
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { useRouter } from 'vue-router'

import TempAlert from '../../common/components/TemperatureAlert.vue'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  authStore.logout()
  await router.push({ name: 'Login' })
}
</script>

<template>
  <v-navigation-drawer class="sidebar" app permanent :width="260">
    <div class="d-flex align-center mr-2 pa-4">
      <v-img src="/src/assets/logo.png"></v-img>
    </div>

    <v-divider></v-divider>

    <v-list class="sidebar-list" density="compact" nav>
      <router-link to="/admin" class="router-link">
        <v-list-item prepend-icon="mdi-tanker-truck" title="Órdenes"></v-list-item>
      </router-link>
      <router-link to="/admin/users" class="router-link">
        <v-list-item prepend-icon="mdi-account-multiple" title="Usuarios"></v-list-item>
      </router-link>
      <router-link to="/admin/products" class="router-link">
        <v-list-item prepend-icon="mdi-barrel" title="Productos"></v-list-item>
      </router-link>
      <v-list-item
        prepend-icon="mdi-logout"
        title="Cerrar sesión"
        @click="handleLogout"
      ></v-list-item>
    </v-list>
  </v-navigation-drawer>

  <TempAlert />
</template>

<style lang="scss">
.sidebar {
  background: linear-gradient(180deg, #111922 0%, #0f171d 100%) !important;
  border-right: 1px solid var(--color-border);
  color: var(--color-text);
  padding-top: 12px;
}

.sidebar-list :deep(.v-list-item) {
  margin: 4px 10px;
  border-radius: 12px;
  color: var(--color-text);
}

.sidebar-list :deep(.v-list-item:hover) {
  background: rgba(72, 199, 142, 0.14);
  color: var(--color-heading);
}

.router-link {
  color: inherit;
}
</style>
