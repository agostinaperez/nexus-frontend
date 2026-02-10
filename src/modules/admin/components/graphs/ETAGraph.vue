<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
  lastDetail: {
    type: Object as () => Record<string, any> | null,
    required: false,
    default: null,
  },
})

// Parámetros obtenidos de las props
const preset = ref<number>(props.order.preset ?? 0) // Masa total requerida (kg)
const accumulatedMass = ref<number>(props.lastDetail?.accumulatedMass ?? 0) // Masa acumulada actual (kg)
const flowRate = ref<number>(props.lastDetail?.flowRate ?? 0) // Caudal actual (kg/h)

// ETA restante dinámico en minutos (no negativo)
const etaMinutes = ref<number>(
  flowRate.value > 0
    ? Math.max(
        0,
        Math.round((Math.max(0, preset.value - accumulatedMass.value) / flowRate.value) * 60),
      )
    : 0,
)

// Series actualizadas según el progreso
const series = computed(() => [progress.value])

// Configuración del gráfico con gradiente
const chartOptions = ref({
  chart: {
    type: 'radialBar',
    background: '#162129',
  },
  plotOptions: {
    radialBar: {
      hollow: {
        size: '70%',
      },
      dataLabels: {
        show: true,
        value: {
          fontSize: '22px',
          color: '#E8EDF2',
          formatter: () => {
            const hours = Math.floor(etaMinutes.value / 60)
            const minutes = etaMinutes.value % 60
            return `${hours}h ${minutes}m`
          },
        },
      },
    },
  },
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'light',
      type: 'horizontal',
      gradientToColors: ['#48C78E', '#8BD5C0'],
      stops: [0, 50, 100],
    },
  },
  colors: ['#2F9B6F'],
  labels: ['ETA'],
})

// Cálculo del progreso relativo (0-100%)
const progress = computed(() => {
  const remainingMass = Math.max(0, preset.value - accumulatedMass.value)
  if (preset.value <= 0) return 0
  const delivered = Math.max(0, preset.value - remainingMass)
  return Math.min(100, (delivered / preset.value) * 100)
})

const calculateEtaMinutes = (remainingMass: number, currentFlowRate: number) => {
  return currentFlowRate > 0 ? Math.max(0, Math.round((remainingMass / currentFlowRate) * 60)) : 0
}

const updateEtaSeries = () => {
  const remainingMass = Math.max(0, preset.value - accumulatedMass.value)
  etaMinutes.value = calculateEtaMinutes(remainingMass, flowRate.value)

  // Log para ver qué valores está usando
  console.log({
    preset: preset.value,
    accumulatedMass: accumulatedMass.value,
    flowRate: flowRate.value,
    remainingMass,
    etaMinutes: etaMinutes.value,
    progress: progress.value,
    lastDetail: props.lastDetail,
  })
}

// Recalcular eta y series cuando cambian preset, accumulatedMass o flowRate
watch(
  () => [props.order.preset, props.lastDetail],
  ([newPreset, newLastDetail]) => {
    if (newPreset !== undefined) preset.value = newPreset
    if (newLastDetail !== undefined && newLastDetail !== null) {
      accumulatedMass.value = newLastDetail.accumulatedMass ?? 0
      flowRate.value = newLastDetail.flowRate ?? 0
    }
    updateEtaSeries()
  },
  { immediate: true },
)
</script>

<template>
  <v-card class="data-container" color="container-color" outlined>
    <v-card-title>Tiempo estimado</v-card-title>
    <v-card-subtitle class="graph-note">
      Calcula cuánto falta para completar la carga según el caudal actual.
    </v-card-subtitle>
    <v-container>
      <v-card-text class="eta-timer">
        <apexchart type="radialBar" :options="chartOptions" :series="series" height="280" />
      </v-card-text>
    </v-container>
  </v-card>
</template>

<style scoped>
.graph-note {
  color: var(--color-muted);
  font-size: 13px;
  white-space: normal;
  line-height: 1.4;
  word-break: break-word;
  overflow-wrap: anywhere;
}
</style>

<style lang="scss" src="/src/styles/global.scss"></style>
