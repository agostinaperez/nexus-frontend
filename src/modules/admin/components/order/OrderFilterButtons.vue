<script setup lang="ts">
import { ref, watch } from 'vue'

const orderStates = [
  { key: 'RECEIVED', label: 'Recibida' },
  { key: 'REGISTERED_INITIAL_WEIGHING', label: 'Pesaje Inicial' },
  { key: 'CLOSED', label: 'Cerrada' },
  { key: 'REGISTERED_FINAL_WEIGHING', label: 'Pesaje Final' },
  { key: 'CANCELLED', label: 'Cancelada' },
]

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

const filters = ref([...props.filter])

watch(
  () => props.filter,
  (value) => {
    filters.value = [...value]
  },
)

const handleFilter = (values: string[]) => {
  filters.value = values
  props.setFilter([...values])
}
</script>

<template>
  <v-card class="data-container filter-card">
    <div class="d-flex align-center justify-space-between mb-2">
      <div class="section-title">
        <v-icon>mdi-filter-variant</v-icon>
        <span>Filtrar órdenes</span>
      </div>
      <span class="pill" v-if="filters.length">{{ filters.length }} seleccionado(s)</span>
    </div>
    <v-select
      v-model="filters"
      :items="orderStates"
      item-title="label"
      item-value="key"
      label="Estados"
      multiple
      chips
      closable-chips
      clearable
      hide-details
      color="primary"
      variant="outlined"
      density="comfortable"
      class="filter-select"
      prepend-inner-icon="mdi-tanker-truck"
      :menu-props="{ elevation: 0 }"
      @update:model-value="handleFilter"
    >
      <template #chip="{ props: chipProps, item }">
        <v-chip v-bind="chipProps" class="filter-chip" color="primary" size="small">
          {{ item.raw.label }}
        </v-chip>
      </template>
    </v-select>
  </v-card>
</template>

<style scoped>
.filter-card {
  padding: 16px;
}

.filter-select :deep(.v-field__field) {
  background: var(--color-surface-3);
  border-radius: 12px;
}

.filter-select :deep(.v-field--variant-outlined .v-field__outline__border) {
  color: transparent;
}

.filter-select :deep(.v-label) {
  color: var(--color-muted);
}

.filter-select :deep(.v-select__selection-text) {
  color: var(--color-text);
  font-weight: 600;
}

.filter-chip {
  background: rgba(72, 199, 142, 0.2) !important;
  border: 1px solid rgba(72, 199, 142, 0.35);
  color: var(--color-heading);
}
</style>
