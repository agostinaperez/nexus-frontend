// src/services/UserService.ts
import api from '@/services/api.service'
import type { UserRequest, UserResponse } from '@/interfaces/users.interface'

/**
 * Wrapper de llamadas HTTP para usuarios.
 * Se usa desde `useUsers` y delega al backend todas las validaciones de negocio.
 */
export const UserService = {
  async fetchAll(): Promise<UserResponse[]> {
    const { data } = await api().get('/users')
    return data
  },

  async create(user: UserRequest): Promise<UserResponse> {
    const { data } = await api().post('/users', user)
    return data
  },

  async update(user: UserRequest): Promise<UserResponse> {
    const { data } = await api().put('/users', user)
    return data
  },

  async delete(id: number): Promise<void> {
    await api().delete(`/users/${id}`)
  },
}
