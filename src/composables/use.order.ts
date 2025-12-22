import { watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { storeToRefs } from 'pinia'

import { useOrdersStore } from '@/stores/orders.store'
import { getOrderById } from '@/services/order.service'

/**
 * Encapsula la carga de una orden individual y la guarda en el store global.
 * Pensado para la vista de detalle: usa Vue Query para cachear la respuesta y expone `refetch` para recargar manualmente.
 */
export const useOrder = (orderId: number) => {
  const store = useOrdersStore()
  const { order } = storeToRefs(store)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrderById(orderId),
    enabled: !!orderId,
    staleTime: 0,
  })

  // Sincroniza los datos obtenidos con el store
  watch(
    data,
    (newData) => {
      if (newData) {
        store.setOrder(newData)
      }
    },
    { immediate: true },
  )

  return {
    // Estado reactivo
    order,
    isLoading,

    // Método para recargar la orden manualmente
    refetchOrder: refetch,
  }
}
