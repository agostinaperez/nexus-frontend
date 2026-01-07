import { onMounted, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useQueryClient } from '@tanstack/vue-query'

import { webSocketService } from '@/services/ws.service'
import { useAlarmsStore } from '@/stores/alarms.store'

import type { Alarm } from '@/interfaces/alarm.interface'

/**
 * Suscribe a los eventos de alarmas de una orden vía WebSocket.
 * - Actualiza el store en tiempo real y aprovecha Vue Query para invalidar/actualizar la caché relacionada.
 * - Devuelve la alarma más reciente (`newAlarmByOrden`) para que la UI pueda reaccionar inmediatamente.
 */
export const useWsAlarms = (idOrder: string | number) => {
  const queryClient = useQueryClient()

  const { subscribe, unsubscribe } = webSocketService()
  const hasOrderId = !!idOrder
  const topic = hasOrderId ? `/topic/alarms/order/${idOrder}` : ''

  const store = useAlarmsStore()
  const { newAlarmByOrden } = storeToRefs(store)

  const handleMessage = (message: Alarm) => {
    queryClient.setQueryData(['alarm'], message)
    store.updateAlarm(message)
  }

  onMounted(() => {
    if (!hasOrderId) return
    subscribe(topic, handleMessage)
  })

  onUnmounted(() => {
    if (!hasOrderId) return
    unsubscribe(topic)
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['alarms'] })

  return {
    alarm: newAlarmByOrden,
    invalidate,
  }
}
