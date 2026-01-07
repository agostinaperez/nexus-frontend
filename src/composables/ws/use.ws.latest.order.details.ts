import { onMounted, onUnmounted, ref } from 'vue'
import { useOrderDetailsStore } from '@/stores/order.details.store'
import { webSocketService } from '@/services/ws.service'

import type { OrderDetail } from '@/interfaces/order-details.interface'

/**
 * Escucha el flujo de últimos detalles (para gráficas en tiempo real).
 * Cada mensaje se añade al store `allOrderDetails` y expone también el último recibido.
 */
export const useWsLatestOrderDetails = (orderId: string | number) => {
  const store = useOrderDetailsStore()
  const { subscribe, unsubscribe } = webSocketService()

  const hasOrderId = !!orderId
  const topic = hasOrderId ? `/topic/details/graphs/order/${orderId}` : ''

  const lastDetail = ref<OrderDetail | null>(null)

  const handleMessage = (message: OrderDetail) => {
    lastDetail.value = message
    store.addLatestOrderDetailToAll(message)
  }

  onMounted(() => {
    if (!hasOrderId) return
    subscribe(topic, handleMessage)
  })

  onUnmounted(() => {
    if (!hasOrderId) return
    unsubscribe(topic)
  })

  return {
    lastDetail,
  }
}
