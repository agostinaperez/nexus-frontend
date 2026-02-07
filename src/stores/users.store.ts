import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { UserResponse } from '@/interfaces/users.interface'

/**
 * Store para usuarios internos y externos.
 * - Almacena el listado completo y lo segmenta en `internalUsers` y `externalUsers` según el rol recibido de la API.
 * - Permite seleccionar un usuario para edición y expone acciones CRUD simples que mantienen ambas vistas sincronizadas.
 */
export const useUsersStore = defineStore('users', () => {
  // Estado
  const users = ref<UserResponse[]>([])
  const internalUsers = ref<UserResponse[]>([])
  const externalUsers = ref<UserResponse[]>([])
  const selectedUser = ref<UserResponse | null>(null)

  const isInternalUser = (user: UserResponse) => {
    return user.roles.some((role) => role.name === 'ROLE_ADMIN')
  }

  const isExternalUser = (user: UserResponse) => {
    return user.roles.some((role) => role.name.includes('CLI'))
  }

  // Acciones
  const setUsers = (newUsers: UserResponse[]) => {
    users.value = newUsers

    // Filtrar usuarios internos
    internalUsers.value = newUsers.filter(isInternalUser)

    // Filtrar usuarios externos
    externalUsers.value = newUsers.filter(isExternalUser)
  }

  const addUser = (user: UserResponse) => {
    // Crea una copia y agrega el nuevo usuario
    const updatedUsers = [...users.value, user]
    // Asigna el nuevo array
    setUsers(updatedUsers)
  }

  const updateUser = (updatedUser: UserResponse) => {
    const updatedUsers = users.value.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    setUsers(updatedUsers) // Reasigna con un nuevo array
  }

  const deleteUser = (userId: number) => {
    setUsers(users.value.filter((u) => u.id !== userId)) // Recalcular internos/externos
  }

  const setSelectedUser = (user: UserResponse | null) => {
    selectedUser.value = user
  }

  return {
    // Estado
    users,
    internalUsers,
    externalUsers,
    selectedUser,

    // Acciones
    setUsers,
    addUser,
    updateUser,
    deleteUser,
    setSelectedUser,
  }
})
