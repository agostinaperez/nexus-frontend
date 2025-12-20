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

// DATOS DE LA ORDEN
const orderNumber = ref(Number(route.params.id))
const { order } = useOrder(orderNumber.value)

// TABLA DE DETALLES
const {
  orderDetails,
  currentPageD,
  currentPageD1,
  totalPagesD,
  pageSizeD,
  totalElementsD,
  isLoadingD,
  setPageD,
  refetchD,
} = useOrderDetails(orderNumber.value)
const { detail } = useWsOrderDetail(orderNumber.value) // se suscribe al websocket para recibir los detalles en tiempo real

watch(detail, () => {
  if (currentPageD1.value != 0) {
    refetchD()
  }
})

const currentAlarm = computed(() => {
  const pendingWs = alarm.value && alarm.value.status === 'PENDING' ? alarm.value : null
  if (pendingWs) return pendingWs

  const pendingFromList = alarms.value?.find((a) => a.status === 'PENDING')
  return pendingFromList
})

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
  refetchA()
})

const { updateAlarmStatus, isUpdating, isError } = useAlarmHandler()

// GRAFICOS
const { allOrderDetails, isLoadingAD, error } = useAllOrderDetails(orderNumber.value) // Todos los detalles de la orden, para dibujar los graficos
const { lastDetail } = useWsLatestOrderDetails(orderNumber.value) // Ultimo detalle de la orden, para actualizar los graficos en tiempo real

const { downloadConciliation, isDownloading } = useOrderConciliation()

const downloadReconciliation = () => {
  downloadConciliation(orderNumber.value)
}

// ROUTER
const router = useRouter()

const goBack = () => {
  router.back()
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
        v-if="order?.status == 'REGISTERED_FINAL_WEIGHING'"
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
      <v-row class="row-base content-row">
        <v-col cols="12" md="5">
          <OrderData v-if="order" :order="order" :detail="lastDetail" class="full-card" />
        </v-col>

        <v-col cols="12" md="3">
          <OrderProductData
            v-if="order"
            :productName="order.product.product"
            :thresholdTemperature="order.product.thresholdTemperature.toString()"
          />
        </v-col>

        <v-col cols="12" md="4">
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

      <v-row class="row-base graph-row mt-4" justify="start">
        <v-col cols="12" md="6" lg="5">
          <RadialBar v-if="order" :order="order" :last-detail="lastDetail" />
        </v-col>
        <v-col cols="12" md="6" lg="5">
          <ETA v-if="order" :order="order" :last-detail="lastDetail" />
        </v-col>
      </v-row>

      <v-row class="row-base graph-row mt-4" justify="start">
        <v-col cols="12" lg="10">
          <TemperatureChart :allOrderDetails="allOrderDetails" :lastDetail="lastDetail" />
        </v-col>
      </v-row>

      <v-row class="row-base graph-row mt-4" justify="start">
        <v-col cols="12" lg="5">
          <FlowRateGraph :allOrderDetails="allOrderDetails" :lastDetail="lastDetail" />
        </v-col>

        <v-col cols="12" lg="5">
          <DensityGraph :allOrderDetails="allOrderDetails" :lastDetail="lastDetail" />
        </v-col>
      </v-row>

      <v-row class="row-base content-row mt-4" justify="start">
        <v-col cols="12" lg="5">
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

        <v-col cols="12" lg="5">
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
    </v-container>
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

.ghost-btn {
  background: rgba(72, 199, 142, 0.12) !important;
  border: 1px solid rgba(155, 232, 193, 0.2);
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
</style>

<style lang="scss" src="/src/styles/global.scss"></style>
