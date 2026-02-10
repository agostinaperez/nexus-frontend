<script lang="ts" setup="">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useOrderDetails } from '@/composables/use.order.details'
import { useWsOrderDetail } from '@/composables/ws/use.ws.order.details'

import AdminLayout from '../layouts/AdminLayout.vue'
import OrderDetailTable from '../components/order/OrderDetailTable.vue'
import OrderProductData from '../components/order/OrderProductData.vue'
import ETA from '../components/graphs/ETAGraph.vue'
import OrderData from '../components/order/OrderData.vue'
import AlarmTable from '../components/alarms/AlarmTable.vue'
import AlarmHandler from '../components/alarms/AlarmHandler.vue'
import RadialBar from '../components/graphs/RadialBarGraph.vue'
import TemperatureChart from '../components/graphs/TemperatureGraph.vue'
import FlowRateGraph from '../components/graphs/FlowRateGraph.vue'
import DensityGraph from '../components/graphs/DensityGraph.vue'

import { useAllOrderDetails } from '@/composables/use.all.order.details'
import { useWsLatestOrderDetails } from '@/composables/ws/use.ws.latest.order.details'
import { useOrder } from '@/composables/use.order'
import { useAlarms } from '@/composables/use.alarms'
import { useWsAlarms } from '@/composables/ws/use.ws.alarms'
import { useAlarmHandler } from '@/composables/use.alarm.handler'
import { useOrderConciliation } from '@/composables/use.order.conciliation'

const route = useRoute()
const router = useRouter()
const showDetails = ref(false)

// DATOS DE LA ORDEN
const getOrderNumberFromRoute = () => {
  const { id } = route.params
  return Array.isArray(id) ? (id[0] ?? '') : (id ?? '')
}
const orderNumber = ref(getOrderNumberFromRoute())
const { order } = useOrder(orderNumber.value)
const canDownloadConciliation = computed(() => order.value?.status === 'REGISTERED_FINAL_WEIGHING')

// TABLA DE DETALLES
const {
  orderDetails,
  currentPageD,
  currentPageDZeroBased,
  totalPagesD,
  pageSizeD,
  totalElementsD,
  isLoadingD,
  setPageD,
  refetchD,
} = useOrderDetails(orderNumber.value)
const { detail } = useWsOrderDetail(orderNumber.value) // se suscribe al websocket para recibir los detalles en tiempo real

const refetchDetailsIfPaginated = () => {
  if (currentPageDZeroBased.value !== 0) {
    refetchD()
  }
}
watch(detail, refetchDetailsIfPaginated)

// TABLA DE ALARMAS
const {
  alarms,
  currentPageA,
  totalPagesA,
  totalElementsA,
  pageSizeA,
  isLoadingA,
  setPageA,
  refetchA,
} = useAlarms(orderNumber.value)
const { alarm } = useWsAlarms(orderNumber.value)

watch(alarm, () => {
  void refetchA()
})

const currentAlarm = computed(() => {
  const wsAlarm = alarm.value
  if (wsAlarm?.status === 'PENDING') return wsAlarm

  return alarms.value?.find((item) => item.status === 'PENDING')
})

const { updateAlarmStatus, isUpdating, isError } = useAlarmHandler()

const alarmStatus = computed(() => {
  if (!alarms.value?.length) return { text: 'Sin alarmas registradas', color: 'success' }
  if (currentAlarm.value) return { text: 'Alarma pendiente', color: 'error' }
  return { text: 'Alarmas resueltas', color: 'info' }
})

// GRAFICOS
const { allOrderDetails } = useAllOrderDetails(orderNumber.value) // Todos los detalles de la orden, para dibujar los graficos
const { lastDetail } = useWsLatestOrderDetails(orderNumber.value) // Ultimo detalle de la orden, para actualizar los graficos en tiempo real

// Si no llega `lastDetail` por WS (al entrar a una orden con historial), tomar el último detalle del historial
const latestFromAll = computed(() => {
  const arr = allOrderDetails.value || []
  if (!arr.length) return null
  // Elegir el detalle con timestamp más reciente (asume ISO strings comparables)
  return arr.reduce((a, b) => (a.timeStamp > b.timeStamp ? a : b))
})

const displayLastDetail = computed(() => lastDetail.value ?? latestFromAll.value ?? null)

watch(lastDetail, (val) => {
  console.log('lastDetail ( padre )', val)
})

// CONCILIACION
const { downloadConciliation, isDownloading } = useOrderConciliation()

const downloadReconciliation = () => {
  downloadConciliation(orderNumber.value)
}

// ROUTER
const goBack = () => {
  router.push({ name: 'OrdersManager' })
}

const setDetailsOpen = (value: boolean) => {
  showDetails.value = value
}

const openDetails = () => {
  setDetailsOpen(true)
}

const closeDetails = () => {
  setDetailsOpen(false)
}
</script>
<template>
  <AdminLayout>
    <v-container class="page-header shell pa-0 mb-4" fluid>
      <div class="d-flex align-center">
        <v-btn icon @click="goBack" class="mr-3 ghost-btn" color="primary" variant="tonal">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <div>
          <p class="breadcrumb">Admin / Detalle de Orden</p>
          <h1 class="page-title">Orden N° #{{ orderNumber }}</h1>
        </div>
      </div>

      <v-btn
        v-if="canDownloadConciliation"
        @click="downloadReconciliation"
        :loading="isDownloading"
        color="primary"
        class="ghost-btn"
        prepend-icon="mdi-download"
      >
        Descargar conciliación
      </v-btn>

      <v-chip v-else color="secondary" variant="elevated" class="ghost-btn">
        Conciliación no disponible
      </v-chip>
    </v-container>

    <v-container class="detail-container shell pa-0" fluid>
      <div class="view-toggle">
        <div>
          <p class="subtitle">Vista principal</p>
          <h2 class="section-title">Resumen y alarmas</h2>
          <p class="section-subtitle">
            Información esencial: estado de la orden, alarmas activas y ETA.
          </p>
        </div>
        <v-btn
          color="primary"
          prepend-icon="mdi-eye-outline"
          class="ghost-btn"
          @click.stop="openDetails"
        >
          Más detalles
        </v-btn>
      </div>

      <v-alert
        class="mb-4 alarm-banner"
        :color="alarmStatus.color"
        variant="tonal"
        border="start"
        density="comfortable"
      >
        {{ alarmStatus.text }}
        <template #append>
          <v-btn variant="text" size="small" @click="openDetails"></v-btn>
        </template>
      </v-alert>

      <v-row class="row-base content-row">
        <v-col cols="12" md="7">
          <OrderData v-if="order" :order="order" :detail="displayLastDetail" class="full-card" />
        </v-col>
        <v-col cols="12" md="5">
          <template v-if="order">
            <ETA
              v-if="order.status !== 'CLOSED' && order.status !== 'REGISTERED_FINAL_WEIGHING'"
              :order="order"
              :last-detail="displayLastDetail"
            />
            <v-card v-else class="data-container" color="container-color" outlined>
              <v-card-title>Tiempo estimado</v-card-title>
              <v-card-text>La carga ya ha sido completada!</v-card-text>
            </v-card>
          </template>
        </v-col>
      </v-row>

      <v-row class="row-base content-row mt-2">
        <v-col cols="12" md="5">
          <OrderProductData
            v-if="order"
            :productName="order.product.product"
            :thresholdTemperature="order.product.thresholdTemperature.toString()"
          />
        </v-col>
        <v-col cols="12" md="7">
          <AlarmHandler
            class="full-card"
            :alarm="currentAlarm"
            :order="order"
            :updateAlarmStatus="updateAlarmStatus"
            :isUpdating="isUpdating"
            :isError="isError"
            :isLoading="isLoadingA"
          />
        </v-col>
      </v-row>

      <v-row class="row-base graph-row mt-2" justify="start">
        <v-col cols="12" lg="12">
          <AlarmTable
            :items="alarms"
            :totalElements="totalElementsA"
            :current-page="currentPageA"
            :page-size="pageSizeA"
            :total-pages="totalPagesA"
            :isLoading="isLoadingA"
            :set-page-a="setPageA"
            class="tabla full-card"
          />
        </v-col>
      </v-row>
    </v-container>

    <v-dialog
      :model-value="showDetails"
      @update:model-value="setDetailsOpen"
      attach="body"
      fullscreen
      transition="dialog-bottom-transition"
      scrollable
    >
      <v-card class="details-card">
        <v-toolbar flat density="comfortable">
          <v-toolbar-title>Más detalles de la orden</v-toolbar-title>
          <v-spacer />
          <v-btn icon variant="text" @click="closeDetails">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text class="py-6">
          <div class="dialog-content">
            <div class="dialog-header">
              <div>
                <p class="subtitle mb-1">Subpantalla de desempeño</p>
                <h3 class="section-title">Gráficos y trazas completas</h3>
              </div>
              <div class="dialog-actions">
                <v-btn
                  color="primary"
                  variant="tonal"
                  prepend-icon="mdi-download"
                  @click="downloadReconciliation"
                  :loading="isDownloading"
                  v-if="canDownloadConciliation"
                >
                  Descargar conciliación
                </v-btn>
                <v-btn
                  color="secondary"
                  variant="text"
                  prepend-icon="mdi-arrow-left"
                  @click="closeDetails"
                >
                  Volver al resumen
                </v-btn>
              </div>
            </div>

            <v-row class="row-base graph-row mt-2" justify="start">
              <v-col cols="12" md="6">
                <RadialBar v-if="order" :order="order" :last-detail="displayLastDetail" />
              </v-col>
              <v-col cols="12" md="6">
                <OrderDetailTable
                  :items="orderDetails"
                  :totalElements="totalElementsD"
                  :current-page="currentPageD"
                  :page-size="pageSizeD"
                  :total-pages="totalPagesD"
                  :isLoading="isLoadingD"
                  :set-page-d="setPageD"
                />
              </v-col>
            </v-row>

            <v-row class="row-base graph-row mt-4" justify="start">
              <v-col cols="12">
                <TemperatureChart
                  :allOrderDetails="allOrderDetails"
                  :lastDetail="displayLastDetail"
                />
              </v-col>
            </v-row>

            <v-row class="row-base graph-row mt-4" justify="start">
              <v-col cols="12" md="6">
                <FlowRateGraph :allOrderDetails="allOrderDetails" :lastDetail="displayLastDetail" />
              </v-col>

              <v-col cols="12" md="6">
                <DensityGraph :allOrderDetails="allOrderDetails" :lastDetail="displayLastDetail" />
              </v-col>
            </v-row>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </AdminLayout>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
  max-width: 100%;
}

.breadcrumb {
  color: var(--color-muted);
  margin: 0;
}

.page-title {
  font-size: 32px;
}

.view-toggle {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.subtitle {
  color: var(--color-muted);
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.section-title {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
}

.section-subtitle {
  margin: 4px 0 0 0;
  color: var(--color-muted);
}

.ghost-btn {
  background: rgba(72, 199, 142, 0.12) !important;
  border: 1px solid rgba(155, 232, 193, 0.2);
}

.alarm-banner {
  border-left: 4px solid currentColor;
}

.content-row {
  row-gap: 20px;
}

.graph-row {
  row-gap: 20px;
}

.detail-container {
  width: 100%;
  max-width: 100%;
}

.row-base {
  margin-left: 0;
  margin-right: 0;
}

.shell {
  max-width: 1100px;
  margin-left: 0;
  margin-right: auto;
  padding-left: 0;
  padding-right: 8px;
}

.details-card {
  background: #0b1215;
}

.dialog-content {
  max-width: 1200px;
  margin: 0 auto;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.dialog-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>

<style lang="scss" src="/src/styles/global.scss"></style>
