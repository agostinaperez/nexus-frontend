import api from '@/services/api.service'

import type { OrderDetail, OrderDetailsResponse } from '@/interfaces/order-details.interface'

/**
 * Servicio HTTP para los detalles de una orden.
 * - `getOrderDetails` maneja paginación/ordenamiento.
 * - `getAllOrderDetails` trae el histórico completo para gráficas.
 */
export const getOrderDetails = async (
  idOrder: string | number,
  page: number = 0,
  size: number = 5,
  sort: string = 'timeStamp',
): Promise<OrderDetailsResponse> => {
  if (!idOrder) throw new Error('idOrder is required')

  const { data } = await api().get(`/details`, {
    params: {
      idOrder,
      page,
      size,
      sort,
    },
  })

  return {
    details: data.details,
    pagination: {
      totalElements: data.pagination.totalElements,
      currentPage: data.pagination.pageable.pageNumber,
      totalPages: data.pagination.totalPages,
    },
  }
}

export const getAllOrderDetails = async (idOrder: string | number): Promise<OrderDetail[]> => {
  if (!idOrder) throw new Error('idOrder is required')
  const { data } = await api().get(`/details/all`, {
    params: { idOrder },
  })
  return data
}
