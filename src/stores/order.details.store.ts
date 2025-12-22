import { ref } from 'vue'
import { defineStore } from 'pinia'

import type { OrderDetail } from '@/interfaces/order-details.interface'

/**
 * Store para los detalles de una orden.
 * - Gestiona dos colecciones: la lista paginada para tablas (`orderDetails`) y la lista completa usada en gráficos (`allOrderDetails`).
 * - Almacena el último detalle llegado en tiempo real (`newDetailByOrden`) para resaltar cambios en la UI.
 * - Incluye helpers de paginación y ordenamiento consumidos por composables que llaman a la API.
 */
export const useOrderDetailsStore = defineStore('orderDetails', () => {
  // Manage pagination data
  const pageSizeD = ref<number>(5)
  const sortByD = ref<string>('timeStamp')
  const currentPageD = ref<number>(0)
  const totalElementsD = ref<number>(0)
  const totalPagesD = ref<number>(0)

  // Order details for the current order (used for tables with pagination)
  const orderDetails = ref<OrderDetail[]>([])

  // Almacena nueva alarma ws de una orden
  const newDetailByOrden = ref<OrderDetail | null | undefined>()

  // All order details (used for graphs)
  const allOrderDetails = ref<OrderDetail[]>([])

  const setOrderDetails = (details: OrderDetail[]) => {
    //orderDetails.value = details;
    orderDetails.value = [...details] // Forzar reactividad
  }

  const addNewOrderDetail = (detail: OrderDetail) => {
    // Las tablas solo refrescan inmediatamente cuando se está en la primera página
    if (currentPageD.value !== 0) return

    if (orderDetails.value.length === 5) {
      // Si hay 5 elementos, eliminamos el último y agregamos el nuevo
      orderDetails.value = [
        ...[detail],
        ...orderDetails.value.slice(0, orderDetails.value.length - 1),
      ]
    } else {
      // Si no, simplemente agregamos el nuevo elemento
      orderDetails.value = [detail, ...orderDetails.value]
    }
    totalElementsD.value += 1
    totalPagesD.value = Math.ceil(totalElementsD.value / pageSizeD.value)
  }

  const setPaginationData = (page: number, totalElement: number, totalPage: number) => {
    currentPageD.value = page
    totalElementsD.value = totalElement
    totalPagesD.value = totalPage
  }

  const setPage = (page: number) => {
    if (page !== currentPageD.value && page >= 0 && page <= totalPagesD.value) {
      currentPageD.value = page
    }
  }
  const setPageSize = (size: number) => {
    pageSizeD.value = size
  }

  const setSortBy = (sort: string) => {
    sortByD.value = sort
  }

  const setNewDetailByOrden = (detail: OrderDetail | null) => {
    newDetailByOrden.value = detail
  }

  const setAllOrderDetails = (details: OrderDetail[]) => {
    allOrderDetails.value = details
  }

  const addLatestOrderDetailToAll = (detail: OrderDetail) => {
    allOrderDetails.value = [detail, ...allOrderDetails.value]
  }

  return {
    // States
    currentPageD,
    pageSizeD,
    sortByD,
    totalElementsD,
    totalPagesD,
    orderDetails,
    newDetailByOrden,
    allOrderDetails,

    // Actions
    setOrderDetails,
    addNewOrderDetail,
    setPaginationData,
    setPage,
    setPageSize,
    setSortBy,
    setNewDetailByOrden,
    setAllOrderDetails,
    addLatestOrderDetailToAll,
  }
})
