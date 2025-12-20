<script setup lang="ts">
import { ref, computed, watch, defineProps, watchEffect, onMounted } from 'vue'

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

// Cálculo de la capacidad total en litros
const totalCapacityLiters = computed(() => {
  return (
    props.order.truck.tankers?.reduce(
      (sum: number, tanker: any) => sum + (tanker.capacityLiters || 0),
      0,
    ) || 0
  )
})

// Densidad del producto
const density = computed(() => parseFloat(props.order.product?.density || '0'))

// Preset en kilogramos
const presetKg = computed(() => props.order.preset || 0)

// Carga actual
const currentLoadKg = computed(() => {
  if (props.lastDetail) {
    return props.lastDetail.accumulatedMass || 0
  }
  return parseFloat(props.order.lastAccumulatedMass || '0')
})

// Capacidad total en kilogramos
const totalCapacityKg = computed(() => totalCapacityLiters.value * density.value)

// Porcentaje del preset
const presetPercentage = computed(() => {
  return totalCapacityKg.value > 0 ? (presetKg.value / totalCapacityKg.value) * 100 : 0
})

// Porcentaje de carga actual
const loadPercentage = computed(() => {
  return presetKg.value > 0 ? (currentLoadKg.value / presetKg.value) * 100 : 0
})

// Series del gráfico
const series = ref([presetPercentage.value, loadPercentage.value])

// Actualización dinámica de las series
watch([presetPercentage, loadPercentage], () => {
  series.value = [presetPercentage.value, loadPercentage.value]
})

// Opciones del gráfico
const chartOptions = ref({
  chart: {
    type: 'radialBar',
    background: '#162129',
    foreColor: '#E8EDF2',
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800,
      animateGradually: {
        enabled: true,
        delay: 300,
      },
      dynamicAnimation: {
        enabled: true,
        speed: 1000,
      },
    },
  },
  plotOptions: {
    radialBar: {
      hollow: {
        margin: 10,
        size: '60%',
      },
      dataLabels: {
        show: true,
        name: {
          show: true,
          fontSize: '16px',
          color: '#E8EDF2',
        },
        value: {
          show: true,
          fontSize: '14px',
          color: '#E8EDF2',
          formatter: (val: any) => `${Number(val).toFixed(1)}%`,
        },
      },
      track: {
        background: '#22323D',
        strokeWidth: '100%',
      },
    },
  },
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'light',
      shadeIntensity: 0.4,
      gradientToColors: ['#48C78E', '#8BD5C0'],
      stops: [0, 100],
      inverseColors: false,
      opacityFrom: 1,
      opacityTo: 0.85,
    },
  },
  colors: ['#2F9B6F', '#48C78E'],
  labels: ['Cap. Total y Preset', 'Carga Actual'],
  tooltip: {
    enabled: true,
    theme: 'dark',
    followCursor: true,
    fixed: {
      enabled: true,
      position: 'topRight',
    },
    style: {
      fontSize: '12px',
      colors: ['#E8EDF2'],
    },
    y: {
      formatter: (val: number, opts: any) => {
        if (opts.seriesIndex === 0) {
          return `Capacidad Total: ${totalCapacityKg.value.toFixed(
            2,
          )} kg (Preset: ${presetKg.value.toFixed(2)} kg)`
        } else if (opts.seriesIndex === 1) {
          return `Carga Actual: ${currentLoadKg.value.toFixed(2)} kg`
        }
        return ''
      },
    },
  },
  legend: {
    show: true,
    position: 'bottom',
    labels: {
      colors: '#E8EDF2',
    },
  },
})
</script>

<template>
  <v-card class="data-container" color="container-color" outlined>
    <v-card-title>Progreso de Carga</v-card-title>
    <v-card-subtitle class="graph-note">
      Comparación entre el preset y la masa cargada para ver el avance de la orden.
    </v-card-subtitle>
    <v-card-text class="d-flex justify-center align-center">
      <apexchart
        type="radialBar"
        :options="chartOptions"
        :series="series"
        width="100%"
        height="280"
      ></apexchart>
    </v-card-text>
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
