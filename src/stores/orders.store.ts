import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Order } from '@/interfaces/order.interface'
import type { TableItem } from '@/interfaces/table-item.interface'

/**
 * Store principal para la gestión de órdenes.
 * - Mantiene la tabla paginada y la orden seleccionada para la vista de detalle.
 * - Guarda parámetros de paginación/filtro/orden que se comparten entre componentes y composables de datos.
 * - Expone helpers para actualizar el estado de alarmas en la tabla cuando llegan eventos por WebSocket.
 */
export const useOrdersStore = defineStore('orders', () => {
  // Manage pagination data
  const pageSize = ref<number>(10)
  const sortBy = ref<string>('externalReceptionDate')
  const filter = ref<Array<string>>([])
  const currentPage = ref<number>(0)
  const totalElements = ref<number>(0)
  const totalPages = ref<number>(0)

  // Orders to show in the table
  const orders = ref<TableItem[]>([])

  // Order to show in the details page
  const order = ref<Order | null>(null)

  const setOrders = (newOrders: TableItem[]) => {
    orders.value = newOrders
  }

  const setOrder = (newOrder: Order) => {
    order.value = newOrder
  }

  const setPaginationData = (page: number, totalElement: number, totalPage: number) => {
    currentPage.value = page
    totalElements.value = totalElement
    totalPages.value = totalPage
  }

  const setPage = (page: number) => {
    if (page !== currentPage.value && page >= 0 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  const setPageSize = (size: number) => {
    pageSize.value = size
  }

  const setSortBy = (sort: string) => {
    sortBy.value = sort
  }

  const setFilter = (newFilter: Array<string> | null) => {
    if (newFilter) {
      filter.value = newFilter
    }
  }

  const updateOrderAlarmStatus = (orderId: string | number, status: string) => {
    // Se actualiza la fila correspondiente en la tabla para reflejar el estado de alarma más reciente
    const index = orders.value.findIndex((order) => order.id === orderId)
    if (index === -1) return

    const current = orders.value[index]
    orders.value[index] = {
      ...current,
      alarmStatus: {
        ...(current.alarmStatus || {}),
        state: status,
      },
    }
  }

  return {
    // Estado
    currentPage,
    pageSize,
    sortBy,
    filter,
    totalElements,
    totalPages,
    orders,
    order,

    // Acciones
    setOrders,
    setOrder,
    setPaginationData,
    setPage,
    setPageSize,
    setSortBy,
    setFilter,
    updateOrderAlarmStatus,
  }
})
