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
  <v-navigation-drawer class="sidebar" app>
    <div class="d-flex align-center mr-2 pa-2">
      <v-img src="/src/assets/logo.png"></v-img>
    </div>

    <v-divider></v-divider>

    <v-list class="sidebar" density="compact" nav>
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
  background-color: #e3e2e2 !important;
}
</style>
