<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import AdminLayout from '../layouts/AdminLayout.vue'
import UserTable from '@/modules/admin/components/users/UsersTable.vue'
import UserFormDialog from '@/modules/admin/components/users/UsersFormDialog.vue'

import { useUsers } from '@/composables/use.user'
import type { UserRequest, UserResponse } from '@/interfaces/users.interface'

// Usa el composable de usuarios
const { internalUsers, externalUsers, isLoading, createUser, updateUser, deleteUser } = useUsers()

const isDialogOpen = ref(false)
const isEditMode = ref(false)
const createEmptyUser = (): UserResponse => ({
  id: 0,
  email: '',
  username: '',
  roles: [],
  enabled: true,
})
const selectedUser = ref<UserResponse>(createEmptyUser())

// Funciones para manejar el diálogo
const closeDialog = () => {
  isDialogOpen.value = false
}

const addUserDialog = () => {
  isEditMode.value = false
  selectedUser.value = createEmptyUser()
  isDialogOpen.value = true
}

const handleEdit = (user: UserResponse) => {
  isEditMode.value = true
  selectedUser.value = { ...user }
  isDialogOpen.value = true
}

const handleSubmit = (userData: UserRequest) => {
  try {
    if (isEditMode.value && selectedUser.value?.id) {
      // Editar usuario existente
      updateUser(userData)
    } else {
      // Agregar nuevo usuario
      createUser(userData)
    }
  } catch (error) {
    console.error('Error al guardar usuario:', error)
  } finally {
    closeDialog()
  }
}

const handleDeactivate = (user: UserRequest) => {
  updateUser({ ...user, enabled: !user.enabled })
}

const handleDelete = (user: UserResponse) => {
  deleteUser(user.id)
}

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<template>
  <AdminLayout>
    <v-container class="d-flex align-center pa-0">
      <!-- Botón para volver atrás -->
      <v-btn icon @click="goBack" class="mr-2" color="transparent" flat>
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <h6>Admin / Usuarios</h6>
    </v-container>

    <v-container>
      <!-- Botón Agregar Usuario -->
      <v-row class="mb-4 d-flex align-center">
        <v-col cols="6">
          <h1>Usuarios</h1>
        </v-col>
        <v-col cols="6" class="text-right">
          <v-btn color="#131974" @click="addUserDialog">Agregar Usuario</v-btn>
          <UserFormDialog
            v-model="isDialogOpen"
            :isEditMode="isEditMode"
            :userData="selectedUser"
            @close="closeDialog"
            @submit="handleSubmit"
          />
        </v-col>
      </v-row>

      <!-- Tabla de Usuarios Internos -->
      <v-row>
        <v-col cols="12">
          <h2 class="mb-2">Usuarios Internos</h2>
          <UserTable
            :items="internalUsers"
            :is-loading="isLoading"
            @edit="handleEdit"
            @deactivate="handleDeactivate"
            @delete="handleDelete"
          />
        </v-col>
      </v-row>

      <!-- Tabla de Usuarios Externos -->
      <v-row class="mt-8">
        <v-col cols="12">
          <h2 class="mb-2">Usuarios Externos</h2>
          <UserTable
            :items="externalUsers"
            :is-loading="isLoading"
            @edit="handleEdit"
            @deactivate="handleDeactivate"
            @delete="handleDelete"
          />
        </v-col>
      </v-row>
    </v-container>
  </AdminLayout>
</template>

<style lang="scss" src="/src/styles/global.scss"></style>
