<script setup lang="ts">
import { ref, defineEmits } from 'vue'

// Estados de las órdenes con nombres abreviados y colores asignados
const orderStates = ref([
  { key: 'RECEIVED', label: 'Recibida', color: '#131974' },
  { key: 'REGISTERED_INITIAL_WEIGHING', label: 'Pesaje Inicial', color: '#131974' },
  { key: 'CLOSED', label: 'Cerrada', color: '#131974' },
  { key: 'REGISTERED_FINAL_WEIGHING', label: 'Pesaje Final', color: '#131974' },
  { key: 'CANCELLED', label: 'Cancelada', color: '#131974' },
])

const props = defineProps({
  filter: {
    type: Array as () => Array<string>,
    default: () => [],
  },
  setFilter: {
    type: Function,
    required: true,
  },
})

// Emitir evento cuando se selecciona o deselecciona un filtro
const emit = defineEmits(['filterOrders'])

const filters = ref([...props.filter]) // Mantiene los filtros seleccionados

const handleFilter = (stateKey: string) => {
  const index = filters.value.indexOf(stateKey)
  if (index > -1) {
    // Deseleccionar filtro
    filters.value.splice(index, 1)
  } else {
    // Seleccionar nuevo filtro
    filters.value.push(stateKey)
  }
  props.setFilter([...filters.value]) // Actualizar el filtro en el padre con una copia
}
</script>

<template>
  <v-row class="ps-2">
    <v-card
      v-for="state in orderStates"
      :key="state.key"
      class="mx-2 mb-2"
      outlined
      width="150"
      :style="{
        border: `1px solid ${state.color}`,
        backgroundColor: filters.includes(state.key) ? state.color : 'transparent',
        color: filters.includes(state.key) ? 'white' : state.color,
      }"
      @click="handleFilter(state.key)"
    >
      <v-card-text class="d-flex align-center justify-center">
        <v-icon
          class="mr-2"
          :style="{ color: filters.includes(state.key) ? 'white' : state.color }"
        >
          mdi-tanker-truck
        </v-icon>
        <span>{{ state.label }}</span>
      </v-card-text>
    </v-card>
  </v-row>
</template>

<style scoped>
.v-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.v-card:hover {
  transform: scale(1.05);
}
</style>
