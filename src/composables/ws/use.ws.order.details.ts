import { onMounted, onUnmounted, computed, toRefs, ref } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'

import { webSocketService } from '@/services/ws.service'
import { useOrderDetailsStore } from '@/stores/order.details.store'

import type { OrderDetail } from '@/interfaces/order-details.interface'
import { storeToRefs } from 'pinia'

/**
 * Suscripción WebSocket para la tabla de detalles.
 * - Inserta cada mensaje entrante en el store paginado y mantiene referencia al último detalle recibido.
 * - Permite invalidar manualmente la query `lastDetail` cuando se necesite forzar un refetch.
 */
export const useWsOrderDetail = (orderId: string | number) => {
  // Cliente de Vue Query
  const queryClient = useQueryClient()

  // Servicio WebSocket
  const { subscribe, unsubscribe } = webSocketService()

  // Tópico de las alarmas recordatorios
  const hasOrderId = !!orderId
  const topic = hasOrderId ? `/topic/details/order/${orderId}` : ''

  // Variable reactiva para almacenar el mensaje recibido
  //const detail = ref<OrderDetail | null>(null);

  // Store de detalles de la orden
  const store = useOrderDetailsStore()
  const { newDetailByOrden } = storeToRefs(store)

  // Manejo de la llegada de nuevos mensajes
  const handleMessage = (message: OrderDetail) => {
    //console.log('Nuevo mensaje recibido:', message);

    queryClient.setQueryData(['OrderDetail'], message) // Actualiza cache de Vue Query
    store.addNewOrderDetail(message)
    store.setNewDetailByOrden(message)
  }

  // Suscripción y conexión WebSocket
  onMounted(() => {
    if (!hasOrderId) return
    subscribe(topic, handleMessage)
  })

  // Desconexión del WebSocket al desmontar el componente
  onUnmounted(() => {
    if (!hasOrderId) return
    unsubscribe(topic)
    //store.setNewDetailByOrden(null);
  })

  // Método para invalidar la cache
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['lastDetail'] })

  return {
    detail: newDetailByOrden,
    invalidate,
  }
}
