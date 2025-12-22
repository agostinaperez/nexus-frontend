import { computed } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { useAlarmsStore } from '@/stores/alarms.store'
import { useOrdersStore } from '@/stores/orders.store'
import { setAlarmStatus } from '@/services/alarm.service'

import type { Alarm } from '@/interfaces/alarm.interface'

/**
 * Composable dedicado a actualizar el estado de una alarma.
 * - Usa `useMutation` para enviar el nuevo estado y aplica los cambios en ambos stores (alarmas y órdenes) al finalizar.
 * - Invalida la query del listado de órdenes para refrescar la tabla con los datos persistidos.
 */
export const useAlarmHandler = () => {
  const alarmsStore = useAlarmsStore()
  const ordersStore = useOrdersStore()
  const queryClient = useQueryClient()

  const alarmMutation = useMutation<
    Alarm,
    Error,
    { id: number; observation: string; newStatus: string }
  >({
    mutationFn: async ({ id, observation, newStatus }) => {
      return await setAlarmStatus(newStatus, { id, observation })
    },
    onSuccess: (updatedAlarm: Alarm) => {
      alarmsStore.updateAlarm(updatedAlarm)
      if (updatedAlarm.status === 'PENDING') {
        alarmsStore.setOrderAlarm(updatedAlarm)
      } else {
        alarmsStore.clearOrderAlarm()
      }

      ordersStore.updateOrderAlarmStatus(updatedAlarm.orderId, updatedAlarm.status)
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })

  return {
    updateAlarmStatus: alarmMutation.mutate,

    isUpdating: computed(() => alarmMutation.isPending.value),
    isError: computed(() => alarmMutation.isError.value),
    isSuccess: computed(() => alarmMutation.isSuccess.value),
  }
}
