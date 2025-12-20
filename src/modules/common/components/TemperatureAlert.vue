<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useWsAlarmsReminders } from '@/composables/ws/use.ws.reminders.alarms'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'

const dialog = ref(false)
const orderNumber = ref<number | null>(null)
const currentTemperature = ref(0)
const thresholdTemperature = ref(-0.5)
const alertDate = ref<string | null>(null)
const lastAlertSignature = ref<string | null>(null)

const { remindersAlarms, clearRemindersAlarms } = useWsAlarmsReminders()
const router = useRouter()

// Computed: Verificar si está en el detalle de una orden
const isInOrderDetail = computed(() => {
  const currentRoute = router.currentRoute.value.path
  return currentRoute.match(/^\/admin\/orders\/\d+$/)
})

const goToOrder = () => {
  if (!orderNumber.value) return // Verificar que haya una orden válida
  const basePath = '/admin/orders'
  router.push(`${basePath}/${orderNumber.value}`)
  dialog.value = false
}

// Watch para gestionar las alarmas
watchEffect(() => {
  const alarmsArray = Array.isArray(remindersAlarms.value)
    ? remindersAlarms.value
    : [remindersAlarms.value]
  if (alarmsArray.length > 0) {
    const pendingAlarm = alarmsArray.find((alarm) => alarm?.status === 'PENDING')
    if (!pendingAlarm) {
      clearRemindersAlarms()
      return
    }
    const newAlarm = pendingAlarm
    if (newAlarm != null) {
      const alertSignature = `${newAlarm.orderId}-${newAlarm.timeStamp}`
      if (alertSignature === lastAlertSignature.value) return
      lastAlertSignature.value = alertSignature

      orderNumber.value = newAlarm.orderId

      // Si estamos en el detalle de la orden, evitar spam de notificaciones y solo limpiar
      if (isInOrderDetail.value) {
        clearRemindersAlarms()
        return
      }

      // Mostrar notificación y vincular con el evento
      toast.success(`Alerta de temperatura en la orden #${newAlarm.orderId}`, {
        autoClose: 4800,
        position: 'top-right',
        toastId: alertSignature,
        onClick: goToOrder,
        style: {
          background: '#162129',
          color: '#E8EDF2',
          border: '1px solid #2F9B6F',
        },
        progressStyle: {
          background: '#48C78E',
        },
        icon: '🌡️',
      })

      // Configurar valores para mostrar el modal
      currentTemperature.value = newAlarm.temperature
      alertDate.value = new Date(newAlarm.timeStamp).toLocaleString()

      // Mostrar modal
      dialog.value = true

      // Limpiar el store después de procesar la alarma
      clearRemindersAlarms()
    }
  }
})
</script>

<template>
  <div class="text-center pa-4">
    <v-dialog v-model="dialog" max-width="420" persistent>
      <v-card class="pa-4 alert-card" elevation="8">
        <div class="d-flex align-center justify-center mb-3">
          <v-icon class="warning-icon" color="primary" size="50">mdi-alert-decagram</v-icon>
        </div>

        <v-card-title class="text-h6 font-weight-bold text-center mb-2">
          Exceso de temperatura
        </v-card-title>

        <v-card-subtitle class="text-subtitle-1 text-center">
          {{ alertDate }}
        </v-card-subtitle>

        <v-card-text class="mt-2 rounded text-center">
          <p class="text-body-1">
            <strong>Orden #{{ orderNumber }}:</strong> La temperatura actual es de
            <strong>{{ currentTemperature }}°</strong>, por encima del umbral permitido.
          </p>
          <p class="mt-2">Revisa el estado de la orden o contacta un supervisor.</p>
        </v-card-text>

        <v-card-actions class="justify-center">
          <v-btn color="primary" variant="elevated" size="large" @click="goToOrder">
            Ir a la Orden
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
/* TODO: Meter los estilos al global.scss */
.warning-icon {
  display: block;
  margin: 0 auto 12px;
}

.v-card-title {
  text-align: center;
}

.v-card-subtitle {
  text-align: center;
}

.v-card-text {
  text-align: center;
  color: #ffffff;
}

.v-card {
  background-color: #162129;
  color: #e8edf2;
  border-radius: 16px;
  border: 1px solid #22323d;
}

.alert-card {
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
}
</style>
