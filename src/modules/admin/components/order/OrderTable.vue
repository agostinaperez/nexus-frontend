<script setup lang="ts">
import { ref, watch } from 'vue'
import type { TableItem } from '@/interfaces/table-item.interface'
import { format } from 'date-fns'

const props = defineProps({
  items: {
    type: Array as () => TableItem[],
    default: () => [],
  },
  totalElements: {
    type: Number,
    default: 0,
  },
  currentPage: {
    type: Number,
    required: true,
  },
  pageSize: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
  isLoading: Boolean,
})

const emit = defineEmits(['update:page'])
const currentPage = ref(props.currentPage)

const handlePageChange = (page: number) => {
  // Emitir el evento de cambio de página con el índice base 1
  emit('update:page', page)
}

watch(
  () => props.currentPage,
  (newPage: number) => {
    // Sincronizar el valor de currentPage con el valor recibido por props
    currentPage.value = newPage + 1 // La paginación del componente es base 1
  },
  { immediate: true },
)

// Definición de los encabezados de la tabla
const headers = ref<Array<{ title: string; value: string; align?: 'start' | 'center' | 'end' }>>([
  { title: 'Camión', value: 'truck' },
  { title: 'Cliente', value: 'client' },
  { title: 'Recepción', value: 'receptionDate' },
  { title: 'Carga', value: 'estimatedDate' },
  { title: 'Estado', value: 'status' },
  { title: 'Alarmas', value: 'alarmStatus' },
])

// Normaliza el estado para evitar problemas de casing/idioma
const normalizeState = (state: string | null | undefined): string =>
  (state || '').toString().trim().toUpperCase()

// Función para aplicar estilos condicionales a las advertencias
const getWarningClass = (warning: string): string => {
  console.log('estado: ', warning)
  const normalized = normalizeState(warning)
  if (normalized === 'PENDING' || normalized === 'PENDIENTE') {
    return 'text-warning'
  }
  if (normalized === 'CONFIRMED_ISSUE' || normalized === 'CONFIRMED ISSUE') {
    return 'text-danger'
  }
  if (normalized === 'ACKNOWLEDGED') return 'text-success'
  return ''
}

const getWarningLabel = (state: string): string => {
  console.log(state)
  const normalized = normalizeState(state)
  if (normalized === 'PENDING' || normalized === 'PENDIENTE') return 'A REVISAR'
  if (normalized === 'CONFIRMED_ISSUE' || normalized === 'CONFIRMED ISSUE') return 'PROBLEMA'
  return 'SIN ALARMAS'
}

const formatDate = (timestamp: string) => {
  return format(new Date(timestamp), 'dd/MM/yyyy HH:mm:ss')
}

// Equivalencia de nombres para los OrderStates
const orderStates = [
  { key: 'RECEIVED', label: 'RECIBIDA' },
  { key: 'REGISTERED_INITIAL_WEIGHING', label: 'PESAJE INICIAL' },
  { key: 'CLOSED', label: 'CERRADA' },
  { key: 'REGISTERED_FINAL_WEIGHING', label: 'PESAJE FINAL' },
  { key: 'CANCELLED', label: 'CANCELADA' },
]

const getOrderState = (status: string) => {
  return orderStates.find((state) => state.key === status) || { label: status } // Color gris por defecto
}
</script>

<template>
  <!-- Tabla -->
  <v-data-table-server
    :headers="headers"
    :items="items"
    :items-length="totalElements"
    item-value="id"
    class="elevation-1 tabla"
    :items-per-page="pageSize"
    :items-per-page-options="[]"
    :loading="isLoading"
    hide-default-footer
    @update:page="handlePageChange"
  >
    <!-- Columna de ubicación con ícono -->
    <template #item.truck="{ item }">
      <router-link :to="`/admin/orders/${item.id}`" class="d-flex align-center truck-link">
        <v-icon class="mr-2">mdi-tanker-truck</v-icon>
        <span>{{ item.truck.licensePlate }}</span>
      </router-link>
    </template>

    <template #item.client="{ item }">
      <span>{{ item.client.name }}</span>
    </template>

    <template #item.receptionDate="{ item }">
      <span>{{ formatDate(item.receptionDate) }}</span>
    </template>

    <template #item.estimatedDate="{ item }">
      <span>{{ formatDate(item.estimatedDate) }}</span>
    </template>

    <!-- Columna de estado  -->
    <template #item.status="{ item }">
      <span> {{ getOrderState(item.status).label }} </span>
    </template>

    <!-- Columna de advertencias con estilos -->
    <template #item.alarmStatus="{ item }">
      <span :class="getWarningClass(item.alarmStatus.state)">
        {{ getWarningLabel(item.alarmStatus.state) }}
      </span>
    </template>

    <!-- Footer personalizado -->
    <template #bottom>
      <v-container class="d-flex justify-center">
        <v-pagination
          :model-value="currentPage"
          :length="totalPages"
          :total-visible="pageSize"
          @update:modelValue="handlePageChange"
        ></v-pagination>
      </v-container>
    </template>
  </v-data-table-server>
</template>

<style>
.tabla {
  background: var(--color-surface-2);
  color: var(--color-text);
}

.text-success {
  color: var(--color-primary) !important;
  font-weight: 700;
}

.text-danger {
  color: var(--color-error) !important;
  font-weight: 700;
}

.text-warning {
  color: var(--color-warning) !important;
  font-weight: 700;
}
</style>
