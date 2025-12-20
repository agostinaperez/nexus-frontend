import { computed } from 'vue'
import { useMutation } from '@tanstack/vue-query'

import { useAlarmsStore } from '@/stores/alarms.store'
import { setAlarmStatus } from '@/services/alarm.service'

import type { Alarm } from '@/interfaces/alarm.interface'

export const useAlarmHandler = () => {
  const alarmsStore = useAlarmsStore()

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
    },
  })

  return {
    updateAlarmStatus: alarmMutation.mutate,

    isUpdating: computed(() => alarmMutation.isPending.value),
    isError: computed(() => alarmMutation.isError.value),
    isSuccess: computed(() => alarmMutation.isSuccess.value),
  }
}
