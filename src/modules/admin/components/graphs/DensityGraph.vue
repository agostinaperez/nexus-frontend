<script setup lang="ts">
import { ref, watch, computed, onUnmounted, onMounted } from 'vue'
import type { OrderDetail } from '@/interfaces/order-details.interface'

// Props para recibir datos
const props = defineProps<{
  allOrderDetails: OrderDetail[]
  lastDetail: OrderDetail | null
}>()

// Opciones del gráfico
const chartOptions = ref({
  chart: {
    type: 'line',
    height: 350,
    background: '#162129',
    foreColor: '#E8EDF2',
    zoom: {
      enabled: true,
    },
    toolbar: {
      show: true,
      tools: {
        download: true,
        zoom: true,
        zoomin: true,
        zoomout: true,
        pan: true,
        reset: true,
      },
    },
  },
  stroke: {
    curve: 'smooth',
    width: 3,
  },
  colors: ['#86E7B2'],
  dataLabels: {
    enabled: false,
  },
  xaxis: {
    type: 'datetime',
    labels: {
      format: 'HH:mm:ss',
      style: {
        colors: '#C7D4DF',
      },
    },
    title: {
      text: 'Tiempo',
      style: {
        color: '#C7D4DF',
        fontSize: '14px',
      },
    },
    axisBorder: {
      color: '#22323D',
    },
  },
  yaxis: {
    title: {
      text: 'Densidad (kg/m³)',
      style: {
        color: '#C7D4DF',
        fontSize: '14px',
      },
    },
    labels: {
      formatter: (value: number) => `${value.toFixed(2)} kg/m³`,
      style: {
        colors: '#C7D4DF',
      },
    },
    axisBorder: {
      color: '#22323D',
    },
  },
  tooltip: {
    x: {
      format: 'HH:mm:ss',
    },
    theme: 'dark',
  },
  grid: {
    borderColor: '#22323D',
  },
})

// Series del gráfico
const series = ref<{ name: string; data: { x: number; y: number }[] }[]>([
  {
    name: 'Densidad',
    data: [],
  },
])

// Función para ajustar el timestamp a la zona horaria local
const adjustToLocalTime = (isoString: string) => {
  const date = new Date(isoString)
  return date.getTime() - date.getTimezoneOffset() * 60000
}

// Función para agregar un nuevo dato al gráfico
const addDataPoint = (timestamp: string, value: number) => {
  const adjustedTimestamp = adjustToLocalTime(timestamp)
  if (series.value[0] == undefined) {
    series.value[0] = { name: 'Densidad', data: [] }
  }
  series.value[0].data.push({ x: adjustedTimestamp, y: value })

  series.value[0].data.sort((a, b) => a.x - b.x)

  const maxPoints = 100
  if (series.value[0].data.length > maxPoints) {
    series.value[0].data = series.value[0].data.slice(-maxPoints)
  }
}

// Watch para los datos históricos
watch(
  () => props.allOrderDetails,
  (newDetails) => {
    if (newDetails.length > 0 && series.value[0] != undefined) {
      const formattedData = newDetails.map((detail) => ({
        x: adjustToLocalTime(detail.timeStamp),
        y: detail.density,
      }))
      series.value[0].data = formattedData
    }
  },
  { immediate: true },
)

// Watch para las actualizaciones en tiempo real
watch(
  () => props.lastDetail,
  (newDetail) => {
    if (newDetail) {
      addDataPoint(newDetail.timeStamp, newDetail.density)
    }
  },
)

// Computed para obtener la fecha actual del gráfico
const currentDate = computed(() => {
  if (props.allOrderDetails.length > 0 && props.allOrderDetails[0] != undefined) {
    return new Date(props.allOrderDetails[0].timeStamp).toLocaleDateString()
  }
  return new Date().toLocaleDateString()
})
</script>

<template>
  <v-card class="mb-4 data-container full-card" color="container-color" outlined>
    <v-card-title class="mt-2 mb-2">
      <strong> Densidad (kg/m³) - Fecha: {{ currentDate }} </strong></v-card-title
    >
    <v-card-subtitle class="graph-note">
      Tendencia de la densidad para validar la consistencia del producto.
    </v-card-subtitle>
    <v-container>
      <v-card-text>
        <apexchart
          :key="currentDate"
          type="line"
          :options="chartOptions"
          :series="series"
          width="100%"
          height="300"
        >
        </apexchart>
      </v-card-text>
    </v-container>
  </v-card>
</template>

<style lang="scss" src="/src/styles/global.scss"></style>

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
